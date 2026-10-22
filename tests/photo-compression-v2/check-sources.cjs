const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file=fs.readFileSync('kontur-projects-webp-v2-test.js','utf8');
new vm.Script(file);
const start=file.indexOf('var scripts=')+'var scripts='.length;
const end=file.indexOf(';\n',start);
const scripts=JSON.parse(file.slice(start,end));
for(const x of scripts)new vm.Script(x);
const helper='function kpPhotoSource'+scripts[1].split('function kpPhotoSource')[1].split('const grid =')[0];
const old='https://raw.githubusercontent.com/davaygazu/kontur-images/main/projects/sosnovka-47/glavnaya.webp';
for(const w of [390,900,901,1440]){
 const ctx=vm.createContext({window:{innerWidth:w}});vm.runInContext(helper,ctx);
 assert.equal(ctx.kpPhotoSource(old,'mobile'),w>900?old:'https://raw.githubusercontent.com/davaygazu/kontur-images/e3a396b31a295fe1f70df120e1c0a0f5c0f34d78/assets/mobile-v2/sosnovka-cover.webp');
 assert.equal(ctx.kpPhotoSource(old,'thumb'),w>900?old:old.replace('/main/','/66682519ebbfbfd388725842f7dc08d75f36a5c7/').replace('/glavnaya.webp','/mobile-thumbs/glavnaya.webp'));
}
const p='tests/photo-compression-v2/';
const a=fs.readFileSync(p+'hero-before.html','utf8'),b=fs.readFileSync(p+'KONTUR_hero_mobile_v2_test.txt','utf8');
assert.equal(a.replace('https://raw.githubusercontent.com/davaygazu/kontur-images/f6b471c3d65d885dbe8754a3e3f56b9a20f7b239/assets/hero/glavnaya-mobile.webp','https://raw.githubusercontent.com/davaygazu/kontur-images/e3a396b31a295fe1f70df120e1c0a0f5c0f34d78/assets/mobile-v2/hero.webp'),b);
console.log('JavaScript syntax OK; mobile/desktop sources and thumbnails OK; hero unchanged except mobile image URL');
