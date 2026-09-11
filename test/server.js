// Sirve test/.out por HTTP (el navegador no ejecuta JS en file://). Uso: node test/server.js
const http=require('http'),fs=require('fs'),path=require('path');const dir=path.join(__dirname,'.out');
http.createServer((req,res)=>{let f=path.join(dir,decodeURIComponent(req.url.split('?')[0]));if(f.endsWith(path.sep)||f===dir)f=path.join(dir,'index.html');
  fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end('no');return}res.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(d)})})
.listen(8765,'127.0.0.1',()=>console.log('sirviendo test/.out en http://127.0.0.1:8765/  — en la consola del navegador: JSON.stringify(__R.checks.filter(c=>!c.ok)) y __R.errors'));
