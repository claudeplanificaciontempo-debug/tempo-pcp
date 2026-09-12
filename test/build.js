// Ensambla test/.out/index.html = index.html + Supabase falso (mock.js) + guion de pruebas (driver.js)
// Uso:  node test/build.js   (desde la raíz del proyecto)
const fs=require('fs'),path=require('path');const t=__dirname,proj=path.join(t,'..');
let h=fs.readFileSync(path.join(proj,'index.html'),'utf8');
const cdn=h.match(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase[^"]*"><\/script>/);
if(!cdn)throw new Error('no se encontró el <script> de supabase en index.html');
h=h.replace(cdn[0],fs.readFileSync(path.join(t,'mock.js'),'utf8'));
const i=h.lastIndexOf('</script>');h=h.slice(0,i+9)+'\n'+fs.readFileSync(path.join(t,'driver.js'),'utf8')+h.slice(i+9);
fs.mkdirSync(path.join(t,'.out'),{recursive:true});fs.writeFileSync(path.join(t,'.out','index.html'),h);
const fixSrc=path.join(t,'fixtures'),fixDst=path.join(t,'.out','fixtures');
if(fs.existsSync(fixSrc)){fs.mkdirSync(fixDst,{recursive:true});for(const f of fs.readdirSync(fixSrc))fs.copyFileSync(path.join(fixSrc,f),path.join(fixDst,f))}
console.log('listo: test/.out/index.html ('+h.length+' bytes). Ahora: node test/server.js  y abre http://127.0.0.1:8765/');
