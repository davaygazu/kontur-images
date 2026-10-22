const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const source=fs.readFileSync('tests/projects-mobile-webp.js','utf8');
new vm.Script(source);
const scripts=JSON.parse(source.match(/var scripts=(\[.*?\]);\n/s)[1]);
scripts.forEach(s=>new vm.Script(s));
const main=scripts[1];
for(const width of [390,900,901,1440]){
 const ctx=vm.createContext({window:{innerWidth:width}});
 vm.runInContext(main.slice(0,main.indexOf("const grid ="))+';globalThis.data=projects;globalThis.photo=kpPhotoSource;',ctx);
 assert.equal(ctx.data.length,11);
 for(const p of ctx.data)for(const src of p.photos){
  assert.equal(ctx.photo(src,'main').includes('/mobile/'),width<=900);
  assert.equal(ctx.photo(src,'thumb').includes('/mobile-thumbs/'),width<=900);
  if(width>900)assert.equal(ctx.photo(src,'main'),src);
 }
 assert.match(ctx.data[9].title,/из бревна/);assert.match(ctx.data[10].title,/из бревна/);
}
const base=require('node:child_process').execFileSync('git',['show','a5b5141f7d193be8f5fe0d7d185f2145e07b2d40:kontur-projects-webp.js'],{encoding:'utf8'});
const html=s=>JSON.parse(s.match(/root.innerHTML=(".*?");\n/s)[1]);
assert.equal(html(source),html(base));
const originalScripts=JSON.parse(base.match(/var scripts=(\[.*?\]);\n/s)[1]);
const original=vm.createContext({});
vm.runInContext(originalScripts[1].slice(0,originalScripts[1].indexOf('const grid ='))+';globalThis.data=projects;',original);
const updated=vm.createContext({window:{innerWidth:1440}});
vm.runInContext(main.slice(0,main.indexOf('const grid ='))+';globalThis.data=projects;',updated);
assert.equal(JSON.stringify(original.data.map(p=>p.photos)),JSON.stringify(updated.data.map(p=>p.photos)));
const paths=JSON.parse(fs.readFileSync('tests/mobile-photo-sources.json','utf8'));
if(fs.existsSync('tests/mobile-photo-sizes.json'))for(const p of paths)for(const dir of ['mobile','mobile-thumbs']){const target=p.replace(/([^/]+)$/,dir+'/$1');assert(fs.statSync(target).size>0,target);}
console.log('PASS: scripts parse, 11 projects, mobile/desktop routes, titles, unchanged CSS/HTML');
