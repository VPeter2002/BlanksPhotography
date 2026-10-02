// A HELYI eredetikbol generalja a thumb/medium/blur derivativakat es a manifestet.
// Nem tolt fel semmit, es nem nyul a bucketshez. Pontosan ugyanazt a nevezektant
// es minoseget hasznalja, mint a scripts/optimize-images.js.
const fs=require('fs'), path=require('path'), sharp=require('sharp');
const SRC=process.argv[2], OUT=process.argv[3];
const THUMB=480, MEDIUM=1280, BLUR=24;
const isImg=n=>/\.(jpe?g|png|webp)$/i.test(n);
const isDeriv=n=>/-(thumb|medium)\.(webp|jpe?g)$/i.test(n);
const base=n=>n.replace(/\.[^.]+$/,'');

function walk(dir,acc=[]){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()) walk(p,acc);
    else if(isImg(e.name)&&!isDeriv(e.name)) acc.push(p);
  }
  return acc;
}

(async()=>{
  const shoots=fs.readdirSync(SRC,{withFileTypes:true})
    .filter(e=>e.isDirectory()&&/-photo-download-/.test(e.name)).map(e=>e.name).sort();
  let grand=0, grandN=0;
  const report={};
  for(const shoot of shoots){
    const files=walk(path.join(SRC,shoot));
    const outDir=path.join(OUT,shoot); fs.mkdirSync(outDir,{recursive:true});
    const manifest={}; let bytes=0;
    for(const f of files){
      const name=path.basename(f);
      if(manifest[name]){ console.log('  NEVUTKOZES kihagyva:',shoot,name); continue; }
      const img=sharp(f), meta=await img.metadata();
      const tw=await img.clone().resize({width:THUMB,withoutEnlargement:true}).webp({quality:62}).toBuffer();
      const tj=await img.clone().resize({width:THUMB,withoutEnlargement:true}).jpeg({quality:68,mozjpeg:true}).toBuffer();
      const mw=await img.clone().resize({width:MEDIUM,withoutEnlargement:true}).webp({quality:72}).toBuffer();
      const mj=await img.clone().resize({width:MEDIUM,withoutEnlargement:true}).jpeg({quality:78,mozjpeg:true}).toBuffer();
      const bl=await img.clone().resize({width:BLUR}).blur(2).webp({quality:40}).toBuffer();
      fs.writeFileSync(path.join(outDir,base(name)+'-thumb.webp'),tw);
      fs.writeFileSync(path.join(outDir,base(name)+'-thumb.jpg'),tj);
      fs.writeFileSync(path.join(outDir,base(name)+'-medium.webp'),mw);
      fs.writeFileSync(path.join(outDir,base(name)+'-medium.jpg'),mj);
      manifest[name]={w:meta.width,h:meta.height,blur:'data:image/webp;base64,'+bl.toString('base64')};
      bytes+=tw.length+tj.length+mw.length+mj.length;
    }
    fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify(manifest,null,2));
    const mSize=fs.statSync(path.join(outDir,'manifest.json')).size;
    report[shoot]={kep:Object.keys(manifest).length,derivMB:+(bytes/1048576).toFixed(1),manifestMB:+(mSize/1048576).toFixed(2)};
    grand+=bytes+mSize; grandN+=Object.keys(manifest).length;
    console.log(shoot+': '+Object.keys(manifest).length+' kep, '+(bytes/1048576).toFixed(1)+' MB deriv + '+(mSize/1024).toFixed(0)+' KB manifest');
  }
  console.log('\n=== OSSZESEN ===');
  console.log(grandN+' kep, '+(grand/1048576).toFixed(1)+' MB (derivativak + manifestek, EREDETIK NELKUL)');
  fs.writeFileSync(path.join(OUT,'_report.json'),JSON.stringify({osszKep:grandN,osszMB:+(grand/1048576).toFixed(1),mappak:report},null,2));
})().catch(e=>{console.error('HIBA:',e.message);process.exit(1);});
