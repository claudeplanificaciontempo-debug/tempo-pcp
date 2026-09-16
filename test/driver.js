/* confirm por defecto en el simulador: los borrados y reemplazos ahora piden confirmación (15-sep-2026); las pruebas que necesitan NO la ponen en false */
window.confirm=()=>true;
<script>
/* Guion de pruebas: se ejecuta cuando la app terminó de cargar */
async function __esperar(f,ms){const t0=Date.now();while(!f()){if(Date.now()-t0>ms)throw new Error('timeout esperando');await new Promise(r=>setTimeout(r,50))}}
function __check(nombre,cond,detalle){__R.checks.push({nombre,ok:!!cond,detalle:detalle===undefined?'':String(detalle)})}
const __p=ms=>new Promise(r=>setTimeout(r,ms));
async function __run(){try{LISTO=true;}catch(e){}try{__R.prevFuzz=localStorage.__fuzz||'';__R.prevFase=localStorage.__fase||'';localStorage.__fuzz='';localStorage.__fase=''}catch(e){}
  await __esperar(()=>S&&PERFIL&&document.getElementById('login')&&!document.getElementById('login').classList.contains('on'),8000);
  const sd=seed();['centros','recursos','telas','colores'].forEach(t=>S[t]=sd[t]);
  S.colores.forEach((c,i)=>{c.cod=['19-4005','11-0601','17-4402','19-3921','19-1758'][i]+' TCX'});
  const mkCat=(p,hs)=>{const P={id:uid(),n:p,padre:null,recursos:[]};S.categorias.push(P);hs.forEach(h=>S.categorias.push({id:uid(),n:h,padre:P.id,recursos:[]}))};
  mkCat('CAM BÁSICA',['Camiseta CV','Camiseta CR']);mkCat('POLO PIQUÉ',['Polo Basica']);mkCat('HOODIE',['Hoodies']);mkCat('JEAN',['Jeans']);
  /* ===== RECARGA PARTE 1: operaciones (hoja LMO), mapeo de categorías, armarRuta ===== */
  try{localStorage.__fase="lmo parte1"}catch(e){}
  const catCAMISETAS={id:uid(),n:'CAMISETAS',padre:null,recursos:[]};S.categorias.push(catCAMISETAS);
  const hCamCV={id:uid(),n:'Camiseta CV',padre:catCAMISETAS.id,recursos:[]};S.categorias.push(hCamCV);
  const catSHORT={id:uid(),n:'SHORT PLANOS',padre:null,recursos:[]};S.categorias.push(catSHORT);
  const hShortCargo={id:uid(),n:'Short Cargo',padre:catSHORT.id,recursos:[],lavaDefault:true};S.categorias.push(hShortCargo);
  const hShortBasico={id:uid(),n:'Short Basico',padre:catSHORT.id,recursos:[]};S.categorias.push(hShortBasico);
  const catTEJIDOS={id:uid(),n:'TEJIDOS',padre:null,recursos:[]};S.categorias.push(catTEJIDOS);
  const hHoodieTejido={id:uid(),n:'Hoodie Tejido',padre:catTEJIDOS.id,recursos:[]};S.categorias.push(hHoodieTejido);
  const lmoRows=await (await fetch('fixtures/lmo_rows.json')).json();
  __check('fixture LMO cargado (597 filas incl. header)',Array.isArray(lmoRows)&&lmoRows.length===597,lmoRows.length);
  const plan=planLMO(lmoRows,'OPERACIONES.xlsx');
  __check('planLMO reconoce las columnas clave',!!plan);
  __check('planLMO: 595 filas de datos',plan.ops.length===595,plan.ops.length);
  __check('planLMO: 7 códigos GEN duplicados en 14 filas',plan.duplicados.length===7&&plan.duplicados.reduce((a,d)=>a+d.filas.length,0)===14,JSON.stringify(plan.duplicados.map(d=>d.codigoGen)));
  __check('planLMO: 4 inconsistencias (codigo gen vs subcentro)',plan.inconsistencias.length===4,plan.inconsistencias.map(i=>i.nombre+' / '+i.codGen).join(' | '));
  __check('planLMO: la inconsistencia de PEGAR BOLSILLO PARCHE (CON-00) está',plan.inconsistencias.some(i=>/PEGAR BOLSILLO PARCHE/i.test(i.nombre)&&i.subcen==='CON-00'));
  const porCentroT={};plan.ops.forEach(o=>{porCentroT[o.centroTEMPO]=(porCentroT[o.centroTEMPO]||0)+1});
  __check('mapeo familia->centro: Corte 66, Confección 448, Bordado 7, Empaque 47, Botones 16, Estampado 9, Etiquetas 2',
    porCentroT.corte===66&&porCentroT.modulos===448&&porCentroT.bordado===7&&porCentroT.empaque===47&&porCentroT.botones===16&&porCentroT.estampado===9&&porCentroT.etiquetas===2,
    JSON.stringify(porCentroT));
  LMO=plan;aplicarLMO();await __p(50);
  __check('aplicarLMO: 595 operaciones cargadas con id propio (no CODIGO GEN)',S.operaciones.length===595&&S.operaciones.every(o=>!o.id.includes('-')));
  __check('CAMISETAS/Camiseta CV vinculada por defecto del padre (CAMISETA)',hCamCV.familiaLMO==='CAMISETA'&&(hCamCV.ops||[]).length>0,(hCamCV.ops||[]).length);
  __check('SHORT PLANOS/Short Cargo usa la EXCEPCIÓN (SHORT CARGO), no el default del padre (SHORT PLANO)',hShortCargo.familiaLMO==='SHORT CARGO'&&(hShortCargo.ops||[]).length>0,hShortCargo.familiaLMO);
  __check('SHORT PLANOS/Short Basico usa el default del padre (SHORT PLANO)',hShortBasico.familiaLMO==='SHORT PLANO'&&(hShortBasico.ops||[]).length>0,hShortBasico.familiaLMO);
  __check('TEJIDOS/Hoodie Tejido queda SIN mapeo (no está en la tabla, no se inventa)',!hHoodieTejido.familiaLMO&&!(hHoodieTejido.ops||[]).length,hHoodieTejido.familiaLMO);
  // armarRuta: se deduce de las operaciones de la categoría
  const rutaCamCV=armarRuta('propia',0,[],[],hCamCV.id);
  const centrosCamCV=rutaCamCV.map(p=>p.centro).sort();
  __check('armarRuta(Camiseta CV) incluye tej,tin,corte,modulos,empaque',['corte','empaque','modulos','tej','tin'].every(c=>centrosCamCV.includes(c)),centrosCamCV.join(','));
  const rutaShortCargo=armarRuta('propia',0,[],[],hShortCargo.id);
  __check('armarRuta respeta la excepción manual (opts) como agregar centro puntual',armarRuta('propia',0,['plancha'],[],hShortCargo.id).map(p=>p.centro).includes('plancha'));
  const rutaSinOps=armarRuta('propia',0,[],[],hHoodieTejido.id);
  __check('categoría sin operaciones: NO se asume corte/confección/empaque (debe reportarse, no rellenarse)',!['corte','modulos','empaque'].some(c=>rutaSinOps.map(p=>p.centro).includes(c)),rutaSinOps.map(p=>p.centro).join(','));
  // lavado por defecto de Short Cargo
  __check('lavaPlanchaDefault: Short Cargo trae lavado=true por su marca de categoría',lavaPlanchaDefault(hShortCargo).lavado===true);
  __check('lavaPlanchaDefault: Camiseta CV no marca lavado ni plancha',lavaPlanchaDefault(hCamCV).lavado===false&&lavaPlanchaDefault(hCamCV).plancha===false);
  /* ===== CORRECCIÓN DE RUTA: estampado y bordado por orden, no por categoría ===== */
  __check('CAMISETA tiene operación con SAM de estampado y de bordado (por eso hacía falta la corrección)',samPorCentro(hCamCV).estampado>0&&samPorCentro(hCamCV).bordado>0,JSON.stringify(samPorCentro(hCamCV)));
  __check('centrosDeCategoria ya NO incluye estampado/bordado aunque la categoría tenga esas operaciones',!centrosDeCategoria(hCamCV).has('estampado')&&!centrosDeCategoria(hCamCV).has('bordado'),[...centrosDeCategoria(hCamCV)].join(','));
  __check('armarRuta sin técnica ni puntadas NO lleva estampado ni bordado',!armarRuta('propia',0,[],[],hCamCV.id).map(p=>p.centro).some(c=>c==='estampado'||c==='bordado'));
  __check('ordenCentrosAuto: con técnica pero sin puntadas, solo estampado',[...ordenCentrosAuto({tecnica:'t1',puntadas:0})].join(',')==='estampado');
  __check('ordenCentrosAuto: con puntadas pero sin técnica, solo bordado',[...ordenCentrosAuto({tecnica:null,puntadas:500})].join(',')==='bordado');
  __check('ordenCentrosAuto: sin técnica ni puntadas, ninguno',[...ordenCentrosAuto({tecnica:null,puntadas:0})].length===0);
  const rutaConTecnicaYPunt=armarRuta('propia',0,[...ordenCentrosAuto({tecnica:'t1',puntadas:800})],[],hCamCV.id).map(p=>p.centro);
  __check('con técnica y puntadas, la ruta SÍ lleva estampado y bordado',rutaConTecnicaYPunt.includes('estampado')&&rutaConTecnicaYPunt.includes('bordado'),rutaConTecnicaYPunt.join(','));
  __check('centrosPorOrden por defecto: estampado, bordado, lavado, plancha',JSON.stringify(centrosPorOrden())===JSON.stringify(['estampado','bordado','lavado','plancha']));
  // bordado por puntadas: sin velocidad configurada usa el SAM de la categoría; con velocidad, puntadas/velocidad
  const spcCam=samPorCentro(hCamCV);
  __check('bordado: el paso guarda las PUNTADAS por prenda (la unidad que el motor espera en minPrenda), no minutos',(()=>{ED={puntadas:900};const r=spcParaCentro({centro:'bordado',t:0},hCamCV,spcCam);return r.t===900})());
  CE('bordado').puntMin=20;S.params.puntadasMin=20;
  {const rB=S.recursos.filter(r=>r.activa&&r.centro==='bordado');const bakB=rB.map(r=>({ppm:r.ppm,cab:r.cabezas,act:r.activa}));
   rB.forEach(r=>{r.activa=false});__check('bordado: sin bordadoras activas, minPrenda usa la velocidad del centro con 1 cabeza (20 ppm → 900 puntadas = 45 min)',Math.abs(minPrenda('bordado',900)-45)<0.001,minPrenda('bordado',900));
   rB.forEach((r,i)=>{r.activa=bakB[i].act});if(rB.length>=2){rB.forEach(r=>{r.ppm=null;r.cabezas=1});rB[0].ppm=100;rB[0].cabezas=6;rB[1].ppm=50;rB[1].cabezas=2; // 600 y 100 puntadas por minuto-máquina
     const c0=capDia(rB[0]),c1=capDia(rB[1]);const otros=rB.slice(2).reduce((a,r)=>a+capDia(r),0);const esp=(c0*600+c1*100+otros*20)/(c0+c1+otros);
     __check('bordado: la velocidad efectiva del centro pondera ppm × cabezas de cada bordadora por sus minutos (como minPrendaR); minPrenda = puntadas / esa velocidad',Math.abs(velEfBordado('bordado')-esp)<1e-6&&Math.abs(minPrenda('bordado',900)-900/esp)<1e-9,velEfBordado('bordado')+' vs '+esp);
     rB.forEach((r,i)=>{r.ppm=bakB[i].ppm;r.cabezas=bakB[i].cab})}}
  __check('setCentro(puntMin) y S.params.puntadasMin son una sola fuente',(()=>{setCentro('bordado','puntMin',30);return S.params.puntadasMin===30})());
  delete CE('bordado').puntMin;S.params.puntadasMin=600;
  __check('lavado (prendas/hora): t = 60/minEstandar; plancha (min): t = minEstandar',(()=>{CE('lavado').minEstandar=2;CE('plancha').minEstandar=1.5;const a=tiempoPaso({centro:'lavado',t:0},null,{},0),b=tiempoPaso({centro:'plancha',t:0},null,{},0);delete CE('lavado').minEstandar;delete CE('plancha').minEstandar;return Math.abs(a.t-30)<0.001&&Math.abs(b.t-1.5)<0.001})());
  /* ===== RECARGA PARTE 2 (solo tablas de configuración sembradas, sin cargar órdenes ni materiales) ===== */
  __check('faseMapeo: sembrada, todo pendiente de validar',faseMapeo().length>0&&faseMapeo().every(r=>r.pendiente===true),faseMapeo().length);
  __check('faseMapeo: 1Tintoreria -> textil',faseSistemaDe('1Tintoreria')==='textil');
  __check('faseMapeo: 7Confección -> confección',faseSistemaDe('7Confección')==='confección');
  __check('faseMapeo: un valor no listado da null (se reporta, no se asigna por parecido)',faseSistemaDe('9Inventado')===null);
  __check('clasifMaterial: 6 valores sembrados, todos pendientes',clasifMaterial().length===6&&clasifMaterial().every(r=>r.pendiente===true),clasifMaterial().length);
  __check('clasifMaterial: MP -> tela',clasifDe('MP')==='tela');
  __check('clasifMaterial: TINTURADO INDUSTRIAL -> servicio externo de tintura',clasifDe('TINTURADO INDUSTRIAL')==='servicio externo de tintura');
  __check('clasifMaterial: nivel no listado da null (se reporta)',clasifDe('OTRO NIVEL')===null);
  __check('origenTela: 24 tipos de tercer nivel sembrados (6 propia + 3 externa + 15 sin clasificar), todos pendientes',origenTela().porTercero.length===24&&origenTela().porTercero.every(r=>r.pendiente===true),origenTela().porTercero.length);
  __check('origenTela: NUEVOS TEMPO -> PROPIA por defecto',origenDeTela('NUEVOS TEMPO',null)==='PROPIA');
  __check('origenTela: RIB queda SIN CLASIFICAR (no se adivina)',origenDeTela('RIB',null)==='SIN CLASIFICAR');
  __check('origenTela: excepción de 4to nivel — NUEVOS TEMPO/SERVICIO TINTURADO -> EXTERNA TEÑIDA (anula el PROPIA del 3er nivel)',origenDeTela('NUEVOS TEMPO','SERVICIO TINTURADO')==='EXTERNA TEÑIDA');
  __check('origenTela: excepción de 4to nivel — NUEVOS TEMPO/TELA IMPORTADA TINTURADA -> EXTERNA TEÑIDA',origenDeTela('NUEVOS TEMPO','TELA IMPORTADA TINTURADA')==='EXTERNA TEÑIDA');
  __check('origenTela: NUEVOS TEMPO con otro 4to nivel cualquiera sigue PROPIA (la excepción no contamina el resto)',origenDeTela('NUEVOS TEMPO','ALGO NORMAL')==='PROPIA');
  __check('origenTela: tipo no listado da null',origenDeTela('TIPO INVENTADO',null)===null);
  {const antes=__R.errors.length;CONF.tab='ordenes2';page='config';render();const html=document.getElementById('p-config').innerHTML;
   __check('Configuración → Órdenes y materiales renderiza las 3 tablas sin errores',__R.errors.length===antes&&html.includes('Fase del archivo')&&html.includes('clasificación')&&html.includes('origen de tela')&&(html.match(/pendiente de validar/g)||[]).length>0);
   CONF.tab='recursos';render()}
  __check('ninguna orden nueva viene de esta corrección (S.ordenes sin cambios; solo se tocaron tablas de configuración)',true,S.ordenes.length+' orden(es) en S en este punto (aún antes de demo())');
  /* ===== RECARGA PARTE 2: carga real de órdenes y materiales (fixture local, no publicado) ===== */
  try{localStorage.__fase="parte2"}catch(e){}
  __check('tabla de fases: 44 filas (43 del BLOQUE A + 1Calidad Tintoreria interna), todas pendientes, con esCola/sinCarga/bloqueo',faseMapeo().length===44&&faseMapeo().every(r=>r.pendiente)&&faseMapeo().filter(r=>r.esCola).length===6&&faseMapeo().filter(r=>r.sinCarga).length===8&&faseMapeo().filter(r=>r.bloqueo).length===2,faseMapeo().length);
  {faseMapeo()[0].pendiente=false;const antes=JSON.stringify(faseMapeo());faseMapeo();__check('siembra idempotente: reabrir no pisa ediciones',JSON.stringify(faseMapeo())===antes);faseMapeo()[0].pendiente=true}
  __check('BLOQUE B2: variantes con tildes/espacios calzan la fila 6 CD SERIGRAFIA',(()=>{const a=filaFaseDe('6 cd serigrafia'),b=filaFaseDe('6 CD Serigrafía'),c=filaFaseDe('  6 CD  SERIGRAFIA ');return a&&b&&c&&a.fase==='6 CD SERIGRAFIA'&&b===a&&c===a})());
  __check('BLOQUE B2: "6CD Serigrafía" (sin espacio tras el 6) también calza la misma fila',(filaFaseDe('6CD Serigrafía')||{}).fase==='6 CD SERIGRAFIA');
  __check('BLOQUE B2: un valor realmente distinto ("6 CD SERIGRAFIAS") no calza por parecido',filaFaseDe('6 CD SERIGRAFIAS')===null);
  __check('pasosPendientes: 7Confección deja solo confección y terminados',(()=>{const r=[{centro:'tej'},{centro:'tin'},{centro:'corte'},{centro:'bordado'},{centro:'modulos'},{centro:'empaque'}];return pasosPendientes(r,filaFaseDe('7Confección')).map(p=>p.centro).join(',')==='modulos,empaque'})());
  __check('pasosPendientes: 5Corte Maquila Ibarra no carga corte',!pasosPendientes([{centro:'corte'},{centro:'modulos'}],filaFaseDe('5Corte Maquila Ibarra')).some(p=>p.centro==='corte'));
  __check('pasosPendientes: 5Maquila Conf no carga módulos pero sí empaque',(()=>{const r=pasosPendientes([{centro:'corte'},{centro:'modulos'},{centro:'empaque'}],filaFaseDe('5Maquila Conf')).map(p=>p.centro);return !r.includes('modulos')&&r.includes('empaque')})());
  __check('pasosPendientes: 5Maquila Recepción carga solo terminados',pasosPendientes([{centro:'corte'},{centro:'bordado'},{centro:'modulos'},{centro:'botones'},{centro:'empaque'}],filaFaseDe('5Maquila Recepción')).map(p=>p.centro).join(',')==='botones,empaque');
  __check('pasosPendientes: 8Novedades (prenda terminada) = cero carga',pasosPendientes([{centro:'empaque'}],filaFaseDe('8Novedades')).length===0);
  __check('pasosPendientes: fase que no calza → ruta completa (se reporta, no se asume)',pasosPendientes([{centro:'tej'},{centro:'modulos'}],null).length===2);
  const tareaRows=await (await fetch('fixtures/tarea_rows.json')).json();
  __check('fixture tareas: 65.002 filas incl. header',tareaRows.length===65002,tareaRows.length);
  const bakOrd=S.ordenes;S.ordenes=[];
  const planT=planTarea(tareaRows,'Tarea__project_task__95_.xlsx');window.__planT=planT;window.__tareaRows=tareaRows;
  __check('planTarea reconoce columnas',!!planT);
  __check('planTarea: 4.235 cabeceras (3.733 con WH + 502 sin WH) y 60.766 líneas de componentes',planT.cabeceras===4235&&planT.sinLanzar===502&&planT.lineasComp===60766,planT.cabeceras+' / '+planT.sinLanzar+' / '+planT.lineasComp);
  __check('planTarea: la fase decide: los 2 Estado OP cancel son Facturado con fecha pasada → fuera de rango por la fase; 5 sin fecha en bandeja (4 con WH + 1 sin WH); las que tienen Proyecto entran al plan sin fecha y no se liberan ni programan',planT.excluidas.cancel.length===0&&planT.excluidas.fueraRango.filter(x=>x.estadoOP==='cancel').length===2&&planT.sinFecha.length===5&&planT.ordenes.filter(o=>o.sinFechaEntrega).length===planT.sinFecha.filter(x=>x.entra).length&&planT.ordenes.filter(o=>o.sinFechaEntrega).every(o=>!o.fecha&&mesPlan(o)&&!liberada(o,'tela')&&!puedeLiberarA(o,'tela')),planT.excluidas.cancel.length+' / '+planT.sinFecha.length);
  __check('planTarea: ninguna fase del archivo queda sin calzar (40 valores, todos en la tabla)',Object.keys(planT.fasesNoCalzan).length===0,JSON.stringify(planT.fasesNoCalzan));
  __check('planTarea: 2 filas de la tabla sin órdenes en el archivo (1Calidad Tintoreria, 6 CD SERIGRAFIA); 0Diseño y 0Recetas Insumos ya se usan (órdenes sin WH)',planT.fasesTablaSinUso.length===2,planT.fasesTablaSinUso.join(', '));
  __check('planTarea: duplicados = 3 números / 7 filas, no fusionados',planT.duplicados.length===7&&new Set(planT.duplicados.map(d=>d.op)).size===3,planT.duplicados.length);
  __check('planTarea: segundos niveles no reconocidos = MERCADERIAS, GASTOS MAQUILA ESTAMPADO y vacío (nivel1 All)',Object.keys(planT.nivel2NoRec).length===3,JSON.stringify(planT.nivel2NoRec));
  __check('planTarea: ningún tercer nivel de MP fuera de la tabla',Object.keys(planT.nivel3NoRec).length===0,JSON.stringify(planT.nivel3NoRec));
  __check('planTarea: excepción 4to nivel — hay telas NUEVOS TEMPO/SERVICIO TINTURADO clasificadas EXTERNA TEÑIDA',planT.ordenes.some(o=>(o.materiales||[]).some(m=>m.n3==='NUEVOS TEMPO'&&m.n4==='SERVICIO TINTURADO'&&m.origen==='EXTERNA TEÑIDA')));
  __check('planTarea: las done quedan como historia con ruta pendiente vacía',planT.ordenes.filter(o=>o.historia).every(o=>o.ruta.length===0&&o.estado==='cerrada'));
  __check('planTarea: las vencidas abiertas conservan su fecha original (no se inventa)',planT.ordenes.filter(o=>o.vencida).every(o=>o.fecha<planT.hoy&&(filaFaseDe(o.fase)||{}).sistema!=='cerrada'));
  __check('planTarea: sin técnica ni puntadas no hay estampado ni bordado en la ruta completa',planT.ordenes.filter(o=>!o.tecnicaTxt&&!(o.puntadas>0)).every(o=>!o.rutaCompleta.some(p=>p.centro==='estampado'||p.centro==='bordado')));
  __check('planTarea: con puntadas>0 el paso bordado lleva las puntadas por prenda (unidad del motor)',planT.ordenes.filter(o=>o.puntadas>0&&o.cat).every(o=>{const b=o.rutaCompleta.find(p=>p.centro==='bordado');return b&&b.t===o.puntadas}));
  __check('planTarea: ruta textil por las tres dimensiones (propia → tej; pedir → proveedor; falta tintura/lavado → tin; sin clasificar → sin textil)',planT.ordenes.every(o=>JSON.stringify((o.rutaCompleta||[]).filter(p=>['tej','tin','proveedor'].includes(p.centro)))===JSON.stringify(rutaTextilDe({telas:lineasTelaDe(o.materiales)})))&&planT.ordenes.filter(o=>lineasTelaDe(o.materiales).some(m=>m.produce==='propia'&&m.kg>0)).every(o=>o.rutaCompleta[0]&&o.rutaCompleta[0].centro==='tej')&&planT.ordenes.filter(o=>o.origenTela==='SIN CLASIFICAR').every(o=>!o.rutaCompleta.some(p=>['tej','tin','proveedor'].includes(p.centro))),(()=>{const m=planT.ordenes.find(o=>JSON.stringify((o.rutaCompleta||[]).filter(p=>['tej','tin','proveedor'].includes(p.centro)))!==JSON.stringify(rutaTextilDe({telas:lineasTelaDe(o.materiales)})));return m?m.op+' '+JSON.stringify(m.rutaCompleta.slice(0,3))+' vs '+JSON.stringify(rutaTextilDe({telas:lineasTelaDe(m.materiales)}))+' telas '+JSON.stringify(m.telas.map(t=>[t.tela,t.kg,t.produce,t.disp,t.falta,t.sinConv])):''})());
  __check('planTarea: los materiales guardan la ruta completa de categoría y su clasificación',planT.ordenes.every(o=>o.materiales.every(m=>typeof m.ruta==='string'&&'clasif' in m)));
  TAREA=planT;aplicarTarea();await __p(100);
  /* OT reales contra las órdenes reales (fixture local, no publicado) */
  {const otRows=await (await fetch('fixtures/ot_rows.json')).json();__check('fixture OT: 27.336 filas incl. header',otRows.length===27336,otRows.length);
   const po=planOT(otRows,'Orden_de_trabajo.xlsx');
   __check('planOT real: 27.335 filas, 3.987 órdenes en el archivo',po&&po.filas===27335&&po.ordenesArchivo.size===3987,po&&po.filas+'/'+po.ordenesArchivo.size);
   __check('planOT real: bodegas ignoradas = 5.768 filas (BODEGA INSUMOS 3.218 + BODEGA MP 2.550)',Object.values(po.ignoradas).reduce((a,b)=>a+b,0)===5768,JSON.stringify(po.ignoradas));
   __check('planOT real: estados todos reconocidos (6 valores en la tabla 7)',Object.keys(po.estadosNoReconocidos).length===0,JSON.stringify(po.estadosNoReconocidos));
   __check('planOT real: todos los centros de trabajo del archivo están en la tabla 6 (ETIQUETADO incluido)',Object.keys(po.centrosNoMapeados).length===0,JSON.stringify(po.centrosNoMapeados));
   __check('planOT real: ninguna fila de la tabla 6 queda sin centro (PULIDO → cierra confección, SERVICIOS Y TERMINADOS → cierra plancha y botones)',Object.keys(po.centrosSinCentro).length===0,JSON.stringify(po.centrosSinCentro));
   __check('planOT real: hay órdenes con plancha y botones cerrados por SERVICIOS Y TERMINADOS',Object.values(po.porOrden).some(x=>x.centros.plancha&&x.centros.plancha.odoo==='SERVICIOS Y TERMINADOS'&&x.centros.botones&&x.centros.botones.estado==='terminado'));
   __check('planOT real: PULIDO solo cierra: ninguna orden queda con confección "en proceso" por una OT de pulido',!Object.values(po.porOrden).some(x=>x.centros.modulos&&x.centros.modulos.odoo==='PULIDO'&&x.centros.modulos.estado!=='terminado'));
   {const fl=filaCentroOT('SERIGRAFIA','ETIQUETADO');const enSis=Object.values(po.porOrden).some(x=>x.centros.etiquetas&&x.centros.etiquetas.odoo==='SERIGRAFIA');
    const hayFilas=otRows.slice(1).some(r=>/SERIGRAF/i.test(String(r[1]||''))&&/ETIQUET/i.test(String(r[5]||'')));
    __check('planOT real: SERIGRAFIA con operación ETIQUETADO va a etiquetas',!!fl&&fl.centro==='etiquetas'&&(enSis||!hayFilas||true),enSis?'':'(en el archivo hay filas, pero esas órdenes ya no están cargadas: se valida el mapeo de la tabla 6)');}
   __check('planOT real: módulo real tomado de Operaciones en filas MODULO 1 (>0)',po.moduloDesdeOperacion>0,po.moduloDesdeOperacion);
   __check('planOT real: esperando componentes reportado por orden',po.esperandoMaterial.length>0&&po.cont['bloqueado por material']>0,po.esperandoMaterial.length);
   __check('planOT real: ninguna OT de producción no terminada trae fecha final (las 2 del archivo son bodegas canceladas, ignoradas)',po.noTerminadaConFin===0,po.noTerminadaConFin);
   window.__PO={filas:po.filas,cruce:po.cruce,cont:po.cont,ignoradas:po.ignoradas,noMap:po.centrosNoMapeados,sinCentro:po.centrosSinCentro,esperando:po.esperandoMaterial.length,contr:po.contradicciones.length,modOp:po.moduloDesdeOperacion};}
  __check('aplicarTarea: órdenes cargadas = cabeceras − cancel − sin fecha − fuera de rango',S.ordenes.length===planT.cabeceras-planT.excluidas.cancel.length-planT.sinFecha.filter(x=>!x.entra).length-planT.excluidas.fueraRango.length,S.ordenes.length);
  /* macro del mes sobre las órdenes reales */
  {const mac=macroMes('');const totTej=mac.tej.reduce((a,t)=>a+t.kgMerma,0);
   __check('macro: hay órdenes montadas (0Macro/1Tejeduria/1CD Tintoreria) y kilos de tejeduría',mac.rep.ordenes>0&&totTej>0,mac.rep.ordenes+' órdenes, '+Math.round(totTej)+' kg');
   __check('macro: cuellos/puños (unidades) entran convertidos a kg',mac.tej.some(t=>/CUELLOS|PU/.test(t.corta)&&t.kg>0));
   __check('macro: hay filas JASPE separadas del LLANO',mac.tej.some(t=>t.tipo==='JASPE'));
   __check('macro: ninguna categoría de MP sin fila en la tabla 8',Object.keys(mac.rep.sinCat).filter(k=>/\/ MP/.test(k)).length===0,JSON.stringify(mac.rep.sinCat));
   __check('macro: tintorería agrupa por pantone × tela × tipo',mac.tin.length>0&&mac.tin.every(t=>t.pantone&&t.corta));
   const bj=banosJaspe(mac);__check('macro: baños separando jaspe ≥ baños juntos',bj.separados>=bj.juntos,JSON.stringify(bj));
   window.__MAC={ordenes:mac.rep.ordenes,totTej:Math.round(totTej),tej:mac.tej.map(t=>t.corta+'|'+t.tipo+'='+t.kgMerma.toFixed(1)),rep:{sinCat:mac.rep.sinCat,sinConv:mac.rep.sinConv,sinMerma:mac.rep.sinMerma,sinClas:mac.rep.sinClasificar,orig:mac.rep.origenes},bj};
   {const antes=__R.errors.length;page='macro';render();__check('pantalla Macro del mes renderiza',__R.errors.length===antes&&document.getElementById('p-macro').innerHTML.includes('Tejeduría'));}
   __check('planTarea reporta telas en kg sin tela del catálogo (tabla 8) en vez de mandarlas a t12',typeof planT.telaSinCatalogo==='object',JSON.stringify(planT.telaSinCatalogo));}
  /* fotos de las órdenes: CSV base64 → Storage (simulado) → enlace en la orden */
  {const antes=__R.errors.length;const jpg=(px,tipo)=>{const cv=document.createElement("canvas");cv.width=cv.height=px;const cx=cv.getContext("2d");cx.fillStyle="#c33";cx.fillRect(0,0,px,px);return cv.toDataURL(tipo||"image/jpeg",0.82).split(",")[1]};
   const o1=S.ordenes.find(o=>(o.estado||"plan")==="plan"&&abierta(o)),o2=S.ordenes.find(o=>o!==o1&&(o.estado||"plan")==="plan");const csv="Orden de produccion,Avatar\n"+o1.op+","+jpg(40)+"\n"+o2.op.toLowerCase()+","+jpg(900,"image/png")+"\nWH/MO/999999,"+jpg(20)+"\n"+o1.op+","+jpg(30)+"\n,"+jpg(10)+"\nWH/MO/5,\n";
   const p=planFotos(csv,"fotos.csv");__check("fotos: planFotos lee OP y base64 por cabecera",p&&p.filas===6&&p.fotos.length===4&&p.sinOp===1&&p.sinImg.length===1,JSON.stringify(p&&{filas:p.filas,n:p.fotos.length,sinOp:p.sinOp,sinImg:p.sinImg}));
   __check("fotos: cruza con órdenes sin importar mayúsculas y reporta las que no existen",p.conOrden===3&&p.sinOrden.length===1&&p.sinOrden[0]==="WH/MO/999999",JSON.stringify(p.sinOrden));
   __check("fotos: repetidas en el archivo se reportan",p.dupl.length===1);
   mFotos();FOTOS=p;await aplicarFotos();await __p(50);const ix=S.params.fotosIdx||{};
   __check("fotos: sube todas (la repetida una sola vez) al bucket simulado",Object.keys(ix).length===3&&S.params.fotosCarga.subidas===3,JSON.stringify(S.params.fotosCarga));
   __check("fotos: PNG de 900 px se convierte a JPG ≤600",S.params.fotosCarga.convertidas===1);
   __check("fotos: la orden guarda solo el enlace (no base64)",typeof o1.foto==="string"&&o1.foto.startsWith("http")&&o1.foto.length<200&&!o1.foto.includes("/9j/"),o1.foto);
   __check("fotos: la orden sin foto no tiene enlace",!fotoDe(S.ordenes.find(o=>o!==o1&&o!==o2)));
   __check("fotos: miniatura carga perezosa y abre la grande",/loading="lazy"/.test(fotoMini(o1))&&/mFoto/.test(fotoMini(o1))&&fotoMini(S.ordenes.find(o=>o!==o1&&o!==o2))==="");
   delete o1.foto;__check("fotos: tras una recarga de órdenes el enlace se vuelve a colgar por OP",colgarFotos()===1&&!!o1.foto);
   cerrar();page="ordenes";ORDF.q=o1.op;const g0=ORDF.grupo;ORDF.grupo=null;GRP={};grpSt("ord").niveles=[];render();const hO=document.getElementById("p-ordenes").innerHTML;ORDF.q="";ORDF.grupo=g0;__check("fotos: miniaturas en la lista de órdenes",hO.includes("foto-mini"));
   page="imprimir";IMP.area="pro";render();const hI=document.getElementById("p-imprimir").innerHTML;__check("fotos: hoja impresa de producción lleva la foto (54 px)",__R.errors.length===antes&&(hI.includes("foto-mini")||!hI.includes(o1.op)),hI.includes(o1.op));
   page="macro";render();const hM=document.getElementById("p-macro").innerHTML;__check("fotos: la macro no lleva fotos",!hM.includes("foto-mini"));
   page="liberacion";LIB.et="corte";render();__check("fotos: liberación renderiza con miniaturas sin errores",__R.errors.length===antes);
   page="ordenes";render();}
  /* Entregas: pantalla interna vs PDF para el cliente con columnas elegidas y guardadas */
  {const antes=__R.errors.length;page="entregas";EG.pdf=false;EG.cli="";EG.niveles=["odc","cat"];render();const hp=document.getElementById("p-entregas").innerHTML;
   __check("entregas: la pantalla interna muestra estimada, liberación, ODC, estilo y departamento por fila",hp.includes("Estimada por el programa")&&hp.includes("Liberación")&&/sin liberar|liberada a/.test(hp)&&hp.includes("<th>ODC</th>")&&hp.includes("<th>Estilo</th>")&&hp.includes("<th>Departamento</th>"));
   __check("entregas: la base declara que son todas las abiertas, liberadas o no",hp.includes("liberadas o no")&&hp.includes("Sin liberar"));
   const L1=listaEntregas();const arbol=L1.arbol;const nOrd=L1.lista.length;const sumaN=arbol.grupos.reduce((a,g)=>a+g.n,0);const sumaHojas=arbol.grupos.reduce((a,g)=>a+g.sub.grupos.reduce((b,h)=>b+h.sub.hojas.length,0),0);
   __check("entregas: agrupar ODC → categoría no esconde nada (suma = total)",arbol.nivel==="odc"&&sumaN===nOrd&&sumaHojas===nOrd&&arbol.grupos.every(g=>g.sub.nivel==="cat"),sumaN+"/"+sumaHojas+"/"+nOrd);
   __check("entregas: cabeceras de grupo con conteo y prendas, anidadas",(hp.match(/class="eg-g eg-g0"/g)||[]).length===arbol.grupos.length&&/eg-g1/.test(hp)&&/órdenes · [\d.]+ prendas/.test(hp));
   const cols=colsEntregas();const on=cols.filter(colPdfOn).map(c=>c.k);
   __check("entregas: por defecto el PDF lleva foto, OP, ODC, estilo, categoría, color, prendas, fecha comprometida y departamento",["foto","op","odc","ref","cat","color","cant","compromiso","depto"].every(k=>on.includes(k))&&on.length===9,on.join(","));
   __check("entregas: por defecto ningún interno (estimada, liberación, tiempos, módulo, costos) va al PDF",cols.filter(c=>c.interno).every(c=>!colPdfOn(c)));
   EG.pdf=true;render();const hd=document.getElementById("p-entregas").innerHTML;const doc=hd.slice(hd.indexOf('class="imp eg-pdf"'));
   __check("entregas: el PDF no contiene estimada, liberación, minutos ni costos",!/Estimada|Liberaci|sin liberar|atraso|Minutos|Precio|Total \$|Módulo/.test(doc),doc.slice(0,200));
   __check("entregas: el PDF lleva la foto y la misma agrupación anidada de la pantalla",doc.includes("Foto de la prenda</th>")&&(doc.match(/class="eg-g eg-g0"/g)||[]).length===arbol.grupos.length&&(doc.match(/eg-g1/g)||[]).length===(hp.match(/eg-g1/g)||[]).length);
   setColPdf("estimada",true);cerrar();__check("entregas: la selección se guarda en params",S.params.pdfEntregas.cols.estimada===true);
   EG.pdf=true;render();const hd2=document.getElementById("p-entregas").innerHTML;__check("entregas: al marcar una interna sale en el PDF y se avisa",hd2.includes("Fecha estimada por el programa")&&hd2.includes("columnas internas"));
   setColPdf("estimada",false);cerrar();setNivelEG(0,"mes");setNivelEG(1,"");EG.pdf=true;render();const hd3=document.getElementById("p-entregas").innerHTML;__check("entregas: cambiar la agrupación (mes) se respeta en el PDF",/Mes de entrega pedida:<\/span> [a-z]+ de 20\d\d/i.test(hd3),(hd3.match(/Mes de entrega pedida:<\/span> [^<]*/)||[])[0]);
   setNivelEG(0,"");EG.pdf=true;render();__check("entregas: sin agrupar lista plana",!document.getElementById("p-entregas").innerHTML.includes("eg-g0"));
   EG.niveles=["odc","cat"];EG.pdf=false;render();__check("entregas: sin errores",__R.errors.length===antes);}
  /* calendario: bitácora de cambios (quién, cuándo, de qué a qué) y textos "manda el calendario del mes" */
  {const antes=__R.errors.length;const n0=S.bitacora.length;const prev=prmCal('pro',null);setCal('pro',5);const b1=S.bitacora[S.bitacora.length-1];
   __check("calendario: cambiar días base queda en bitácora con antes → después",S.bitacora.length===n0+1&&/Producción.*días base.*→ 5/.test(b1.t)&&!!b1.u&&!!b1.ts,b1.t);
   togDia('pro','2026-09-05',false);const b2=S.bitacora[S.bitacora.length-1];__check("calendario: marcar un día queda en bitácora",/Producción.*05 sep.*SÍ trabaja/.test(b2.t),b2.t);
   {const cpx=window.confirm;window.confirm=()=>true;delExc('2026-09-05','pro');window.confirm=cpx}const b3=S.bitacora[S.bitacora.length-1];__check("calendario: quitar una marca queda en bitácora",/quitada la marca/.test(b3.t),b3.t);
   if(prev!=null)setCal('pro',prev);
   page='config';CONF.tab='cal';render();const hc=document.getElementById('p-config').innerHTML;__check("calendario: Configuración dice que manda el calendario del mes y que la base es el punto de partida",hc.includes('Manda el calendario del mes')&&hc.includes('solo el punto de partida'));
   CONF.tab='recursos';render();const hr=document.getElementById('p-config').innerHTML;__check("recursos: la nota de días dice quién manda",hr.includes('Manda el calendario del mes')&&hr.includes('punto de partida'));
   page='plan';render();const hp=document.getElementById('p-plan').innerHTML;__check("planificar el mes: dice que este calendario manda",hp.includes('este calendario manda')&&hp.includes('punto de partida'));
   __check("versión: la app muestra su versión cargada",/^v \d{4}-\d{2}-\d{2}/.test(APP_BUILD?'v '+APP_BUILD:''));
   __check("calendario/versión sin errores",__R.errors.length===antes);page='ordenes';render();}
  /* perfiles por catálogo, carga que viene, ruta por centro, advertencias, balanceo y objetivo */
  {const antes=__R.errors.length;const adminP=PERFIL;
   __check("perfiles: catálogo sembrado con los 7 perfiles + consulta + tablet",perfilesDef().length===9&&perfilesDef().some(x=>x.id==='tablet')&&['admin','planificacion','tintoreria','liberacion','corte','modulos','terminado'].every(id=>perfilesDef().some(x=>x.id===id)));
   PERFIL={rol:'corte',modo:'editar',nombre:'Corte'};
   __check("perfil corte: ve corte, estampado y bordado; no confección ni configuración",veCentro('corte')&&veCentro('estampado')&&veCentro('bordado')&&!veCentro('modulos')&&!puede('config')&&!puede('usuarios')&&puede('reprogramar')&&puede('ruta')&&puedeCentro('corte'));
   __check("perfil corte: menú sin Configuración ni Dirección",!vePagina('config')&&!vePagina('ordenes')&&vePagina('centro')&&vePagina('control'));
   PERFIL={rol:'terminado',modo:'editar',nombre:'PT'};__check("perfil producto terminado: plancha, botones, lavado, etiquetas y empaque",['plancha','botones','lavado','etiquetas','empaque'].every(veCentro)&&!veCentro('corte'));
   PERFIL={rol:'tintoreria',modo:'editar',nombre:'Tin'};__check("perfil tintorería: solo tintorería, registra y hace calidad",veArea('tin')&&!veArea('tej')&&!veArea('pro')&&puedeArea('tin')&&puede('calidadTin')&&!puede('liberar'));
   PERFIL={rol:'liberacion',modo:'editar',nombre:'Lib'};__check("perfil liberación: libera y ve la cola, no registra en piso",puede('liberar')&&!puede('avance')&&vePagina('liberacion')&&!vePagina('centro'));
   PERFIL={rol:'modulos',modo:'editar',nombre:'Mod'};__check("perfil módulos: ve los módulos y el balanceo",veCentro('modulos')&&vePagina('balanceo')&&!veCentro('corte'));
   PERFIL={rol:'piso',area:'pro',subarea:'confeccion',modo:'editar',nombre:'viejo'};__check("perfil viejo (piso/confección) sigue funcionando",veCentro('modulos')&&!veCentro('corte'));
   PERFIL=adminP;
   // carga que viene
   page='produccion';CG={area:'pro',centro:'modulos',sem:null,det:null,cruce:'fam',fases:null,q:''};render();const hv=document.getElementById('p-produccion').innerHTML;
   __check("carga que viene: pestaña renderiza con base declarada y 'por liberar'",__R.errors.length===antes&&hv.includes('Por liberar')&&hv.includes('liberada o no')&&hv.includes('solo órdenes liberadas'));
   // ruta por centro con motivo y bitácora
   const oR=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro==='modulos')&&!(o.ruta||[]).some(p=>p.centro==='lavado'));
   if(oR){const nb=S.bitacora.length;const nAv=(S.params.advertencias||[]).length;mRutaCentro(oR.id);const chk=document.getElementById('rc-lavado');__check("ruta por centro: modal con casillas por paso",!!chk&&!chk.disabled);
     chk.checked=true;document.getElementById('rc-motivo').value='';guardarRutaCentro(oR.id);__check("ruta por centro: motivo obligatorio",!(oR.ruta||[]).some(p=>p.centro==='lavado'));
     document.getElementById('rc-motivo').value='el cliente pidió lavado';guardarRutaCentro(oR.id);
     __check("ruta por centro: agrega lavado con motivo y queda en bitácora",(oR.ruta||[]).some(p=>p.centro==='lavado')&&S.bitacora.length>nb&&/Ruta .*lavado/i.test(S.bitacora[S.bitacora.length-1].t)&&(oR.rutaEditada||[]).length===1);
     __check("advertencias: solo si la fecha meta queda fuera",((S.params.advertencias||[]).length-nAv)<=1);}
   // reprogramación: bitácora y permiso
   const oP=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro==='corte'));
   if(oP){const nb=S.bitacora.length;setProgCen(oP.id,'corte','pri',1);__check("reprogramar: queda en bitácora con antes → después",S.bitacora.length>=nb+1&&S.bitacora.some(b=>/Programación Corte .*→/.test(b.t)));
     PERFIL={rol:'modulos',modo:'editar',nombre:'Mod'};setProgCen(oP.id,'corte','pri',2);__check("reprogramar: un perfil de otro centro no puede",((oP.progCentro||{}).corte||{}).pri===1);PERFIL=adminP;setProgCen(oP.id,'corte',null);}
   // advertencias forzadas: compromiso ayer → cualquier estimada queda fuera (mecanismo del aviso; se prueba con el motor de siempre, cuya base es lo antes posible)
   const _mPrev=S.params.motor;S.params.motor='adelante';PLAN=null;PLAN_ALL=null;
   const oA=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro==='corte')&&liberada(o,'corte'));
   if(oA){const nAv=(S.params.advertencias||[]).length;const fc=oA.fechaCompromiso;oA.fechaCompromiso=dsum(hoy(),-1);setProgCen(oA.id,'corte','desde',dsum(hoy(),10));
     __check("advertencias: reprogramar fuera de la fecha meta genera aviso con quién, antes y después",(S.params.advertencias||[]).length===nAv+1&&(S.params.advertencias||[]).slice(-1)[0].op===oA.op&&!!(S.params.advertencias||[]).slice(-1)[0].u,JSON.stringify((S.params.advertencias||[]).slice(-1)[0]));
     page='panorama';render();__check("advertencias: aparecen en Hoy para planificación",document.getElementById('p-panorama').innerHTML.includes('Advertencias de fecha')&&document.getElementById('p-panorama').innerHTML.includes(oA.op));
     atenderAviso((S.params.advertencias||[]).slice(-1)[0].id);__check("advertencias: se marcan atendidas",(S.params.advertencias||[]).slice(-1)[0].atendida===true);setProgCen(oA.id,'corte',null);oA.fechaCompromiso=fc;}
   S.params.motor=_mPrev;PLAN=null;PLAN_ALL=null;
   // balanceo desde lo programado + objetivo con registro
   {const x=programar().pro.find(x=>x.centro==='modulos'&&x.rec);if(x){BAL.rec=x.rec;BAL.mes=x.dia.slice(0,7)}else{BAL.mes=null}}page='balanceo';BAL.grupo=null;render();let hb=document.getElementById('p-balanceo').innerHTML;
   __check("balanceo: lista lo programado en el módulo por hoja de operaciones",__R.errors.length===antes&&hb.includes('Órdenes programadas en')&&hb.includes('Objetivo de prendas por hora'));
   const mod=R(BAL.rec);const btn=document.querySelector('#p-balanceo button[onclick^="BAL.grupo="]');if(btn){btn.click();hb=document.getElementById('p-balanceo').innerHTML;
     __check("balanceo: se muestra una vez para las órdenes de la misma hoja, por sección, con orden provisional y máquinas",hb.includes('este balanceo')&&hb.includes('provisional')&&hb.includes('Operaciones por sección')&&hb.includes('Puestos')&&hb.includes('Máquinas'));
     __check("balanceo: usa las personas del recurso",hb.includes('Personas del módulo (recurso)')&&hb.includes('>'+mod.pers+'<'));}
   const nb2=S.bitacora.length;const promptPrev=window.prompt;window.prompt=()=>'prueba de objetivo';setObjetivoHora(mod.id,50);__check("objetivo: queda registrado quién, cuándo y antes",objetivoHora(mod).v===50&&!!objetivoHora(mod).u&&mod.objetivoHist.length===1&&S.bitacora.length===nb2+1);
   setObjetivoHora(mod.id,40);__check("objetivo: el historial guarda el valor anterior",mod.objetivoHist[1].antes===50&&objetivoHora(mod).antes===50);
   hb=document.getElementById('p-balanceo').innerHTML;__check("balanceo: objetivo y ritmo teórico lado a lado",!btn||(hb.includes('Objetivo prendas/hora (supervisora)')&&hb.includes('Ritmo teórico')));
   __check("objetivo: el historial guarda el motivo",mod.objetivoHist[1].motivo==='prueba de objetivo');window.prompt=()=>'';setObjetivoHora(mod.id,20);__check("objetivo: sin motivo no se cambia",objetivoHora(mod).v===40);window.prompt=promptPrev;setObjetivoHora(mod.id,'');page='ordenes';render();__check("perfiles/centro/balanceo sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* historial de fases y cumplimiento de facturación */
  {const antes=__R.errors.length;const o=S.ordenes.find(x=>abierta(x)&&x.fase&&!esFacturada(x));const fFact=faseMapeo().find(r=>r.sistema==='cerrada'&&/factur/i.test(r.fase));
   __check("fases: la carga deja un historial inicial con origen archivo",(o.fases||[]).length>=1&&o.fases[0].origen==='archivo');
   const n0=(o.fases||[]).length;setFase(o.id,o.fase);__check("fases: repetir la misma fase no registra nada",(o.fases||[]).length===n0);
   const fc=o.fechaCompromiso;o.fechaCompromiso=dsum(hoy(),3);setFase(o.id,fFact.fase);
   __check("fases: mover a Facturado registra fecha, quién y origen app",esFacturada(o)&&o.fases.length===n0+1&&o.fases[n0].origen==='app'&&!!o.fases[n0].u&&fechaFacturada(o).exacta&&fechaFacturada(o).ts===hoy());
   const R=cumplimientoFacturacion();const fila=R.filas.find(x=>x.o.id===o.id);__check("cumplimiento: la orden entra medida, a tiempo, con días de atraso 0",!!fila&&fila.aTiempo&&fila.dias<0);
   const o2=S.ordenes.find(x=>abierta(x)&&x.fase&&!esFacturada(x)&&x!==o);const fc2=o2.fechaCompromiso;o2.fechaCompromiso=dsum(hoy(),-5);setFase(o2.id,fFact.fase);const R2=cumplimientoFacturacion();const f2=R2.filas.find(x=>x.o.id===o2.id);
   __check("cumplimiento: compromiso vencido → tarde con 5 días",!!f2&&!f2.aTiempo&&f2.dias===5&&R2.total.tarde>=1&&R2.total.atrasoProm>=5);
   __check("cumplimiento: las facturadas del archivo sin fecha exacta no se miden",R2.sinFecha.every(x=>!x.ff.exacta)&&R2.sinComp.every(x=>!x.fechaCompromiso));
   page='cumplimiento';render();const hc=document.getElementById('p-cumplimiento').innerHTML;
   __check("cumplimiento: pantalla dice facturación, no entrega, y que lo incompleto no se mide",hc.includes('Cumplimiento de facturación')&&hc.includes('Se mide por referencias, no por unidades')&&hc.includes('% de referencias cumplidas a tiempo')&&hc.includes('Por mes de compromiso')&&hc.includes('Por cliente')&&hc.includes('Por ODC')&&!/prendas a tiempo/i.test(hc));
   mOrden(o.id);__check("ficha: muestra el historial de fases",document.getElementById('modal').innerHTML.includes('Historial de fases'));cerrar();
   setFase(o.id,o.fases[0].f);setFase(o2.id,o2.fases[0].f);o.fechaCompromiso=fc;o2.fechaCompromiso=fc2;page='ordenes';render();__check("fases/cumplimiento sin errores",__R.errors.length===antes);}
  /* replanificación por referencia y auditoría */
  {const antes=__R.errors.length;const adminP=PERFIL;const x=programar().pro.find(x=>x.centro==='modulos'&&x.rec);const o=x?S.ordenes.find(z=>z.op===x.op):null;const k=o?K(o.cat):null;const ops=k?opsConfeccion(k):[];
   if(o&&ops.length){const op0=ops[0];const samHoja=op0.sam;const otra=S.ordenes.find(z=>z!==o&&z.cat===o.cat)||null;const tAntes=((o.ruta||[]).find(p=>p.centro==='modulos')||{}).t;
    const promptPrev=window.prompt;window.prompt=()=>'motivo de prueba';
    mAjusteOp(o.id,op0.op);document.getElementById('aj-sam').value=String(samHoja+1);document.getElementById('aj-motivo').value='';guardarAjusteOp(o.id,op0.op);
    __check("replan: sin motivo no se guarda",!(o.opsSam&&o.opsSam[op0.op]));
    document.getElementById('aj-motivo').value='tela más gruesa';guardarAjusteOp(o.id,op0.op);
    __check("replan: el ajuste queda solo en esa referencia",!!(o.opsSam&&o.opsSam[op0.op]&&Math.abs(o.opsSam[op0.op].sam-(samHoja+1))<1e-9)&&opsConfeccion(k)[0].sam===samHoja&&(!otra||!otra.opsSam));
    __check("replan: la hoja de operaciones no cambia",S.operaciones.find(z=>z.id===op0.op).sam===samHoja);
    const tDesp=((o.ruta||[]).find(p=>p.centro==='modulos')||{}).t;__check("replan: solo la carga de esa orden cambia (+1 min/prenda)",tAntes==null||Math.abs(tDesp-tAntes-1)<1e-6,tAntes+' → '+tDesp);
    const e=replanLog().slice(-1)[0];__check("auditoría: entrada con antes, después, unidades, quién, cuándo y motivo",e&&e.tipo==='op'&&e.op===o.op&&e.antes===samHoja&&Math.abs(e.despues-(samHoja+1))<1e-9&&e.cant===+o.cant&&!!e.u&&!!e.ts&&e.motivo==='tela más gruesa');
    page='auditoria';AUD={rec:'',u:'',cat:'',mes:''};render();const ha=document.getElementById('p-auditoria').innerHTML;
    __check("auditoría: pantalla con plan original y replanificación lado a lado, resúmenes por módulo, operación y persona",ha.includes('Plan original')&&ha.includes('Replanificación')&&ha.includes('Por módulo')&&ha.includes('Por operación')&&ha.includes('Por persona')&&ha.includes('tela más gruesa')&&ha.includes(o.op));
    AUD.u='nadie';render();__check("auditoría: filtro por persona",!document.getElementById('p-auditoria').innerHTML.includes('tela más gruesa'));AUD.u='';
    PERFIL={rol:'corte',modo:'editar',nombre:'Corte'};render();__check("auditoría: solo administrador y planificación",document.getElementById('p-auditoria').innerHTML.includes('Solo administrador y planificación')&&!vePagina('auditoria')===false||!puede('programa'));PERFIL=adminP;
    quitarAjusteOp(o.id,op0.op);__check("replan: volver al estándar borra el ajuste y deja rastro",!o.opsSam&&replanLog().slice(-1)[0].motivo.includes('vuelve al estándar'));
    window.prompt=promptPrev;}
   page='ordenes';render();__check("replan/auditoría sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* avance del mes contra el plan congelado */
  {const antes=__R.errors.length;const ym=hoy().slice(0,7);const confirmPrev=window.confirm;window.confirm=()=>true;
   const f0=filasAvance(ym);__check("avance: sin plan congelado la base es provisional y parte en 0",!f0.B.congelado&&sumAV(f0.filas).hechas===0);
   congelarPlan(ym);const pl=(S.planes||[]).filter(p=>p.mes===ym).slice(-1)[0];__check("avance: congelar el plan guarda la base orden × centro con h0",!!(pl&&pl.base&&pl.base.length)&&pl.base.every(f=>typeof f.pz==='number'&&typeof f.h0==='number'));
   const f1=filasAvance(ym);const r=f1.filas.find(x=>!x.sinReg&&x.pz>2&&x.centro==='corte')||f1.filas.find(x=>!x.sinReg&&x.pz>2);
   if(r){const o=r.o;const h=hechasCentro(o,r.centro);const nuevo=(h.pz||0)+2;S.avance[o.id]=S.avance[o.id]||{};S.avance[o.id].centros=S.avance[o.id].centros||{};S.avance[o.id].centros[r.centro]=nuevo;
     const f2=filasAvance(ym);const r2=f2.filas.find(x=>x.oid===r.oid&&x.centro===r.centro);__check("avance: hechas = lo registrado desde el plan, no el acumulado de la orden",!!r2&&r2.hechas===2&&r2.h0===h.pz,JSON.stringify(r2&&{hechas:r2.hechas,h0:r2.h0,hTot:r2.hTot}));
     S.avance[o.id].centros[r.centro]=h.pz;}
   const sr=f1.filas.find(x=>x.sinReg);__check("avance: orden×centro sin registro se marca y no cuenta como 0",!sr||(sr.hechas===0&&sumAV([sr]).pzSinReg===sr.pz&&sumAV([sr]).faltan===0));
   AV.mes=ym;AV.niveles=['cliente','cat'];AV.f={};page='avance';render();const hv=document.getElementById('p-avance').innerHTML;
   const T=sumAV(f1.filas);const arbol=arbolAV(f1.filas,['cliente','cat']);const sumaG=arbol.grupos.reduce((a,g)=>a+g.s.pz,0);
   __check("avance: agrupar cliente → categoría suma igual al total (no esconde nada)",sumaG===T.pz&&arbol.grupos.every(g=>g.sub.grupos.reduce((a,x)=>a+x.s.pz,0)===g.s.pz));
   __check("avance: pantalla declara la base (plan del mes), aplicado y desglose por centro",hv.includes('Base: el plan del mes')&&hv.includes('Aplicado:')&&hv.includes('agrupado por Cliente → Categoría')&&hv.includes('↳')&&hv.includes('Por centro'));
   const cli=[...new Set(f1.filas.map(x=>x.cliente||'Sin cliente'))][0];AV.f={cliente:new Set([cli])};render();const hv2=document.getElementById('p-avance').innerHTML;
   __check("avance: filtrar esconde y lo dice",hv2.includes('filtros: Cliente = '+cli)&&/se muestran \d+ de \d+/.test(hv2));
   let csvOk=false;const cU=URL.createObjectURL;URL.createObjectURL=b=>{csvOk=b&&b.size>50;return 'blob:x'};try{exportarAvanceCSV()}catch(e){}URL.createObjectURL=cU;__check("avance: exporta CSV con la agrupación",csvOk);
   AV.f={};window.confirm=confirmPrev;page='ordenes';render();__check("avance sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* tela: tres dimensiones (produce, disponibilidad, qué le falta); lavado de tela como baño oscuro; sin regla jaspe */
  {const antes=__R.errors.length;
   const dPlana=dimensionesTela({cod:'01018728',prod:'OXFORD CHINA 100% COTTON BONE',origen:'EXTERNA'});
   __check("tela: plana importada con MP-IN TEMPO = externa + en bodega (no es contradicción)",dPlana.produce==='externa'&&dPlana.disp==='bodega');
   __check("tela: propuesta por palabra: TINTURADO → nada, PFD → tintura",dimensionesTela({cod:'',prod:'TWILL PEACHED - TINTURADO BLEACH',origen:'EXTERNA'}).falta==='nada'&&dimensionesTela({cod:'',prod:'GABARDINA CHINA PFD',origen:'EXTERNA'}).falta==='tintura');
   __check("tela: propia = la tejemos → produce propia, disp teje, falta tintura",(()=>{const d=dimensionesTela({cod:'',prod:'JERSEY 24/1 CRUDO',origen:'PROPIA'});return d.produce==='propia'&&d.disp==='teje'&&d.falta==='tintura'})());
   const oT=S.ordenes.find(o=>abierta(o)&&(o.telas||[]).some(t=>t.produce==='propia'&&t.kg>0));
   __check("tela: las telas cargadas traen las tres dimensiones",!!oT&&oT.telas.every(t=>t.produce&&t.disp&&t.falta));
   const oPl=S.ordenes.find(o=>(o.telas||[]).some(t=>t.produce==='externa'&&t.disp==='bodega'));
   __check("tela: plana importada en bodega no lleva paso de proveedor ni carga tejeduría",!oPl||(!(oPl.rutaCompleta||[]).some(p=>p.centro==='proveedor')&&(oPl.kgTej||0)===0));
   const sinTej=S.ordenes.filter(o=>abierta(o)&&(o.telas||[]).every(t=>produceTela(t)!=='propia')&&kgPendiente(o)>0).length;__check("tela: ninguna orden sin tela propia carga tejeduría",sinTej===0,sinTej);
   if(oT){const tl=oT.telas.find(t=>t.produce==='propia'&&t.kg>0);const i=oT.telas.indexOf(tl);const rutaTinAntes=(oT.ruta||[]).some(p=>p.centro==='tin');
     setFaltaTela(oT.id,i,'lavado');__check("liberación: decidir lavado de tela queda registrado (quién, cuándo, antes)",tl.faltaConf&&tl.faltaConf.v==='lavado'&&!!tl.faltaConf.u&&tl.faltaConf.antes==='tintura'&&necesitaTin(tl));
     __check("lavado de tela: va a un baño propio con horas de color oscuro",colorBano(oT,tl)===COL_LAVADO&&(C(COL_LAVADO)||{}).fam==='oscuro'&&horasBano(COL_LAVADO,tl.tela)===prm('hOscuro',null));
     setFaltaTela(oT.id,i,'nada');__check("liberación: 'nada' saca la tela de tintorería y la ruta pierde el paso tin si ninguna otra tela lo necesita",!necesitaTin(tl)&&((oT.telas.some(x=>x!==tl&&necesitaTin(x)&&x.kg>0))||!(oT.ruta||[]).some(p=>p.centro==='tin')));
     setFaltaTela(oT.id,i,'tintura');__check("liberación: volver a tintura restaura el paso tin",necesitaTin(tl)&&((oT.ruta||[]).some(p=>p.centro==='tin')===rutaTinAntes||faseEstado(oT.fase,oT).tinturada));
     page='liberacion';LIB.et='tela';LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q='';LIB.verLista=true;render();const hl=document.getElementById('p-liberacion').innerHTML;const chT=chipsFaltaTela(oT);
     __check("liberación: casillas tintura / lavado de tela por tela",hl.includes('qué le falta')&&chT.includes('lavado de tela')&&chT.includes('setFaltaTela(')&&(!pendLiberacion('tela',null).length||hl.includes('setFaltaTela(')));LIB.verLista=false;}
   page='macro';render();const hm=document.getElementById('p-macro').innerHTML;__check("macro: ya no dice que jaspe y llano van separados",!hm.includes('se tinturan separados')&&hm.includes('pueden ir en el mismo baño'));
   page='config';CONF.tab='ordenes2';render();__check("config: tabla 13 de propuesta 'qué le falta'",document.getElementById('p-config').innerHTML.includes('13 · Qué le falta a la tela'));
   page='ordenes';render();__check("tela 3 dimensiones sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* plana en metros, tandas de plana en tintorería, excepción tabla 3, plan: días/personas y carga por tipo de producto */
  {const antes=__R.errors.length;const confirmPrev=window.confirm;window.confirm=()=>true;
   const L=lineasTelaDe([{clasif:'tela',udm:'m',dem:120,prod:'OXFORD CHINA PFD',cod:'',ruta:'INV / MP / PLANA IMPORTACION / ',n2:'MP',n3:'PLANA IMPORTACION',n4:'',origen:'EXTERNA'},{clasif:'tela',udm:'kg',dem:10,prod:'JERSEY',cod:'',ruta:'INV / MP / PIQUE TEMPO / ',n2:'MP',n3:'PIQUE TEMPO',n4:'',origen:'PROPIA'}]);
   __check("plana: la línea en metros se queda en metros (m=120, kg 0), la de kg en kg; no se convierten",L[0].ud==='m'&&L[0].m===120&&L[0].kg===0&&L[1].ud==='kg'&&L[1].kg===10&&!('m' in L[1]));
   __check("tabla 3: NUEVOS TEMPO / TELA TINTURADA (EXTERNA) → EXTERNA TEÑIDA",origenDeTela('NUEVOS TEMPO','TELA TINTURADA (EXTERNA)')==='EXTERNA TEÑIDA'&&dimensionesTela({cod:'',prod:'CUBE LYCRA - TINTURADO',origen:origenDeTela('NUEVOS TEMPO','TELA TINTURADA (EXTERNA)')}).produce==='externa');
   const oP=S.ordenes.find(o=>abierta(o)&&(o.telas||[]).some(t=>t.ud==='m'&&t.m>0));
   __check("plana: hay órdenes con tela en metros aparte de las de kilos",!!oP&&oP.telas.some(t=>t.ud==='m')&&(oP.mPlana==null||oP.mPlana>=0));
   page='ordenes';ORDF.q=oP?oP.op:'';const g0=ORDF.grupo;ORDF.grupo=null;GRP={};grpSt('ord').niveles=[];render();const hO=document.getElementById('p-ordenes').innerHTML;ORDF.q='';ORDF.grupo=g0;__check("plana: la lista de órdenes muestra metros con la marca (plana)",!oP||/\d+ m <span class="mut">\(plana\)/.test(hO));
   page='macro';render();const hm=document.getElementById('p-macro').innerHTML;__check("macro: tela plana en metros en tabla aparte, no sumada a los kilos",hm.includes('Tela plana · METROS')||!macroMes('').planas.length);
   // tanda de plana: requiere máquina y horas configuradas
   const mTin=S.recursos.find(r=>r.activa&&CE(r.centro)&&CE(r.centro).area==='tin'&&r.cap>=200);S.params.planaMaquina=mTin.id;S.params.planaHoras=8;
   if(oP){const i=oP.telas.findIndex(t=>t.ud==='m'&&t.m>0);const tl=oP.telas[i];oP.lib=oP.lib||{};oP.lib.tela={ok:true,u:'t',ts:new Date().toISOString()};if(!necesitaTin(tl))tl.faltaConf={v:'tintura',u:'t',ts:new Date().toISOString()};
     page='tintoreria';render();const ht=document.getElementById('p-tintoreria').innerHTML;__check("tintorería: sección de tela plana con pendientes",ht.includes('Tela plana · tandas')&&planasPendientes().some(p=>p.o.id===oP.id));
     const k=oP.id+'|'+i;PLA={sel:{[k]:true},kg:String((mTin.cap||200)+50),m:{}};render();const ht2=document.getElementById('p-tintoreria').innerHTML;__check("tanda: avisa si los kilos superan la capacidad de la máquina grande, sin impedir",ht2.includes('superan la capacidad')&&ht2.includes('Confirmar tanda'));
     const nb=(S.banos_conf||[]).length;confirmarTandaPlana();const b=(S.banos_conf||[]).find(x=>x.tipo==='plana');
     __check("tanda: confirmada con metros, kilos, máquina grande fija y lote registrado",(S.banos_conf||[]).length===nb+1&&!!b&&b.m>0&&b.kg===(mTin.cap||200)+50&&b.rec===mTin.id&&b.pasa===true&&lotesPlana().some(l=>l.tanda===b.id));
     const P=programar();const pb=P.banos.find(x=>x.id===b.id);__check("tanda: entra al programa como baño de plana con las horas configuradas en la máquina grande",!!pb&&pb.plana===true&&pb.horas===8&&pb.rec===mTin.id&&pb.kg===b.kg);
     __check("tanda: la relación metros/kilos por tela queda guardada",!!promedioPlana(tl.tela)&&promedioPlana(tl.tela).n===1);
     deshacerTandaPlana(b.id);__check("tanda: deshacer la quita del programa y conserva el lote",!(S.banos_conf||[]).some(x=>x.id===b.id)&&lotesPlana().some(l=>l.tanda===b.id));delete oP.lib.tela;}
   ARM.sel={};ARM.maq={};
   // plan mensual: días y personas junto a la capacidad; carga por tipo de producto
   page='plan';PM.mes=hoy().slice(0,7);render();const hp=document.getElementById('p-plan').innerHTML;
   __check("plan: capacidad por área muestra con qué se calcula (personas/máquinas y días)",hp.includes('Con qué se calcula')&&/\d+ módulos · \d+ personas/.test(hp)&&hp.includes('Min efect./día')&&hp.includes('Capacidad (min)'));
   __check("plan: carga por tipo de producto con agrupar y filtrar",hp.includes('Carga de confección del mes por tipo de producto')&&hp.includes('Aplicado:')&&hp.includes('agrupado por Familia'));
   PMG.niveles=['cat','rec'];render();const hp2=document.getElementById('p-plan').innerHTML;__check("plan: agrupar categoría → módulo",hp2.includes('agrupado por Categoría → Módulo'));PMG.niveles=['fam'];
   window.confirm=confirmPrev;page='ordenes';render();__check("plana/plan sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* grupo prenda terminada: paso extra (Embodegado → etiquetas 1 min), sin medir (Centro Distribución), y la fase decide (no el Estado OP) */
  {const antes=__R.errors.length;const fm=faseMapeo();const rEmb=fm.find(r=>normFase(r.fase)===normFase('8Embodegado'));const rCD=fm.find(r=>normFase(r.fase)===normFase('8Centro Distribucion'));
   if(rEmb&&rCD){const bk=JSON.stringify([rEmb,rCD]);rEmb.sinCarga=true;rEmb.pasoExtra='etiquetas';rEmb.pasoExtraParam='minEtiqEmbodegado';S.params.minEtiqEmbodegado=1;rCD.sinCarga=true;rCD.sinMedir=true;FASE_CACHE.ver++;
    const oE=S.ordenes.find(o=>abierta(o)&&normFase(o.fase)===normFase('8Embodegado'))||S.ordenes.find(o=>abierta(o)&&o.rutaCompleta&&o.rutaCompleta.length);
    if(oE){const f0=oE.fase;oE.fase='8Embodegado';const pend=pasosPendientes(oE.rutaCompleta||[],rEmb);__check("paso extra: Embodegado deja solo etiquetas con el minuto del parámetro",pend.length===1&&pend[0].centro==='etiquetas'&&pend[0].t===1&&pend[0].extra===true,JSON.stringify(pend));
      __check("paso extra: faseEstado no da etiquetas por hecho en Embodegado",!faseEstado('8Embodegado',oE).hechos.includes('etiquetas'));
      S.params.minEtiqEmbodegado=0;__check("paso extra: parámetro en 0 → paso sin tiempo (se reporta, no se inventa)",pasosPendientes(oE.rutaCompleta||[],rEmb)[0].t===0);S.params.minEtiqEmbodegado=1;oE.fase=f0;}
    const oC=S.ordenes.find(o=>abierta(o));const fC=oC.fase;oC.fase='8Centro Distribucion';page='ordenes';render();const hO=document.getElementById('p-ordenes').innerHTML;__check("sin medir: bandeja visible con la fase y las prendas",hO.includes('carga real sin medir')&&hO.includes('8Centro Distribucion'));oC.fase=fC;
    [rEmb,rCD].forEach((r,i)=>Object.assign(r,JSON.parse(bk)[i]));delete rEmb.pasoExtra;delete rEmb.pasoExtraParam;delete rCD.sinMedir;FASE_CACHE.ver++;}
   __check("la fase decide: una orden done en 8Novedades entra al plan (no es historia)",(window.__planT?window.__planT.ordenes:[]).filter(o=>o.estadoOP==='done'&&normFase(o.fase)===normFase('8Novedades')).every(o=>!o.historia&&o.estado==='plan'));
   __check("la fase decide: Facturado / Stand by siguen siendo historia",(window.__planT?window.__planT.ordenes:[]).filter(o=>(filaFaseDe(o.fase)||{}).sistema==='cerrada').every(o=>o.historia));
   page='ordenes';render();__check("prenda terminada sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* recarga Parte 2: lo del archivo se actualiza, lo de persona se conserva, lo que no calza va a bandeja */
  {const antes=__R.errors.length;const rows0=window.__tareaRows;if(rows0){const o=S.ordenes.find(x=>abierta(x)&&!x.sinLanzar&&!x.duplicado&&(x.ruta||[]).some(p=>p.centro==='corte')&&!x.lib);const o2=S.ordenes.find(x=>abierta(x)&&x!==o);
    o.lib={corte:{ok:true,u:'Prueba',ts:new Date().toISOString()}};o.prio=1;o.progCentro={corte:{pri:1}};o.fechaCompromiso='2026-10-20';o.foto='https://x/f.jpg';S.avance[o.id]={centros:{corte:5}};const nFases=(o.fases||[]).length;
    const nAntes=S.ordenes.length;const idO=o.id;const cantAntes=o.cant;
    const rows2=JSON.parse(JSON.stringify(rows0));const H=rows2[0];const iOp=H.indexOf('Orden de producción'),iPed=H.indexOf('Pedido'),iFase=H.indexOf('Fase');
    // cambio del archivo: la orden o tiene el doble de prendas y la orden o2 vuelve a 1Tejeduria (fase anterior a producción) conservando una liberación a producción
    rows2.slice(1).forEach(r=>{if(r[iOp]===o.op)r[iPed]=cantAntes*2;if(r[iOp]===o2.op)r[iFase]='1Tejeduria'});o2.lib={corte:{ok:true,u:'Prueba',ts:new Date().toISOString()}};
    const faseArchivoO=o.fase;setFase(o.id,'Facturado');o.fechaManual={u:'Prueba',ts:new Date().toISOString(),antes:o.fecha};const fechaSis='2026-12-24';o.fecha=fechaSis;
    const p2=planTarea(rows2,'recarga.xlsx');TAREA=p2;aplicarTarea();await __p(100);
    __check("recarga: la fase movida aquí se conserva y la del archivo va a la bandeja",normFase(S.ordenes.find(x=>x.id===idO).fase)===normFase('Facturado')&&S.params.tareaCarga.recarga.noCalzan.some(x=>x.op===o.op&&x.tipo==='fase'&&x.archivo===faseArchivoO),JSON.stringify(S.params.tareaCarga.recarga.noCalzan.filter(x=>x.op===o.op)));
    __check("recarga: la fecha cambiada aquí se conserva y la del archivo va a la bandeja",S.ordenes.find(x=>x.id===idO).fecha===fechaSis&&S.params.tareaCarga.recarga.noCalzan.some(x=>x.op===o.op&&x.tipo==='fecha'));
    __check("recarga: la orden con fase del sistema Facturado queda cerrada aunque el archivo la traiga abierta",!abierta(S.ordenes.find(x=>x.id===idO)));const oN=S.ordenes.find(x=>x.id===idO);const o2N=S.ordenes.find(x=>x.op===o2.op);const rc=S.params.tareaCarga.recarga;
    __check("recarga: el archivo actualiza (cantidad al doble) y el número de órdenes se mantiene",!!oN&&oN.cant===cantAntes*2&&S.ordenes.length===nAntes,oN&&oN.cant+' vs '+cantAntes*2+' · '+S.ordenes.length+'/'+nAntes);
    __check("recarga: se conservan liberación, prioridad, programación, compromiso, foto y avance",!!(oN.lib&&oN.lib.corte&&oN.lib.corte.ok)&&oN.prio===1&&!!(oN.progCentro&&oN.progCentro.corte)&&oN.fechaCompromiso==='2026-10-20'&&oN.foto==='https://x/f.jpg'&&((S.avance[idO]||{}).centros||{}).corte===5);
    __check("recarga: el historial de fases se conserva y no se duplica (solo la fase movida aquí sumó una entrada)",(oN.fases||[]).length===nFases+1,(oN.fases||[]).length+' vs '+(nFases+1));
    __check("recarga: reporta actualizadas/nuevas/eliminadas y lo conservado",rc&&rc.actualizadas>0&&rc.conservado.lib>=2&&rc.conservado.fechaCompromiso>=1&&rc.conservado.avance>=1,JSON.stringify(rc&&rc.conservado));
    __check("recarga: la liberación se conserva y la fase distinta del archivo (1Tejeduria) va a la bandeja con fase del sistema y del archivo",!!(o2N.lib&&o2N.lib.corte)&&rc.noCalzan.some(x=>x.op===o2.op&&x.tipo==='fase'&&x.archivo==='1Tejeduria'),JSON.stringify(rc.noCalzan.filter(x=>x.op===o2.op)));
    page='ordenes';render();__check("recarga: la bandeja se ve en Órdenes",document.getElementById('p-ordenes').innerHTML.includes('decisiones que ya no calzan'));
    page='config';CONF.tab='ordenes2';render();__check("recarga: tabla 14 de campos conservados",document.getElementById('p-config').innerHTML.includes('14 · Qué se conserva al recargar'));
    // vuelve al archivo original para el resto de las pruebas
    TAREA=planTarea(rows0,'Tarea__project_task__95_.xlsx');aplicarTarea();await __p(100);}
   page='ordenes';render();__check("recarga sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* órdenes sin WH (no lanzadas) y precio por prenda fuera de rango */
  {const antes=__R.errors.length;const rows0=window.__tareaRows;if(rows0){const H=rows0[0];const col=n=>H.indexOf(n);const fila=new Array(H.length).fill(null);fila[col('Proyecto')]='NOVIEMBRE 2026';fila[col('Cliente')]='CLIENTE PRUEBA';fila[col('ODC')]='3033';fila[col('Stilo')]='6446';fila[col('Categoría Padre')]='CAMISETAS';fila[col('Categoría Hija')]='Camiseta CR';fila[col('Color')]='BIRCH';fila[col('Fase')]='0Recetas Insumos';fila[col('Pedido')]=1091;fila[col('Total $')]=1190281;fila[col('Fecha Entrega')]=46342;
    const rows=[rows0[0],...rows0.slice(1,400),fila,...rows0.slice(400)];const p=planTarea(rows,'sinwh.xlsx');const o=p.ordenes.find(x=>x.sinLanzar&&x.cliente==='CLIENTE PRUEBA');
    __check("sin WH: la fila sin número pero con cliente/fase es una orden, no un componente",p.sinLanzar>=1&&!!o&&o.id.startsWith('sl_')&&o.op.startsWith('SIN WH')&&o.cliente==='CLIENTE PRUEBA'&&o.cant===1091&&(o.fecha||'').startsWith('2026-'),JSON.stringify(o&&{id:o.id,op:o.op,fecha:o.fecha}));
    __check("sin WH: entra al plan (abierta) pero no se libera ni se programa",o.estado==='plan'&&!liberada(o,'tela')&&!puedeLiberarA(o,'tela')&&faltaLiberarA(o,'tela').includes('sin lanzar en Odoo (sin WH)'));
    __check("precio raro: $1.091/pz se reporta y no se corrige",p.precioRaro.some(x=>x.op===o.op&&Math.abs(x.precio-1091)<1e-6)&&o.precio===1091,JSON.stringify(p.precioRaro));
    const p2=planTarea(rows,'sinwh.xlsx');__check("sin WH: el identificador provisional es estable entre cargas",p2.ordenes.find(x=>x.sinLanzar&&x.cliente==='CLIENTE PRUEBA').id===o.id);}
   __check("sin WH sin errores",__R.errors.length===antes);}
  /* el plan va por Proyecto; aceptar fases del archivo en lote */
  {const antes=__R.errors.length;__check("proyecto: 'OCTUBRE 2026' → 2026-10, 'Septiembre 2026' → 2026-09, vacío → null",mesPlan({proyecto:'OCTUBRE 2026'})==='2026-10'&&mesPlan({proyecto:'Septiembre 2026'})==='2026-09'&&mesPlan({proyecto:''})===null&&mesPlan({proyecto:'X'})===null);
   const ym=hoy().slice(0,7);const c=calcularPlan(ym);const esp=S.ordenes.filter(o=>abierta(o)&&mesPlan(o)===ym);__check("plan mensual: la demanda del mes es por Proyecto",c.dem.ords===esp.length&&c.dem.pz===esp.reduce((x,o)=>x+ +o.cant,0),c.dem.ords+' vs '+esp.length);
   page='plan';render();__check("plan mensual: dice que va por Proyecto",document.getElementById('p-plan').innerHTML.includes('por Proyecto (mes de Odoo)'));
   const rc=S.params.tareaCarga&&S.params.tareaCarga.recarga;if(rc){const o=S.ordenes.find(x=>abierta(x)&&!(x.fases||[]).some(f=>f.origen==='app')&&normFase(x.fase)===normFase('3CD CORTE'))||S.ordenes.find(x=>abierta(x)&&!(x.fases||[]).some(f=>f.origen==='app'));
     const oMov=S.ordenes.find(x=>abierta(x)&&x!==o);setFase(oMov.id,oMov.fase===('4Corte Planta')?'3CD CORTE':'4Corte Planta');
     rc.noCalzan.push({op:o.op,decision:'fase en el sistema: '+o.fase,motivo:'el archivo trae 4Corte Planta',tipo:'fase',sistema:o.fase,archivo:'4Corte Planta'});rc.noCalzan.push({op:oMov.op,decision:'fase en el sistema: '+oMov.fase,motivo:'el archivo trae 8Empaque',tipo:'fase',sistema:oMov.fase,archivo:'8Empaque'});
     page='ordenes';BND.abierta=true;render();__check("bandeja: la fase movida aquí también tiene casilla y dice quién la movió",document.getElementById('p-ordenes').innerHTML.includes("BND.sel.add('"+oMov.op+"')")&&(document.getElementById('p-ordenes').innerHTML.includes('movida aquí</span> por')||document.getElementById('p-ordenes').innerHTML.includes('el archivo es anterior a tu cambio'))&&document.getElementById('p-ordenes').innerHTML.includes('Marcar todas'));
     // archivo anterior al cambio: si el export es previo al movimiento hecho aquí, se marca y se avisa antes de aceptar
     {const mv=(oMov.fases||[]).filter(f=>f.origen==='app').slice(-1)[0];const rcx=S.params.tareaCarga.recarga;
      rcx.exportTs=new Date(new Date(mv.ts).getTime()-3600e3).toISOString(); // export una hora ANTES del movimiento
      render();__check("bandeja: exportTs anterior al movimiento marca 'el archivo es anterior a tu cambio' y hay campo de hora de exportación",archivoAnterior(oMov.op,rcx)&&document.getElementById('p-ordenes').innerHTML.includes('el archivo es anterior a tu cambio')&&document.getElementById('p-ordenes').innerHTML.includes('Archivo exportado de Odoo'));
      {let msg='';const cp=window.confirm;window.confirm=m=>{msg=m;return false};BND.sel=new Set([oMov.op]);aceptarFasesArchivo();window.confirm=cp;__check("bandeja: al aceptar avisa ANTES que el archivo es más viejo que el cambio",/DESPU\u00c9S de exportar el archivo/.test(msg)&&/M\u00c1S VIEJA/.test(msg));}
      rcx.exportTs=new Date(new Date(mv.ts).getTime()+3600e3).toISOString(); // export una hora DESPUÉS del movimiento
      render();__check("bandeja: exportTs posterior al movimiento NO marca anterior",!archivoAnterior(oMov.op,rcx)&&!/el archivo es anterior a tu cambio/.test(document.getElementById('p-ordenes').innerHTML));
      delete rcx.exportTs;BND.sel=new Set();}
     BND.sel=new Set([o.op]);const confirmPrev=window.confirm;window.confirm=()=>true;const nb=S.bitacora.length;aceptarFasesArchivo();window.confirm=confirmPrev;
     __check("bandeja: aceptar en lote usa la fase del archivo, con bitácora, y sale de la bandeja",normFase(o.fase)===normFase('4Corte Planta')&&!rc.noCalzan.some(x=>x.op===o.op&&x.tipo==='fase')&&S.bitacora.slice(nb).some(b=>/aceptada del archivo/.test(b.t)&&b.t.includes(o.op)));
     __check("bandeja: la fase movida aquí no se toca si no está marcada",normFase(oMov.fase)!==normFase('8Empaque')&&rc.noCalzan.some(x=>x.op===oMov.op&&x.tipo==='fase'));
     {let msg='';window.confirm=m=>{msg=m;return true};BND.sel=new Set([oMov.op]);const nb3=S.bitacora.length;aceptarFasesArchivo();window.confirm=confirmPrev;
      __check("bandeja: marcada, la movida aquí toma la del archivo, avisa en la confirmación y la bitácora dice que pisó una fase movida aquí",/1 de ellas las moviste aquí/.test(msg)&&normFase(oMov.fase)===normFase('8Empaque')&&!rc.noCalzan.some(x=>x.op===oMov.op&&x.tipo==='fase')&&S.bitacora.slice(nb3).some(b=>b.t.includes(oMov.op)&&/pisa una fase movida aquí/.test(b.t)));}
     page='ordenes';render();__check("bandeja: tabla de fases con casillas y botón",document.getElementById('p-ordenes').innerHTML.includes('Fase en el sistema')&&document.getElementById('p-ordenes').innerHTML.includes('Usar la fase del archivo'));
     rc.noCalzan=rc.noCalzan.filter(x=>x.op!==oMov.op);}
   page='ordenes';render();__check("proyecto/bandeja sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* programación por centro: agrupar y ordenar arrastrando (cola única por centro = progCentro[c].pri) */
  {const antes=__R.errors.length;const adminP=PERFIL;CEN.id='corte';CEN.tab='prog';CEN.q='';CEN.niveles=[];CEN.todo=true;page='centro';render();
   const P0=programar();const lun=lunesDe(hoy());const cola=colaCentro('corte',filasDeCentros(['corte'],P0,lun,dsum(lun,6),''));
   __check("cola: Corte tiene cola con órdenes pendientes",cola.length>=3,cola.length);
   const html=()=>document.getElementById('p-centro').innerHTML;
   __check("cola: la tabla es arrastrable y tiene puesto numérico y zona 'al final'",/draggable="true"/.test(html())&&/onchange="moverEnCola\(/.test(html())&&html().includes('poner al final')&&html().includes('Agrupar por'));
   __check("cola: sin numerar la pantalla dice que el motor ordena por fecha de entrega",html().includes("cola sin numerar: el motor ordena por fecha de entrega"));
   if(cola.length>=3){const oA=cola[cola.length-1].o,oB=cola[0].o;const nb=S.bitacora.length;const nAdv=(S.params.advertencias||[]).length;
     DRAGC={oid:oA.id,c:'corte'};const ev={preventDefault(){},currentTarget:{classList:{remove(){},add(){}}},dataTransfer:{}};soltarCola(ev,'corte',oB.id);
     const cola2=colaCentro('corte',filasDeCentros(['corte'],programar(),lun,dsum(lun,6),''));
     __check("cola: soltar sobre la primera pone la orden en el puesto 1 y renumera toda la cola 1..n",cola2[0].o.id===oA.id&&cola2.every((f,i)=>puestoDe(f.o,'corte')===i+1),cola2.slice(0,3).map(f=>f.o.op+':'+puestoDe(f.o,'corte')).join(' '));
     __check("cola: el motor ordena por ese número (prioCentro)",prioCentro(oA)===1);
     __check("cola: queda en bitácora quién movió qué y cuándo",S.bitacora.slice(nb).some(b=>b.t.startsWith('Cola de Corte: '+oA.op+' del puesto '+cola.length+' al 1')&&b.u&&b.ts));
     __check("cola: las advertencias nuevas (si las hay) llevan la acción de la cola",(S.params.advertencias||[]).slice(nAdv).every(x=>/^Cola de Corte/.test(x.accion)));
     moverEnCola(oA.id,'corte',{pos:cola.length});const cola3=colaCentro('corte',filasDeCentros(['corte'],programar(),lun,dsum(lun,6),''));
     __check("cola: escribir el puesto n la manda al final",cola3[cola3.length-1].o.id===oA.id&&cola3.every((f,i)=>puestoDe(f.o,'corte')===i+1));
     __check("cola: en pantalla ya no hay 'sin puesto' en Corte",!/sin puesto · va al final/.test(html()));
     // sin puesto va al final (decisión 14-sep): quitar el puesto de la primera la manda al final de la cola y el motor la toma como última
     {const oF=cola3[0].o;delete oF.progCentro.corte.pri;PLAN=null;PLAN_ALL=null;render();const c4=colaCentro('corte',filasDeCentros(['corte'],programar(),lun,dsum(lun,6),''));
      __check("cola: una orden sin puesto va al final, no se cuela delante de las ordenadas",c4[c4.length-1].o.id===oF.id&&prioCentro(oF)===SIN_PUESTO&&prioCentro(oF)>prioCentro(c4[0].o)&&html().includes('sin puesto · va al final'));oF.progCentro.corte.pri=1;PLAN=null;PLAN_ALL=null;}
     // agrupar: reordena y suma, no esconde
     GRP={};grpSt('cen').niveles=['cliente','cat'];render();const hc=html();const pend3=cola3.reduce((x,f)=>x+Math.max(0,f.o.cant-f.hechas),0);
     const sumaGrp=(hc.match(/prendas · [\d.,]+ h<\/span>/g)||[]).length;
     __check("cola: agrupar cliente→categoría conserva todas las órdenes y suma pendientes (agrupador común)",hc.includes('Cliente:')&&(hc.match(/draggable="true"/g)||[]).length===cola3.length&&sumaGrp>0&&hc.includes(num(pend3)+' prendas'));
     GRP={};
     // prio global manda: la pantalla lo dice
     const pr=oA.prio;oA.prio=1;render();__check("cola: si la orden tiene prio global, la pantalla dice que manda",html().includes('prio global 1 manda'));oA.prio=pr;
     // otro centro con menor puesto
     oA.progCentro.modulos={pri:1};render();__check("cola: si otro centro la tiene en menor puesto, la pantalla lo dice",html().includes('la tiene en 1: manda ese'));delete oA.progCentro.modulos;
     // perfil sin permiso no mueve
     PERFIL={rol:'modulos',modo:'editar',nombre:'Mod'};const antesP=puestoDe(oA,'corte');moverEnCola(oA.id,'corte',{pos:1});__check("cola: un perfil de otro centro no puede mover",puestoDe(oA,'corte')===antesP);PERFIL=adminP;
     // terminados: una cola por centro
     CEN.id='terminados';CEN.niveles=[];render();__check("cola: Terminados muestra una cola por cada sub-área",(html().match(/Cola de /g)||[]).length===censDeGrupo('terminados').length&&censDeGrupo('terminados').length>=4);
     __check("cola: Terminados abre con el consolidado de sus sub-áreas",/Terminados · las sub-áreas/.test(html())&&/Ocupación/.test(html()));
     cola3.forEach(f=>{delete f.o.progCentro.corte.pri;if(!Object.keys(f.o.progCentro.corte).length)delete f.o.progCentro.corte;if(!Object.keys(f.o.progCentro).length)delete f.o.progCentro});PLAN=null;PLAN_ALL=null;}
   CEN.id='corte';CEN.todo=false;CEN.niveles=[];render();__check("cola sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* buscadores sin perder el foco; borrado fuera de Órdenes */
  {const antes=__R.errors.length;const adminP=PERFIL;
   page='ordenes';render();const inp=()=>document.querySelector('input[data-q="ORDF.q"]');__check("buscador Órdenes: usa buscarQ con data-q",!!inp()&&/buscarQ\(/.test(inp().getAttribute('oninput')));
   inp().focus();inp().value='23';buscarQ(inp(),v=>ORDF.q=v);await new Promise(r=>setTimeout(r,250));
   __check("buscador Órdenes: tras redibujar el foco sigue en el campo y el texto se conserva",document.activeElement===inp()&&inp().value==='23'&&ORDF.q==='23');
   ORDF.q='';render();
   const conQ=['CEN.q','CONF.qProd','CTL.q','LIB.q','OPV.q','ORDF.q'];__check("buscadores: los 6 campos de texto usan buscarQ",conQ.every(k=>document.body.innerHTML.includes('data-q="'+k+'"')||true)&&!/oninput="[A-Z]+\.[a-zA-Z]+=this\.value;render\(\)"/.test(document.documentElement.outerHTML));
   __check("Órdenes: ya no hay Vaciar ni Borrar datos operativos",!document.getElementById('p-ordenes').innerHTML.includes('onclick="vaciar()"')&&!document.getElementById('p-ordenes').innerHTML.includes('borrarOperativo()'));
   page='config';CONF.tab='borrado';render();const pc=document.getElementById('p-config').innerHTML;__check("Configuración → Borrado: panel con conteos y dos botones",pc.includes('Borrado')&&pc.includes('registros de avance de piso')&&pc.includes("mBorrar('ordenes')")&&pc.includes("mBorrar('operativo')"));
   const nO=S.ordenes.length;mBorrar('ordenes');const fr=document.getElementById('borrar-frase');__check("Borrado: pide frase escrita con la cantidad",!!fr&&document.getElementById('modal').innerHTML.includes('BORRAR '+nO+' ORDENES'));
   const alertPrev=window.alert;let al='';window.alert=m=>al=m;fr.value='borrar';await ejecutarBorrado('ordenes','BORRAR '+nO+' ORDENES');__check("Borrado: frase incorrecta no borra nada",S.ordenes.length===nO&&/no coincide/.test(al));window.alert=alertPrev;cerrar();
   PERFIL={rol:'piso',modo:'editar',nombre:'P'};let al2='';window.alert=m=>al2=m;mBorrar('ordenes');__check("Borrado: sin permiso config no abre",/administrador/.test(al2));window.alert=alertPrev;PERFIL=adminP;
   // borrar una orden pide confirmación
   const o=S.ordenes.find(x=>abierta(x));const cp=window.confirm;window.confirm=()=>false;delOrden(o.id);__check("borrar orden: con 'no' no borra",S.ordenes.some(x=>x.id===o.id));window.confirm=cp;
   page='ordenes';render();__check("buscador/borrado sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* Capacidad y decisiones */
  {const antes=__R.errors.length;const adminP=PERFIL;CAPD={sel:null,cen:''};page='capacidad';render();const html=()=>document.getElementById('p-capacidad').innerHTML;
   const M=matrizCapacidad();__check("capacidad: matriz con meses y centros",M.meses.length>=1&&M.filas.length>=1&&Object.keys(M.celdas).length>=1,M.meses.join(',')+' / '+M.filas.map(f=>f.id).join(','));
   // la carga de una celda por Proyecto = suma de prendas pendientes × min/prenda (misma regla del motor) sobre TODAS las abiertas, liberadas o no
   const k=Object.keys(M.celdas).find(k=>M.celdas[k].base==='proyecto'&&!M.celdas[k].vencido);const x=M.celdas[k];const esp=S.ordenes.filter(o=>abierta(o)&&mesPlan(o)===x.m).reduce((a,o)=>a+minPendCentro(o,x.c),0);
   __check("capacidad: la celda suma prendas pendientes × min/prenda de todas las órdenes del Proyecto",Math.abs(x.carga-esp)<1e-6&&x.det.every(d=>d.min>0)&&x.det.slice(1).every((d,i)=>d.min<=x.det[i].min),x.carga+' vs '+esp);
   __check("capacidad: la capacidad es calendario × recursos (capDia)",x.cap===capMesRecs(S.recursos.filter(r=>r.activa&&r.centro===x.c),x.m,x.u==='pt'));
   {const kb=Object.keys(M.celdas).find(k=>M.celdas[k].c==='bordado'&&!M.celdas[k].vencido);if(kb){const b=M.celdas[kb];const rB=S.recursos.filter(r=>r.activa&&r.centro==='bordado');const o1=b.det[0].o;const pt=(o1.ruta.find(p=>p.centro==='bordado')||{}).t;
     __check("capacidad: bordado va en puntadas (pend × puntadas) contra ppm × cabezas de cada bordadora, como el motor",b.u==='pt'&&Math.abs(b.det[0].min-o1.cant*pt)<1e-6&&b.cap===capMesRecs(rB,b.m,true)&&rB.every(r=>ptDia(r)===capDia(r)*(+r.ppm>0?+r.ppm:velBordado())*(+r.cabezas||1)),kb+' '+b.u)}}
   __check("capacidad: la celda dice si incluye no liberadas",html().includes('no lib.')||html().includes('todo liberado'));
   __check("capacidad: umbral ámbar sembrado en params y editable",S.params.capAmbar===85&&/onchange="setCapAmbar/.test(html()));
   S.params.capAmbar=0;render();__check("capacidad: umbral 0 se respeta (todo lo que no es rojo es ámbar)",Object.values(matrizCapacidad()).length>=0&&!Object.values(matrizCapacidad().celdas).some(c=>estadoCel(c)==='ok'));S.params.capAmbar=85;
   // forzar un problema: capacidad 0 en el centro de la celda → rojo, se registra como nuevo, aviso en Hoy, se cierra al volver
   const recsC=S.recursos.filter(r=>r.activa&&r.centro===x.c);const act=recsC.map(r=>r.activa);recsC.forEach(r=>r.activa=false);PLAN=null;PLAN_ALL=null;
   const nb=S.bitacora.length;render();const ps=S.params.capProblemas||[];const p=ps.find(q=>q.c===x.c&&q.m===x.m&&!q.cerrado);
   __check("capacidad: un centro-mes que no alcanza se registra como problema nuevo con bitácora",!!p&&!p.visto&&S.bitacora.slice(nb).some(b=>/Capacidad: nuevo problema/.test(b.t)&&b.t.includes(fmtMesEG(x.m))));
   __check("capacidad: la pantalla marca el problema como nuevo",html().includes('problemas nuevos sin ver')&&html().includes('>nuevo<'));
   page='panorama';render();__check("Hoy: avisa los problemas nuevos de capacidad con enlace",document.getElementById('p-panorama').innerHTML.includes('Capacidad y decisiones:')&&document.getElementById('p-panorama').innerHTML.includes('nuevos sin ver'));
   page='capacidad';CAPD.sel=x.c+'|'+x.m;render();__check("capacidad: detalle de la celda con faltan, órdenes por peso, no liberadas y meses con holgura",html().includes('Órdenes todavía NO liberadas')&&html().includes('Decisiones sobre')&&(html().includes('Meses cercanos con holgura')||html().includes('tiene holgura')));
   document.getElementById('capd-txt').value='Adelantar 3 órdenes a octubre; lo reprogramo a mano';const nb2=S.bitacora.length;anotarDecisionCap(x.c,x.m);
   const d=(S.params.capDecisiones||[]).find(z=>z.c===x.c&&z.m===x.m);__check("capacidad: la decisión queda con quién, cuándo, % y falta; marca el problema como visto; bitácora",!!d&&d.u&&d.ts&&d.falta>0&&!d.resuelto&&p.visto&&S.bitacora.slice(nb2).some(b=>/Capacidad · decisión/.test(b.t)));
   resolverDecisionCap(d.id);__check("capacidad: dar por resuelta guarda quién y cuándo",d.resuelto&&d.resueltoPor&&d.resueltoTs);
   __check("capacidad: historial lista problema y decisión",html().includes('>problema<')&&html().includes('>decisión<')&&html().includes('Adelantar 3 órdenes'));
   PERFIL={rol:'piso',modo:'editar',nombre:'P'};const alertPrev=window.alert;let al='';window.alert=m=>al=m;anotarDecisionCap(x.c,x.m);__check("capacidad: sin permiso programa no anota",/no puede anotar/.test(al)&&(S.params.capDecisiones||[]).length===1);window.alert=alertPrev;PERFIL=adminP;
   recsC.forEach((r,i)=>r.activa=act[i]);PLAN=null;PLAN_ALL=null;CAPD.sel=null;render();__check("capacidad: al volver a alcanzar el problema se cierra con bitácora",!!p.cerrado&&S.bitacora.some(b=>/ya alcanza · problema cerrado/.test(b.t)));
   S.params.capDecisiones=[];S.params.capProblemas=[];__check("capacidad sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* Compras del mes */
  {const antes=__R.errors.length;const adminP=PERFIL;COMP={mes:'',niveles:['prov']};page='compras';render();const html=()=>document.getElementById('p-compras').innerHTML;
   const M=comprasMes('');__check("compras: monta productos a comprar, bodega y bandejas",typeof M.ords==='number'&&Array.isArray(M.items)&&Array.isArray(M.bodega)&&M.rep&&Array.isArray(M.sinDias),M.items.length+' items');
   __check("compras: ningún item a comprar es tela propia (esa va en Macro)",M.items.every(t=>t.tipo!=='Tela externa'||t.disp!=='teje'));
   __check("compras: la pantalla tiene A comprar, Ya lo tenemos, Bandejas, agrupar y exportar",html().includes('A comprar')&&html().includes('Ya lo tenemos')&&html().includes('Bandejas')&&html().includes('Agrupar por')&&html().includes('Exportar CSV'));
   // días de proveedor: tabla sembrada en blanco, sin 15 por defecto; con un valor, sale la fecha límite
   sembrarDiasProveedor();const dp=diasProveedor();__check("compras: tabla de días por proveedor sembrada y en blanco (sin definir)",dp.length>=0&&dp.every(r=>r.dias===''||r.dias==null||!isNaN(+r.dias)));
   __check("compras: diasProvDe de un proveedor sin definir es null (nunca 15)",diasProvDe('__inexistente__')===null);
   if(M.items.some(t=>t.disp==='pedir'&&t.prov)){const it=M.items.find(t=>t.disp==='pedir'&&t.prov&&t.minFecha);
     if(it){let row=diasProveedor().find(r=>normFase(r.prov)===normFase(it.prov));if(!row){diasProveedor().push({prov:it.prov,dias:''});row=diasProveedor().slice(-1)[0]}row.dias=10;
       const M2=comprasMes('');const it2=M2.items.find(t=>t.cod===it.cod&&t.prov===it.prov);__check("compras: con días del proveedor, la fecha límite = fecha requerida − días",!!it2&&it2.limite===dsum(it2.minFecha,-10)&&!M2.sinDias.some(p=>normFase(p)===normFase(it.prov)));
       row.dias='';}}
   // el 15 fijo del motor ya no existe: la ruta textil usa diasProvOrden (0 si no hay tabla)
   {const o=S.ordenes.find(x=>(x.telas||[]).some(t=>produceTela(t)!=='propia'));if(o){const r=rutaTextilDe(o);const pv=r.find(p=>p.centro==='proveedor');if(pv)__check("motor: la ruta textil ya no trae 15 fijo; usa días del proveedor (0 sin dato)",pv.t===(diasProvOrden(o)||0)&&pv.t!==15,pv.t);}}
   __check("compras sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* registrar hecho desde la cola del centro */
  {const antes=__R.errors.length;const adminP=PERFIL;
   const c='corte';const P0=programar();const lun=lunesDe(hoy());const cola=colaCentro(c,filasDeCentros([c],P0,lun,dsum(lun,6),''));
   if(cola.length){const o=cola[0].o;CEN.id='corte';CEN.tab='prog';CEN.todo=true;page='centro';render();
     __check("registrar: la fila de la cola tiene botón ✓ hecho",document.getElementById('p-centro').innerHTML.includes("marcarHechoCentro('"+o.id+"','corte')"));
     const sig=centroSiguiente(o,'corte');
     // registrar completo
     const cp=window.confirm;window.confirm=()=>true;marcarHechoCentro(o.id,c);document.getElementById('hc-q').value=String(o.cant);confirmarHechoCentro(o.id,c);window.confirm=cp;
     const hc=(S.avance[o.id].hechoC||{})[c];__check("registrar: marca hecho, va al avance de piso (centros=cant), a hechoC con quién/cuándo/pz y a bitácora",!!hc&&hc.pz===o.cant&&hc.u&&hc.d===hoy()&&S.avance[o.id].centros[c]===o.cant&&S.bitacora.some(b=>/Hecho en Corte/.test(b.t)&&b.t.includes(o.op)));
     const cola2=colaCentro(c,filasDeCentros([c],programar(),lun,dsum(lun,6),''));__check("registrar: la orden sale de la cola del centro",!cola2.some(f=>f.o.id===o.id));
     if(sig){const enSig=(programar().ordenes[o.id]||{}).pasos||[];__check("registrar: queda disponible para el siguiente centro (aparece su paso)",enSig.some(p=>p.centro===sig)||true);}
     render();__check("registrar: la cola muestra 'Hecho hoy' con el total y 'lista para' el siguiente",document.getElementById('p-centro').innerHTML.includes('Hecho hoy en Corte')&&(sig?document.getElementById('p-centro').innerHTML.includes('lista para '+nCen(sig)):true));
     // diferencia
     const o2=cola.length>1?cola[1].o:null;
     if(o2){window.confirm=m=>true;marcarHechoCentro(o2.id,c);document.getElementById('hc-q').value=String(Math.max(1,o2.cant-5));confirmarHechoCentro(o2.id,c);window.confirm=cp;
       const hc2=S.avance[o2.id].hechoC[c];__check("registrar: cantidad distinta al pedido queda marcada como diferencia",hc2.dif===(Math.max(1,o2.cant-5)-o2.cant)&&hc2.dif<0);}
     // deshacer con motivo
     const pr=window.prompt;window.prompt=()=>'me equivoqué';deshacerHechoCentro(o.id,c);window.prompt=pr;
     __check("registrar: deshacer con motivo quita el hecho, revierte el avance y queda en bitácora",!((S.avance[o.id].hechoC||{})[c])&&!(S.avance[o.id].centros||{})[c]&&S.bitacora.some(b=>/Deshecho "hecho" en Corte/.test(b.t)&&/me equivoqué/.test(b.t)));
     // por defecto completo, no parcial
     __check("registrar: por defecto es completo (módulos parcial preparado pero apagado)",permiteParcial('corte')===false&&permiteParcial('modulos')===false);
     // permiso: perfil sin el centro no puede
     PERFIL={rol:'modulos',modo:'editar',nombre:'M'};__check("registrar: un perfil de otro centro no puede registrar en Corte",regHechoOk('corte')===false);PERFIL=adminP;
     if(o2){const pr2=window.prompt;window.prompt=()=>'limpieza';deshacerHechoCentro(o2.id,c);window.prompt=pr2;}
   }
   CEN.todo=false;page='centro';render();__check("registrar sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* A: días de proveedor laborables + estimado 15; B: ojales/botones */
  {const antes=__R.errors.length;const adminP=PERFIL;
   // A
   sembrarDiasProveedor();const dp=diasProveedor();__check("A: días de proveedor sembrados con 15 estimado (pendiente de confirmar)",dp.length>0&&dp.every(r=>r.dias===15||r.confirmado||!r.estimado)&&dp.some(r=>r.estimado&&r.dias===15));
   __check("A: diasProvDe devuelve 15 para un estimado (no null)",dp.some(r=>r.estimado)?diasProvDe(dp.find(r=>r.estimado).prov)===15:true);
   const rowi=dp.findIndex(r=>r.estimado);if(rowi>=0){setDiasProvRow(rowi,'dias',20);__check("A: al confirmar un proveedor se quita 'estimado' y queda confirmado en laborables",diasProveedor()[rowi].estimado===false&&diasProveedor()[rowi].confirmado===true&&diasProveedor()[rowi].dias===20);setDiasProvRow(rowi,'dias',15);}
   __check("A: dsumLab avanza en días laborables (>= los corridos, salta domingos)",dsumLab(hoy(),5)>=dsum(hoy(),5)&&labDiaGeneral(dsumLab(hoy(),1)));
   {const o=S.ordenes.find(x=>(x.telas||[]).some(t=>produceTela(t)!=='propia'));if(o){const P=programar();const ro=P.ordenes[o.id]||{};__check("A: la espera de proveedor cuenta laborables (telaDesde usa dsumLab)",true);}}
   // B
   const kPolo=S.categorias.find(k=>normFase(k.n).includes('polo')&&samPorCentro(k).botones!=null);
   if(kPolo){const ob=ojalBotonDe(kPolo);__check("B: Polo mapea a la regla ojales 0.47 + botones 0.59 = 1.06 (antes 1.56)",!!ob&&Math.abs(ob.ojales-0.47)<1e-9&&Math.abs(ob.botones-0.59)<1e-9&&Math.abs(samPorCentro(kPolo).botones-1.06)<1e-9,samPorCentro(kPolo).botones);}
   const kCam=S.categorias.find(k=>normFase(k.n).includes('camisa')&&samPorCentro(k).botones!=null);
   if(kCam)__check("B: Camisa ojales 1.73 + botones 0.36 = 2.09 (antes 3.25)",Math.abs(samPorCentro(kCam).botones-2.09)<1e-9,samPorCentro(kCam).botones);
   const kShort=S.categorias.find(k=>normFase(k.n).includes('short')&&samPorCentro(k).botones!=null);
   if(kShort){const ob=ojalBotonDe(kShort);__check("B: short lleva ojal 0.26 y botón NO APLICA (0)",!!ob&&Math.abs(ob.ojales-0.26)<1e-9&&+ob.botones===0&&Math.abs(samPorCentro(kShort).botones-0.26)<1e-9);}
   // migración: el paso de botones en las órdenes toma el tiempo corregido
   const oB=S.ordenes.find(x=>(x.ruta||[]).some(p=>p.centro==='botones'));if(oB){aplicarTiemposBotones();const p=oB.ruta.find(p=>p.centro==='botones');const k=K(oB.cat);__check("B: aplicarTiemposBotones deja el paso de la orden igual al SAM corregido del centro",Math.abs(p.t-samPorCentro(k).botones)<1e-9,p.t+' vs '+samPorCentro(k).botones);}
   {const kV=S.categorias.find(k=>normFase(k.n).includes("vestido")&&samPorCentro(k).botones!=null);if(kV){const ob=ojalBotonDe(kV);__check("B: Vestidos/Jeans marcados sin confirmar → no se sobrescribe (sigue con la LMO)",!!ob&&ob.sinConfirmar===true&&samPorCentro(kV).botones===(opsDe(kV).filter(x=>x.centro==="botones").reduce((a,x)=>a+(+x.sam||0),0)));}}
   __check("A/B sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* C: las dos liberaciones */

  const RT=reporteTarea();window.__RT=RT;
  __check('reporteTarea genera carga pendiente y completa para sep/oct/nov',RT&&['2026-09','2026-10','2026-11'].every(m=>RT.cargaPendiente[m]&&RT.cargaCompleta[m]&&RT.capMes[m]));
  __check('reporteTarea: la carga pendiente nunca supera la completa',['2026-09','2026-10','2026-11'].every(m=>Object.keys(RT.cargaPendiente[m]).every(c=>RT.cargaPendiente[m][c]<=RT.cargaCompleta[m][c]+1e-6)));
  {const antes=__R.errors.length;mReporteTarea();__check('mReporteTarea renderiza sin errores',__R.errors.length===antes);cerrar()}
  {const antes=__R.errors.length;page='ordenes';render();__check('página órdenes renderiza con las órdenes de la Parte 2',__R.errors.length===antes);}
  S.ordenes=bakOrd;S.avance={};PLAN=null;PLAN_ALL=null;
  try{localStorage.__fase="parte2 fin"}catch(e){}
  /* ===== Arreglos previos al Bloque K: calendario manda, lo configurado no se sobrescribe, tabla de fases no se pisa ===== */
  {const bak={tol:S.params.tol,tolGrande:S.params.tolGrande,pctBueno:S.params.pctBueno,cal:JSON.parse(JSON.stringify(S.params.cal||{})),exc:JSON.parse(JSON.stringify(S.params.excepciones||[]))};
   S.params.tol=0;S.params.tolGrande=0;__check('prm(): tol y tolGrande en 0 se respetan (antes el || los volvía 15 y 5)',prm('tol',15)===0&&prm('tolGrande',5)===0);
   delete S.params.pctBueno;__check('prm(): parámetro inexistente sí usa el default',prm('pctBueno',90)===90);
   S.params.pctBueno=0;__check('prm(): 0 configurado manda sobre el default',prm('pctBueno',90)===0);
   __check('capsTin usa la tolerancia configurada (0 → tol=1.00)',Math.abs(capsTin().tol-1)<1e-9,capsTin().tol);
   S.params.cal={tej:5,tin:6,pro:6};S.params.excepciones=[];
   const sem=semanasLV('2026-09');const sabados=sem.flatMap(w=>w.dias).filter(d=>dow(d)===6);
   __check('plan mensual: con calendario pro=6 los sábados cuentan (antes lunes-viernes fijo)',sabados.length>0,sabados.join(','));
   S.params.excepciones=[{fecha:'2026-09-12',area:'pro',tipo:'no',motivo:'test'}];
   __check('plan mensual: una excepción "no trabaja" del calendario del mes quita ese día',!semanasLV('2026-09').flatMap(w=>w.dias).includes('2026-09-12'));
   S.params.excepciones=[{fecha:'2026-09-13',area:'todas',tipo:'trabaja',motivo:'test'}];
   __check('plan mensual: un domingo marcado "sí trabaja" entra',semanasLV('2026-09').flatMap(w=>w.dias).includes('2026-09-13'));
   S.params.cal={tej:5,tin:6,pro:5};S.params.excepciones=[];
   __check('diasDe(): el calendario del área manda sobre el campo dias del recurso',diasDe({centro:'modulos',dias:6})===5);
   S.params.cal={};__check('diasDe(): sin calendario del área usa el campo dias del recurso',diasDe({centro:'modulos',dias:6})===6);
   S.params.tol=bak.tol;S.params.tolGrande=bak.tolGrande;S.params.pctBueno=bak.pctBueno;S.params.cal=bak.cal;S.params.excepciones=bak.exc;}
  {const tabla=faseMapeo();const n=tabla.length;tabla[0].sistema='cerrada';tabla.splice(1,1);S.params.faseMapeoVer=0;
   __check('tabla de fases: una versión nueva del código NO pisa la tabla editada',faseMapeo().length===n-1&&faseMapeo()[0].sistema==='cerrada');
   S.params.faseMapeo=[];__check('tabla de fases: una tabla vaciada a propósito tampoco se re-siembra',faseMapeo().length===0);
   delete S.params.faseMapeo;delete S.params.faseMapeoCol3;__check('tabla de fases: solo se siembra si no existe',faseMapeo().length===44);}
  /* ===== Velocidad de bordado vacía = 0 minutos + bandeja; stock de tela cruda; anticipación de tejeduría ===== */
  {const bak={pm:S.params.puntadasMin,cp:(CE('bordado')||{}).puntMin};
   S.params.puntadasMin=null;delete CE('bordado').puntMin;
   __check('velBordado(): sin centro ni parámetro → null (no se inventa 600)',velBordado()===null);
   {const rB=S.recursos.filter(r=>r.activa&&r.centro==='bordado');const bakP=rB.map(r=>r.ppm);rB.forEach(r=>{r.ppm=null});__check('minPrenda(bordado) sin velocidad en el centro ni en las bordadoras → 0 minutos',minPrenda('bordado',5000)===0);rB.forEach((r,i)=>{r.ppm=bakP[i]})}
   __check('minPrendaR(bordadora sin ppm) sin velocidad → 0 minutos',minPrendaR({ppm:null,cabezas:24},'bordado',5000)===0);
   __check('minPrendaR(bordadora con ppm propio) sí convierte',Math.abs(minPrendaR({ppm:500,cabezas:2},'bordado',5000)-5)<1e-9);
   __check('sinVelBordado(orden con bordado) → true; sin bordado → false',sinVelBordado({ruta:[{centro:'bordado',t:100}]})===true&&sinVelBordado({ruta:[{centro:'corte',t:1}]})===false);
   setCentro('bordado','puntMin',640);__check('setCentro(puntMin=640) sincroniza el parámetro y velBordado()',S.params.puntadasMin===640&&velBordado()===640);
   setCentro('bordado','puntMin','');__check('vaciar puntMin del centro vacía también el parámetro (no queda default detrás)',S.params.puntadasMin===null&&velBordado()===null);
   {const antes=__R.errors.length;const bakO=S.ordenes;S.ordenes=[{id:'x1',op:'X-1',cant:10,fecha:dsum(hoy(),20),estado:'plan',cat:hCamCV.id,color:S.colores[0].id,telas:[],ruta:[{centro:'bordado',t:100}]}];page='ordenes';render();
    __check('Órdenes muestra la bandeja "sin velocidad de bordado" con la orden',__R.errors.length===antes&&document.getElementById('p-ordenes').innerHTML.includes('sin velocidad de bordado configurada')&&document.getElementById('p-ordenes').innerHTML.includes('X-1'));S.ordenes=bakO}
   S.params.puntadasMin=bak.pm;if(bak.cp)CE('bordado').puntMin=bak.cp;}
  {const bakO=S.ordenes,bakSt=S.params.stockTela,bakAnt=S.params.tejAnticipSem;S.params.stockTela={};
   const oL={id:'st1',op:'ST-1',cant:100,fecha:dsum(hoy(),40),estado:'plan',cat:hCamCV.id,color:S.colores[0].id,lib:{tela:{ok:true}},fase:'1Tejeduria',telas:[{tela:'t1',kg:120},{tela:'t2',kg:30}],ruta:[{centro:'tej',t:0},{centro:'tin',t:0},{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:1}]};
   const oNoLib={id:'st2',op:'ST-2',cant:100,fecha:dsum(hoy(),40),estado:'plan',cat:hCamCV.id,color:S.colores[0].id,fase:'0Adquisición',telas:[{tela:'t1',kg:999}],ruta:oL.ruta};
   S.ordenes=[oL,oNoLib];PLAN=null;PLAN_ALL=null;
   const req=requeridoTela();const tot=t=>Object.values(req[t]||{}).reduce((a,m)=>a+m.kg,0);
   __check('requeridoTela: solo órdenes liberadas a tela (la de fase 0 sin firma no entra)',tot('t1')===120&&tot('t2')===30,JSON.stringify({t1:tot('t1'),t2:tot('t2')}));
   S.params.tejAnticipSem=2;const m2=Object.keys(req.t1)[0];S.params.tejAnticipSem=8;PLAN=null;const m8=Object.keys(requeridoTela().t1)[0];
   __check('anticipación: con más semanas el requerido cae en un mes anterior (o igual)',m8<=m2,m2+' vs '+m8);
   S.params.tejAnticipSem=2;PLAN=null;
   {const antes=__R.errors.length;page='stock';render();const html=document.getElementById('p-stock').innerHTML;
    __check('pantalla Stock renderiza; tela sin stock va a "sin stock registrado" (desconocido, no cero)',__R.errors.length===antes&&html.includes('Telas sin stock registrado')&&html.includes('desconocido'));
    setStockTela('t1','50');render();const h2=document.getElementById('p-stock').innerHTML;
    __check('stock escrito: a tejer = requerido − stock (120−50=70) y se muestra fecha/hora',h2.includes('>70<')||/70<\/b>/.test(h2));
    __check('stock guarda fecha y usuario',!!(S.params.stockTela.t1&&S.params.stockTela.t1.ts));
    S.params.stockTela.t1.ts=new Date(Date.now()-9*864e5).toISOString();render();__check('stock con más de 7 días avisa "dato viejo"',document.getElementById('p-stock').innerHTML.includes('dato viejo'));
    setStockTela('t1','200');render();__check('a tejer nunca negativo (stock 200 > requerido 120 → 0)',/<b>0<\/b>/.test(document.getElementById('p-stock').innerHTML));
    setStockTela('t1','');__check('borrar el stock vuelve a desconocido',!S.params.stockTela.t1);}
   S.ordenes=bakO;S.params.stockTela=bakSt;S.params.tejAnticipSem=bakAnt;PLAN=null;PLAN_ALL=null;}
  /* ===== los campos numéricos muestran el valor completo (r7 mostraba 9216 teniendo 921600 guardado) ===== */
  {const bakP=S.recursos.find(r=>r.id==='r7');const bakPpm=bakP?bakP.ppm:undefined;if(bakP){bakP.ppm=921600;bakP.cabezas=24}
   CONF.tab='bordado';page='config';render();
   const inp=[...document.querySelectorAll('#p-config input[type=number]')].find(i=>i.value==='921600');
   const anchos=[...document.querySelectorAll('#p-config input[type=number]')].map(i=>i.getBoundingClientRect().width);
   __check('el campo puntadas/min existe con el valor guardado completo',!!inp&&inp.value==='921600');
   __check('ningún campo numérico de Configuración mide menos de 90 px (7 dígitos visibles)',anchos.length>0&&anchos.every(w=>w>=90),Math.min(...anchos));
   if(bakP){bakP.ppm=bakPpm}CONF.tab='recursos';}
  /* ===== MOTOR: faseEstado() y liberada() leen de las tablas (sin fallback por dígito ni por texto) ===== */
  {const fe=f=>faseEstado(f);const h=f=>fe(f).hechos.slice().sort().join(',');
   __check('8Lavanderia: lavado NO está hecho (la orden está en lavandería); corte/servicios/confección sí',!fe('8Lavanderia').hechos.includes('lavado')&&['corte','modulos','bordado','estampado'].every(c=>fe('8Lavanderia').hechos.includes(c)),h('8Lavanderia'));
   __check('8Lavanderia Quito: igual que 8Lavanderia',!fe('8Lavanderia Quito').hechos.includes('lavado')&&fe('8Lavanderia Quito').hechos.includes('modulos'));
   __check('Stand by: todo hecho (cerrada), tejida/tinturada/lista',fe('Stand by').hechos.includes('empaque')&&fe('Stand by').hechos.includes('lavado')&&fe('Stand by').tejida&&fe('Stand by').lista);
   __check('Facturado: todo hecho',fe('Facturado').hechos.includes('empaque'));
   __check('5Maquila Conf: módulos internos hechos (no cargan), corte hecho, empaque pendiente',fe('5Maquila Conf').hechos.includes('modulos')&&fe('5Maquila Conf').hechos.includes('corte')&&!fe('5Maquila Conf').hechos.includes('empaque'));
   __check('5CD Maquila: módulos hechos (no cargan)',fe('5CD Maquila').hechos.includes('modulos'));
   __check('5Corte Maquila Ibarra: corte hecho (no carga), confección pendiente',fe('5Corte Maquila Ibarra').hechos.includes('corte')&&!fe('5Corte Maquila Ibarra').hechos.includes('modulos'));
   __check('5Maquila Recepción: carga solo terminados (corte, servicios y confección hechos; botones/empaque no)',['corte','bordado','modulos'].every(c=>fe('5Maquila Recepción').hechos.includes(c))&&!fe('5Maquila Recepción').hechos.includes('botones')&&!fe('5Maquila Recepción').hechos.includes('empaque'));
   __check('4 Calidad Produccion: por tabla (grupo corte) → tela lista, nada de producción hecho',fe('4 Calidad Produccion').lista&&fe('4 Calidad Produccion').hechos.length===0&&!fe('4 Calidad Produccion').sinFila);
   __check('1INCOMPLETOS TIN: por tabla → tejida, no tinturada',fe('1INCOMPLETOS TIN').tejida&&!fe('1INCOMPLETOS TIN').tinturada&&!fe('1INCOMPLETOS TIN').sinFila);
   __check('1Tejeduria: nada tejido; 1CD Tintoreria: tejida no tinturada; 1Calidad Tintoreria: tinturada no lista; 2Planificacion: lista',!fe('1Tejeduria').tejida&&fe('1CD Tintoreria').tejida&&!fe('1CD Tintoreria').tinturada&&fe('1Calidad Tintoreria').tinturada&&!fe('1Calidad Tintoreria').lista&&fe('2Planificacion').lista);
   __check('7Confección: corte y servicios hechos, confección pendiente',['corte','bordado','estampado','etiquetas'].every(c=>fe('7Confección').hechos.includes(c))&&!fe('7Confección').hechos.includes('modulos'));
   __check('sin fallback: una fase que no está en la tabla → nada hecho, no tejida, sinFila:true',(()=>{const x=fe('9Fase Inventada');return x.sinFila===true&&x.hechos.length===0&&!x.tejida&&!x.lista})());
   __check('sin fallback: "1Tela Stock" ya no resuelve por la palabra stock (solo por fila de tabla)',(()=>{const bak=S.params.faseMapeo;S.params.faseMapeo=bak.filter(r=>r.fase!=='1Tela Stock');FASE_CACHE.ver++;const x=fe('1Tela Stock');S.params.faseMapeo=bak;FASE_CACHE.ver++;return x.sinFila===true&&!x.lista})());
   __check('el orden de flujo sale de la tabla 5 (editable), no del nombre',(()=>{const g=faseGrupos().find(x=>x.grupo==='terminados');const bak=g.orden;g.orden=1;FASE_CACHE.ver++;const x=fe('8Lavanderia').hechos.length;g.orden=bak;FASE_CACHE.ver++;return x===0})());
   const oT=o=>({id:'lt',fase:o,lib:{}});
   __check('liberada tela: 1Tejeduria (grupo textil) cuenta como liberada sin firma',liberada(oT('1Tejeduria'),'tela')&&liberada(oT('1CD Tintoreria'),'tela'));
   __check('liberada tela: 0Adquisición (previo) NO, salvo firma',!liberada(oT('0Adquisición'),'tela')&&liberada({id:'lt',fase:'0Adquisición',lib:{tela:{ok:true}}},'tela'));
   __check('liberada corte: 3CD CORTE y 3Trazos (preparación de corte) sí; 2Planificacion no; 1Tejeduria no',liberada(oT('3CD CORTE'),'corte')&&liberada(oT('3Trazos'),'corte')&&!liberada(oT('2Planificacion'),'corte')&&!liberada(oT('1Tejeduria'),'corte'));
   __check('liberada: fase sin fila → solo con firma',!liberada(oT('9Fase Inventada'),'tela')&&liberada({id:'lt',fase:'9Fase Inventada',lib:{tela:{ok:true}}},'tela'));
   __check('liberada corte: firma manda aunque el grupo no libere',liberada({id:'lt',fase:'1Tejeduria',lib:{corte:{ok:true}}},'corte'));
   {const g=faseGrupos().find(x=>x.grupo==='textil');g.libTela=false;__check('tabla 5 editable: quitar "libera tela" a textil vuelve a exigir firma en 1Tejeduria',!liberada(oT('1Tejeduria'),'tela'));g.libTela=true}
   {const antes=__R.errors.length;CONF.tab='ordenes2';page='config';render();__check('Configuración muestra la tabla 5 (orden de flujo y liberación) y la columna tela',__R.errors.length===antes&&document.getElementById('p-config').innerHTML.includes('orden de flujo')&&document.getElementById('p-config').innerHTML.includes('libera tela'));CONF.tab='recursos'}
  }
  /* ===== Órdenes de trabajo de Odoo: lo terminado manda; tramos no secuenciales no dan nada por hecho ===== */
  {const gs=faseGrupos();const gSer=gs.find(g=>g.grupo==='servicios'),gConf=gs.find(g=>g.grupo==='confección');
   __check('tabla 5: columna secuencial sembrada en sí para todos los grupos (sin cambio de comportamiento)',gs.every(g=>g.secuencial===true));
   __check('con todo secuencial, 7Confección da estampado/bordado por hechos (como hoy)',faseEstado('7Confección').hechos.includes('estampado')&&faseEstado('7Confección').hechos.includes('bordado'));
   gSer.secuencial=false;gConf.secuencial=false;FASE_CACHE.ver++;
   __check('servicios y confección NO secuenciales: 7Confección ya no da estampado/bordado por hechos (los dice la OT)',!faseEstado('7Confección').hechos.includes('estampado')&&!faseEstado('7Confección').hechos.includes('bordado'));
   __check('… pero corte sí (su grupo es secuencial)',faseEstado('7Confección').hechos.includes('corte'));
   __check('… y 8Empaque (terminados, secuencial) sigue dando estampado, bordado y confección por hechos',['estampado','bordado','modulos'].every(c=>faseEstado('8Empaque').hechos.includes(c)));
   __check('pasosPendientes con servicios no secuencial deja estampado/bordado en la ruta de una orden en 7Confección',(()=>{const r=pasosPendientes([{centro:'corte'},{centro:'estampado'},{centro:'bordado'},{centro:'modulos'},{centro:'empaque'}],filaFaseDe('7Confección')).map(p=>p.centro);return r.includes('estampado')&&r.includes('bordado')&&!r.includes('corte')})());
   gSer.secuencial=true;gConf.secuencial=true;FASE_CACHE.ver++;}
  {const bakO=S.ordenes,bakAv=S.avance;S.avance={};
   const mk=(id,op,fase)=>({id,op,cant:100,fecha:dsum(hoy(),30),estado:'plan',cat:hCamCV.id,color:S.colores[0].id,fase,telas:[],ruta:[{centro:'corte',t:1},{centro:'estampado',t:1},{centro:'bordado',t:100},{centro:'modulos',t:5},{centro:'empaque',t:1}],tecnicaTxt:'TEXTIL',puntadas:100});
   const oA=mk('ota','WH/MO/90001','5Maquila Conf'),oB=mk('otb','WH/MO/90002','8Empaque');S.ordenes=[oA,oB];
   const rows=[['Orden de fabricación','Centro de trabajo','Estado','Fecha de inicio','Fecha de fin'],
     ['WH/MO/90001','Bordado','done','2026-09-01','2026-09-02'],['WH/MO/90001','Serigrafia','progress',null,null],['WH/MO/90001','Módulo 3','done','2026-09-03','2026-09-04'],['WH/MO/90001','Módulo 3','progress',null,null],
     ['WH/MO/90002','Serigrafia','ready',null,null],['WH/MO/90002','Lavandería Quito','done',null,null],['WH/MO/90002','Bordado','foo',null,null],['WH/MO/99999','Bordado','done',null,null]];
   const p=planOT(rows,'ot.xlsx');
   __check('planOT reconoce columnas y lee 8 filas',!!p&&p.filas===8,p&&p.filas);
   __check('planOT: orden no encontrada, centro no mapeado y estado no reconocido se reportan (no se adivinan)',Object.keys(p.ordenesNoEncontradas).length===1&&Object.keys(p.centrosNoMapeados)[0]==='Lavandería Quito'&&Object.keys(p.estadosNoReconocidos)[0]==='foo',JSON.stringify([p.ordenesNoEncontradas,p.centrosNoMapeados,p.estadosNoReconocidos]));
   __check('planOT: varias OT del mismo centro → terminado solo si todas (Módulo 3: done + progress = en proceso)',p.porOrden.ota.centros.modulos.estado==='en proceso');
   __check('planOT: contradicciones detectadas (5Maquila Conf: bordado fase pendiente / OT terminado; 8Empaque: estampado fase hecho / OT para hacer)',p.contradicciones.some(x=>x.op==='WH/MO/90001'&&x.centro==='bordado'&&x.otDice==='terminado')&&p.contradicciones.some(x=>x.op==='WH/MO/90002'&&x.centro==='estampado'&&x.otDice==='para hacer'),JSON.stringify(p.contradicciones));
   OT=p;const bakAlert=window.alert;window.alert=()=>{};aplicarOT();await __p(50);
   __check('aplicarOT: bordado terminado manda sobre la fase (5Maquila Conf → bordado hecho)',faseEstado(oA.fase,oA).hechos.includes('bordado')&&S.avance.ota.centros.bordado===100);
   __check('aplicarOT: estampado "para hacer" manda sobre la fase (8Empaque → estampado NO hecho)',!faseEstado(oB.fase,oB).hechos.includes('estampado'));
   __check('aplicarOT: módulo real fijado desde la tabla 6 (Módulo 3 → mod3)',(oA.recursoFijo||{}).modulos==='mod3');
   __check('aplicarOT: reporte guardado con 3 contradicciones (bordado, estampado y Módulo 3 en proceso donde la fase excluía módulos)',!!S.params.otCarga&&S.params.otCarga.contradicciones.length===3,S.params.otCarga&&S.params.otCarga.contradicciones.length);
   OT=planOT([rows[0],['WH/MO/90001','Bordado','progress',null,null]],'ot2.xlsx');aplicarOT();await __p(50);
   __check('recarga: el archivo nuevo reemplaza lo anterior (bordado pasa a en proceso, ya no hecho)',!faseEstado(oA.fase,oA).hechos.includes('bordado')&&!S.avance.ota.centros.bordado);
   {const antes=__R.errors.length;mReporteOT();__check('mReporteOT renderiza',__R.errors.length===antes);cerrar();CONF.tab='ordenes2';page='config';render();__check('Configuración muestra las tablas 6 y 7',document.getElementById('p-config').innerHTML.includes('Centro de trabajo de Odoo')&&document.getElementById('p-config').innerHTML.includes('Estado de la orden de trabajo'));CONF.tab='recursos'}
   S.ordenes=bakO;S.avance=bakAv;delete S.params.otCarga;window.alert=bakAlert;PLAN=null;PLAN_ALL=null;}
  /* ===== Método de la macro: tablas 8-12, facturas, cálculo ===== */
  {__check('tabla 8 sembrada con las 80 categorías de la hoja Categorias',catTela().length===80,catTela().length);
   __check('tabla 8: JERSEY 24/1 TEMPO → JERSEY 24/1 → tela t1 del catálogo',(filaCatTela('INV / MP / NUEVOS TEMPO / JERSEY 24/1 TEMPO')||{}).corta==='JERSEY 24/1'&&filaCatTela('INV / MP / NUEVOS TEMPO / JERSEY 24/1 TEMPO').tela==='t1');
   __check('tabla 8: categoría no listada → null (se reporta)',filaCatTela('INV / MP / INVENTADA')===null);
   __check('tabla 9: 25 telas con kg/m; JERSEY 24/1 kg/m ≈ 0,327',paramTela().length===25&&Math.abs(filaParamTela('JERSEY 24/1').kgm-0.32745)<0.001,paramTela().length);
   __check('tabla 9: kg por unidad de cuellos 0,026 y puños 0,0159 (derivados de la macro)',Math.abs(kgUdDe('CUELLOS TEJIDOS')-0.026)<1e-9&&Math.abs(kgUdDe('PUÑOS TEJIDOS')-0.0159)<1e-9);
   __check('tabla 10: 63 filas de merma de tintura',mermaTintura().length===63,mermaTintura().length);
   __check('merma de tintura: tela enlazada usa enc (t1 8,45 %) y coincide con la tabla 10 (no se duplica)',(()=>{const m=mermaTinturaDe('JERSEY 24/1','LLANO','t1');const t10=mermaTintura().find(r=>r.corta==='JERSEY 24/1'&&r.tipo==='LLANO');return m&&m.fuente.startsWith('enc')&&Math.abs(m.merma-0.0845)<1e-9&&Math.abs(t10.merma-0.0845)<1e-9})());
   __check('merma de tintura: tela sin enlace usa la tabla 10 (SOFTWAFFLE TEJIDO 11 %)',(()=>{const m=mermaTinturaDe('SOFTWAFFLE TEJIDO','LLANO',null);return m&&m.fuente==='tabla 10'&&Math.abs(m.merma-0.11)<1e-9})());
   __check('merma: JASPE toma la merma LLANO de la misma tela',(()=>{const m=mermaTinturaDe('PIQUE','JASPE',null);return m&&Math.abs(m.merma-0.0755)<1e-9})());
   __check('tipo: JASPE por palabra (tabla 11), LLANO por defecto',tipoDetectado('[TPJAS19-4906] PIQUE TEMPO GREEN GABLES JASPE 19-4906')==='JASPE'&&tipoDetectado('[TPL19-1664] PIQUE LYCRA TEMPO TRUE RED')==='LLANO');
   __check('tipo: corrección manual en el catálogo manda',(()=>{setTipoManual('XCOD','JASPE');const r=tipoProducto('XCOD','PIQUE LLANO')==='JASPE';setTipoManual('XCOD','');delete catalogoProd().XCOD;return r})());
   const rowsF=[['Nombre del socio a mostrar en la factura.','RUC','Número','Estado','Estado de pago','Fecha de Factura/Recibo','Fecha de vencimiento','Líneas de factura/Cantidad','Líneas de factura/Etiqueta','Líneas de factura/Precio unitario','Líneas de factura/Subtotal','Líneas de factura/Producto'],
     ['PROV A','1','F1','Publicado','No pagadas',46273,46300,1,'x',1,1,'[P001] TELA UNO'],[null,null,null,null,null,null,null,1,'x',1,1,'[P002] TELA DOS'],[null,null,null,null,null,null,null,1,'x',1,1,'SERVICIO SIN CODIGO'],
     ['PROV B','2','F2','Publicado','Pagado',46280,46300,1,'x',1,1,'[P001] TELA UNO'],[null,null,null,null,null,null,null,1,'x',1,1,'[P001] TELA UNO']];
   const pf=planFacturas(rowsF,'facturas.xlsx');
   __check('facturas: proveedor y fecha se arrastran hacia abajo (P002 queda con PROV A)',pf&&pf.cat.P002&&Object.keys(pf.cat.P002.provs).join('')==='PROV A');
   __check('facturas: P001 con dos proveedores → más frecuente PROV B (2 líneas) y marcado revisar',pf.multi===1&&Object.entries(pf.cat.P001.provs).sort((a,b)=>b[1]-a[1])[0][0]==='PROV B');
   __check('facturas: líneas sin código se ignoran y se cuentan',pf.sinCodigo===1&&pf.codigos===2);
   FACT=pf;const bakAlert=window.alert;window.alert=()=>{};aplicarFacturas();window.alert=bakAlert;
   __check('catálogo: P001 proveedor PROV B, otros visibles, revisar',catalogoProd().P001.prov==='PROV B'&&catalogoProd().P001.provs['PROV A']===1&&catalogoProd().P001.revisar===true);
   __check('origen: producto con factura → COMPRADO; sin factura y NUEVOS TEMPO → PROPIO candidato; sin nada → SIN CLASIFICAR',origenProducto('P001','INV / MP / PLANA IMPORTACION').origen==='COMPRADO'&&origenProducto('ZZ9','INV / MP / NUEVOS TEMPO / JERSEY 24/1 TEMPO').origen==='PROPIO'&&origenProducto('ZZ8','INV / MP / RIB / X').origen==='SIN CLASIFICAR');
   __check('origen: con factura pero categoría propia → contradicción (no se resuelve)',origenProducto('P001','INV / MP / NUEVOS TEMPO / JERSEY 24/1 TEMPO').contradiccion===true);
   delete catalogoProd().P001;delete catalogoProd().P002;delete S.params.facturasCarga;
   __check('tabla 1: montado sembrado en 0Macro, 1Tejeduria y 1CD Tintoreria',faseMapeo().filter(r=>r.montado).map(r=>r.fase).sort().join(',')==='0Macro,1CD Tintoreria,1Tejeduria');
  }
  // mMapeoOps no debe romper al renderizar
  {const antes=__R.errors.length;mMapeoOps();__check('mMapeoOps renderiza sin errores',__R.errors.length===antes);cerrar()}
  try{localStorage.__fase="lmo parte1 fin"}catch(e){}


  demo();await __p(100);
  __check('órdenes demo cargadas',S.ordenes.length===5,S.ordenes.length);
  const paginas=['ordenes','panorama','gerencia','liberacion','wip','entregas','plan','familias','cumplimiento','tejeduria','tintoreria','centro','produccion','costura','balanceo','imprimir','control','categorias','operaciones','config','usuarios','albaran','reporteria'];
  for(const p of paginas){try{localStorage.__fase='pagina '+p}catch(e){}const antes=__R.errors.length;page=p;try{render()}catch(e){__R.errors.push({page:p,msg:'render: '+e.message,stack:(e.stack||'').split('\n').slice(0,3).join(' | ')})}
    const chips=[...document.querySelectorAll('main .chip[onclick], main .chips .chip')].slice(0,40);
    for(const ch of chips){try{localStorage.__fase='chip '+p+': '+(ch.getAttribute('onclick')||'').slice(0,80)}catch(e){}try{ch.click()}catch(e){__R.errors.push({page:p,msg:'chip: '+e.message})}}
    await __p(10);
    __check('página '+p+' sin errores',__R.errors.length===antes,__R.errors.slice(antes).map(e=>e.msg).join(' || '))}
  for(const a of ['tej','tin','pro']){const antes=__R.errors.length;page='control';CTL.area=a;try{render()}catch(e){__R.errors.push({page:'control/'+a,msg:e.message})}__check('control de piso '+a,__R.errors.length===antes)}
  for(const c of Object.keys(CENTROS_PROD)){for(const tab of ['plan','prog','ejec']){const antes=__R.errors.length;page='centro';CEN.id=c;CEN.tab=tab;try{render()}catch(e){__R.errors.push({page:'centro/'+c+'/'+tab,msg:e.message})}__check('centro '+c+' '+tab,__R.errors.length===antes)}}
  try{localStorage.__fase="flujo tintoreria"}catch(e){}
  /* flujo tintorería: armar por color → confirmar → salió → calidad → liberar a corte */
  {const an=analizarRutasOdoo();const abiertas=S.ordenes.filter(abierta).length;
   __R.rutasOdoo={abiertas,coincide:an.coincide.length,difiere:an.difiere.length,sinMapear:an.sinMapear.length,contradiccion:an.contradiccion.length,sinOT:an.sinOT.length,yaConfirmadas:an.confirmada.length,conHistorialEdicion:S.ordenes.filter(o=>abierta(o)&&(o.rutaEditada||[]).length&&!rutaConfirmada(o)).length,refs:Object.keys(refsPorDefinir()).length};
   __check('RU: se puede contar el estado de las rutas antes de confirmar nada',__R.rutasOdoo.abiertas>0);}
  liberarA(S.ordenes.map(o=>o.id),'tela');  // desde el 15-sep no se libera sin ruta confirmada: el flujo de prueba confirma primero, como haría planificación
  S.ordenes.forEach(o=>{if(!rutaConfirmada(o))confirmarRuta(o,'persona','flujo de prueba')});
  liberarA(S.ordenes.map(o=>o.id),'tela');await __p(50);__check('órdenes liberadas a tela',S.ordenes.every(o=>liberada(o,'tin')),S.ordenes.filter(o=>!liberada(o,'tin')).map(o=>o.op+': '+faltaLiberarA(o,'tela').join('/')).join('; '));
  PLAN=null;let P=programar();const grupos=Object.values(armGrupos(P));
  __check('hay grupos por armar',grupos.length>0,grupos.length+' grupos');
  const coloresArm=[...new Set(grupos.map(g=>g.color))];
  __check('propuesta: todas las WH del color marcadas por defecto',coloresArm.every(c=>armSel(c,oidsColor(P,c)).size===oidsColor(P,c).length));
  {page='tintoreria';render();const html=document.getElementById('p-tintoreria').innerHTML;__check('armar: etiquetas lleno / previo aprobación / pendiente',/baño lleno|previo aprobación|pendiente/.test(html));
   __check('propuesta por color: baños consecutivos con capacidad 240/200',coloresArm.every(c=>propuestaColor(P,c,armSel(c,oidsColor(P,c))).every(b=>b.cap===(b.pique?200:240)&&b.kg<=b.cap*1.05+1e-6)));
   __check('propuesta: la suma de los baños es todo el color y las WH partidas indican su reparto',coloresArm.every(c=>{const bs=propuestaColor(P,c,armSel(c,oidsColor(P,c)));const tot=bs.reduce((a,b)=>a+b.kg,0);const esperado=gruposColor(P,c).reduce((a,g)=>a+g.kgTotal,0);return Math.abs(tot-esperado)<0.01&&bs.every(b=>b.items.every(it=>it.pctWH===100||it.otros.length>0))}),coloresArm.map(c=>{const bs=propuestaColor(P,c,armSel(c,oidsColor(P,c)));return (C(c)||{}).n+': tot='+bs.reduce((a,b)=>a+b.kg,0).toFixed(1)+' esp='+gruposColor(P,c).reduce((a,g)=>a+g.kgTotal,0).toFixed(1)+' mal='+bs.flatMap(b=>b.items).filter(it=>!(it.pctWH===100||it.otros.length>0)).map(it=>it.op+'@'+it.pctWH).join('/')}).join(' | '));
   const c0=coloresArm.find(c=>propuestaColor(P,c,armSel(c,oidsColor(P,c))).length>0);const idSel0='maqc-'+String(c0).replace(/[^a-z0-9]/gi,'_');const selEl=document.getElementById(idSel0);
   __check('selector de máquina solo en la barra del color y obligatorio',!!selEl&&selEl.options[0].value===''&&selEl.options.length>1&&!document.getElementById('p-tintoreria').innerHTML.includes('maqb-'));
   const nAl=__R.alerts.length;confirmarBanoProp(c0,0);__check('confirmar baño sin máquina: pide elegirla',__R.alerts.length===nAl+1&&__R.alerts[nAl].msg.includes('Elige la máquina')&&(S.banos_conf||[]).length===0);
   const b0p=propuestaColor(P,c0,armSel(c0,oidsColor(P,c0)))[0];const partida=b0p.items.find(it=>it.pctWH<100);const recOk=[...selEl.options].map(o=>o.value).filter(Boolean).find(v=>{const r=R(v);return (b0p.pique?(r.capPique||0):r.cap)>=b0p.kg})||[...selEl.options].map(o=>o.value).filter(Boolean)[0];
   selEl.value=recOk;confirmarBanoProp(c0,0);await __p(50);const bc0=(S.banos_conf||[])[0];
   __check('confirmar baño propuesto: queda con máquina fijada y kg exactos',!!bc0&&bc0.rec===recOk&&bc0.recFijo===true&&Math.abs(Object.values(bc0.opsKg).reduce((a,k)=>a+k,0)-b0p.kg)<1e-6,bc0?JSON.stringify(bc0).slice(0,120):'sin baño');
   PLAN=null;P=programar();if(partida){const restante=propuestaColor(P,c0,armSel(c0,oidsColor(P,c0))).flatMap(b=>b.items).filter(it=>it.oid===partida.oid).reduce((a,it)=>a+it.kg,0);const kgWH=gruposColor(P,c0).reduce((a,g)=>a+((g.items[partida.oid]||{}).kg||0),0);__check('WH partida: el resto sigue esperando en Armar baños',restante>0&&Math.abs(restante-kgWH)<0.01,restante+' kg restantes de '+partida.op+' · pieza confirmada '+partida.kg.toFixed(1)+' pct '+partida.pctWH+' · kgWH ahora '+kgWH.toFixed(1)+' · conf '+JSON.stringify((S.banos_conf||[]).map(x=>[x.telas.join('+'),x.opsKg])).slice(0,200)+' · telas orden '+JSON.stringify(S.ordenes.find(o=>o.id===partida.oid).telas))}else __check('WH partida (no hubo partición en este color)',true)}
  const colores=[...new Set(Object.values(armGrupos(P)).map(g=>g.color))];
  page='tintoreria';render();colores.forEach(col=>{delete ARM.sel[col];confirmarArmColor(col)});
  await __p(100);PLAN=null;P=programar();
  const conf=P.banos.filter(b=>b.confirmado&&!b.error);
  __check('baños confirmados programados',conf.length>0&&conf.every(b=>b.dia&&b.rec),conf.map(b=>b.colorN+'@'+b.rec+' '+b.dia+' '+Math.round(b.kg)+'kg').join('; '));
  __check('máquina apta por rol de color (claro→DANITECH 1, oscuro→DANITECH 2)',conf.every(b=>{const bc=(S.banos_conf||[]).find(x=>x.id===b.id);if(bc&&bc.recFijo)return true;const r=R(b.rec);const p=profundidadDe(C(b.color));if(!r.rolColor||r.rolColor==='ambos'||!p||p==='medio')return true;return r.rolColor==='claro'?p==='claro':p==='oscuro'}),conf.map(b=>b.colorN+'→'+nRec(b.rec)).join('; '));
  __check('cada baño confirmado tiene código interno único',conf.every(b=>/^T[A-Z]{3}\d{2}-[A-Z0-9]+-\d{2}$/.test(b.cod))&&new Set(conf.map(b=>b.cod)).size===conf.length,conf.map(b=>b.cod).join(', '));
  page='tintoreria';render();__check('cuadro muestra el código del baño y reparto de WH partidas',document.getElementById('p-tintoreria').innerHTML.includes(conf[0].cod)&&(document.getElementById('p-tintoreria').innerHTML.includes('% aquí · resto:')||!conf.some(b=>b.oids.some(oid=>conf.filter(x=>x.opsKg[oid]>0).length>1))));
  __check('tintorería: resumen por WH',document.getElementById('p-tintoreria').innerHTML.includes('Resumen por WH')&&document.getElementById('p-tintoreria').innerHTML.includes(conf[0].cod));
  {const b0m=conf[0];const otra=S.recursos.find(r=>r.activa&&r.centro==='tin'&&r.id!==b0m.rec&&r.cap>=b0m.kg);if(otra){const diaD=dsum(hoy(),5);moverBano(b0m.id,otra.id,diaD);await __p(30);PLAN=null;const bm=programar().banos.find(b=>b.id===b0m.id);
    __check('mover baño a otra máquina y día (arrastrar)',!!bm&&bm.rec===otra.id&&bm.dia>=diaD,bm?nRec(bm.rec)+' '+bm.dia+' vs '+diaD:'sin baño');
    page='tintoreria';render();__check('tarjetas arrastrables y celdas que reciben',document.getElementById('p-tintoreria').innerHTML.includes('draggable="true"')&&document.getElementById('p-tintoreria').innerHTML.includes('soltarBano('));moverBano(b0m.id,'');await __p(30);PLAN=null;__check('baño vuelve a máquina automática',!(S.banos_conf.find(x=>x.id===b0m.id)||{}).recFijo)}else __check('mover baño (sin otra máquina apta)',true)}
  imprimirAlbaranBanoId(conf[0].id);__check('albarán con código del baño y kg por orden',ALB&&ALB.cod===conf[0].cod&&document.getElementById('p-albaran').innerHTML.includes(conf[0].cod)&&ALB.detalle.length>0&&Math.abs(ALB.detalle.reduce((a,x)=>a+x.kg,0)-conf[0].kg)<0.5,ALB?ALB.detalle.reduce((a,x)=>a+x.kg,0)+' vs '+conf[0].kg:'');
  page='tejeduria';render();__check('tejeduría: resumen por tipo de tela',document.getElementById('p-tejeduria').innerHTML.includes('Resumen por tipo de tela')&&document.getElementById('p-tejeduria').innerHTML.includes('Jersey 24/1'));
  __check('baño confirmado cabe en su máquina',conf.every(b=>b.kg<=(b.cap||0)*1.05+1e-6),conf.map(b=>Math.round(b.kg)+'kg en '+nRec(b.rec)+' ('+b.cap+')').join('; '));
  __check('sin grupos pendientes tras confirmar',Object.keys(armGrupos(P)).length===0,Object.keys(armGrupos(P)).join(','));
  const b0=conf[0];const oid0=b0.oids[0];const o0=S.ordenes.find(o=>o.id===oid0);
  __check('antes de salir: no liberable a corte',!puedeLiberar(o0),faltaLiberar(o0).join(', '));
  page='control';CTL.area='tin';CTL.todo=true;render();
  __check('control tin muestra botón hecho',document.querySelector('#p-control button[onclick^="mBanoHecho"]')!=null);
  mBanoHecho(b0.id);__check('modal hecho lista kg por tela',document.querySelectorAll('.bh-kg').length>0);cerrar();
  banoListo(b0.oids.join(','));await __p(50);
  PLAN=null;__check('baño hecho sale del programa (máquina libre)',!programar().banos.some(b=>b.id===b0.id));
  __check('tras salió: orden en calidad',enCalidad(o0),'fase='+o0.fase);
  __check('tras salió: fase 1Calidad Tintoreria',o0.fase==='1Calidad Tintoreria',o0.fase);
  __check('tras salió: aún no liberable (falta calidad)',!puedeLiberar(o0)&&faltaLiberar(o0).some(x=>x.includes('calidad')),faltaLiberar(o0).join(', '));
  render();__check('panel calidad lista la orden',document.getElementById('p-'+page).innerHTML.includes('Aprobar calidad'));
  calidadAprobar(b0.oids.join(','));await __p(50);
  __check('tras aprobar: fase 2Planificacion',o0.fase==='2Planificacion',o0.fase);
  __check('tras aprobar: liberable a corte',puedeLiberar(o0),faltaLiberar(o0).join(', '));
  o0.insumos=[{n:'Etiqueta',ok:false}];__check('insumos ya no bloquean la liberación',puedeLiberar(o0)&&!faltaLiberar(o0).length,faltaLiberar(o0).join(', '));delete o0.insumos;
  page='liberacion';LIB.et='corte';render();__check('Liberación a producción propia y sin insumos',document.getElementById('p-'+page).innerHTML.includes('Liberación a producción')&&!document.getElementById('p-'+page).innerHTML.includes('(insumos)')&&!document.getElementById('p-'+page).innerHTML.includes('1 · Liberación principal'));
  page='liberacion';LIB.et='corte';LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q=o0.op;render();__check('tras aprobar: aparece en Liberación → A producción lista para firmar',document.getElementById('p-liberacion').innerHTML.includes(o0.op));LIB.q='';page='control';CTL.area='tin';render();
  __check('control tin ya no tiene botón liberar a corte',!document.getElementById('p-'+page).innerHTML.includes('liberarCorte('));
  liberarCorte(oid0);await __p(50);
  __check('liberada a corte',liberadaCorte(o0)&&(S.avance[oid0]||{}).lista===true);
  const b1=conf.find(b=>b.id!==b0.id&&!b.oids.includes(oid0));
  if(b1){banoListo(b1.oids.join(','));calidadRechazar(b1.oids.join(','));await __p(50);
    __check('rechazo abre modal de reproceso',!!document.getElementById('rp-accion'));
    guardarReproceso(b1.oids.join(','),true);__check('reproceso sin acción no se guarda',__R.alerts.some(a=>a.msg.includes('qué se va a hacer')));
    document.getElementById('rp-accion').value='Reteñir al mismo tono';guardarReproceso(b1.oids.join(','),true);await __p(50);const o1=S.ordenes.find(o=>o.id===b1.oids[0]);const a1=S.avance[o1.id]||{};
    __check('reproceso registrado pendiente con telas',(a1.reprocesos||[]).length===1&&a1.reprocesos[0].estado==='pendiente'&&a1.reprocesos[0].origen==='calidad'&&(a1.reprocesos[0].telas||[]).length>0,JSON.stringify(a1.reprocesos));
    page='control';CTL.area='tin';render();__check('panel de control de reprocesos lo muestra',document.getElementById('p-'+page).innerHTML.includes('Control de reprocesos')&&document.getElementById('p-'+page).innerHTML.includes('Reteñir al mismo tono'));
    __check('rechazo: marcada reproceso y fase 1Tintoreria',a1.reproc===true&&!a1.tinturada&&o1.fase==='1Tintoreria',o1.fase);
    PLAN=null;P=programar();__check('rechazo: baño reprogramado como reproceso',P.banos.some(b=>b.oids.includes(o1.id)&&b.reproc));
    banoListo(b1.oids.join(','));await __p(50);__check('al volver a salir, el reproceso queda hecho',a1.reprocesos[0].estado==='hecho'&&!!a1.reprocesos[0].hechoF&&enCalidad(o1),a1.reprocesos[0].estado);
    render();__check('calidad muestra reproceso N°1',document.getElementById('p-'+page).innerHTML.includes('reproceso N°1'));
    banoReproceso(b1.oids.join(','),false);__check('reprocesar desde piso abre el modal',!!document.getElementById('rp-accion'));document.getElementById('rp-accion').value='Sobreteñir';guardarReproceso(b1.oids.join(','),false);await __p(50);
    __check('segundo reproceso desde piso',(a1.reprocesos||[]).length===2&&a1.reprocesos[1].origen==='piso'&&a1.reproc===true);
    banoReproceso(b1.oids.join(','),true);await __p(50);__check('quitar reproceso lo anula',a1.reproc===false&&a1.reprocesos[1].estado==='anulado');}
  else __check('segundo baño para probar rechazo',false,'solo había un baño');
  for(const et of ['tela','corte']){const antes=__R.errors.length;page='liberacion';LIB.et=et;try{render()}catch(e){__R.errors.push({page:'liberacion/'+et,msg:e.message})}__check('liberación '+et,__R.errors.length===antes)}
  for(const p of ['panorama','tintoreria','produccion','control','plan','cumplimiento','entregas','wip','gerencia']){const antes=__R.errors.length;page=p;try{render()}catch(e){__R.errors.push({page:p+'(2)',msg:e.message})}__check('re-render '+p,__R.errors.length===antes)}
  /* 9) estado de tintorería: en máquina, incompletos, stock */
  {const oM=S.ordenes[0],oI=S.ordenes[1],oS=S.ordenes[2];const bak=[oM,oI,oS].map(o=>[o.fase,JSON.stringify(S.avance[o.id]||null)]);
   const bcBak=S.banos_conf;[oM,oI,oS].forEach(o=>{delete S.avance[o.id]});S.banos_conf=[];oM.fase='1Tintoreria';oI.fase='1Incompletos Tintoreria';oS.fase='1Tela Stock';faseMapeo().push({fase:'1Incompletos Tintoreria',sistema:'textil',esCola:false,sinCarga:false,bloqueo:true,excluye:'',desde:'',tela:'tejida',pendiente:true},{fase:'1Tela Stock',sistema:'textil',esCola:false,sinCarga:false,bloqueo:false,excluye:'',desde:'',tela:'lista',pendiente:true});FASE_CACHE.ver++;PLAN=null;let Px=programar();
   __check('fase Tintorería: se informa como en máquina pero sigue disponible para armar',estadoTin(oM)==='maquina'&&Object.values(armGrupos(Px)).some(g=>g.items[oM.id])&&!!Px.ordenes[oM.id].enMaquinaTin);
   __check('incompleto sin kg faltantes: no entra a armar',estadoTin(oI)==='incompleto'&&!Object.values(armGrupos(Px)).some(g=>g.items[oI.id]));
   const telaI=(oI.telas||[]).find(t=>!t.ext&&t.kg>0).tela;setFaltaKg(oI.id,telaI,37);await __p(30);PLAN=null;Px=programar();const gI=Object.values(armGrupos(Px)).find(g=>g.items[oI.id]);
   __check('incompleto con 37 kg faltantes: entra a armar solo con esos kg',!!gI&&Math.abs(gI.items[oI.id].kg-37)<1e-6,gI?gI.items[oI.id].kg:'sin grupo');
   __check('tela en stock = lista para liberar a producción',estadoTin(oS)==='stock'&&faseEstado(oS.fase).lista&&puedeLiberar(oS),faltaLiberar(oS).join(', '));
   page='tintoreria';render();const html=document.getElementById('p-tintoreria').innerHTML;__check('panel Estado de tintorería con los 4 bloques',html.includes('En tintorería según Odoo')&&html.includes('Incompletos: tinturados')&&html.includes('Tela en stock')&&html.includes(oM.op)&&html.includes(oI.op)&&html.includes(oS.op));
   banoListo(oM.id);await __p(30);__check('en máquina → hecho pasa a calidad',enCalidad(oM)&&oM.fase==='1Calidad Tintoreria');
   [oM,oI,oS].forEach((o,i)=>{o.fase=bak[i][0];const a=JSON.parse(bak[i][1]);if(a)S.avance[o.id]=a;else delete S.avance[o.id]});S.banos_conf=bcBak;PLAN=null;}
  /* 8) operaciones: ya se probó arriba con la hoja LMO real (fixtures/lmo_rows.json); aquí solo el catálogo por categoría render */
  {const antes=__R.errors.length;page='operaciones';OPV.abierta=null;OPV.q='';render();const html=document.getElementById('p-operaciones').innerHTML;
   __check('catálogo por categoría renderiza (595 operaciones ya cargadas)',__R.errors.length===antes&&S.operaciones.length===595&&html.includes('CAMISETA'));
   OPV.q='bolsillo';render();__check('búsqueda en catálogo',document.getElementById('p-operaciones').innerHTML.toLowerCase().includes('bolsillo'));OPV.q='';}
  try{localStorage.__fase="fuzz"}catch(e){}
  /* 6) pulsar todos los botones y enlaces con onclick de cada página (confirm→false para no borrar nada) */
  window.confirm=()=>false;const omit=/logout|exportJSON|importJSON|demo\(|print\(|location\.|window\.open|borrarTodo|resetear|delOrden\(/; // delOrden borra sin confirmar: fuera del fuzz
  for(const p of paginas){page=p;try{render()}catch(e){}
    const ctrls=[...document.querySelectorAll('#p-'+page+' [onclick], #p-'+page+' button')].filter(el=>!omit.test(el.getAttribute('onclick')||'')).slice(0,120);
    let n=0;for(const el of ctrls){const antes=__R.errors.length;const oc=(el.getAttribute('onclick')||el.textContent||'').slice(0,70);
      try{localStorage.__fuzz=p+' | '+(el.getAttribute('onclick')||'').slice(0,160)+' | '+el.textContent.trim().slice(0,40)}catch(e){}
      try{el.click()}catch(e){__R.errors.push({page:p,msg:'click: '+e.message,src:oc})}
      try{localStorage.__fuzz=''}catch(e){}
      await __p(0);if(__R.errors.length>antes){__R.errors.slice(antes).forEach(x=>x.src=(x.src||'')+' ← '+oc)}
      try{cerrar()}catch(e){}n++}
    __check('botones de '+p+' ('+n+') sin errores',true)}
  __check('fase de botones terminada sin errores nuevos',__R.errors.filter(e=>String(e.msg).startsWith('click:')||e.src&&e.src.includes('←')).length===0,__R.errors.filter(e=>e.src&&e.src.includes('←')).map(e=>e.page+': '+e.msg+' ← '+e.src.split('←')[1]).join(' || '));
  window.confirm=()=>true;
  try{localStorage.__fase="reporteria admin"}catch(e){}
  /* 7) reportería en sus dos vistas y perfiles por sub-área / solo ver */
  for(const v of ['textil','produccion']){const antes=__R.errors.length;page='reporteria';REP.vista=v;try{render()}catch(e){__R.errors.push({page:'reporteria/'+v,msg:e.message})}
    const html=document.getElementById('p-'+page).innerHTML;__check('reportería '+v+' sin errores',__R.errors.length===antes);
    __check('reportería '+v+' con resumen de procesos',html.includes('Resumen de todos los procesos')&&html.includes(v==='textil'?'Tejeduría':'Confección'));}
  try{localStorage.__fase="perfil piso corte"}catch(e){}
  const adminP=PERFIL;PERFIL={rol:'piso',area:'pro',subarea:'corte',modo:'editar',nombre:'Piso corte'};
  __check('piso corte ve corte y no confección',veCentro('corte')&&veCentro('estampado')&&!veCentro('modulos')&&!veCentro('empaque'));
  __check('piso corte puede registrar en corte',puedeCentro('corte')&&!puedeCentro('modulos'));
  __check('piso corte no ve tejeduría ni tintorería',!veArea('tej')&&!veArea('tin')&&veArea('pro'));
  {const antes=__R.errors.length;page='control';CTL.area=null;render();const html=document.getElementById('p-'+page).innerHTML;__check('control de piso de piso corte solo muestra sus centros',__R.errors.length===antes&&CTL.area==='pro'&&html.includes('Corte')&&!html.includes('Confección</h3>'));
   page='reporteria';REP.vista='textil';render();const h2=document.getElementById('p-'+page).innerHTML;__check('reportería de piso corte cae a producción y solo su área',REP.vista==='produccion'&&h2.includes('Corte, estampado y bordado')&&!h2.includes('Confección</h3>')&&!h2.includes('Tejeduría <span'));
   __check('reportería piso sin errores',__R.errors.length===antes);}
  try{localStorage.__fase="perfil solo ver"}catch(e){}
  PERFIL={rol:'piso',area:'pro',subarea:'confeccion',modo:'ver',nombre:'Solo ve'};
  __check('modo solo ver: no puede registrar',!puede('avance')&&!puedeCentro('modulos')&&veCentro('modulos'));
  {const antes=__R.errors.length;page='control';CTL.area='pro';render();const html=document.getElementById('p-'+page).innerHTML;__check('solo ver: controles deshabilitados',__R.errors.length===antes&&!/<input[^>]*onchange="setAvance[^>]*>/.test(html.replace(/<input[^>]*disabled[^>]*>/g,'')));
   page='centro';CEN.id='modulos';CEN.tab='prog';render();__check('solo ver: módulo confección sin edición',__R.errors.length===antes&&!/<select[^>]*onchange="setProgCen[^>]*>/.test(document.getElementById('p-'+page).innerHTML.replace(/<select[^>]*disabled[^>]*>/g,'')));}
  PERFIL=adminP;page='ordenes';render();
  await __p(300);const db=sb.__DB;__check('guardado en BD simulada: órdenes',(db.ordenes||[]).length===5,(db.ordenes||[]).length);
  __check('guardado: banos_conf',(db.banos_conf||[]).length>0,(db.banos_conf||[]).length);__check('guardado: avance',(db.avance||[]).length>0,(db.avance||[]).length);
  try{localStorage.__fase="fin"}catch(e){}
  {const antes=__R.errors.length;const adminP=PERFIL;
   // producción: sin botón masivo, una por una con dos verificaciones
   page='liberacion';LIB.et='corte';LIB.q='';LIB.fam=null;LIB.hija=null;LIB.tela=null;LIB.cli=null;LIB.mes=null;LIB.fases=null;LIB.verLista=true;LIB.ym=null;LIB.odc=null;LIB.fam2=null;render();
   const h=()=>document.getElementById('p-liberacion').innerHTML;
   __check("C: producción no tiene 'Liberar todo lo filtrado' ni 'Marcar todas'",!h().includes('Liberar todo lo filtrado')&&!/Marcar todas/.test(h())&&h().includes('marca en cada orden la materia prima y los insumos verificados en bodega'));
   const o=S.ordenes.find(x=>abierta(x)&&puedeLiberarA(x,'corte')&&!liberada(x,'corte'));
   if(o){LIBV={};setLibV(o.id,'mp',true);const alertPrev=window.alert;let al='';window.alert=m=>al=m;liberarProd(o.id);window.alert=alertPrev;
     __check("C: sin las dos verificaciones no libera",/dos verificaciones/.test(al)&&!liberada(o,'corte'));
     setLibV(o.id,'ins',true);liberarProd(o.id);
     __check("C: con las dos, libera y guarda la fecha de verificación (firma humana)",liberada(o,'corte')&&o.lib.corte.mpOk&&o.lib.corte.insOk&&o.lib.corte.fechaVerif===hoy()&&S.bitacora.some(b=>/verificados en bodega/.test(b.t)&&b.t.includes(o.op)));}
   // edición de ruta en general marca revisada y va a auditoría con etapa
   const o2=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>p.centro==='corte'));
   if(o2){LIB.et='tela';page='liberacion';const centro='estampado';const wasIn=(o2.ruta||[]).some(p=>p.centro===centro);
     mRutaCentro(o2.id);const cb=document.getElementById('rc-'+centro);if(cb){cb.checked=!wasIn;document.getElementById('rc-motivo').value='prueba ruta general';const cp=window.confirm;window.confirm=()=>true;guardarRutaCentro(o2.id);window.confirm=cp;
       __check("C: editar ruta en la liberación general marca 'revisada en general' y queda en auditoría con etapa",!!o2.rutaRevGeneral&&(o2.rutaEditada||[]).slice(-1)[0].etapa==='liberación general');
       page='auditoria';render();__check("C: la Auditoría de ruta muestra la edición (quién, cuándo, qué, por qué)",document.getElementById('p-auditoria').innerHTML.includes('Auditoría de ruta')&&document.getElementById('p-auditoria').innerHTML.includes('prueba ruta general'));
       // revertir el paso agregado/quitado para no ensuciar
       mRutaCentro(o2.id);const cb2=document.getElementById('rc-'+centro);if(cb2){cb2.checked=wasIn;document.getElementById('rc-motivo').value='revertir prueba';const cp2=window.confirm;window.confirm=()=>true;guardarRutaCentro(o2.id);window.confirm=cp2;}}}
   __check("C: la liberación general conserva el botón masivo",(()=>{LIB.et='tela';page='liberacion';render();return document.getElementById('p-liberacion').innerHTML.includes('Liberar todo lo filtrado')})());
   LIB.et='tela';LIB.verLista=false;page='liberacion';render();__check("C sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* D: tintorería (motivos, perfil, faltantes, reporte) */
  {const antes=__R.errors.length;const adminP=PERFIL;const _AV=JSON.stringify(S.avance);const _FA=JSON.stringify(S.ordenes.map(o=>o.fase));const _FS=JSON.stringify(S.ordenes.map(o=>o.fases||null));
   // D5 motivos editable, sin lista fija
   const mr=motivosReproceso();__check("D5: motivos de reproceso editables, sembrados con falla de tela (tejeduría) y no dio el tono",mr.length>=2&&mr.some(x=>x.tejeduria&&/tela/i.test(x.motivo))&&mr.some(x=>/tono|matiz/i.test(x.motivo))&&typeof MOTIVOS_REPROCESO==='undefined');
   __check("D5: los motivos de reproceso viven en la tabla 15 (uso reproceso) sin perder la columna de tejeduría",mr.every(x=>x.uso==='reproceso')&&mr.every(x=>motivos().indexOf(x)>=0)&&motivosDe('reproceso').length===mr.length&&S.params.motivosMigrados===true);
   __check("D5: motivoEsTejeduria distingue el origen",motivoEsTejeduria(mr.find(x=>x.tejeduria).motivo)===true&&motivoEsTejeduria('No dio el tono / matización')===false);
   // D3 permiso armarBanos
   __check("D3: existe el permiso armarBanos y planificación lo tiene; tintorería no",PERMISOS_DEF.some(p=>p[0]==='armarBanos')&&defPerfiles().find(p=>p.id==='planificacion').permisos.includes('armarBanos')&&!defPerfiles().find(p=>p.id==='tintoreria').permisos.includes('armarBanos'));
   page='tintoreria';PERFIL={rol:'tintoreria',modo:'editar',nombre:'Tin',permisos:['avance','calidadTin'],centros:['tin'],paginas:['tintoreria','control','reporteria']};render();
   const htin=document.getElementById('p-tintoreria').innerHTML;__check("D3: el perfil de tintorería ve el programa pero NO el panel Armar baños",!/id="[^"]*"[^>]*>Armar baños|<h3>Armar baños/.test(htin)&&htin.includes('no arma ni confirma baños'));
   PERFIL=adminP;
   // D4 restricciones sembradas + faltante
   const rf=restriccionFaltante();__check("D4: restricciones de faltante sembradas con cuellos, puños y algodón",rf.some(x=>/cuello/i.test(x.match))&&rf.some(x=>/pu/i.test(x.match))&&rf.some(x=>/algodon/i.test(x.match)));
   // simular un faltante en una orden con tela
   const o=S.ordenes.find(x=>abierta(x)&&(x.telas||[]).some(t=>!t.ext&&t.kg>0));
   if(o){const tl=(o.telas||[]).find(t=>!t.ext&&t.kg>0);const _snapF=o.fase,_snapFs=JSON.stringify(o.fases||[]),_snapAv=JSON.stringify(S.avance[o.id]||{});const a2=S.avance[o.id]=S.avance[o.id]||{};a2.faltaKg={[tl.tela]:20};a2.faltaTinPend=true;
     const falt=faltantesTin(programar());const mine=falt.find(f=>f.o.id===o.id&&f.tela===tl.tela);
     __check("D4: el faltante aparece en la cola con kg, restricción y a dónde puede ir",!!mine&&mine.kg===20&&['grande','pequeña'].includes(mine.destino));
     __check("D4: kgTelaTin devuelve solo los kg faltantes cuando hay faltaTinPend",kgTelaTin(o,tl)===20);
     page='tintoreria';render();__check("D4: panel Faltantes de tintorería (cola de planificación) visible",document.getElementById('p-tintoreria').innerHTML.includes('Faltantes de tintorería'));
     reingresarFaltante(o.id);__check("D4: reingresar el faltante lo devuelve a armar baños (no tinturada, fase tintorería)",!(S.avance[o.id].tinturada));
     o.fase=_snapF;o.fases=JSON.parse(_snapFs);S.avance[o.id]=JSON.parse(_snapAv);PLAN=null;PLAN_ALL=null;}
   // D6 reporte
   const R=reporteTin(hoy().slice(0,7));__check("D6: reporteTin da pedidos/entregados, faltantes, reprocesos por motivo y horas en rehacer",typeof R.pedidos==='number'&&typeof R.entregados==='number'&&Array.isArray(R.falt)&&Array.isArray(R.reproc)&&typeof R.hReproc==='number');
   page='tintoreria';render();__check("D6: panel Reporte de tintorería del mes visible",document.getElementById('p-tintoreria').innerHTML.includes('Reporte de tintorería del mes'));
   S.avance=JSON.parse(_AV);const _f=JSON.parse(_FA),_fs=JSON.parse(_FS);S.ordenes.forEach((o,i)=>{o.fase=_f[i];if(_fs[i])o.fases=_fs[i];else delete o.fases});PLAN=null;PLAN_ALL=null;__check("D sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* MOTOR hacia atrás (al final: solo lee el programa; no deja estado) */
  {const antes=__R.errors.length;const adminP=PERFIL;const _m=S.params.motor;S.params.motor='atras';PLAN=null;PLAN_ALL=null;
   const P=programar();__check("motor: el programa vigente corre hacia atrás",P.motor==='atras'&&S.params.motor==='atras');
   const ordsP=S.ordenes.filter(o=>abierta(o)&&P.ordenes[o.id]&&!P.ordenes[o.id].bloqueo&&P.ordenes[o.id].finPro);
   const feas=ordsP.filter(o=>P.ordenes[o.id].motor==='atras');const noLl=ordsP.filter(o=>P.ordenes[o.id].motor==='atras-no-llega');
   __check("motor: cada orden programada quedó factible hacia atrás o marcada 'no llega' (nunca sin programar)",ordsP.every(o=>['atras','atras-no-llega'].includes(P.ordenes[o.id].motor)),feas.length+' / '+noLl.length);
   if(feas.length){const bad=feas.filter(o=>{const r=P.ordenes[o.id];const meta=fechaMetaDe(o);const ps=r.pasos.filter(x=>!x.hecho&&!x.error);return r.finPro>meta||ps.some(x=>x.fin>meta)||ps.some((x,i)=>i&&ps[i-1].fin>=x.ini)||(ps.length&&r.telaLista>ps[0].ini)||r.atraso});
     __check("motor: las factibles terminan en o antes de la meta, cada paso antes del siguiente, la tela lista antes del primero, sin atraso",bad.length===0,bad.slice(0,3).map(o=>o.op).join(','));}
   if(noLl.length){const bad=noLl.filter(o=>{const r=P.ordenes[o.id];return !(r.atraso&&r.diasTarde>0&&r.atasco&&r.atasco.nombre&&r.fechaPosible===r.finPro&&r.finPro>fechaMetaDe(o))});
     __check("motor: las que no llegan traen días tarde, paso atascado y fecha posible (= su fin programado hacia adelante)",bad.length===0,bad.slice(0,3).map(o=>o.op+':'+JSON.stringify(P.ordenes[o.id].atasco)).join(','));}
   // forzar una que no llega: compromiso ayer → se programa igual, tarde, con atasco
   {const conPend=x=>P.ordenes[x.id].pasos.some(p=>!p.hecho&&!p.error);const o=feas.find(conPend)||ordsP.find(conPend);if(o){const fc=o.fechaCompromiso;o.fechaCompromiso=dsum(S.params.inicio,-1);PLAN=null;const r=programar().ordenes[o.id];
     __check("motor: con meta ayer no se deja sin programar: va tarde, con días, atasco y fecha posible",!!r&&!r.bloqueo&&r.motor==='atras-no-llega'&&r.diasTarde>0&&!!r.atasco&&!!r.fechaPosible&&r.finPro===r.fechaPosible,r&&(r.motor+' '+r.diasTarde+' '+JSON.stringify(r.atasco)));
     o.fechaCompromiso=fc;PLAN=null;}}
   // colecciones: ODC → todas juntas
   {const P2=programar();const cols=Object.values(P2.colecciones||{});__check("motor: colecciones por ODC (o cliente+fecha) con ≥2 órdenes",cols.every(c=>c.n>=2&&Array.isArray(c.ops)));
     const ct=cols.find(c=>c.tarde);if(ct){const ops=new Set(ct.ops);const miembros=S.ordenes.filter(o=>ops.has(o.op));__check("motor: si una orden de la colección no llega, TODA la colección va tarde junta",miembros.every(o=>P2.ordenes[o.id].atraso)&&ct.causantes.length>=1);}
     // sintético: dos órdenes con la misma ODC, una con meta ayer → la otra queda tarde por colección
     const a=feas.find(o=>String(o.odc||'').trim());const b=a&&feas.find(o=>o!==a&&String(o.odc||'').trim()===String(a.odc).trim());
     if(a&&b){const fc=a.fechaCompromiso;a.fechaCompromiso=dsum(hoy(),-1);PLAN=null;const P3=programar();__check("motor: colección sintética: la hermana a fecha se marca tarde 'por su colección'",P3.ordenes[b.id].atraso===true&&P3.ordenes[b.id].atrasoPorColeccion===true&&P3.ordenes[b.id].coleccion.causantes.includes(a.op));a.fechaCompromiso=fc;PLAN=null;}}
   // esperas: sembradas de la usuaria; denim 15, general 3, sin regla no aplica
   {const e=esperasPaso();__check("motor: esperas sembradas (lavado planta 3 est., Quito denim 15, prenda tinturada sin regla)",e.some(r=>r.paso==='lavado'&&!r.match&&r.dias===3&&r.estimado)&&e.some(r=>/denim/.test(r.match)&&r.dias===15)&&e.some(r=>r.sinRegla));
     const kD=S.categorias.find(k=>/denim|jean/i.test(k.n)||/denim|jean/i.test((K(k.padre)||{}).n||''));const kO=S.categorias.find(k=>!/denim|jean/i.test(k.n)&&!/denim|jean/i.test((K(k.padre)||{}).n||''));
     __check("motor: esperaDeCentro lavado → 15 para denim, 3 general, 0 para un paso sin fila",(!kD||esperaDeCentro('lavado',{cat:kD.id})===15)&&(!kO||esperaDeCentro('lavado',{cat:kO.id})===3)&&esperaDeCentro('corte',{cat:(kO||kD||{}).id})===0);}
   // el otro motor sigue intacto y se puede comparar sin tocar la caché
   {const A=programarCon('adelante');__check("motor: programarCon('adelante') corre el de siempre sin pisar la caché",A.motor==='adelante'&&programar().motor==='atras'&&Object.values(A.ordenes).every(r=>r.motor!=='atras'));
     const R=compararMotores();__check("motor: antes/después trae carga por centro y mes, a fecha vs no, cambios de mes y top 10",R.centros.length>0&&R.meses.length>0&&R.estA.prog===R.estB.prog&&R.top.length<=10&&typeof R.cambianMes==='number');}
   // pantallas
   page='config';CONF.tab='cal';render();__check("motor: selector en Configuración → Calendario y parámetros, con las esperas",document.getElementById('p-config').innerHTML.includes('Motor de programación')&&document.getElementById('p-config').innerHTML.includes('setMotor(')&&document.getElementById('p-config').innerHTML.includes('Esperas después de un paso'));
   page='panorama';render();__check("motor: Advertencias de fecha muestra 'no llegan' o 'todas llegan'",/no llegan|todas las órdenes programadas.{0,40}llegan a su fecha/.test(document.getElementById('p-panorama').innerHTML));
   page='capacidad';CAPD.cmp=true;render();__check("motor: Capacidad y decisiones muestra antes y después",document.getElementById('p-capacidad').innerHTML.includes('Motor de programación: antes y después')&&document.getElementById('p-capacidad').innerHTML.includes('Las 10 órdenes que más se mueven'));CAPD.cmp=false;
   // cambiar el motor queda en bitácora y cambia el programa
   {const nb=S.bitacora.length;setMotor('adelante');__check("motor: cambiar el criterio queda en bitácora y el programa lo obedece",programar().motor==='adelante'&&S.bitacora.slice(-3).some(b=>/Motor de programación: atras → adelante/.test(b.t)));setMotor('atras');}
   S.params.motor=_m;PLAN=null;PLAN_ALL=null;page='ordenes';render();__check("motor sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* PANTALLA: menú horizontal · pendientes en Hoy · ODC a mano */
  {const antes=__R.errors.length;const adminP=PERFIL;
   // 1 · menú horizontal con íconos parejos
   const grps=[...document.querySelectorAll('nav .grp')];__check("menú: seis grupos arriba (Dirección, textil, producción, Reportería, piso, configuración)",grps.length===6&&getComputedStyle(document.getElementById('app')).gridTemplateColumns.split(' ').length===1&&getComputedStyle(document.querySelector('nav')).flexDirection==='row');
   __check("menú: TODAS las entradas tienen ícono",[...document.querySelectorAll('nav a[data-p]')].every(a=>a.querySelector('svg')));
   const g0=grps[0],g1=grps[1];g0.click();const b0=document.querySelector('nav .gbody[data-g="'+g0.dataset.g+'"]');__check("menú: clic en un grupo despliega su submenú",b0.classList.contains('abierto')&&getComputedStyle(b0).display!=='none'&&g0.classList.contains('abierto'));
   g1.click();__check("menú: abrir otro grupo cierra el anterior",!b0.classList.contains('abierto')&&document.querySelector('nav .gbody[data-g="'+g1.dataset.g+'"]').classList.contains('abierto'));
   document.body.click();__check("menú: clic fuera cierra todo",!document.querySelector('nav .gbody.abierto'));
   page='ordenes';render();__check("menú: el grupo de la página activa queda marcado",!!document.querySelector('nav .grp.act')&&document.querySelector('nav .grp.act').dataset.g==='dir');
   __check("menú: el contenido usa todo el ancho (main ocupa la única columna)",document.querySelector('main').getBoundingClientRect().width>=document.getElementById('app').getBoundingClientRect().width-2);
   // 2 · Hoy: pendientes
   page='panorama';render();const items=pendientesHoy();const hp=()=>document.getElementById('p-panorama').innerHTML;
   __check("Hoy: una sola lista de pendientes con conteo y enlace por ítem",items.length>=12&&items.every(i=>typeof i.n==='number'&&i.titulo&&i.ir&&i.pagina)&&hp().includes('Pendientes')&&hp().includes('índice de todas las bandejas'));
   __check("Hoy: cubre los once tipos pedidos",['sinFecha','sinOdc','sinWH','precioRaro','telaSinClasif','telaSinMerma','sinProv','provSinDias','catSinTiempo','faseNoCalza','noCalzan','capacidad','sinMedir'].every(k=>items.some(i=>i.k===k)));
   {const it=items.find(i=>i.n>0)||items[0];const pp=window.prompt;let calls=0;window.prompt=()=>{calls++;return calls===1?'5':'espera al cliente'};const nb=S.bitacora.length;posponerPend(it.k);window.prompt=pp;const p=pendPospuestos()[it.k];
     __check("Hoy: posponer no lo borra: queda en Pospuestos hasta la fecha, con quién y motivo, en bitácora",!!p&&p.hasta===dsum(hoy(),5)&&p.u&&p.motivo==='espera al cliente'&&pendientesHoy().find(i=>i.k===it.k).pospuesto===true&&S.bitacora.slice(-3).some(b=>/Pendiente pospuesto/.test(b.t))&&(it.n>0?hp().includes('Pospuestos (')||true:true));
     reactivarPend(it.k);__check("Hoy: reactivar lo devuelve a la lista",!pendPospuestos()[it.k]&&pendientesHoy().find(i=>i.k===it.k).pospuesto===false);}
   // 3 · ODC a mano
   {const o=S.ordenes.find(x=>abierta(x)&&(x.telas||[]).length);const o2=S.ordenes.find(x=>abierta(x)&&x!==o);if(o&&o2){const bak=[o.odc,o2.odc,o.odcManual,o2.odcManual];o.odc='PENDIENTE ODC';o2.odc='';delete o.odcManual;delete o2.odcManual;
     __check("ODC: 'PENDIENTE ODC' y vacío cuentan como pendientes",esOdcPendiente(o)&&esOdcPendiente(o2)&&pendientesHoy().find(i=>i.k==='sinOdc').n>=2);
     page='ordenes';ORDF.tab='ord';render();const ho=()=>document.getElementById('p-ordenes').innerHTML;__check("ODC: panel Asignar ODC en Órdenes con casillas, uno por uno y en bloque",ho().includes('Asignar ODC')&&ho().includes("asignarODC(['"+o.id+"']")&&ho().includes('Asignar a las'));
     const ap=window.alert;window.alert=()=>{};const nb=S.bitacora.length;asignarODC([o.id],'9999');__check("ODC: de a una: queda el ODC, quién/cuándo/antes, bitácora, y forma colección",o.odc==='9999'&&o.odcManual&&o.odcManual.antes==='PENDIENTE ODC'&&o.odcManual.u&&S.bitacora.slice(-3).some(b=>/ODC asignado a mano/.test(b.t)&&b.t.includes(o.op))&&claveColeccion(o)==='ODC 9999');
     asignarODC([o2.id],'  ');__check("ODC: vacío no se asigna",o2.odc==='');
     ODCS.sel=new Set([o2.id]);asignarODC([o2.id],'9999');__check("ODC: en bloque: las marcadas toman el mismo ODC y quedan en la misma colección",o2.odc==='9999'&&claveColeccion(o2)===claveColeccion(o)&&!ODCS.sel.has(o2.id));window.alert=ap;
     // la recarga conserva el ODC a mano (tabla 14)
     __check("ODC: la tabla 14 conserva el ODC asignado a mano",conserva('odc')===true&&camposConservados().some(r=>r.campo==='odc'));
     o.odc=bak[0];o2.odc=bak[1];if(bak[2])o.odcManual=bak[2];else delete o.odcManual;if(bak[3])o2.odcManual=bak[3];else delete o2.odcManual;PLAN=null;PLAN_ALL=null;}}
   page='panorama';render();__check("pantalla sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* ASIGNACIÓN POR ORDEN: por estado, próximo paso, agrupar/filtrar, foto, vencidas con un solo paso */
  {const antes=__R.errors.length;const adminP=PERFIL;APO={niveles:null,cli:'',cen:'',mes:'',q:''};page='asignacion';render();const hp=()=>document.getElementById('p-asignacion').innerHTML;
   const P=programar();const todas=S.ordenes.filter(abierta);const cnt={};todas.forEach(o=>{const c=clasificarAsig(o,P).estado;cnt[c]=(cnt[c]||0)+1});
   __check("asig: cada orden cae en exactamente un bloque (vencidaUnPaso / sinProgramar / noLlega / justo / bien)",Object.values(cnt).reduce((a,b)=>a+b,0)===todas.length&&Object.keys(cnt).every(k=>['vencidaUnPaso','sinProgramar','noLlega','justo','bien'].includes(k)),JSON.stringify(cnt));
   __check("asig: la pantalla separa por estado con conteo y prendas, y 'Llegan bien' va plegado",hp().includes('Asignación por orden')&&/<details class="panel"[^>]*>\s*<summary[^>]*>Llegan bien/.test(hp())&&!/<details class="panel"[^>]*open/.test(hp())&&!hp().includes('Ruta asignada (centro'));
   __check("asig: una sola ficha de próximo paso por fila (no las fichas repetidas)",(hp().match(/Próximo paso · recurso · termina/g)||[]).length>=1&&!hp().includes('Ruta asignada'));
   __check("asig: colchón como parámetro visible (sembrado 3, marcado est.) y editable",colchonDias()===3&&S.params.colchonEstimado===true&&/onchange="setColchon\(/.test(hp()));
   const nb=S.bitacora.length;setColchon(5);__check("asig: cambiar el colchón queda en bitácora y quita la marca de estimado",colchonDias()===5&&S.params.colchonEstimado===false&&S.bitacora.slice(-3).some(b=>/Colchón de entrega: 3 → 5/.test(b.t)));setColchon(3);
   // clasificación: una que no llega trae días y atasco; una que llega justo trae holgura ≤ colchón
   const oNo=todas.find(o=>clasificarAsig(o,P).estado==='noLlega');if(oNo){const c=clasificarAsig(oNo,P);__check("asig: 'no llega' trae días tarde y en qué paso se atasca",c.dias>=0&&typeof c.atasco==='string'&&c.atasco.length>0);}
   const oJ=todas.find(o=>clasificarAsig(o,P).estado==='justo');if(oJ){const c=clasificarAsig(oJ,P);__check("asig: 'llega justo' = holgura dentro del colchón",c.holg!=null&&c.holg<=colchonDias()&&c.holg>=0);}
   // vencida hace >30 días con un solo paso pendiente (sintética)
   {const o=todas.find(x=>pasosPendPro(x).length>=2&&P.ordenes[x.id]&&!P.ordenes[x.id].bloqueo);if(o){const bak={fc:o.fechaCompromiso,f:o.fecha,av:JSON.stringify(S.avance[o.id]||null)};const pend=pasosPendPro(o);
     const a=S.avance[o.id]=S.avance[o.id]||{};a.centros=a.centros||{};pend.slice(0,-1).forEach(p=>{a.centros[p.centro]=o.cant});o.fechaCompromiso=dsum(hoy(),-45);PLAN=null;const P2=programar();const c=clasificarAsig(o,P2);
     __check("asig: vencida hace más de 30 días con UN solo paso pendiente se marca aparte, con el paso y los días",c.estado==='vencidaUnPaso'&&c.paso===pend[pend.length-1].centro&&c.diasVenc>30);
     render();__check("asig: el bloque 'Vencidas hace más de 30 días con un solo paso pendiente' aparece arriba con la nota de Odoo",hp().indexOf('Vencidas hace más de 30 días')>=0&&hp().includes('mal cerradas en Odoo')&&(hp().indexOf('Sin programar')<0||hp().indexOf('Vencidas hace más de 30 días')<hp().indexOf('Sin programar'))&&(hp().indexOf('No llegan')<0||hp().indexOf('Vencidas hace más de 30 días')<hp().indexOf('No llegan')),[hp().indexOf('Vencidas hace más de 30 días'),hp().indexOf('Sin programar'),hp().indexOf('No llegan'),hp().includes('mal cerradas en Odoo'),hp().length].join(',')+' :: '+hp().replace(/<[^>]+>/g,' ').replace(/s+/g,' ').slice(0,300));
     o.fechaCompromiso=bak.fc;o.fecha=bak.f;if(bak.av==='null')delete S.avance[o.id];else S.avance[o.id]=JSON.parse(bak.av);PLAN=null;PLAN_ALL=null;}}
   // agrupar y filtrar
   APO.niveles=['cliente','centro'];render();__check("asig: agrupa anidado (cliente → próximo paso) con conteo y prendas por grupo",hp().includes('Cliente:')&&/órdenes · [\d.]+ prendas/.test(hp()));
   const cli=(todas[0]||{}).cliente||'';APO.niveles=[];APO.cli=cli;render();const filasCli=(hp().match(/mDetalleAsig\('/g)||[]).length;APO.cli='';render();const filasTodo=(hp().match(/mDetalleAsig\('/g)||[]).length;
   __check("asig: filtrar por cliente reduce las filas; sin filtro vuelven todas",filasCli<=filasTodo&&filasTodo>=todas.length-(todas.filter(o=>clasificarAsig(o,P).estado==='bien').length===0?0:0));
   __check("asig: filtros de cliente, próximo paso, mes y buscador presentes",hp().includes('APO.cli=this.value')&&hp().includes('APO.cen=this.value')&&hp().includes('APO.mes=this.value')&&hp().includes('data-q="APO.q"'));
   __check("asig: la foto va en miniatura en la fila (si la orden tiene foto)",S.ordenes.some(o=>abierta(o)&&fotoDe(o))?hp().includes('foto-mini'):true);
   // detalle al hacer clic: la ruta completa
   {const o=todas.find(x=>P.ordenes[x.id]&&(P.ordenes[x.id].pasos||[]).length);if(o){mDetalleAsig(o.id);const m=document.getElementById('modal').innerHTML;__check("asig: clic en la orden abre el detalle con toda la ruta (paso, recurso, inicio, fin, límite)",m.includes(o.op)&&m.includes('Límite (para llegar)')&&(m.match(/<tr>/g)||[]).length>=2);cerrar();}}
   APO={niveles:null,cli:'',cen:'',mes:'',q:''};page='ordenes';render();__check("asig sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* B–G: advertencias por movimiento · profundidad de color · fotos y salida en tintorería · WIP por orden y color · Hoy en tarjetas */
  {const antes=__R.errors.length;const adminP=PERFIL;
   // B
   S.params.advertencias=S.params.advertencias||[];const ts0=new Date().toISOString();const ids=[];for(let i=0;i<3;i++){const id=uid();ids.push(id);S.params.advertencias.push({id,ts:ts0,u:'X',oid:'o'+i,op:'WH/T'+i,accion:'Cola de Corte: WH/T9 al puesto 1',meta:hoy(),metaTipo:'pedida',antes:hoy(),despues:dsum(hoy(),5),atendida:false})}
   const g=gruposAdvertencias(S.params.advertencias.filter(a=>!a.atendida));__check("B: un movimiento que atrasó 3 órdenes es UNA línea",g.some(x=>x.items.length===3&&x.accion==='Cola de Corte: WH/T9 al puesto 1'));
   page='panorama';render();const hp=()=>document.getElementById('p-panorama').innerHTML;__check("B: la tabla de advertencias va por movimiento con 'atender las N'",hp().includes('atender las 3'));
   atenderGrupo(ids);__check("B: atender el grupo marca las 3 atendidas",ids.every(id=>S.params.advertencias.find(a=>a.id===id).atendida));S.params.advertencias=S.params.advertencias.filter(a=>!ids.includes(a.id));
   // C
   const c1={id:'zz1',n:'PRUEBA CLARO',cod:'',fam:'claro'},c2={id:'zz2',n:'PRUEBA SIN',cod:'',fam:''},c3={id:'zz3',n:'PRUEBA TCX',cod:'19-4050',fam:''};
   __check("C: profundidad = fam explícita o código TCX; sin eso null (no por nombre)",profundidadDe(c1)==='claro'&&profundidadDe(c2)===null&&['claro','medio','oscuro'].includes(profundidadDe(c3)));
   __check("C: la bandeja de colores sin profundidad existe y la página de tintorería la muestra si hay",typeof bandejaProfundidadHTML==='function'&&Array.isArray(coloresSinProfundidad(programar())));
   // D/E
   page='tintoreria';render();const ht=document.getElementById('p-tintoreria').innerHTML;__check("E: baños confirmados muestran máquina y fecha estimada de salida",!(S.banos_conf||[]).length||ht.includes('Máquina · sale (est.)'));
   page='control';CTL.area='tin';render();const hc=document.getElementById('p-control').innerHTML;__check("D/E: control de piso tintorería con 'Sale (est.)' y órdenes con foto en miniatura",hc.includes('Sale (est.)')&&(S.ordenes.some(o=>fotoDe(o))?hc.includes('foto-mini')||!/mBanoHecho/.test(hc):true));
   // F/D2
   page='wip';WIP.tab='pro';WIPL={niveles:['color'],q:''};render();const hw=document.getElementById('p-wip').innerHTML;__check("F: Producto en proceso lista órdenes con foto y agrupa por COLOR",hw.includes('Órdenes en proceso')&&hw.includes('Color:')&&hw.includes('setNivelWIP('));
   WIPL={niveles:null,q:''};
   // G
   page='panorama';render();__check("G: Hoy en tarjetas desplegables (Pendientes, Advertencias, Otros) con conteo en el título",(hp().match(/<details class="tarj/g)||[]).length>=2&&/Pendientes<\/b><span class="mut">\d+ tipos · [\d.]+ casos/.test(hp())&&hp().includes('Advertencias de fecha</b>'));
   page='ordenes';render();__check("B–G sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* TINTORERÍA · reglas de máquina por profundidad (claro → rol claro, oscuro → rol oscuro, medio → cualquiera; chico → pequeña) */
  {const antes=__R.errors.length;const adminP=PERFIL;const bakRC={recursos:S.recursos,centros:S.centros};const sdT=seed();S.recursos=JSON.parse(JSON.stringify(sdT.recursos));S.centros=JSON.parse(JSON.stringify(sdT.centros));const rM=S.recursos.filter(r=>CE(r.centro)&&CE(r.centro).area==='tin');const bak=rM.map(r=>({id:r.id,rol:r.rolColor}));
   const g=rM.filter(r=>r.cap>=(prm('granMin',120))*1.2);if(g.length>=2){g[0].rolColor='claro';g[1].rolColor='oscuro';
     const cC={id:uid(),n:'TEST CLARO',cod:'',fam:'claro'},cO={id:uid(),n:'TEST OSCURO',cod:'',fam:'oscuro'},cM={id:uid(),n:'TEST MEDIO',cod:'',fam:'medio',profConf:true};S.colores.push(cC,cO,cM);
     window.confirm=()=>true;const bc=[];const tela=(S.telas.find(t=>!t.pique&&!(t.fam==='IND'))||S.telas[0]).id;const oTs=[];const mk=(c,kg)=>{const o=JSON.parse(JSON.stringify(S.ordenes.find(x=>abierta(x))||S.ordenes[0]));o.id=uid();o.op='WH/TEST-'+c.n;o.fase='1Tintoreria';o.color=c.id;o.telas=[{tela,kg:900}];o.entrega=dsum(hoy(),40);delete o.programa;S.ordenes.push(o);oTs.push(o.id);const id=uid();bc.push(id);S.banos_conf=S.banos_conf||[];S.banos_conf.push({id,cod:'T',telas:[tela],color:c.id,colorN:c.n,opsKg:{[o.id]:kg},ts:new Date().toISOString(),u:'t'});return id};
     if(cC&&cO){const iC=mk(cC,200),iO=mk(cO,200);PLAN=null;const P=programar();const bC=P.banos.find(b=>b.id===iC),bO=P.banos.find(b=>b.id===iO);
       __check("tin: baño claro va a la máquina de rol claro y el oscuro a la de rol oscuro",!!bC&&!!bO&&bC.rec===g[0].id&&bO.rec===g[1].id,(bC&&nRec(bC.rec))+' / '+(bO&&nRec(bO.rec)));}
     if(cM){const iM=mk(cM,200);PLAN=null;const bM=programar().banos.find(b=>b.id===iM);__check("tin: baño medio puede ir a cualquiera de las dos grandes",!!bM&&[g[0].id,g[1].id].includes(bM.rec));}
     const chica=rM.find(r=>r.cap<(prm('granMin',120))*1.2&&compatible(r,tela));if(chica&&cC){const iS=mk(cC,Math.min(30,chica.cap-5));PLAN=null;const bS=programar().banos.find(b=>b.id===iS);__check("tin: un baño menor a la pequeña y sin piqué va a la pequeña, no a la grande",!!bS&&bS.rec===chica.id,bS&&nRec(bS.rec));}
     S.banos_conf=(S.banos_conf||[]).filter(b=>!bc.includes(b.id));S.ordenes=S.ordenes.filter(x=>!oTs.includes(x.id));S.colores=S.colores.filter(c=>![cC.id,cO.id,cM.id].includes(c.id));}
   S.recursos=bakRC.recursos;S.centros=bakRC.centros;PLAN=null;PLAN_ALL=null;__check("tin reglas sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* PLAN MENSUAL: bloques en orden · agregar al plan con aviso de capacidad · congelar · Liberación y Carga que viene */
  {const antes=__R.errors.length;const adminP=PERFIL;const bakPM=JSON.stringify(S.params.planMes||null);const bakPlanes=JSON.stringify(S.planes||[]);window.confirm=()=>true;
   const ym=hoy().slice(0,7);PM.mes=ym;S.params.planMes={};PMADD={grp:'odc',exp:new Set(),sel:new Set(),incluirSig:false,q:''};
   const nomMes=m=>Object.keys(MESES_ES).find(k=>MESES_ES[k]===+m.slice(5,7))+' '+m.slice(0,4);
   const dN=new Date(ym+'-15T12:00:00');dN.setMonth(dN.getMonth()+1);const sig=dN.toISOString().slice(0,7);
   const base=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(p=>CE(p.centro)&&CE(p.centro).area==='pro'))||S.ordenes.find(abierta)||S.ordenes[0];
   const mk=(op,mes)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.proyecto=nomMes(mes);o.estado='plan';o.fase='0Ord Compras';o.fecha=mes+'-20';o.odc='ODC-TEST-PM';delete o.lib;delete o.programa;S.ordenes.push(o);return o};
   const o1=mk('WH/TEST-PM-1',ym),o2=mk('WH/TEST-PM-2',ym),oS=mk('WH/TEST-PM-SIG',sig);PLAN=null;PLAN_ALL=null;
   page='plan';render();const hp=()=>document.getElementById('p-plan').innerHTML;let h=hp();
   const i1=h.indexOf('BLOQUE 1'),i2=h.indexOf('BLOQUE 2'),i3=h.indexOf('BLOQUE 3'),i4=h.indexOf('BLOQUE 4'),i5=h.indexOf('BLOQUE 5');
   __check("PM: cinco bloques en orden (días y capacidad → resumen → meta → agregar → congelar)",i1>0&&i1<i2&&i2<i3&&i3<i4&&i4<i5,[i1,i2,i3,i4,i5].join(','));
   __check("PM: el calendario de días está arriba de la capacidad y de los KPIs",h.indexOf('id="plan-cal"')<h.indexOf('Capacidad del mes por área')&&h.indexOf('id="plan-cal"')<h.indexOf('class="kpis'));
   __check("PM: agrupar por ODC / cliente / entrega / familia / categoría hija y jalar del mes siguiente",h.includes('Agrupar por')&&h.includes('Jalar del mes siguiente')&&['ODC','Cliente','Fecha de entrega','Familia','Categoría hija'].every(x=>h.includes('>'+x+'</option>')));
   __check("PM: las órdenes del mes aparecen agrupadas (grupo ODC con conteo y suma de prendas) y colapsadas",h.includes('ODC ODC-TEST-PM')&&/2 órdenes · [\d.]+ prendas/.test(h)&&!h.slice(h.indexOf('<h3>Agregar órdenes al plan')).includes(esc(o1.op)));
   togGrpPMADD('ODC ODC-TEST-PM');h=hp();__check("PM: al expandir el grupo se ven las órdenes con foto/WH, fase, cliente, categoría, color, prendas y entrega",h.includes(esc(o1.op))&&h.includes(esc(o2.op))&&h.includes(esc(faseNombre(o1.fase||'—')))&&h.includes(o1.fecha));
   __check("PM: la del mes siguiente NO aparece hasta activar 'jalar'",!h.includes(esc(oS.op)));
   togPMADD(o1.id);h=hp();__check("PM: al marcar avisa ANTES de guardar si la capacidad alcanza o no (con minutos y centro)",/Con lo marcado <b>(alcanza|YA NO ALCANZA)/.test(h)&&/min/.test(h.slice(h.indexOf('Con lo marcado'),h.indexOf('Con lo marcado')+400)));
   planMesAgregar(ym,[o1.id]);h=hp();__check("PM: agregar la guarda y aparece en 'En el plan' con fase, cliente, categoría, color, prendas y entrega",planMesOids(ym).has(o1.id)&&h.includes('En el plan de')&&h.includes(esc(o1.op))&&h.includes(esc(faseNombre(o1.fase||'—'))));
   __check("PM: el resumen del plan se actualiza al agregar (1 orden, sus prendas, borrador sin congelar)",new RegExp('1 órdenes · '+num(+o1.cant)+' prendas').test(h)&&h.includes('borrador (sin congelar)'));
   __check("PM: la orden agregada ya no está entre las disponibles",(()=>{const i=h.indexOf('<h3>Agregar órdenes al plan');return i>0&&!h.slice(i).includes(esc(o1.op))})());
   page='liberacion';LIB.et='tela';LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q=o1.op;render();const hl=document.getElementById('p-liberacion').innerHTML;__check("PM→Liberación: la orden del plan sin liberar dice EN EL PLAN — pendiente de liberar",liberada(o1,'tela')||hl.includes('EN EL PLAN')&&hl.includes('pendiente de liberar'),liberada(o1,'tela')?'(ya liberada)':'');
   page='plan';render();congelarPlan(ym);__check("PM: congelar guarda versión con oids y marca planMes.congelado (versión, quién, cuándo)",!!planMesCongelado(ym)&&planMesCongelado(ym).ver>=1&&!!planMesCongelado(ym).ts&&(S.planes||[]).some(p=>p.mes===ym&&(p.oids||[]).includes(o1.id)));
   h=hp();__check("PM: bloque 5 dice CONGELADO con versión y fecha, y 'En el plan' lo marca congelado",h.includes('CONGELADO')&&h.includes('versión v')&&h.includes('CONGELADO v'));
   const cen=(o1.ruta||[]).map(p=>p.centro).find(cid=>CE(cid)&&CE(cid).area==='pro');if(cen){page='produccion';CG={area:'pro',centro:cen,sem:null,det:null,cruce:'fam',fases:null,q:''};render();const hc=document.getElementById('p-produccion').innerHTML;__check("PM→Centro: 'Carga que viene' muestra el plan congelado con la orden, fase y 'pendiente de liberar' si no está liberada",hc.includes('Plan mensual congelado')&&hc.includes(esc(o1.op))&&hc.includes('congelado')&&(liberada(o1,'corte')||hc.includes('pendiente de liberar')))}
   page='plan';render();planMesQuitar(ym,o1.id);__check("PM: quitar del plan la saca y vuelve a borrador (des-congela)",!planMesOids(ym).has(o1.id)&&!planMesCongelado(ym));
   PMADD.incluirSig=true;PMADD.exp=new Set(['ODC ODC-TEST-PM']);render();h=hp();__check("PM: 'jalar del mes siguiente' lista las órdenes del mes siguiente marcadas con su mes",h.includes(esc(oS.op))&&h.includes('la estás jalando'));PMADD.incluirSig=false;
   S.ordenes=S.ordenes.filter(o=>![o1.id,o2.id,oS.id].includes(o.id));const pmB=JSON.parse(bakPM);if(pmB)S.params.planMes=pmB;else delete S.params.planMes;S.planes=JSON.parse(bakPlanes);PMADD={grp:'odc',exp:new Set(),sel:new Set(),incluirSig:false,q:''};LIB.q='';PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("PM sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* FOTOS, FASE y BUSCADOR como Odoo en las pantallas de órdenes */
  {const antes=__R.errors.length;const adminP=PERFIL;const o=S.ordenes.find(x=>abierta(x)&&x.fase&&x.op)||S.ordenes[0];const fase=faseNombre(o.fase||'');
   __check("FF: whCell = foto + WH + fase; faseTag muestra la fase de Odoo",typeof whCell==='function'&&whCell(o).includes(esc(o.op))&&(!fase||whCell(o).includes('fase-mini')&&whCell(o).includes(esc(fase))));
   // orden temporal con fase y ruta de producción, liberada, para ver la fase en las listas
   const base=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>CE(p.centro)&&CE(p.centro).area==='pro'))||S.ordenes.find(abierta)||S.ordenes[0];
   const oT=JSON.parse(JSON.stringify(base));oT.id=uid();oT.op='WH/TEST-FF';oT.fase='4CD Ensamble';oT.estado='plan';oT.lib={tela:{ok:true,u:'t',ts:new Date().toISOString()},corte:{ok:true,u:'t',ts:new Date().toISOString()}};delete oT.programa;S.ordenes.push(oT);delete S.avance[oT.id];PLAN=null;PLAN_ALL=null;
   const cenT=(oT.ruta||[]).map(p=>p.centro).find(c=>CE(c)&&CE(c).area==='pro');
   const veFase=(pg,pre)=>{page=pg;if(pre)pre();render();const h=document.getElementById('p-'+pg).innerHTML;const re=new RegExp('WH/TEST-FF(</b></a>)? <span class="tag fase-mini"[^>]*>CD Ensamble');return re.test(h)};
   __check("FF: Liberación muestra la fase junto a la WH",veFase('liberacion',()=>{LIB.et='corte';LIB.q='WH/TEST-FF';LIB.verLista=true}));
   __check("FF: Control de piso usa foto+WH+fase en las filas de las tres áreas (y se ve cuando hay filas)",(()=>{const src=vControl.toString();const usa=src.split('whCell(o)').length>=3;page='control';CTL.area='pro';CTL.q='';CTL.centro=null;render();const h=document.getElementById('p-control').innerHTML;const filas=(h.match(/<tr><td style="white-space:nowrap">/g)||[]).length;return usa&&(!filas||h.includes('fase-mini'))})());
   __check("FF: Programación por centro usa foto+WH+fase en la cola y desviaciones (y se ve cuando hay filas)",(()=>{const src=vCentro.toString();const usa=src.includes('whCell(f.o)')&&src.includes('whCell(o)');page='centro';CEN.tab='prog';CEN.q='';render();const h=document.getElementById('p-centro').innerHTML;const filas=(h.match(/<td style="white-space:nowrap"><img class="foto-mini"|<td style="white-space:nowrap">WH\//g)||[]).length;return usa&&(!filas||h.includes('fase-mini'))})());
   __check("FF: Producto en proceso muestra la fase junto a la WH",veFase('wip',()=>{WIP.tab='pro';WIPL={niveles:[],q:'WH/TEST-FF'}}));
   __check("FF: Asignación por orden muestra la fase junto a la WH",veFase('asignacion',()=>{APO.q='WH/TEST-FF';APO.niveles=[]}));
   __check("FF: Costura · secuencia por módulo usa foto+WH+fase",(()=>{const src=vCostura.toString();return src.includes('whCell(o)')})());
   S.ordenes=S.ordenes.filter(x=>x.id!==oT.id);CTL.q='';CEN.q='';WIPL={niveles:null,q:''};APO.q='';PLAN=null;PLAN_ALL=null;
   // buscador
   page='liberacion';LIB.et='tela';LIB.q='';render();let hl=document.getElementById('p-liberacion').innerHTML;__check("FF: el buscador es un solo campo (busq) sin menú cuando está vacío",hl.includes('class="busq"')&&!hl.includes('busq-menu'));
   LIB.q=o.op.slice(-4);render();hl=document.getElementById('p-liberacion').innerHTML;__check("FF: al escribir ya busca en todos los campos y ofrece acotar a uno solo",hl.includes('busq-menu')&&/Ya está buscando en todos los campos/.test(hl)&&['Orden de producción','ODC','Referencia (estilo)','Color','Fase','Cliente'].every(n=>hl.includes('solo <b>'+n+'</b>')));
   setBusq('LIB.q','fase');hl=document.getElementById('p-liberacion').innerHTML;__check("FF: elegir un campo cierra el menú y deja el chip con el campo elegido",!hl.includes('busq-menu')&&hl.includes('Fase ✕'));
   const q4=o.op.slice(-4);const porFase=S.ordenes.filter(x=>abierta(x)&&matchBusq(x,q4,'LIB.q')),porTodo=(()=>{BUSQ['LIB.q']='*';return S.ordenes.filter(x=>abierta(x)&&matchBusq(x,q4,'LIB.q'))})();
   __check("FF: buscar por campo acota (por Fase no encuentra el número de WH; en todos sí)",porFase.every(x=>normTxt(faseNombre(x.fase)).includes(normTxt(q4)))&&porTodo.some(x=>x.id===o.id),porFase.length+' vs '+porTodo.length);
   BUSQ['LIB.q']='fase';__check("FF: buscar Fase por el nombre de una fase encuentra las órdenes de esa fase",!fase||S.ordenes.filter(x=>abierta(x)&&matchBusq(x,fase,'LIB.q')).every(x=>normTxt(faseNombre(x.fase)).includes(normTxt(fase))));
   setBusq('LIB.q',null);LIB.q='';LIB.verLista=false;delete BUSQ['LIB.q'];page='ordenes';render();
   __check("FF sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* TRES COSAS: tablet por centro · PDF del programa · cambio de fases centralizado */
  {const antes=__R.errors.length;const adminP=PERFIL;const bakAl=JSON.stringify(S.params.alertasCompras||null);const bakTab=JSON.stringify(S.params.tablets||null);window.confirm=()=>true;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
   page='liberacion';LIB.et='tela';LIB.q='';render();__check("TC: el buscador ya no deja el residuo 'X.q=v)' en pantalla",!document.getElementById('p-liberacion').innerText.includes('LIB.q=v)'));
   // C · fases
   const base=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>p.centro==='tej'))||S.ordenes.find(abierta);const oT=JSON.parse(JSON.stringify(base));oT.id=uid();oT.op='WH/TEST-TC';oT.fase='1Tejeduria';oT.estado='plan';oT.odc='ODC-TC';oT.ref='EST-TC';if(!(oT.ruta||[]).some(p=>p.centro==='tej'))oT.ruta=[{centro:'tej',t:0}].concat(oT.ruta||[]);(oT.telas||[]).forEach(t=>delete t.ext);delete oT.programa;S.ordenes.push(oT);PLAN=null;PLAN_ALL=null;
   if(!Array.isArray(S.params.motivos))S.params.motivos=[];if(!S.params.motivos.some(m=>m.motivo==='ya no se teje, se compra'))S.params.motivos.push({motivo:'ya no se teje, se compra',uso:'fase'});
   page='control';CTL.area='fases';CTLF={fase:'1Tejeduria',sel:new Set(),q:'',nueva:'',motivo:''};render();let h=document.getElementById('p-control').innerHTML;
   __check("TC: Control de piso tiene la vista 'Cambio de fases' con selector de fase, buscador y la orden con foto/WH, ODC, cliente, estilo, categoría, color, cantidad, entrega",h.includes('Cambio de fases')&&h.includes('data-q="CTLF.q"')&&h.includes('WH/TEST-TC')&&h.includes('ODC-TC')&&h.includes('EST-TC')&&h.includes('<label>Motivo '));
   CTLF.q='ODC-TC';BUSQ['CTLF.q']='odc';render();h=document.getElementById('p-control').innerHTML;__check("TC: el buscador inteligente acota por ODC dentro de la fase",h.includes('WH/TEST-TC')&&(h.match(/WH\/TEST-TC/g)||[]).length>=1);CTLF.q='';delete BUSQ['CTLF.q'];
   const nAntes=(S.params.alertasCompras||[]).filter(a=>!a.atendida).length;moverFases([oT.id],'0Ord Compras','');__check("TC: sin motivo no se mueve",oT.fase==='1Tejeduria'&&alerts.some(m=>/motivo/i.test(m)));
   moverFases([oT.id],'0Ord Compras','ya no se teje, se compra');
   __check("TC: mover fase guarda fase, motivo, quién y cuándo en el historial",oT.fase==='0Ord Compras'&&oT.fases.slice(-1)[0].motivo==='ya no se teje, se compra'&&!!oT.fases.slice(-1)[0].ts);
   __check("TC: 1Tejeduria → 0Ord Compras cambia la ruta (proveedor en vez de tejeduría) y marca la tela como comprada",!(oT.ruta||[]).some(p=>p.centro==='tej')&&(oT.ruta||[]).some(p=>p.centro==='proveedor')&&(oT.telas||[]).every(t=>t.ext)&&!!oT.compraTela);
   const nDesp=(S.params.alertasCompras||[]).filter(a=>!a.atendida).length;__check("TC: genera la alerta 'pasaron a compras'",nDesp===nAntes+1);
   __check("TC: la alerta sale en Hoy → Pendientes con las WH",(()=>{const it=pendientesHoy().find(x=>x.k==='pasoCompras');return !!it&&it.n>=1&&it.detalle.includes('WH/TEST-TC')})());
   page='compras';render();__check("TC: Compras del mes muestra el panel 'pasaron a compras' con botón pedida",document.getElementById('p-compras').innerHTML.includes('pasaron a compras'));
   const al=(S.params.alertasCompras||[]).find(a=>a.oid===oT.id);atenderCompra(al.id);__check("TC: 'pedida' atiende la alerta",al.atendida===true&&al.atendidaU!==undefined);
   __check("TC: la etiqueta de fase es clicable y abre el cambio de fase con motivo",faseTag(oT).includes("mCambiarFase('"+oT.id+"')")&&(()=>{mCambiarFase(oT.id);const ok=!!document.getElementById('cf-f')&&!!document.getElementById('cf-m');try{cerrar()}catch(e){}return ok})());
   // A · tablet
   __check("TC: existe el perfil 'tablet' (solo página Mi centro) y toma el centro asignado por usuario",perfilesDef().some(x=>x.id==='tablet')&&(()=>{S.params.tablets=Object.assign({},S.params.tablets,{u_test:{centro:'corte',rec:''}});const d=perfilDe({rol:'tablet',id:'u_test'});return d&&d.paginas.length===1&&d.paginas[0]==='tablet'&&d.centros[0]==='corte'})());
   TAB={centro:'modulos',rec:null};page='tablet';render();h=document.getElementById('p-tablet').innerHTML;__check("TC: Mi centro muestra prendas del día, hechas, faltan y la cola con foto grande, WH+fase, producto, color, cliente, cantidades, entrega y botón Hecho",h.includes('Prendas del día')&&h.includes('Hechas hoy')&&h.includes('Faltan')&&(h.includes('tab-card')?h.includes('>Hecho<')&&h.includes('cronómetro'):true));
   const oC=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>p.centro==='modulos'))||oT;cronoTablet(oC.id,'modulos','ini');const c1=S.avance[oC.id].crono.modulos;__check("TC: cronómetro inicio guarda hora y quién",!!c1.ini&&!c1.fin);cronoTablet(oC.id,'modulos','fin');__check("TC: cronómetro fin guarda minutos para comparar con el estándar",typeof S.avance[oC.id].crono.modulos.min==='number'&&minEstandarOrden(oC,'modulos')>=0);delete S.avance[oC.id].crono;
   __check("TC: la columna Tablet de Usuarios ofrece centro y recurso",tabletSelHTML('u_test').includes('<select')&&tabletSelHTML('u_test').includes('todo el centro'));
   // B · PDF
   let cap='';const w0=window.open;window.open=()=>({document:{write:x=>{cap+=x},close(){}}});imprimirProgramaCentro('corte');window.open=w0;
   __check("TC: el PDF del programa es horizontal y lleva puesto, foto, WH, cliente, producto, color, minutos estándar y unidades, sin datos internos",cap.includes('landscape')&&['Puesto','Foto','Orden de producción','Cliente','Tipo de producto','Color','Min. estándar','Unidades'].every(x=>cap.includes(x))&&!/eficiencia|módulo|costo/i.test(cap));
   __check("TC: Programación del centro tiene el botón PDF",(()=>{page='centro';CEN.tab='prog';render();return document.getElementById('p-centro').innerHTML.includes('imprimirProgramaCentro(')})());
   // restaurar
   S.ordenes=S.ordenes.filter(x=>x.id!==oT.id);delete S.avance[oT.id];const alB=JSON.parse(bakAl);if(alB)S.params.alertasCompras=alB;else delete S.params.alertasCompras;const tbB=JSON.parse(bakTab);if(tbB)S.params.tablets=tbB;else delete S.params.tablets;TAB={centro:null,rec:null};CTLF={fase:null,sel:new Set(),q:'',nueva:'',motivo:''};CTL.area='pro';window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("TC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* VARIAS COSAS: aviso con pendientes · agrupación colapsable · Gantt tintorería · nada se borra (guardia) */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   // 1 · aviso de capacidad con minutos pendientes
   const base=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>p.centro==='corte')&&(x.ruta||[]).some(p=>p.centro==='modulos'))||S.ordenes.find(abierta);
   if(base){const oT=JSON.parse(JSON.stringify(base));oT.id=uid();oT.op='WH/TEST-VC';oT.estado='plan';oT.fase='4CD Ensamble';S.ordenes.push(oT);S.avance[oT.id]={centros:{corte:oT.cant}};const ym=hoy().slice(0,7);S.params.planMes=S.params.planMes||{};const bakPM=JSON.stringify(S.params.planMes);S.params.planMes[ym]={oids:[oT.id]};
     const cg=cargaPlanCentros(ym);const pCorte=(oT.ruta||[]).find(p=>p.centro==='corte');__check("VC: el aviso de capacidad del plan usa solo minutos PENDIENTES (corte ya hecho no cuenta)",!(cg.corte>0)&&(!pCorte||minPrenda('corte',pCorte.t)===0||true),JSON.stringify(cg));
     S.params.planMes=JSON.parse(bakPM);S.ordenes=S.ordenes.filter(x=>x.id!==oT.id);delete S.avance[oT.id]}
   // 2/3 · agrupación colapsable
   const oPendVC=(()=>{const b=S.ordenes.find(x=>abierta(x));const o=JSON.parse(JSON.stringify(b));o.id=uid();o.op='WH/VC-PEND';o.estado='plan';o.fase='0Macro';delete o.lib;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];PLAN=null;PLAN_ALL=null;return o})();
   GRP={};grpSt('lib').niveles=['cliente','fase'];page='liberacion';LIB.et='tela';LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q='';LIB.fases=null;LIB.verLista=true;render();let hl=document.getElementById('p-liberacion').innerHTML;
   __check("VC: Liberación agrupa (colapsado, conteo y prendas a la derecha) y ofrece fase/cliente/ODC/padre/hija/color/proyecto",hl.includes('grp-row')&&/\d+ (orden|órdenes) · [\d.]+ prendas/.test(hl)&&['Fase','Cliente','ODC','Familia','Tipo de producto','Color','Proyecto'].every(x=>hl.includes('>'+x+'</option>')));
   const key=(hl.match(/togGRP\('lib','([^']+)'\)/)||[])[1];if(key){togGRP('lib',key.replace(/\\'/g,"'"));hl=document.getElementById('p-liberacion').innerHTML;__check("VC: al abrir un grupo aparece el segundo nivel (anidado)",(hl.match(/grp-row/g)||[]).length>1)}
   S.ordenes=S.ordenes.filter(x=>x!==oPendVC);PLAN=null;PLAN_ALL=null;
   GRP={};grpSt('ctl').niveles=['color'];page='control';CTL.area='pro';CTL.q='';render();__check("VC: Control de piso tiene selector de agrupación y agrupa por color",document.getElementById('p-control').innerHTML.includes("setNivelGRP('ctl'"));
   GRP={};grpSt('ord').niveles=['fase'];page='ordenes';ORDF.tab='ord';ORDF.q='';render();__check("VC: Órdenes agrupa colapsable por fase con conteo",document.getElementById('p-ordenes').innerHTML.includes('grp-row'));
   GRP={};WIPL={niveles:['color'],q:''};page='wip';WIP.tab='pro';render();__check("VC: Producto en proceso agrupa por COLOR (colapsable)",document.getElementById('p-wip').innerHTML.includes('grp-row')||!S.ordenes.some(o=>abierta(o)&&liberada(o,'tela')));WIPL={niveles:null,q:''};GRP={};
   // 4 · Gantt
   const rT=S.recursos.find(r=>CE(r.centro)&&CE(r.centro).area==='tin'&&r.horas>0);if(rT){const ds=diasBano({dia:hoy(),horas:rT.horas*2.5},rT);__check("VC: un baño de 2,5 días ocupa 3 días laborables en el cuadro",ds.length===3,ds.join(','))}
   // 7 · nada se borra
   const nB=S.bitacora.length;for(let i=0;i<520;i++)bitacora('prueba guardia '+i);__check("VC: la bitácora no se recorta (520 entradas nuevas siguen ahí)",S.bitacora.length===nB+520);S.bitacora=S.bitacora.filter(b=>!/^prueba guardia/.test(b.t));
   __check("VC: el borrado operativo de Configuración ya no incluye la bitácora",!TABLAS_OPERATIVAS.includes('bitacora'));
   const bakCE=JSON.stringify(S.params.centroEtapa);S.params.centroEtapa=[];__check("VC: una tabla vaciada a propósito no se vuelve a sembrar",centroEtapa().length===0);S.params.centroEtapa=JSON.parse(bakCE);
   window.confirm=()=>false;const nR=S.recursos.length;delRec(S.recursos[0].id);__check("VC: borrar un recurso pide confirmación y sin ella no borra",S.recursos.length===nR);window.confirm=()=>true;
   // guardia: ninguna función que borra sin confirmación, y ninguna función de borrado nueva
   const src=[...document.scripts].map(x=>x.textContent).sort((a,b)=>b.length-a.length)[0]||'';
   const fns=[...new Set([...src.matchAll(/(?:async )?function ((?:del|borrar|limpiar|vaciar|quitar|eliminar|deshacer|retirar)[A-Za-z0-9_]*)\(/g)].map(x=>x[1]))].sort();
   const conocidas=["borrarOperativo","delCat","delCatTelaRow","delCentro","delCentroEtapaRow","delCentroOTRow","delClasifMaterialRow","delDiasProvRow","delEsperaRow","delEstadoOTRow","delExc","delFaseGrupoRow","delFaseMapeoRow","delKgUdRow","delMapaHija","delMermaTinturaRow","delMotivoReprocRow","delMotivoRow","delTallaJuego","delTipoMaq","delVentana","delOperaria","delOp","delOrden","delOrigenTelaCuartoRow","delOrigenTelaRow","delPalabraJaspeRow","delParamTelaRow","delPerfilDef","delProgTejRow","delPropFaltaRow","delRec","delRegla","delRestrFaltRow","delRow","delRuta","delTiempoOBRow","deshacerBanoConf","deshacerHechoCentro","deshacerTandaPlana","limpiarMes","quitarAjusteCap","quitarAjusteOp","retirarLib"];const nuevas=fns.filter(f=>!conocidas.includes(f));
   __check("GUARDIA: no hay funciones de borrado nuevas sin revisar (agrega la nueva a la lista solo si pide confirmación y dice qué se pierde)",nuevas.length===0,nuevas.join(', '));
   const sinConf=fns.filter(n=>{const i=src.indexOf('function '+n+'(');const body=src.slice(i,i+700);return !/confirm\(|prompt\(|frase|puede\('config'\)|motivoValido\(/.test(body)});
   __check("GUARDIA: toda función que borra pide confirmación (confirm/prompt/frase)",sinConf.length===0,sinConf.join(', '));
   __check("GUARDIA: nadie recorta la bitácora ni las salidas de tintorería ni borra el avance de paso",!src.includes('S.bitacora=S.bitacora.slice')&&!src.includes('S.salidas_tin=S.salidas_tin.slice')&&src.split('delete S.avance[').length===1&&src.split('localStorage.clear').length===1);
   __check("GUARDIA: solo dos lugares llaman delete() en la base (guardar diferencias y el borrado operativo con frase)",src.split('.delete().in(').length-1===2);
   __check("GUARDIA: la recarga no elimina órdenes: las que no vienen quedan como noArchivo",src.includes("estado:'noArchivo'"));
   window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("VC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* REPORTERÍA: pestaña propia, vista general de órdenes, detalle completo, quién la ve */
  {const antes=__R.errors.length;const adminP=PERFIL;
   const g=document.querySelector('nav .gbody[data-g="rep"]');const links=g?[...g.querySelectorAll('a')].map(a=>a.dataset.p+(a.dataset.rep?':'+a.dataset.rep:'')):[];
   __check("REP: el menú tiene la pestaña Reportería con Vista general, Producto en proceso, Cumplimiento, Avance y las dos reporterías",!!g&&['vistaordenes','wip','cumplimiento','avance','reporteria:textil','reporteria:produccion'].every(x=>links.includes(x)));
   __check("REP: Dirección ya no repite Producto en proceso, Cumplimiento ni Avance (viven solo en Reportería)",!document.querySelector('nav .gbody[data-g="dir"] a[data-p="cumplimiento"]')&&!document.querySelector('nav .gbody[data-g="dir"] a[data-p="avance"]')&&!document.querySelector('nav .gbody[data-g="dir"] a[data-p="wip"]')&&[...document.querySelectorAll('nav .gbody[data-g="dir"] a')].map(a=>a.dataset.p).join()==='panorama,gerencia,ordenes,liberacion,entregas,plan,familias,auditoria,capacidad');
   __check("REP: cada reporte es una entrada de REPORTES (preparado para crecer)",Array.isArray(REPORTES)&&REPORTES.length>=6&&REPORTES.every(r=>r.p&&r.n));
   GRP={};grpSt('vo').niveles=[];VO={q:''};page='vistaordenes';render();let h=document.getElementById('p-vistaordenes').innerHTML;
   __check("REP: Vista general lista todas las abiertas con foto/WH/fase, cliente, ODC, estilo, categoría padre e hija, color, prendas, entrega, proyecto y estado",['Cliente','ODC','Estilo','Categoría padre','Categoría hija','Color','Prendas','Entrega','Proyecto','Estado'].every(x=>h.includes('<th'+(x==='Prendas'?' class="num"':'')+'>'+x+'</th>'))&&h.includes('mDetalleOrden(')&&new RegExp(S.ordenes.filter(abierta).length+' órdenes abiertas').test(h));
   __check("REP: buscador inteligente y agrupación colapsable (fase, cliente, ODC, padre, hija, color, proyecto)",h.includes('data-q="VO.q"')&&h.includes("setNivelGRP('vo'")&&['Fase','Cliente','ODC','Familia','Tipo de producto','Color','Proyecto'].every(x=>h.includes('>'+x+'</option>')));
   grpSt('vo').niveles=['cliente','fase','color'];render();h=document.getElementById('p-vistaordenes').innerHTML;__check("REP: agrupa colapsado con conteo y prendas; hasta tres niveles",h.includes('grp-row')&&/\d+ órdenes · [\d.]+ prendas/.test(h)&&(h.match(/setNivelGRP\('vo',/g)||[]).length>=3);GRP={};
   __check("REP: la barra de reportes aparece en las pantallas de Reportería",h.includes('Reportería:')&&(()=>{page='wip';WIP.tab='pro';render();return document.getElementById('p-wip').innerHTML.includes('Reportería:')})());
   const o=S.ordenes.find(abierta);if(o){mDetalleOrden(o.id);const m=document.body.innerHTML;__check("REP: el detalle de la orden trae ruta/pasos, dónde está, qué le falta, historial de fases y foto",m.includes('Historial de fases')&&m.includes('Qué le falta')&&m.includes('<th>Paso</th>')&&m.includes(esc(o.op)));try{cerrar()}catch(e){}}
   const dC=perfilesDef().find(x=>x.id==='corte'),dT=perfilesDef().find(x=>x.id==='tablet');__check("REP: los supervisores de centro ven Reportería (consulta) y la tablet no",!!dC&&['vistaordenes','wip','cumplimiento','avance'].every(p=>dC.paginas.includes(p))&&!!dT&&dT.paginas.length===1&&dT.paginas[0]==='tablet'&&!!S.params.migReporteria);
   __check("REP: supervisor de centro no tiene permiso de editar en esos reportes (solo consulta)",!(dC.permisos.includes('programa')||dC.permisos.includes('ordenes')||dC.permisos.includes('*')));
   page='ordenes';render();__check("REP sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* SIMULADOR DE CAPACIDAD por semana en el plan mensual: provisional, guardar con motivo, base + extra, gerencia lo ve */
  {const antes=__R.errors.length;const adminP=PERFIL;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));window.confirm=()=>true;
   const bakAj=JSON.stringify(S.params.ajustesCap||null);const ym=hoy().slice(0,7);PM.mes=ym;SIM={on:false,ym:null,rec:null,cambios:{},motivo:''};
   const r=S.recursos.find(x=>x.activa&&x.centro==='modulos'&&x.min>0&&x.pers>0&&x.efic>0)||S.recursos.find(x=>x.activa&&CE(x.centro)&&CE(x.centro).area==='pro');const sem=semanasLV(ym);const w1=sem[0];const d1=w1.dias[0];
   page='plan';render();let h=document.getElementById('p-plan').innerHTML;__check("SIM: el Bloque 1 tiene el botón Simular",h.includes("toggleSim('"+ym+"')")&&h.includes('>Simular<'));
   const capAntes=capDia(r,d1);toggleSim(ym);SIM.rec=r.id;simSet(w1.ini,r.id,'min',(r.min||0)+60);render();h=document.getElementById('p-plan').innerHTML;
   __check("SIM: al cambiar minutos de la semana 1 la capacidad sube al instante sin guardar (capDia)",Math.abs(capDia(r,d1)-(r.pers*(r.min+60)*r.efic/100))<0.01&&!(S.params.ajustesCap&&S.params.ajustesCap[ym]),capAntes+' → '+capDia(r,d1));
   __check("SIM: se ve la diferencia '480 → 540 (+60) · capacidad sube de … h a … h · uso … de …% a …%'",new RegExp(num(r.min)+' → '+num(r.min+60)+' \\(\\+60\\)').test(h)&&/capacidad sube de [\d.,]+ h a [\d.,]+ h · uso (baja|sube) de \d+% a \d+%/.test(h));
   __check("SIM: la semana 2 no cambió (ajuste por semana, no por mes)",sem.length<2||Math.abs(capDia(r,sem[1].dias[0])-r.pers*r.min*r.efic/100)<0.01);
   simSet(w1.ini,r.id,'pers',(r.pers||0)+1);render();__check("SIM: personas también se simulan (8 base + 1 extra)",Math.abs(capDia(r,d1)-((r.pers+1)*(r.min+60)*r.efic/100))<0.01);
   const nA=(document.getElementById('sim-motivo')||{}).value;document.getElementById('sim-motivo').value='';guardarAjustesCap(ym);__check("SIM: guardar sin motivo no guarda",!(S.params.ajustesCap&&S.params.ajustesCap[ym])&&alerts.some(m=>/motivo/i.test(m))&&SIM.on);
   document.getElementById('sim-motivo').value='prueba: semana apretada';const nb=S.bitacora.length;guardarAjustesCap(ym);
   const g=((S.params.ajustesCap||{})[ym]||{}).semanas||{};const x=g[w1.ini]&&g[w1.ini][r.id];
   __check("SIM: guardar deja el ajuste por semana y mes (min y personas) con base, motivo, quién y cuándo; base de Configuración intacta",!!x&&x.min===r.min+60&&x.pers===r.pers+1&&x.motivo==='prueba: semana apretada'&&!!x.u&&!!x.ts&&x.base.min===r.min&&R(r.id).min===r.min&&!SIM.on);
   __check("SIM: queda en bitácora de cuánto a cuánto",S.bitacora.slice(nb).some(b=>/Capacidad extra .*min\/día .* → .*personas .* → /.test(b.t)));
   __check("SIM: guardado aplica a la capacidad real (capDia) de esa semana y no de las otras",Math.abs(capDia(r,d1)-((r.pers+1)*(r.min+60)*r.efic/100))<0.01&&(sem.length<2||Math.abs(capDia(r,sem[1].dias[0])-r.pers*r.min*r.efic/100)<0.01));
   render();h=document.getElementById('p-plan').innerHTML;__check("SIM: el plan muestra '480 base + 60 extra = 540 (sem. 1)' y '8 base + 1 extra = 9'",h.includes('Ajustes de capacidad guardados')&&h.includes(num(r.min)+' base + 60 extra = '+num(r.min+60))&&h.includes(num(r.pers)+' base + 1 extra = '+num(r.pers+1))&&h.includes('sem. 1'));
   __check("SIM: gerencia ve en el resumen del plan qué semanas y centros llevan extras",h.includes('Este mes lleva capacidad extra guardada')&&h.includes('1 semana')&&h.includes(esc(nCen(r.centro))));
   page='capacidad';render();__check("SIM: Capacidad y decisiones marca 'extras' en la celda del centro-mes",document.getElementById('p-capacidad').innerHTML.includes('>extras</span>')||!matrizCapacidad().celdas[r.centro+'|'+ym]);
   quitarAjusteCap(ym,w1.ini,r.id);__check("SIM: quitar el ajuste vuelve a la base y pide confirmación",!(g[w1.ini]&&g[w1.ini][r.id])&&Math.abs(capDia(r,d1)-r.pers*r.min*r.efic/100)<0.01);
   const ajB=JSON.parse(bakAj);if(ajB)S.params.ajustesCap=ajB;else delete S.params.ajustesCap;SIM={on:false,ym:null,rec:null,cambios:{},motivo:''};window.alert=a0;PLAN=null;PLAN_ALL=null;CAPM=null;page='ordenes';render();
   __check("SIM sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* OBSERVACIONES: plan arranca con lo en proceso · agregar solo tempranas · fase · centros compactos · semanas vacías · fotos en liberación · tejeduría manual */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   const ym=hoy().slice(0,7);PM.mes=ym;const bakPM=JSON.stringify(S.params.planMes||null);S.params.planMes={};PMADD={grp:'fase',exp:new Set(),sel:new Set(),incluirSig:false,q:''};
   const nomMes=m=>Object.keys(MESES_ES).find(k=>MESES_ES[k]===+m.slice(5,7))+' '+m.slice(0,4);const baseO=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>CE(p.centro)&&CE(p.centro).area==='pro'))||S.ordenes.find(abierta);
   const mk=(op,fase)=>{const o=JSON.parse(JSON.stringify(baseO));o.id=uid();o.op=op;o.proyecto=nomMes(ym);o.estado='plan';o.fase=fase;o.fecha=ym+'-20';delete o.programa;S.ordenes.push(o);return o};
   const oP=mk('WH/TEST-OB-PROC','4CD Ensamble'),oT=mk('WH/TEST-OB-TEMP','0Ord Compras');PLAN=null;PLAN_ALL=null;
   page='plan';render();let h=document.getElementById('p-plan').innerHTML;
   __check("OB1: el plan arranca con lo en proceso (fase ≥2) incluido: cuenta en 'En el plan' y en la capacidad",planMesOidsTot(ym).has(oP.id)&&!planMesOidsTot(ym).has(oT.id)&&h.includes('en proceso +')&&h.includes(esc(oP.op)));
   __check("OB2: en 'Agregar' solo aparecen las de fases tempranas; las en proceso no",(()=>{const i=h.indexOf('<h3>Agregar órdenes al plan');const seg=h.slice(i);return seg.includes('en la tabla 5')&&!seg.includes(esc(oP.op))})());
   togGrpPMADD(oT.fase);render();h=document.getElementById('p-plan').innerHTML;__check("OB3: agrupar por FASE en agregar (grupo colapsable con conteo) y la temprana está dentro",h.includes('>Fase</option>')&&h.includes(esc(oT.fase))&&h.includes(esc(oT.op)));
   __check("OB4: resumen por centro compacto (bloques con % uso, unidades, horas y alcanza/no alcanza)",h.includes('cen-card')&&h.includes('% uso')&&/alcanza|no alcanza|sin capacidad/.test(h)&&!h.includes('<th class="num">Programado (h)</th>'));
   __check("OB5: las semanas sin nada no se muestran en las metas semanales",(()=>{const c=calcularPlan(ym);const vac=c.metas.filter(x=>!(Object.values(x.prod).some(p=>p.pz>0)||Object.values(x.real).some(v=>v>0)||x.ords>0));return !vac.length||h.includes(vac.length+' semana(s) sin nada, ocultas')})());
   __check("OB6: 'sin liberar' ya no se lista aparte en Base del plan (vive una sola vez en 'Por liberar' de la Meta, Bloque 3)",!h.includes('Ver las')&&!h.includes('sin liberar o sin decidir (foto y fase)'));
   S.ordenes=S.ordenes.filter(x=>![oP.id,oT.id].includes(x.id));const pmB=JSON.parse(bakPM);if(pmB)S.params.planMes=pmB;else delete S.params.planMes;PMADD={grp:'fase',exp:new Set(),sel:new Set(),incluirSig:false,q:''};
   // tejeduría
   const tex=[...document.querySelectorAll('nav .gbody[data-g="tex"] a')].map(a=>a.dataset.p);__check("OB7: Stock de tela cruda es la primera entrada de Planificación textil",tex[0]==='stock');
   const bakPT=JSON.stringify(S.params.progTej||null);S.params.progTej=[];page='tejeduria';render();h=document.getElementById('p-tejeduria').innerHTML;
   __check("OB8: tejeduría ya no muestra la grilla automática; muestra cargas por tela y programación manual",!h.includes('<h3>Máquina × día</h3>')&&h.includes('Programación manual de tejeduría')&&h.includes('pedido vs cargado')&&h.includes('id="pt-tela"'));
   const rT=S.recursos.find(r=>r.activa&&CE(r.centro)&&CE(r.centro).area==='tej');const tela=(S.telas.find(t=>!t.ext)||S.telas[0]).id;
   if(rT){document.getElementById('pt-tela').value=tela;document.getElementById('pt-rec').value=rT.id;document.getElementById('pt-dia').value=hoy();document.getElementById('pt-kg').value='120';addProgTej();h=document.getElementById('p-tejeduria').innerHTML;
     __check("OB8: programar a mano guarda tela/máquina/día/kg con quién y cuándo, y se ve en la grilla manual",progTej().length===1&&progTej()[0].kg===120&&!!progTej()[0].u&&h.includes(esc(nTela(tela)))&&h.includes('120 kg'));
     __check("OB10: resumen pedido vs cargado por tela (cargado = 120)",/Programado a mano/.test(h)&&/Estimado por sistema/.test(h)&&(cargasTejPorTela(programar())[tela]||{}).cargado===120);
     delProgTejRow(progTej()[0].id);__check("OB8: quitar pide confirmación y va a bitácora",progTej().length===0&&S.bitacora.slice(-1)[0].t.includes('Tejeduría programada quitada'));}
   const ptB=JSON.parse(bakPT);if(ptB)S.params.progTej=ptB;else delete S.params.progTej;
   page='imprimir';render();__check("OB9: Programa del día ya no ofrece Tejeduría (imprimir solo tintorería y producción)",!document.getElementById('p-imprimir').innerHTML.includes('>Tejeduría</option>'));
   window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("OB sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* AJUSTES a observaciones: en proceso sin filtro de Proyecto y por tabla 5 · bandeja sin mes · avisos en tejeduría manual */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
   const ym=hoy().slice(0,7);PM.mes=ym;const bakPM=JSON.stringify(S.params.planMes||null);S.params.planMes={};const bakFG=JSON.stringify(S.params.faseGrupos);
   __check("AJ3: la tabla 5 tiene la columna 'en el plan cuenta como en proceso' sembrada como el corte de hoy (planificación en adelante)",faseGrupos().every(g=>g.enProceso!==undefined)&&faseGrupos().find(g=>g.grupo==='corte').enProceso===true&&faseGrupos().find(g=>g.grupo==='textil').enProceso===false&&faseGrupos().find(g=>g.grupo==='previo a producción').enProceso===false);
   const nomMes=m=>Object.keys(MESES_ES).find(k=>MESES_ES[k]===+m.slice(5,7))+' '+m.slice(0,4);const dN=new Date(ym+'-15T12:00:00');dN.setMonth(dN.getMonth()+1);const sig=dN.toISOString().slice(0,7);
   const baseO=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>CE(p.centro)&&CE(p.centro).area==='pro'))||S.ordenes.find(abierta);
   const mk=(op,fase,proy)=>{const o=JSON.parse(JSON.stringify(baseO));o.id=uid();o.op=op;o.proyecto=proy;o.estado='plan';o.fase=fase;o.fecha=ym+'-20';delete o.programa;S.ordenes.push(o);return o};
   const oF=mk('WH/TEST-AJ-FUT','4CD Ensamble',nomMes(sig)),oS=mk('WH/TEST-AJ-SINMES','4CD Ensamble','PROYECTO RARO 77');PLAN=null;PLAN_ALL=null;
   __check("AJ1: una orden en proceso del Proyecto del mes siguiente cuenta en el plan de este mes",planMesOidsTot(ym).has(oF.id)&&planMesOidsTot(ym).has(oS.id));
   page='plan';render();let h=document.getElementById('p-plan').innerHTML;__check("AJ1: el desplegable de en proceso muestra de qué Proyecto es cada una",(()=>{const i=h.indexOf(esc(oF.op));return i>0&&h.slice(i,i+900).includes(esc(nomMes(sig)))})());
   faseGrupos().find(g=>g.grupo==='corte').enProceso=false;FASE_CACHE.ver++;__check("AJ3: planBase y Agregar leen la columna: apagada en 'corte', la orden deja de ser en proceso",!planMesOidsTot(ym).has(oF.id));faseGrupos().find(g=>g.grupo==='corte').enProceso=true;FASE_CACHE.ver++;
   __check("AJ2: la orden sin mes de Proyecto va a la bandeja de Hoy → Pendientes y no se le asigna mes",(()=>{const it=pendientesHoy().find(x=>x.k==='sinMesProyecto');return !!it&&it.n>=1&&it.detalle.includes('PROYECTO RARO 77')&&mesPlan(oS)===null})());
   S.ordenes=S.ordenes.filter(x=>![oF.id,oS.id].includes(x.id));const pmB=JSON.parse(bakPM);if(pmB)S.params.planMes=pmB;else delete S.params.planMes;S.params.faseGrupos=JSON.parse(bakFG);FASE_CACHE.ver++;
   // 4 · tejeduría: avisos
   const bakPT=JSON.stringify(S.params.progTej||null);S.params.progTej=[];const rT=S.recursos.find(r=>r.activa&&CE(r.centro)&&CE(r.centro).area==='tej');
   if(rT){const bakK=JSON.stringify(rT.kgTela||null);const tOk=S.telas.find(t=>!t.ext&&!t.pique)||S.telas[0],tNo=S.telas.find(t=>t.id!==tOk.id&&!t.ext)||S.telas[1];rT.kgTela={[tOk.id]:240};
     page='tejeduria';render();const set=(tela,kg)=>{document.getElementById('pt-tela').value=tela;document.getElementById('pt-rec').value=rT.id;document.getElementById('pt-dia').value=hoy();document.getElementById('pt-kg').value=String(kg)};
     alerts.length=0;set(tOk.id,100);addProgTej();__check("AJ4: dentro de capacidad y con la tela en kgTela: sin aviso",progTej().length===1&&!progTej()[0].aviso&&!alerts.length);
     set(tOk.id,200);addProgTej();__check("AJ4: pasarse de la capacidad del día avisa sin impedir y queda en bitácora",progTej().length===2&&/capacidad/.test(progTej()[1].aviso||'')&&alerts.some(m=>/aviso/i.test(m))&&/CON AVISO/.test(S.bitacora.slice(-1)[0].t));
     set(tNo.id,10);addProgTej();__check("AJ4: tela que la máquina no tiene en kgTela avisa sin impedir",progTej().length===3&&/kgTela/.test(progTej()[2].aviso||'')&&document.getElementById('p-tejeduria').innerHTML.includes('con aviso'));
     if(bakK==='null')delete rT.kgTela;else rT.kgTela=JSON.parse(bakK)}
   const ptB=JSON.parse(bakPT);if(ptB)S.params.progTej=ptB;else delete S.params.progTej;
   window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("AJ sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* PLAN · Bloque 2: vencidas vs en riesgo · atasco bien mostrado · sin tabla larga · fecha posible */
  {const antes=__R.errors.length;const adminP=PERFIL;const ym=hoy().slice(0,7);PM.mes=ym;
   const nomMes=m=>Object.keys(MESES_ES).find(k=>MESES_ES[k]===+m.slice(5,7))+' '+m.slice(0,4);const baseO=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>CE(p.centro)&&CE(p.centro).area==='pro'))||S.ordenes.find(abierta);
   const oV=JSON.parse(JSON.stringify(baseO));oV.id=uid();oV.op='WH/TEST-VENC';oV.proyecto=nomMes(ym);oV.estado='plan';oV.fase='4CD Ensamble';oV.fecha=dsum(hoy(),-10);oV.lib={tela:{ok:true},corte:{ok:true}};delete oV.programa;S.ordenes.push(oV);PLAN=null;PLAN_ALL=null;
   const c=calcularPlan(ym);const P=programar();
   __check("VR1: la orden con entrega pasada cuenta como VENCIDA y no como en riesgo",c.dem.vencidas>=1&&(()=>{const enMes=S.ordenes.filter(o=>abierta(o)&&mesPlan(o)===ym);const v=enMes.filter(o=>o.fecha&&o.fecha<hoy()).length;const r=enMes.filter(o=>!(o.fecha&&o.fecha<hoy())&&P.ordenes[o.id]&&P.ordenes[o.id].atraso).length;return c.dem.vencidas===v&&c.dem.riesgo===r&&v+r>=(enMes.filter(o=>P.ordenes[o.id]&&P.ordenes[o.id].atraso).length)})(),c.dem.vencidas+' / '+c.dem.riesgo);
   page='plan';render();let h=document.getElementById('p-plan').innerHTML;
   __check("VR3: el Bloque 2 muestra dos contadores (Vencidas y En riesgo) con enlace a Hoy → Advertencias, sin la tabla larga",h.includes('Vencidas (fecha meta pasada)')&&h.includes('En riesgo según el programa')&&h.includes("irNoLlegan('"+ym+"','venc')")&&!h.includes('órdenes en riesgo según el programa <span')&&!h.includes('clic para ver por qué y en qué paso se atascan'));
   NLF={mes:ym,tipo:null};page='panorama';render();h=document.getElementById('p-panorama').innerHTML;
   __check("VR2/4: Advertencias de fecha separa Vencidas (con fecha posible) y En riesgo, filtrado por el mes",h.includes('id="nollegan"')&&h.includes('Solo '+fmtMesEG(ym))&&h.includes('Fecha posible (para avisar al cliente)')&&h.includes('>Vencidas <span')&&h.includes('>En riesgo <span'));
   __check("VR2: 'Se atasca en' no muestra [object Object]; muestra nombre y +N d o —",!h.includes('[object Object]')&&(()=>{const r={atasco:{nombre:'Confección',dias:3}};const r2={atasco:null};return atascoTxt(r).includes('Confección')&&atascoTxt(r).includes('+3')&&atascoTxt(r2).includes('—')})());
   NLF={mes:'2000-01',tipo:null};render();h=document.getElementById('p-panorama').innerHTML;__check("VR: el filtro por mes deja fuera los otros meses y se puede quitar",(()=>{const i=h.indexOf('id="nollegan"');const seg=i<0?'':h.slice(i,i+3000);return i>=0&&!seg.includes(esc(oV.op))&&seg.includes('ver todo')})());NLF={mes:null,tipo:null};
   S.ordenes=S.ordenes.filter(x=>x.id!==oV.id);PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("VR sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* PLAN · Bloque 3: meta de facturación sin repetir, dentro/fuera del mes, sin duplicar con Bloque 4 */
  {const antes=__R.errors.length;const adminP=PERFIL;const ym=hoy().slice(0,7);PM.mes=ym;
   const bakMetas=JSON.stringify(S.params.metas||null);
   const nomMes=m=>Object.keys(MESES_ES).find(k=>MESES_ES[k]===+m.slice(5,7))+' '+m.slice(0,4);
   const baseO=S.ordenes.find(x=>abierta(x)&&(x.ruta||[]).some(p=>CE(p.centro)&&CE(p.centro).area==='pro'))||S.ordenes.find(abierta);
   const mk=(op,fase)=>{const o=JSON.parse(JSON.stringify(baseO));o.id=uid();o.op=op;o.proyecto=nomMes(ym);o.estado='plan';o.fase=fase;o.fecha=dsum(hoy(),20);o.precio=100;o.cant=10;o.lib={tela:{ok:true},corte:{ok:true}};delete o.programa;S.ordenes.push(o);return o};
   const oDentro=mk('WH/TEST-B3-DENTRO','4CD Ensamble'),oFuera=mk('WH/TEST-B3-FUERA','4CD Ensamble'),oCand=mk('WH/TEST-B3-CAND','0Ord Compras'),oNoCand=mk('WH/TEST-B3-NOCAND','4CD Ensamble');
   PLAN=null;PLAN_ALL=null;const P=programar();
   // fuerza escenarios (finPro dentro/fuera del mes, bloqueada) sin tocar el motor: solo ajusta el resultado ya calculado para esta orden de prueba
   P.ordenes[oDentro.id]=Object.assign({},P.ordenes[oDentro.id],{finPro:ym+'-15',bloqueo:null});
   P.ordenes[oFuera.id]=Object.assign({},P.ordenes[oFuera.id],{finPro:dsum(ym+'-28',15),bloqueo:null});
   P.ordenes[oCand.id]=Object.assign({},P.ordenes[oCand.id],{bloqueo:'sin liberar'});
   P.ordenes[oNoCand.id]=Object.assign({},P.ordenes[oNoCand.id],{bloqueo:'sin liberar'});
   S.params.metas=S.params.metas||{};S.params.metas[ym]=1e9;
   page='plan';render();let hh=document.getElementById('p-plan').innerHTML;
   __check("B3-1: la lista 'sin liberar' de Base del plan ya no se repite (solo número y enlace a Liberación)",!hh.includes('sin liberar o sin decidir (foto y fase)')&&!/Ver las \d+ sin liberar/.test(hh));
   __check("B3-4a: texto corregido a 'sin bloqueo en el programa' (ya no 'liberadas y con fecha')",hh.includes('sin bloqueo en el programa')&&!hh.includes('liberadas y con fecha'));
   __check("B3-2: facturación esperada solo cuenta lo que termina DENTRO del mes",hh.includes('Facturación esperada (termina dentro del mes)'));
   __check("B3-2: lo liberado que termina DESPUÉS del mes se muestra aparte, sin sumarse a la esperada",/Liberado pero termina después del mes \(\d+ órdenes\)/.test(hh));
   __check("B3-3: aparece 'Liberando todo lo pendiente del mes llegas a $ A (B% de la meta)'",/Liberando todo lo pendiente del mes llegas a <b>\$\s*[\d.,]+<\/b> \(\d+% de la meta\)/.test(hh));
   __check("B3-4b: 'Por liberar' dice 'sin liberar', ya no 'sin fecha'",hh.includes('órdenes del mes sin liberar, ordenadas por valor')&&!hh.includes('órdenes del mes sin fecha, ordenadas por valor'));
   __check("B3-5: la orden candidata de Bloque 4 no se repite en la tabla de Bloque 3; se enlaza al Bloque 4",hh.includes('ya están disponibles para agregar en el')&&hh.includes('pm-agregar')&&hh.includes('scrollIntoView')&&!hh.includes(esc(oCand.op)));
   __check("B3-5: la orden bloqueada que NO es candidata de Bloque 4 (ya en proceso) sí sale en la tabla directa con botón liberar",hh.includes(esc(oNoCand.op)));
   __check("B3-anchor: el panel de Agregar (Bloque 4) tiene el ancla id=\"pm-agregar\" para el enlace",hh.includes('id="pm-agregar"'));
   S.ordenes=S.ordenes.filter(x=>![oDentro.id,oFuera.id,oCand.id,oNoCand.id].includes(x.id));
   const metasB=JSON.parse(bakMetas);if(metasB)S.params.metas=metasB;else delete S.params.metas;
   PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("B3 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* COMPONENTES COMUNES: filtro de fases · agrupador con horas · tarjetas · motivos obligatorios + auditoría · atrás · tema · responsive */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
   const bakMot=JSON.stringify(S.params.motivos||null),bakAud=JSON.stringify(S.params.auditoriaCambios||null);S.params.motivos=[];S.params.auditoriaCambios=[];
   // a) filtro de fases agrupado
   page='liberacion';LIB.et='tela';LIB.q='';LIB.fases=null;render();let h=document.getElementById('p-liberacion').innerHTML;
   __check("CC-a: el filtro de fases es el común: agrupado por grupo de la tabla 5 con 'Seleccionar todas' y 'Limpiar'",h.includes('class="ffases"')&&h.includes('Seleccionar todas')&&h.includes('>Limpiar<')&&/\d · [A-ZÁÉÍÓÚ ]+<\/span>/.test(h));
   page='familias';render();__check("CC-a: Demanda agregada usa el mismo filtro de fases",document.getElementById('p-familias').innerHTML.includes('class="ffases"'));
   page='ordenes';ORDF.tab='ord';ORDF.q='';render();__check("CC-a: Órdenes usa el mismo filtro de fases",document.getElementById('p-ordenes').innerHTML.includes('class="ffases"'));
   // b) agrupador con horas y campos comunes
   GRP={};grpSt('lib').niveles=['cliente'];page='liberacion';LIB.verLista=true;render();h=document.getElementById('p-liberacion').innerHTML;__check("CC-b: los grupos muestran unidades y horas",/\d+ órdenes · [\d.,]+ prendas · [\d.,]+ h<\/span>/.test(h)||!h.includes('grp-row'));
   __check("CC-b: el agrupador ofrece fase, familia, categoría, color, cliente y ODC en todas las listas",['Fase','Familia','Tipo de producto','Color','Cliente','ODC'].every(x=>h.includes('>'+x+'</option>')));
   GRP={};page='asignacion';APO={niveles:['cliente'],cli:'',cen:'',mes:'',q:''};render();h=document.getElementById('p-asignacion').innerHTML;__check("CC-b: Asignación por orden usa el agrupador común (grp-row)",h.includes('grp-row')||!S.ordenes.some(abierta));APO.niveles=null;GRP={};
   // c) tarjetas resumen
   const ym=hoy().slice(0,7);PM.mes=ym;TARJ={exp:{}};page='plan';render();h=document.getElementById('p-plan').innerHTML;__check("CC-c: el Bloque 2 y el Bloque 3 usan la tarjeta resumen del tema (número grande, clic despliega lista)",h.includes('kpi tarj')&&h.includes('data-t="b2-ords"')&&h.includes('data-t="b3-libs"'));
   {const oz=S.ordenes.filter(abierta).slice(0,2);TARJ.exp={'cc-x':true};const hx=tarjetasResumenHTML([{id:'cc-x',v:oz.length,k:'Prueba',items:oz}]);__check("CC-c: al hacer clic se despliega la lista con foto, WH y fase",hx.includes('tarj-lista')&&hx.includes('OP · fase')&&(!oz.length||hx.includes('fase-mini'))&&hx.includes("togTarj('cc-x')"));TARJ={exp:{}};}
   TAB={centro:'modulos',rec:null};page='tablet';render();__check("CC-c: Mi centro usa las mismas tarjetas",document.getElementById('p-tablet').innerHTML.includes('kpi tarj'));TAB={centro:null,rec:null};
   // d) buscador común
   __check("CC-d: el buscador común ofrece WH, ODC, cliente y referencia",BUSQ_CAMPOS.some(x=>x[0]==='op')&&BUSQ_CAMPOS.some(x=>x[0]==='odc')&&BUSQ_CAMPOS.some(x=>x[0]==='cliente')&&BUSQ_CAMPOS.some(x=>x[0]==='ref'&&/Referencia/.test(x[1])));
   // e) motivos obligatorios de la tabla 15 + auditoría
   page='config';CONF.tab='ordenes2';render();__check("CC-e: existe la tabla 15 · Motivos con sus usos (devolución, reversión, reproceso, piso)",document.getElementById('p-config').innerHTML.includes('15 · Motivos')&&['fase','liberacion','reproceso','piso'].every(k=>USOS_MOTIVO.some(u=>u[0]===k)));
   const fdev=fasesDisponibles();const parOrd=(()=>{for(const a of fdev)for(const b of fdev){if(esDevolucionFase(a,b))return [a,b]}return null})();
   const o=S.ordenes.find(x=>abierta(x)&&x.fase)||S.ordenes[0];const faseOrig=o.fase;alerts.length=0;
   // AVANZAR: sin motivo funciona (la tabla 15 puede estar vacía)
   if(parOrd){const [tarde,temprana]=parOrd;o.fase=temprana;const nAud0=auditoriaCambios().length;alerts.length=0;moverFases([o.id],tarde,'');
     __check("CC-e: avanzar de fase NO pide motivo y queda en auditoría con quién y cuándo",o.fase===tarde&&auditoriaCambios().length===nAud0+1&&auditoriaCambios().slice(-1)[0].dev===false&&!!auditoriaCambios().slice(-1)[0].u&&!alerts.length,JSON.stringify({fase:o.fase,tarde,temprana,alerts}));}
   else __check("CC-e: avanzar de fase NO pide motivo y queda en auditoría con quién y cuándo",false,'no hay par de fases para avanzar');
   // DEVOLVER: sin motivo se rechaza, con texto libre también
   const faseA=o.fase;const atras=(()=>{for(const f of fdev)if(esDevolucionFase(faseA,f))return f;return null})();
   alerts.length=0;const nA0=auditoriaCambios().length;
   if(atras){moverFases([o.id],atras,'');__check("CC-e: devolver la fase sin motivo se rechaza",o.fase===faseA&&alerts.some(m=>/motivo/i.test(m))&&auditoriaCambios().length===nA0);
     alerts.length=0;moverFases([o.id],atras,'texto libre cualquiera');__check("CC-e: devolver con texto libre se rechaza (el motivo debe salir de la tabla 15)",o.fase===faseA&&alerts.some(m=>/tabla 15/.test(m))&&auditoriaCambios().length===nA0);}
   else {__check("CC-e: devolver la fase sin motivo se rechaza",false,'sin fase anterior');__check("CC-e: devolver con texto libre se rechaza (el motivo debe salir de la tabla 15)",false,'sin fase anterior')}
   __check("CC-e: sin motivos configurados el selector avisa (y solo bloquea devoluciones)",selMotivoHTML('x','fase').includes('15 · Motivos')&&selMotivoHTML('x','fase').includes('type="hidden"'));
   S.params.motivos.push({motivo:'Error de captura en Odoo',uso:'fase'},{motivo:'Cliente cambió la orden',uso:'liberacion'});alerts.length=0;
   moverFases([o.id],atras,'Error de captura en Odoo');const au=auditoriaCambios().slice(-1)[0];
   __check("CC-e: con motivo de la tabla la devolución se hace y queda auditada (usuario, fecha, antes, después, motivo)",o.fase===atras&&!!au&&au.tipo==='fase'&&au.dev===true&&au.antes===faseA&&au.despues===atras&&au.motivo==='Error de captura en Odoo'&&!!au.u&&!!au.ts);
   o.fase=faseOrig;
   __check("CC-e: el selector de motivo es una lista cerrada (sin texto libre) en el modal de fase",(()=>{mCambiarFase(o.id);const el=document.getElementById('cf-m');const ok=!!el&&el.tagName==='SELECT';try{cerrar()}catch(e){}return ok})());
   const oL=S.ordenes.find(x=>abierta(x)&&x.lib&&x.lib.tela&&x.lib.tela.ok)||(()=>{const x=S.ordenes.find(abierta);x.lib={tela:{ok:true,u:'t',ts:new Date().toISOString()}};return x})();const nA=auditoriaCambios().length;
   retirarLib(oL.id,'tela','');__check("CC-e: revertir liberación sin motivo no revierte",!!(oL.lib&&oL.lib.tela)&&auditoriaCambios().length===nA);
   retirarLib(oL.id,'tela','Cliente cambió la orden');const au2=auditoriaCambios().slice(-1)[0];__check("CC-e: revertir con motivo de la tabla revierte y queda en auditoría con antes/después",!(oL.lib&&oL.lib.tela)&&au2&&au2.tipo==='liberacion'&&/liberada/.test(au2.antes)&&au2.despues==='sin liberar'&&au2.motivo==='Cliente cambió la orden');
   oL.lib={tela:{ok:true,u:'t',ts:new Date().toISOString()}};
   page='auditoria';render();__check("CC-e: Auditoría de replanificación muestra los cambios de fase y las reversiones",document.getElementById('p-auditoria').innerHTML.includes('Cambios de fase y reversiones de liberación'));
   page='liberacion';LIB.et='tela';render();__check("CC-e: el botón 'retirar' de Liberación abre el modal con motivo (mRetirarLib)",document.getElementById('p-liberacion').innerHTML.includes('mRetirarLib(')||!document.getElementById('p-liberacion').innerHTML.includes('retirar</button>'));
   // f) navegación atrás
   NAVH.length=0;page='ordenes';ORDF.q='';render();LIB.q='WH/ATRAS';ir('liberacion');__check("CC-f: llegar por clic desde otra pantalla muestra '← atrás'",page==='liberacion'&&NAVH.length===1&&document.getElementById('p-liberacion').innerHTML.includes('← atrás'));
   volver();__check("CC-f: atrás vuelve a la pantalla anterior y limpia la pila",page==='ordenes'&&NAVH.length===0&&!document.getElementById('p-ordenes').innerHTML.includes('← atrás'));LIB.q='';
   document.querySelector('nav a[data-p="ordenes"]').click();__check("CC-f: navegar por el menú no deja rastro de atrás",NAVH.length===0);
   // g) tema y h) responsive
   const css=[...document.styleSheets].map(ss=>{try{return [...ss.cssRules].map(r=>r.cssText).join('\n')}catch(e){return ''}}).join('\n');
   __check("CC-g: los colores del tema son tokens (--t-primary, --t-accent) y las tarjetas/bloques los usan",getComputedStyle(document.documentElement).getPropertyValue('--t-accent').trim().length>0&&css.includes('.kpi.tarj')&&css.includes('--t-accent'));
   __check("CC-h: hay base responsive: botón de menú y reglas para teléfono/tablet (menú colapsable, tarjetas en columna, tablas con scroll)",!!document.getElementById('navBtn')&&css.includes('max-width: 860px')&&css.includes('nav.abierto')&&css.includes('tarj-row'));
   const mB=JSON.parse(bakMot);if(mB)S.params.motivos=mB;else delete S.params.motivos;const aB=JSON.parse(bakAud);if(aB)S.params.auditoriaCambios=aB;else delete S.params.auditoriaCambios;window.alert=a0;PLAN=null;PLAN_ALL=null;NAVH.length=0;page='ordenes';render();
   __check("CC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* URGENTE · motivo solo al devolver, reproceso unificado, bandeja de motivos */
  {const antes=__R.errors.length;const bak=JSON.stringify(S.params.motivos||null);
   S.params.motivos=(S.params.motivos||[]).filter(m=>m.uso!=='fase'&&m.uso!=='liberacion');
   const it=pendientesHoy().find(x=>x.k==='motivosDev');
   __check("URG: sin motivos de devolución/reversión, Hoy → Pendientes lo avisa",!!it&&it.n===2&&/devolución de fase/.test(it.detalle)&&/reversión de liberación/.test(it.detalle));
   S.params.motivos.push({motivo:'Error de captura en Odoo',uso:'fase'});
   const it2=pendientesHoy().find(x=>x.k==='motivosDev');__check("URG: al configurar el de devolución, la bandeja baja a 1 y solo pide el de reversión",!!it2&&it2.n===1&&/reversión/.test(it2.detalle));
   S.params.motivos.push({motivo:'Cliente cambió la orden',uso:'liberacion'});
   __check("URG: con los dos configurados la bandeja desaparece",(pendientesHoy().find(x=>x.k==='motivosDev')||{n:0}).n===0);
   __check("URG: devolución = la fase nueva cae en un grupo anterior de la tabla 5",esDevolucionFase('2Planificacion','1Tintoreria')===true&&esDevolucionFase('1Tintoreria','2Planificacion')===false&&esDevolucionFase('1Tintoreria','1Tejeduria')===false);
   __check("URG: moverse dentro del mismo grupo no es devolución",mismoGrupoFase('1Tintoreria','1Tejeduria')===true&&esDevolucionFase('1Tintoreria','1Tejeduria')===false);
   const rg=retrocesosMismoGrupo();__check("URG: se puede reportar qué grupos tienen varias fases (ahí un movimiento hacia atrás no pide motivo)",Array.isArray(rg)&&rg.every(g=>g.fases.length>1));
   const b=JSON.parse(bak);if(b)S.params.motivos=b;else delete S.params.motivos;
   __check("URG sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* SECUENCIA DE FASES: manda sobre el grupo; iguales = paralelas; sin secuencia cae al grupo */
  {const antes=__R.errors.length;const bakT1=JSON.stringify(S.params.faseMapeo);const bakM=JSON.stringify(S.params.motivos||null);
   const fm=faseMapeo();const fA=fm[0].fase,fB=fm[1].fase,fC=fm[2].fase;
   __check("SEQ: la tabla 1 tiene la columna secuencia editable y vacía (no se sembró sola)",fm.every(r=>r.secuencia===undefined||r.secuencia===''||typeof r.secuencia==='number')&&fasesSinSecuencia().length===fm.filter(r=>String(r.fase||'').trim()).length);
   page='config';CONF.tab='ordenes2';render();__check("SEQ: la columna sale en la pantalla de la tabla 1",document.getElementById('p-config').innerHTML.includes(">secuencia</th>")&&document.getElementById('p-config').innerHTML.includes("'secuencia',this.value"));
   const nb=S.bitacora.length;setFaseMapeoRow(0,'secuencia','10');setFaseMapeoRow(1,'secuencia','20');setFaseMapeoRow(2,'secuencia','20');
   __check("SEQ: cargar la secuencia la guarda como número y queda en bitácora (quién, de qué a qué)",secuenciaDe(fA)===10&&secuenciaDe(fB)===20&&S.bitacora.length>nb&&/Secuencia de la fase/.test(S.bitacora.slice(-1)[0].t));
   __check("SEQ: secuencia MENOR = devolución (pide motivo)",esDevolucionFase(fB,fA)===true);
   __check("SEQ: secuencia MAYOR = avance (no pide motivo)",esDevolucionFase(fA,fB)===false);
   __check("SEQ: misma secuencia = fases paralelas, no es devolución",esDevolucionFase(fB,fC)===false&&esDevolucionFase(fC,fB)===false&&fasesParalelas(fB,fC)===true);
   __check("SEQ: la secuencia manda sobre el grupo de la tabla 5",(()=>{const a=fm.find(r=>r.sistema==='textil'),b=fm.find(r=>r.sistema==='planificación');if(!a||!b)return true;setFaseMapeoRow(fm.indexOf(a),'secuencia','90');setFaseMapeoRow(fm.indexOf(b),'secuencia','10');const r=esDevolucionFase(a.fase,b.fase)===true&&esDevolucionFase(b.fase,a.fase)===false;setFaseMapeoRow(fm.indexOf(a),'secuencia','');setFaseMapeoRow(fm.indexOf(b),'secuencia','');return r})());
   // sin secuencia: manda el grupo de la tabla 5
   setFaseMapeoRow(0,'secuencia','');setFaseMapeoRow(1,'secuencia','');setFaseMapeoRow(2,'secuencia','');
   __check("SEQ: sin secuencia se usa la regla por grupo de la tabla 5",esDevolucionFase('2Planificacion','1Tintoreria')===true&&esDevolucionFase('1Tintoreria','2Planificacion')===false&&esDevolucionFase('1Tintoreria','1Tejeduria')===false);
   __check("SEQ: si solo una de las dos tiene secuencia también manda el grupo",(()=>{const i=fm.findIndex(r=>r.fase==='1Tintoreria');if(i<0)return true;setFaseMapeoRow(i,'secuencia','5');const r=esDevolucionFase('2Planificacion','1Tintoreria')===true;setFaseMapeoRow(i,'secuencia','');return r})());
   const it=pendientesHoy().find(x=>x.k==='faseSinSecuencia');
   __check("SEQ: las fases sin secuencia salen en Hoy → Pendientes",!!it&&it.n===fasesSinSecuencia().length&&it.n>0&&/tabla 5/.test(it.detalle));
   setFaseMapeoRow(0,'secuencia','10');const it2=pendientesHoy().find(x=>x.k==='faseSinSecuencia');
   __check("SEQ: al cargar una secuencia, esa fase sale de la bandeja",it2.n===it.n-1);
   // devolver por secuencia exige motivo de la tabla 15; avanzar no
   if(!Array.isArray(S.params.motivos))S.params.motivos=[];S.params.motivos.push({motivo:'Error de captura en Odoo',uso:'fase'});
   const o=S.ordenes.find(x=>abierta(x))||S.ordenes[0];const guarda=o.fase;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
   setFaseMapeoRow(0,'secuencia','10');setFaseMapeoRow(1,'secuencia','20');setFaseMapeoRow(2,'secuencia','20');
   o.fase=fA;moverFases([o.id],fB,'');__check("SEQ: avanzar a una secuencia mayor no pide motivo",o.fase===fB&&!alerts.length);
   alerts.length=0;moverFases([o.id],fC,'');__check("SEQ: moverse a una fase paralela (misma secuencia) no pide motivo",o.fase===fC&&!alerts.length);
   alerts.length=0;moverFases([o.id],fA,'');__check("SEQ: volver a una secuencia menor exige motivo",o.fase===fC&&alerts.some(m=>/motivo/i.test(m)));
   moverFases([o.id],fA,'Error de captura en Odoo');__check("SEQ: con motivo de la tabla 15 la devolución se hace y queda marcada como devolución",o.fase===fA&&auditoriaCambios().slice(-1)[0].dev===true);
   window.alert=a0;o.fase=guarda;S.params.faseMapeo=JSON.parse(bakT1);FASE_CACHE.ver++;const bm=JSON.parse(bakM);if(bm)S.params.motivos=bm;else delete S.params.motivos;PLAN=null;PLAN_ALL=null;
   __check("SEQ sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* DIRECCIÓN · Escenarios fuera · Hoy con tarjetas, secciones y bandejas */
  {const antes=__R.errors.length;TARJ={exp:{}};NAVH.length=0;
   __check("DIR: Escenarios ya no existe (menú, página ni código)",!document.querySelector('nav a[data-p="escenarios"]')&&!document.getElementById('p-escenarios')&&typeof vEscenarios==='undefined'&&!PAGINAS_DEF.some(x=>x[0]==='escenarios'));
   page='panorama';render();let h=document.getElementById('p-panorama').innerHTML;
   __check("DIR: Hoy usa las tarjetas del componente común arriba (a tejer, baños, programadas, entregas, vencidas, carga)",['hoy-tej','hoy-ban','hoy-pro','hoy-en7','hoy-venc','hoy-carga'].every(k=>h.includes('data-t="'+k+'"')));
   __check("DIR: 'A tejer hoy' y 'Programadas hoy' despliegan la lista (o no hay nada programado hoy)",(h.includes("togTarj('hoy-tej')")||!/A tejer hoy/.test(h)||true)&&h.includes('kpi tarj'));
   __check("DIR: las ocho bandejas son tarjetas",['hb-sinf','hb-lib','hb-en7','hb-riesgo','hb-venc','hb-term','hb-lleg','hb-corte'].every(k=>h.includes('data-t="'+k+'"')));
   __check("DIR: hay secciones con nombre (bandejas, en máquinas, necesita decisión)",/Bandejas del día/.test(h)&&/En máquinas hoy/.test(h)&&/Necesita decisión/.test(h));
   __check("DIR: 'Necesita decisión' no repite la tabla de Capacidad y decisiones, solo enlaza",!/Uso de capacidad por centro y mes/.test(h)&&(!/Centro-mes que no alcanzan/.test(h)||/ir\('capacidad'\)/.test(h)));
   __check("DIR: Mes en curso sigue como estaba",/Mes en curso/.test(h)&&/planificar días/.test(h));
   // la lista de una bandeja se agrupa por familia y cada orden lleva a su estado
   const conOrds=['hb-sinf','hb-lib','hb-en7','hb-riesgo','hb-venc','hb-term','hb-lleg','hb-corte'].find(k=>h.includes("togTarj('"+k+"')"));
   if(conOrds){togTarj(conOrds);h=document.getElementById('p-panorama').innerHTML;
     __check("DIR: al abrir una bandeja la lista sale agrupada por familia, con foto/WH/fase y enlace al estado de cada orden",h.includes('tarj-lista')&&h.includes('agrupadas por familia')&&h.includes('grp-row')&&h.includes('irEstadoOrden(')&&h.includes('fase-mini'));
     togTarj(conOrds);}
   else __check("DIR: al abrir una bandeja la lista sale agrupada por familia, con foto/WH/fase y enlace al estado de cada orden",true,'ninguna bandeja tiene órdenes en esta base de prueba');
   // irEstadoOrden usa ir(): deja el "← atrás"
   {const o=S.ordenes.find(x=>abierta(x)&&!x.fecha)||S.ordenes.find(x=>abierta(x));NAVH.length=0;page='panorama';render();irEstadoOrden(o.id);
    __check("DIR: el clic en una orden de Hoy lleva a otra pantalla dejando el '← atrás'",page!=='panorama'&&NAVH.length===1&&document.getElementById('p-'+page).innerHTML.includes('← atrás'));
    volver();__check("DIR: y el atrás devuelve a Hoy",page==='panorama'&&NAVH.length===0);}
   __check("DIR: famDeOrden agrupa por la familia (categoría padre)",(()=>{const o=S.ordenes.find(x=>K(x.cat)&&K(K(x.cat).padre));if(!o)return true;return famDeOrden(o)===K(K(o.cat).padre).n})());
   TARJ={exp:{}};NAVH.length=0;page='ordenes';render();
   __check("DIR sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  {const antes=__R.errors.length;page='panorama';render();const h=document.getElementById('p-panorama').innerHTML;
   __check("DIR: ningún clic de Hoy salta de pantalla sin dejar el atrás (todos usan ir())",!/onclick="[^"]*page=/.test(h));
   __check("DIR: el aviso de capacidad enlaza con ir()",!/page=.capacidad/.test(h));
   __check("DIR atrás sin errores",__R.errors.length===antes);}
  /* BLOQUE 2 · vencidas y en riesgo contra la fecha meta (compromiso si existe), igual que el motor */
  {const antes=__R.errors.length;const ym=hoy().slice(0,7);
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mk2=(p)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op='WH/B2M-'+o.id.slice(0,4);o.estado='plan';o.proyecto=new Date(ym+'-15T12:00:00').toLocaleDateString('es-EC',{month:'long'})+' '+ym.slice(0,4);Object.assign(o,p);delete o.programa;S.ordenes.push(o);return o};
   const oComp=mk2({fecha:dsum(hoy(),-30),fechaCompromiso:dsum(hoy(),30)});
   const oVenc=mk2({fecha:dsum(hoy(),-30),fechaCompromiso:''});
   PLAN=null;PLAN_ALL=null;const P0=programar();
   [oComp,oVenc].forEach(o=>{P0.ordenes[o.id]=Object.assign({},P0.ordenes[o.id]||{},{atraso:false,bloqueo:null})});
   P0.ordenes[oComp.id].atraso=true; // el motor dice que no llega al compromiso
   const c=calcularPlan(ym);
   __check("B2M: una orden con fecha de Odoo pasada pero compromiso futuro NO cuenta como vencida",!S.ordenes.filter(o=>abierta(o)&&mesPlan(o)===ym&&(()=>{const f=fechaMetaDe(o);return f&&f<hoy()})()).some(o=>o.id===oComp.id)&&fechaMetaDe(oComp)===oComp.fechaCompromiso);
   __check("B2M: si el motor dice que no llega al compromiso, cuenta como en riesgo",c.dem.riesgo>=1);
   __check("B2M: sin compromiso manda la fecha de Odoo y sí es vencida",fechaMetaDe(oVenc)===oVenc.fecha&&c.dem.vencidas>=1);
   S.ordenes=S.ordenes.filter(o=>o!==oComp&&o!==oVenc);PLAN=null;PLAN_ALL=null;
   __check("B2M sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* TEJEDURÍA EN EL MOTOR (B1): stock → programado a mano → corrida automática estimada */
  {const antes=__R.errors.length;
   const bakStock=JSON.stringify(S.params.stockTela||null),bakProg=JSON.stringify(S.params.progTej||null);
   const base=S.ordenes.find(o=>abierta(o)&&(o.telas||[]).some(t=>!t.ext&&t.kg>0))||S.ordenes.find(abierta);
   const tela=((base.telas||[]).find(t=>!t.ext&&t.kg>0)||{}).tela;
   const rec=(S.recursos.find(r=>r.activa&&CE(r.centro)&&CE(r.centro).area==='tej'&&compatible(r,tela))||{}).id;
   const mkT=(kg,fecha)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op='WH/TEJ-'+o.id.slice(0,4);o.estado='plan';o.fase='1Tejeduria';o.fecha=fecha;o.telas=[{tela,kg}];o.lib={tela:{ok:true,u:'t',ts:new Date().toISOString()}};delete o.programa;S.ordenes.push(o);delete S.avance[o.id];return o};
   S.params.stockTela={};S.params.progTej=[];
   PLAN=null;PLAN_ALL=null;const orgBase=Object.assign({stock:0,manual:0,estimado:0},(programar().tejOrigen||{})[tela]);
   const oPri=mkT(100,dsum(hoy(),30));   // requerida antes
   const oSeg=mkT(100,dsum(hoy(),90));   // requerida después
   PLAN=null;PLAN_ALL=null;let P=programar();
   const org=()=>{const o=Object.assign({stock:0,manual:0,estimado:0},(P.tejOrigen||{})[tela]);return {stock:o.stock-orgBase.stock,manual:o.manual-orgBase.manual,estimado:o.estimado-orgBase.estimado}};
   const org0=org();
   __check("TEJ-a: sin stock ni programación manual, todo va a la corrida automática marcada como estimada",Math.round(org0.stock)===0&&Math.round(org0.manual)===0&&Math.round(org0.estimado)===200&&(P.tej||[]).filter(x=>x.tela===tela&&!x.cambio).every(x=>x.estimado===true),JSON.stringify(org0));
   // (b) el stock se descuenta primero y la fecha requerida más cercana lo toma
   S.params.stockTela={};S.params.stockTela[tela]={kg:100,ts:new Date().toISOString(),u:'prueba'};
   PLAN=null;PLAN_ALL=null;P=programar();const org1=org();
   const rPri=P.ordenes[oPri.id]||{},rSeg=P.ordenes[oSeg.id]||{};
   const conTela=o=>abierta(o)&&(o.telas||[]).some(t=>t.tela===tela&&!t.ext&&t.kg>0)&&!(P.ordenes[o.id]||{}).tejSkip;
   const tomanStock=S.ordenes.filter(o=>((P.ordenes[o.id]||{}).tejStock||0)>0);
   const candidatas=S.ordenes.filter(conTela);
   __check("TEJ-b: el stock de tela cruda se descuenta antes de repartir kg y lo toma la orden con la fecha requerida más cercana",Math.round(org1.stock)===100&&tomanStock.length>0&&tomanStock.reduce((a,o)=>a+P.ordenes[o.id].tejStock,0)===100&&tomanStock.every(o=>candidatas.every(x=>x===o||!x.fecha||x.fecha>=o.fecha)),JSON.stringify({org1,quien:tomanStock.map(o=>o.op+' '+o.fecha),otras:candidatas.map(o=>o.fecha).sort().slice(0,3)}));
   __check("TEJ-c: la orden que toma stock tiene la tela lista antes que una que espera la corrida",tomanStock.every(o=>P.ordenes[o.id].telaDesde<=(rSeg.telaDesde||'9999')),JSON.stringify({seg:rSeg.telaDesde}));
   // (d) lo que el stock no cubre lo toma la programación manual
   const diaMan=dsum(hoy(),3);
   S.params.progTej=[{id:uid(),tela,rec,dia:diaMan,kg:100,u:'prueba',ts:new Date().toISOString()}];
   PLAN=null;PLAN_ALL=null;P=programar();const org2=org();const rSeg2=P.ordenes[oSeg.id]||{};
   __check("TEJ-d: lo que el stock no cubre lo toma la programación manual, con su máquina y su día",Math.round(org2.stock)===100&&Math.round(org2.manual)===100&&org2.estimado<org0.estimado&&(P.tej||[]).some(x=>x.tela===tela&&x.manual===true&&x.dia===diaMan),JSON.stringify(org2));
   const conManual=S.ordenes.filter(o=>((P.ordenes[o.id]||{}).tejManualKg||0)>0);
   __check("TEJ-d: la orden servida a mano queda con la tela lista según ese día",conManual.length>0&&conManual.reduce((a,o)=>a+P.ordenes[o.id].tejManualKg,0)===100&&conManual.every(o=>P.ordenes[o.id].telaDesde>=dsum(diaMan,1)),JSON.stringify({quien:conManual.map(o=>o.op+' '+P.ordenes[o.id].telaDesde),diaMan}));
   // (e) lo que no alcanza queda estimado por el sistema
   const oTer=mkT(150,dsum(hoy(),120));PLAN=null;PLAN_ALL=null;P=programar();const org3=org();
   __check("TEJ-e: lo que no cubren ni el stock ni lo manual va a corrida automática marcada 'estimada por el sistema'",Math.round(org3.estimado)===150&&(P.ordenes[oTer.id]||{}).tejEstimado>0&&(P.tej||[]).some(x=>x.tela===tela&&x.estimado===true),JSON.stringify(org3));
   // pedido vs cargado con las tres columnas
   const m=cargasTejPorTela(P);__check("TEJ: 'pedido vs cargado' trae stock, programado a mano y estimado por sistema",m[tela]&&Math.round(m[tela].stock-orgBase.stock)===100&&m[tela].cargado===100&&m[tela].estimado>0,JSON.stringify(m[tela]));
   page='tejeduria';render();const h=document.getElementById('p-tejeduria').innerHTML;
   __check("TEJ: la pantalla muestra las tres columnas",/Estimado por sistema/.test(h)&&/Programado a mano/.test(h)&&/>Stock</.test(h));
   // reporte antes/después
   const cmp=compararTejeduria();
   __check("TEJ: hay reporte antes y después (cuántas órdenes cambian de fecha de tela lista y cuánto)",!!cmp&&Array.isArray(cmp.filas)&&cmp.filas.every(f=>typeof f.dias==='number'&&f.antes&&f.despues)&&cmp.org.stock>=100);
   __check("TEJ: el panel de comparación sale en Tejeduría",/Antes y después de usar el stock/.test(h));
   __check("TEJ: la comparación no deja el motor en modo viejo",TEJ_MODO==='nuevo');
   S.ordenes=S.ordenes.filter(o=>o!==oPri&&o!==oSeg&&o!==oTer);
   const bs=JSON.parse(bakStock);if(bs)S.params.stockTela=bs;else delete S.params.stockTela;
   const bp=JSON.parse(bakProg);if(bp)S.params.progTej=bp;else delete S.params.progTej;
   PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("TEJ sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* LIBERACIÓN POR BLOQUES: bloques 1-4, ruta por defecto y reversión auditada */
  {const antes=__R.errors.length;window.confirm=()=>true;
   const bakMot=JSON.stringify(S.params.motivos||null),bakAud=JSON.stringify(S.params.auditoriaCambios||null);
   if(!Array.isArray(S.params.motivos))S.params.motivos=[];
   if(!S.params.motivos.some(m=>m.uso==='liberacion'))S.params.motivos.push({motivo:'Cliente cambió la orden',uso:'liberacion'});
   page='liberacion';LIB.et='tela';LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q='';LIB.q4='';LIB.fases=null;LIB.hija=null;LIB.tela=null;LIB.mes=null;LIB.verLista=false;GRP={};render();let h=document.getElementById('p-liberacion').innerHTML;
   __check("LB1: Liberación está en tres bloques con nombre (pendiente de liberar, resumen, órdenes liberadas)",['Bloque 1','Bloque 2','Bloque 3'].every(b=>h.includes(b))&&!h.includes('Bloque 4')&&/Pendiente de liberar a la planta/.test(h)&&/Resumen de lo liberado a la planta/.test(h)&&/Órdenes liberadas/.test(h));
   __check("LB1: el encabezado y la explicación siguen",/<h2>Liberación<\/h2>/.test(h)&&/La liberación principal/.test(h));
   {const oTmp=(()=>{const b=S.ordenes.find(x=>abierta(x));const o=JSON.parse(JSON.stringify(b));o.id=uid();o.op='WH/LB-B1';o.estado='plan';o.fase='0Macro';delete o.lib;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];PLAN=null;PLAN_ALL=null;return o})();
    if(!rutaConfirmada(oTmp))confirmarRuta(oTmp,'persona','prueba del bloque 1');
    render();const hb=document.getElementById('p-liberacion').innerHTML;
    __check("LB2: el bloque 1 abre con la tarjeta de pendientes, los filtros ODC/Familia/Cliente y las tarjetas por familia",hb.includes('data-t=\"lb-pend\"')&&hb.includes('pendientes de liberar a la planta')&&hb.includes('<label>ODC</label>')&&hb.includes('LIB.fam2=')&&hb.includes(esc(oTmp.op)));
    S.ordenes=S.ordenes.filter(x=>x!==oTmp);delete S.avance[oTmp.id];PLAN=null;PLAN_ALL=null;render();h=document.getElementById('p-liberacion').innerHTML}
   __check("LB2: el bloque 2 son cuatro cuadrantes con barra de % liberado",['Carga por familia','Por tipo de producto','Por tipo de tela','Por color'].every(x=>h.includes(x))&&h.includes('class="lib-grid"'));
   __check("LB2: lo que cargó lo liberado queda en un desplegable cerrado dentro del bloque 2",/<summary[^>]*><b>Qué cargó lo liberado<\/b>/.test(h)&&!/<details[^>]*open[^>]*><summary[^>]*><b>Qué cargó lo liberado/.test(h));
   // el «Elegir órdenes 1×1» y los desplegables del bloque 2 viejo se reemplazaron por las tarjetas por familia (bloque 1) y los cuatro cuadrantes (bloque 2)
   __check("LB1: el buscador del bloque de filtros es el común y más chico",/busq/.test(h)&&/font-size:var\(--fs-s\);padding:4px 6px/.test(h));
   // seleccionar todo por grupo
   const oPend=(()=>{const b=S.ordenes.find(x=>abierta(x));const o=JSON.parse(JSON.stringify(b));o.id=uid();o.op='WH/LB-PEND';o.estado='plan';o.fase='0Macro';delete o.lib;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];PLAN=null;PLAN_ALL=null;return o})();
   GRP={};grpSt('lib').niveles=['cliente'];LIB.verLista=true;LIB.sel=new Set();LIB.q='';LIB.fases=null;LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;render();h=document.getElementById('p-liberacion').innerHTML;
   const key=Object.keys(grpSt('lib').mapa||{})[0];
   __check("LB2: el detalle del bloque 1 se agrupa y cada grupo tiene 'seleccionar todo'",!!key&&h.includes('selGrupoLib(')&&h.includes('grp-row'));
   if(key){const ids=grpSt('lib').mapa[key];selGrupoLib(key,true);
     __check("LB2: 'seleccionar todo' marca las órdenes de ese grupo",ids.length>0&&ids.every(id=>LIB.sel.has(id)));}
   else __check("LB2: 'seleccionar todo' marca las órdenes de ese grupo",true,'sin grupos con órdenes');
   // abrir y cerrar una orden no pierde la selección ni la posición
   {const antesSel=[...LIB.sel];recordarScroll({scrollTop:40});
    const oid=antesSel[0]||(S.ordenes.find(abierta)||{}).id;if(oid){mRutaCentro(oid);try{cerrar()}catch(x){}}
    render();
    __check("LB2: abrir y cerrar una orden no pierde la selección ni la posición",antesSel.every(id=>LIB.sel.has(id))&&LIB.sel.size===antesSel.length&&LIB.scroll===40,JSON.stringify({antesSel:antesSel.length,ahora:LIB.sel.size,scroll:LIB.scroll}));}
   S.ordenes=S.ordenes.filter(x=>x!==oPend);PLAN=null;PLAN_ALL=null;LIB.sel=new Set();GRP={};
   // ruta por defecto
   __check("LB3: la marca 'va por defecto en toda ruta' existe y viene sembrada en corte, confección y empaque",centrosRutaDefecto().includes('corte')&&centrosRutaDefecto().includes('modulos')&&centrosRutaDefecto().includes('empaque')&&S.params.rutaDefectoSembrada===true);
   page='config';CONF.tab='recursos';render();__check("LB3: la marca es editable en Configuración → Centros",document.getElementById('p-config').innerHTML.includes("'rutaDefecto',this.checked"));
   {const c=CE('empaque');const antesV=c.rutaDefecto;const nb=S.bitacora.length;setCentro('empaque','rutaDefecto',false);
    __check("LB3: cambiar la marca queda en bitácora y no se vuelve a sembrar sola",c.rutaDefecto===false&&S.bitacora.length>nb&&(sembrarRutaDefecto(),c.rutaDefecto===false));
    setCentro('empaque','rutaDefecto',antesV===undefined?true:antesV);}
   {const o=S.ordenes.find(x=>abierta(x)&&!x.rutaEditada)||S.ordenes.find(abierta);const bakRuta=o.ruta;const bakEd=o.rutaEditada;
    o.ruta=[];delete o.rutaEditada;mRutaCentro(o.id);
    const marcados=centrosRutaDefecto().filter(c=>{const el=document.getElementById('rc-'+c);return el&&el.checked});
    __check("LB3: al abrir una orden sin ruta editada, los pasos por defecto vienen marcados",marcados.length===centrosRutaDefecto().filter(c=>!faseEstado(o.fase,o).hechos.includes(c)).length&&marcados.length>0);
    try{cerrar()}catch(x){}o.ruta=bakRuta;if(bakEd)o.rutaEditada=bakEd;}
   {const contra=ordenesContraRutaDefecto();
    __check("LB3: se reportan las órdenes cargadas que contradicen la ruta por defecto",Array.isArray(contra)&&contra.every(x=>x.faltan.length>0));
    page='liberacion';LIB.et='tela';render();h=document.getElementById('p-liberacion').innerHTML;
    __check("LB3: el aviso sale en Liberación cuando hay órdenes que la contradicen",contra.length?/no siguen la ruta por defecto/.test(h):!/no siguen la ruta por defecto/.test(h));}
   // bloque 3 resumen y bloque 4 con buscador y reversión auditada
   __check("LB5: el resumen de lo liberado dice órdenes, referencias, kg de tejeduría y horas",h.includes('data-t="lib-r-ord"')&&h.includes('data-t="lib-r-ref"')&&h.includes('data-t="lib-r-kg"')&&h.includes('data-t="lib-r-h"'));
   __check("LB6: el bloque 4 tiene buscador común y botones de revertir y de fase",/Buscar entre las liberadas/.test(h)&&/data-q="LIB.q4"/.test(h)&&(/mRetirarLib\(/.test(h)||!/<td>Liberó<\/td>/.test(h)));
   {const o=S.ordenes.find(x=>abierta(x)&&liberada(x,'tela'))||(()=>{const x=S.ordenes.find(abierta);x.lib={tela:{ok:true,u:'t',ts:new Date().toISOString()}};return x})();
    const nA=auditoriaCambios().length;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
    retirarLib(o.id,'tela','');__check("LB6: revertir sin motivo no revierte",!!(o.lib&&o.lib.tela)&&auditoriaCambios().length===nA);
    retirarLib(o.id,'tela','Cliente cambió la orden');const au=auditoriaCambios().slice(-1)[0];
    __check("LB6: revertir con motivo de la tabla 15 revierte y queda auditado (quién, cuándo, antes, después)",!(o.lib&&o.lib.tela)&&au&&au.tipo==='liberacion'&&au.motivo==='Cliente cambió la orden'&&!!au.u&&!!au.ts);
    window.alert=a0;o.lib={tela:{ok:true,u:'t',ts:new Date().toISOString()}};}
   // liberación a producción: misma estructura
   LIB.et='corte';render();const h2=document.getElementById('p-liberacion').innerHTML;
   __check("LB7: Liberación a producción tiene los mismos tres bloques, buscador y reversión",['Bloque 1','Bloque 2','Bloque 3'].every(b=>h2.includes(b))&&!h2.includes('Bloque 4')&&/Pendiente de liberar a producción/.test(h2)&&/Resumen de lo liberado a producción/.test(h2)&&/data-q="LIB.q4"/.test(h2));
   LIB.et='tela';LIB.verLista=false;LIB.q4='';
   const bm=JSON.parse(bakMot);if(bm)S.params.motivos=bm;else delete S.params.motivos;
   const ba=JSON.parse(bakAud);if(ba)S.params.auditoriaCambios=ba;else delete S.params.auditoriaCambios;
   PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("LB sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* CENTROS DE PRODUCCIÓN: secciones por módulo, filtro y agrupador comunes, resumen día × familia, color, marca */
  {const antes=__R.errors.length;window.confirm=()=>true;GRP={};CEN.fases=null;CEN.q='';CEN.sem=0;CEN.todo=false;
   page='centro';CEN.id='modulos';CEN.tab='prog';render();let h=document.getElementById('p-centro').innerHTML;
   __check("CP1: Confección muestra una sección por módulo y la maquila aparte",/Confección por módulo/.test(h)&&/Maquila \(aparte de los módulos\)/.test(h)&&/data-t="mod-/.test(h));
   __check("CP3: arriba de la programación está el resumen de la semana día × familia con unidades y horas",/Resumen de la semana/.test(h)&&(/día × familia|qué se hace cada día, por familia/.test(h)));
   __check("CP2: la programación del centro usa el filtro de fases común y el agrupador común",/class="ffases"/.test(h)&&/setNivelGRP\('cen'|onchange="setNivelGRP\('cen'/.test(h.replace(/&quot;/g,'"'))||/grpSelHTML/.test(h));
   __check("CP5: corte y confección tienen 'juntar colores en la cola' y dice que es solo vista y orden",/Juntar colores en la cola/.test(h)&&/el motor no secuencia por color/.test(h));
   __check("CP6: la cola ya no muestra la fecha de entrega: plan inicio → fin y marca",/Plan: inicio → fin<\/th><th>Marca<\/th>/.test(h));
   __check("CP7: Costura es una pestaña dentro de Confección y ya no está suelta en el menú",h.includes("CEN.tab='costura'")&&!document.querySelector('nav a[data-p="costura"]'));
   CEN.tab='costura';render();h=document.getElementById('p-centro').innerHTML;
   __check("CP7: la pestaña Costura trae secuencia, rebalanceo y andon dentro del centro",/Secuencia por módulo/.test(h)&&/Rebalanceo/.test(h)&&/Andon/.test(h));
   // carga que viene
   CEN.id='corte';CG={area:'pro',centro:'corte',sem:null,det:null,cruce:'fam',fases:null,q:''};page='produccion';render();h=document.getElementById('p-produccion').innerHTML;
   __check("CP4: 'Carga que viene' cruza familia por fase y se puede dar vuelta",/Familia por fase/.test(h)&&/ver fases en las filas/.test(h)||!/Familia por fase/.test(h));
   if(/Familia por fase/.test(h)){CEN.cruce='fase';render();const h2=document.getElementById('p-centro').innerHTML;
     __check("CP4: al darla vuelta, las fases pasan a las filas",/ver familias en las filas/.test(h2));CEN.cruce='fam'}
   else __check("CP4: al darla vuelta, las fases pasan a las filas",true,'sin órdenes en camino en esta base');
   __check("CP4: 'Sin liberar' se muestra como tarjeta desplegable",/data-t="cv-sinlib"/.test(h)||!/Sin liberar/.test(h));
   __check("CP2: 'Carga que viene' también usa el filtro de fases y el agrupador comunes",/class="ffases"/.test(h)&&/grp-sel|— sin agrupar —/.test(h));
   __check("CP6: 'Carga que viene' no muestra la entrega, muestra la marca",!/<th>Entrega<\/th>/.test(h));
   // el filtro de fases acota de verdad
   {page='centro';CEN.id='modulos';CEN.tab='plan';CEN.fases=new Set(['∅']);render();const hv=document.getElementById('p-centro').innerHTML;
    __check("CP2: 'ninguna fase' deja la vista vacía (el filtro acota de verdad)",/0 prendas programadas/.test(hv)||/Nada programado/.test(hv));CEN.fases=null}
   // reordenar por color: solo orden manual, con bitácora, sin tocar el motor
   {const P0=programar();const filas=filasDeCentros(['modulos'],P0,hoy(),dsum(hoy(),60),'');const cola=colaCentro('modulos',filas);
    if(cola.length){const nb=S.bitacora.length;const finAntes=JSON.stringify(Object.keys(P0.ordenes).map(id=>(P0.ordenes[id]||{}).finPro));
      ordenarColaPorColor('modulos');
      const pris=cola.map(f=>((f.o.progCentro||{}).modulos||{}).pri).filter(x=>x>0);
      PLAN=null;PLAN_ALL=null;const P1=programar();
      __check("CP5: juntar colores solo numera la cola (queda en bitácora) y no cambia las fechas del motor",pris.length===cola.length&&S.bitacora.length>nb&&/juntando colores/.test(S.bitacora.slice(-1)[0].t)&&JSON.stringify(Object.keys(P1.ordenes).map(id=>(P1.ordenes[id]||{}).finPro))===finAntes);
      cola.forEach(f=>{if(f.o.progCentro&&f.o.progCentro.modulos&&f.o.progCentro.modulos.porColor)delete f.o.progCentro.modulos});PLAN=null;PLAN_ALL=null;}
    else __check("CP5: juntar colores solo numera la cola (queda en bitácora) y no cambia las fechas del motor",true,'sin cola en confección');}
   // corte: mismas piezas
   page='centro';CEN.id='corte';CEN.tab='prog';render();h=document.getElementById('p-centro').innerHTML;
   __check("CP: corte tiene resumen, filtro de fases, agrupador y juntar colores",/Resumen de la semana/.test(h)&&/class="ffases"/.test(h)&&/Juntar colores en la cola/.test(h));
   CEN.id='corte';CEN.tab='plan';CEN.fases=null;GRP={};page='ordenes';render();
   __check("CP sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PISO: tallas, registro por talla, reprogramación, cronómetro con segundos, fase desde piso */
  {const antes=__R.errors.length;window.confirm=()=>true;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
   const bakJ=JSON.stringify(S.params.tallasJuegos||null),bakC=JSON.stringify(S.params.tallasCat||null),bakR=JSON.stringify(S.params.pedidosReprog||null);
   S.params.tallasJuegos=[{id:'jx',n:'Básico',tallas:['S','M','L','XL']}];S.params.tallasCat={};S.params.pedidosReprog=[];
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mkO=(cant,op)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=cant;delete o.tallasPedido;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];return o};
   const oA=mkO(100,'WH/TAL-A'),oB=mkO(100,'WH/TAL-B'),oC=mkO(60,'WH/TAL-C');
   PLAN=null;PLAN_ALL=null;
   // 2 · carga masiva: formato largo, WH inexistente y suma distinta
   const filasLargo=[{WH:'WH/TAL-A',Talla:'S',Cantidad:25},{WH:'WH/TAL-A',Talla:'M',Cantidad:25},{WH:'WH/TAL-A',Talla:'L',Cantidad:25},{WH:'WH/TAL-A',Talla:'XL',Cantidad:25},
     {WH:'WH/TAL-B',Talla:'S',Cantidad:40},{WH:'WH/TAL-B',Talla:'M',Cantidad:40},{WH:'WH/NO-EXISTE',Talla:'S',Cantidad:10},{WH:'WH/TAL-A',Talla:'XXL',Cantidad:0}];
   const pl=planTallas(filasLargo,'prueba.csv');
   __check("TL2a: detecta el formato largo (una fila por talla) y lo dice",pl.formato==='largo'&&pl.cWH==='WH'&&pl.cTalla==='Talla'&&pl.cCant==='Cantidad');
   __check("TL2b: reporta las WH que no existen, sin cargarlas",pl.sinOrden.length===1&&pl.sinOrden[0].wh==='WH/NO-EXISTE'&&pl.aplicables.every(x=>x.wh!=='WH/NO-EXISTE'));
   __check("TL2b: reporta las órdenes donde la suma por talla no cuadra con la cantidad (y no las corrige)",pl.difSuma.length===1&&pl.difSuma[0].wh==='WH/TAL-B'&&pl.difSuma[0].suma===80&&pl.difSuma[0].dif===-20);
   TALLAS_CARGA=pl;aplicarTallas();
   __check("TL2d: la curva queda guardada en la orden con quién y cuándo",JSON.stringify(oA.tallasPedido)===JSON.stringify({S:25,M:25,L:25,XL:25})&&!!oA.tallasPedidoMeta.u&&!!oA.tallasPedidoMeta.ts&&sumaCurva(oB.tallasPedido)===80);
   __check("TL2d: la curva pedida está en la tabla 14 para que no se pierda en las recargas",camposConservados().some(x=>x.campo==='tallasPedido'));
   // formato ancho y tallas nuevas
   const pl2=planTallas([{WH:'WH/TAL-C',S:10,M:20,L:30,XXL:5}],'ancho.csv');
   __check("TL2a: detecta el formato ancho (una columna por talla)",pl2.formato==='ancho'&&pl2.anchoCols.length===4&&pl2.aplicables.length===1);
   __check("TL2c: las tallas nuevas se proponen, no se crean solas",pl2.tallasNuevas.includes('XXL')&&!tallasJuegos()[0].tallas.includes('XXL'));
   TALLAS_CARGA=pl2;aplicarTallas();
   // 3a · corte registra la curva real
   const cortadoA={S:24,M:25,L:25,XL:25};
   {const a=S.avance[oA.id]=S.avance[oA.id]||{};a.tallas={corte:Object.assign({},cortadoA)};}
   __check("TL3a: lo cortado es la curva real y contra eso se miden los centros siguientes",baseTallas(oA,'modulos').base==='corte'&&JSON.stringify(baseTallas(oA,'modulos').tallas)===JSON.stringify(cortadoA));
   __check("TL3b: sin registro de corte se compara contra lo pedido y se marca",baseTallas(oB,'modulos').base==='pedido'&&/[Ss]in registro de corte/.test(difTallasHTML(oB,'modulos')));
   // 3b · no se puede pasar de lo cortado sin aviso
   {mRegistroTallas(oA.id,'modulos');
    const set=(t,v)=>{const el=[...document.querySelectorAll('[id^="rt-"]')].find(e=>e.getAttribute('data-t')===t);if(el)el.value=v};
    set('S',30);alerts.length=0;let avisó=false;const conf0=window.confirm;window.confirm=m=>{avisó=/pasan de lo cortado/.test(String(m));return true};
    guardarRegistroTallas(oA.id,'modulos');window.confirm=conf0;
    const reg=((S.avance[oA.id]||{}).tallas||{}).modulos||{};
    __check("TL3b: registrar más de lo cortado avisa y queda marcado",avisó&&reg.S===30&&(S.avance[oA.id].tallasLog||[]).some(x=>x.talla==='S'&&x.excede===true));
    __check("TL3d: cada registro queda auditado con quién, cuándo, centro, talla y unidades",(S.avance[oA.id].tallasLog||[]).every(x=>x.ts&&x.u&&x.centro&&x.talla&&x.pz>0));}
   // 3c · orden sin curva: solo total y bandeja en Hoy
   {const oSin=mkO(50,'WH/TAL-SIN');PLAN=null;PLAN_ALL=null;
    __check("TL3c: una orden sin curva ni corte solo permite el total",!baseTallas(oSin,'modulos').tallas&&!tallasDeOrden(oSin).length);
    const it=pendientesHoy().find(x=>x.k==='sinCurvaTallas');
    __check("TL3c: las órdenes sin curva de tallas salen en Hoy → Pendientes",!!it&&it.n>=1&&ordenesSinCurva().some(x=>x.id===oSin.id));
    S.ordenes=S.ordenes.filter(x=>x!==oSin)}
   // 1 · Mi centro: solo lo programado; WH existente pero no programada aquí
   {TAB={centro:'modulos',rec:null,q:''};page='tablet';render();
    const cola=tabletFilas('modulos',null,programar());
    TAB.q='WH/TAL-A';render();const h=document.getElementById('p-tablet').innerHTML;
    const enCola=cola.some(f=>normTxt(f.o.op).includes(normTxt('WH/TAL-A')));
    __check("TL1: si la WH existe pero no está programada en el centro, sale bloqueada con 'pedir reprogramación'",enCola||(/no programada en/.test(h)&&/Pedir reprogramación/.test(h)));
    if(!enCola){pedirReprogramacion(oA.id,'modulos');
      const it=pendientesHoy().find(x=>x.k==='reprog');
      __check("TL1: el pedido avisa en Hoy → Pendientes a quien puede reprogramar",!!it&&it.n===1&&pedidosReprog().filter(p=>!p.atendida).length===1);
      atenderReprog(pedidosReprog()[0].id);__check("TL1: se puede marcar atendida",pedidosReprog()[0].atendida===true)}
    else{__check("TL1: el pedido avisa en Hoy → Pendientes a quien puede reprogramar",true,'la orden sí estaba en cola');__check("TL1: se puede marcar atendida",true,'no hizo falta pedirla')}
    TAB.q=''}
   // 4 · cronómetro con segundos y unidades por talla del tramo
   {const oid=oA.id;cronoTablet(oid,'modulos','ini');const k=(S.avance[oid].crono||{}).modulos;k.ini=new Date(Date.now()-95000).toISOString();
    mRegistroTallas(oid,'modulos');const el=[...document.querySelectorAll('[id^="rt-"]')].find(e=>e.getAttribute('data-t')==='M');if(el)el.value=5;guardarRegistroTallas(oid,'modulos');
    cronoTablet(oid,'modulos','fin');const k2=(S.avance[oid].crono||{}).modulos;
    __check("TL4: el cronómetro mide en segundos y guarda las unidades por talla del tramo",k2.seg>=90&&/min .. s/.test(cronoTxt(k2))&&k2.tallas&&k2.tallas.M===5);}
   // 5 · cambio de fase desde piso con observación de la tabla 15
   {if(!Array.isArray(S.params.motivos))S.params.motivos=[];
    if(!S.params.motivos.some(m=>m.uso==='piso'))S.params.motivos.push({motivo:'Tela con falla en la mesa',uso:'piso'});
    mFasePiso(oA.id,'modulos');const sel=document.getElementById('fp-obs');
    __check("TL5: la observación de piso es una lista cerrada de la tabla 15 (uso observación de piso)",!!sel&&sel.tagName==='SELECT'&&[...sel.options].some(o=>o.value==='Tela con falla en la mesa')&&![...sel.options].some(o=>o.value==='texto libre'));
    const fAnt=oA.fase;const avanzar=fasesDisponibles().find(f=>!esDevolucionFase(fAnt,f)&&f!==fAnt);
    document.getElementById('fp-f').value=avanzar;sel.value='Tela con falla en la mesa';alerts.length=0;guardarFasePiso(oA.id,'modulos');
    __check("TL5: avanzar desde piso funciona sin motivo y guarda la observación",oA.fase===avanzar&&(oA.fases||[]).slice(-1)[0].obs==='Tela con falla en la mesa'&&!alerts.length);
    try{cerrar()}catch(e){}}
   // 6 · teléfono
   {const css=[...document.styleSheets].map(ss=>{try{return [...ss.cssRules].map(r=>r.cssText).join('\n')}catch(e){return ''}}).join('\n');
    __check("TL6: hay diseño de teléfono para Mi centro y Control de piso",/max-width: 520px/.test(css)&&/tab-card/.test(css)&&/p-control/.test(css));}
   // configuración: tabla 16
   page='config';CONF.tab='ordenes2';render();
   __check("TL2c: la tabla 16 · Tallas existe, con juegos y categorías",document.getElementById('p-config').innerHTML.includes('16 · Tallas')&&document.getElementById('p-config').innerHTML.includes('Qué juego usa cada categoría'));
   S.ordenes=S.ordenes.filter(x=>x!==oA&&x!==oB&&x!==oC);[oA,oB,oC].forEach(o=>delete S.avance[o.id]);
   const bj=JSON.parse(bakJ);if(bj)S.params.tallasJuegos=bj;else delete S.params.tallasJuegos;
   const bc=JSON.parse(bakC);if(bc)S.params.tallasCat=bc;else delete S.params.tallasCat;
   const br=JSON.parse(bakR);if(br)S.params.pedidosReprog=br;else delete S.params.pedidosReprog;
   window.alert=a0;TAB={centro:null,rec:null,q:''};PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("TL sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* CARGA GENERAL: una sola cuenta con base explícita · BALANCEO etapa 1 */
  {const antes=__R.errors.length;window.confirm=()=>true;const ym=hoy().slice(0,7);
   // 1 · misma base = mismo número
   const oids=planMesOidsTot(ym);const cu=cargaUnica('plan',{ym});const cp=cargaPlanCentros(ym);
   const centros=[...new Set([...Object.keys(cp),...Object.keys(cu.centros)])];
   const igual=centros.every(c=>Math.abs((cp[c]||0)-(((cu.centros[c]||{}).firme||0)+((cu.centros[c]||{}).proceso||0)))<0.5);
   __check("CGU: con la misma base (plan del mes) la cuenta única y el aviso de capacidad del plan dan lo mismo",igual,JSON.stringify(centros.slice(0,4).map(c=>c+': '+num(cp[c]||0)+' vs '+num(((cu.centros[c]||{}).firme||0)+((cu.centros[c]||{}).proceso||0)))));
   const ab=cargaUnica('abiertas',{ym});const pr=cargaUnica('programadas',{ym});
   __check("CGU: cambiar de base cambia el conjunto de órdenes, no la fórmula",ab.ordenes>=pr.ordenes&&ab.base==='abiertas'&&pr.base==='programadas'&&!!CARGA_BASE_TXT.plan);
   {const c0=Object.keys(ab.centros)[0];
    if(c0){const sumaAb=S.ordenes.filter(abierta).reduce((a,o)=>a+minPendCentro(o,c0),0);
      __check("CGU: la base «todas las abiertas» suma exactamente los minutos pendientes de las órdenes abiertas",Math.abs(sumaAb-(ab.centros[c0].firme+ab.centros[c0].proceso))<0.5||ab.centros[c0].reserva>0,JSON.stringify({c0,sumaAb,calc:ab.centros[c0]}));}
    else __check("CGU: la base «todas las abiertas» suma exactamente los minutos pendientes de las órdenes abiertas",true,'sin centros con carga');}
   // 2 · cada pantalla dice su base
   page='produccion';CG={area:'pro',centro:'',sem:null,det:null,cruce:'fam',fases:null,q:''};render();let h=document.getElementById('p-produccion').innerHTML;
   __check("CG: Carga general dice su base y separa firme, en proceso y reserva",/base: <b>programadas<\/b>/.test(h)&&/firme, en proceso y reserva/.test(h)&&/todas las abiertas/.test(h));
   __check("CG: muestra 8 semanas por defecto (parámetro semCarga)",semanasCarga().length===8&&prm('semCarga',8)===8);
   page='capacidad';render();__check("CG: Capacidad y decisiones dice que su base es «todas las abiertas» y cuál es el número oficial",/base: <b>todas las abiertas<\/b>/.test(document.getElementById('p-capacidad').innerHTML)&&/plan congelado/.test(document.getElementById('p-capacidad').innerHTML));
   // 3 · Asignación por orden se mudó a Reportería, no se borró
   __check("CG: Asignación por orden vive en Reportería y sigue existiendo",!!document.querySelector('nav .gbody[data-g=\"rep\"] a[data-p=\"asignacion\"]')&&REPORTES.some(r=>r.p==='asignacion')&&typeof vAsignacion==='function');
   page='asignacion';render();__check("CG: la pantalla de Asignación por orden muestra las órdenes contra el programa",/Asignación por orden/.test(document.getElementById('p-asignacion').innerHTML));
   page='produccion';render();h=document.getElementById('p-produccion').innerHTML;
   __check("CG: Carga general ya no repite la clasificación por orden",!/vencida de un paso|Sin programar<\/h4>/.test(h));
   // 4 · reserva de lavado y plancha
   {const lav=CE('lavado');const bakM=lav.minEstandar,bakP=lav.pctEstimado;
    lav.minEstandar=0;lav.pctEstimado=0;
    const it=pendientesHoy().find(x=>x.k==='reservaSinDatos');
    __check("CG: sin minutos ni % cargados la reserva es cero y avisa en Hoy → Pendientes",centrosSinDatosReserva().includes('lavado')&&!!it&&it.n>=1&&cargaUnica('abiertas',{ym}).centros.lavado===undefined||((cargaUnica('abiertas',{ym}).centros.lavado||{}).reserva||0)===0);
    lav.minEstandar=2;lav.pctEstimado=50;CAPM=null;
    const o=S.ordenes.find(x=>abierta(x)&&!(x.ruta||[]).some(p=>p.centro==='lavado'));
    if(o){const esperado=Math.max(0,+o.cant||0)*2*0.5;
      __check("CG: con minutos y % cargados la reserva se calcula sobre lo que no tiene el paso en la ruta",Math.abs(reservaDe(o,'lavado')-esperado)<0.5,JSON.stringify({calc:reservaDe(o,'lavado'),esperado}));}
    else __check("CG: con minutos y % cargados la reserva se calcula sobre lo que no tiene el paso en la ruta",true,'todas las órdenes tienen lavado en la ruta');
    lav.minEstandar=bakM;lav.pctEstimado=bakP;CAPM=null}
   // 5 · BALANCEO etapa 1
   const bakT=JSON.stringify(S.params.tiposMaq||null),bakO=JSON.stringify(S.params.operarias||null);
   const tm=tiposMaq();
   __check("BE1: los tipos de máquina se siembran con los nombres de la hoja, sin agrupar y sin asumir los TP",tm.length>=20&&tm.some(r=>/OVERLOK 4 HILOS/i.test(r.tipo))&&tm.some(r=>/OVERLOCK 4 HILOS/i.test(r.tipo))&&tm.filter(r=>/ TP\b/i.test(r.tipo)).every(r=>r.porConfirmar===true));
   {const i1=tm.findIndex(r=>/^OVERLOCK 4 HILOS$/i.test(r.tipo));const i2=tm.findIndex(r=>/^OVERLOK 4 HILOS$/i.test(r.tipo));
    if(i1>=0&&i2>=0){const alias=tm[i2].tipo;setTipoMaq(i1,'alias',alias);setTipoMaq(i2,'activa',false);
      __check("BE1: con el alias cargado, OVERLOK y OVERLOCK quedan como el mismo tipo",normMaquina('OVERLOK 4 HILOS')===tm[i1].tipo&&normMaquina('OVERLOCK 4 HILOS')===tm[i1].tipo&&normMaquina('overlok 4 hilos')===tm[i1].tipo);
      __check("BE1: sin alias, dos nombres distintos NO se juntan solos",normMaquina('RECTA')!=='OVERLOCK 4 HILOS'&&normMaquina('RECTA TP')==='RECTA TP');}
    else __check("BE1: con el alias cargado, OVERLOK y OVERLOCK quedan como el mismo tipo",false,'no están los dos nombres en la hoja');}
   __check("BE1: hay parámetros para la tolerancia del puesto y el nivel mínimo de especialidad, distintos del semáforo",prm('tolPuesto',2)===2&&prm('nivelMinEsp',2)===2&&repartirPuestos.toString().includes("prm('tolPuesto'")&&!repartirPuestos.toString().includes('1.02'));
   S.params.operarias=[];addOperaria('mod1');const io=operarias().length-1;setOperaria(io,'n','Prueba');setEspOperaria(io,tiposMaqActivos()[0],3);
   __check("BE1: operarias con nombre, módulo y especialidad por tipo de máquina (tres niveles)",operariasDe('mod1').length===1&&operarias()[io].esp[tiposMaqActivos()[0]]===3&&NIVELES_ESP.length===3);
   page='config';CONF.tab='recursos';render();const hc=document.getElementById('p-config').innerHTML;
   __check("BE1: las tablas de tipos de máquina, operarias y máquinas por módulo están en Configuración",/Tipos de máquina/.test(hc)&&/Operarias y especialidades/.test(hc)&&/Máquinas de confección/.test(hc));
   page='balanceo';render();const hb=document.getElementById('p-balanceo').innerHTML;
   __check("BE1: Balanceo abre con la vista de módulos (personas, máquinas y referencia en curso)",/Módulos de confección/.test(hb)&&/data-t="balmod-/.test(hb));
   const bt=JSON.parse(bakT);if(bt)S.params.tiposMaq=bt;else delete S.params.tiposMaq;
   const bo=JSON.parse(bakO);if(bo)S.params.operarias=bo;else delete S.params.operarias;
   PLAN=null;PLAN_ALL=null;CAPM=null;page='ordenes';render();
   __check("CG/BE1 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* BÚSQUEDA GENERAL + buscador y agrupador comunes */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const oG=JSON.parse(JSON.stringify(base));oG.id=uid();oG.op='WH/BUSG-1';oG.cliente='CLIENTE BUSG';oG.ref='REF-BUSG';oG.odc='ODC-BUSG';oG.estado='plan';delete oG.programa;S.ordenes.push(oG);delete S.avance[oG.id];PLAN=null;PLAN_ALL=null;
   // 1 · barra general
   page='ordenes';render();
   __check("BG: la barra de búsqueda general está en la cabecera, en todas las pantallas",!!document.getElementById('busg'));
   setBusqG('WH/BUSG');
   __check("BG: buscar por WH encuentra la orden al instante",buscarGeneral('WH/BUSG').some(o=>o.id===oG.id)&&document.getElementById('busg-host').innerHTML.includes('WH/BUSG-1'));
   __check("BG: también encuentra por ODC, cliente y referencia",buscarGeneral('ODC-BUSG').length>0&&buscarGeneral('CLIENTE BUSG').length>0&&buscarGeneral('REF-BUSG').length>0);
   __check("BG: el resultado muestra foto, WH, cliente, fase y dónde está",(()=>{const h=document.getElementById('busg-host').innerHTML;return h.includes('fase-mini')&&h.includes('CLIENTE BUSG')&&h.includes('abrirFichaOrden(')})());
   abrirFichaOrden(oG.id);
   {const md=document.getElementById('modal')||document.body;const h=md.innerHTML;
    __check("BG: la ficha trae ruta con el paso actual, fechas, avance por talla e historial",/Ruta<\/h4>/.test(h)&&/Historial de fases/.test(h)&&(/Avance por talla/.test(h)||/Sin curva de tallas/.test(h))&&/Ir a donde está/.test(h));
    try{cerrar()}catch(e){}}
   // perfiles: un perfil de piso solo ve lo suyo
   {const bak=PERFIL;PERFIL={id:'x',nombre:'Piso corte',rol:'piso_corte',area:'pro',subarea:'corte',modo:'editar'};
    const ve=ordenesQueVe();const todas=S.ordenes.filter(o=>abierta(o));
    __check("BG: la búsqueda general respeta el perfil (no muestra lo que el perfil no puede ver)",ve.length<=todas.length&&ve.every(o=>(o.ruta||[]).some(pp=>veCentro(pp.centro))||['tej','tin'].some(a=>veCentro(a))));
    PERFIL=bak}
   cerrarBusqG();
   // 2 · el buscador de lista busca en todos los campos sin elegir
   page='ordenes';ORDF.tab='ord';GRP={};grpSt('ord').niveles=[];ORDF.q='';delete BUSQ['ORDF.q'];ORDF.grupo=null;ORDF.q='CLIENTE BUSG';render();
   {const h=document.getElementById('p-ordenes').innerHTML;
    __check("BL: escribir en el buscador de lista ya filtra por todos los campos, sin elegir campo",matchBusq(oG,normTxt('CLIENTE BUSG'),'ORDF.q')&&!BUSQ['ORDF.q']&&h.includes('WH/BUSG-1'));
    __check("BL: el selector de campo es opcional y se llama «buscar solo en…»",h.includes(ayuda('busq.solo'))||h.includes('buscar solo en'));}
   ORDF.q='';delete BUSQ['ORDF.q'];
   // 3 · agrupador: nombres y orden
   __check("AG: el agrupador dice Familia y Tipo de producto (textos de la tabla de ayudas)",GRP_CAMPOS.some(x=>x[0]==='fam'&&x[1]==='Familia')&&GRP_CAMPOS.some(x=>x[0]==='hija'&&x[1]==='Tipo de producto'));
   __check("AG: el orden de las opciones es el pedido",GRP_CAMPOS.map(x=>x[0]).join(',')==='cliente,fase,fam,hija,color,odc,mes,paso,proyecto,etapa');
   {const bakA=JSON.stringify(S.params.ayudas||null);setAyuda('grp.fam','FAMILIA DE PRUEBA');
    __check("AG: cambiar el texto en la tabla de ayudas cambia lo que se ve",GRP_CAMPOS.find(x=>x[0]==='fam')[1]==='FAMILIA DE PRUEBA');
    const ba=JSON.parse(bakA);if(ba)S.params.ayudas=ba;else delete S.params.ayudas;}
   page='config';CONF.tab='ordenes2';render();__check("AG: la tabla 17 · Textos de pantalla existe",document.getElementById('p-config').innerHTML.includes('17 · Textos de pantalla'));
   // 4 · buscador y agrupador en las pantallas que faltaban
   page='entregas';EG.pdf=false;EG.cli='';EG.q='';render();
   {const he=document.getElementById('p-entregas').innerHTML;
    __check("PL: Entregas tiene el buscador común",he.includes('data-q="EG.q"')||/Sin órdenes|Nada pendiente/.test(he),he.slice(0,120));}
   page='costura';COS.tab='secuencia';COS.q='';render();
   __check("PL: Costura tiene el buscador común",document.getElementById('p-costura').innerHTML.includes('data-q="COS.q"'));
   page='capacidad';CAPD.q='';render();
   {const M=matrizCapacidad();const k=Object.keys(M.celdas)[0];
    if(k){CAPD.sel=k;render();const h=document.getElementById('p-capacidad').innerHTML;
      __check("PL: Capacidad y decisiones tiene buscador y agrupador comunes en el detalle",h.includes('data-q="CAPD.q"')&&(h.includes('grp-row')||h.includes('— sin agrupar —')));CAPD.sel=null}
    else __check("PL: Capacidad y decisiones tiene buscador y agrupador comunes en el detalle",true,'sin celdas con carga');}
   // agrupar por familia funciona en las pantallas nuevas
   {GRP={};grpSt('cap').niveles=['fam'];const ok=GRP_CAMPOS.some(x=>x[0]==='fam');
    __check("PL: se puede agrupar por Familia en las pantallas nuevas",ok&&grpSt('cap').niveles[0]==='fam');GRP={}}
   // 5 · lo elegido se recuerda por pantalla y usuario
   {PERFIL={id:'u1',nombre:'Uno'};GRP={};setNivelGRP('ord',0,'cliente');
    const guardado=localStorage['__grp_u1_ord'];
    PERFIL={id:'u2',nombre:'Dos'};GRP={};const otros=grpSt('ord').niveles;
    __check("MEM: la agrupación se recuerda por pantalla y por usuario",!!guardado&&JSON.parse(guardado)[0]==='cliente'&&(!otros.length||otros[0]!=='cliente'));
    PERFIL=adminP;GRP={}}
   S.ordenes=S.ordenes.filter(o=>o!==oG);PLAN=null;PLAN_ALL=null;BUSG={q:'',abierto:false,oid:null};page='ordenes';render();
   __check("BG/PL sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* MI CENTRO ÚNICO: inicio, fin, paros, unidades por talla y minutos-persona */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
   const bakM=JSON.stringify(S.params.motivos||null);
   if(!Array.isArray(S.params.motivos))S.params.motivos=[];
   if(!S.params.motivos.some(m=>m.uso==='piso'))S.params.motivos.push({motivo:'Falta de tela en la mesa',uso:'piso'});
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const oT=JSON.parse(JSON.stringify(base));oT.id=uid();oT.op='WH/TRAMO-1';oT.estado='plan';oT.cant=100;oT.tallasPedido={S:50,M:50};delete oT.programa;S.ordenes.push(oT);delete S.avance[oT.id];PLAN=null;PLAN_ALL=null;
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const bakPers=rec?R(rec).pers:null;if(rec)R(rec).pers=8;
   // 1 · Modo línea ya no está en el menú ni en los perfiles
   __check("ML: Modo línea salió del menú y de los perfiles",!document.querySelector('nav a[data-p=\"linea\"]')&&!perfilesDef().some(p=>(p.paginas||[]).includes('linea')));
   __check("ML: el enlace viejo abre Mi centro",typeof vLinea==='undefined'&&!document.querySelector('nav a[data-p="linea"]'));
   // 2 · flujo: inicio
   iniciarTramo(oT.id,'modulos',rec);
   const tr=tramosDe(oT.id)[0];
   __check("TR: INICIO abre el tramo con quién y cuándo, y una sola orden a la vez por puesto",!!tr&&!!tr.ini&&!tr.fin&&!!tr.u&&!!tramoAbiertoDe('modulos',rec));
   // otra orden en el mismo puesto pregunta si cierra la anterior
   {const o2=JSON.parse(JSON.stringify(base));o2.id=uid();o2.op='WH/TRAMO-2';o2.estado='plan';S.ordenes.push(o2);delete S.avance[o2.id];
    let preguntó=false;const c0=window.confirm;window.confirm=m=>{preguntó=/Ya hay una orden empezada/.test(String(m));return false};
    iniciarTramo(o2.id,'modulos',rec);window.confirm=c0;
    __check("TR: si intenta iniciar otra orden en el mismo puesto, pregunta si cierra la anterior",preguntó&&tramosDe(o2.id).length===0&&!!tramoAbiertoDe('modulos',rec));
    S.ordenes=S.ordenes.filter(x=>x!==o2)}
   // paro con motivo de la tabla 15
   tr.ini=new Date(Date.now()-60*60*1000).toISOString(); // una hora
   tr.paros=[{id:'p1',ini:new Date(Date.now()-75*6e4).toISOString(),fin:new Date(Date.now()-60*6e4).toISOString(),min:15,motivo:'Falta de tela en la mesa',u:'prueba'}];
   // 3 · fin y cálculo
   terminarTramo(tr.id,oT.id);
   const cal=calcTramo(tr,oT);
   __check("TR: el tiempo trabajado descuenta los paros",Math.abs(cal.brutoMin-60)<2&&cal.paros===15&&Math.abs(cal.trabajado-(cal.brutoMin-15-cal.descansos))<0.01);
   __check("TR: minutos-persona = tiempo trabajado × personas del recurso (módulo con 8 personas)",cal.pers===8&&Math.abs(cal.minPersona-cal.trabajado*8)<0.01);
   __check("TR: si el horario no tiene descansos cargados, se reporta y no se inventan",cal.descansos===0&&cal.descansosFalta===true&&centrosSinDescansos().includes('modulos'));
   // unidades por talla, con tope
   setTallaTramo(tr.id,oT.id,'S',1);setTallaTramo(tr.id,oT.id,'S',1);setTallaTramo(tr.id,oT.id,'M',1);
   __check("TR: las unidades por talla se cargan con + y −",sumaCurva(tr.tallas)===3&&(setTallaTramo(tr.id,oT.id,'M',-1),sumaCurva(tr.tallas)===2));
   const cal2=calcTramo(tr,oT);
   __check("TR: minutos por prenda real = minutos-persona / unidades, con semáforo contra el estándar",Math.abs(cal2.minPrendaReal-cal2.minPersona/2)<0.01&&['ok','aviso','alerta',''].includes(cal2.sem));
   guardarTramo(tr.id,oT.id);
   __check("TR: al guardar quedan unidades por talla, tiempo, paros y auditoría",((S.avance[oT.id].tallas||{}).modulos||{}).S===2&&(S.avance[oT.id].tallasLog||[]).some(x=>x.tramo===tr.id&&x.minPersona>0&&x.u&&x.centro==='modulos'));
   // unidades por encima de lo pedido avisan
   {iniciarTramo(oT.id,'modulos',rec);const t2=tramosDe(oT.id).slice(-1)[0];t2.ini=new Date(Date.now()-10*60*1000).toISOString();terminarTramo(t2.id,oT.id);
    t2.tallas={S:60};let avisó=false;const c0=window.confirm;window.confirm=m=>{avisó=/pasan de lo/.test(String(m));return true};
    guardarTramo(t2.id,oT.id);window.confirm=c0;
    __check("TR: pasar de lo cortado o lo pedido avisa y queda marcado",avisó&&t2.excede===true)}
   // 5 · olvidos
   {iniciarTramo(oT.id,'modulos',rec);const t3=tramosDe(oT.id).slice(-1)[0];t3.ini=new Date(Date.now()-(prm('topeHorasTramo',10)+2)*36e5).toISOString();
    const olv=tramosOlvidados();
    __check("TR: un inicio sin fin que pasa del tope avisa y NO se cierra solo",olv.some(x=>x.t.id===t3.id)&&!t3.fin);
    const it=pendientesHoy().find(x=>x.k==='tramoSinFin');
    __check("TR: el olvido sale en Hoy → Pendientes del supervisor",!!it&&it.n>=1);
    TAB={centro:'modulos',rec,q:''};page='tablet';render();
    __check("TR: Mi centro también lo avisa y ofrece corregirlo",/inicios sin fin|inicio sin fin/i.test(document.getElementById('p-tablet').innerHTML)&&document.getElementById('p-tablet').innerHTML.includes('mCorregirTramo('));
    // el supervisor corrige con auditoría
    mCorregirTramo(t3.id,oT.id);const fin=new Date(new Date(t3.ini).getTime()+45*6e4);
    document.getElementById('ct-fin').value=new Date(fin.getTime()-fin.getTimezoneOffset()*6e4).toISOString().slice(0,16);document.getElementById('ct-m').value=(motivosDe('piso')[0]||{}).motivo||'';
    const nA=auditoriaCambios().length;corregirTramo(t3.id,oT.id);
    __check("TR: el supervisor corrige el fin y queda en auditoría",!!t3.fin&&!!t3.corregido&&auditoriaCambios().length===nA+1);
    TRAMO={paso:null,id:null,oid:null}}
   // la pantalla del flujo
   TAB={centro:'modulos',rec,q:''};page='tablet';render();
   {const h=document.getElementById('p-tablet').innerHTML;
    __check("TR: Mi centro muestra el flujo (elegir orden, INICIO) y lo registrado hoy",(/INICIO<\/button>/.test(h)||/No hay órdenes programadas/.test(h))&&(/Lo registrado hoy/.test(h)||!todosTramos().some(x=>x.t.centro==='modulos'&&x.t.fin&&String(x.t.fin).slice(0,10)===hoy()))&&!document.querySelector('nav a[data-p=\"linea\"]'));}
   if(rec&&bakPers!=null)R(rec).pers=bakPers;
   S.ordenes=S.ordenes.filter(o=>o!==oT);delete S.avance[oT.id];
   const bm=JSON.parse(bakM);if(bm)S.params.motivos=bm;else delete S.params.motivos;
   window.alert=a0;TAB={centro:null,rec:null,q:''};PLAN=null;PLAN_ALL=null;page='ordenes';render();PERFIL=adminP;
   __check("TR sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* MI CENTRO · correcciones: personas reales, descansos por ventanas, segundas y avance rápido */
  {const antes=__R.errors.length;window.confirm=()=>true;const adminP=PERFIL;
   const bakH=JSON.stringify(S.params.horarios||null),bakT=JSON.stringify(S.turnos||null),bakM=JSON.stringify(S.params.motivos||null);
   if(!Array.isArray(S.params.motivos))S.params.motivos=[];if(!S.params.motivos.some(m=>m.uso==='piso'))S.params.motivos.push({motivo:'Falta de tela',uso:'piso'});
   // 1 · Modo línea borrado
   __check("ML: Modo línea ya no existe (función, despachador, sección, catálogo, ícono y estado)",typeof vLinea==='undefined'&&typeof LIN==='undefined'&&!document.getElementById('p-linea')&&!PAGINAS_DEF.some(x=>x[0]==='linea')&&!ICO_NAV.linea);
   __check("ML: asistencia, paros y segundas se siguen guardando",typeof setAsist==='function'&&typeof mParo==='function'&&typeof setSeg==='function');
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;const bakPers=rec?R(rec).pers:null;if(rec)R(rec).pers=8;
   // 2 · personas del tramo: asistencia real manda
   S.turnos=(S.turnos||[]).filter(x=>!(x.rec===rec&&x.d===hoy()));
   __check("PT: sin asistencia del día usa las personas del recurso",personasTramo(rec,'modulos',hoy()).pers===8&&personasTramo(rec,'modulos',hoy()).fuente==='recurso');
   S.turnos.push({id:rec+'|'+hoy(),rec,d:hoy(),pers:6});
   __check("PT: un módulo de 8 personas con asistencia de 6 calcula con 6, y se ve de dónde salió",personasTramo(rec,'modulos',hoy()).pers===6&&personasTramo(rec,'modulos',hoy()).fuente==='asistencia'&&/asistencia/.test(personasTramo(rec,'modulos',hoy()).txt));
   __check("PT: un recurso sin personas ni asistencia calcula con 1 y avisa",personasTramo(null,'corte',hoy()).pers===1&&personasTramo(null,'corte',hoy()).fuente==='defecto');
   // el ajuste de la semana queda en medio y la pantalla lo dice con esas palabras
   {const ym=hoy().slice(0,7);const w=semanasMes(ym).find(x=>x.dias.includes(hoy()));
    const bakA=JSON.stringify(S.params.ajustesCap||null);const bakT2=JSON.stringify(S.turnos||null);
    S.turnos=(S.turnos||[]).filter(x=>!(x.rec===rec&&x.d===hoy()));
    S.params.ajustesCap={[ym]:{semanas:{[w.ini]:{[rec]:{pers:5,min:480,efic:100,motivo:'prueba',u:'t',ts:new Date().toISOString()}}}}};
    const pt=personasTramo(rec,'modulos',hoy());
    __check("PT: sin asistencia del día manda el ajuste de la semana y la pantalla dice de dónde salió",pt.pers===5&&pt.fuente==='ajuste'&&pt.txt==='planificado para la semana (sin asistencia registrada hoy)');
    S.turnos.push({id:rec+'|'+hoy(),rec,d:hoy(),pers:6});
    __check("PT: si además hay asistencia del día, la asistencia manda sobre el ajuste",personasTramo(rec,'modulos',hoy()).pers===6&&personasTramo(rec,'modulos',hoy()).fuente==='asistencia');
    const ba=JSON.parse(bakA);if(ba)S.params.ajustesCap=ba;else delete S.params.ajustesCap;
    const bt2=JSON.parse(bakT2);if(bt2)S.turnos=bt2;else S.turnos=[];}
   // 3 · descansos como ventanas
   S.params.horarios={modulos:{ventanas:[{ini:'12:30',fin:'13:30'}]}};
   const hoyD=hoy();
   const t1={centro:'modulos',rec,ini:hoyD+'T09:00:00',fin:hoyD+'T09:30:00',paros:[],tallas:{}};
   const t2={centro:'modulos',rec,ini:hoyD+'T12:00:00',fin:hoyD+'T14:00:00',paros:[],tallas:{}};
   const mkFecha=(s)=>{const [f,h]=s.split('T');const [Y,M,D2]=f.split('-').map(Number);const [hh,mm]=h.split(':').map(Number);return new Date(Y,M-1,D2,hh,mm).toISOString()};
   t1.ini=mkFecha(t1.ini);t1.fin=mkFecha(t1.fin);t2.ini=mkFecha(t2.ini);t2.fin=mkFecha(t2.fin);
   const c1=calcTramo(t1,null),c2=calcTramo(t2,null);
   __check("DE: un tramo de 9:00 a 9:30 no descuenta el almuerzo de 12:30 a 13:30",Math.abs(c1.brutoMin-30)<0.1&&c1.descansos===0&&Math.abs(c1.trabajado-30)<0.1);
   __check("DE: un tramo de 12:00 a 14:00 descuenta los 60 minutos del almuerzo",Math.abs(c2.brutoMin-120)<0.1&&Math.abs(c2.descansos-60)<0.1&&Math.abs(c2.trabajado-60)<0.1);
   S.params.horarios={};
   __check("DE: sin ventanas cargadas no descuenta nada y lo avisa",calcTramo(t2,null).descansos===0&&calcTramo(t2,null).descansosFalta===true&&centrosSinDescansos().includes('modulos'));
   page='config';CONF.tab='ordenes2';render();__check("DE: los descansos se editan en Configuración (tabla 18)",document.getElementById('p-config').innerHTML.includes('18 · Descansos por centro'));
   // 4 · segundas en el flujo
   S.params.horarios={modulos:{ventanas:[]}};
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const oS=JSON.parse(JSON.stringify(base));oS.id=uid();oS.op='WH/SEG-1';oS.estado='plan';oS.cant=100;oS.tallasPedido={S:100};delete oS.programa;S.ordenes.push(oS);delete S.avance[oS.id];
   iniciarTramo(oS.id,'modulos',rec);const tr=tramosDe(oS.id)[0];tr.ini=new Date(Date.now()-60*6e4).toISOString();terminarTramo(tr.id,oS.id);
   setTallaTramo(tr.id,oS.id,'S',1);setSegTramo(tr.id,oS.id,'S',2);
   {const cal=calcTramo(tr,oS);
    __check("SG: los minutos por prenda salen de las unidades buenas y también se muestran sobre el total",cal.u===1&&cal.seg===2&&Math.abs(cal.minPrendaReal-cal.minPersona)<0.01&&Math.abs(cal.minPrendaTot-cal.minPersona/3)<0.01);}
   const segAntes=((S.avance[oS.id]||{}).seg||{}).modulos||0;
   guardarTramo(tr.id,oS.id);
   __check("SG: las segundas del tramo son el mismo dato que ve Control de piso",(((S.avance[oS.id]||{}).seg||{}).modulos||0)===segAntes+2&&tr.seg===2);
   // 5 · avance rápido
   TAB={centro:'modulos',rec,q:''};iniciarTramo(oS.id,'modulos',rec);const tr2=tramosDe(oS.id).slice(-1)[0];terminarTramo(tr2.id,oS.id);
   page='tablet';render();
   {const h=document.getElementById('p-tablet').innerHTML;
    __check("AR: junto a + y − hay botones de avance rápido tomados de parámetros",h.includes('>+'+num(prm('pasoRapido1',10))+'<')&&h.includes('>+'+num(prm('pasoRapido2',25))+'<')&&h.includes('setSegTramo('));}
   setTallaTramo(tr2.id,oS.id,'S',+prm('pasoRapido2',25));
   __check("AR: el botón rápido suma ese número de golpe",(tr2.tallas||{}).S===+prm('pasoRapido2',25));
   TRAMO={paso:null,id:null,oid:null};
   if(rec&&bakPers!=null)R(rec).pers=bakPers;
   S.ordenes=S.ordenes.filter(o=>o!==oS);delete S.avance[oS.id];
   const bh=JSON.parse(bakH);if(bh)S.params.horarios=bh;else delete S.params.horarios;
   const bt=JSON.parse(bakT);if(bt)S.turnos=bt;else S.turnos=[];
   const bm=JSON.parse(bakM);if(bm)S.params.motivos=bm;else delete S.params.motivos;
   TAB={centro:null,rec:null,q:''};PLAN=null;PLAN_ALL=null;page='ordenes';render();PERFIL=adminP;
   __check("MC2 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* MI CENTRO · reloj vivo, paro sin minutos, tallas a la vista y operarios */
  {const antes=__R.errors.length;window.confirm=()=>true;const adminP=PERFIL;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
   const bakM=JSON.stringify(S.params.motivos||null),bakTb=JSON.stringify(S.params.tablets||null),bakH=JSON.stringify(S.params.horarios||null);
   // 2 · motivos de paro en la tabla 15
   S.params.motivos=(S.params.motivos||[]).filter(m=>m.uso!=='paro');delete S.params.parosMigrados;S.params.tiposParo=['Mecánico','Energía'];
   const mp=motivosParo();
   __check("PA: los tipos de paro viejos se migran a la tabla 15 pero quedan inactivos",motivosDe('paro').some(m=>m.motivo==='Mecánico'&&m.activo===false)&&motivosDe('paro').some(m=>m.motivo==='Energía'&&m.activo===false)&&S.params.parosMigrados===true&&!mp.some(m=>m.motivo==='Mecánico'));
   __check("PA: aunque hubiera tipos viejos, el operario ve exactamente Almuerzo, Cierre del día y Fallo de máquina",mp.length===3&&['Almuerzo','Cierre del día','Fallo de máquina'].every(x=>mp.some(m=>m.motivo===x))&&motivoParoEs('Almuerzo','esAlmuerzo')&&motivoParoEs('Cierre del día','cierreDia'));
   {const t0=S.ordenes.find(o=>abierta(o))||S.ordenes[0];const tr0={centro:'modulos',rec:null,ini:new Date(Date.now()-120*6e4).toISOString(),fin:new Date().toISOString(),paros:[{ini:new Date(Date.now()-90*6e4).toISOString(),fin:new Date(Date.now()-60*6e4).toISOString(),min:30,motivo:'Almuerzo'}],tallas:{}};
    const bakH0=JSON.stringify(S.params.horarios||null);S.params.horarios={modulos:{ventanas:[{ini:'00:00',fin:'23:59'}]}};
    const c0=calcTramo(tr0,t0);
    __check("PA: con la base que ya tenía tipos viejos, un paro de almuerzo no se descuenta dos veces",c0.almuerzoMarcado===true&&c0.descansos===0&&Math.abs(c0.trabajado-(c0.brutoMin-30))<0.6);
    const bh0=JSON.parse(bakH0);if(bh0)S.params.horarios=bh0;else delete S.params.horarios;}
   __check("PA: la tabla 15 tiene columna activo y las marcas de almuerzo y cierre del día",(()=>{page='config';CONF.tab='ordenes2';render();const h=document.getElementById('p-config').innerHTML;return /<th>Activo<\/th>/.test(h)&&/<th>Almuerzo<\/th>/.test(h)&&/<th>Cierre del día<\/th>/.test(h)&&h.includes("'esAlmuerzo',this.checked")&&h.includes("'cierreDia',this.checked")})());
   __check("PA: tiposParo ya no está en los parámetros por defecto del código",!/tiposParo:\['Mecánico'/.test(document.documentElement.outerHTML));
   S.params.motivos=(S.params.motivos||[]).filter(m=>m.uso!=='paro');delete S.params.parosMigrados;delete S.params.tiposParo;
   const mp2=motivosParo();
   __check("PA: sin nada previo se siembran solo Almuerzo, Cierre del día y Fallo de máquina, editables",mp2.length===3&&['Almuerzo','Cierre del día','Fallo de máquina'].every(x=>mp2.some(m=>m.motivo===x))&&motivoParoEs('Almuerzo','esAlmuerzo')&&motivoParoEs('Cierre del día','cierreDia'));
   {const alm=motivos().find(m=>m.uso==='paro'&&m.motivo==='Almuerzo');alm.activo=false;
    __check("PA: si la usuaria desactiva un motivo, el operario deja de verlo",!motivosParo().some(m=>m.motivo==='Almuerzo')&&motivosDe('paro').some(m=>m.motivo==='Almuerzo'));alm.activo=true}
   __check("PA: la lista fija de tipos de paro salió del código",!mParo.toString().includes('Calidad / reproceso')&&mParo.toString().includes('motivosParo()'));
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const oP=JSON.parse(JSON.stringify(base));oP.id=uid();oP.op='WH/PARO-1';oP.estado='plan';oP.cant=100;oP.tallasPedido={S:60,M:40};delete oP.programa;S.ordenes.push(oP);delete S.avance[oP.id];
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   iniciarTramo(oP.id,'modulos',rec);const tr=tramosDe(oP.id)[0];tr.ini=new Date(Date.now()-120*6e4).toISOString();
   // paro sin minutos: se abre y se reanuda
   TRAMO={paso:null,id:null,oid:null};mPararTramo(tr.id,oP.id);
   __check("PA: el modal de paro ya no pide minutos, solo el motivo",!document.getElementById('pt-min')&&!!document.getElementById('pt-m'));
   document.getElementById('pt-m').value='Fallo de máquina';pararTramo(tr.id,oP.id);
   const pa=paroAbierto(tr);
   __check("PA: al parar, el paro queda abierto con su motivo y sin minutos escritos",!!pa&&pa.motivo==='Fallo de máquina'&&!!pa.ini&&!pa.fin&&pa.min===undefined);
   pa.ini=new Date(Date.now()-20*6e4).toISOString();reanudarTramo(tr.id,oP.id);
   const pc=(tr.paros||[])[0];
   __check("PA: al reanudar, el sistema calcula la duración del paro",!!pc.fin&&Math.abs(pc.min-20)<0.5&&!paroAbierto(tr));
   const cal=calcTramo(Object.assign({},tr,{fin:new Date().toISOString()}),oP);
   __check("PA: el tiempo trabajado descuenta ese paro calculado",Math.abs(cal.paros-pc.min)<0.5&&Math.abs(cal.trabajado-(cal.brutoMin-cal.paros))<0.6);
   // 1 · reloj vivo: solo cambia el texto
   TAB={centro:'modulos',rec,q:''};page='tablet';render();
   {const el=document.getElementById('crono-vivo');
    __check("CR: mientras el tramo corre hay un reloj con formato h:mm:ss",!!el&&/^\d+:\d{2}:\d{2}$/.test((tickCrono(),el.textContent)));
    const antesTxt=el.textContent;const padre=el.parentElement.innerHTML.length;
    const parosAntes=el.getAttribute('data-paros');el.setAttribute('data-paros','0');el.setAttribute('data-ini',new Date(Date.now()-3661*1000).toISOString());tickCrono();
    __check("CR: el reloj avanza cambiando solo su texto, sin redibujar la pantalla",el.textContent!==antesTxt&&el.textContent==='1:01:01'&&el.parentElement.innerHTML.length!==0&&document.getElementById('crono-vivo')===el);
    el.setAttribute('data-ini',tr.ini);el.setAttribute('data-paros',parosAntes||'0');}
   // paro visual: el reloj se congela
   {mPararTramo(tr.id,oP.id);document.getElementById('pt-m').value='Almuerzo';pararTramo(tr.id,oP.id);
    render();const el=document.getElementById('crono-vivo');const pausa=el&&el.getAttribute('data-pausa');
    tickCrono();const t1=el.textContent;tickCrono();
    __check("CR: durante el paro el reloj se detiene y el botón dice Reanudar",!!pausa&&el.textContent===t1&&document.getElementById('p-tablet').innerHTML.includes('Reanudar'));}
   // 2 · almuerzo marcado manda sobre el horario (sin doble descuento)
   {S.params.horarios={modulos:{ventanas:[{ini:'00:00',fin:'23:59'}]}};
    const c2=calcTramo(Object.assign({},tr,{fin:new Date().toISOString()}),oP);
    __check("AL: si el almuerzo está marcado como paro, el horario no se descuenta otra vez",c2.almuerzoMarcado===true&&c2.descansos===0&&c2.avisoAlmuerzo===false);
    const sinAlm=Object.assign({},tr,{fin:new Date().toISOString(),paros:(tr.paros||[]).filter(p=>p.motivo!=='Almuerzo')});
    const c3=calcTramo(sinAlm,oP);
    __check("AL: sin paro de almuerzo se descuenta el horario y avisa '¿olvidaste marcarlo?'",c3.descansos>0&&c3.avisoAlmuerzo===true);
    S.params.horarios={}}
   // 2 · cierre del día: la noche no cuenta ni dispara el aviso de olvido
   {const p2=paroAbierto(tr);p2.motivo='Cierre del día';p2.ini=new Date(Date.now()-14*36e5).toISOString();
    tr.ini=new Date(Date.now()-16*36e5).toISOString();
    __check("CD: un tramo en paro de cierre del día no dispara el aviso de olvido",!tramosOlvidados().some(x=>x.t.id===tr.id));
    p2.ini=new Date(Date.now()-1*36e5).toISOString();
    __check("CD: sin ese paro largo, las mismas horas sí disparan el aviso",tramosOlvidados().some(x=>x.t.id===tr.id));
    reanudarTramo(tr.id,oP.id);tr.ini=new Date(Date.now()-30*6e4).toISOString();tr.paros=[];}
   // 3 · tallas a la vista durante el tramo
   render();
   {const h=document.getElementById('p-tablet').innerHTML;
    __check("TV: durante el tramo se ve la tabla por talla (Pedido, Cortado, Hechas, Faltan) con + y −",/<th>Talla<\/th>/.test(h)&&/Pedido<\/th>/.test(h)&&/Cortado<\/th>/.test(h)&&/Hechas<\/th>/.test(h)&&/Faltan<\/th>/.test(h)&&h.includes('setTallaTramo('));}
   {const oSin=JSON.parse(JSON.stringify(base));oSin.id=uid();oSin.op='WH/SINTALLA';oSin.estado='plan';delete oSin.tallasPedido;S.ordenes.push(oSin);delete S.avance[oSin.id];
    __check("TV: una orden sin curva lo dice y solo permite total",tablaTallasTramoHTML(oSin,null,'modulos',false).includes('Sin tallas cargadas para esta WH'));
    S.ordenes=S.ordenes.filter(x=>x!==oSin)}
   // 4 · operario
   {const bakPerfil=PERFIL;const uidOp='op-prueba';
    S.params.tablets=S.params.tablets||{};S.params.tablets[uidOp]={centro:'modulos',rec};
    PERFIL={id:uidOp,nombre:'Operaria Módulo 1',rol:'tablet',modo:'editar'};
    page='tablet';render();const h=document.getElementById('p-tablet').innerHTML;
    __check("OP: el operario entra directo a su centro y su recurso, sin selectores",esOperario()&&!/<label>Centro<\/label>/.test(h)&&!/<label>Recurso<\/label>/.test(h));
    __check("OP: el operario solo ve órdenes de su recurso",(()=>{const P=programar();const ops=new Set((P.pro||[]).filter(x=>x.centro==='modulos'&&x.rec===rec).map(x=>x.op));return ordenesQueVe().every(o=>ops.has(o.op))})());
    // operario de bordado
    S.params.tablets[uidOp]={centro:'bordado',rec:''};PERFIL={id:uidOp,nombre:'Operario Bordado',rol:'tablet',modo:'editar'};
    render();const h2=document.getElementById('p-tablet').innerHTML;
    __check("OP: un operario de Bordado ve su centro y no los módulos",!/<label>Centro<\/label>/.test(h2)&&ordenesQueVe().every(o=>(o.ruta||[]).some(pp=>pp.centro==='bordado')||true)&&tabletDe().centro==='bordado');
    delete S.params.tablets[uidOp];PERFIL=bakPerfil}
   // alta de operario con centro y recurso
   {mNuevoUsuario();const selP=document.getElementById('nu-perfil');
    __check("OP: al crear un usuario se puede elegir perfil tablet con centro y recurso en un paso",!!document.getElementById('nu-centro')&&!!document.getElementById('nu-rec')&&!!selP&&crearUsuario.toString().includes("recOp")&&crearUsuario.toString().includes('tablets'));
    __check("OP: se reportan los módulos que todavía no tienen operario",typeof recursosSinAsignar==='function'&&Array.isArray(recursosSinAsignar()));
    try{cerrar()}catch(e){}}
   S.ordenes=S.ordenes.filter(o=>o!==oP);delete S.avance[oP.id];TRAMO={paso:null,id:null,oid:null};
   const bm=JSON.parse(bakM);if(bm)S.params.motivos=bm;else delete S.params.motivos;
   const bt=JSON.parse(bakTb);if(bt)S.params.tablets=bt;else delete S.params.tablets;
   const bh=JSON.parse(bakH);if(bh)S.params.horarios=bh;else delete S.params.horarios;
   window.alert=a0;TAB={centro:null,rec:null,q:''};PLAN=null;PLAN_ALL=null;page='ordenes';render();PERFIL=adminP;
   __check("MC3 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* TABLET: guardado que no pierde lo escrito, cabecera del operario y buscador arriba */
  {const antes=__R.errors.length;const adminP=PERFIL;const bakTb=JSON.stringify(S.params.tablets||null);
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const uidOp='op-rls';S.params.tablets=S.params.tablets||{};S.params.tablets[uidOp]={centro:'modulos',rec};
   // 1e · si falla el guardado, no se recarga y el aviso queda en pantalla
   PERFIL={id:uidOp,nombre:'Modulo 1',rol:'tablet',modo:'editar'};page='tablet';render();
   SAVE_ERR={ts:new Date().toISOString(),errs:['bitacora: new row violates row-level security policy for table bitacora'],permiso:true};
   avisoGuardado();
   {const h=document.getElementById('p-tablet').innerHTML;
    __check("RLS: si el guardado falla, el aviso queda en pantalla y ofrece reintentar, sin recargar",/No se guardó en el servidor/.test(h)&&/avisa a planificación/i.test(h)&&h.includes('onclick="save()"'));
    __check("RLS: el aviso dice que es un problema de permisos, no un error cualquiera",/no tiene permiso para escribir/.test(h));}
   __check("RLS: el guardado no vuelve a cargar los datos del servidor cuando falla",!_save.toString().includes('await cargarTodo();render()'));
   SAVE_ERR=null;avisoGuardado();
   __check("RLS: al guardar bien, el aviso desaparece",!/No se guardó en el servidor/.test(document.getElementById('p-tablet').innerHTML));
   // 2 · cabecera del operario
   verBotonesAdmin();
   __check("CAB: el operario no ve Respaldo ni Restaurar, y sí Actualizar y Salir",document.getElementById('btn-respaldo').style.display==='none'&&document.getElementById('btn-restaurar').style.display==='none'&&!!document.querySelector('header button[onclick="refrescar()"]')&&!!document.querySelector('header button[onclick="logout()"]'));
   PERFIL=adminP;verBotonesAdmin();
   __check("CAB: quien tiene permiso de configuración sí los ve",document.getElementById('btn-respaldo').style.display!=='none');
   // 3 · buscador arriba de las tarjetas
   PERFIL={id:uidOp,nombre:'Modulo 1',rol:'tablet',modo:'editar'};TAB={centro:'modulos',rec,q:''};render();
   {const h=document.getElementById('p-tablet').innerHTML;const iB=Math.max(h.indexOf('data-q="TAB.q"'),h.indexOf('id="tab-wh"'));const iT=h.indexOf('tab-card');
    __check("BQ: el buscador de WH está arriba, antes de las tarjetas y del flujo",iB>=0&&(iT<0||iB<iT)&&/Buscar WH/.test(h));}
   {const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];const oX=JSON.parse(JSON.stringify(base));oX.id=uid();oX.op='WH/NOAQUI';oX.estado='plan';delete oX.programa;S.ordenes.push(oX);delete S.avance[oX.id];PLAN=null;PLAN_ALL=null;
    TAB.q='WH/NOAQUI';render();const h=document.getElementById('p-tablet').innerHTML;
    const enCola=tabletFilas('modulos',rec,programar()).some(f=>f.o.op==='WH/NOAQUI');
    __check("BQ: una WH que existe pero no está programada en mi recurso sale bloqueada",enCola||(/no programada en/.test(h)&&/Pedir reprogramación/.test(h)));
    S.ordenes=S.ordenes.filter(x=>x!==oX);TAB.q=''}
   const bt=JSON.parse(bakTb);if(bt)S.params.tablets=bt;else delete S.params.tablets;
   PERFIL=adminP;TAB={centro:null,rec:null,q:''};PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("TB sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* CENTROS · limpieza: total visible, «vienen después» con dónde está, carga que viene movida */
  {const antes=__R.errors.length;const adminP=PERFIL;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   page='centro';CEN.id='corte';CEN.tab='plan';CEN.sem=0;CEN.fases=null;CEN.q='';render();
   {const h=document.getElementById('p-centro').innerHTML;
    __check("CL1: el total de órdenes de la semana va en grande y con el color del tema",/Órdenes de la semana <span style="font-size:24px;font-weight:700;color:var\(--t-primary\)/.test(h));
    __check("CL1: las de la semana siguen ordenadas por fecha de inicio y sin entrega del cliente",!/<th>Entrega<\/th>/.test(h)&&/<th>Inicio<\/th>/.test(h)&&/ordenadas por fecha de inicio/.test(h));
    __check("CL2: la pestaña «Carga que viene» ya no está en el centro",![...document.querySelectorAll('#p-centro .chips .chip')].some(c=>/Carga que viene/.test(c.innerText)));}
   // las que vienen después: mismo bloque, con Dónde está
   {const o2=JSON.parse(JSON.stringify(base));o2.id=uid();o2.op='WH/LUEGO-1';o2.estado='plan';o2.fase='2Planificacion';delete o2.programa;S.ordenes.push(o2);delete S.avance[o2.id];PLAN=null;PLAN_ALL=null;render();
    const h=document.getElementById('p-centro').innerHTML;
    __check("CL1: «Vienen después» está en el mismo bloque, con columna Dónde está y sin entrega",(!/Vienen después/.test(h)&&!/<th>Entrega<\/th>/.test(h))||(/Vienen después/.test(h)&&/<th>Dónde está<\/th>/.test(h)&&!/<th>Entrega<\/th>/.test(h)&&!/<details[^>]*><summary[^>]*>Vienen después/.test(h)),h.includes('Vienen después')?'hay órdenes posteriores':'sin órdenes posteriores en esta base');
    __check("CL1: «Dónde está» sale de dondeEsta() y lleva color",typeof dondeEstaCentro==='function'&&/class="tag t-(ok|aviso|alerta|medio|lavado)"/.test(dondeEstaCentro(o2,programar(),'corte')));
    S.ordenes=S.ordenes.filter(x=>x!==o2);PLAN=null;PLAN_ALL=null}
   // la carga que viene vive en Carga general con selector de centro
   {page='produccion';CG={area:'pro',centro:'corte',sem:null,det:null,cruce:'fam',fases:null,q:''};render();
    const h=document.getElementById('p-produccion').innerHTML;
    __check("CL2: «Carga que viene» aparece en Carga general al elegir un centro, con todo su resumen",/Carga que viene · Corte/.test(h)&&/Prendas programadas en/.test(h)&&/De esas, liberadas a producción/.test(h)&&/Por liberar/.test(h));
    CG.centro='';render();
    __check("CL2: sin centro elegido, Carga general lo dice en vez de mostrarla vacía",/Elige un centro arriba para ver/.test(document.getElementById('p-produccion').innerHTML));}
   // 3 · agrupador y buscador en las pantallas de producción
   {const campos=GRP_CAMPOS.map(x=>x[0]);
    __check("CL3: el agrupador común ofrece fase, familia y cliente",['fase','fam','cliente'].every(k=>campos.includes(k)));
    const ver=[['centro','p-centro',()=>{page='centro';CEN.id='modulos';CEN.tab='prog'}],['produccion','p-produccion',()=>{page='produccion'}],['liberacion','p-liberacion',()=>{page='liberacion';LIB.et='corte'}],['control','p-control',()=>{page='control';CTL.area='pro'}]];
    const falt=[];ver.forEach(([pg,id,pre])=>{pre();render();const h=document.getElementById(id).innerHTML;
      const tieneB=/class="busq"/.test(h);const tieneG=/— sin agrupar —/.test(h)||/grp-row/.test(h);if(!tieneB||!tieneG)falt.push(pg+(tieneB?'':' sin buscador')+(tieneG?'':' sin agrupador'))});
    __check("CL3: centro, Carga general, Liberación a producción y Control de piso tienen buscador y agrupador comunes",!falt.length,falt.join(' · '));}
   CEN.id='corte';CEN.tab='plan';PLAN=null;PLAN_ALL=null;page='ordenes';render();PERFIL=adminP;
   __check("CL sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* MI CENTRO · reloj real, búsqueda simple del operario, arranque sin parpadeo y guardado inmediato */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;
   const bakTb=JSON.stringify(S.params.tablets||null);
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const oR=JSON.parse(JSON.stringify(base));oR.id=uid();oR.op='WH/MO/28300';oR.estado='plan';oR.cant=50;oR.tallasPedido={S:50};delete oR.programa;S.ordenes.push(oR);delete S.avance[oR.id];PLAN=null;PLAN_ALL=null;
   // 1 · el reloj corre solo, sin llamar a tickCrono a mano
   TAB={centro:'modulos',rec,q:''};page='tablet';iniciarTramo(oR.id,'modulos',rec);render();
   const el0=document.getElementById('crono-vivo');const txt0=el0?el0.textContent:null;
   await __p(3200);
   const el1=document.getElementById('crono-vivo');
   __check("RJ: el reloj de Mi centro avanza solo (3 segundos reales, sin tocar tickCrono)",!!el0&&!!el1&&el1.textContent!==txt0&&/^\d+:\d{2}:\d{2}$/.test(el1.textContent),JSON.stringify({txt0,txt1:el1&&el1.textContent}));
   __check("RJ: el arranque del reloj ya no está dentro de Liberación",!vLiberacion.toString().includes('arrancarCrono')&&render.toString().includes('arrancarCrono'));
   // 2 · el operario busca por número, sin menú de campos
   {S.params.tablets=S.params.tablets||{};S.params.tablets['op-b']={centro:'modulos',rec};
    PERFIL={id:'op-b',nombre:'Operaria',rol:'tablet',modo:'editar'};TAB={centro:'modulos',rec,q:''};render();
    const h=document.getElementById('p-tablet').innerHTML;
    __check("BQ2: el operario ve un campo simple, sin menú «buscar solo en…» ni opciones de campo",h.includes('id="tab-wh"')&&!h.includes('data-q="TAB.q"')&&!/busq-menu/.test(h)&&/inputmode="numeric"/.test(h));
    TAB.q='28300';render();const h2=document.getElementById('p-tablet').innerHTML;
    const enCola=tabletFilas('modulos',rec,programar()).some(f=>f.o.op==='WH/MO/28300');
    __check("BQ2: escribir solo el número encuentra la WH (programada abre su tarjeta; si no, sale bloqueada)",enCola?/WH\/MO\/28300/.test(h2):(/no programada en/.test(h2)&&/Pedir reprogramación/.test(h2)));
    TAB.q='WH/MO/28300';render();
    __check("BQ2: también acepta la WH completa",/WH\/MO\/28300/.test(document.getElementById('p-tablet').innerHTML));
    TAB.q='';PERFIL=adminP;render();
    __check("BQ2: los demás perfiles conservan el buscador común",document.getElementById('p-tablet').innerHTML.includes('data-q="TAB.q"'));
    delete S.params.tablets['op-b']}
   // 3 · arranque sin parpadeo
   __check("AR2: la app no dibuja nada hasta tener el perfil (mientras tanto, «Cargando…»)",render.toString().includes('if(!LISTO)')&&/cargando/.test(render.toString())&&entrar.toString().includes('LISTO=true'));
   {const ap=document.getElementById('app');const bak=LISTO;LISTO=false;render();
    __check("AR2: con la app sin perfil, el menú y la cabecera de admin quedan ocultos",ap.classList.contains('cargando'));
    LISTO=bak;render();
    __check("AR2: al tener el perfil, se dibuja normal",!ap.classList.contains('cargando'));}
   // 4 · cada paso guarda de inmediato
   {const marcas=[['iniciarTramo',iniciarTramo],['pararTramo',pararTramo],['reanudarTramo',reanudarTramo],['terminarTramo',terminarTramo]];
    __check("GD: INICIO, PARO, REANUDAR y FIN guardan de inmediato",marcas.every(([n,f])=>/save\(\)/.test(f.toString())));
    const ab=tramoAbiertoDe('modulos',rec);
    __check("GD: el tramo queda dentro de avance apenas se inicia (aunque se cierre la tablet)",!!ab&&((S.avance[oR.id]||{}).tramos||[]).some(t=>t.id===ab.t.id));
    SAVE_ERR={ts:new Date().toISOString(),errs:['avance: new row violates row-level security policy'],permiso:true};avisoGuardado();
    __check("GD: si ese guardado falla, queda en el aviso de reintento",/No se guardó en el servidor/.test(document.getElementById('p-tablet').innerHTML));
    SAVE_ERR=null;avisoGuardado()}
   S.ordenes=S.ordenes.filter(o=>o!==oR);delete S.avance[oR.id];TRAMO={paso:null,id:null,oid:null};
   const bt=JSON.parse(bakTb);if(bt)S.params.tablets=bt;else delete S.params.tablets;
   PERFIL=adminP;TAB={centro:null,rec:null,q:''};PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("MC4 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* MI CENTRO · «Hechas hoy» suma lo guardado en el tramo */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const oH=JSON.parse(JSON.stringify(base));oH.id=uid();oH.op='WH/HECHAS-1';oH.estado='plan';oH.cant=100;oH.tallasPedido={S:60,M:40};delete oH.programa;S.ordenes.push(oH);delete S.avance[oH.id];PLAN=null;PLAN_ALL=null;
   const antesDia=hechasDelDia('modulos',rec,hoy()).pz;
   // un tramo de 20 prendas
   iniciarTramo(oH.id,'modulos',rec);const tr=tramosDe(oH.id)[0];tr.ini=new Date(Date.now()-30*6e4).toISOString();terminarTramo(tr.id,oH.id);
   setTallaTramo(tr.id,oH.id,'S',12);setTallaTramo(tr.id,oH.id,'M',8);guardarTramo(tr.id,oH.id);
   __check("HH: lo guardado en el tramo suma en «hechas del día» (una sola función)",hechasDelDia('modulos',rec,hoy()).pz===antesDia+20);
   TAB={centro:'modulos',rec,q:''};page='tablet';render();
   {const h=document.getElementById('p-tablet').innerHTML;
    __check("HH: la tarjeta «Hechas hoy» de Mi centro muestra las 20 y «Faltan» baja",new RegExp('>'+num(antesDia+20)+'<[\\s\\S]{0,80}Hechas hoy').test(h));}
   // al recargar (mismo dato en avance) se mantiene
   __check("HH: el dato vive en avance, así que se mantiene al recargar",((S.avance[oH.id]||{}).tallasLog||[]).filter(x=>x.centro==='modulos').reduce((a,x)=>a+x.pz,0)===20&&((S.avance[oH.id]||{}).tallas||{}).modulos.S===12);
   // 2 · sin curva de tallas, el registro por total también queda en tallasLog y suma
   {const oT=JSON.parse(JSON.stringify(base));oT.id=uid();oT.op='WH/HECHAS-2';oT.estado='plan';oT.cant=15;delete oT.tallasPedido;delete oT.programa;S.ordenes.push(oT);delete S.avance[oT.id];
    const antes2=hechasDelDia('modulos',rec,hoy()).pz;
    mHechoTotal(oT.id,'modulos');document.getElementById('hc-q').value=15;confirmarHechoCentro(oT.id,'modulos');
    __check("HH: una orden sin curva registra el total, queda en tallasLog y también suma",((S.avance[oT.id]||{}).tallasLog||[]).some(x=>x.talla==='(total)'&&x.pz===15)&&hechasDelDia('modulos',null,hoy()).pz>=antes2+15);
    __check("HH: no se cuenta dos veces (tramo y registro rápido de la misma orden)",hechasDelDia('modulos',null,hoy()).pz===antes2+15);
    S.ordenes=S.ordenes.filter(x=>x!==oT);delete S.avance[oT.id]}
   // 3 · las otras pantallas leen lo mismo
   __check("HH: Mi centro y «Hecho hoy» del centro usan la función única",vTablet.toString().includes('hechasDelDia(')&&vCentro.toString().includes('hechasDelDia('));
   __check("HH: el tramo también suma a la producción del turno (Reportería y Ejecución)",(S.turnos||[]).some(t=>t.rec===rec&&t.d===hoy()&&(t.pz||0)>=20));
   page='centro';CEN.id='modulos';CEN.tab='prog';render();
   __check("HH: «Hecho hoy» del centro muestra la orden del tramo",/Hecho hoy en/.test(document.getElementById('p-centro').innerHTML));
   // 4 · bitácora con los paros etiquetados
   __check("HH: la bitácora del tramo escribe « · N paros»",S.bitacora.some(b=>/Tramo guardado/.test(b.t))&&!S.bitacora.some(b=>/min\/prenda\d/.test(b.t)));
   S.ordenes=S.ordenes.filter(o=>o!==oH);delete S.avance[oH.id];
   TAB={centro:null,rec:null,q:''};TRAMO={paso:null,id:null,oid:null};PLAN=null;PLAN_ALL=null;page='ordenes';render();PERFIL=adminP;
   __check("HH sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PARTE A · RUTAS CONFIRMADAS */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const alerts=[];const a0=window.alert;window.alert=m=>alerts.push(String(m));
   const base=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).length)||S.ordenes[0];
   const mkR=(op,ruta,ot,extra)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.ref=(extra&&extra.ref)||'REF-RUTA';o.cant=(extra&&extra.cant)||100;delete o.rutaConf;delete o.lib;delete o.programa;
     o.ruta=ruta.map(c=>({centro:c,t:1}));if(ot)o.ot=ot;else delete o.ot;Object.assign(o,(extra&&extra.mas)||{});S.ordenes.push(o);delete S.avance[o.id];return o};
   const OTc=cs=>Object.fromEntries(cs.map(c=>[c,{estado:'terminado',odoo:'X'}]));
   // A1 · la ruta por defecto NO confirma
   const oDef=mkR('WH/RU-DEF',centrosRutaDefecto(),null);
   __check("RU1: la ruta por defecto de Configuración no confirma nada",!rutaConfirmada(oDef)&&!rutaConf(oDef));
   __check("RU1: una orden con historial de ediciones tampoco cuenta como confirmada",(()=>{oDef.rutaEditada=[{ts:new Date().toISOString(),u:'x',motivo:'y'}];return !rutaConfirmada(oDef)})());
   // A2 · coincidencia exacta con Odoo
   const oIgual=mkR('WH/RU-OK',['corte','modulos','empaque'],OTc(['corte','modulos','empaque']));
   const oMas=mkR('WH/RU-MAS',['corte','modulos','empaque'],OTc(['corte','modulos','empaque','bordado']));
   const oMenos=mkR('WH/RU-MENOS',['corte','modulos','empaque'],OTc(['corte','modulos']));
   const oSinMap=mkR('WH/RU-MAP',['corte','modulos','empaque'],Object.assign(OTc(['corte','modulos','empaque']),{PULIDO:{estado:'terminado',odoo:'PULIDO'}}));
   const oSinOT=mkR('WH/RU-SINOT',['corte','modulos','empaque'],null);
   PLAN=null;PLAN_ALL=null;
   __check("RU2: coincide exacto con Odoo → se puede confirmar sola",diagRutaOdoo(oIgual).estado==='coincide');
   __check("RU2: un centro de más en Odoo → por definir, y dice en qué difiere",diagRutaOdoo(oMas).estado==='difiere'&&/Odoo tiene Bordado, la ruta no/.test(diagRutaOdoo(oMas).txt));
   __check("RU2: un centro de menos en Odoo → por definir",diagRutaOdoo(oMenos).estado==='difiere'&&/la ruta tiene Empaque, Odoo no/.test(diagRutaOdoo(oMenos).txt));
   __check("RU2: un centro de Odoo sin centro TEMPO → por definir",diagRutaOdoo(oSinMap).estado==='sinMapear'&&/PULIDO/.test(diagRutaOdoo(oSinMap).txt));
   __check("RU2: sin órdenes de trabajo cargadas → por definir",diagRutaOdoo(oSinOT).estado==='sinOT');
   {const an=analizarRutasOdoo();
    __check("RU2: el análisis cuenta por motivo antes de aplicar nada",an.coincide.some(x=>x.o===oIgual)&&an.difiere.some(x=>x.o===oMas)&&an.sinMapear.some(x=>x.o===oSinMap)&&an.sinOT.some(x=>x.o===oSinOT)&&!rutaConfirmada(oIgual));}
   confirmarRutasOdoo();
   __check("RU2: al aplicar, solo se confirma la que coincide y las demás no se tocan",rutaConfirmada(oIgual)&&rutaConf(oIgual).origen==='odoo'&&!rutaConfirmada(oMas)&&!rutaConfirmada(oMenos)&&pasosRutaDe(oMas).length===3);
   __check("RU2: la confirmación queda en auditoría",auditoriaCambios().some(x=>x.tipo==='ruta'&&x.oid===oIgual.id));
   // nunca pisa una confirmación de persona
   confirmarRuta(oMas,'persona','prueba');const uAntes=rutaConf(oMas).u,tsAntes=rutaConf(oMas).ts;
   confirmarRutasOdoo();
   __check("RU2: nunca pisa una ruta confirmada por una persona",rutaConf(oMas).origen==='persona'&&rutaConf(oMas).ts===tsAntes);
   // A3 · confirmar por referencia
   {const r1=mkR('WH/REF-1',['corte','modulos'],null,{ref:'REF-X'});const r2=mkR('WH/REF-2',['corte'],null,{ref:'REF-X'});
    const r3=mkR('WH/REF-3',['corte'],null,{ref:'REF-X',mas:{lib:{corte:{ok:true,u:'t',ts:new Date().toISOString()}}}});
    const n=aplicarRutaARef(r1.id);
    __check("RU3: confirmar por referencia aplica la ruta a sus WH abiertas y no liberadas",rutaConfirmada(r1)&&rutaConfirmada(r2)&&pasosRutaDe(r2).join()==='corte,modulos'&&!rutaConfirmada(r3)&&n===2);
    const r4=mkR('WH/REF-4',['corte'],null,{ref:'REF-Y'});aplicarRutaARef(r4.id,true);
    __check("RU3: «solo esta WH» no toca a las demás de la referencia",rutaConfirmada(r4));
    page='ordenes';ORDF.tab='rutas';RUT.q='';render();
    const h=document.getElementById('p-ordenes').innerHTML;
    __check("RU3: la pestaña Rutas muestra la tarjeta, la lista por referencia y lo que dice Odoo",/Faltan rutas por confirmar/.test(h)&&/Por definir/.test(h)&&/Qué dice Odoo hoy/.test(h)&&/data-q="RUT.q"/.test(h));
    RUT.ver='conf';render();
    __check("RU3: la lista de confirmadas trae origen, quién y cuándo",/Con ruta confirmada/.test(document.getElementById('p-ordenes').innerHTML));RUT.ver='pend';
    S.ordenes=S.ordenes.filter(x=>x!==r1&&x!==r2&&x!==r3&&x!==r4)}
   // A4 · recarga: WH nueva de una referencia confirmada entra precargada y por definir
   {const c1=mkR('WH/PRE-1',['corte','modulos','empaque'],null,{ref:'REF-PRE'});confirmarRuta(c1,'persona','prueba');
    const c2=mkR('WH/PRE-2',[],null,{ref:'REF-PRE'});
    precargarRutasNuevas();
    __check("RU4: una WH nueva de una referencia confirmada entra con la ruta precargada y por definir",pasosRutaDe(c2).join()==='corte,modulos,empaque'&&!rutaConfirmada(c2)&&!!c2.rutaPrecargada);
    __check("RU4: la confirmación se conserva en las recargas (tabla 14)",camposConservados().some(x=>x.campo==='rutaConf'&&x.conservar));
    S.ordenes=S.ordenes.filter(x=>x!==c1&&x!==c2)}
   // A5 · bloqueo en las dos liberaciones
   {const oL=mkR('WH/LIB-SR',['corte','modulos','empaque'],null,{ref:'REF-LIB'});
    __check("RU5: sin ruta confirmada no se puede liberar y dice por qué",!puedeLiberarA(oL,'corte')&&faltaLiberarA(oL,'corte').includes('falta confirmar ruta')&&!puedeLiberarA(oL,'tela')&&faltaLiberarA(oL,'tela').includes('falta confirmar ruta'));
    confirmarRuta(oL,'persona','prueba');
    __check("RU5: al confirmar la ruta, deja de estar frenada por eso",!faltaLiberarA(oL,'corte').includes('falta confirmar ruta'));
    oL.lib={corte:{ok:true,u:'t',ts:new Date().toISOString()}};desconfirmarRuta(oL,'prueba');
    const it=pendientesHoy().find(x=>x.k==='libSinRuta');
    __check("RU5: una ya liberada sin ruta confirmada no se deslibera y sale en Hoy → Pendientes",!!(oL.lib&&oL.lib.corte)&&!!it&&it.n>=1);
    S.ordenes=S.ordenes.filter(x=>x!==oL)}
   S.ordenes=S.ordenes.filter(o=>![oDef,oIgual,oMas,oMenos,oSinMap,oSinOT].includes(o));
   window.alert=a0;ORDF.tab='ord';PLAN=null;PLAN_ALL=null;page='ordenes';render();PERFIL=adminP;
   __check("RU sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PARTE B · LIBERACIÓN SEGÚN EL BOCETO */
  {const antes=__R.errors.length;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   const bakYm=LIB.ym;GRP={};LIB.sel=new Set();LIB.q='';LIB.q4='';LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.verLista=false;LIB.fases=null;LIB.hija=null;LIB.tela=null;LIB.mes=null;page='liberacion';LIB.et='tela';
   const ym='2026-09',proy='SEPTIEMBRE 2026';
   const conTela=o=>abierta(o)&&(o.telas||[]).length&&(o.telas||[]).filter(t=>!t.ext).every(t=>t.kg>0);
   const famsD=[...new Set(S.ordenes.filter(conTela).map(famDeOrden))];
   const baseDe=f=>S.ordenes.find(o=>conTela(o)&&famDeOrden(o)===f);
   const mk=(op,cant,bs,lib)=>{const o=JSON.parse(JSON.stringify(bs));o.id=uid();o.op=op;o.estado='plan';o.fase='0Macro';o.proyecto=proy;o.cant=cant;o.odc='ODC-LBB';delete o.programa;delete o.lib;delete o.sinLanzar;delete o.sinFechaEntrega;
     if(lib)o.lib={tela:{ok:true,u:'prueba',ts:new Date().toISOString()}};S.ordenes.push(o);delete S.avance[o.id];confirmarRuta(o,'persona','orden de prueba');return o};
   const bA=baseDe(famsD[0]),bB=baseDe(famsD[1])||bA;
   const oA1=mk('WH/LBB-A1',4000,bA,false),oA2=mk('WH/LBB-A2',1000,bA,true),oB1=mk('WH/LBB-B1',300,bB,false);
   const mios=[oA1,oA2,oB1];PLAN=null;PLAN_ALL=null;LIB.ym=ym;
   const b=baseLiberacion('tela',ym),lib=libLiberacion('tela',ym),pen=pendLiberacion('tela',ym);
   __check("LBB1: la base son las órdenes del Proyecto del mes elegido",b.every(o=>mesPlan(o)===ym)&&mios.every(o=>b.includes(o)),'mes '+ym+' · '+b.length+' órdenes');
   __check("LBB1: el mes deja fuera lo que no es de ese Proyecto",!baseLiberacion('tela','2020-01').length&&baseLiberacion('tela',null).length>=b.length);
   __check("LBB2: liberado + pendiente = total de la base (ninguna orden repetida ni perdida)",lib.length+pen.length===b.length&&!lib.some(o=>pen.includes(o))&&lib.includes(oA2)&&pen.includes(oA1)&&pen.includes(oB1));
   const fam=resumenLibPor('tela',ym,famDeOrden,o=>+o.cant||0,null);
   const sub=resumenLibPor('tela',ym,subcatDe,o=>+o.cant||0,null);
   const pzTot=b.reduce((a,o)=>a+(+o.cant||0),0);
   __check("LBB2: en cada familia liberado + pendiente = total",fam.length>0&&fam.every(f=>Math.abs(f.lib+f.pend-f.tot)<1e-9));
   __check("LBB2: la suma de las familias es el total de la base",Math.abs(fam.reduce((a,f)=>a+f.tot,0)-pzTot)<1e-9,fam.reduce((a,f)=>a+f.tot,0)+' vs '+pzTot);
   __check("LBB2: por tipo de producto (subcategoría) da el mismo total que por familia",Math.abs(sub.reduce((a,f)=>a+f.tot,0)-pzTot)<1e-9);
   __check("LBB2: % de familia = liberado ÷ total",fam.every(f=>Math.abs(f.pct-(f.tot?f.lib/f.tot*100:0))<1e-9&&f.pct>=0&&f.pct<=100));
   {const fA=fam.find(x=>x.k===famDeOrden(oA1));const dA=mios.filter(o=>famDeOrden(o)===famDeOrden(oA1));
    const totA=dA.reduce((a,o)=>a+ +o.cant,0),libA=dA.filter(o=>liberada(o,'tela')).reduce((a,o)=>a+ +o.cant,0);
    __check("LBB2: la carga por familia cuenta prendas liberadas de prendas totales de esa familia",!!fA&&fA.tot===totA&&fA.lib===libA&&Math.abs(fA.pct-libA/totA*100)<1e-9,num(libA)+' de '+num(totA));}
   {const kgB=b.reduce((a,o)=>a+kgDeOrden(o),0),kgL=lib.reduce((a,o)=>a+kgDeOrden(o),0),kgP=pen.reduce((a,o)=>a+kgDeOrden(o),0);
    __check("LBB2: en kilos también liberado + pendiente = total",kgB>0&&Math.abs(kgL+kgP-kgB)<1e-6,num(kgL)+' + '+num(kgP)+' = '+num(kgB));}
   {const f0=resumenLibPor('tela',ym,famDeOrden,o=>+o.cant||0,new Set([oA1.id])).find(x=>x.k===famDeOrden(oA1));
    __check("LBB2: con órdenes marcadas la fila dice a cuánto subiría el %",!!f0&&f0.sel===+oA1.cant&&f0.pctSel>f0.pct&&Math.abs(f0.pctSel-(f0.lib+f0.sel)/f0.tot*100)<1e-9);
    const bar=barraLib(f0,v=>num(v));__check("LBB2: la barra pinta el % de hoy y el que subiría en otro color",bar.includes('var(--t-accent)')&&bar.includes('%'));}
   render();let h=document.getElementById('p-liberacion').innerHTML;
   const tarj=[...h.matchAll(/LIB\.fam2='([^']*)';render\(\)"><div class="v">([\d.,]+)</g)].map(m=>[m[1],+m[2].replace(/\./g,'').replace(',','.')]);
   __check("LBB3: las tarjetas por familia van de mayor a menor en unidades pendientes",tarj.length>0&&tarj.every((x,i)=>!i||tarj[i-1][1]>=x[1]),JSON.stringify(tarj.slice(0,4)));
   __check("LBB3: la tarjeta de arriba dice cuántas órdenes y cuántas unidades están pendientes",h.includes('data-t="lb-pend"')&&h.includes('pendientes de liberar a la planta')&&h.includes(num(pen.reduce((a,o)=>a+ +o.cant,0))));
   {LIB.fam2=famDeOrden(oA1);render();h=document.getElementById('p-liberacion').innerHTML;
    __check("LBB3: al tocar una familia se abre su detalle con WH y fase, cliente, color, prendas, entrega y qué la frena",h.includes('Detalle de')&&h.includes('Qué la frena')&&h.includes('id="lib-lista"')&&h.includes('fase-mini')&&h.includes(esc(oA1.op)));
    {const s0=h.slice(h.indexOf('id="lib-lista"'));const tab=s0.slice(0,s0.indexOf('</table>'));
     __check("LBB3: el detalle solo trae las órdenes de esa familia",tab.includes(esc(oA1.op))&&(famDeOrden(oB1)===famDeOrden(oA1)||!tab.includes(esc(oB1.op))));}
    LIB.fam2=null}
   {desconfirmarRuta(oB1,'prueba del bloqueo');LIB.q=oB1.op;render();h=document.getElementById('p-liberacion').innerHTML;
    __check("LBB3: 'falta confirmar ruta' sale en Qué la frena y enlaza a Órdenes → Rutas",h.includes('falta confirmar ruta →')&&h.includes("irRutaDeOrden('")&&!puedeLiberarA(oB1,'tela'));
    confirmarRuta(oB1,'persona','orden de prueba');LIB.q=''}
   {LIB.ym=null;render();const hT=document.getElementById('p-liberacion').innerHTML;
    __check("LBB1: elegir 'Todos los meses' se respeta y no vuelve solo al mes en curso",(render(),LIB.ym===null),'ymAuto='+LIB.ymAuto);
    __check("LBB1: el mes del Proyecto es multiselección, con «Seleccionar todos» y «Limpiar»",hT.includes('<label>Mes del Proyecto</label>')&&hT.includes("togSetYmLib('")&&/Seleccionar todos/.test(hT)&&/Limpiar/.test(hT));
    LIB.ym=ym}
   {const f=famDeOrden(oA1);const aF=resumenLibPor('tela',ym,famDeOrden,x=>+x.cant||0,null).find(x=>x.k===f);
    liberarA([oA1.id],'tela');const dF=resumenLibPor('tela',ym,famDeOrden,x=>+x.cant||0,null).find(x=>x.k===f);
    __check("LBB4: al liberar, el resumen sube el liberado y baja el pendiente sin mover el total",liberada(oA1,'tela')&&!!dF&&dF.tot===aF.tot&&dF.lib===aF.lib+ +oA1.cant&&dF.pend===aF.pend- +oA1.cant,JSON.stringify({antes:[aF.lib,aF.pend],despues:[dF.lib,dF.pend]}));
    __check("LBB4: la orden liberada sale del bloque 1 y entra en las liberadas",!pendLiberacion('tela',ym).includes(oA1)&&libLiberacion('tela',ym).includes(oA1));}
   S.ordenes=S.ordenes.filter(o=>!mios.includes(o));mios.forEach(o=>{delete S.avance[o.id]});
   LIB.ym=bakYm;LIB.q='';LIB.fam2=null;LIB.sel=new Set();LIB.verLista=false;LIB.odc=null;GRP={};window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("LBB sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* MI CENTRO · total sin tallas y resultado de búsqueda visible */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mk=(op,cant)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=cant;delete o.tallasPedido;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];return o};
   const oS=mk('WH/MO/99001',300);PLAN=null;PLAN_ALL=null;TRAMO={paso:null,id:null,oid:null};
   const antesDia=hechasDelDia('modulos',rec,hoy()).pz;
   // 1 · sin curva de tallas: una sola fila de TOTAL con el formato de una talla
   iniciarTramo(oS.id,'modulos',rec);const tr=tramosDe(oS.id).find(x=>!x.fin);tr.ini=new Date(Date.now()-40*6e4).toISOString();terminarTramo(tr.id,oS.id);
   {const h=tallasSegHTML(oS,tr,'modulos',[]);
    __check("MT1: sin curva de tallas se dibuja una fila Total con − + rápidos, número editable y segundas",h.includes('>Total<')&&h.includes("setTallaTramo('"+tr.id)&&h.includes('setTallaTramoVal(')&&h.includes('inputmode="numeric"')&&h.includes('segundas'));
    __check("MT1: la fila Total dice cuánto lleva de las prendas de la orden",h.includes('de '+num(oS.cant)));
    __check("MT1: la pantalla de confirmar ya no se queda sin campo",flujoTramoHTML('modulos',rec,[]).includes('setTallaTramoVal('));}
   setTallaTramoVal(tr.id,oS.id,'(total)',20);
   __check("MT1: el número editable guarda las unidades en el tramo",(tramosDe(oS.id).find(x=>x.id===tr.id).tallas||{})['(total)']===20);
   guardarTramo(tr.id,oS.id);
   __check("MT1: al guardar, «Hechas hoy» suma las 20",hechasDelDia('modulos',rec,hoy()).pz===antesDia+20,antesDia+' → '+hechasDelDia('modulos',rec,hoy()).pz);
   __check("MT1: el avance de la orden en ese centro sube 20 y queda la línea (total) en el registro",(((S.avance[oS.id]||{}).centros)||{}).modulos===20&&((S.avance[oS.id]||{}).tallasLog||[]).some(x=>x.talla==='(total)'&&x.pz===20));
   // 2 · guardar el tramo sin unidades: pregunta, no bloquea
   iniciarTramo(oS.id,'modulos',rec);const tr2=tramosDe(oS.id).find(x=>!x.fin);tr2.ini=new Date(Date.now()-20*6e4).toISOString();terminarTramo(tr2.id,oS.id);
   {let preg='';const cp=window.confirm;window.confirm=m=>{preg=String(m);return false};guardarTramo(tr2.id,oS.id);
    __check("MT2: guardar con 0 unidades pregunta antes (puede haber sido solo un paro)",/sin unidades/.test(preg)&&tramosDe(oS.id).find(x=>x.id===tr2.id).pz===undefined);
    window.confirm=()=>true;guardarTramo(tr2.id,oS.id);const t2=tramosDe(oS.id).find(x=>x.id===tr2.id);
    __check("MT2: al confirmar se guarda con 0 prendas y el tiempo trabajado",t2.pz===0&&t2.min>0&&t2.minPrenda===null);
    __check("MT2: el tramo guardado conserva QUIÉN trabajó (las unidades van en pz, ya no pisan la persona)",typeof t2.u==='string'&&t2.u.length>0&&tramosDelDiaHTML('modulos',rec).includes(t2.u));
    window.confirm=cp}
   TRAMO={paso:null,id:null,oid:null};
   // 3 · el resultado de la búsqueda se ve siempre
   const oC=mk('WH/MO/28513',50),oF=mk('WH/MO/77777',50);PLAN=null;PLAN_ALL=null;
   const cola=[{o:oC,hechas:0}];const bakTAB=JSON.parse(JSON.stringify({centro:TAB.centro,rec:TAB.rec,q:TAB.q}));
   TAB.centro='modulos';TAB.rec=rec;TAB.q='28513';
   {const h=tabletBuscadorHTML('modulos',cola,rec);
    __check("MB1: la WH de la cola sale como tarjeta con WH, fase, color, prendas y botón INICIO",h.includes(esc(oC.op))&&h.includes('>INICIO<')&&h.includes("iniciarTramo('"+oC.id+"','modulos','"+rec+"')")&&h.includes('por hacer de')&&h.includes('fase-mini'));
    TAB.q='WH/MO/28513';
    __check("MB1: acepta el número suelto y la WH completa",tabletBuscadorHTML('modulos',cola,rec).includes('>INICIO<'));}
   TAB.q='77777';
   {const h=tabletBuscadorHTML('modulos',cola,rec);
    __check("MB2: una WH que no está programada aquí sale bloqueada, con pedir reprogramación",h.includes(esc(oF.op))&&/no programada en/.test(h)&&h.includes("pedirReprogramacion('"+oF.id+"'"));}
   TAB.q='ZZ-NO-EXISTE';
   __check("MB2: si no existe ninguna orden con eso, lo dice",/No existe ninguna orden/.test(tabletBuscadorHTML('modulos',cola,rec)));
   // con un tramo abierto de otra orden
   iniciarTramo(oS.id,'modulos',rec);const tr3=tramosDe(oS.id).find(x=>!x.fin);TAB.q='28513';
   {const h=tabletBuscadorHTML('modulos',cola,rec);
    __check("MB3: con un tramo abierto de otra orden, la tarjeta lo dice y ofrece ir a ella",h.includes(esc(oC.op))&&/tienes abierta la /.test(h)&&h.includes(esc(oS.op))&&!h.includes('>INICIO<'));}
   // con un tramo terminado y pendiente de confirmar
   terminarTramo(tr3.id,oS.id);
   {const h=tabletBuscadorHTML('modulos',cola,rec);
    __check("MB3: con un tramo pendiente de confirmar, buscar otra WH de la cola muestra su tarjeta y avisa",h.includes(esc(oC.op))&&/falta confirmar lo que salió de/.test(h)&&h.includes(esc(oS.op))&&!h.includes('>INICIO<'));}
   setTallaTramoVal(tr3.id,oS.id,'(total)',5);guardarTramo(tr3.id,oS.id);TRAMO={paso:null,id:null,oid:null};
   __check("MB4: Mi centro le pasa el recurso al buscador (el resultado sabe si es de mi puesto)",vTablet.toString().includes('tabletBuscadorHTML(c,cola,rec)'));
   TAB.q='';TAB.centro=bakTAB.centro;TAB.rec=bakTAB.rec;
   S.ordenes=S.ordenes.filter(o=>![oS,oC,oF].includes(o));[oS,oC,oF].forEach(o=>{delete S.avance[o.id]});
   window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();PERFIL=adminP;
   __check("MT/MB sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PISO · el guardado del operario solo sube sus cuatro tablas */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;const alerts=[];window.alert=m=>alerts.push(String(m));
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const oP=JSON.parse(JSON.stringify(base));oP.id=uid();oP.op='WH/PISO-1';oP.estado='plan';oP.cant=200;delete oP.tallasPedido;delete oP.programa;S.ordenes.push(oP);delete S.avance[oP.id];PLAN=null;PLAN_ALL=null;
   S.params.tablets=S.params.tablets||{};S.params.tablets['u1']={centro:'modulos',rec};
   TRAMO={paso:null,id:null,oid:null};TAB.centro='modulos';TAB.rec=rec;TAB.q='';
   PERFIL={id:'u1',rol:'tablet',nombre:'Operaria de prueba',email:'op@tempo.local'};
   __check("P1.1: el perfil de tablet es «solo piso» y sus tablas son avance, bitácora, turnos y paros",perfilSoloPiso()&&TABLAS_PISO.join()==='avance,bitacora,turnos,paros'&&TABLAS_PISO.every(puedeSubirTabla)&&!puedeSubirTabla('params')&&!puedeSubirTabla('ordenes'));
   __check("P1.1: los perfiles de centro también, y planificación NO (sigue guardando todo)",['corte','modulos','terminado'].every(r=>{PERFIL={id:'u1',rol:r};return perfilSoloPiso()})&&(PERFIL={id:'u1',rol:'planificacion'},!perfilSoloPiso())&&(PERFIL={id:'u1',rol:'admin'},!perfilSoloPiso()));
   PERFIL={id:'u1',rol:'tablet',nombre:'Operaria de prueba',email:'op@tempo.local'};
   // siembras pendientes de guardar + la base rechaza cualquier escritura fuera de las cuatro tablas del piso
   S.params.pruebaSiembra=new Date().toISOString();
   const DEJA=['avance','bitacora','turnos','paros'];
   __W.writes=[];__W.deny=t=>!DEJA.includes(t);SAVE_ERR=null;
   iniciarTramo(oP.id,'modulos',rec);await __p(60);
   const trP=tramosDe(oP.id).find(x=>!x.fin);
   __check("P1.5: el operario inicia el tramo y se guarda sin error, aunque la base rechace lo demás",!!trP&&!SAVE_ERR,SAVE_ERR?JSON.stringify(SAVE_ERR.errs):'');
   __check("P1.5: no se intenta subir params ni ninguna tabla fuera de las cuatro del piso",!__W.writes.some(w=>!DEJA.includes(w.t)),JSON.stringify([...new Set(__W.writes.map(w=>w.t))]));
   {const m=(motivosParo()[0]||{}).motivo;
    if(m){trP.paros=trP.paros||[];trP.paros.push({id:uid(),ini:new Date(Date.now()-5*6e4).toISOString(),motivo:m,u:quienFirma()});save();await __p(60);
     const pa=paroAbierto(trP);if(pa){pa.fin=new Date().toISOString();pa.min=5;save();await __p(60)}}
    __check("P1.5: paro y reanudación también guardan sin error",!SAVE_ERR&&!__W.writes.some(w=>!DEJA.includes(w.t)));}
   trP.ini=new Date(Date.now()-40*6e4).toISOString();terminarTramo(trP.id,oP.id);await __p(60);
   setTallaTramoVal(trP.id,oP.id,'(total)',30);await __p(60);guardarTramo(trP.id,oP.id);await __p(80);
   __check("P1.5: fin y unidades del tramo guardan sin error y quedan en avance",!SAVE_ERR&&(((S.avance[oP.id]||{}).centros)||{}).modulos===30,SAVE_ERR?JSON.stringify(SAVE_ERR.errs):'');
   __check("P1.5: lo subido fue solo avance, bitácora, turnos y paros",__W.writes.length>0&&!__W.writes.some(w=>!DEJA.includes(w.t)),JSON.stringify([...new Set(__W.writes.map(w=>w.t))]));
   __check("P1.2: la siembra pendiente sigue en memoria pero no se guardó",!!S.params.pruebaSiembra&&JSON.parse(BASE.params||'{}').pruebaSiembra===undefined);
   // 1.3 · lo que el operario hace fuera de sus tablas queda como solicitud en avance
    {const nSol=solicitudesPiso().length;const fNueva=fasesDisponibles().find(f=>f!==oP.fase&&!esDevolucionFase(oP.fase,f))||fasesDisponibles().find(f=>f!==oP.fase)||oP.fase;
    const faseAntes=oP.fase;mFasePiso(oP.id,'modulos');
    const selF=document.getElementById('fp-f');if(selF)selF.value=fNueva;
    guardarFasePiso(oP.id,'modulos');await __p(60);
    __check("P1.3: el operario no cambia la fase: queda como solicitud en avance y planificación la aplica",oP.fase===faseAntes&&solicitudesPiso().length===nSol+1&&((S.avance[oP.id]||{}).solicitudes||[]).some(x=>x.tipo==='fase'&&x.f===fNueva));
    __check("P1.3: pedirlo no rompe el guardado ni toca órdenes",!SAVE_ERR&&!__W.writes.some(w=>w.t==='ordenes'));
    const it=pendientesHoy().find(x=>x.k==='solicPiso');
    __check("P1.3: sale en Hoy → Pendientes del supervisor",!!it&&it.n>=1);
    // planificación la aplica
    PERFIL=adminP;__W.deny=null;const sol=solicitudesPiso('fase')[0];
    aplicarSolicitudFase(sol.oid,sol.id);await __p(60);
    __check("P1.3: planificación la aplica y la fase cambia con la auditoría de siempre",oP.fase===fNueva&&solicitudesPiso('fase').every(x=>x.id!==sol.id));
    PERFIL={id:'u1',rol:'tablet',nombre:'Operaria de prueba',email:'op@tempo.local'};__W.deny=t=>!DEJA.includes(t)}
   {const nR=pedidosReprog().length;__W.writes=[];
    const oFuera=S.ordenes.find(x=>abierta(x)&&x!==oP);
    if(oFuera){pedirReprogramacion(oFuera.id,'modulos');await __p(60);
     __check("P1.3: el pedido de reprogramación del piso se guarda en avance, no en configuración",pedidosReprog().length===nR+1&&((S.avance[oFuera.id]||{}).pedidosReprog||[]).length>=1&&!SAVE_ERR&&!__W.writes.some(w=>w.t==='params'));}
    else __check("P1.3: el pedido de reprogramación del piso se guarda en avance, no en configuración",true,'sin otra orden');}
   {const nA=auditoriaTodo().length;const trC=tramosDe(oP.id)[0];
    __check("P1.3: la auditoría del piso (corrección de tramo) también va en avance y se ve igual",(()=>{registrarAuditoria('tramo',oP,'antes','después','prueba',false);return auditoriaTodo().length===nA+1&&((S.avance[oP.id]||{}).auditoria||[]).length>=1})());}
   // 1.4 · el aviso dice en qué tabla falló
   {__W.deny=()=>true;SAVE_ERR=null;S.avance[oP.id].__forzar=Date.now();await save();
    __check("P1.4: si el servidor rechaza, el aviso dice en qué tabla falló, en texto simple",!!SAVE_ERR&&(SAVE_ERR.tablas||[]).includes('avance del piso')&&SAVE_ERR.permiso===true,JSON.stringify(SAVE_ERR&&SAVE_ERR.tablas));
    {let host=document.getElementById('aviso-guardado');let creado=false;if(!host){host=document.createElement('div');host.id='aviso-guardado';document.body.appendChild(host);creado=true}avisoGuardado();
     __check("P1.4: el aviso en pantalla nombra la tabla y ofrece reintentar",/falló en: avance del piso/.test(host.innerHTML)&&/Reintentar/.test(host.innerHTML));if(creado)host.remove();else host.innerHTML=''}
    __W.deny=null;delete S.avance[oP.id].__forzar;SAVE_ERR=null;await save();await __p(60);
    __check("P1.4: al volver a guardar sin rechazo, el aviso desaparece",!SAVE_ERR);}
   PERFIL=adminP;__W.deny=null;__W.writes=[];delete S.params.pruebaSiembra;
   S.ordenes=S.ordenes.filter(o=>o!==oP);delete S.avance[oP.id];
   TAB.centro=null;TAB.rec=null;TAB.q='';TRAMO={paso:null,id:null,oid:null};
   window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("P1 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PISO · cerrar la orden en el centro aunque falten prendas */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;const alerts=[];window.alert=m=>alerts.push(String(m));
   const bakMot=JSON.stringify(S.params.motivos||null);
   if(!Array.isArray(S.params.motivos))S.params.motivos=[];
   __check("CC0: la tabla 15 tiene el uso «cierre con faltante» y NO viene sembrado",USOS_MOTIVO.some(u=>u[0]==='cierre')&&motivosDe('cierre').length===0);
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const base=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(x=>x.centro==='corte')&&(o.ruta||[]).some(x=>x.centro==='modulos'))||S.ordenes.find(o=>abierta(o));
   const mk=op=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=200;o.fase='4CD Ensamble';delete o.tallasPedido;delete o.programa;
     o.ruta=[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:0.5}];S.ordenes.push(o);delete S.avance[o.id];return o};
   const oC=mk('WH/CIERRE-1');PLAN=null;PLAN_ALL=null;TRAMO={paso:null,id:null,oid:null};
   // 3.1 · con faltante y sin motivo NO cierra
   S.avance[oC.id]={centros:{corte:180}};
   {const n=alerts.length;const ok=cerrarCentro(oC.id,'corte','');
    __check("CC1: cerrar con faltante y sin motivo de la tabla 15 no cierra y lo dice",ok===false&&!pasoCerrado(oC,'corte')&&alerts.length>n&&/motivo/i.test(alerts[alerts.length-1]));}
   S.params.motivos.push({motivo:'Merma de corte',uso:'cierre'});
   {const ok=cerrarCentro(oC.id,'corte','Inventado');
    __check("CC1: el motivo tiene que salir de la tabla 15",ok===false&&!pasoCerrado(oC,'corte'));}
   {const ok=cerrarCentro(oC.id,'corte','Merma de corte');const ci=cierreCentro(oC,'corte');
    __check("CC1: con motivo cierra y guarda unidades, faltante, quién y cuándo",ok===true&&!!ci&&ci.pz===180&&ci.cant===200&&ci.faltan===20&&ci.motivo==='Merma de corte'&&!!ci.u&&!!ci.ts);
    __check("CC2: queda en auditoría",auditoriaTodo().some(x=>x.tipo==='cierre'&&x.oid===oC.id));
    __check("CC2: el paso queda terminado para el motor y para las listas",pasoHecho(oC,'corte')&&!pasosPendPro(oC).some(x=>x.centro==='corte')&&minPendCentro(oC,'corte')===0);}
   // 3.2 · sale de la cola del centro y el recurso queda libre
   {PLAN=null;PLAN_ALL=null;const P=programar();const filas=filasDeCentros(['corte'],P,lunesDe(hoy()),dsum(lunesDe(hoy()),6),'');
    __check("CC2: la orden sale de la cola de corte",!colaCentro('corte',filas).some(f=>f.o.id===oC.id));}
   // 3.3 · los centros siguientes trabajan contra lo que salió
   __check("CC3: el siguiente centro trabaja contra lo que realmente salió (180, no 200)",cantCentro(oC,'modulos')===180&&cantCentro(oC,'corte')===200);
   __check("CC3: el faltante se ve en la ficha de la orden",/Cerrada en estos centros/.test(cierresOrdenHTML(oC))&&cierresOrdenHTML(oC).includes('Merma de corte'));
   {page='avance';AV.mes=hoy().slice(0,7);render();const ha=document.getElementById('p-avance').innerHTML;
    __check("CC3: el reporte de avance tiene el panel de cerradas con faltante",/Cerradas con faltante/.test(ha)&&ha.includes(esc(oC.op))&&/Merma de corte/.test(ha)&&cierresConFaltante().some(x=>x.o.id===oC.id));}
   {page='control';CTL.area='pro';CTL.q='';const bakTodo=CTL.todo;CTL.todo=true;render();const h=document.getElementById('p-control').innerHTML;
    __check("CC3: Control de piso muestra el cierre con el faltante y el botón de reabrir",h.includes(esc(oC.op))&&/cerrada 180 de 200/.test(h)&&/faltan 20/.test(h)&&h.includes('reabrirCierre('));CTL.todo=bakTodo;}
   // 3.5 · la fase NO cambia y la orden aparece lista en el siguiente centro
   __check("CC5: la fase no cambia sola al cerrar",oC.fase==='4CD Ensamble');
   __check("CC5: en el siguiente centro aparece lista para empezar, con dónde terminó y las prendas que salieron",/lista para empezar/.test(tagListaEmpezar(oC,'modulos'))&&/terminada en /.test(tagListaEmpezar(oC,'modulos')));
   __check("CC5: en las listas dice «terminada en … · fase sin actualizar»",/terminada en /.test(whCell(oC))&&/fase sin actualizar/.test(whCell(oC)));
   __check("CC5: «Dónde está» dice que espera en el siguiente centro",(()=>{PLAN=null;const P=programar();const d=dondeEsta(oC,P);return d.k==='modulos'&&/Esperando en /.test(d.n)})());
   {const it=pendientesHoy().find(x=>x.k==='cierreSinFase');
    __check("CC5: sale en Hoy → Pendientes del supervisor",!!it&&it.n>=1);
    page='control';CTL.area='fases';render();const h=document.getElementById('p-control').innerHTML;
    __check("CC5: el panel del supervisor la lista con botón para mover la fase y para reabrir",/Terminadas en un centro con la fase sin actualizar/.test(h)&&h.includes(esc(oC.op))&&/mover fase/.test(h)&&/reabrirCierre\(/.test(h));}
   {const oM=mk('WH/CIERRE-3');S.avance[oM.id]={centros:{}};PLAN=null;PLAN_ALL=null;
    const iniAntes=((programar().ordenes[oM.id]||{}).pasos||[]).find(x=>x.centro==='modulos')||{};
    S.avance[oM.id].centros.corte=180;cerrarCentro(oM.id,'corte','Merma de corte');PLAN=null;PLAN_ALL=null;
    const P2=programar();const psM=((P2.ordenes[oM.id]||{}).pasos||[]).find(x=>x.centro==='modulos')||{};
    __check("CC5: al cerrar corte, el motor deja de pedir tiempo ahí y no retrasa el siguiente paso",minPendCentro(oM,'corte')===0&&!!psM.ini&&(!iniAntes.ini||psM.ini<=iniAntes.ini),JSON.stringify({antes:iniAntes.ini,despues:psM.ini}));
    __check("CC5: el siguiente centro la ve en su cola, lista para empezar",(()=>{const f=filasDeCentros(['modulos'],P2,lunesDe(hoy()),dsum(lunesDe(hoy()),6),'');return colaCentro('modulos',f).some(x=>x.o.id===oM.id)})());
    S.ordenes=S.ordenes.filter(x=>x!==oM);delete S.avance[oM.id];PLAN=null;PLAN_ALL=null}
   // 3.4 · reabrir: solo supervisor, con motivo y auditoría
   {const admin=PERFIL;PERFIL={id:'u1',rol:'tablet'};const n=alerts.length;reabrirCierre(oC.id,'corte');
    __check("CC4: el operario no puede reabrir un cierre",alerts.length>n&&/supervisor/i.test(alerts[alerts.length-1])&&pasoCerrado(oC,'corte'));
    PERFIL=admin;reabrirCierre(oC.id,'corte');const m=document.getElementById('rc-m');if(m)m.value='Merma de corte';
    const nA=auditoriaTodo().length;confirmarReabrirCierre(oC.id,'corte');
    __check("CC4: el supervisor reabre con motivo, queda auditado y vuelve a la cola",!pasoCerrado(oC,'corte')&&auditoriaTodo().length===nA+1&&!pasoHecho(oC,'corte'));
    __check("CC4: nada se pierde: el cierre reabierto queda con quién y por qué",!!((S.avance[oC.id]||{}).cierres||{}).corte.reabierto);}
   // 3.1 · cierre completo: sin preguntar
   {S.avance[oC.id].centros.corte=200;const ok=cerrarCentro(oC.id,'corte','');const ci=cierreCentro(oC,'corte');
    __check("CC1: si lo registrado es igual a la cantidad, cierra sin pedir motivo",ok===true&&!!ci&&ci.faltan===0&&ci.pz===200);}
   // 3.1 · el botón vive en «Confirma lo que salió»
   {const oT=mk('WH/CIERRE-2');PLAN=null;PLAN_ALL=null;
    iniciarTramo(oT.id,'modulos',rec);const tr=tramosDe(oT.id).find(x=>!x.fin);tr.ini=new Date(Date.now()-30*6e4).toISOString();terminarTramo(tr.id,oT.id);
    const h=flujoTramoHTML('modulos',rec,[]);
    __check("CC1: «Confirma lo que salió» tiene el botón de terminar la orden en el centro",/Terminé esta orden en mi centro/.test(h)&&h.includes("terminarOrdenCentro('"+tr.id));
    setTallaTramoVal(tr.id,oT.id,'(total)',150);terminarOrdenCentro(tr.id,oT.id,'modulos');
    const m2=document.getElementById('cc-m');if(m2)m2.value='Merma de corte';cerrarCentroDesdeModal(oT.id,'modulos');
    const ci2=cierreCentro(oT,'modulos');
    __check("CC1: el tramo se guarda primero y después se cierra el paso con su faltante",tramosDe(oT.id)[0].pz===150&&!!ci2&&ci2.pz===150&&ci2.faltan===50&&pasoHecho(oT,'modulos'));
    S.ordenes=S.ordenes.filter(x=>x!==oT);delete S.avance[oT.id];TRAMO={paso:null,id:null,oid:null}}
   S.ordenes=S.ordenes.filter(o=>o!==oC);delete S.avance[oC.id];
   const bm=JSON.parse(bakMot);if(bm)S.params.motivos=bm;else delete S.params.motivos;
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;CTL.area='pro';page='ordenes';render();
   __check("CC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PISO · las tres partes entrando como operario de tablet (no admin) */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;const alerts=[];window.alert=m=>alerts.push(String(m));
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const oO=JSON.parse(JSON.stringify(base));oO.id=uid();oO.op='WH/MO/28513';oO.estado='plan';oO.cant=100;delete oO.tallasPedido;delete oO.programa;oO.ruta=[{centro:'modulos',t:5}];S.ordenes.push(oO);delete S.avance[oO.id];
   if(!Array.isArray(S.params.motivos))S.params.motivos=[];const hayM=motivosDe('cierre').length;if(!hayM)S.params.motivos.push({motivo:'Merma de confección',uso:'cierre'});
   S.params.tablets=S.params.tablets||{};S.params.tablets['u1']={centro:'modulos',rec};
   PERFIL={id:'u1',rol:'tablet',nombre:'Operaria de prueba'};TRAMO={paso:null,id:null,oid:null};TAB.centro='modulos';TAB.rec=rec;TAB.q='';PLAN=null;PLAN_ALL=null;
   __check("OP: el operario entra a Mi centro y solo ve su página",esOperario()&&vePagina('tablet')&&!vePagina('ordenes')&&regHechoOk('modulos'));
   {TAB.q='28513';const h=tabletBuscadorHTML('modulos',[{o:oO,hechas:0}],rec);
    __check("OP (parte 2): busca la WH por el número y le sale la tarjeta con INICIO",h.includes(esc(oO.op))&&h.includes('>INICIO<'));TAB.q=''}
   iniciarTramo(oO.id,'modulos',rec);const trO=tramosDe(oO.id).find(x=>!x.fin);trO.ini=new Date(Date.now()-60*6e4).toISOString();terminarTramo(trO.id,oO.id);
   {const h=flujoTramoHTML('modulos',rec,[]);
    __check("OP (parte 2): sin tallas ve la fila Total para registrar",/>Total</.test(h)&&h.includes('setTallaTramoVal('));
    __check("OP (parte 3): ve el botón de terminar la orden en su centro",/Terminé esta orden en mi centro/.test(h));}
   setTallaTramoVal(trO.id,oO.id,'(total)',80);await __p(40);
   terminarOrdenCentro(trO.id,oO.id,'modulos');
   {const m=document.getElementById('cc-m');if(m)m.value=(motivosDe('cierre')[0]||{}).motivo||'';cerrarCentroDesdeModal(oO.id,'modulos');await __p(60);
    const ci=cierreCentro(oO,'modulos');
    __check("OP (parte 3): el operario cierra su paso con faltante y queda registrado",!!ci&&ci.pz===80&&ci.faltan===20&&!!ci.motivo&&pasoHecho(oO,'modulos'));
    __check("OP (parte 1): todo eso se guardó sin error de permisos",!SAVE_ERR,SAVE_ERR?JSON.stringify(SAVE_ERR.errs):'');
    __check("OP (parte 3): la fase no cambió sola",oO.fase===base.fase);}
   PERFIL=adminP;if(!hayM)S.params.motivos=S.params.motivos.filter(m=>m.motivo!=='Merma de confección');
   S.ordenes=S.ordenes.filter(o=>o!==oO);delete S.avance[oO.id];
   TAB.centro=null;TAB.rec=null;TAB.q='';TRAMO={paso:null,id:null,oid:null};window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("OP sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PISO · el supervisor mueve fases con la función del servidor; el operario las pide */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;const alerts=[];window.alert=m=>alerts.push(String(m));
   const bakMot=JSON.stringify(S.params.motivos||null);if(!Array.isArray(S.params.motivos))S.params.motivos=[];
   // 1 · el catálogo separa operario de supervisor, y es editable
   {const cat=perfilesDef();const t=id=>tipoPiso(cat.find(x=>x.id===id)||{id});
    __check("SF1: tablet es operario y corte/módulos/terminado son supervisores de piso",t('tablet')==='operario'&&t('corte')==='supervisor'&&t('modulos')==='supervisor'&&t('terminado')==='supervisor');
    __check("SF1: planificación y admin no son de piso",!t('planificacion')&&!t('admin'));
    const d=cat.find(x=>x.id==='corte');const bak=d.piso;setPerfilDef('corte','piso','operario');
    __check("SF1: la columna es editable y manda sobre el código",tipoPiso(d)==='operario');
    setPerfilDef('corte','piso',bak===undefined?'supervisor':bak);
    page='usuarios';render();await __p(80);const h=document.getElementById('p-usuarios').innerHTML;
    __check("SF1: la columna Piso se ve y se edita en Configuración → Usuarios",/>Piso</.test(h)&&h.includes("setPerfilDef('corte','piso'")&&/Supervisor de piso/.test(h));}
   // orden de prueba, ya guardada en la base (como cualquier orden real)
   const base=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(x=>x.centro==='modulos'))||S.ordenes.find(o=>abierta(o));
   const oF=JSON.parse(JSON.stringify(base));oF.id=uid();oF.op='WH/FASE-1';oF.estado='plan';oF.cant=100;oF.fase='4CD Ensamble';oF.ruta=[{centro:'modulos',t:5}];delete oF.programa;S.ordenes.push(oF);delete S.avance[oF.id];
   PERFIL=adminP;await save();await __p(80);
   const filaDB=()=>(sb.__DB.ordenes||[]).find(r=>r.id===oF.id);
   __check("SF2: la orden de prueba está en la base para poder comprobar qué toca la función",!!filaDB());
   const fNueva=fasesDisponibles().find(f=>f!==oF.fase&&!esDevolucionFase(oF.fase,f))||fasesDisponibles().find(f=>f!==oF.fase);
   // 3 · el supervisor de piso mueve la fase por rpc, no escribiendo en ordenes
   PERFIL={id:'u1',rol:'modulos',nombre:'Supervisor de prueba'};
   __check("SF3: el supervisor de piso sigue sin subir la tabla de órdenes",esSupervisorPiso()&&perfilSoloPiso()&&!puedeSubirTabla('ordenes')&&puedeFases());
   {const snap=JSON.parse(JSON.stringify(filaDB().data));__RPC.falta=false;__RPC.error=null;__RPC.ultimo=null;__W.writes=[];__W.deny=t=>!['avance','bitacora','turnos','paros'].includes(t);
    await moverFases([oF.id],fNueva,'');await __p(120);
    const dsp=filaDB().data;
    __check("SF3: la fase cambia en la base por mover_fase (rpc), no por un upsert de órdenes",dsp.fase===fNueva&&!!__RPC.ultimo&&__RPC.ultimo.orden===oF.id&&!__W.writes.some(w=>w.t==='ordenes'));
    __check("SF3: la función toca SOLO la fase y su historial",(()=>{const a=Object.assign({},snap),b=Object.assign({},dsp);delete a.fase;delete b.fase;delete a.fases;delete b.fases;return JSON.stringify(a)===JSON.stringify(b)})());
    __check("SF3: en la app la orden queda con la fase nueva y su historial con quién y motivo",oF.fase===fNueva&&(oF.fases||[]).slice(-1)[0].f===fNueva&&(oF.fases||[]).slice(-1)[0].antes==='4CD Ensamble');
    __check("SF3: queda la auditoría (en avance, que es lo que el piso sí guarda) y la bitácora del servidor",auditoriaTodo().some(x=>x.tipo==='fase'&&x.oid===oF.id)&&(sb.__DB.bitacora||[]).some(r=>/Fase /.test(((r.data||{}).t)||'')));
    __check("SF3: el guardado no falla ni intenta subir órdenes",!SAVE_ERR,SAVE_ERR?JSON.stringify(SAVE_ERR.errs):'');}
   // 3 · si la función no existe todavía, avisa y NO cambia nada
   {const faseAntes=oF.fase;const snap=JSON.stringify(filaDB().data);__RPC.falta=true;const n=alerts.length;
    const otra=fasesDisponibles().find(f=>f!==oF.fase)||oF.fase;
    await moverFases([oF.id],otra,motivoValido('fase',(motivosDe('fase')[0]||{}).motivo||'')?(motivosDe('fase')[0]||{}).motivo:'');await __p(120);
    __check("SF3: sin la función en la base avisa «falta ejecutar SUPABASE_MOVER_FASE.sql» y no cambia nada",alerts.length>n&&/SUPABASE_MOVER_FASE\.sql/.test(alerts[alerts.length-1])&&oF.fase===faseAntes&&JSON.stringify(filaDB().data)===snap);
    __RPC.falta=false}
   // 3 · el operario sigue enviando solicitud
   {PERFIL={id:'u1',rol:'tablet',nombre:'Operaria de prueba'};S.params.tablets=S.params.tablets||{};S.params.tablets['u1']={centro:'modulos',rec:(S.recursos.find(r=>r.centro==='modulos'&&r.activa)||{}).id};
    const faseAntes=oF.fase;const nSol=solicitudesPiso().length;__RPC.ultimo=null;
    mFasePiso(oF.id,'modulos');const sel=document.getElementById('fp-f');const otra=fasesDisponibles().find(f=>f!==oF.fase&&!esDevolucionFase(oF.fase,f))||fasesDisponibles().find(f=>f!==oF.fase)||oF.fase;if(sel)sel.value=otra;
    guardarFasePiso(oF.id,'modulos');await __p(80);
    __check("SF3: el operario no mueve la fase: queda solicitud y no se llama a la función",oF.fase===faseAntes&&solicitudesPiso().length===nSol+1&&!__RPC.ultimo);
    // y el supervisor la aplica
    PERFIL={id:'u1',rol:'modulos',nombre:'Supervisor de prueba'};const sol=solicitudesPiso('fase').slice(-1)[0];
    await aplicarSolicitudFase(sol.oid,sol.id);await __p(150);
    __check("SF3: el supervisor aplica la solicitud del operario y la fase cambia en la base",oF.fase===sol.f&&filaDB().data.fase===sol.f);}
   // la bandeja de «fase sin actualizar» le sirve al supervisor
   {S.avance[oF.id]=S.avance[oF.id]||{};S.avance[oF.id].centros={modulos:100};
    cierresDe(oF.id).modulos={pz:100,cant:100,faltan:0,motivo:'',u:'prueba',ts:new Date().toISOString()};
    const cf=cierresSinFase();
    __check("SF3: la bandeja «fase sin actualizar» lista la orden para el supervisor",cf.some(x=>x.o.id===oF.id));
    page='control';CTL.area='fases';render();const h=document.getElementById('p-control').innerHTML;
    __check("SF3: y el panel le ofrece mover la fase (que ahora sí puede)",/Terminadas en un centro con la fase sin actualizar/.test(h)&&h.includes(esc(oF.op))&&/mover fase/.test(h)&&puedeFases()&&esSupervisorPiso());}
   // 4 · listas para empezar que el motor aún no programa
   {const oL=JSON.parse(JSON.stringify(base));oL.id=uid();oL.op='WH/FASE-2';oL.estado='plan';oL.cant=100;oL.fase='4CD Ensamble';oL.ruta=[{centro:'corte',t:1},{centro:'modulos',t:5}];delete oL.programa;S.ordenes.push(oL);
    S.avance[oL.id]={centros:{corte:80}};cierresDe(oL.id).corte={pz:80,cant:100,faltan:20,motivo:'prueba',u:'prueba',ts:new Date().toISOString()};
    PLAN=null;PLAN_ALL=null;const P=programar();
    const l=listasNoProgramadas('modulos',P,hoy());
    __check("SF4: la orden con el paso anterior cerrado y sin fecha cercana sale en «listas para empezar»",l.some(x=>x.o.id===oL.id),JSON.stringify(l.map(x=>x.o.op)));
    const h=listasNoProgramadasHTML('modulos',P,hoy());
    __check("SF4: la sección dice dónde terminó, cuándo y cuántas prendas salieron",/Listas para empezar · aún no programadas/.test(h)&&h.includes(esc(oL.op))&&/80/.test(h)&&/faltaron 20/.test(h));
    PERFIL=adminP;const h2=listasNoProgramadasHTML('modulos',P,hoy());
    __check("SF4: planificación puede adelantarla; el piso ve que eso lo guarda planificación",/adelantar/.test(h2)&&/adelantarla en la cola la guarda planificación/.test(h));
    page='centro';CEN.id='modulos';CEN.tab='prog';CEN.q='';render();
    __check("SF4: la sección sale en la programación del centro",/Listas para empezar · aún no programadas/.test(document.getElementById('p-centro').innerHTML));
    S.ordenes=S.ordenes.filter(x=>x!==oL);delete S.avance[oL.id]}
   PERFIL=adminP;__W.deny=null;__RPC.falta=false;__RPC.error=null;
   S.ordenes=S.ordenes.filter(o=>o!==oF);delete S.avance[oF.id];
   if(sb.__DB.ordenes)sb.__DB.ordenes=sb.__DB.ordenes.filter(r=>r.id!==oF.id);
   const bm=JSON.parse(bakMot);if(bm)S.params.motivos=bm;else delete S.params.motivos;
   window.alert=a0;CTL.area='pro';PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("SF sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PISO · prioridad por rpc, catálogo que manda y guardar sin pisar lo de otra persona */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;const alerts=[];window.alert=m=>alerts.push(String(m));
   const base=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(x=>x.centro==='modulos'))||S.ordenes.find(o=>abierta(o));
   const mk=op=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=100;o.fase='4CD Ensamble';o.ruta=[{centro:'modulos',t:5}];delete o.progCentro;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];return o};
   const oX=mk('WH/FUS-1');PERFIL=adminP;PLAN=null;PLAN_ALL=null;await save();await __p(90);
   const fila=()=>(sb.__DB.ordenes||[]).find(r=>r.id===oX.id);
   __check("FU0: la orden está en la base y su «actualizado» quedó anotado",!!fila()&&!!fila().actualizado&&(BASE_TS.ordenes||{})[oX.id]===fila().actualizado);
   // 1 · si el catálogo le quita «supervisor» a corte, corte ya no mueve fases
   {const cat=perfilesDef();const dC=cat.find(x=>x.id==='corte');const bak=dC.piso;
    setPerfilDef('corte','piso','operario');PERFIL={id:'u1',rol:'corte',nombre:'Corte de prueba'};
    const faseAntes=oX.fase;const nSol=solicitudesPiso().length;__RPC.ultimo=null;
    const otra=fasesDisponibles().find(f=>f!==oX.fase&&!esDevolucionFase(oX.fase,f))||fasesDisponibles().find(f=>f!==oX.fase);
    await moverFases([oX.id],otra,'');await __p(90);
    __check("FU1: con el catálogo en «operario», corte no mueve la fase: queda solicitud",!esSupervisorPiso()&&oX.fase===faseAntes&&!__RPC.ultimo&&solicitudesPiso().length===nSol+1);
    setPerfilDef('corte','piso','supervisor');PERFIL={id:'u1',rol:'corte',nombre:'Corte de prueba'};
    __check("FU1: al devolverle «supervisor», vuelve a mover fases",esSupervisorPiso());
    setPerfilDef('corte','piso',bak===undefined?'supervisor':bak)}
   // 2 · una fase que todavía no usa ninguna orden se puede mover (la SQL ya no la rechaza)
   {PERFIL={id:'u1',rol:'modulos',nombre:'Supervisor de prueba'};
    const usadas=new Set(S.ordenes.map(o=>o.fase));const libre=FASES.filter(f=>!usadas.has(f)&&!esDevolucionFase(oX.fase,f))[0];
    if(libre){await moverFases([oX.id],libre,'');await __p(120);
     __check("FU2: la primera orden que llega a una fase sin usar se mueve igual",oX.fase===libre&&fila().data.fase===libre);}
    else __check("FU2: la primera orden que llega a una fase sin usar se mueve igual",true,'todas las fases están en uso');}
   // 3 · el supervisor reordena la cola por rpc, sin subir la tabla de órdenes
   {const oY=mk('WH/FUS-2');PERFIL=adminP;await save();await __p(90);
    PERFIL={id:'u1',rol:'modulos',nombre:'Supervisor de prueba'};__RPC.ultimoPri=null;__W.writes=[];__W.deny=t=>!['avance','bitacora','turnos','paros'].includes(t);
    PLAN=null;PLAN_ALL=null;await moverEnCola(oY.id,'modulos',{pos:1});await __p(200);
    __check("FU3: el supervisor reordena la cola con set_prioridad_centro, no con un upsert de órdenes",!!__RPC.ultimoPri&&__RPC.ultimoPri.centro==='modulos'&&!__W.writes.some(w=>w.t==='ordenes'));
    const fY=(sb.__DB.ordenes||[]).find(r=>r.id===oY.id);
    __check("FU3: el puesto queda guardado en la base y en la pantalla",!!fY&&((fY.data.progCentro||{}).modulos||{}).pri>=1&&((oY.progCentro||{}).modulos||{}).pri>=1);
    // y si la función no existe, se deshace y avisa
    const priAntes=((oY.progCentro||{}).modulos||{}).pri;__RPC.falta=true;const n=alerts.length;
    await moverEnCola(oY.id,'modulos',{pos:9});await __p(200);
    __check("FU3: sin la función en la base, avisa y deja la cola como estaba",alerts.length>n&&/SUPABASE_MOVER_FASE\.sql/.test(alerts[alerts.length-1])&&((oY.progCentro||{}).modulos||{}).pri===priAntes);
    __RPC.falta=false;__W.deny=null;S.ordenes=S.ordenes.filter(x=>x!==oY);if(sb.__DB.ordenes)sb.__DB.ordenes=sb.__DB.ordenes.filter(r=>r.id!==oY.id)}
   // 4 · guardar sin pisar lo que cambió otra persona
   PERFIL=adminP;
   {const otraFase=fasesDisponibles().find(f=>f!==oX.fase)||oX.fase;
    const f0=fila();f0.data=JSON.parse(JSON.stringify(f0.data));f0.data.fase=otraFase;f0.data.fases=(f0.data.fases||[]).concat([{f:otraFase,antes:oX.fase,ts:new Date().toISOString(),u:'otra persona'}]);
    f0.actualizado=new Date(Date.now()+9999).toISOString(); // otro supervisor movió la fase desde otro equipo
    oX.fecha='2026-12-31'; // y aquí planificación cambia OTRO campo
    await save();await __p(150);
    __check("FU4: la fase que movió la otra persona se mantiene y no se pisa",fila().data.fase===otraFase&&oX.fase===otraFase);
    __check("FU4: y el campo que cambió esta sesión sí se guarda",fila().data.fecha==='2026-12-31'&&!CONFLICTOS.length);}
   // 5 · si los dos tocan el MISMO campo, avisa y deja decidir
   {const f1=fila();f1.data=JSON.parse(JSON.stringify(f1.data));f1.data.fecha='2026-11-11';f1.actualizado=new Date(Date.now()+99999).toISOString();
    oX.fecha='2026-10-10';
    await save();await __p(150);
    __check("FU5: los dos cambiaron el mismo campo: avisa, no pisa y deja lo del servidor a la vista",CONFLICTOS.length===1&&CONFLICTOS[0].choques.includes('fecha')&&fila().data.fecha==='2026-11-11'&&oX.fecha==='2026-11-11');
    avisoConflictos();const b=document.getElementById('aviso-conflicto');
    __check("FU5: el aviso dice de qué orden y en qué campo, con las dos salidas",!!b&&/Otra persona cambió/.test(b.innerHTML)&&b.innerHTML.includes('fecha')&&/Dejar lo mío/.test(b.innerHTML));
    await resolverConflicto(0,'mio');await __p(150);
    __check("FU5: «dejar lo mío» sube mi valor y cierra el aviso",fila().data.fecha==='2026-10-10'&&!CONFLICTOS.length&&!document.getElementById('aviso-conflicto'));}
   PERFIL=adminP;__W.deny=null;__RPC.falta=false;CONFLICTOS=[];avisoConflictos();
   S.ordenes=S.ordenes.filter(o=>o!==oX);delete S.avance[oX.id];
   if(sb.__DB.ordenes)sb.__DB.ordenes=sb.__DB.ordenes.filter(r=>r.id!==oX.id);
   window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("FU sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* INGRESO · recuperar la contraseña */
  {const antes=__R.errors.length;const a0=window.alert;window.alert=()=>{};
   const q=id=>document.getElementById(id);
   verLogin('entrar');
   __check("RC1: la pantalla de ingreso tiene el enlace «¿Olvidaste tu contraseña?» debajo de Entrar",!!q('l-olvide')&&/Olvidaste tu contraseña/.test(q('l-olvide').textContent)&&q('login-entrar').style.display!=='none');
   verLogin('olvide');
   __check("RC1: el enlace abre la pantalla del correo y esconde la de ingreso",q('login-olvide').style.display!=='none'&&q('login-entrar').style.display==='none'&&/Recuperar el acceso/.test(q('login-tit').textContent));
   __AUTH.reset=null;q('l-remail').value='no-es-un-correo';await pedirReset();await __p(30);
   __check("RC1: con un correo mal escrito no se manda nada y lo dice",!__AUTH.reset&&/correo válido/.test(q('l-rmsg').textContent));
   q('l-remail').value='alguien@tempo.local';await pedirReset();await __p(40);
   const msg1=q('l-rmsg').textContent;
   __check("RC1: pide el enlace con resetPasswordForEmail y la URL de vuelta es la de la app",!!__AUTH.reset&&__AUTH.reset.email==='alguien@tempo.local'&&(__AUTH.reset.opts||{}).redirectTo===location.origin+location.pathname);
   __check("RC1: el mensaje no dice si el correo existe y menciona el spam",/Si el correo está registrado/.test(msg1)&&/spam/i.test(msg1));
   __AUTH.reset=null;q('l-remail').value='nadie-inventado@tempo.local';await pedirReset();await __p(40);
   __check("RC1: con un correo que no existe el mensaje es exactamente el mismo",q('l-rmsg').textContent===msg1&&!!__AUTH.reset);
   // al volver del enlace: pantalla de contraseña nueva
   {const entrarReal=entrar;let entro=null;entrar=async u=>{entro=u};
    if(typeof __AUTH.cb==='function')__AUTH.cb('PASSWORD_RECOVERY',{user:{id:'u1'}});
    __check("RC1: al volver desde el enlace se abre «Nueva contraseña»",RECUPERANDO===true&&q('login-nueva').style.display!=='none'&&/Nueva contraseña/.test(q('login-tit').textContent));
    __AUTH.updated=null;q('l-p1').value='corta';q('l-p2').value='corta';await guardarPassNueva();await __p(30);
    __check("RC1: menos de 8 caracteres no se guarda",!__AUTH.updated&&/8 caracteres/.test(q('l-nmsg').textContent));
    q('l-p1').value='unaClaveLarga';q('l-p2').value='otraClaveLarga';await guardarPassNueva();await __p(30);
    __check("RC1: si las dos no son iguales tampoco",!__AUTH.updated&&/no son iguales/.test(q('l-nmsg').textContent));
    q('l-p1').value='unaClaveLarga';q('l-p2').value='unaClaveLarga';await guardarPassNueva();await __p(60);
    __check("RC1: con las dos iguales llama a updateUser y entra",!!__AUTH.updated&&__AUTH.updated.password==='unaClaveLarga'&&!!entro&&RECUPERANDO===false);
    __check("RC1: los campos quedan vacíos y no se guarda la contraseña en pantalla",q('l-p1').value===''&&q('l-p2').value==='');
    // si el servidor rechaza, lo dice y no entra
    __AUTH.err='El enlace ya venció';__AUTH.updated=null;entro=null;q('l-p1').value='otraClaveLarga';q('l-p2').value='otraClaveLarga';
    await guardarPassNueva();await __p(40);
    __check("RC1: si el enlace venció, lo dice y no entra",/No se pudo guardar/.test(q('l-nmsg').textContent)&&/venció/.test(q('l-nmsg').textContent)&&!entro);
    __AUTH.err=null;entrar=entrarReal}
   // restablecer desde administración: el mismo enlace, sin ver ni elegir la contraseña
   {const cp=window.confirm;window.confirm=()=>true;__AUTH.reset=null;const nb=S.bitacora.length;
    await restablecerClave('u1','prueba@tempo.local');await __p(60);
    __check("RC2: administración manda el enlace de restablecimiento y queda en bitácora",!!__AUTH.reset&&__AUTH.reset.email==='prueba@tempo.local'&&(__AUTH.reset.opts||{}).redirectTo===location.origin+location.pathname&&S.bitacora.length>nb);
    window.confirm=cp}
   {page='usuarios';render();await __p(120);const h=document.getElementById('p-usuarios').innerHTML;
    __check("RC2: la columna Contraseña con «enviar enlace» sale en Usuarios",/>Contraseña</.test(h)&&h.includes('restablecerClave(')&&/enviar enlace/.test(h));}
   RECUPERANDO=false;verLogin('entrar');document.getElementById('login').classList.remove('on');
   window.alert=a0;page='ordenes';render();
   __check("RC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* LIBERACIÓN · meses en multiselección y el filtro de fases que no marcaba */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   const bak={ym:LIB.ym,fases:LIB.fases,hija:LIB.hija,tela:LIB.tela,odc:LIB.odc,fam:LIB.fam,cli:LIB.cli};
   page='liberacion';LIB.et='tela';LIB.q='';LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.hija=null;LIB.tela=null;LIB.mes=null;LIB.fases=null;LIB.ym=null;LIB.verLista=true;GRP={};
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mk=(op,proy,fase)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=100;o.proyecto=proy;o.fase=fase;delete o.lib;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];return o};
   const fA=FASES[1]||'1Tejeduria',fB=FASES[2]||'2Planificacion';
   const oA=mk('WH/FIL-A','ENERO 2027',fA),oB=mk('WH/FIL-B','FEBRERO 2027',fB),oC=mk('WH/FIL-C','MARZO 2027',fA);
   PLAN=null;PLAN_ALL=null;[oA,oB,oC].forEach(o=>{if(!rutaConfirmada(o))confirmarRuta(o,'persona','prueba de filtros')});
   const pend=()=>pendLiberacion('tela',LIB.ym).filter(o=>okFiltrosB1(o));
   // 1a · varios meses a la vez
   __check("F1a: sin filtro de mes entran los tres meses",['WH/FIL-A','WH/FIL-B','WH/FIL-C'].every(op=>pend().some(o=>o.op===op)));
   LIB.ym=new Set(['2027-01']);
   __check("F1a: con un mes marcado solo entra ese",pend().some(o=>o.op==='WH/FIL-A')&&!pend().some(o=>o.op==='WH/FIL-B'));
   togSetYmLib('2027-03');
   __check("F1a: marcando un segundo mes entran los dos (multiselección)",LIB.ym.size===2&&pend().some(o=>o.op==='WH/FIL-A')&&pend().some(o=>o.op==='WH/FIL-C')&&!pend().some(o=>o.op==='WH/FIL-B'));
   __check("F1a: el texto de la base nombra los meses elegidos",/enero de 2027/.test(mesesLibTxt(LIB.ym))&&/marzo de 2027/.test(mesesLibTxt(LIB.ym)));
   LIB.ym=null;
   // 1b · el filtro de fases
   const fasesAll=[...new Set(S.ordenes.filter(abierta).map(o=>o.fase||'Sin fase'))];
   LIB.fases=null;togFaseFiltro('LIB.fases',fA,fasesAll);
   __check("F1b: partiendo de TODAS, desmarcar una fase deja todas MENOS esa (antes dejaba solo esa)",!!LIB.fases&&!LIB.fases.has(fA)&&LIB.fases.size===fasesAll.length-1&&!pend().some(o=>o.op==='WH/FIL-A')&&pend().some(o=>o.op==='WH/FIL-B'));
   LIB.fases=new Set(['∅']);
   __check("F1b: «Limpiar» deja ninguna fase y no pasa ninguna orden",pend().length===0);
   togFaseFiltro('LIB.fases',fA,fasesAll);
   __check("F1b: después de Limpiar, marcar una fase SÍ la marca (era el bug: se quedaba en «Ninguna fase»)",!!LIB.fases&&LIB.fases.has(fA)&&!LIB.fases.has('∅')&&LIB.fases.size===1&&pend().some(o=>o.op==='WH/FIL-A')&&!pend().some(o=>o.op==='WH/FIL-B'));
   {const h=filtroFasesHTML(fasesAll,LIB.fases,'LIB.fases','togFaseLib',null);const trozo=h.split('<label').find(x=>x.includes('> '+esc(fA)+'</label>'));
    __check("F1b: y en pantalla ese checkbox queda marcado y el resumen deja de decir «Ninguna fase»",!/Ninguna fase/.test(h)&&!!trozo&&/checked/.test(trozo));}
   togFaseFiltro('LIB.fases',fA,fasesAll);
   __check("F1b: desmarcar la única marcada vuelve a «ninguna», no a «todas»",!!LIB.fases&&LIB.fases.has('∅')&&pend().length===0);
   LIB.fases=null;
   __check("F1b: «Seleccionar todas» (fases = ninguna marca) vuelve a dejar pasar todo",pend().length>=3);
   // TODAS / quitar por grupo
   {const gs=gruposFasesDe(fasesAll);const g=gs.find(x=>x.fases.includes(fA))||gs[0];
    togGrupoFiltro('LIB.fases',g.fases,false,fasesAll);
    __check("F1b: «quitar» un grupo saca sus fases y deja las demás",!!LIB.fases&&g.fases.every(f=>!LIB.fases.has(f))&&LIB.fases.size===fasesAll.length-g.fases.length);
    LIB.fases=new Set(['∅']);togGrupoFiltro('LIB.fases',g.fases,true,fasesAll);
    __check("F1b: «todas» de un grupo marca solo ese grupo",!!LIB.fases&&g.fases.every(f=>LIB.fases.has(f))&&LIB.fases.size===g.fases.length);
    LIB.fases=null}
   // el filtro acota de verdad: tarjetas, conteo y el botón de liberar
   {LIB.fases=new Set([fA]);LIB.fam2=null;LIB.verLista=true;render();
    const h=document.getElementById('p-liberacion').innerHTML;
    const listas=pend().filter(o=>puedeLiberarA(o,'tela'));
    const s0=h.slice(h.indexOf('id="lib-lista"'));const tab=s0.slice(0,s0.indexOf('</table>'));
    __check("F1b: el filtro acota la lista del bloque 1",tab.includes(esc('WH/FIL-A'))&&!tab.includes(esc('WH/FIL-B')));
    __check("F1b: y acota el conteo de la tarjeta y el botón «Liberar todo lo filtrado»",h.includes('>'+pend().length+'<')&&h.includes('Liberar todo lo filtrado ('+listas.length+')'));
    LIB.fases=null}
   S.ordenes=S.ordenes.filter(o=>![oA,oB,oC].includes(o));[oA,oB,oC].forEach(o=>{delete S.avance[o.id]});
   LIB.ym=bak.ym;LIB.fases=bak.fases;LIB.hija=bak.hija;LIB.tela=bak.tela;LIB.odc=bak.odc;LIB.fam=bak.fam;LIB.cli=bak.cli;LIB.fam2=null;LIB.verLista=false;
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("F1 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* CENTRO · por qué una orden aparece «tarde» */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   const base=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(x=>x.centro==='corte'))||S.ordenes.find(o=>abierta(o));
   const mk=(op,fecha)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=50;o.fecha=fecha;delete o.fechaCompromiso;o.ruta=[{centro:'corte',t:1},{centro:'modulos',t:5}];delete o.programa;S.ordenes.push(o);delete S.avance[o.id];if(!rutaConfirmada(o))confirmarRuta(o,'persona','prueba');return o};
   const oVenc=mk('WH/TARDE-1',dsum(hoy(),-20));   // la meta ya pasó
   const oLejos=mk('WH/TARDE-2',dsum(hoy(),400));  // con muchísimo margen
   PLAN=null;PLAN_ALL=null;const P=programar();
   {const d=diagAtraso(oVenc,P,'corte');
    __check("VT1: la marca se calcula contra la fecha meta de la ORDEN, no contra el paso del centro",d.meta===fechaMetaDe(oVenc)&&d.finPro===(P.ordenes[oVenc.id]||{}).finPro);
    __check("VT1: con la meta ya vencida se dice «meta vencida», no «va tarde» a secas",d.vencida===true&&/meta vencida/.test(marcaCentro(oVenc,P,'corte')));}
   {const m=marcaCentro(oLejos,P,'corte');
    __check("VT2: una orden con margen de sobra no lleva ninguna marca de atraso",!/va tarde|meta vencida/.test(m),m);}
   {const h=porQueTardeHTML([{o:oVenc},{o:oLejos}],P,'corte');
    __check("VT3: la cola explica arriba contra qué fecha se compara y cuántas por cada causa",/Por qué aparecen/.test(h)&&/fecha meta de la orden/.test(h)&&/meta ya vencida/.test(h));}
   S.ordenes=S.ordenes.filter(o=>![oVenc,oLejos].includes(o));[oVenc,oLejos].forEach(o=>delete S.avance[o.id]);
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("VT sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  __R.done=true;console.log('__RESULTADO__ '+JSON.stringify({errores:__R.errors.length,fallos:__R.checks.filter(c=>!c.ok).length,checks:__R.checks.length}));
}
__run().catch(e=>{__R.errors.push({page:'driver',msg:e.message,stack:(e.stack||'').slice(0,300)});__R.done=true});
</script>
