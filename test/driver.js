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
  __check('bordado: con velocidad 20 puntadas/min, minPrenda(bordado,900)=45 min (conversión del motor, sin tocarlo)',Math.abs(minPrenda('bordado',900)-45)<0.001,minPrenda('bordado',900));
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
  const planT=planTarea(tareaRows,'Tarea__project_task__95_.xlsx');
  __check('planTarea reconoce columnas',!!planT);
  __check('planTarea: 3.733 cabeceras y 61.268 líneas sin orden',planT.cabeceras===3733&&planT.lineasComp===61268,planT.cabeceras+' / '+planT.lineasComp);
  __check('planTarea: 2 cancel excluidas, 4 sin fecha en bandeja',planT.excluidas.cancel.length===2&&planT.sinFecha.length===4,planT.excluidas.cancel.length+' / '+planT.sinFecha.length);
  __check('planTarea: ninguna fase del archivo queda sin calzar (40 valores, todos en la tabla)',Object.keys(planT.fasesNoCalzan).length===0,JSON.stringify(planT.fasesNoCalzan));
  __check('planTarea: 4 filas de la tabla sin órdenes en el archivo (0Diseño, 0Recetas Insumos, 1Calidad Tintoreria, 6 CD SERIGRAFIA)',planT.fasesTablaSinUso.length===4,planT.fasesTablaSinUso.join(', '));
  __check('planTarea: duplicados = 3 números / 7 filas, no fusionados',planT.duplicados.length===7&&new Set(planT.duplicados.map(d=>d.op)).size===3,planT.duplicados.length);
  __check('planTarea: segundos niveles no reconocidos = MERCADERIAS, GASTOS MAQUILA ESTAMPADO y vacío (nivel1 All)',Object.keys(planT.nivel2NoRec).length===3,JSON.stringify(planT.nivel2NoRec));
  __check('planTarea: ningún tercer nivel de MP fuera de la tabla',Object.keys(planT.nivel3NoRec).length===0,JSON.stringify(planT.nivel3NoRec));
  __check('planTarea: excepción 4to nivel — hay telas NUEVOS TEMPO/SERVICIO TINTURADO clasificadas EXTERNA TEÑIDA',planT.ordenes.some(o=>(o.materiales||[]).some(m=>m.n3==='NUEVOS TEMPO'&&m.n4==='SERVICIO TINTURADO'&&m.origen==='EXTERNA TEÑIDA')));
  __check('planTarea: las done quedan como historia con ruta pendiente vacía',planT.ordenes.filter(o=>o.historia).every(o=>o.ruta.length===0&&o.estado==='cerrada'));
  __check('planTarea: las vencidas abiertas conservan su fecha original (no se inventa)',planT.ordenes.filter(o=>o.vencida).every(o=>o.fecha<planT.hoy&&ESTADOS_OP_ABIERTOS.includes(o.estadoOP)));
  __check('planTarea: sin técnica ni puntadas no hay estampado ni bordado en la ruta completa',planT.ordenes.filter(o=>!o.tecnicaTxt&&!(o.puntadas>0)).every(o=>!o.rutaCompleta.some(p=>p.centro==='estampado'||p.centro==='bordado')));
  __check('planTarea: con puntadas>0 el paso bordado lleva las puntadas por prenda (unidad del motor)',planT.ordenes.filter(o=>o.puntadas>0&&o.cat).every(o=>{const b=o.rutaCompleta.find(p=>p.centro==='bordado');return b&&b.t===o.puntadas}));
  __check('planTarea: origen PROPIA → tej+tin; EXTERNA TEÑIDA → solo proveedor; SIN CLASIFICAR → sin textil',planT.ordenes.filter(o=>o.origenTela==='PROPIA').every(o=>o.rutaCompleta[0].centro==='tej'&&o.rutaCompleta[1].centro==='tin')&&planT.ordenes.filter(o=>o.origenTela==='EXTERNA TEÑIDA').every(o=>o.rutaCompleta[0].centro==='proveedor'&&!o.rutaCompleta.some(p=>p.centro==='tin'))&&planT.ordenes.filter(o=>o.origenTela==='SIN CLASIFICAR').every(o=>!o.rutaCompleta.some(p=>['tej','tin','proveedor'].includes(p.centro))));
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
  __check('aplicarTarea: órdenes cargadas = cabeceras − cancel − sin fecha − fuera de rango',S.ordenes.length===planT.cabeceras-planT.excluidas.cancel.length-planT.sinFecha.length-planT.excluidas.fueraRango.length,S.ordenes.length);
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
   delExc('2026-09-05','pro');const b3=S.bitacora[S.bitacora.length-1];__check("calendario: quitar una marca queda en bitácora",/quitada la marca/.test(b3.t),b3.t);
   if(prev!=null)setCal('pro',prev);
   page='config';CONF.tab='cal';render();const hc=document.getElementById('p-config').innerHTML;__check("calendario: Configuración dice que manda el calendario del mes y que la base es el punto de partida",hc.includes('Manda el calendario del mes')&&hc.includes('solo el punto de partida'));
   CONF.tab='recursos';render();const hr=document.getElementById('p-config').innerHTML;__check("recursos: la nota de días dice quién manda",hr.includes('Manda el calendario del mes')&&hr.includes('punto de partida'));
   page='plan';render();const hp=document.getElementById('p-plan').innerHTML;__check("planificar el mes: dice que este calendario manda",hp.includes('este calendario manda')&&hp.includes('punto de partida'));
   __check("versión: la app muestra su versión cargada",/^v \d{4}-\d{2}-\d{2}/.test(APP_BUILD?'v '+APP_BUILD:''));
   __check("calendario/versión sin errores",__R.errors.length===antes);page='ordenes';render();}
  /* perfiles por catálogo, carga que viene, ruta por centro, advertencias, balanceo y objetivo */
  {const antes=__R.errors.length;const adminP=PERFIL;
   __check("perfiles: catálogo sembrado con los 7 perfiles + consulta",perfilesDef().length===8&&['admin','planificacion','tintoreria','liberacion','corte','modulos','terminado'].every(id=>perfilesDef().some(x=>x.id===id)));
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
   // advertencias forzadas: compromiso ayer → cualquier estimada queda fuera
   const oA=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro==='corte')&&liberada(o,'corte'));
   if(oA){const nAv=(S.params.advertencias||[]).length;const fc=oA.fechaCompromiso;oA.fechaCompromiso=dsum(hoy(),-1);setProgCen(oA.id,'corte','desde',dsum(hoy(),10));
     __check("advertencias: reprogramar fuera de la fecha meta genera aviso con quién, antes y después",(S.params.advertencias||[]).length===nAv+1&&(S.params.advertencias||[]).slice(-1)[0].op===oA.op&&!!(S.params.advertencias||[]).slice(-1)[0].u,JSON.stringify((S.params.advertencias||[]).slice(-1)[0]));
     page='panorama';render();__check("advertencias: aparecen en Hoy para planificación",document.getElementById('p-panorama').innerHTML.includes('Advertencias de fecha')&&document.getElementById('p-panorama').innerHTML.includes(oA.op));
     atenderAviso((S.params.advertencias||[]).slice(-1)[0].id);__check("advertencias: se marcan atendidas",(S.params.advertencias||[]).slice(-1)[0].atendida===true);setProgCen(oA.id,'corte',null);oA.fechaCompromiso=fc;}
   // balanceo desde lo programado + objetivo con registro
   {const x=programar().pro.find(x=>x.centro==='modulos'&&x.rec);if(x){BAL.rec=x.rec;BAL.mes=x.dia.slice(0,7)}else{BAL.mes=null}}page='balanceo';BAL.grupo=null;render();let hb=document.getElementById('p-balanceo').innerHTML;
   __check("balanceo: lista lo programado en el módulo por hoja de operaciones",__R.errors.length===antes&&hb.includes('Órdenes programadas en')&&hb.includes('Objetivo de prendas por hora'));
   const mod=R(BAL.rec);const btn=document.querySelector('#p-balanceo button[onclick^="BAL.grupo="]');if(btn){btn.click();hb=document.getElementById('p-balanceo').innerHTML;
     __check("balanceo: se muestra una vez para las órdenes de la misma hoja, por sección, con orden provisional y máquinas",hb.includes('este balanceo')&&hb.includes('provisional')&&hb.includes('Operaciones por sección')&&hb.includes('Puestos')&&hb.includes('Máquinas'));
     __check("balanceo: usa las personas del recurso",hb.includes('Personas del módulo (recurso)')&&hb.includes('>'+mod.pers+'<'));}
   const nb2=S.bitacora.length;setObjetivoHora(mod.id,50);__check("objetivo: queda registrado quién, cuándo y antes",objetivoHora(mod).v===50&&!!objetivoHora(mod).u&&mod.objetivoHist.length===1&&S.bitacora.length===nb2+1);
   setObjetivoHora(mod.id,40);__check("objetivo: el historial guarda el valor anterior",mod.objetivoHist[1].antes===50&&objetivoHora(mod).antes===50);
   hb=document.getElementById('p-balanceo').innerHTML;__check("balanceo: objetivo y ritmo teórico lado a lado",!btn||(hb.includes('Objetivo prendas/hora (supervisora)')&&hb.includes('Ritmo teórico')));
   setObjetivoHora(mod.id,'');page='ordenes';render();__check("perfiles/centro/balanceo sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
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
   __check('minPrenda(bordado) sin velocidad → 0 minutos',minPrenda('bordado',5000)===0);
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
  __check('máquina apta por rol de color (claro→DANITECH 1, oscuro→DANITECH 2)',conf.every(b=>{const bc=(S.banos_conf||[]).find(x=>x.id===b.id);if(bc&&bc.recFijo)return true;const r=R(b.rec);const claro=profColor(C(b.color))==='claro';return !r.rolColor||r.rolColor==='ambos'||(r.rolColor==='claro')===claro}),conf.map(b=>b.colorN+'→'+nRec(b.rec)).join('; '));
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
  __R.done=true;console.log('__RESULTADO__ '+JSON.stringify({errores:__R.errors.length,fallos:__R.checks.filter(c=>!c.ok).length,checks:__R.checks.length}));
}
__run().catch(e=>{__R.errors.push({page:'driver',msg:e.message,stack:(e.stack||'').slice(0,300)});__R.done=true});
</script>
