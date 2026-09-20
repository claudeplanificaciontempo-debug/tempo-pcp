/* Excel «bonito» para la usuaria: cabecera azul, columnas para llenar en amarillo con desplegable, bandas por grupo, hoja «Cómo llenarlo».
   Corre en el navegador del harness (?captura=audit) con ExcelJS por CDN y guarda por POST /guardar. No es parte de la app.
   Uso: cp test/xlsx_build.js test/xlsx_entregas.js test/.out/ · abrir http://127.0.0.1:8765/?captura=audit · en consola:
   for(const u of ["/xlsx_build.js","/xlsx_entregas.js"])(0,eval)(await (await fetch(u)).text()); await armarTiempos(); await armarPropuesta();
   Los archivos quedan en test/.out/exports/ y se copian a entregas/. */
(function(){
const NAVY='FF243447',ACC='FF2E8B9E',ACC_SOFT='FFE8F3F6',LLENAR='FFFFF2CC',LLENAR_HEAD='FFC55A11',RULE='FFDCE1E6',ZEBRA='FFF7F9FA',INK2='FF455260';
const thin={style:'thin',color:{argb:RULE}};const borde={top:thin,left:thin,bottom:thin,right:thin};
const font=(o)=>Object.assign({name:'Arial',size:10},o||{});
async function cargarExcelJS(){if(window.ExcelJS)return;await new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';s.onload=ok;s.onerror=()=>ko(new Error('no cargó ExcelJS'));document.head.appendChild(s)})}
/* cols: [{k,w,llenar,lista,wrap,num}] · rows: objetos por k · opts: {titulo,nota,banda:k|fn} */
function hoja(wb,nombre,cols,rows,opts){opts=opts||{};const ws=wb.addWorksheet(nombre.slice(0,31),{views:[{state:'frozen',ySplit:4}]});
  const n=cols.length;const last=ws.getColumn(n).letter;
  ws.mergeCells('A1:'+last+'1');const t=ws.getCell('A1');t.value=opts.titulo||nombre;t.font=font({size:14,bold:true,color:{argb:NAVY}});t.alignment={vertical:'middle'};ws.getRow(1).height=24;
  ws.mergeCells('A2:'+last+'2');const nt=ws.getCell('A2');nt.value=opts.nota||'Amarillo = para llenar · azul = información del sistema (no cambiar) · las filas grises son títulos de grupo';nt.font=font({italic:true,size:9,color:{argb:INK2}});nt.alignment={wrapText:true,vertical:'top'};ws.getRow(2).height=opts.notaAlta?42:18;
  const hr=ws.getRow(4);cols.forEach((c,i)=>{const cell=hr.getCell(i+1);cell.value=c.k;cell.font=font({bold:true,color:{argb:'FFFFFFFF'}});cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:c.llenar?LLENAR_HEAD:NAVY}};cell.alignment={vertical:'middle',wrapText:true};cell.border=borde});hr.height=30;
  cols.forEach((c,i)=>{ws.getColumn(i+1).width=c.w||14});
  let r=5,zebra=false,bandaAnt=null;const bandaDe=typeof opts.banda==='function'?opts.banda:(opts.banda?(o=>o[opts.banda]):null);
  rows.forEach(o=>{if(bandaDe){const b=bandaDe(o);if(b!==bandaAnt){bandaAnt=b;ws.mergeCells(r,1,r,n);const bc=ws.getCell(r,1);bc.value=b;bc.font=font({bold:true,color:{argb:NAVY}});bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:ACC_SOFT}};bc.border={bottom:{style:'medium',color:{argb:ACC}}};ws.getRow(r).height=18;r++;zebra=false}}
    const row=ws.getRow(r);cols.forEach((c,i)=>{const cell=row.getCell(i+1);let v=o[c.k];if(v==null)v='';cell.value=v;cell.font=font();cell.border=borde;cell.alignment={vertical:'top',wrapText:!!c.wrap,horizontal:c.num?'right':'left'};
      if(c.llenar){cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:LLENAR}};if(c.lista)cell.dataValidation={type:'list',allowBlank:true,formulae:['"'+c.lista.join(',')+'"'],showErrorMessage:false}}
      else if(zebra)cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:ZEBRA}}});
    zebra=!zebra;r++});
  ws.autoFilter={from:{row:4,column:1},to:{row:Math.max(4,r-1),column:n}};
  return ws}
/* hoja de portada: qué es, cómo llenarlo, leyenda con las celdas de muestra */
function portada(wb,titulo,lineas,leyendaExtra){const ws=wb.addWorksheet('Cómo llenarlo');ws.getColumn(1).width=26;ws.getColumn(2).width=110;
  ws.mergeCells('A1:B1');ws.getCell('A1').value=titulo;ws.getCell('A1').font=font({size:16,bold:true,color:{argb:NAVY}});ws.getRow(1).height=28;
  let r=3;lineas.forEach(([a,b])=>{const c1=ws.getCell(r,1),c2=ws.getCell(r,2);c1.value=a;c1.font=font({bold:true,color:{argb:NAVY}});c1.alignment={vertical:'top'};c2.value=b;c2.font=font();c2.alignment={wrapText:true,vertical:'top'};ws.getRow(r).height=Math.max(18,Math.ceil(String(b).length/95)*15);r++});
  r++;ws.getCell(r,1).value='Leyenda';ws.getCell(r,1).font=font({bold:true,size:11,color:{argb:NAVY}});r++;
  const ley=[[LLENAR,'Celda amarilla: para llenar (escribe ahí; donde hay flechita, elige de la lista)'],[NAVY,'Cabecera azul: información que trae el sistema, no cambiar'],[LLENAR_HEAD,'Cabecera naranja: la columna que hay que llenar'],[ACC_SOFT,'Fila gris-azulada: título de grupo (tipo de producto, pestaña…)']].concat(leyendaExtra||[]);
  ley.forEach(([col,txt])=>{const c=ws.getCell(r,1);c.value=col===NAVY||col===LLENAR_HEAD?'Ejemplo':'';c.fill={type:'pattern',pattern:'solid',fgColor:{argb:col}};c.font=font({color:{argb:(col===NAVY||col===LLENAR_HEAD)?'FFFFFFFF':NAVY},bold:col!==LLENAR});c.border=borde;const d=ws.getCell(r,2);d.value=txt;d.font=font();r++});
  return ws}
async function guardar(wb,nombre){const buf=await wb.xlsx.writeBuffer();const r=await fetch('/guardar?nombre='+encodeURIComponent(nombre),{method:'POST',body:new Uint8Array(buf)});return r.text()}
window.XLSXB={cargarExcelJS,hoja,portada,guardar,font};
})();
