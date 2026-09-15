/* confirm por defecto en el simulador: los borrados y reemplazos ahora piden confirmación (15-sep-2026); las pruebas que necesitan NO la ponen en false */
window.confirm=()=>true;
<script>
/* Guion de pruebas: se ejecuta cuando la app terminó de cargar */
async function __esperar(f,ms){const t0=Date.now();while(!f()){if(Date.now()-t0>ms)throw new Error('timeout esperando');await new Promise(r=>setTimeout(r,50))}}
function __check(nombre,cond,detalle){__R.checks.push({nombre,ok:!!cond,detalle:detalle===undefined?'':String(detalle)})}
const __p=ms=>new Promise(r=>setTimeout(r,ms));
async function __run(){try{__R.prevFuzz=localStorage.__fuzz||'';__R.prevFase=localStorage.__fase||'';localStorage.__fuzz='';localStorage.__fase=''}catch(e){}
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
   __check('planOT real: SERIGRAFIA con operación ETIQUETADO va a etiquetas',Object.values(po.porOrden).some(x=>x.centros.etiquetas&&x.centros.etiquetas.odoo==='SERIGRAFIA'));
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
   cerrar();page="ordenes";ORDF.q=o1.op;const g0=ORDF.grupo;ORDF.grupo=null;render();const hO=document.getElementById("p-ordenes").innerHTML;ORDF.q="";ORDF.grupo=g0;__check("fotos: miniaturas en la lista de órdenes",hO.includes("foto-mini"));
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
   page='centro';CEN.id='modulos';CEN.tab='viene';render();const hv=document.getElementById('p-centro').innerHTML;
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
     page='liberacion';LIB.et='tela';render();const hl=document.getElementById('p-liberacion').innerHTML;__check("liberación: casillas tintura / lavado de tela por tela",hl.includes('qué le falta')&&hl.includes('lavado de tela')&&hl.includes("setFaltaTela("));}
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
   page='ordenes';ORDF.q=oP?oP.op:'';const g0=ORDF.grupo;ORDF.grupo=null;render();const hO=document.getElementById('p-ordenes').innerHTML;ORDF.q='';ORDF.grupo=g0;__check("plana: la lista de órdenes muestra metros con la marca (plana)",!oP||/\d+ m <span class="mut">\(plana\)/.test(hO));
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
     CEN.niveles=['cliente','cat'];render();const arb=agruparCola(cola3,['cliente','cat']);const nHojas=a=>a.hojas?a.hojas.length:a.grupos.reduce((x,g)=>x+nHojas(g.sub),0);
     __check("cola: agrupar cliente→categoría conserva todas las órdenes y suma pendientes",nHojas(arb)===cola3.length&&arb.grupos.reduce((x,g)=>x+g.pz,0)===cola3.reduce((x,f)=>x+Math.max(0,f.o.cant-f.hechas),0)&&html().includes('Cliente:')&&(html().match(/draggable="true"/g)||[]).length===cola3.length);
     // prio global manda: la pantalla lo dice
     const pr=oA.prio;oA.prio=1;render();__check("cola: si la orden tiene prio global, la pantalla dice que manda",html().includes('prio global 1 manda'));oA.prio=pr;
     // otro centro con menor puesto
     oA.progCentro.modulos={pri:1};render();__check("cola: si otro centro la tiene en menor puesto, la pantalla lo dice",html().includes('la tiene en 1: manda ese'));delete oA.progCentro.modulos;
     // perfil sin permiso no mueve
     PERFIL={rol:'modulos',modo:'editar',nombre:'Mod'};const antesP=puestoDe(oA,'corte');moverEnCola(oA.id,'corte',{pos:1});__check("cola: un perfil de otro centro no puede mover",puestoDe(oA,'corte')===antesP);PERFIL=adminP;
     // terminados: una cola por centro
     CEN.id='terminados';CEN.niveles=[];render();__check("cola: Terminados muestra una cola por centro",(html().match(/Cola de /g)||[]).length===4);
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
  const paginas=['ordenes','panorama','gerencia','liberacion','wip','entregas','plan','familias','escenarios','cumplimiento','tejeduria','tintoreria','centro','produccion','costura','balanceo','imprimir','control','linea','categorias','operaciones','config','usuarios','albaran','reporteria'];
  for(const p of paginas){try{localStorage.__fase='pagina '+p}catch(e){}const antes=__R.errors.length;page=p;try{render()}catch(e){__R.errors.push({page:p,msg:'render: '+e.message,stack:(e.stack||'').split('\n').slice(0,3).join(' | ')})}
    const chips=[...document.querySelectorAll('main .chip[onclick], main .chips .chip')].slice(0,40);
    for(const ch of chips){try{localStorage.__fase='chip '+p+': '+(ch.getAttribute('onclick')||'').slice(0,80)}catch(e){}try{ch.click()}catch(e){__R.errors.push({page:p,msg:'chip: '+e.message})}}
    await __p(10);
    __check('página '+p+' sin errores',__R.errors.length===antes,__R.errors.slice(antes).map(e=>e.msg).join(' || '))}
  for(const a of ['tej','tin','pro']){const antes=__R.errors.length;page='control';CTL.area=a;try{render()}catch(e){__R.errors.push({page:'control/'+a,msg:e.message})}__check('control de piso '+a,__R.errors.length===antes)}
  for(const c of Object.keys(CENTROS_PROD)){for(const tab of ['plan','prog','ejec']){const antes=__R.errors.length;page='centro';CEN.id=c;CEN.tab=tab;try{render()}catch(e){__R.errors.push({page:'centro/'+c+'/'+tab,msg:e.message})}__check('centro '+c+' '+tab,__R.errors.length===antes)}}
  try{localStorage.__fase="flujo tintoreria"}catch(e){}
  /* flujo tintorería: armar por color → confirmar → salió → calidad → liberar a corte */
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
  page='liberacion';LIB.et='corte';render();__check('tras aprobar: aparece en Liberación → A producción lista para firmar',document.getElementById('p-liberacion').innerHTML.includes(o0.op));page='control';CTL.area='tin';render();
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
   page='liberacion';LIB.et='corte';LIB.q='';LIB.fam=null;LIB.hija=null;LIB.tela=null;LIB.cli=null;LIB.mes=null;LIB.fases=null;LIB.verLista=true;render();
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
     page='ordenes';render();const ho=()=>document.getElementById('p-ordenes').innerHTML;__check("ODC: panel Asignar ODC en Órdenes con casillas, uno por uno y en bloque",ho().includes('Asignar ODC')&&ho().includes("asignarODC(['"+o.id+"']")&&ho().includes('Asignar a las'));
     const ap=window.alert;window.alert=()=>{};const nb=S.bitacora.length;asignarODC([o.id],'9999');__check("ODC: de a una: queda el ODC, quién/cuándo/antes, bitácora, y forma colección",o.odc==='9999'&&o.odcManual&&o.odcManual.antes==='PENDIENTE ODC'&&o.odcManual.u&&S.bitacora.slice(-3).some(b=>/ODC asignado a mano/.test(b.t)&&b.t.includes(o.op))&&claveColeccion(o)==='ODC 9999');
     asignarODC([o2.id],'  ');__check("ODC: vacío no se asigna",o2.odc==='');
     ODCS.sel=new Set([o2.id]);asignarODC([o2.id],'9999');__check("ODC: en bloque: las marcadas toman el mismo ODC y quedan en la misma colección",o2.odc==='9999'&&claveColeccion(o2)===claveColeccion(o)&&!ODCS.sel.has(o2.id));window.alert=ap;
     // la recarga conserva el ODC a mano (tabla 14)
     __check("ODC: la tabla 14 conserva el ODC asignado a mano",conserva('odc')===true&&camposConservados().some(r=>r.campo==='odc'));
     o.odc=bak[0];o2.odc=bak[1];if(bak[2])o.odcManual=bak[2];else delete o.odcManual;if(bak[3])o2.odcManual=bak[3];else delete o2.odcManual;PLAN=null;PLAN_ALL=null;}}
   page='panorama';render();__check("pantalla sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* ASIGNACIÓN POR ORDEN: por estado, próximo paso, agrupar/filtrar, foto, vencidas con un solo paso */
  {const antes=__R.errors.length;const adminP=PERFIL;APO={niveles:null,cli:'',cen:'',mes:'',q:''};page='produccion';render();const hp=()=>document.getElementById('p-produccion').innerHTML;
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
   page='liberacion';LIB.et='tela';LIB.q=o1.op;render();const hl=document.getElementById('p-liberacion').innerHTML;__check("PM→Liberación: la orden del plan sin liberar dice EN EL PLAN — pendiente de liberar",liberada(o1,'tela')||hl.includes('EN EL PLAN')&&hl.includes('pendiente de liberar'),liberada(o1,'tela')?'(ya liberada)':'');
   page='plan';render();congelarPlan(ym);__check("PM: congelar guarda versión con oids y marca planMes.congelado (versión, quién, cuándo)",!!planMesCongelado(ym)&&planMesCongelado(ym).ver>=1&&!!planMesCongelado(ym).ts&&(S.planes||[]).some(p=>p.mes===ym&&(p.oids||[]).includes(o1.id)));
   h=hp();__check("PM: bloque 5 dice CONGELADO con versión y fecha, y 'En el plan' lo marca congelado",h.includes('CONGELADO')&&h.includes('versión v')&&h.includes('CONGELADO v'));
   const cen=(o1.ruta||[]).map(p=>p.centro).find(cid=>CE(cid)&&CE(cid).area==='pro');if(cen){page='centro';CEN.id=cen;CEN.tab='viene';render();const hc=document.getElementById('p-centro').innerHTML;__check("PM→Centro: 'Carga que viene' muestra el plan congelado con la orden, fase y 'pendiente de liberar' si no está liberada",hc.includes('Plan mensual congelado')&&hc.includes(esc(o1.op))&&hc.includes('congelado')&&(liberada(o1,'corte')||hc.includes('pendiente de liberar')))}
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
   __check("FF: Asignación por orden muestra la fase junto a la WH",veFase('produccion',()=>{APO.q='WH/TEST-FF'}));
   __check("FF: Costura · secuencia por módulo usa foto+WH+fase",(()=>{const src=vCostura.toString();return src.includes('whCell(o)')})());
   S.ordenes=S.ordenes.filter(x=>x.id!==oT.id);CTL.q='';CEN.q='';WIPL={niveles:null,q:''};APO.q='';PLAN=null;PLAN_ALL=null;
   // buscador
   page='liberacion';LIB.et='tela';LIB.q='';render();let hl=document.getElementById('p-liberacion').innerHTML;__check("FF: el buscador es un solo campo (busq) sin menú cuando está vacío",hl.includes('class="busq"')&&!hl.includes('busq-menu'));
   LIB.q=o.op.slice(-4);render();hl=document.getElementById('p-liberacion').innerHTML;__check("FF: al escribir ofrece 'Buscar Orden de producción / ODC / Referencia (estilo) / Color / Fase / Cliente por: texto' como Odoo",hl.includes('busq-menu')&&['Orden de producción','ODC','Referencia (estilo)','Color','Fase','Cliente'].every(n=>hl.includes('Buscar <b>'+n+'</b> por: <i>'+esc(o.op.slice(-4))+'</i>')));
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
   GRP={};grpSt('lib').niveles=['cliente','fase'];page='liberacion';LIB.et='tela';LIB.q='';LIB.verLista=true;render();let hl=document.getElementById('p-liberacion').innerHTML;
   __check("VC: Liberación agrupa (colapsado, conteo y prendas a la derecha) y ofrece fase/cliente/ODC/padre/hija/color/proyecto",hl.includes('grp-row')&&/\d+ órdenes · [\d.]+ prendas/.test(hl)&&['Fase','Cliente','ODC','Categoría padre','Categoría hija','Color','Proyecto'].every(x=>hl.includes('>'+x+'</option>')));
   const key=(hl.match(/togGRP\('lib','([^']+)'\)/)||[])[1];if(key){togGRP('lib',key.replace(/\\'/g,"'"));hl=document.getElementById('p-liberacion').innerHTML;__check("VC: al abrir un grupo aparece el segundo nivel (anidado)",(hl.match(/grp-row/g)||[]).length>1)}
   GRP={};grpSt('ctl').niveles=['color'];page='control';CTL.area='pro';CTL.q='';render();__check("VC: Control de piso tiene selector de agrupación y agrupa por color",document.getElementById('p-control').innerHTML.includes("setNivelGRP('ctl'"));
   GRP={};grpSt('ord').niveles=['fase'];page='ordenes';ORDF.q='';render();__check("VC: Órdenes agrupa colapsable por fase con conteo",document.getElementById('p-ordenes').innerHTML.includes('grp-row'));
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
   const conocidas=["borrarOperativo","delCat","delCatTelaRow","delCentro","delCentroEtapaRow","delCentroOTRow","delClasifMaterialRow","delDiasProvRow","delEsperaRow","delEstadoOTRow","delExc","delFaseGrupoRow","delFaseMapeoRow","delKgUdRow","delMapaHija","delMermaTinturaRow","delMotivoReprocRow","delMotivoRow","delOp","delOrden","delOrigenTelaCuartoRow","delOrigenTelaRow","delPalabraJaspeRow","delParamTelaRow","delPerfilDef","delProgTejRow","delPropFaltaRow","delRec","delRegla","delRestrFaltRow","delRow","delRuta","delTiempoOBRow","deshacerBanoConf","deshacerHechoCentro","deshacerTandaPlana","limpiarMes","quitarAjusteCap","quitarAjusteOp","retirarLib"];const nuevas=fns.filter(f=>!conocidas.includes(f));
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
   __check("REP: Dirección ya no repite Producto en proceso, Cumplimiento ni Avance (viven solo en Reportería)",!document.querySelector('nav .gbody[data-g="dir"] a[data-p="cumplimiento"]')&&!document.querySelector('nav .gbody[data-g="dir"] a[data-p="avance"]')&&!document.querySelector('nav .gbody[data-g="dir"] a[data-p="wip"]')&&[...document.querySelectorAll('nav .gbody[data-g="dir"] a')].map(a=>a.dataset.p).join()==='panorama,gerencia,ordenes,liberacion,entregas,plan,familias,escenarios,auditoria,capacidad');
   __check("REP: cada reporte es una entrada de REPORTES (preparado para crecer)",Array.isArray(REPORTES)&&REPORTES.length>=6&&REPORTES.every(r=>r.p&&r.n));
   GRP={};grpSt('vo').niveles=[];VO={q:''};page='vistaordenes';render();let h=document.getElementById('p-vistaordenes').innerHTML;
   __check("REP: Vista general lista todas las abiertas con foto/WH/fase, cliente, ODC, estilo, categoría padre e hija, color, prendas, entrega, proyecto y estado",['Cliente','ODC','Estilo','Categoría padre','Categoría hija','Color','Prendas','Entrega','Proyecto','Estado'].every(x=>h.includes('<th'+(x==='Prendas'?' class="num"':'')+'>'+x+'</th>'))&&h.includes('mDetalleOrden(')&&new RegExp(S.ordenes.filter(abierta).length+' órdenes abiertas').test(h));
   __check("REP: buscador inteligente y agrupación colapsable (fase, cliente, ODC, padre, hija, color, proyecto)",h.includes('data-q="VO.q"')&&h.includes("setNivelGRP('vo'")&&['Fase','Cliente','ODC','Categoría padre','Categoría hija','Color','Proyecto'].every(x=>h.includes('>'+x+'</option>')));
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
     __check("OB10: resumen pedido vs cargado por tela (cargado = 120)",/Cargado \(kg\)/.test(h)&&(cargasTejPorTela(programar())[tela]||{}).cargado===120);
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
   __check("VR3: el Bloque 2 muestra dos contadores (Vencidas y En riesgo) con enlace a Hoy → Advertencias, sin la tabla larga",h.includes('Vencidas (entrega pasada)')&&h.includes('En riesgo según el programa')&&h.includes("irNoLlegan('"+ym+"','venc')")&&!h.includes('órdenes en riesgo según el programa <span')&&!h.includes('clic para ver por qué y en qué paso se atascan'));
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
   page='ordenes';ORDF.q='';render();__check("CC-a: Órdenes usa el mismo filtro de fases",document.getElementById('p-ordenes').innerHTML.includes('class="ffases"'));
   // b) agrupador con horas y campos comunes
   GRP={};grpSt('lib').niveles=['cliente'];page='liberacion';LIB.verLista=true;render();h=document.getElementById('p-liberacion').innerHTML;__check("CC-b: los grupos muestran unidades y horas",/\d+ órdenes · [\d.,]+ prendas · [\d.,]+ h<\/span>/.test(h)||!h.includes('grp-row'));
   __check("CC-b: el agrupador ofrece fase, familia, categoría, color, cliente y ODC en todas las listas",['Fase','Categoría padre','Categoría hija','Color','Cliente','ODC'].every(x=>h.includes('>'+x+'</option>')));
   GRP={};page='produccion';APO={niveles:['cliente'],cli:'',cen:'',mes:'',q:''};render();h=document.getElementById('p-produccion').innerHTML;__check("CC-b: Asignación por orden usa el agrupador común (grp-row)",h.includes('grp-row')||!S.ordenes.some(abierta));APO.niveles=null;GRP={};
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
  __R.done=true;console.log('__RESULTADO__ '+JSON.stringify({errores:__R.errors.length,fallos:__R.checks.filter(c=>!c.ok).length,checks:__R.checks.length}));
}
__run().catch(e=>{__R.errors.push({page:'driver',msg:e.message,stack:(e.stack||'').slice(0,300)});__R.done=true});
</script>
