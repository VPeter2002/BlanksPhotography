// Előfeldolgozó script: legenerálja minden Supabase Storage-beli kép
// thumb (~480px) és medium (~1280px) változatát WebP+JPG formátumban,
// plusz egy kis blur-up placeholdert, és feltölti őket a bucketbe.
//
// Futtatás: npm run optimize-images  (vagy: node --env-file=.env scripts/optimize-images.js)
// Kapcsolók: --folder=<mappanev>   csak egy mappa feldolgozása
//            --force               inkrementális cache figyelmen kívül hagyása

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// A supabase-js Realtime kliense Node 20 alatt natív WebSocket-et várna;
// mi csak a Storage API-t használjuk, de a kliens így is megköveteli.
if (typeof globalThis.WebSocket === 'undefined') {
    globalThis.WebSocket = require('ws');
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Hiányzik a SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Másold ki a .env.example-t .env néven, és töltsd ki.');
    process.exit(1);
}

const BUCKET = 'Blanka pics';
const FOLDERS = ['saratamas_eskuvo', 'sabatamas_paros', 'arnikaeszsolt_jegyes', 'saramarnagyonvarnak_kismama', 'highlights', ''];
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;
const DERIVATIVE_RE = /-(thumb|medium)\.(webp|jpe?g)$/i;

const THUMB_WIDTH = 480;
const MEDIUM_WIDTH = 1280;
const BLUR_WIDTH = 24;
const STORAGE_WARN_BYTES = 950 * 1024 * 1024;

const CACHE_PATH = path.join(__dirname, '..', '.optimize-cache.json');

const args = process.argv.slice(2);
const force = args.includes('--force');
const folderArg = args.find((a) => a.startsWith('--folder='));
const onlyFolder = folderArg ? folderArg.split('=')[1] : null;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function loadCache() {
    if (fs.existsSync(CACHE_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
        } catch {
            return {};
        }
    }
    return {};
}

function saveCache(cache) {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function listAll(prefix) {
    let all = [];
    let offset = 0;
    while (true) {
        const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
            limit: 1000,
            offset,
            sortBy: { column: 'name', order: 'asc' },
        });
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < 1000) break;
        offset += 1000;
    }
    return all;
}

async function bucketTotalBytes() {
    let total = 0;
    const walk = async (prefix) => {
        const entries = await listAll(prefix);
        for (const e of entries) {
            if (e.metadata) {
                total += e.metadata.size;
            } else if (e.id === null) {
                await walk(prefix ? `${prefix}/${e.name}` : e.name);
            }
        }
    };
    await walk('');
    return total;
}

function joinPath(folder, name) {
    return folder ? `${folder}/${name}` : name;
}

function derivativeName(name, tag, ext) {
    const base = name.replace(/\.[^.]+$/, '');
    return `${base}-${tag}.${ext}`;
}

async function uploadBuffer(filePath, buffer, contentType, cacheControlSeconds = '31536000') {
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
        upsert: true,
        contentType,
        cacheControl: cacheControlSeconds,
    });
    if (error) throw new Error(`Feltöltési hiba (${filePath}): ${error.message}`);
}

async function processImage(folder, file) {
    const filePath = joinPath(folder, file.name);
    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    const res = await fetch(publicUrlData.publicUrl);
    if (!res.ok) throw new Error(`Letöltés sikertelen: ${filePath} (${res.status})`);
    const original = Buffer.from(await res.arrayBuffer());

    const image = sharp(original);
    const metadata = await image.metadata();

    const thumbWebp = await image.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).webp({ quality: 62 }).toBuffer();
    const thumbJpg = await image.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).jpeg({ quality: 68, mozjpeg: true }).toBuffer();
    const mediumWebp = await image.clone().resize({ width: MEDIUM_WIDTH, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
    const mediumJpg = await image.clone().resize({ width: MEDIUM_WIDTH, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
    const blurBuffer = await image.clone().resize({ width: BLUR_WIDTH }).blur(2).webp({ quality: 40 }).toBuffer();

    await uploadBuffer(joinPath(folder, derivativeName(file.name, 'thumb', 'webp')), thumbWebp, 'image/webp');
    await uploadBuffer(joinPath(folder, derivativeName(file.name, 'thumb', 'jpg')), thumbJpg, 'image/jpeg');
    await uploadBuffer(joinPath(folder, derivativeName(file.name, 'medium', 'webp')), mediumWebp, 'image/webp');
    await uploadBuffer(joinPath(folder, derivativeName(file.name, 'medium', 'jpg')), mediumJpg, 'image/jpeg');

    return {
        w: metadata.width,
        h: metadata.height,
        blur: `data:image/webp;base64,${blurBuffer.toString('base64')}`,
        addedBytes: thumbWebp.length + thumbJpg.length + mediumWebp.length + mediumJpg.length,
    };
}

async function processFolder(folder, cache) {
    console.log(`\n=== Mappa: ${folder || '(gyökér)'} ===`);
    const entries = await listAll(folder);
    const files = entries.filter((e) => e.metadata && IMAGE_RE.test(e.name) && !DERIVATIVE_RE.test(e.name));
    console.log(`${files.length} eredeti kép található.`);

    const manifestPath = joinPath(folder, 'manifest.json');
    let manifest = {};
    try {
        const { data: manifestUrl } = supabase.storage.from(BUCKET).getPublicUrl(manifestPath);
        const res = await fetch(manifestUrl.publicUrl, { cache: 'no-store' });
        if (res.ok) manifest = await res.json();
    } catch {
        manifest = {};
    }

    let processed = 0;
    let skipped = 0;
    let addedBytes = 0;

    for (const file of files) {
        const cacheKey = joinPath(folder, file.name);
        const cacheEntry = cache[cacheKey];
        const unchanged = cacheEntry && cacheEntry.size === file.metadata.size && manifest[file.name];

        if (!force && unchanged) {
            skipped++;
            continue;
        }

        try {
            process.stdout.write(`  Feldolgozás: ${file.name} ... `);
            const result = await processImage(folder, file);
            manifest[file.name] = { w: result.w, h: result.h, blur: result.blur };
            cache[cacheKey] = { size: file.metadata.size };
            addedBytes += result.addedBytes;
            processed++;
            console.log(`kész (${result.w}x${result.h})`);
        } catch (err) {
            console.log(`HIBA: ${err.message}`);
        }
    }

    // A manifest tartalma új fotók feltöltésekor változhat ugyanazon a néven,
    // ezért rövid cache-control kell, hogy a böngésző/CDN ne szolgáljon ki elavult adatot.
    await uploadBuffer(manifestPath, Buffer.from(JSON.stringify(manifest, null, 2)), 'application/json', '300');
    saveCache(cache);

    console.log(`Feldolgozva: ${processed}, kihagyva (már kész): ${skipped}, hozzáadott adat: ${(addedBytes / 1024 / 1024).toFixed(1)} MB`);
    return addedBytes;
}

(async () => {
    const cache = loadCache();
    const folders = onlyFolder !== null ? [onlyFolder] : FOLDERS;
    let totalAdded = 0;

    for (const folder of folders) {
        totalAdded += await processFolder(folder, cache);

        const total = await bucketTotalBytes();
        console.log(`--- Bucket összméret jelenleg: ${(total / 1024 / 1024).toFixed(1)} MB ---`);
        if (total > STORAGE_WARN_BYTES) {
            console.warn(`FIGYELEM: a bucket mérete meghaladja a ${(STORAGE_WARN_BYTES / 1024 / 1024).toFixed(0)} MB-os biztonsági küszöböt (1 GB ingyenes limit)! Fontold meg régi eredeti fájlok törlését, vagy állítsd le a további futtatást.`);
        }
    }

    console.log(`\nKész. Ebben a futásban hozzáadott adat összesen: ${(totalAdded / 1024 / 1024).toFixed(1)} MB`);
})().catch((err) => {
    console.error('Végzetes hiba:', err);
    process.exit(1);
});
