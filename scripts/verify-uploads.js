// Osszeveti a HELYI derivativakat a bucket tartalmaval, es potolja a hianyzokat
// (meretet is ellenoriz, ujraprobalkozassal).
//   node --env-file=.env _verify-fix.js <helyi-mappa> <bucket-mappa> [--fix]
if (typeof globalThis.WebSocket==='undefined') globalThis.WebSocket=require('ws');
const {createClient}=require('@supabase/supabase-js');
const fs=require('fs'), path=require('path');
const B='Blanka pics';
const sb=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const [localDir,remoteDir]=process.argv.slice(2);
const FIX=process.argv.includes('--fix');
const TYPES={'.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function listAll(f){let all=[],off=0;while(true){const{data,error}=await sb.storage.from(B)
 .list(f,{limit:1000,offset:off,sortBy:{column:'name',order:'asc'}});if(error)throw error;
 if(!data||!data.length)break;all=all.concat(data);if(data.length<1000)break;off+=1000;}return all;}

async function uploadRetry(remote, buf, ct, cc, probak=4){
  for(let i=1;i<=probak;i++){
    const {error}=await sb.storage.from(B).upload(remote,buf,{upsert:true,contentType:ct,cacheControl:cc});
    if(!error) return true;
    if(i===probak){ console.log('    VEGLEGES HIBA '+remote+': '+error.message); return false; }
    await sleep(900*i);
  }
}
(async()=>{
  const helyi=fs.readdirSync(localDir).filter(n=>/-(thumb|medium)\.(webp|jpe?g)$/i.test(n)||n==='manifest.json');
  const tav=new Map((await listAll(remoteDir)).filter(e=>e.metadata).map(e=>[e.name,e.metadata.size]));
  const hianyzo=[], meretHiba=[];
  for(const n of helyi){
    const s=fs.statSync(path.join(localDir,n)).size;
    if(!tav.has(n)) hianyzo.push(n);
    else if(tav.get(n)!==s && n!=='manifest.json') meretHiba.push(n);
  }
  console.log(`${remoteDir}: helyi ${helyi.length} | fent ${tav.size} | hianyzo ${hianyzo.length} | mereteltero ${meretHiba.length}`);
  const javitando=[...hianyzo,...meretHiba];
  if(!javitando.length){ console.log('  rendben, minden fent van'); return; }
  console.log('  '+javitando.slice(0,8).join(', ')+(javitando.length>8?' ...':''));
  if(!FIX){ console.log('  (potlashoz: --fix)'); return; }
  let ok=0;
  for(const n of javitando){
    const buf=fs.readFileSync(path.join(localDir,n));
    const ct=TYPES[path.extname(n).toLowerCase()]||'application/octet-stream';
    if(await uploadRetry(`${remoteDir}/${n}`, buf, ct, n==='manifest.json'?'300':'31536000')) ok++;
  }
  console.log(`  potolva: ${ok}/${javitando.length}`);
})().catch(e=>{console.error('HIBA:',e.message);process.exit(1);});
