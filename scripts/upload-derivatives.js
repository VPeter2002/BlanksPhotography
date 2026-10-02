// Feltolti a HELYBEN generalt derivativakat + manifestet egy bucket-mappaba.
// Eredeti kepet NEM tolt fel. Alapbol SZARAZ futas, csak --run eseten ir.
//
//   node --env-file=.env _upload-deriv.js <helyi-mappa> <bucket-mappa> [--run]
//
// Biztonsagi fek: a feltoltes elott megnezi a bucket szabad helyet, es ha a
// feltoltendo adag nem fer bele a free tier maradekaba, LEALL.
if (typeof globalThis.WebSocket==='undefined') globalThis.WebSocket=require('ws');
const {createClient}=require('@supabase/supabase-js');
const fs=require('fs'), path=require('path');
const BUCKET='Blanka pics';
const LIMIT_BYTES=1024*1048576;
const sb=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const [localDir,remoteDir]=process.argv.slice(2);
const RUN=process.argv.includes('--run');
if(!localDir||!remoteDir){ console.error('hasznalat: <helyi-mappa> <bucket-mappa> [--run]'); process.exit(1); }

const TYPES={'.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json'};

async function listAll(prefix){
  let all=[],off=0;
  while(true){const{data,error}=await sb.storage.from(BUCKET).list(prefix,{limit:1000,offset:off,sortBy:{column:'name',order:'asc'}});
    if(error)throw error; if(!data||!data.length)break; all=all.concat(data); if(data.length<1000)break; off+=1000;}
  return all;
}
async function bucketBytes(){
  let total=0;
  const walk=async p=>{ for(const e of await listAll(p)){ if(e.metadata) total+=e.metadata.size;
    else if(e.id===null) await walk(p?`${p}/${e.name}`:e.name); } };
  await walk(''); return total;
}
(async()=>{
  const files=fs.readdirSync(localDir).filter(n=>/-(thumb|medium)\.(webp|jpe?g)$/i.test(n)||n==='manifest.json');
  const bytes=files.reduce((s,n)=>s+fs.statSync(path.join(localDir,n)).size,0);
  console.log(`${files.length} fajl, ${(bytes/1048576).toFixed(1)} MB -> bucket/${remoteDir}`);

  const used=await bucketBytes();
  const free=LIMIT_BYTES-used;
  console.log(`bucket: ${(used/1048576).toFixed(1)} MB hasznalt, ${(free/1048576).toFixed(1)} MB szabad`);
  if(bytes>free){ console.error('LEALLAS: nem fer bele a free tier maradekaba.'); process.exit(1); }
  if(!RUN){ console.log('\nSZARAZ FUTAS. Tenyleges feltolteshez: --run'); return; }

  let ok=0,fail=0;
  for(const n of files){
    const buf=fs.readFileSync(path.join(localDir,n));
    const ct=TYPES[path.extname(n).toLowerCase()]||'application/octet-stream';
    const cc = n==='manifest.json' ? '300' : '31536000';
    const {error}=await sb.storage.from(BUCKET).upload(`${remoteDir}/${n}`,buf,{upsert:true,contentType:ct,cacheControl:cc});
    if(error){ console.log('  HIBA '+n+': '+error.message); fail++; } else { ok++; if(ok%50===0) console.log('  ...'+ok); }
  }
  console.log(`\nfeltoltve: ${ok}, hiba: ${fail}`);
})().catch(e=>{console.error('HIBA:',e.message);process.exit(1);});
