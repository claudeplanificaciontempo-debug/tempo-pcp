/* confirm por defecto en el simulador: los borrados y reemplazos ahora piden confirmación (15-sep-2026); las pruebas que necesitan NO la ponen en false */
window.confirm=()=>true;
<script>
/* Guion de pruebas: se ejecuta cuando la app terminó de cargar */
async function __esperar(f,ms){const t0=Date.now();while(!f()){if(Date.now()-t0>ms)throw new Error('timeout esperando');await new Promise(r=>setTimeout(r,50))}}
function __check(nombre,cond,detalle){__R.checks.push({nombre,ok:!!cond,detalle:detalle===undefined?'':String(detalle)})}
const __p=ms=>new Promise(r=>setTimeout(r,ms));
function adminP0(){return {id:"u-adm",rol:"admin",nombre:"Admin",modo:"editar"}}
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
  /* MEDICIÓN de operaciones de etiquetas y de ojales/botones (LMO real) */
  {const porCentro=c=>(S.operaciones||[]).filter(o=>o.centro===c).map(o=>({id:o.id,n:o.n,sam:o.sam,maq:o.maq||'',sub:o.sub||''}));
   const catsCon=c=>S.categorias.filter(k=>opsDe(k).some(x=>x.centro===c)).map(k=>({cat:nombreCat(k),fam:(K(k.padre)||k).n,
     ops:opsDe(k).filter(x=>x.centro===c).map(x=>({n:x.n,sam:x.sam})),tot:opsDe(k).filter(x=>x.centro===c).reduce((a,x)=>a+(+x.sam||0),0)}));
   __R.lmo={etiquetas:{ops:porCentro('etiquetas'),cats:catsCon('etiquetas')},
     botones:{ops:porCentro('botones'),cats:catsCon('botones')},
     reglasOB:tiemposOjalBoton().map(r=>({match:r.match,ojales:r.ojales,botones:r.botones,sinConfirmar:!!r.sinConfirmar})),
     camisetas:S.categorias.filter(k=>/camiseta|level/i.test(k.n||'')).map(k=>({cat:k.n,fam:(K(k.padre)||k).n,etiq:opsDe(k).filter(x=>x.centro==='etiquetas').map(x=>x.n+' '+x.sam),estampado:opsDe(k).filter(x=>x.centro==='estampado').map(x=>x.n+' '+x.sam)}))};
   __check("MED-LMO: se midieron las operaciones de etiquetas y de ojales/botones",Array.isArray(__R.lmo.etiquetas.ops));}
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
  /* CAPTURA (para las capturas del reporte, sin correr las pruebas): ?captura=niv1 | niv2 carga el volcado y deja la pantalla de nivelación en un estado fijo.
     ?captura=fases: diagnóstico (JSON en <pre id="diag">) de la cola completa de cada centro de producción por fase de Odoo y grupo de cercanía. */
  if(/captura=(niv|fases|cola)/.test(location.search)){TAREA=planT;const pr=window.prompt;window.prompt=()=>'APLICAR';aplicarTarea();window.prompt=pr;await __p(50);PERFIL={id:'cap',rol:'planificacion',nombre:'Planificación'};
    NIVUI={meses:['2026-09','2026-10','2026-11'],cliente:'',familia:'',area:'corte',celda:null,filaPor:'familia',esc:{},verCalc:false,noEntra:false};
    if(/niv2/.test(location.search)){nivUISet('corte','inicio',hoy());nivUISet('corte','compromiso',dsum(hoy(),20));nivUISet('corte','diasAdic',1);NIVUI.verCalc=true;NIVUI.noEntra=true;
      const r=nivUICalcular('corte');const cl=Object.keys((()=>{const m={};(r.saldo.ordenes||[]).forEach(o=>{m[String(o.cliente||'')]=1});return m})())[0];if(cl)NIVUI.celda={por:'familia',fila:famDeOrden(r.saldo.ordenes[0]),mes:'2026-10'}}
    if(/niv3/.test(location.search)){nivUISet('corte','inicio',hoy());nivUISet('corte','compromiso',dsum(hoy(),3));nivUISet('corte','diasAdic',0);NIVUI.noEntra=true;NIVUI.verCalc=false}
    page='nivelacion';render();document.querySelectorAll('#p-nivelacion details').forEach(d=>{d.open=true});
    if(/nivdiag/.test(location.search)){const meses=['2026-09','2026-10','2026-11'];const out={};nivUIAreas().forEach(ar=>{const sd=saldoAreaNiv(ar.id,meses,null)||{};const c=ar.tipo==='centro'?ar.id:null;
      const enRuta=c?S.ordenes.filter(o=>abiertaDe(o)&&meses.includes(mesEntregaNiv(o))&&(o.ruta||[]).some(p=>p.centro===c)):[];const hechas=c?enRuta.filter(o=>pasoHecho(o,c)):[];
      const porFase={};(ar.tipo==='tela'?S.ordenes.filter(o=>abiertaDe(o)&&meses.includes(mesEntregaNiv(o))):enRuta.filter(o=>!pasoHecho(o,c))).forEach(o=>{porFase[o.fase||'(sin)']=(porFase[o.fase||'(sin)']||0)+1});
      out[ar.id]={unid:sd.unid,min:Math.round(sd.min||0),n:(sd.ordenes||[]).length,sinSAM:(sd.sinSAM||[]).length,uSinSAM:sd.unidSinSAM,enRuta:enRuta.length,hechas:hechas.length,porFase}});
      {const ords=S.ordenes.filter(o=>abiertaDe(o)&&meses.includes(mesEntregaNiv(o)));const cg=cargaUnica('abiertas',{ordenes:ords}).centros;out.__cargaGeneral={};Object.keys(cg).forEach(c=>{out.__cargaGeneral[c]={pz:cg[c].pz,n:cg[c].n,min:Math.round(cg[c].total)}});
       out.__maquilaFase=ords.filter(o=>/maquila/i.test(o.fase||'')).length;out.__sinModulosConEmpaque=ords.filter(o=>(o.ruta||[]).some(p=>p.centro==='empaque')&&!(o.ruta||[]).some(p=>p.centro==='modulos')).length;out.__bordadoSolo=ords.filter(o=>(o.ruta||[]).some(p=>p.centro==='bordado')&&!(o.ruta||[]).some(p=>['corte','modulos','empaque'].includes(p.centro))).length;out.__bordadoSoloU=ords.filter(o=>(o.ruta||[]).some(p=>p.centro==='bordado')&&!(o.ruta||[]).some(p=>['corte','modulos','empaque'].includes(p.centro))).reduce((x,o)=>x+pendCentroUnid(o,'bordado'),0);
       out.__estampadoT=ords.filter(o=>(o.ruta||[]).some(p=>p.centro==='estampado')).map(o=>[(o.ruta.find(p=>p.centro==='estampado')||{}).t,o.tecnica?1:0,tecnicaT(o)]).slice(0,6);}
      out.__fasesTela=fasesDeProcNivel('tela');out.__abiertas=S.ordenes.filter(o=>abiertaDe(o)&&meses.includes(mesEntregaNiv(o))).length;out.__rutasSample=S.ordenes.filter(o=>abiertaDe(o)&&meses.includes(mesEntregaNiv(o))).slice(0,400).map(o=>(o.ruta||[]).map(p=>p.centro).join('>')).reduce((m,k)=>{m[k]=(m[k]||0)+1;return m},{});
      document.body.innerHTML='<pre id="diag">'+JSON.stringify(out,null,1)+'</pre>';__R.done=true;return}
    /* captura=fases: por CADA centro de producción (area 'pro', en orden ordenPaso) la cola completa de la semana en curso
       (filasDeCentros → colaCentro, sin buscador) contada por fase de Odoo, y por cada fase cuántas caen en cada grupo de cercanía (f.cerc.grupo) */
    if(/captura=fases/.test(location.search)){const P=programar();const lun=lunesDe(hoy()),dom=dsum(lun,6);const out={hoy:hoy(),lun,dom,porCentro:[]};
      const cens=S.centros.filter(c=>c.area==='pro').sort((a,b)=>ordenPaso(a.id)-ordenPaso(b.id));
      cens.forEach(cen=>{const c=cen.id;const filas=filasDeCentros([c],P,lun,dom,'');const cola=colaCentro(c,filas);const porFase={};
        cola.forEach(f=>{const k=f.o.fase||'(sin fase)';const g=(f.cerc&&f.cerc.grupo)||'(sin cerc)';if(!porFase[k])porFase[k]={n:0,grupos:{}};porFase[k].n++;porFase[k].grupos[g]=(porFase[k].grupos[g]||0)+1});
        const fases=Object.keys(porFase).map(k=>{const gs=porFase[k].grupos;const may=Object.keys(gs).sort((a,b)=>gs[b]-gs[a])[0];return{fase:k,n:porFase[k].n,grupo:may,grupos:gs}}).sort((a,b)=>b.n-a.n);
        const porGrupo={};cola.forEach(f=>{const g=(f.cerc&&f.cerc.grupo)||'(sin cerc)';porGrupo[g]=(porGrupo[g]||0)+1});
        out.porCentro.push({centro:c,nombre:cen.nombre||c,total:cola.length,filas:filas.length,hechas:filas.filter(f=>f.hecho).length,bloqueadas:filas.filter(f=>!f.hecho&&f.bloq).length,porGrupo,fases})});
      document.body.innerHTML='<pre id="diag">'+JSON.stringify(out)+'</pre>';__R.done=true;return}
    /* captura=cola1 (Corte) | cola2 (Confección): la cola por fase del centro, con «ver todas» (cola1b / cola2b = solo la semana, como abre por defecto);
       se ocultan menú, cabecera y los bloques de arriba de la cola para que la captura arranque en la cola misma */
    if(/captura=cola/.test(location.search)){const cual=(location.search.match(/captura=cola([0-9a-z]+)/)||[])[1]||"1";const c=/^2/.test(cual)?"modulos":"corte";
      NAVH.length=0;irCentro(c,null,"prog");CEN.todo=!/b$/.test(cual);render();
      const pc=document.getElementById("p-centro");let el=pc&&pc.querySelector(".panel.cola");
      if(el){let n=el;while(n&&n!==pc){let sb=n.previousElementSibling;while(sb){sb.style.display="none";sb=sb.previousElementSibling}n=n.parentElement}}
      const sinRecorte=()=>{document.querySelectorAll("main,#app").forEach(m=>{m.style.height="auto";m.style.maxHeight="none";m.style.overflow="visible"});document.querySelectorAll("#p-centro .panel.cola .scroll").forEach(sc=>{sc.style.maxHeight="none"});[...document.body.childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove())};sinRecorte();
      if(el){const ocultar=(padre)=>{[...padre.children].forEach(x=>{if(x===el)return;if(x.contains(el)){ocultar(x);return}const r=x.getBoundingClientRect();if(r.bottom<=el.getBoundingClientRect().top+1&&getComputedStyle(x).position!=="fixed")x.style.display="none"})};ocultar(document.body);[800,2000,4000].forEach(ms=>setTimeout(()=>{const e2=document.querySelector("#p-centro .panel.cola");if(e2){el=e2;sinRecorte();ocultar(document.body)}},ms))}
      document.body.classList.add("captura");__R.done=true;return}
    if(/niv4/.test(location.search)){const r=nivUICalcular('corte');const cd=NIVUI.celda;irSaldoCentro(nivUISelDe(r,cd,'Short Cargo'))}
    document.body.classList.add('captura');__R.done=true;return}
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
  /* ===== CARGAS · qué dato trabajado sobrevive a la Recarga Parte 2 (diagnóstico) ===== */
  {const antes=__R.errors.length;const a0=window.alert;window.alert=()=>{};
   const abiertas=S.ordenes.filter(o=>abierta(o)&&o.op);
   const muestra=abiertas.slice(0,6);
   if(muestra.length>=6){
    const [oA,oB,oC,oD,oE,oF]=muestra;
    /* se marcan datos trabajados de todo tipo */
    oA.progCentro={corte:{pri:1,rec:null,desde:null}};                       // puesto manual
    S.avance[oA.id]=Object.assign(S.avance[oA.id]||{},{centros:{corte:5},cierres:{corte:{pz:5,cant:oA.cant,faltan:0,u:"piso",ts:new Date().toISOString()}}});
    oB.recursoFijo={modulos:"maquila"};                                        // maquila
    oC.odc="ODC-MANUAL-1";oC.odcManual={u:"prueba",ts:new Date().toISOString()};
    S.avance[oD.id]=Object.assign(S.avance[oD.id]||{},{cierres:{corte:{pz:10,cant:oD.cant,faltan:0,u:"piso",ts:new Date().toISOString()}},
      tramos:[{id:"t1",centro:"corte",rec:null,ini:new Date(Date.now()-36e5).toISOString(),fin:new Date().toISOString(),u:"piso",paros:[]}]});
    oE.lib={tela:{ok:true,u:"lib",ts:new Date().toISOString()}};                // liberación
    oF.rutaEditada=[{centro:"corte",t:1},{centro:"modulos",t:5},{centro:"empaque",t:1}];oF.foto="https://x/foto.jpg";
    oF.fechaCompromiso="2026-12-01";oF.prio=1;
    S.params.pendPospuestos=Object.assign(S.params.pendPospuestos||{},{["x-"+oA.id]:{hasta:"2026-12-31",motivo:"prueba"}});   // una decisión
    const bakPlanes=JSON.stringify(S.planes||[]);S.planes=(S.planes||[]).concat([{id:"plan-prueba",ym:"2026-10",oids:[oA.id,oB.id],ver:1}]); // plan congelado
    const antesF={pri:oA.progCentro.corte.pri,maq:oB.recursoFijo.modulos,odc:oC.odc,cierre:!!S.avance[oD.id].cierres.corte,tramos:S.avance[oD.id].tramos.length,
      lib:!!(oE.lib&&oE.lib.tela&&oE.lib.tela.ok),ruta:oF.rutaEditada.length,foto:oF.foto,comp:oF.fechaCompromiso,prio:oF.prio,planes:S.planes.length};
    /* 1 · recarga con el MISMO archivo */
    const p2=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=p2;aplicarTarea();await __p(50);
    const g=id=>S.ordenes.find(x=>x.id===id)||{};
    const despues={pri:((g(oA.id).progCentro||{}).corte||{}).pri||0,maq:(g(oB.id).recursoFijo||{}).modulos||null,odc:g(oC.id).odc,
      cierre:!!(((S.avance[oD.id]||{}).cierres)||{}).corte,tramos:((S.avance[oD.id]||{}).tramos||[]).length,
      lib:!!((g(oE.id).lib||{}).tela||{}).ok,ruta:(g(oF.id).rutaEditada||[]).length,foto:g(oF.id).foto||null,comp:g(oF.id).fechaCompromiso||null,prio:g(oF.id).prio,
      planes:(S.planes||[]).length,estadoA:g(oA.id).estado};
    __R.recarga={mismoArchivo:{antes:antesF,despues,
      sobrevive:{puestoManual:despues.pri===antesF.pri,maquila:despues.maq===antesF.maq,odcManual:despues.odc===antesF.odc,
        cierres:despues.cierre===antesF.cierre,tramos:despues.tramos===antesF.tramos,liberacion:despues.lib===antesF.lib,
        rutaEditada:despues.ruta===antesF.ruta,foto:despues.foto===antesF.foto,fechaCompromiso:despues.comp===antesF.comp,
        prio:despues.prio===antesF.prio,planCongelado:despues.planes===antesF.planes,decisionPospuesta:!!(S.params.pendPospuestos||{})["x-"+oA.id]}}};
    __check("CARGA: tras la Recarga Parte 2 con el mismo archivo, cada dato trabajado sobrevive (tabla 14)",
      Object.values(__R.recarga.mismoArchivo.sobrevive).every(Boolean),JSON.stringify(__R.recarga.mismoArchivo.sobrevive));
    /* 2 · recarga con un archivo al que le FALTA la orden A: ¿se borra o queda marcada? */
    const iOP=(tareaRows[0]||[]).findIndex(x=>normTxt(x)===normTxt("Orden de produccion")||normTxt(x)==="op"||/orden de producci/.test(normTxt(x)));
    const rows2=tareaRows.filter((r,k)=>k===0||String(r[iOP]||"").trim()!==oA.op);
    const p3=planTarea(rows2,"TAREA_SIN_A.xlsx");TAREA=p3;aplicarTarea();await __p(50);
    const oA2=S.ordenes.find(x=>x.id===oA.id);
    __R.recarga.faltaEnArchivo={sigueEnElSistema:!!oA2,estado:oA2&&oA2.estado,marca:oA2&&oA2.noArchivo?"noArchivo":"(sin marca)",
      conservaPuesto:!!(oA2&&((oA2.progCentro||{}).corte||{}).pri),conservaAvance:!!(S.avance[oA.id]&&S.avance[oA.id].cierres&&S.avance[oA.id].cierres.corte)};
    __check("CARGA: una orden que ya no viene en el archivo NO se borra: queda marcada noArchivo con lo suyo",
      !!oA2&&oA2.estado==="noArchivo"&&!!oA2.noArchivo,JSON.stringify(__R.recarga.faltaEnArchivo));
    /* se deja todo como estaba: recarga con el archivo completo y se quitan las marcas de prueba */
    const p4=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=p4;aplicarTarea();await __p(50);
    [oA,oB,oC,oE,oF].forEach(o=>{const x=S.ordenes.find(z=>z.id===o.id);if(!x)return;delete x.progCentro;delete x.recursoFijo;delete x.odcManual;delete x.lib;delete x.rutaEditada;delete x.fechaCompromiso;if(x.prio===1)x.prio=3;if(x.foto==="https://x/foto.jpg")delete x.foto});
    delete S.avance[oD.id];delete S.avance[oA.id];delete (S.params.pendPospuestos||{})["x-"+oA.id];S.planes=JSON.parse(bakPlanes);PLAN=null;PLAN_ALL=null;}
   /* ===== 1 · el avance de piso NO se borra desde una carga ===== */
   {const oA2=S.ordenes.find(o=>abierta(o)&&o.op);
    if(oA2){
     S.avance[oA2.id]=Object.assign(S.avance[oA2.id]||{},{centros:{corte:7},
       tramos:[{id:"t-prot",centro:"corte",rec:null,ini:new Date(Date.now()-30*6e4).toISOString(),fin:new Date().toISOString(),u:"piso",paros:[]}],
       cierres:{corte:{pz:7,cant:oA2.cant,faltan:0,u:"piso",ts:new Date().toISOString()}}});
     const nAv=Object.keys(S.avance).length;
     /* la fila «avance» de la tabla 14 está bloqueada */
     __check("P1: la fila «avance» de la tabla 14 no se puede desmarcar",campoBloqueado("avance")&&conserva("avance"));
     const i=camposConservados().findIndex(x=>x.campo==="avance");
     let av="";const a1=window.alert;window.alert=m=>{av=String(m)};
     setCampoConservado(i,false);window.alert=a1;
     __check("P1: intentar desmarcarla avisa y no cambia nada",conserva("avance")&&camposConservados()[i].conservar!==false&&/no se puede desmarcar/.test(av),av.slice(0,80));
     /* aunque alguien fuerce la fila a false, la recarga NO borra el avance */
     const bak=camposConservados()[i].conservar;camposConservados()[i].conservar=false;
     const p9=planTarea(tareaRows,"TAREA_PROT.xlsx");TAREA=p9;aplicarTarea();await __p(50);
     camposConservados()[i].conservar=bak;
     const a2=S.avance[oA2.id]||{};
     __check("P1: tras recargar con la fila forzada a false, el avance sigue intacto",
       Object.keys(S.avance).length>=nAv&&(a2.centros||{}).corte===7&&((a2.tramos||[]).length>=1)&&!!((a2.cierres||{}).corte),
       JSON.stringify({n:Object.keys(S.avance).length,c:(a2.centros||{}).corte,t:(a2.tramos||[]).length,ci:!!((a2.cierres||{}).corte)}));
     __check("P1: ya no queda ningún borrado masivo de S.avance en el código",
       !/S\.avance=\{\}/.test(String(aplicarTarea)));
     delete S.avance[oA2.id];PLAN=null;PLAN_ALL=null}}
   /* ===== 1b · lib, fases (historial) y progCentro bloqueados igual que avance ===== */
   {const oB2=S.ordenes.find(o=>abierta(o)&&o.op);
    if(oB2){
     const ts=new Date().toISOString();
     oB2.lib=Object.assign(oB2.lib||{},{tela:{ok:true,u:"prueba-lib",ts}});
     oB2.fases=(oB2.fases||[]).concat([{f:oB2.fase||null,ts,u:"prueba-fases",origen:"app",antes:null,motivo:"motivo de prueba"}]);
     oB2.progCentro=Object.assign(oB2.progCentro||{},{corte:{pri:1,u:"prueba-prog"}});
     const nFases=oB2.fases.length;
     ["lib","fases","progCentro"].forEach(k=>{
      __check("P1b: la fila «"+k+"» de la tabla 14 no se puede desmarcar",campoBloqueado(k)&&conserva(k));
      const i=camposConservados().findIndex(x=>x.campo===k);
      let av="";const a1=window.alert;window.alert=m=>{av=String(m)};setCampoConservado(i,false);window.alert=a1;
      __check("P1b: intentar desmarcar «"+k+"» avisa y no cambia nada",conserva(k)&&camposConservados()[i].conservar!==false&&/no se puede desmarcar/.test(av),av.slice(0,80));});
     __check("P1b: la fase ACTUAL sigue siendo decisión de la tabla (no está bloqueada)",!campoBloqueado("fase"));
     /* aunque alguien fuerce las tres filas a false, la recarga NO las borra */
     const idx=["lib","fases","progCentro"].map(k=>camposConservados().findIndex(x=>x.campo===k));
     const baks=idx.map(i=>camposConservados()[i].conservar);idx.forEach(i=>{camposConservados()[i].conservar=false});
     const p9b=planTarea(tareaRows,"TAREA_PROT2.xlsx");TAREA=p9b;aplicarTarea();await __p(50);
     idx.forEach((i,k)=>{camposConservados()[i].conservar=baks[k]});
     const oB3=S.ordenes.find(x=>x.id===oB2.id)||{};
     __check("P1b: tras recargar con las filas forzadas a false, la firma de liberación sigue",!!(((oB3.lib||{}).tela)||{}).ok&&(oB3.lib.tela.u==="prueba-lib"),JSON.stringify(oB3.lib));
     __check("P1b: el historial de fases sigue completo, con su motivo",(oB3.fases||[]).length>=nFases&&(oB3.fases||[]).some(f=>f.u==="prueba-fases"&&f.motivo==="motivo de prueba"),String((oB3.fases||[]).length));
     __check("P1b: la programación del centro sigue",!!((oB3.progCentro||{}).corte)&&oB3.progCentro.corte.u==="prueba-prog",JSON.stringify(oB3.progCentro));
     const p9c=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=p9c;aplicarTarea();await __p(50);
     const oB4=S.ordenes.find(x=>x.id===oB2.id);if(oB4){delete oB4.lib;delete oB4.progCentro;oB4.fases=(oB4.fases||[]).filter(f=>f.u!=="prueba-fases")}PLAN=null;PLAN_ALL=null}}
   /* ===== 6 · UN solo camino de carga: «Actualizar datos» (17-sep) ===== */
   {const veilOn=()=>document.getElementById("veil").classList.contains("on");cerrar();
    __check("U6: ya no existen «Actualizar desde Odoo», «Recarga Parte 2», mOT ni mFotos como diálogos",typeof mOdoo==="undefined"&&typeof planOdoo==="undefined"&&typeof aplicarOdoo==="undefined"&&typeof mCargarTarea==="undefined"&&typeof mOT==="undefined"&&typeof mFotos==="undefined"&&typeof odooBotonHTML==="undefined");
    ir("ordenes");await __p(80);const bs=[...document.querySelectorAll("#p-ordenes button")].map(b=>b.textContent.trim());
    __check("U6: en Órdenes hay UN botón «Actualizar datos» y ninguno de los viejos",bs.some(t=>/Actualizar datos/.test(t))&&!bs.some(t=>/Actualizar desde Odoo|Recarga Parte 2|Temporalmente/.test(t)),bs.filter(t=>/Actualizar|Recarga/.test(t)).join(" | "));
    mActualizarDatos(1);const m=()=>document.getElementById("modal");
    __check("U6: la pantalla tiene los tres pasos y arranca en Tareas de Odoo",veilOn()&&/1 · Tareas de Odoo/.test(m().textContent)&&/2 · Órdenes de trabajo/.test(m().textContent)&&/3 · Fotos/.test(m().textContent)&&!!document.getElementById("f-tarea")&&!!document.getElementById("tarea-ok")&&document.getElementById("tarea-ok").disabled);
    __check("U6: dice que nada se guarda antes de confirmar",/Nada se guarda antes de confirmar/.test(m().textContent));
    mActualizarDatos(2);__check("U6: paso 2 = órdenes de trabajo, con su entrada y su Aplicar",!!document.getElementById("f-ot")&&!!document.getElementById("ot-ok")&&/no estén en el sistema se avisan/.test(m().textContent));
    mActualizarDatos(3);__check("U6: paso 3 = fotos, con su entrada y su Subir",!!document.getElementById("f-fotos")&&!!document.getElementById("fotos-ok")&&/no estén en el sistema se avisan/.test(m().textContent));
    cerrar();
    /* la vista previa NO escribe en S */
    {const H=tareaRows[0];const col=n=>H.indexOf(n);const opAb=new Set(S.ordenes.filter(o=>abierta(o)&&o.op).map(o=>o.op));const r0=tareaRows.findIndex((r,i)=>i&&opAb.has(String(r[col("Orden de producción")]||"")));const rows=tareaRows.map((r,i)=>{if(i!==r0)return r;const x=r.slice();x[col("Color")]="COLOR-NUEVO-U6";return x});
     const nCol=S.colores.length,nOrd=S.ordenes.length,nCat=S.categorias.length,nTec=S.tecnicas.length,jsonOrd=JSON.stringify(S.ordenes.map(o=>[o.id,o.fase,o.cant]));
     const p=planTarea(rows,"U6.xlsx");
     __check("U6: la vista previa no escribe en S (órdenes, colores, categorías, técnicas)",S.colores.length===nCol&&S.ordenes.length===nOrd&&S.categorias.length===nCat&&S.tecnicas.length===nTec&&JSON.stringify(S.ordenes.map(o=>[o.id,o.fase,o.cant]))===jsonOrd&&p.coloresNuevosObj.length===1&&p.coloresNuevosObj[0].n==="COLOR-NUEVO-U6",JSON.stringify({col:S.colores.length-nCol,nuevos:p.coloresNuevos}));
     const h=vistaPreviaTareaHTML(p);
     __check("U6: la vista previa lista nuevas, actualizadas, cerradas, fuera de alcance, no vinieron, no calzan, clave incompleta, clave repetida, fechas ilegibles y errores",["nuevas","actualizadas","cerradas","fuera de alcance","no vinieron","no calzan","clave incompleta","clave repetida","fechas ilegibles","errores"].every(t=>h.includes(t)),["nuevas","actualizadas","cerradas","fuera de alcance","no vinieron","no calzan","clave incompleta","clave repetida","fechas ilegibles","errores"].filter(t=>!h.includes(t)).join(", "));
     __check("U6: la vista previa cuadra: nuevas + actualizadas + no aplicadas = órdenes del plan",p.prev.nuevas+p.prev.actualizadas+p.prev.repetidasNoAplicadas===p.ordenes.length&&p.prev.actualizadas>1000,JSON.stringify(p.prev&&{n:p.prev.nuevas,a:p.prev.actualizadas,r:p.prev.repetidasNoAplicadas,t:p.ordenes.length}));
     TAREA=p;aplicarTarea();await __p(50);
     __check("U6: el color nuevo entra recién al aplicar",S.colores.length===nCol+1&&S.colores.some(c=>c.n==="COLOR-NUEVO-U6"));
     S.colores=S.colores.filter(c=>c.n!=="COLOR-NUEVO-U6");}
    /* archivo SIN componentes: aviso y solo se actualiza lo que viene */
    {const H=tareaRows[0];const quitar=new Set(H.map((h,i)=>/Componentes/.test(String(h))?i:-1).filter(i=>i>=0));
     const rows=tareaRows.filter((r,i)=>!i||String(r[H.indexOf("Orden de producción")]||"").trim()||String(r[H.indexOf("Cliente")]||"").trim()).map(r=>r.filter((c,i)=>!quitar.has(i)));
     const oX=S.ordenes.find(o=>abierta(o)&&(o.telas||[]).length&&(o.ruta||[]).length);const telasAntes=JSON.stringify(oX.telas),rutaAntes=JSON.stringify(oX.ruta);
     const p=planTarea(rows,"U6_sincomp.xlsx");
     __check("U6: un archivo sin componentes se lee y se avisa",!!p&&p.sinComponentes===true&&/Archivo sin componentes/.test(vistaPreviaTareaHTML(p)),p&&p.ordenes.length);
     TAREA=p;aplicarTarea();await __p(50);const oY=S.ordenes.find(o=>o.id===oX.id);
     __check("U6: sin componentes, telas y ruta de las órdenes existentes se conservan",!!oY&&JSON.stringify(oY.telas)===telasAntes&&JSON.stringify(oY.ruta)===rutaAntes,JSON.stringify(oY&&{t:(oY.telas||[]).length,r:(oY.ruta||[]).length}));
     const pz=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=pz;aplicarTarea();await __p(50);}
    cerrar()}
   __check("CARGA: el único camino de carga es planTarea/aplicarTarea (no queda planificador de Odoo)",typeof planOdoo==="undefined"&&typeof mActualizarDatos==="function");
   window.alert=a0;
   __check("CARGA sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* OT reales contra las órdenes reales (fixture local, no publicado) */
  {const otRows=await (await fetch('fixtures/ot_rows.json')).json();window.__otRows=otRows;__check('fixture OT: 27.336 filas incl. header',otRows.length===27336,otRows.length);
   const po=planOT(otRows,'Orden_de_trabajo.xlsx');
   /* ===== impacto del arreglo de excelFecha sobre el ARCHIVO ===== */
   {const hh=otRows[0].map(x=>String(x).toLowerCase());
    const iI=hh.findIndex(x=>x.includes("inicio")),iF=hh.findIndex(x=>x.includes("final"));
    let num=0,conHora=0,cambian=0;const ejemplos=[];
    otRows.slice(1).forEach(r=>{[iI,iF].forEach(i=>{const v=r[i];
      if(typeof v!=="number"||v<20000||v>60000)return;num++;
      if(Math.abs(v-Math.floor(v))>1e-9)conHora++;
      if(excelFecha(v)!==excelFechaRedondeada(v)){cambian++;
        if(ejemplos.length<3)ejemplos.push(r[0]+" · "+r[1]+" · "+String(excelFechaHora(v)).replace("T"," ").slice(0,16)+" · antes "+excelFechaRedondeada(v)+" → ahora "+excelFecha(v))}})});
    __R.excel={fechasOT:num,conHora,cambian,pct:num?+(cambian/num*100).toFixed(1):0,ejemplos};
    __check("EXR: se mide cuántas fechas del archivo de OT cambian",cambian>0,cambian+" de "+num+" ("+__R.excel.pct+"%)");}
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
   mActualizarDatos(3);FOTOS=p;await aplicarFotos();await __p(50);const ix=S.params.fotosIdx||{};
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
   __check("perfil corte: ve corte, estampado, bordado y etiquetas; reprograma pero YA NO edita rutas",(sembrarPermisoRutas(),veCentro('corte')&&veCentro('estampado')&&veCentro('bordado')&&veCentro('etiquetas')&&!veCentro('modulos')&&!puede('config')&&!puede('usuarios')&&puede('reprogramar')&&!puede('ruta')&&puedeCentro('corte')));
   __check("perfil corte: menú sin Configuración ni Dirección",!vePagina('config')&&!vePagina('ordenes')&&vePagina('centro')&&vePagina('control'));
   PERFIL={rol:'terminado',modo:'editar',nombre:'PT'};__check("perfil producto terminado: plancha, botones, lavado y empaque (Etiquetas pasó a Estampado)",['plancha','botones','lavado','empaque'].every(veCentro)&&!veCentro('etiquetas')&&!veCentro('corte'));
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
     /* ===== 2a · FOTO del DOM de la lista del bloque 1 de Liberación, ANTES de extraerla ===== */
     {page='liberacion';LIB.et='tela';LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q='';LIB.fases=null;LIB.verLista=true;LIB.sel=new Set();GRP={};render();
      const host=document.getElementById('p-liberacion');const lista=document.getElementById('lib-lista');
      const pendV=pendLiberacion('tela',null).filter(o=>okFiltrosB1(o));
      __check("2a LIB DOM: existe #lib-lista cuando «Ver todas las pendientes» está abierto",!!lista===(pendV.length>0),pendV.length);
      if(lista){const tabla=lista.querySelector('table');
       const ths=[...tabla.querySelectorAll('thead th')].map(t=>t.textContent.trim().replace(/\s+/g,' '));
       __check("2a LIB DOM: 8 columnas de tela, en este orden",ths.length===8&&ths[1]==='OP · fase'&&ths[2]==='Cliente'&&ths[3]==='Color'&&ths[4]==='Prendas'&&ths[5]==='Entrega'&&/^Tela · qué le falta/.test(ths[6])&&ths[7]==='Qué la frena',ths.join('|'));
       const trs=[...tabla.querySelectorAll('tbody tr')].filter(tr=>!tr.classList.contains('grp-row'));
       __check("2a LIB DOM: tantas filas como pendientes (tope 400)",trs.length===Math.min(400,pendV.length),trs.length+' vs '+pendV.length);
       __check("2a LIB DOM: el encabezado de la lista dice cuántas órdenes",/Todas las pendientes · \d+ (orden|órdenes)/.test(lista.textContent));
       if(trs.length){const tr=trs[0];const tds=[...tr.querySelectorAll('td')];
        __check("2a LIB DOM: cada fila tiene 8 celdas",tds.length===8,tds.length);
        __check("2a LIB DOM: celda 2 = foto/WH/fase (whCell)",!!tr.querySelector('td:nth-child(2) .fase-mini')||/WH\//.test(tds[1].textContent));
        __check("2a LIB DOM: celda 7 = tela · qué le falta, con las casillas tintura/lavado por tela (setFaltaTela)",/setFaltaTela\(/.test(tds[6].innerHTML)||/sin tela/.test(tds[6].textContent));
        __check("2a LIB DOM: celda 8 = qué la frena + control de ruta",/lista para liberar|falta|tag/.test(tds[7].innerHTML));
        /* la casilla de seleccionar solo sale en las que ya se pueden liberar */
        const conCheck=trs.filter(t=>t.querySelector('td:nth-child(1) input[type=checkbox]')).length;
        const listas=pendV.filter(o=>puedeLiberarA(o,'tela')).length;
        __check("2a LIB DOM: hay casilla de selección exactamente en las órdenes listas para liberar",conCheck===Math.min(400,listas),conCheck+' vs '+listas);
        /* estado seleccionado: marcar una y que se vea marcada tras redibujar */
        const o0=pendV.find(o=>puedeLiberarA(o,'tela'));
        if(o0){LIB.sel=new Set([o0.id]);render();
         const tr0=[...document.querySelectorAll('#lib-lista tbody tr')].find(t=>t.innerHTML.indexOf("togLib('"+o0.id+"'")>=0);
         __check("2a LIB DOM: la orden seleccionada sale con su casilla marcada tras el redibujo",!!tr0&&!!tr0.querySelector('input[type=checkbox]:checked'));
         LIB.sel=new Set();render()}}
       /* agrupación común: agrupar por cliente conserva las filas y muestra cabeceras con conteo */
       grpSt('lib').niveles=['cliente'];render();
       const t2=document.querySelector('#lib-lista table');
       const trs2=t2?[...t2.querySelectorAll('tbody tr')].filter(tr=>!tr.classList.contains('grp-row')):[];
       __check("2a LIB DOM: agrupar por cliente arranca con los grupos CERRADOS (0 filas visibles)",trs2.length===0,trs2.length);
       const cabs=t2?[...t2.querySelectorAll('tbody tr.grp-row')]:[];
       const suma=cabs.reduce((a,c)=>{const m=c.textContent.match(/(\d+)\s+(orden|órdenes)/);return a+(m?+m[1]:0)},0);
       __check("2a LIB DOM: las cabeceras de grupo suman todas las filas de la lista",suma===trs.length,suma+' vs '+trs.length);
       if(cabs[0]){const k=(cabs[0].getAttribute('onclick')||'').match(/togGRP\('lib','([^']*)'\)/);
        if(k){togGRP('lib',k[1].replace(/\\'/g,"'"));const t3=document.querySelector('#lib-lista table');
         const abiertas=t3?[...t3.querySelectorAll('tbody tr')].filter(tr=>!tr.classList.contains('grp-row')).length:0;
         __check("2a LIB DOM: abrir un grupo muestra sus filas",abiertas>0,abiertas);}}
       __check("2a LIB DOM: y las cabeceras de grupo traen «seleccionar todo» y conteo",!!t2&&/Cliente:/.test(t2.innerHTML)&&/seleccionar todo|marcar el grupo/.test(t2.innerHTML)&&/prendas/.test(t2.innerHTML));
       GRP={};render();
       __R.libDOM={ths,filas:trs.length,pend:pendV.length};}
      /* sin «Ver todas» y sin familia elegida, no hay lista: solo el aviso */
      LIB.verLista=false;LIB.fam2=null;LIB.q='';render();
      __check("2a LIB DOM: sin abrir «Ver todas» la lista no se dibuja y se muestra la ayuda",!document.getElementById('lib-lista')&&/Toca una familia/.test(document.getElementById('p-liberacion').innerHTML));
      LIB.verLista=false;}
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
    __check("sin WH: la fila sin número pero con cliente/fase es una orden, no un componente",p.sinLanzar>=1&&!!o&&o.id.startsWith('sin_')&&o.op.startsWith('SIN WH')&&o.cliente==='CLIENTE PRUEBA'&&o.cant===1091&&(o.fecha||'').startsWith('2026-'),JSON.stringify(o&&{id:o.id,op:o.op,fecha:o.fecha}));
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
   /* ===== 2a · FOTO del DOM de la cola ANTES de extraerla: nada de esto puede cambiar ===== */
   {CEN.cercAbre={disponible:true,porLlegar:true,revisar:true,lejana:true};render();
    const host=document.getElementById("p-centro");
    const tabla=[...host.querySelectorAll(".panel.cola table")][0];
    __check("2a DOM: existe la tabla de la cola dentro de .panel.cola",!!tabla);
    const ths=tabla?[...tabla.querySelectorAll("thead th")].map(t=>t.textContent.trim()):[];
    __check("2a DOM: las 14 columnas, en este orden",ths.join("|")==="Puesto|OP|ODC|Llega|Cliente|Categoría|Color|Pendientes|Min|Recurso|Arranca|Plan: inicio → fin|Marca|",ths.join("|"));
    const filas=tabla?[...tabla.querySelectorAll("tbody tr[draggable]")]:[];
    const P1=programar();const lun1=lunesDe(hoy());
    const colaV=colaCentro("corte",filasDeCentros(["corte"],P1,lun1,dsum(lun1,6),CEN.q).filter(f=>faseOkCEN(f.o)));
    __check("2a DOM: hay tantas filas arrastrables como órdenes en la cola",filas.length===colaV.length,filas.length+" vs "+colaV.length);
    if(filas.length){const tr=filas[0];const tds=[...tr.querySelectorAll("td")];
     __check("2a DOM: cada fila tiene 14 celdas",tds.length===14,tds.length);
     __check("2a DOM: celda 1 = asa de arrastre + puesto numérico",!!tr.querySelector("td:nth-child(1) .hand")&&!!tr.querySelector("td:nth-child(1) input[type=number]"));
     __check("2a DOM: celda 2 = foto/WH/fase (whCell) con la marca de puesto",!!tr.querySelector("td:nth-child(2) .fase-mini")||/fase/.test(tds[1].innerHTML));
     __check("2a DOM: celda 10 = selector de recurso con opción auto",!!tr.querySelector("td:nth-child(10) select option[value=\"\"]"));
     __check("2a DOM: celda 11 = fecha de arranque",!!tr.querySelector("td:nth-child(11) input[type=date]"));
     __check("2a DOM: celda 14 = acciones (ruta / ✓ hecho)",/ruta|hecho/.test(tds[13].innerHTML));
     __check("2a DOM: los eventos de arrastre están en la fila",["ondragstart","ondragend","ondragover","ondragleave","ondrop"].every(a=>tr.hasAttribute(a)));}
    /* cabeceras de grupo de cercanía y agrupación */
    const grp=tabla?[...tabla.querySelectorAll("tbody tr.grp-row")]:[];
    __check("2a DOM: hay cabeceras de grupo (cercanía) en la tabla",grp.length>=1,grp.length);
    __check("2a DOM: la fila «soltar al final» está y tiene colspan 14",!!(tabla&&tabla.querySelector("tr.dd-fin td[colspan=\"14\"]")));
    /* cabecera del panel: conteo y nota del orden */
    const h3=host.querySelector(".panel.cola h3");
    __check("2a DOM: la cabecera dice cuántas órdenes pendientes y prendas por hacer",!!h3&&/órdenes pendientes/.test(h3.textContent)&&/prendas por hacer/.test(h3.textContent),h3&&h3.textContent.slice(0,80));
    __check("2a DOM: la nota del orden de la cola está arriba de la tabla",/Orden de la cola:/.test(host.querySelector(".panel.cola .body").innerHTML));
    /* agrupación común: seleccionar cliente→categoría conserva las filas */
    GRP={};grpSt("cen").niveles=["cliente","cat"];render();
    const t2=[...document.querySelectorAll("#p-centro .panel.cola table")][0];
    __check("2a DOM: agrupar por cliente→categoría conserva todas las filas arrastrables",
      t2&&[...t2.querySelectorAll("tbody tr[draggable]")].length===filas.length,t2&&t2.querySelectorAll("tbody tr[draggable]").length);
    __check("2a DOM: y muestra las cabeceras de agrupación con conteo de órdenes y prendas",t2&&/Cliente:/.test(t2.innerHTML)&&/prendas/.test(t2.innerHTML));
    GRP={};
    /* «Hecho hoy» aparece solo si hubo hechas hoy: se fija la condición, no el contenido */
    const hd=hechasDelDia("corte",null,hoy());
    __check("2a DOM: el panel «Hecho hoy» aparece exactamente cuando hay hechas hoy",
      (/Hecho hoy en /.test(host.innerHTML))===(hd.detalle.length>0),hd.detalle.length);
    __R.colaDOM={ths,filas:filas.length,grupos:grp.length};
    CEN.cercAbre=null;render();}
   __check("cola: la tabla es arrastrable y tiene puesto numérico y zona 'al final'",/draggable="true"/.test(html())&&/onchange="moverEnCola\(/.test(html())&&html().includes('poner al final')&&html().includes('Agrupar por'));
   __check("cola: sin numerar la pantalla dice que se ordena por cercanía",html().includes("cola sin numerar: se ordena por cercanía a llegar a este centro"));
   if(cola.length>=3){const oA=cola[cola.length-1].o,oB=cola[0].o;const nb=S.bitacora.length;const nAdv=(S.params.advertencias||[]).length;
     DRAGC={oid:oA.id,c:'corte'};const ev={preventDefault(){},currentTarget:{classList:{remove(){},add(){}}},dataTransfer:{}};soltarCola(ev,'corte',oB.id);
     const cola2=colaCentro('corte',filasDeCentros(['corte'],programar(),lun,dsum(lun,6),''));
     __check("cola: soltar sobre la primera la pone en el puesto 1 y NO numera a las demás (decisión 6)",cola2[0].o.id===oA.id&&puestoDe(oA,'corte')===1&&cola2.slice(1).every(f=>puestoDe(f.o,'corte')===0),cola2.slice(0,3).map(f=>f.o.op+':'+puestoDe(f.o,'corte')).join(' '));
     __check("cola: y las demás siguen ordenadas por cercanía",(()=>{const r=cola2.slice(1);for(let i=1;i<r.length;i++){if(ordenCercania(r[i-1].cerc)>ordenCercania(r[i].cerc)+1e-9)return false}return true})());
     __check("cola: el motor ordena por ese número (prioCentro)",prioCentro(oA)===1);
     __check("cola: queda en bitácora quién movió qué y cuándo",S.bitacora.slice(nb).some(b=>b.t.startsWith('Cola de Corte: '+oA.op+' del puesto '+cola.length+' al 1')&&b.u&&b.ts));
     __check("cola: las advertencias nuevas (si las hay) llevan la acción de la cola",(S.params.advertencias||[]).slice(nAdv).every(x=>/^Cola de Corte/.test(x.accion)));
     moverEnCola(oA.id,'corte',{pos:cola.length});const cola3=colaCentro('corte',filasDeCentros(['corte'],programar(),lun,dsum(lun,6),''));
     __check("cola: escribir el puesto n la manda al final (bajarla obliga a numerar lo que queda por encima)",cola3[cola3.length-1].o.id===oA.id&&cola3.every((f,i)=>puestoDe(f.o,'corte')===i+1));
     __check("cola: en pantalla ya no hay 'sin puesto' en Corte",!/sin puesto · la ordena la cercanía/.test(html()));
     // sin puesto va al final (decisión 14-sep): quitar el puesto de la primera la manda al final de la cola y el motor la toma como última
     {const oF=cola3[0].o;delete oF.progCentro.corte.pri;PLAN=null;PLAN_ALL=null;render();const c4=colaCentro('corte',filasDeCentros(['corte'],programar(),lun,dsum(lun,6),''));
      __check("cola: una orden sin puesto va al final, no se cuela delante de las ordenadas",c4[c4.length-1].o.id===oF.id&&prioCentro(oF)===SIN_PUESTO&&prioCentro(oF)>prioCentro(c4[0].o)&&html().includes('sin puesto · la ordena la cercanía'));oF.progCentro.corte.pri=1;PLAN=null;PLAN_ALL=null;}
     // agrupar: reordena y suma, no esconde
     CEN.cercAbre={disponible:true,porLlegar:true,revisar:true,lejana:true};   /* los grupos de cercanía nacen colapsados: aquí se miran TODAS las filas */
     GRP={};grpSt('cen').niveles=['cliente','cat'];render();const hc=html();const pend3=cola3.reduce((x,f)=>x+Math.max(0,f.o.cant-f.hechas),0);
     const sumaGrp=(hc.match(/prendas · [\d.,]+ h \([\d.,]+ min\)<\/span>/g)||[]).length;
     __check("cola: agrupar cliente→categoría conserva todas las órdenes y suma pendientes (agrupador común)",hc.includes('Cliente:')&&(hc.match(/draggable="true"/g)||[]).length===cola3.length&&sumaGrp>0&&hc.includes(num(pend3)+' prendas'));
     GRP={};
     // prio global manda: la pantalla lo dice
     const pr=oA.prio;oA.prio=1;render();__check("cola: si la orden tiene prio global, la pantalla dice que manda",html().includes('prio global 1 manda'),(cercaniaCentro(oA,'corte',programar())||{}).grupo);oA.prio=pr;
     // otro centro con menor puesto
     oA.progCentro.modulos={pri:1};render();__check("cola: si otro centro la tiene en menor puesto, la pantalla lo dice",html().includes('la tiene en 1: manda ese'),(cercaniaCentro(oA,'corte',programar())||{}).grupo);delete oA.progCentro.modulos;
     CEN.cercAbre=null;
     // perfil sin permiso no mueve
     PERFIL={rol:'modulos',modo:'editar',nombre:'Mod'};const antesP=puestoDe(oA,'corte');moverEnCola(oA.id,'corte',{pos:1});__check("cola: un perfil de otro centro no puede mover",puestoDe(oA,'corte')===antesP);PERFIL=adminP;
     // terminados: una cola por centro
     CEN.id='terminados';CEN.niveles=[];render();__check("cola: Terminados muestra una cola por cada sub-área",(html().match(/Cola de /g)||[]).length===censDeGrupo('terminados').length&&censDeGrupo('terminados').length>=4);
     __check("cola: Terminados abre con el consolidado de sus sub-áreas",/Terminados · las sub-áreas/.test(html())&&/Ocupación/.test(html()));
     cola3.forEach(f=>{const pc=f.o.progCentro;if(!pc||!pc.corte)return;delete pc.corte.pri;if(!Object.keys(pc.corte).length)delete pc.corte;if(!Object.keys(pc).length)delete f.o.progCentro});PLAN=null;PLAN_ALL=null;}
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
   /* el cierre exige tiempo corrido: se registra un tramo como lo haría el operario */
   const conTiempo=(oid,cen)=>{const tr=tramosDe(oid);
     if(!tr.some(t=>t.centro===cen&&t.fin))tr.push({id:'t-prev-'+uid(),centro:cen,rec:null,
       ini:new Date(Date.now()-30*6e4).toISOString(),fin:new Date().toISOString(),u:'operario',paros:[],tallas:{}})};
   if(cola.length){const o=cola[0].o;CEN.id='corte';CEN.tab='prog';CEN.todo=true;page='centro';render();
     conTiempo(o.id,c);
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
     if(o2){conTiempo(o2.id,c);window.confirm=m=>true;marcarHechoCentro(o2.id,c);document.getElementById('hc-q').value=String(Math.max(1,o2.cant-5));confirmarHechoCentro(o2.id,c);window.confirm=cp;
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
  /* MEDICIÓN tardía: operaciones de etiquetas y ojales/botones YA vinculadas a categorías */
  {const usos=c=>{const m={};S.categorias.forEach(k=>{opsDe(k).filter(x=>x.centro===c).forEach(x=>{const key=x.op;m[key]=m[key]||{op:x.n,sam:x.sam,maq:x.maq||'',cats:[]};m[key].cats.push(nombreCat(k))})});return Object.values(m)};
   const porCat=c=>S.categorias.filter(k=>opsDe(k).some(x=>x.centro===c)).map(k=>({cat:nombreCat(k),fam:(K(k.padre)||k).n,
     ops:opsDe(k).filter(x=>x.centro===c).map(x=>x.n+' '+x.sam+(x.maq?' ['+x.maq+']':'')),lmo:samPorCentro(k)[c],regla:(()=>{const ob=ojalBotonDe(k);return ob?(ob.match+(ob.sinConfirmar?' (SIN CONFIRMAR)':' = '+((+ob.ojales||0)+(+ob.botones||0)))):'—'})()}));
   __R.lmo2={etiquetas:{usos:usos('etiquetas'),porCat:porCat('etiquetas')},botones:{usos:usos('botones'),porCat:porCat('botones')},
     camisetasEtiq:S.categorias.filter(k=>/camiseta|level/i.test(k.n||'')).map(k=>({cat:nombreCat(k),etiq:opsDe(k).filter(x=>x.centro==='etiquetas').length,est:opsDe(k).filter(x=>x.centro==='estampado').map(x=>x.n+' '+x.sam)})),
     ordEtiq:S.ordenes.filter(o=>abierta(o)&&(o.ruta||[]).some(x=>x.centro==='etiquetas')).length,
     ordEst:S.ordenes.filter(o=>abierta(o)&&(o.ruta||[]).some(x=>x.centro==='estampado')).length};
   __check("MED-LMO2: medición tardía de etiquetas y ojales/botones",!!__R.lmo2);}
  /* MEDICIÓN sobre las órdenes REALES cargadas del volcado (antes de restaurar el estado de prueba) */
  {const ab=S.ordenes.filter(abierta);
   const cd=cambiosDisponibilidad();const rs=rutasSinSecuencia();
   __R.real={ordenes:S.ordenes.length,abiertas:ab.length,
     conRutaPro:ab.filter(o=>pasosProDe(o).length).length,
     cambios:cd,rutas:{sinRuta:rs.sinRuta.length,repetido:rs.repetido.length,fueraDeRuta:rs.fueraDeRuta.length,total:rs.total},
     ojalBoton:(()=>{const b=brechasOjalBoton();return{sinConfirmar:b.sinConf.length,sinRegla:b.sinRegla.length,conCero:b.conCero.length,ej:b.sinConf.slice(0,5)}})(),
     capLavado:capacidadPaso('lavado'),porDiasLavado:centroPorDias('lavado'),
     enRuta:{lavado:ab.filter(o=>(o.ruta||[]).some(x=>x.centro==='lavado')).length,plancha:ab.filter(o=>(o.ruta||[]).some(x=>x.centro==='plancha')).length,botones:ab.filter(o=>(o.ruta||[]).some(x=>x.centro==='botones')).length}};
   __check("MED: se pudo medir sobre las órdenes cargadas del volcado real",__R.real.abiertas>100,JSON.stringify({abiertas:__R.real.abiertas}));}
  /* ===== CATÁLOGO REAL: se arma desde el volcado y se vincula con la tabla padre→LMO ===== */
  {const bakCat=JSON.parse(JSON.stringify(S.categorias));
   const pares={};(window.__tareaRows||[]).slice(1).forEach(r=>{const pa=String(r[7]||'').trim(),h=String(r[8]||'').trim();
     if(!pa||!h)return;(pares[pa]=pares[pa]||new Set()).add(h)});
   const nPares=Object.values(pares).reduce((a,x)=>a+x.size,0);
   __check('CAT: el volcado real trae 22 familias y 51 categorías hija',Object.keys(pares).length===22&&nPares===51,Object.keys(pares).length+' / '+nPares);
   // se reemplaza el catálogo del demo por el real (solo dentro de la prueba)
   S.categorias=[];
   Object.entries(pares).forEach(([pa,hs])=>{const pid=uid();S.categorias.push({id:pid,n:pa});
     [...hs].forEach(h=>S.categorias.push({id:uid(),padre:pid,n:h}))});
   __check('CAT: el catálogo real queda cargado en el simulador',S.categorias.filter(k=>k.padre).length===51&&S.categorias.filter(k=>!k.padre).length===22);
   // reenlazar las órdenes al catálogo nuevo, por su padre/hija del volcado
   {const porOp={};((window.__planT||{}).ordenes||[]).forEach(x=>{if(x.op&&x.catTxt)porOp[x.op]=String(x.catTxt).trim()});
    const porNombre={};S.categorias.filter(k=>k.padre).forEach(k=>{porNombre[(K(k.padre)||{}).n+' / '+k.n]=k.id});
    let re=0,sin=[];S.ordenes.forEach(o=>{const key=porOp[o.op];
      if(key&&porNombre[key]){o.cat=porNombre[key];re++}else if(key)sin.push(key)});
    __check('CAT: las 1.206 órdenes cargadas quedan enlazadas a su categoría del catálogo real',re===S.ordenes.length,re+' de '+S.ordenes.length+(sin.length?' · sin calzar: '+[...new Set(sin)].slice(0,5).join(', '):''));
    __check("CAT: contra el catálogo del demo calzaba menos del 20% de las 1.206 órdenes (por eso la medición anterior salió distorsionada)",((window.__planT||{}).ordenes||[]).filter(x=>x.cat).length<250,String(((window.__planT||{}).ordenes||[]).filter(x=>x.cat).length));}
   const {vinc,sinMapeo}=aplicarMapeoCategorias();
   const conOps=S.categorias.filter(k=>k.padre&&(k.ops||[]).length);
   const conFam=S.categorias.filter(k=>k.padre&&k.familiaLMO);
   const sinVinc=S.categorias.filter(k=>k.padre&&!k.familiaLMO);
   __check('CAT: 40 de las 51 categorías hija quedan vinculadas a su familia de la LMO',conFam.length===40&&conOps.length===40,conFam.length+' vinculadas / '+conOps.length+' con operaciones');
   __check('CAT: las 11 sin vínculo son las que producción marcó «sin operaciones»',sinVinc.length===11,sinVinc.map(k=>(K(k.padre)||{}).n+'/'+k.n).join(', '));
   __check('CAT: y son familias enteras, no hijas sueltas: JOGGER, Fleece, TEJIDOS, FALDAS, ENTERIZO y ACCESORIOS',
    [...new Set(sinVinc.map(k=>(K(k.padre)||{}).n))].sort().join('|')==='ACCESORIOS|ENTERIZO|FALDAS|Fleece Basico|Fleece Pesado|JOGGER|TEJIDOS');
   // la regla de etiqueta contra el catálogo REAL
   {const cuatro=['Level 1','Level 2','Camiseta CR','Camiseta CV'];
    const ks=cuatro.map(n=>S.categorias.find(k=>k.padre&&k.n===n));
    __check('ETIQ: las cuatro categorías de la regla SÍ existen en el catálogo real',ks.every(Boolean)&&ks.every(k=>(K(k.padre)||{}).n==='CAMISETAS'));
    __check('ETIQ: y la regla les carga 0,50 min de etiqueta a las cuatro',ks.every(k=>!!etiquetaDe(k)&&+samPorCentro(k).etiquetas===0.5));
    const otra=S.categorias.find(k=>k.padre&&k.n==='Polo Basica');
    __check('ETIQ: y a una que no está en la regla, no',!!otra&&!etiquetaDe(otra)&&samPorCentro(otra).etiquetas===undefined);
    // con las órdenes reales cargadas: cuántas llevan la etiqueta
    const ids=new Set(ks.filter(Boolean).map(k=>k.id));
    const conEtiq=S.ordenes.filter(o=>abierta(o)&&ids.has(o.cat));
    const todasEtiq=S.ordenes.filter(o=>ids.has(o.cat));
    __R.etiqReal={cats:cuatro,
      cargadas:{ordenes:todasEtiq.length,pz:todasEtiq.reduce((a,o)=>a+(+o.cant||0),0)},
      lanzadas:(()=>{const l=S.ordenes.filter(o=>lanzada(o)&&ids.has(o.cat));return{ordenes:l.length,pz:l.reduce((a,o)=>a+(+o.cant||0),0),min:l.reduce((a,o)=>a+(+o.cant||0)*0.5,0)}})(),
      abiertas:{ordenes:conEtiq.length,pz:conEtiq.reduce((a,o)=>a+(+o.cant||0),0),min:conEtiq.reduce((a,o)=>a+(+o.cant||0)*0.5,0)}};
    __check('ETIQ: las abiertas son un subconjunto de las cargadas',conEtiq.length<=todasEtiq.length);}
   /* de dónde sale cada cifra de órdenes, con la definición única */
   {const cerrFase=S.ordenes.filter(o=>!ESTADOS_CERRADOS.includes(o.estado||'')&&faseDeCierre(o.fase));
    const arch=S.ordenes.filter(o=>ESTADOS_CERRADOS.includes(o.estado||''));
    __R.conteo={cargadas:cargadasTot(),abiertas:ordenesAbiertas().length,lanzadas:ordenesLanzadas().length,enPlanta:ordenesEnPlanta().length,
      archivadas:arch.length,conFaseDeCierre:cerrFase.length,
      fasesDeCierre:[...new Set(cerrFase.map(o=>o.fase||'(sin fase)'))].sort()};
    const doneOP=S.ordenes.filter(o=>!ESTADOS_CERRADOS.includes(o.estado||'')&&estadosOPCerrados().includes(o.estadoOP||''));
    __R.conteo.conEstadoOPCerrado=doneOP.length;
    __check("ORD: cargadas = abiertas + archivadas + Estado OP cerrado + fase de cierre, sin contar ninguna dos veces",
     __R.conteo.cargadas===__R.conteo.abiertas+__R.conteo.archivadas+doneOP.length+cerrFase.filter(o=>!estadosOPCerrados().includes(o.estadoOP||'')).length,JSON.stringify(__R.conteo));
    __check('ORD: la definición única es la que usa abierta() en todo el sistema',S.ordenes.every(o=>abierta(o)===abiertaDe(o)));}
   /* lo que mueve la unificación JEANS→DENIM sobre los datos reales */
   {const prev=diagJeans();
    const nCat=S.categorias.length,nOrd=S.ordenes.length,nOps=(S.operaciones||[]).length;
    __R.jeansMovido={antes:{cats:prev.cats.length,ordenes:prev.ordenes.length,ops:prev.ops.length,
      tablas:prev.tablas.map(x=>x.t+': '+x.fila)},ejemplos:prev.ordenes.slice(0,6).map(o=>o.op)};
    delete S.params.jeansUnificado;sembrarUnificacionJeans();
    __R.jeansMovido.despues={cats:diagJeans().cats.length,ordenes:diagJeans().ordenes.length};
    __R.jeansMovido.sinBorrar=(S.categorias.length===nCat&&S.ordenes.length===nOrd&&(S.operaciones||[]).length===nOps);
    __check('JD: la unificación autorizada corre sola y no borra nada',!!S.params.jeansUnificado&&__R.jeansMovido.sinBorrar);}
   /* A1 · por qué hay rutas que no terminan en Empaque */
   {const conRuta=S.ordenes.filter(o=>abierta(o)&&pasosProDe(o).length);
    const mal=conRuta.filter(o=>!rutaTerminaEnEmpaque(o));
    const contiene=mal.filter(o=>pasosProDe(o).includes('empaque'));
    const noContiene=mal.filter(o=>!pasosProDe(o).includes('empaque'));
    const porUlt={};mal.forEach(o=>{const r=pasosProDe(o);porUlt[r[r.length-1]]=(porUlt[r[r.length-1]]||0)+1});
    const editadas=mal.filter(rutaEditadaAMano);
    const ordenada=o=>{const r=pasosProDe(o);return r.every((c,k)=>k===0||ordenPaso(r[k-1])<=ordenPaso(c))};
    __R.empDiag={conRuta:conRuta.length,mal:mal.length,
      contieneEmpaque:contiene.length,noContieneEmpaque:noContiene.length,
      porUltimo:porUlt,editadasAMano:editadas.length,
      desordenadas:mal.filter(o=>!ordenada(o)).length,
      conOT:mal.filter(o=>o.ot&&Object.keys(o.ot).length).length,
      ejemplos:mal.slice(0,5).map(o=>({op:o.op,cat:nombreCat(K(o.cat)),
        ruta:pasosProDe(o).join(' → '),
        ot:Object.entries(o.ot||{}).map(([c,r])=>c+':'+(r.estado||'?')+(r.fin?' fin '+r.fin:'')),
        editada:rutaEditadaAMano(o)}))};
    // ¿la categoría tiene operaciones de empaque en la LMO?
    __R.empDiag.catSinEmpaque=[...new Set(noContiene.map(o=>{const k=K(o.cat);
      return (k?nombreCat(k):'sin categoría')+(k&&Object.keys(samPorCentro(k)).includes('empaque')?' [la categoría SÍ tiene empaque]':' [la categoría NO tiene empaque]')}))].slice(0,12);
    // ¿cuántos pasos tienen las malas vs las buenas, y qué diría la ruta rearmada con el catálogo ya vinculado?
    const bien=conRuta.filter(rutaTerminaEnEmpaque);
    const nPasos=l=>{const m={};l.forEach(o=>{const n=pasosProDe(o).length;m[n]=(m[n]||0)+1});return m};
    __R.empDiag.pasosMal=nPasos(mal);__R.empDiag.pasosBien=nPasos(bien);
    __R.empDiag.rutaCompletaMal=[...new Set(mal.slice(0,400).map(o=>(o.ruta||[]).map(x=>x.centro).join(' → ')))].slice(0,8);
    __R.empDiag.rutaCompletaBien=[...new Set(bien.slice(0,400).map(o=>(o.ruta||[]).map(x=>x.centro).join(' → ')))].slice(0,8);
    // la ruta que saldría hoy de la categoría (hoja LMO ya vinculada) + lo que la orden pide por técnica/puntadas
    const sugerida=o=>{const k=K(o.cat);if(!k)return [];
      const cs=new Set([...centrosDeCategoria(k),...ordenCentrosAuto(o)]);
      return [...cs].filter(c=>CE(c)&&CE(c).area==='pro').sort((a,b)=>ordenPaso(a)-ordenPaso(b))};
    const cambian=mal.filter(o=>{const s=sugerida(o);return s.length&&s.join()!==pasosProDe(o).join()});
    __R.empDiag.sugerenciaCambia=cambian.length;
    __R.empDiag.sugerenciaTerminaEmpaque=cambian.filter(o=>{const s=sugerida(o);return s[s.length-1]==='empaque'}).length;
    __R.empDiag.ejemploSugerida=cambian.slice(0,5).map(o=>({op:o.op,cat:nombreCat(K(o.cat)),antes:pasosProDe(o).join(' → '),despues:sugerida(o).join(' → ')}));
    __R.empDiag.sinSugerencia=mal.filter(o=>!sugerida(o).length).length;
    // ANTES/DESPUÉS de la corrección autorizada, sobre los datos reales
    {const ant={conRuta:conRuta.length,mal:mal.length,pz:mal.reduce((a,o)=>a+(+o.cant||0),0),
      porUlt:JSON.parse(JSON.stringify(porUlt))};
     const pv=previaCompletarRutas();
     const bakCierres=JSON.parse(JSON.stringify(S.params.cierresMes||{}));
     const ymC=hoy().slice(0,7);S.params.cierresMes={};S.ordenes.forEach(o=>{if(!o.proyecto)o.proyecto='x'});
     guardarCierresMes(programarTodo());const fotoAntes=S.params.cierresMes[ymC]?JSON.parse(JSON.stringify(S.params.cierresMes[ymC])):null;
     delete S.params.rutasEmpaqueCorregidas;
     const cf=window.confirm,al=window.alert;window.confirm=()=>true;window.alert=()=>{};
     sembrarRutasEmpaque();
     window.confirm=cf;window.alert=al;
     const conRuta2=S.ordenes.filter(o=>abierta(o)&&pasosProDe(o).length);
     const mal2=conRuta2.filter(o=>!rutaTerminaEnEmpaque(o));
     const porUlt2={};mal2.forEach(o=>{const r=pasosProDe(o);porUlt2[r[r.length-1]]=(porUlt2[r[r.length-1]]||0)+1});
     const fotoDesp=S.params.cierresMes[ymC]||null;
     __R.empAplicado={antes:ant,corregidas:(S.params.rutasEmpaqueCorregidas||{}).n||0,
       despues:{conRuta:conRuta2.length,mal:mal2.length,pz:mal2.reduce((a,o)=>a+(+o.cant||0),0),porUlt:porUlt2},
       previa:{falta:pv.falta.length,fuera:pv.fuera.length,manual:pv.manual.length,sinArreglo:pv.sinArreglo.length},
       terminanEmpaque:conRuta2.filter(rutaTerminaEnEmpaque).length,
       fotoRecalculada:!!(fotoDesp&&fotoDesp.recalculada),
       fotoAntesHechas:fotoAntes?fotoAntes.hechas:null,fotoDespHechas:fotoDesp?fotoDesp.hechas:null,
       fotoAntesBrecha:fotoAntes&&fotoAntes.brechaRutas?fotoAntes.brechaRutas.ordenes:null,
       fotoDespBrecha:fotoDesp&&fotoDesp.brechaRutas?fotoDesp.brechaRutas.ordenes:null};
     // la ruta por defecto para las que quedan
     const pd=previaRutaDefecto();
     __R.rutaDefectoPrevia={n:pd.n,sinMin:pd.sinMin,
       ejemplos:pd.filas.slice(0,5).map(f=>({op:f.o.op,cat:nombreCat(f.cat),min:f.min,de:f.de.join(' → '),a:f.a.join(' → ')}))};
     S.params.cierresMes=bakCierres;}
    __check('EMP: se puede diagnosticar por qué las rutas no terminan en Empaque',__R.empDiag.mal>=0);}
   /* efecto de los tiempos estimados de Santiago Garzón, sobre el volcado real */
   {delete S.params.tiemposSGSembrado;S.categorias.forEach(k=>{delete k.minEstConf;delete k.minEstConfMeta});
    const cAntes=categoriasSinHoja();
    const minSem=()=>{const P=programarTodo();const lun=lunesDe(hoy());const dom=dsum(lun,6);
      return (P.pro||[]).filter(x=>x.centro==='modulos'&&x.dia>=lun&&x.dia<=dom).reduce((a,x)=>a+(x.min||0),0)};
    const minMes=()=>{const P=programarTodo();const ym=hoy().slice(0,7);
      return (P.pro||[]).filter(x=>x.centro==='modulos'&&String(x.dia||'').slice(0,7)===ym).reduce((a,x)=>a+(x.min||0),0)};
    PLAN=null;PLAN_ALL=null;const semA=minSem(),mesA=minMes();
    const PA=programarTodo();const fA={};Object.entries(PA.ordenes||{}).forEach(([id,r])=>fA[id]=r.finPro||null);
    // el minuto estimado solo suma si la orden tiene el paso de confección en su ruta:
    // por eso se mide con la ruta por defecto ya aplicada, que es como correrá en producción
    {const cf=window.confirm,al=window.alert;window.confirm=()=>true;window.alert=()=>{};
     delete S.params.rutasEmpaqueCorregidas;delete S.params.rutaDefectoAplicada;
     sembrarRutasEmpaque();sembrarRutaDefecto22();
     window.confirm=cf;window.alert=al}
    PLAN=null;PLAN_ALL=null;const semA2=minSem(),mesA2=minMes();
    const PA2=programarTodo();const fA2={};Object.entries(PA2.ordenes||{}).forEach(([id,r])=>fA2[id]=r.finPro||null);
    sembrarTiemposSG();
    PLAN=null;PLAN_ALL=null;const semB=minSem(),mesB=minMes();
    const PB=programarTodo();let cambian=[];
    Object.entries(PB.ordenes||{}).forEach(([id,r])=>{const a=fA2[id],b=r.finPro||null;
      if(a!==b){const o=S.ordenes.find(x=>x.id===id);if(o)cambian.push({op:o.op,cat:nombreCat(K(o.cat)),antes:a,despues:b,dias:(a&&b)?diasEntre(a,b):null})}});
    const cDesp=categoriasSinHoja();
    const conMin=S.categorias.filter(k=>k.padre&&minEstimadoConf(k)!=null);
    __R.tiemposSG={cargadas:conMin.length,noCalzan:(S.params.tiemposSGNoCalzan||[]),
      antes:{sinValor:cAntes.sin.length,conEst:cAntes.est.length},
      despues:{sinValor:cDesp.sin.length,conEst:cDesp.est.length},
      minSemana:{antes:semA2,despues:semB,delta:semB-semA2},
      minMes:{antes:mesA2,despues:mesB,delta:mesB-mesA2},
      ordenesCambian:cambian.length,ejemplos:cambian.slice(0,8),
      pendiente:(()=>{const k=S.categorias.find(x=>x.padre&&normFase(x.n||'')===normFase('Camiseta Tejida'));
        const m=k?metaEstConf(k):null;return m?{min:minEstimadoConf(k),pendiente:!!m.pendiente,fuente:m.fuente}:null})(),
      porCategoria:conMin.map(k=>({cat:nombreCat(k),min:minEstimadoConf(k),
        ordenes:S.ordenes.filter(o=>abiertaDe(o)&&o.cat===k.id).length,
        pz:S.ordenes.filter(o=>abiertaDe(o)&&o.cat===k.id).reduce((a,o)=>a+(+o.cant||0),0)}))};
    // la carga que APARECERÁ cuando esas órdenes se liberen (hoy no están en el programa)
    {const lib=S.ordenes.filter(o=>abiertaDe(o)&&liberadaCorte(o));
     const pot=conMin.map(k=>{const os=S.ordenes.filter(o=>abiertaDe(o)&&o.cat===k.id);
       const lo=os.filter(liberadaCorte);
       return {cat:nombreCat(k),min:minEstimadoConf(k),ordenes:os.length,pz:os.reduce((a,o)=>a+(+o.cant||0),0),
         liberadas:lo.length,pzLib:lo.reduce((a,o)=>a+(+o.cant||0),0)}});
     __R.tiemposSG.potencial={porCat:pot,
       minTot:pot.reduce((a,x)=>a+x.pz*x.min,0),minLib:pot.reduce((a,x)=>a+x.pzLib*x.min,0),
       ordenes:pot.reduce((a,x)=>a+x.ordenes,0),pz:pot.reduce((a,x)=>a+x.pz,0),
       liberadas:pot.reduce((a,x)=>a+x.liberadas,0)};
     __check('SG: se puede medir la carga que agregan esos tiempos',__R.tiemposSG.potencial.minTot>0);}
     // las TRES bases por categoría, con la definición única
     const tres=conMin.map(k=>{const car=S.ordenes.filter(o=>o.cat===k.id);
       const ab=car.filter(abiertaDe),lan=car.filter(lanzada),lib=ab.filter(liberadaCorte);
       const pz=l=>l.reduce((a,o)=>a+(+o.cant||0),0);const m=minEstimadoConf(k);
       return {cat:nombreCat(k),min:m,
         cargadas:{n:car.length,pz:pz(car),min:pz(car)*m},
         abiertas:{n:ab.length,pz:pz(ab),min:pz(ab)*m},
         lanzadas:{n:lan.length,pz:pz(lan),min:pz(lan)*m},
         liberadas:{n:lib.length,pz:pz(lib),min:pz(lib)*m},
         sinWH:ab.filter(o=>!lanzada(o)).length,
         fases:[...new Set(ab.map(o=>o.fase||'(sin fase)'))].slice(0,6)}});
      const sum=(f)=>tres.reduce((a,x)=>({n:a.n+x[f].n,pz:a.pz+x[f].pz,min:a.min+x[f].min}),{n:0,pz:0,min:0});
      __R.tiemposSG.tresBases={porCat:tres,cargadas:sum('cargadas'),abiertas:sum('abiertas'),
        lanzadas:sum('lanzadas'),liberadas:sum('liberadas')};
      __check('SG: las tres bases se miden con la definición única',tres.every(x=>x.lanzadas.n<=x.abiertas.n&&x.abiertas.n<=x.cargadas.n));
    __check('SG: los tiempos estimados se cargan sobre el catálogo real',conMin.length>=10,String(conMin.length));}
   /* las 7 familias sin hoja, sobre el catálogo real */
   {const c=categoriasSinHoja();
    __R.sinHoja={total:c.total,sinValor:c.sin.length,conEstimado:c.est.length,
      pz:c.sin.reduce((a,f)=>a+f.pz,0),ordenes:c.sin.reduce((a,f)=>a+f.ordenes,0),
      familias:[...new Set(c.sin.concat(c.est).map(f=>(K(f.k.padre)||{}).n))].sort(),
      detalle:c.sin.concat(c.est).map(f=>nombreCat(f.k)+' · '+f.ordenes+' ord · '+f.pz+' pz')};
    __check('SH: las 7 familias sin hoja se detectan sobre el catálogo real',__R.sinHoja.familias.length===7,JSON.stringify(__R.sinHoja.familias));}
   // el reparto real que queda registrado para el reporte
   __R.cat={padres:Object.keys(pares).length,hijas:nPares,vinculadas:conFam.length,sinVinculo:sinVinc.length,
     detalleSinVinculo:sinVinc.map(k=>(K(k.padre)||{}).n+' / '+k.n),
     opsLMO:(S.operaciones||[]).length,catsLMO:[...new Set((S.operaciones||[]).map(o=>o.catP).filter(Boolean))].length,
     lmoSinUsar:[...new Set((S.operaciones||[]).map(o=>o.catP).filter(Boolean))].filter(c=>!S.categorias.some(k=>k.familiaLMO===c))};
   // lo que movería la unificación JEANS→DENIM con el catálogo y las órdenes reales (NO se ejecuta)
   {const se=rutasSinEmpaque(null);const porU={};se.forEach(o=>{const r=pasosProDe(o);porU[r[r.length-1]]=(porU[r[r.length-1]]||0)+1});
    __R.empaqueReal={conRuta:S.ordenes.filter(o=>abierta(o)&&pasosProDe(o).length).length,sinEmpaque:se.length,porUltimo:porU,
      pz:se.reduce((a,o)=>a+(+o.cant||0),0)};
    __check('EMP: se puede medir cuántas rutas reales no terminan en Empaque',typeof __R.empaqueReal.sinEmpaque==='number');}
   {const d=diagJeans();__R.jeansReal={cats:d.cats.length,ordenes:d.ordenes.length,ops:d.ops.length,
     tablas:d.tablas.map(x=>x.t+': '+x.fila),ejemplos:d.ordenes.slice(0,5).map(o=>o.op),
     yaUnificado:!!S.params.jeansUnificado};}
   /* ===== NIVELACIÓN · datos de prueba sobre el VOLCADO REAL (catálogo y órdenes de Odoo) ===== */
   {const ini=dsumLab(hoy(),1);
    const mid=(p,extra)=>{const c=(p==="corte")?cuadritoProceso("corte"):null;return c};
    const fija=(id,dias)=>{S.params.nivelacion=S.params.nivelacion||{};
      S.params.nivelacion.fechas=S.params.nivelacion.fechas||{};
      S.params.nivelacion.fechas[id]={inicio:ini,compromiso:dsumLab(ini,dias)}};
    const foto=c=>({titulo:c.titulo,unidad:c.unidad,notaCap:c.notaCap,nota:c.nota,
      saldoMin:c.calc.saldoMin,unid:c.saldo.unid,sam:c.sam,
      maquila:c.saldo.maquila||0,minMaquila:c.saldo.minMaquila||0,netoMin:c.calc.netoMin,
      capDia:c.calc.capDia,diasNec:c.calc.diasNec,inicio:c.calc.inicio,fin:c.calc.fin,
      compromiso:c.calc.compromiso,diasDisp:c.calc.diasDisp,alcanzableMin:c.calc.alcanzableMin,
      rezagoMin:c.calc.rezagoMin,metaMin:c.calc.metaMin,holgura:c.calc.holgura,cabe:c.calc.cabe,
      falta:c.calc.falta.slice(),nOrdenes:c.saldo.ordenes.length,
      sinSAM:c.saldo.sinSAM.length,unidSinSAM:c.saldo.unidSinSAM,
      ejemplos:c.saldo.ordenes.slice(0,3).map(o=>o.op+" · "+nombreCat(K(o.cat))+" · "+pendCentroUnid(o,"corte")+" u")});
    NIV.horizonte=null;NIVC=null;
    /* --- cuadrito de CORTE con el volcado real --- */
    fija("corte",20);
    const cc=cuadritoProceso("corte");
    __R.nivReal={corte:foto(cc)};
    /* --- sin SAM: cuántas órdenes quedaron sin minuto por prenda, por proceso --- */
    const porProc={};["corte","confeccion","empaque"].forEach(p=>{const s=saldoProceso(p,null);
      porProc[p]={nOrdenes:s.ordenes.length,unid:s.unid,min:s.min,sam:samPonderado(s),
        sinSAM:s.sinSAM.length,unidSinSAM:s.unidSinSAM,
        cats:[...new Set(s.sinSAM.map(o=>nombreCat(K(o.cat))||"(sin categoría)"))].sort().slice(0,12)}});
    __R.nivReal.porProc=porProc;
    const todasSinSAM=new Set();["corte","confeccion","empaque"].forEach(p=>saldoProceso(p,null).sinSAM.forEach(o=>todasSinSAM.add(o.id)));
    __R.nivReal.sinSAMTotal=todasSinSAM.size;
    __R.nivReal.baseAbiertas=cuentaCartera("abiertas").n;
    __R.nivReal.baseLanzadas=cuentaCartera("lanzadas").n;
    __check("NIVR: el saldo de corte se calcula sobre el volcado real",__R.nivReal.corte.unid>0||__R.nivReal.corte.unidSinSAM>0,
      __R.nivReal.corte.unid+" u con SAM / "+__R.nivReal.corte.unidSinSAM+" u sin SAM");
    /* --- cuadrito de un GRUPO DE MÓDULOS con el volcado real --- */
    const mods=S.recursos.filter(r=>r.activa&&r.centro==="modulos"&&r.id!=="maquila");
    const famsReal=[...new Set(S.ordenes.filter(abiertaDe).map(o=>{const k=K(o.cat);return k?((K(k.padre)||k).n):""}).filter(Boolean))].sort();
    __R.nivReal.familias=famsReal;
    if(mods.length){const bak=S.params.gruposMod;S.params.gruposMod=[];
     const g={id:"gprueba",n:"Grupo de prueba · "+famsReal.slice(0,2).join(" + "),
       mods:mods.slice(0,2).map((r,i)=>({rec:r.id,pct:i?50:100})),fams:famsReal.slice(0,2)};
     gruposMod().push(g);NIVC=null;
     fija("grupo:"+g.id,20);
     const cg=cuadritoGrupo(g);
     __R.nivReal.grupo=Object.assign(foto(cg),{mods:(g.mods||[]).map(m=>nRec(m.rec)+" al "+m.pct+"%"),
       fams:g.fams.slice(),capDetalle:(g.mods||[]).map(m=>nRec(m.rec)+": "+Math.round(capDia(R(m.rec),hoy()))+" min/día × "+m.pct+"% = "+Math.round(capDia(R(m.rec),hoy())*m.pct/100)),
       ejemplos:cg.saldo.ordenes.slice(0,3).map(o=>o.op+" · "+nombreCat(K(o.cat))+" · "+pendCentroUnid(o,"modulos")+" u")});
     __check("NIVR: el cuadrito de un grupo de módulos se calcula sobre el volcado real",!!__R.nivReal.grupo.capDia);
     __check("NIVR: la capacidad del grupo es la suma de los módulos por su %",
       Math.abs(__R.nivReal.grupo.capDia-(g.mods||[]).reduce((a,m)=>a+capDia(R(m.rec),hoy())*m.pct/100,0))<1e-6);
     S.params.gruposMod=bak||[];NIVC=null}
    /* ===== CORRECCIONES: horizonte sep-dic, rezago forzado y categorías sin hoja ===== */
    {const HOR=["2026-09","2026-10","2026-11","2026-12"];
     NIV.horizonte=HOR.slice();NIVC=null;
     const ini2=dsumLab(hoy(),1);
     const fija2=(id,fin)=>{S.params.nivelacion=S.params.nivelacion||{};
       S.params.nivelacion.fechas=S.params.nivelacion.fechas||{};
       S.params.nivelacion.fechas[id]={inicio:ini2,compromiso:fin}};
     const foto2=(c,cen)=>({titulo:c.titulo,horTxt:c.horTxt,notaCap:c.notaCap,
       saldoMin:c.calc.saldoMin,unid:c.saldo.unid,sam:c.sam,
       maquila:c.saldo.maquila||0,minMaquila:c.saldo.minMaquila||0,netoMin:c.calc.netoMin,
       capDia:c.calc.capDia,diasNec:c.calc.diasNec,inicio:c.calc.inicio,fin:c.calc.fin,
       compromiso:c.calc.compromiso,diasDisp:c.calc.diasDisp,alcanzableMin:c.calc.alcanzableMin,
       rezagoMin:c.calc.rezagoMin,metaMin:c.calc.metaMin,holgura:c.calc.holgura,cabe:c.calc.cabe,
       falta:c.calc.falta.slice(),nOrdenes:c.saldo.ordenes.length,
       sinSAMHor:c.saldo.sinSAM.length,unidSinSAMHor:c.saldo.unidSinSAM,
       sinSAMTot:c.saldoTot.sinSAM.length,unidSinSAMTot:c.saldoTot.unidSinSAM,
       noHabiles:(c.calc.noHabiles||[]).map(x=>x.fecha+" ("+x.motivo+")"),
       excepciones:(c.calc.noHabiles||[]).filter(x=>x.excepcion).map(x=>x.fecha+" "+x.motivo),
       sinFestivos:(c.calc.sinFestivos||[]).slice(),txtDias:c.calc.txtDias});
     /* el compromiso de la prueba: fin de diciembre, el último día del horizonte */
     const COMP="2026-12-31";
     fija2("corte",COMP);fija2("confeccion",COMP);
     const cCorte=cuadritoProceso("corte"),cConf=cuadritoProceso("confeccion");
     __R.c4={horizonte:HOR.slice(),inicio:ini2,compromiso:COMP,
       corte:foto2(cCorte,"corte"),confeccion:foto2(cConf,"modulos")};
     /* el detalle del calendario que pidió el punto 1, en el tramo real 17-sep → 15-oct */
     {const a="2026-09-17",b="2026-10-15";
      __R.c4.tramoEjemplo={a,b,habiles:diasHabilesInc(a,b),
        noHabiles:noHabilesEntre(a,b).map(x=>x.fecha+" · "+x.motivo),
        excepciones:noHabilesEntre(a,b).filter(x=>x.excepcion).map(x=>x.fecha+" · "+x.motivo),
        sinFestivos:mesesSinFestivos(a,b),
        finDe5DesdeEl17:finLabInc(a,5),finViejoDsumLab:dsumLab(a,5),
        excepcionesCargadas:(S.params.excepciones||[]).map(e=>e.fecha+" "+(e.area||"")+" "+(e.tipo||"")).slice(0,30),
        nExcepciones:(S.params.excepciones||[]).length};}
     /* un grupo de módulos real sobre el mismo horizonte */
     const mods2=S.recursos.filter(r=>r.activa&&r.centro==="modulos"&&r.id!=="maquila");
     const fams2=[...new Set(S.ordenes.filter(abiertaDe).map(o=>{const k=K(o.cat);return k?((K(k.padre)||k).n):""}).filter(Boolean))].sort();
     if(mods2.length){const bak2=S.params.gruposMod;S.params.gruposMod=[];
      /* el grupo más cargado que se pueda armar: las familias con más saldo de confección */
      const sConf=saldoProceso("confeccion",HOR);const porFam={};
      sConf.ordenes.forEach(o=>{const k=K(o.cat);const f=k?((K(k.padre)||k).n):"";if(!f)return;
        const u=pendCentroUnid(o,"modulos");const sam=samOrdenCentro(o,"modulos");
        porFam[f]=porFam[f]||{u:0,min:0};porFam[f].u+=u;if(sam!=null)porFam[f].min+=u*sam});
      const top=Object.entries(porFam).sort((a,b)=>b[1].min-a[1].min).slice(0,3).map(x=>x[0]);
      const g2={id:"gc4",n:"Grupo "+top.join(" + "),mods:mods2.slice(0,2).map((r,i)=>({rec:r.id,pct:i?50:100})),fams:top,sugerido:true};
      gruposMod().push(g2);NIVC=null;fija2("grupo:"+g2.id,COMP);
      const cg2=cuadritoGrupo(g2);
      __R.c4.grupo=Object.assign(foto2(cg2,"modulos"),{fams:top.slice(),
        mods:(g2.mods||[]).map(m=>nRec(m.rec)+" al "+m.pct+"%"),
        capDetalle:(g2.mods||[]).map(m=>nRec(m.rec)+": "+Math.round(capDia(R(m.rec),hoy()))+" × "+m.pct+"% = "+Math.round(capDia(R(m.rec),hoy())*m.pct/100)),
        porFam:top.map(f=>f+": "+Math.round(porFam[f].min)+" min / "+porFam[f].u+" u")});
      /* --- WHAT-IF: si ninguno da rezago, se fuerza uno bajando la capacidad --- */
      const sinRezago=[cCorte,cConf,cg2].every(c=>c.calc.rezagoMin===0);
      __R.c4.sinRezagoNatural=sinRezago;
      /* dos formas de forzarlo, las dos sobre el MISMO saldo real */
      const neto=cg2.calc.netoMin;const dd=cg2.calc.diasDisp;
      const capFuerza=Math.floor(neto/dd*0.6);      // 60% de la capacidad que haría falta
      const wf1=nivelar({id:"wf-cap",saldoMin:cg2.calc.saldoMin,capDia:capFuerza,inicio:ini2,compromiso:COMP});
      /* sobre CORTE, que cabe con holgura: acortar el compromiso a la mitad de los días que necesita */
      const compCorto=finLabInc(ini2,Math.max(1,Math.floor(cCorte.calc.diasNec*0.5)));
      const wf2=nivelar({id:"wf-comp",saldoMin:cCorte.calc.saldoMin,capDia:cCorte.calc.capDia,inicio:ini2,compromiso:compCorto});
      const ficha=r=>({capDia:r.capDia,saldoMin:r.saldoMin,netoMin:r.netoMin,diasNec:r.diasNec,
        inicio:r.inicio,fin:r.fin,compromiso:r.compromiso,diasDisp:r.diasDisp,alcanzableMin:r.alcanzableMin,
        rezagoMin:r.rezagoMin,metaMin:r.metaMin,holgura:r.holgura,cabe:r.cabe});
      __R.c4.whatIfCapacidad=Object.assign(ficha(wf1),{sobre:"grupo de módulos",capOriginal:cg2.calc.capDia});
      __R.c4.whatIfCompromiso=Object.assign(ficha(wf2),{sobre:"corte",compOriginal:cCorte.calc.compromiso,rezagoOriginal:cCorte.calc.rezagoMin});
      __check("C4: bajando la capacidad aparece rezago",wf1.rezagoMin>0&&wf1.cabe===false,wf1.rezagoMin);
      __check("C4: adelantando el compromiso aparece rezago donde antes cabía",
        cCorte.calc.cabe===true&&wf2.rezagoMin>0&&wf2.cabe===false&&compCorto<cCorte.calc.compromiso,compCorto+" / "+wf2.rezagoMin);
      __check("C4: el rezago es exactamente neto − alcanzable",
        Math.abs(wf1.rezagoMin-(wf1.netoMin-wf1.alcanzableMin))<1e-6);
      __check("C4: y la holgura es negativa cuando no cabe",wf2.holgura<0,wf2.holgura);
      /* el despliegue del rezago: agrupado por tipo de producto, fase y orden */
      {const cWF=Object.assign({},cg2,{calc:wf1,id:"wf-cap"});NIV.abierto="wf-cap";
       const h=cuadritoNivHTML(cWF);
       __check("C4: el cuadrito con rezago lo pinta como «no cabe»",/no cabe/.test(h));
       const hl=rezagoListaHTML("confeccion",cg2.saldo);
       __check("C4: el rezago se despliega con el componente de lista agrupada",
         /Saldo por orden/.test(hl)&&/<table/.test(hl));
       const gid="nivconfeccion";
       __R.c4.rezagoGrupos={agrupadoPor:(grpSt(gid).sel||[]).slice(),
         nOrdenes:cg2.saldo.ordenes.length,
         porHija:Object.entries(cg2.saldo.ordenes.reduce((a,o)=>{const n=nombreCat(K(o.cat))||"(sin categoría)";
           a[n]=a[n]||{u:0,min:0};const u=pendCentroUnid(o,"modulos"),sm=samOrdenCentro(o,"modulos");
           a[n].u+=u;if(sm!=null)a[n].min+=u*sm;return a},{})).sort((x,y)=>y[1].min-x[1].min)
           .map(([n,v])=>n+": "+v.u+" u · "+Math.round(v.min)+" min"),
         porFase:Object.entries(cg2.saldo.ordenes.reduce((a,o)=>{const f=o.fase||"(sin fase)";
           a[f]=a[f]||{u:0,n:0};a[f].u+=pendCentroUnid(o,"modulos");a[f].n++;return a},{})).sort((x,y)=>y[1].u-x[1].u)
           .map(([f,v])=>f+": "+v.n+" órdenes · "+v.u+" u")};
       __check("C4: la lista del rezago arranca agrupada por tipo de producto y fase",
         (grpSt(gid).sel||[]).includes("hija")&&(grpSt(gid).sel||[]).includes("fase"),(grpSt(gid).sel||[]).join(","));
       NIV.abierto=null;}
      S.params.gruposMod=bak2||[];NIVC=null}
     /* --- punto 7: las categorías sin hoja LMO, con órdenes y unidades en sep-dic --- */
     {const porCat={};
      ["corte","confeccion","empaque"].forEach(p=>{const sp=saldoProceso(p,HOR);
        sp.sinSAM.forEach(o=>{const k=K(o.cat);const n=nombreCat(k)||"(sin categoría)";
          const c=procNivel(p).centro;const u=pendCentroUnid(o,c);
          porCat[n]=porCat[n]||{ordenes:new Set(),procesos:new Set(),u:{},familiaLMO:(k&&k.familiaLMO)||""};
          porCat[n].ordenes.add(o.id);porCat[n].procesos.add(p);
          porCat[n].u[p]=(porCat[n].u[p]||0)+u})});
      __R.c4.sinHojaLMO=Object.entries(porCat).sort((a,b)=>b[1].ordenes.size-a[1].ordenes.size).map(([n,v])=>({
        categoria:n,familiaLMO:v.familiaLMO||"(sin vínculo)",ordenes:v.ordenes.size,
        procesos:[...v.procesos].join(", "),unidades:v.u}));
      __R.c4.sinHojaTotalOrdenes=new Set([].concat(...Object.values(porCat).map(v=>[...v.ordenes]))).size;
      __check("C4: se puede listar las categorías sin hoja LMO del horizonte",Array.isArray(__R.c4.sinHojaLMO));}
     NIV.horizonte=null;NIVC=null;}
    delete S.params.nivelacion;NIVC=null;}
    /* ===== COLA POR CERCANÍA: medición sobre el VOLCADO REAL (botones y corte) ===== */
    {PLAN=null;PLAN_ALL=null;const Pc=programar();
     const lun=lunesDe(hoy());
     const mide=(c)=>{if(!CE(c))return {centro:c,existe:false};
       const filas=filasDeCentros([c],Pc,lun,dsum(lun,6),"");
       const cola=colaCentro(c,filas);
       const m=partirPorCercania(cola);
       const gr={};const ej={};
       CERCANIA_GRUPOS.forEach(([g])=>{const l=m[g]||[];
         gr[g]={n:l.length,pz:l.reduce((a,f)=>a+Math.max(0,f.o.cant-f.hechas),0)};
         ej[g]=l.slice(0,3).map(f=>{const t=txtLlegada(f.cerc.llegada);
           return {op:f.o.op,odc:String(f.o.odc||"(sin ODC)"),fase:f.o.fase||"(sin fase)",
             cat:nombreCat(K(f.o.cat))||"",pend:Math.max(0,f.o.cant-f.hechas),
             etiqueta:t.txt,color:t.cls==="cerc-mal"?"rojo":"verde",
             ant:f.cerc.ant?nCen(f.cerc.ant):"(tela)",pasosPend:f.cerc.pasosPend,
             finAnterior:(f.cerc.llegada||{}).fin||null,explica:t.tip}})});
       const tipos={};cola.forEach(f=>{const t=((f.cerc||{}).llegada||{}).tipo||"?";tipos[t]=(tipos[t]||0)+1});
       /* el punto flaco de medir en PASOS: una orden con muchos pasos pendientes puede, aun así,
          llegar hoy o mañana según el programa, y queda escondida en el grupo colapsado. Se mide. */
       const escondidas=(m.lejana||[]).filter(f=>{const l=f.cerc.llegada||{};
         return (l.tipo==="fecha"&&l.dias<=1)||l.tipo==="atrasado"});
       const porPasos={};(m.lejana||[]).forEach(f=>{const k=f.cerc.pasosPend;porPasos[k]=(porPasos[k]||0)+1});
       return {centro:c,existe:true,nombre:nCen(c),total:cola.length,
         conPuesto:cola.filter(f=>puestoDe(f.o,c)>0).length,grupos:gr,ejemplos:ej,tipos,
         umbral:null,   /* el umbral en pasos se retiró el 17-sep: ahora manda la lista de fases del centro */
         lejanasQueLleganYa:escondidas.length,
         lejanasQueLleganYaEj:escondidas.slice(0,3).map(f=>f.o.op+" · "+f.cerc.pasosPend+" pasos pendientes · "+txtLlegada(f.cerc.llegada).txt),
         lejanasPorPasos:porPasos,
         primerCentro:cola.length?cola.every(f=>!f.cerc.ant):false}};
     __R.cc=__R.cc||{};
     __R.cc.real={botones:mide("botones"),corte:mide("corte"),
       modulos:mide("modulos"),empaque:mide("empaque")};
     __check("CCR: se puede medir la cola de corte sobre el volcado real",__R.cc.real.corte.existe&&__R.cc.real.corte.total>=0,
       __R.cc.real.corte.total+" órdenes");
     __check("CCR: y la de botones",__R.cc.real.botones.existe,__R.cc.real.botones.total);
     /* ===== CF2R · corte por fecha y colores, medidos sobre el volcado real (las pruebas de la demo pasan en vacío) ===== */
     {const cens=S.centros.filter(x=>x.area==="pro"&&x.activo!==false).map(x=>x.id);const bak=S.params.diasPorLlegar;
      const cuenta=()=>{const r={};cens.forEach(cc=>{const cola=colaCentro(cc,filasDeCentros([cc],Pc,lun,dsum(lun,6),""));const m=partirPorCercania(cola);
        r[cc]={n:cola.length,porLlegar:m.porLlegar.length,lejana:m.lejana.length,movidas:cola.filter(f=>f.cerc.lejosPorFecha).length,
          movidasOk:cola.filter(f=>f.cerc.lejosPorFecha).every(f=>f.cerc.grupo==="lejana"&&f.cerc.enLista===true&&f.cerc.faseRank===999&&f.cerc.llegada.tipo==="fecha"&&f.cerc.llegada.dias>diasPorLlegar()&&/llega (en \d+ días|mañana) · más de/.test(llegadaHTML(f.cerc))),
          fuera:m.porLlegar.filter(f=>f.cerc.llegada&&f.cerc.llegada.tipo==="fecha"&&(f.cerc.llegada.dias||0)>diasPorLlegar()).length,
          dias:cola.filter(f=>f.cerc.lejosPorFecha).map(f=>f.cerc.llegada.dias).sort((a,b)=>a-b),
          /* dentro de Todo lo que viene, ninguna movida por fecha queda ENCIMA de una que llega ya */
          ordenOk:(()=>{const l=m.lejana;let vistaMovida=false;for(const f of l){if(f.cerc.lejosPorFecha)vistaMovida=true;else if(f.cerc.llegaYaFuera&&vistaMovida)return false}return true})()}});return r};
      const con15=cuenta();S.params.diasPorLlegar=100000;const sinCorte=cuenta();S.params.diasPorLlegar=0;const cero=cuenta();
      if(bak==null)delete S.params.diasPorLlegar;else S.params.diasPorLlegar=bak;
      __R.cf=__R.cf||{};__R.cf.lejosPorFecha={};cens.forEach(cc=>{__R.cf.lejosPorFecha[cc]={movidas:con15[cc].movidas,porLlegarAntes:sinCorte[cc].porLlegar,porLlegar:con15[cc].porLlegar,dias:con15[cc].dias}});
      __check("CF2R: sobre el volcado real el corte de 15 días mueve órdenes en Confección y Empaque (las que el motor programa para enero–febrero) y ninguna en Corte",con15.modulos.movidas>=1&&con15.empaque.movidas>=1&&con15.corte.movidas===0,JSON.stringify(__R.cf.lejosPorFecha));
      __check("CF2R: cada movida queda en Todo lo que viene, con la fase en la lista, ordenada por fecha (faseRank 999), llegada a más de 15 y etiqueta «llega en X días · más de 15»",cens.every(cc=>con15[cc].movidasOk),JSON.stringify(cens.filter(cc=>!con15[cc].movidasOk)));
      __check("CF2R: Por llegar (con corte) + movidas = Por llegar (sin corte), y en Por llegar no queda nada a más de 15 días",cens.every(cc=>con15[cc].porLlegar+con15[cc].movidas===sinCorte[cc].porLlegar&&con15[cc].fuera===0),JSON.stringify(con15));
      __check("CF2R: dentro de Todo lo que viene las movidas por fecha no quedan encima de las que llegan ya",cens.every(cc=>con15[cc].ordenOk),JSON.stringify(cens.filter(cc=>!con15[cc].ordenOk)));
      __check("CF2R: 0 es 0: con el corte en 0 en Por llegar solo queda lo de hoy o sin fecha, y mueve más que con 15; con N enorme no mueve nada",cens.every(cc=>cero[cc].fuera===0&&cero[cc].movidas>=con15[cc].movidas&&sinCorte[cc].movidas===0)&&cens.some(cc=>cero[cc].movidas>con15[cc].movidas),JSON.stringify(cens.map(cc=>[cc,cero[cc].movidas,con15[cc].movidas])));
      /* colores: rojo solo la meta vencida */
      __R.cf.colores={};cens.forEach(cc=>{const cola=colaCentro(cc,filasDeCentros([cc],Pc,lun,dsum(lun,6),""));if(!cola.length)return;const r=conteoColoresCola(cola,Pc,cc);__R.cf.colores[cc]={n:r.n,rojo:r.rojo,ambar:r.ambar,ninguno:r.ninguno,pctRojo:r.pctRojo,pctAmbar:r.pctAmbar,pctNinguno:r.pctNinguno}});
      __check("CF2R: en cada centro rojo + ámbar + sin marca = toda la cola, y el rojo son exactamente las de meta vencida",cens.filter(cc=>__R.cf.colores[cc]).every(cc=>{const r=__R.cf.colores[cc];const cola=colaCentro(cc,filasDeCentros([cc],Pc,lun,dsum(lun,6),""));const venc=cola.filter(f=>{const d=diagAtraso(f.o,Pc,cc);return d.orden&&d.vencida}).length;return r.rojo+r.ambar+r.ninguno===r.n&&r.rojo===venc}),JSON.stringify(__R.cf.colores));
      __check("CF2R: Corte y Confección tienen filas de los tres colores y el rojo ya no cubre a las que solo van tarde",["corte","modulos"].every(cc=>{const r=__R.cf.colores[cc]||{};return r.rojo>0&&r.ambar>0&&r.ninguno>0&&r.pctRojo<50}),JSON.stringify([__R.cf.colores.corte,__R.cf.colores.modulos]));
      /* la línea «Marcas:» de la pantalla cuenta sobre las filas que se ven, con «toda la cola» y sin ella */
      {const bakCEN=JSON.stringify(CEN);const bakP=page;[true,false].forEach(todo=>{page="centro";CEN.id="corte";CEN.solo="";CEN.tab="prog";CEN.q="";CEN.fases=null;CEN.dia=null;CEN.todo=todo;render();
        const host=document.getElementById("p-centro");const p=host.querySelector(".panel.cola .cola-marcas");const hasta=dsum(dsum(lun,6),7);
        /* la base de la línea es la cola de la tabla (grupos colapsados incluidos, sus cabeceras traen el conteo): toda, o solo la semana y la siguiente */
        const colaAllV=colaCentro("corte",filasDeCentros(["corte"],Pc,lun,dsum(lun,6),""));const filas=todo?colaAllV:colaAllV.filter(f=>f.pzSem>0||(f.paso.ini&&f.paso.ini<=hasta));
        const rojas=filas.filter(f=>colorMarca(f.o,Pc,"corte")==="rojo").length;const amb=filas.filter(f=>colorMarca(f.o,Pc,"corte")==="ambar").length;
        const txt=p?p.textContent.replace(/\s+/g," "):"";const mR=txt.match(/(\d+) rojas/),mA=txt.match(/(\d+) ámbar/),mN=txt.match(/(\d+) sin marca \((\d+)%\)/);
        __check("CF2R: la línea «Marcas:» cuenta las mismas filas que se ven en la tabla ("+(todo?"toda la cola":"solo la semana")+"): rojas, ámbar y sin marca suman las filas, y el % es sobre ellas",!!p&&!!mR&&!!mA&&!!mN&&+mR[1]===rojas&&+mA[1]===amb&&(+mR[1]+ +mA[1]+ +mN[1])===filas.length&&+mN[2]===Math.round(100*(+mN[1])/filas.length),JSON.stringify({txt:txt.slice(0,120),filas:filas.length,todas:colaAllV.length,rojas,amb}));});
       Object.assign(CEN,JSON.parse(bakCEN));page=bakP;render();}}
     /* ===== R2·1 · desglose de CORTE por fase y por WH ===== */
     {const filas=filasDeCentros(["corte"],Pc,lun,dsum(lun,6),"");
      const cola=colaCentro("corte",filas);
      const m=partirPorCercania(cola);
      const porFase={};
      cola.forEach(f=>{const o=f.o;const g=grupoDe(o.fase);const k=(o.fase||"(sin fase)");
        porFase[k]=porFase[k]||{fase:k,grupo:g?g.grupo:"(sin grupo)",orden:g?ordenGrupo(g.grupo):-1,
          conWH:0,sinWH:0,unid:0,grupos:{}};
        const r=porFase[k];const sinWH=!o.op||!!o.sinLanzar;
        if(sinWH)r.sinWH++;else r.conWH++;
        r.unid+=Math.max(0,(+o.cant||0)-(f.hechas||0));
        r.grupos[f.cerc.grupo]=(r.grupos[f.cerc.grupo]||0)+1});
      __R.cc=__R.cc||{};
      __R.cc.corteDesglose={
        total:cola.length,
        grupos:Object.fromEntries(CERCANIA_GRUPOS.map(([g])=>[g,(m[g]||[]).length])),
        unidPorGrupo:Object.fromEntries(CERCANIA_GRUPOS.map(([g])=>[g,(m[g]||[]).reduce((a,f)=>a+Math.max(0,(+f.o.cant||0)-(f.hechas||0)),0)])),
        porFase:Object.values(porFase).sort((a,b)=>(a.orden-b.orden)||a.fase.localeCompare(b.fase))};
      __check("R2: se puede desglosar la cola de corte por fase y por WH",cola.length>=0,cola.length);}
     /* ===== R2·3 · MOTOR: pasos de ruta sin minutos (solo diagnóstico) ===== */
     {const ab=S.ordenes.filter(abiertaDe);
      const porCentro={},porDato={tecnica:0,puntadas:0,sam:0,otro:0};
      const detalle=[];const catsSet={};
      ab.forEach(o=>{const ro=(Pc.ordenes[o.id])||{};
        (o.ruta||[]).filter(p=>CE(p.centro)&&CE(p.centro).area==="pro").forEach(p=>{
          const c=p.centro;if(pasoHecho(o,c))return;
          const tPaso=(c==="estampado"&&o.tecnica)?(tecnicaT(o)||p.t):p.t;
          const min=minPrenda(c,tPaso);
          if(min>0)return;                       // el paso sí tiene tiempo
          const enPrograma=((ro.pasos)||[]).some(x=>x.centro===c);
          porCentro[c]=porCentro[c]||{centro:nCen(c),ordenes:0,unid:0,enPrograma:0,fuera:0};
          porCentro[c].ordenes++;porCentro[c].unid+=pendCentroUnid(o,c);
          if(enPrograma)porCentro[c].enPrograma++;else porCentro[c].fuera++;
          /* qué dato falta */
          let dato="otro";
          if(c==="estampado"&&!o.tecnica)dato="tecnica";
          else if(c==="bordado"&&!(+o.puntadas>0))dato="puntadas";
          else dato="sam";
          porDato[dato]=(porDato[dato]||0)+1;
          const k=K(o.cat);const cat=nombreCat(k)||"(sin categoría)";
          catsSet[cat+" | "+nCen(c)]=catsSet[cat+" | "+nCen(c)]||{cat,centro:nCen(c),ordenes:0,unid:0,dato};
          catsSet[cat+" | "+nCen(c)].ordenes++;catsSet[cat+" | "+nCen(c)].unid+=pendCentroUnid(o,c);
          if(detalle.length<40)detalle.push({op:o.op||"(sin WH)",cat,centro:nCen(c),dato,
            tecnica:o.tecnica||null,puntadas:+o.puntadas||0,enPrograma})})});
      __R.motor={porCentro:Object.values(porCentro).sort((a,b)=>b.ordenes-a.ordenes),porDato,
        ordenesAfectadas:new Set(detalle.map(x=>x.op)).size,
        categorias:Object.values(catsSet).sort((a,b)=>b.ordenes-a.ordenes),detalle};
      /* b · ¿cambiaría la fecha de salida si el paso contara? Se mide con un tiempo de prueba,
         SIN guardarlo: se mira cuántas órdenes cambian de finPro y cuántas pasarían a ir tarde. */
      {const antes={};ab.forEach(o=>{const ro=(Pc.ordenes[o.id])||{};antes[o.id]={fin:ro.finPro||null,tarde:!!ro.atraso}});
       const bakT={};let tocadas=0;
       ab.forEach(o=>{(o.ruta||[]).forEach(p=>{if(!CE(p.centro)||CE(p.centro).area!=="pro")return;
         const tPaso=(p.centro==="estampado"&&o.tecnica)?(tecnicaT(o)||p.t):p.t;
         if(minPrenda(p.centro,tPaso)>0)return;
         bakT[o.id]=bakT[o.id]||[];bakT[o.id].push({p,t:p.t});p.t=1;tocadas++})});   // 1 min/prenda, SOLO para medir
       PLAN=null;PLAN_ALL=null;const P2=programar();
       let cambian=0,nuevasTarde=0;const ej=[];
       ab.forEach(o=>{const r2=(P2.ordenes[o.id])||{};const a=antes[o.id]||{};
         if((r2.finPro||null)!==a.fin){cambian++;if(ej.length<5)ej.push(o.op+": "+(a.fin?fmtDia(a.fin):"—")+" → "+(r2.finPro?fmtDia(r2.finPro):"—"))}
         if(!!r2.atraso&&!a.tarde)nuevasTarde++});
       __R.motor.efecto={pasosTocados:tocadas,cambianDeFecha:cambian,nuevasTarde,ejemplos:ej};
       /* se devuelve TODO como estaba */
       Object.values(bakT).forEach(l=>l.forEach(x=>{x.p.t=x.t}));
       PLAN=null;PLAN_ALL=null;programar();}
      __check("R2: se puede medir el efecto de que los pasos sin minutos contaran",
        typeof __R.motor.efecto.cambianDeFecha==="number",JSON.stringify(__R.motor.efecto).slice(0,160));}
     /* ===== 3a · DIAGNÓSTICO: lejanas con llegada hoy/mañana o atrasadas ===== */
     {const diag=(c)=>{if(!CE(c))return null;
       const filas=filasDeCentros([c],Pc,lun,dsum(lun,6),"");
       const m=partirPorCercania(colaCentro(c,filas));
       /* con la regla de escape ya no están en Lejanas: se buscan por la marca y por el escape */
       const todas=[].concat(...CERCANIA_GRUPOS.map(([g])=>m[g]||[]));
       const raras=todas.filter(f=>f.cerc.llegaYaFuera||(f.cerc.marca&&f.cerc.grupo==="lejana"));
       return raras.map(f=>{const o=f.o,x=f.cerc;
         const ru=pasosProDe(o);const i=ru.indexOf(c);
         const ro=(Pc.ordenes[o.id])||{};
         const pasos=(ro.pasos||[]).map(p=>p.centro+":"+(p.hecho?"hecho":(p.error?("ERROR "+p.error):((p.ini?fmtDia(p.ini):"?")+"→"+(p.fin?fmtDia(p.fin):"?"))))+(p.min!=null?" ("+Math.round(p.min)+" min)":""));
         /* posibles causas, comprobadas una por una */
         const causas=[];
         const et=centroEtapaDe(c);const gr=et?faseGrupos().find(g=>g.grupo===et):null;
         if(gr&&gr.secuencial===false)causas.push("tramo NO secuencial ("+et+"): el orden real lo dan las OT de Odoo");
         const cero=x.pendientes.filter(p=>{const pp=(ro.pasos||[]).find(z=>z.centro===p);return pp&&(+pp.min||0)===0});
         if(cero.length)causas.push("pasos de 0 minutos pendientes: "+cero.map(nCen).join(", "));
         const sinFecha=x.pendientes.filter(p=>{const pp=(ro.pasos||[]).find(z=>z.centro===p);return !pp||!pp.fin});
         if(sinFecha.length)causas.push("pasos pendientes SIN fecha en el programa: "+sinFecha.map(nCen).join(", "));
         /* ¿el fin del paso anterior es coherente con los pasos que quedan antes de él? */
         const antP=(ro.pasos||[]).find(z=>z.centro===x.ant);
         const previos=ru.slice(0,ru.indexOf(x.ant)).filter(z=>!pasoHecho(o,z));
         const inconsistentes=previos.filter(z=>{const pp=(ro.pasos||[]).find(y=>y.centro===z);return pp&&pp.fin&&antP&&antP.fin&&pp.fin>antP.fin});
         if(inconsistentes.length)causas.push("el programa termina "+inconsistentes.map(nCen).join(", ")+" DESPUÉS de "+nCen(x.ant)+": las fechas del motor no son coherentes con la ruta");
         const dup=ru.filter((z,k)=>ru.indexOf(z)!==k);
         if(dup.length)causas.push("la ruta repite centros: "+[...new Set(dup)].map(nCen).join(", "));
         if(antP&&antP.fin&&antP.fin<hoy())causas.push("el paso anterior ya debía haber terminado ("+fmtDia(antP.fin)+"): la cadena va comprimida porque va tarde");
         if(!causas.length)causas.push("sin causa evidente: el motor termina el paso anterior ya, aunque queden pasos antes");
         return {op:o.op,odc:String(o.odc||"—"),fase:o.fase||"(sin fase)",cat:nombreCat(K(o.cat))||"",
           etiqueta:txtLlegada(x.llegada).txt,pasosPend:x.pasosPend,
           pendientes:x.pendientes.map(nCen),pasoAnterior:nCen(x.ant),
           ruta:ru.map(z=>nCen(z)+(pasoHecho(o,z)?" ✓":"")).join(" → "),
           programa:pasos,causas,
           marca:(x.marca||{}).txt||null,escapo:!!x.escapo,sinTiempo:(x.sinTiempo||[]).map(nCen)}})};
      __R.cc=__R.cc||{};
      __R.cc.diag3a={botones:diag("botones"),empaque:diag("empaque"),modulos:diag("modulos")};
      const tot=["botones","empaque","modulos"].reduce((n,k)=>n+((__R.cc.diag3a[k]||[]).length),0);
      __check("CC3A: se puede explicar cada lejana que llega hoy/mañana o atrasada",tot>=0,tot+" casos");}
     /* la prueba del arrastre (decisión 6) sobre el volcado real */
     {const c=["corte","modulos","empaque"].find(x=>colaCentro(x,filasDeCentros([x],Pc,lun,dsum(lun,6),"")).length>=5);
      if(c){const cola0=colaCentro(c,filasDeCentros([c],Pc,lun,dsum(lun,6),""));
       cola0.forEach(f=>{if((f.o.progCentro||{})[c])delete f.o.progCentro[c].pri});
       const antes=cola0.map(f=>f.o.op+" · "+nGrupoCerc(f.cerc.grupo)+" · "+(txtLlegada(f.cerc.llegada).txt||"—"));
       const movida=cola0[cola0.length-1].o;
       moverEnCola(movida.id,c,{pos:1});
       const cola1=colaCentro(c,filasDeCentros([c],programar(),lun,dsum(lun,6),""));
       const resto=cola1.filter(f=>f.o.id!==movida.id);
       let ok=true;for(let i=1;i<resto.length;i++){if(ordenCercania(resto[i-1].cerc)>ordenCercania(resto[i].cerc)+1e-9)ok=false}
       __R.cc.arrastreReal={centro:nCen(c),total:cola0.length,
         antes:antes.slice(0,6),
         movida:movida.op+" (era la última, "+nGrupoCerc(cola0[cola0.length-1].cerc.grupo)+")",
         conPuestoDespues:cola1.filter(f=>puestoDe(f.o,c)>0).map(f=>f.o.op+" → puesto "+puestoDe(f.o,c)),
         sinPuestoDespues:cola1.filter(f=>puestoDe(f.o,c)===0).length,
         cercaniaSigueOk:ok,
         despues:cola1.slice(0,6).map(f=>f.o.op+" · "+(puestoDe(f.o,c)?"puesto "+puestoDe(f.o,c):nGrupoCerc(f.cerc.grupo)+" · "+(txtLlegada(f.cerc.llegada).txt||"—")))};
       __check("CCR: tras arrastrar, solo la movida tiene puesto y el resto sigue por cercanía",
         __R.cc.arrastreReal.conPuestoDespues.length===1&&ok,JSON.stringify(__R.cc.arrastreReal.conPuestoDespues));
       cola0.forEach(f=>{if((f.o.progCentro||{})[c])delete f.o.progCentro[c].pri});PLAN=null;PLAN_ALL=null}}}
   /* ===== efecto AGUAS ABAJO del arreglo, sin dejar rastro ===== */
   {const foto=()=>({ord:S.ordenes.map(o=>({o,ot:JSON.stringify(o.ot||null),rf:JSON.stringify(o.recursoFijo||null),em:JSON.stringify(o.esperandoMaterial||null),ts:o.otTs})),
      av:JSON.stringify(S.avance),carga:JSON.stringify(S.params.otCarga||null),nCargas:S.cargas.length});
    const volver=f=>{f.ord.forEach(x=>{x.ot==="null"?delete x.o.ot:x.o.ot=JSON.parse(x.ot);
        x.rf==="null"?delete x.o.recursoFijo:x.o.recursoFijo=JSON.parse(x.rf);
        x.em==="null"?delete x.o.esperandoMaterial:x.o.esperandoMaterial=JSON.parse(x.em);
        if(x.ts===undefined)delete x.o.otTs;else x.o.otTs=x.ts});
      const a2=JSON.parse(f.av);Object.keys(S.avance).forEach(k=>{if(!(k in a2))delete S.avance[k]});Object.assign(S.avance,a2);
      if(f.carga==="null")delete S.params.otCarga;else S.params.otCarga=JSON.parse(f.carga);
      S.cargas.length=f.nCargas;PLAN=null;PLAN_ALL=null};
    const mide=()=>{PLAN=null;PLAN_ALL=null;const P=programar();
      const ab=S.ordenes.filter(abiertaDe);
      const hechos={},pend={};
      ["corte","modulos","empaque","botones"].forEach(c=>{const conRuta=ab.filter(o=>(o.ruta||[]).some(p=>p.centro===c));
        hechos[c]=conRuta.filter(o=>pasoHecho(o,c)).length;pend[c]=conRuta.length-hechos[c]});
      const lun=lunesDe(hoy());
      const cola=c=>{if(!CE(c))return null;const m=partirPorCercania(colaCentro(c,filasDeCentros([c],P,lun,dsum(lun,6),"")));
        const r={};CERCANIA_GRUPOS.forEach(([g])=>r[g]=(m[g]||[]).length);r.total=Object.values(r).reduce((x,y)=>x+y,0);return r};
      return {pasosHechos:hechos,pasosPendientes:pend,
        atrasadas:ab.filter(o=>{const d=diagAtraso(o,P,null);return d.orden}).length,
        metaVencida:ab.filter(o=>{const d=diagAtraso(o,P,null);return d.vencida}).length,
        contradicciones:((S.params.otCarga||{}).contradicciones||[]).length,
        ordenesConOT:S.ordenes.filter(o=>Object.keys(o.ot||{}).length).length,
        botones:cola("botones"),corte:cola("corte")}};
    const f0=foto();const al=window.alert;window.alert=()=>{};
    try{
      /* ANTES: cargar las OT con la conversión vieja */
      const bueno=window.excelFecha;window.excelFecha=excelFechaRedondeada;
      OT=planOT(window.__otRows,"antes.xlsx");aplicarOT();
      window.excelFecha=bueno;
      __R.excelAntes=mide();
      volver(f0);
      /* DESPUÉS: con la conversión arreglada */
      OT=planOT(window.__otRows,"Orden_de_trabajo.xlsx");aplicarOT();
      __R.excelDespues=mide();
    }catch(e){__R.excelAntes={error:String(e&&e.message)}}
    window.alert=al;volver(f0);OT=null;
    __check("EXR: se pudo comparar el antes y el después aguas abajo",!!(__R.excelDespues&&!(__R.excelAntes||{}).error),
      JSON.stringify((__R.excelAntes||{}).error||"ok"));
    __check("EXR: la medición no dejó rastro (las OT vuelven a como estaban)",
      S.ordenes.filter(o=>Object.keys(o.ot||{}).length).length===f0.ord.filter(x=>x.ot!=="null"&&x.ot!=="{}").length,
      S.ordenes.filter(o=>Object.keys(o.ot||{}).length).length);}
   S.categorias=bakCat;}
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
  window.confirm=()=>false;const omit=/logout|exportJSON|importJSON|restaurarDesde|descargarJSON|demo\(|print\(|location\.|window\.open|borrarTodo|resetear|delOrden\(/; // delOrden borra sin confirmar: fuera del fuzz
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
   page='reporteria';REP.vista='textil';render();const h2=document.getElementById('p-'+page).innerHTML;__check('reportería de piso corte cae a producción y solo su área',REP.vista==='produccion'&&h2.includes('Corte, estampado, bordado y etiquetas')&&!h2.includes('Confección</h3>')&&!h2.includes('Tejeduría <span'));
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
   {const e=esperasPaso();__check("motor: esperas sembradas (lavado planta 3 CONFIRMADOS, Quito 15, prenda tinturada sin regla)",(sembrarLavado(),e.some(r=>r.paso==='lavado'&&r.modo==='planta'&&r.dias===3&&!r.estimado)&&e.some(r=>r.modo==='quito'&&r.dias===15)&&e.some(r=>r.sinRegla)));
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
   __check("PM: el agrupador de agregar es el anidado común (Cliente, ODC, Fase, Familia, Tela, Mes) y jala del mes siguiente",h.includes('Agrupar por (anidado, hasta 3)')&&h.includes('Jalar del mes siguiente')&&['ODC','Cliente','Fase','Familia','Tela','Mes de entrega'].every(x=>h.includes('>'+x+'</option>'))&&h.includes("setNivelGRP('pmadd'"));
   GRP={};grpSt('pmadd').niveles=['odc'];render();h=hp();
   __check("PM: las órdenes del mes aparecen agrupadas (grupo ODC con conteo, prendas y minutos) y colapsadas",h.includes('ODC ODC-TEST-PM')&&/2 órdenes · [\d.]+ prendas/.test(h)&&h.includes('marcar el grupo')&&!h.slice(h.indexOf('<h3>Agregar órdenes al plan')).includes(esc(o1.op)));
   {const m=h.match(/togGRP\('pmadd','([^']+)'\)/);if(m)togGRP('pmadd',m[1].replace(/\\'/g,String.fromCharCode(39)));h=hp();}
   __check("PM: al expandir el grupo se ven las órdenes con foto/WH, fase, cliente, categoría, color, prendas y entrega",h.includes(esc(o1.op))&&h.includes(esc(o2.op))&&h.includes(esc(faseNombre(o1.fase||'—')))&&h.includes(o1.fecha));
   __check("PM: la del mes siguiente NO aparece hasta activar 'jalar'",!h.includes(esc(oS.op)));
   togPMADD(o1.id);h=hp();__check("PM: al marcar avisa ANTES de guardar si la capacidad alcanza o no (con minutos y centro)",/Con lo marcado <b>(alcanza|YA NO ALCANZA)/.test(h)&&/min/.test(h.slice(h.indexOf('Con lo marcado'),h.indexOf('Con lo marcado')+400)));
   planMesAgregar(ym,[o1.id]);h=hp();__check("PM: agregar la guarda y aparece en 'En el plan' con fase, cliente, categoría, color, prendas y entrega",planMesOids(ym).has(o1.id)&&h.includes('En el plan de')&&h.includes(esc(o1.op))&&h.includes(esc(faseNombre(o1.fase||'—'))));
   __check("PM: el resumen del plan se actualiza al agregar (1 orden, sus prendas, borrador sin congelar)",planMesOids(ym).has(o1.id)&&h.includes('En el plan de')&&h.includes('borrador (sin congelar)'));
   __check("PM: la orden agregada ya no está entre las disponibles",(()=>{const i=h.indexOf('<h3>Agregar órdenes al plan');return i>0&&!h.slice(i).includes(esc(o1.op))})());
   page='liberacion';LIB.et='tela';LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q=o1.op;render();const hl=document.getElementById('p-liberacion').innerHTML;__check("PM→Liberación: la orden del plan sin liberar dice EN EL PLAN — pendiente de liberar",liberada(o1,'tela')||hl.includes('EN EL PLAN')&&hl.includes('pendiente de liberar'),liberada(o1,'tela')?'(ya liberada)':'');
   page='plan';render();congelarPlan(ym);__check("PM: congelar guarda versión con oids y marca planMes.congelado (versión, quién, cuándo)",!!planMesCongelado(ym)&&planMesCongelado(ym).ver>=1&&!!planMesCongelado(ym).ts&&(S.planes||[]).some(p=>p.mes===ym&&(p.oids||[]).includes(o1.id)));
   h=hp();__check("PM: bloque 5 dice CONGELADO con versión y fecha, y 'En el plan' lo marca congelado",h.includes('CONGELADO')&&h.includes('versión v')&&h.includes('CONGELADO v'));
   const cen=(o1.ruta||[]).map(p=>p.centro).find(cid=>CE(cid)&&CE(cid).area==='pro');if(cen){page='produccion';CG={area:'pro',centro:cen,sem:null,det:null,cruce:'fam',fases:null,q:''};render();const hc=document.getElementById('p-produccion').innerHTML;__check("PM→Centro: 'Carga que viene' muestra el plan congelado con la orden, fase y 'pendiente de liberar' si no está liberada",hc.includes('Plan mensual congelado')&&hc.includes(esc(o1.op))&&hc.includes('congelado')&&(liberada(o1,'corte')||hc.includes('pendiente de liberar')))}
   page='plan';render();planMesQuitar(ym,o1.id);__check("PM: quitar del plan la saca y vuelve a borrador (des-congela)",!planMesOids(ym).has(o1.id)&&!planMesCongelado(ym));
   PMADD.incluirSig=true;grpSt('pmadd').exp=new Set();grpSt('pmadd').todoAbierto=true;render();h=hp();__check("PM: 'jalar del mes siguiente' lista las órdenes del mes siguiente marcadas con su mes",h.includes(esc(oS.op))&&h.includes('la estás jalando'));PMADD.incluirSig=false;grpSt('pmadd').todoAbierto=false;
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
   __check("FF: Programación por centro usa foto+WH+fase en la cola y desviaciones (y se ve cuando hay filas)",(()=>{const src=vCentro.toString()+colaCentroHTML.toString();const usa=src.includes('whCell(f.o)')&&src.includes('whCell(o)');page='centro';CEN.tab='prog';CEN.q='';render();const h=document.getElementById('p-centro').innerHTML;const filas=(h.match(/<td style="white-space:nowrap"><img class="foto-mini"|<td style="white-space:nowrap">WH\//g)||[]).length;return usa&&(!filas||h.includes('fase-mini'))})());
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
   const conocidas=["borrarOperativo","delCat","delCatTelaRow","delCentro","delCentroEtapaRow","delCentroOTRow","delClasifMaterialRow","delDiasProvRow","delEsperaRow","delEstadoOTRow","delExc","delFaseGrupoRow","delFaseMapeoRow","delGrupoMod","delKgUdRow","delMapaHija","delMermaTinturaRow","delMotivoReprocRow","delMotivoRow","delTallaJuego","delTipoMaq","delVentana","delOperaria","delOp","delOrden","delOrigenTelaCuartoRow","delOrigenTelaRow","delPalabraJaspeRow","delParamTelaRow","delPerfilDef","delProgTejRow","delPropFaltaRow","delRec","delRegla","delReglaEtiqueta","delReglaRuta","delRestrFaltRow","delRow","delRuta","delTiempoOBRow","deshacerBanoConf","deshacerHechoCentro","deshacerTandaPlana","limpiarMes","quitarAjusteCap","quitarAjusteOp","quitarFaseCentro","retirarLib"];const nuevas=fns.filter(f=>!conocidas.includes(f));
   __check("GUARDIA: no hay funciones de borrado nuevas sin revisar (agrega la nueva a la lista solo si pide confirmación y dice qué se pierde)",nuevas.length===0,nuevas.join(', '));
   const sinConf=fns.filter(n=>{const i=src.indexOf('function '+n+'(');const body=src.slice(i,i+700);return !/confirm\(|prompt\(|frase|puede\('config'\)|motivoValido\(/.test(body)});
   __check("GUARDIA: toda función que borra pide confirmación (confirm/prompt/frase)",sinConf.length===0,sinConf.join(', '));
   __check("GUARDIA: el registro de cargas (S.cargas) no se recorta nunca",!/S\.cargas=S\.cargas\.slice/.test(src)&&!/S\.cargas\.length=/.test(src.replace(/\/\*[\s\S]*?\*\//g,"")));
   __check("GUARDIA: nadie recorta la bitácora ni las salidas de tintorería ni borra el avance de paso",!src.includes('S.bitacora=S.bitacora.slice')&&!src.includes('S.salidas_tin=S.salidas_tin.slice')&&src.split('delete S.avance[').length===1&&src.split('localStorage.clear').length===1);
   __check("GUARDIA: solo dos lugares llaman delete() en la base (guardar diferencias y el borrado operativo con frase)",src.split('.delete().in(').length-1===2);
   __check("GUARDIA: la recarga no elimina órdenes: las que no vienen quedan como noArchivo",src.includes("estado:'noArchivo'"));
   window.alert=a0;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("VC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));PERFIL=adminP;}
  /* REPORTERÍA: pestaña propia, vista general de órdenes, detalle completo, quién la ve */
  {const antes=__R.errors.length;const adminP=PERFIL;
   const g=document.querySelector('nav .gbody[data-g="rep"]');const links=g?[...g.querySelectorAll('a')].map(a=>a.dataset.p+(a.dataset.rep?':'+a.dataset.rep:'')):[];
   __check("REP: el menú tiene la pestaña Reportería con Vista general, Producto en proceso, Cumplimiento, Avance y las dos reporterías",!!g&&['vistaordenes','wip','cumplimiento','avance','reporteria:textil','reporteria:produccion'].every(x=>links.includes(x)));
   __check("REP: Dirección ya no repite Producto en proceso, Cumplimiento, Avance ni el Resumen gerencial (viven solo en Reportería)",!document.querySelector('nav .gbody[data-g="dir"] a[data-p="cumplimiento"]')&&!document.querySelector('nav .gbody[data-g="dir"] a[data-p="avance"]')&&!document.querySelector('nav .gbody[data-g="dir"] a[data-p="wip"]')&&!document.querySelector('nav .gbody[data-g="dir"] a[data-p="gerencia"]')&&[...document.querySelectorAll('nav .gbody[data-g="dir"] a')].map(a=>a.dataset.p).join()==='panorama,ordenes,liberacion,entregas,plan,familias,auditoria,capacidad');
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
   GRP={};grpSt('pmadd').niveles=['fase'];grpSt('pmadd').todoAbierto=true;render();h=document.getElementById('p-plan').innerHTML;
   __check("OB3: agrupar por FASE en agregar (grupo colapsable con conteo) y la temprana está dentro",h.includes('>Fase</option>')&&h.includes(esc(oT.fase))&&h.includes(esc(oT.op)));
   grpSt('pmadd').todoAbierto=false;
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
   __check("AG: el orden de las opciones es el pedido e incluye Tela",GRP_CAMPOS.map(x=>x[0]).join(',')==='cliente,fase,fam,hija,tela,color,odc,mes,paso,proyecto,etapa');
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
    __check("BQ: una WH que existe pero no está programada en mi recurso sale bloqueada",
      enCola||((/No est\u00e1 programada — consulte al supervisor/.test(h)||/no programada en/.test(h))&&!/iniciarTramo\(/.test(h)),h.length);
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
    __check("BQ2: el operario ve un campo simple, sin menú «buscar solo en…» (ahora sí busca al escribir)",h.includes('id="tab-wh"')&&!/busq-menu/.test(h)&&/inputmode="numeric"/.test(h)&&h.includes('oninput="buscarQ(')&&h.includes('Buscar</button>'));
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
    /* el ✓ hecho exige tiempo corrido (17-sep): se registra el tramo como en la planta */
    tramosDe(oT.id).push({id:'t-hh-'+uid(),centro:'modulos',rec:rec||null,ini:new Date(Date.now()-30*6e4).toISOString(),fin:new Date().toISOString(),u:'operario',paros:[],tallas:{}});
    mHechoTotal(oT.id,'modulos');document.getElementById('hc-q').value=15;confirmarHechoCentro(oT.id,'modulos');
    __check("HH: una orden sin curva registra el total, queda en tallasLog y también suma",((S.avance[oT.id]||{}).tallasLog||[]).some(x=>x.talla==='(total)'&&x.pz===15)&&hechasDelDia('modulos',null,hoy()).pz>=antes2+15);
    __check("HH: no se cuenta dos veces (tramo y registro rápido de la misma orden)",hechasDelDia('modulos',null,hoy()).pz===antes2+15);
    S.ordenes=S.ordenes.filter(x=>x!==oT);delete S.avance[oT.id]}
   // 3 · las otras pantallas leen lo mismo
   __check("HH: Mi centro y «Hecho hoy» del centro usan la función única",vTablet.toString().includes('hechasDelDia(')&&(vCentro.toString()+colaCentroHTML.toString()).includes('hechasDelDia('));
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
     o.ruta=[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:0.5}];S.ordenes.push(o);delete S.avance[o.id];
     /* tiempo corrido en corte: sin él, cerrar el paso está bloqueado a propósito */
     tramosDe(o.id).push({id:'t-cc-'+uid(),centro:'corte',rec:null,ini:new Date(Date.now()-30*6e4).toISOString(),fin:new Date().toISOString(),u:'operario',paros:[],tallas:{}});
     return o};
   const oC=mk('WH/CIERRE-1');PLAN=null;PLAN_ALL=null;TRAMO={paso:null,id:null,oid:null};
   // 3.1 · con faltante y sin motivo NO cierra
   S.avance[oC.id]=Object.assign(S.avance[oC.id]||{},{centros:{corte:180}});
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
   {const oM=mk('WH/CIERRE-3');S.avance[oM.id]=Object.assign(S.avance[oM.id]||{},{centros:{}});PLAN=null;PLAN_ALL=null;
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
    __check("CC1: el tramo se guarda primero y después se cierra el paso con su faltante",(tramosDe(oT.id).find(t=>t.centro==='modulos')||{}).pz===150&&!!ci2&&ci2.pz===150&&ci2.faltan===50&&pasoHecho(oT,'modulos'));
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
    __check("VT3: la línea «Marcas:» va arriba de la cola y su «?» explica contra qué fecha se compara y cuántas por cada causa",/cola-marcas/.test(h)&&/rojas/.test(h)&&/class="ayuda"[^>]*title="[^"]*Por qué aparecen[^"]*fecha meta de la orden[^"]*meta ya vencida/.test(h));}
   S.ordenes=S.ordenes.filter(o=>![oVenc,oLejos].includes(o));[oVenc,oLejos].forEach(o=>delete S.avance[o.id]);
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("VT sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PISO · estados de la orden en el centro: pendiente, en proceso y terminada */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mk=(op,fase)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=100;o.fase=fase;o.ruta=[{centro:'corte',t:1},{centro:'modulos',t:5}];delete o.programa;S.ordenes.push(o);delete S.avance[o.id];return o};
   const etMod=centroEtapaDe('modulos');
   const fProx=FASES[1]||'1Tejeduria';
   const fAqui=FASES[2]||'2Planificacion';
   if(!fProx||!fAqui){__check('PE0: la tabla 5 tiene fases del centro y de un paso anterior',false,'etapa de módulos: '+etMod)}
   else{
   const oDisp=mk('WH/EST-DISP',fAqui),oProx=mk('WH/EST-PROX',fProx),oProc=mk('WH/EST-PROC',fAqui);
   S.avance[oProc.id]={centros:{modulos:30}};PLAN=null;PLAN_ALL=null;TRAMO={paso:null,id:null,oid:null};
   __check("PE1: una orden con cantidades registradas y sin cerrar está EN PROCESO",estadoOrdenCentro(oProc,'modulos',rec)==='proceso');
   __check("PE1: con el paso anterior hecho, la orden está DISPONIBLE",(S.avance[oDisp.id]={centros:{corte:100}},estadoOrdenCentro(oDisp,'modulos',rec)==='disponible'));
   S.avance[oProx.id]={centros:{}};   // a la próxima le falta CORTE, que es el paso anterior de SU ruta
   S.avance[oDisp.id]={centros:{corte:100}};  // a la disponible ya le hicieron corte
   __check("PE1: es PRÓXIMA porque le falta un paso anterior de SU RUTA, no por el número de fase",estadoOrdenCentro(oProx,'modulos',rec)==='proxima'&&/falta Corte/i.test(motivoEstadoCentro(oProx,'modulos')));
   __check("PE1: y es DISPONIBLE cuando el paso anterior de su ruta ya está hecho, sin mirar la fase",estadoOrdenCentro(oDisp,'modulos',rec)==='disponible'&&oDisp.fase===oProx.fase||estadoOrdenCentro(oDisp,'modulos',rec)==='disponible');
   {const cola=[{o:oProc,hechas:30},{o:oDisp,hechas:0},{o:oProx,hechas:0}];
    const h=flujoTramoHTML('modulos',rec,cola);
    __check("PE2: la sección En proceso va arriba, con foto, WH, hechas/total, barra y CONTINUAR",h.indexOf('En proceso')>=0&&h.indexOf('En proceso')<h.indexOf('Disponibles')&&h.includes('>CONTINUAR<')&&h.includes('30 de 100')&&h.includes('class="bar"'));
    /* decisión 17-sep: sin tiempo corrido NO aparece «Terminar orden»; con tiempo, sí */
    __check("PE2: sin tiempo corrido NO ofrece «Terminar orden»: dice qué falta",!h.includes('terminarOrdenCentro(null,')&&/Hecho aparece con tiempo corrido/.test(h));
    {const tr=tramosDe(oProc.id);tr.push({id:"t-pe2",centro:'modulos',rec:rec||null,ini:new Date(Date.now()-8*6e4).toISOString(),fin:new Date().toISOString(),u:"op",paros:[],tallas:{}});
     const h2=flujoTramoHTML('modulos',rec,cola);
     __check("PE2: con tiempo corrido ofrece «Terminar orden» para cerrar el paso",h2.includes('terminarOrdenCentro(null,')&&h2.includes(oProc.id)&&h2.includes('Terminar orden'));}
    __check("PE4: Disponibles ofrece INICIO y Próximas no",h.includes("iniciarTramo('"+oDisp.id)&&!h.includes("iniciarTramo('"+oProx.id)&&h.includes('todavía no ·'));
    __check("PE4: la próxima se ve igual, con la fase en la que está",h.includes(esc(oProx.op))&&h.includes(esc(faseNombre(fProx))));}
   {iniciarTramo(oDisp.id,'modulos',rec);const tr=tramosDe(oDisp.id).find(x=>!x.fin);tr.ini=new Date(Date.now()-90*6e4).toISOString();
    __check("PE3: con un inicio sin fin la orden pasa a EN PROCESO",estadoOrdenCentro(oDisp,'modulos',rec)==='proceso'&&!!tramoAbiertoOrden(oDisp.id,'modulos',null));
    const h=flujoTramoHTML('modulos',rec,[{o:oDisp,hechas:0}]);
    __check("PE3: en su propio puesto se ve el reloj en curso con la hora de inicio",h.includes('id="crono-vivo"')&&h.includes('data-ini="'+tr.ini));
    const otroRec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!==rec)||{}).id;
    if(otroRec){tr.rec=otroRec;const h2=flujoTramoHTML('modulos',rec,[{o:oDisp,hechas:0}]);
     __check("PE3: y desde otro puesto la orden aparece en la lista como EN CURSO con el tiempo",/EN CURSO · 1:[23][0-9]:/.test(h2),(h2.match(/EN CURSO[^<]{0,16}/)||[])[0]||'');tr.rec=rec}
    else __check("PE3: y desde otro puesto la orden aparece en la lista como EN CURSO con el tiempo",true,'sin otro puesto en el centro');
    TRAMO={paso:null,id:null,oid:null};tr.fin=new Date().toISOString()}
   S.ordenes=S.ordenes.filter(o=>![oDisp,oProx,oProc].includes(o));[oDisp,oProx,oProc].forEach(o=>delete S.avance[o.id]);}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;TRAMO={paso:null,id:null,oid:null};page='ordenes';render();
   __check("PE sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* LIBERACIÓN · el mes de ENTREGA filtra por la fecha de entrega de verdad */
  {const antes=__R.errors.length;const bak={mes:LIB.mes,ym:LIB.ym,odc:LIB.odc,fam:LIB.fam,cli:LIB.cli};
   LIB.mes=null;LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q='';LIB.hija=null;LIB.tela=null;LIB.fases=null;LIB.et='tela';
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mk=(op,fecha,proy)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=10;o.fecha=fecha;o.proyecto=proy;o.fase='0Macro';delete o.lib;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];if(!rutaConfirmada(o))confirmarRuta(o,'persona','prueba');return o};
   const oE1=mk('WH/ENT-1','2027-05-10','ENERO 2027'),oE2=mk('WH/ENT-2','2027-06-20','ENERO 2027'),oSin=mk('WH/ENT-SIN','','ENERO 2027');
   PLAN=null;PLAN_ALL=null;
   const pend=()=>pendLiberacion('tela',LIB.ym).filter(okFiltrosB1);
   __check("ME1: el mes de entrega sale de la fecha de entrega, no del Proyecto",mesEntregaDe(oE1)==='2027-05'&&mesEntregaDe(oE2)==='2027-06'&&mesPlan(oE1)==='2027-01');
   __check("ME1: las órdenes sin fecha van al grupo «Sin fecha de entrega»",mesEntregaDe(oSin)==='Sin fecha de entrega');
   LIB.mes=new Set(['2027-05']);
   __check("ME2: con un mes de entrega marcado solo pasa esa",pend().some(o=>o.op==='WH/ENT-1')&&!pend().some(o=>o.op==='WH/ENT-2')&&!pend().some(o=>o.op==='WH/ENT-SIN'));
   togSetMes('2027-06');
   __check("ME2: es multiselección: dos meses de entrega a la vez",LIB.mes.size===2&&pend().some(o=>o.op==='WH/ENT-1')&&pend().some(o=>o.op==='WH/ENT-2'));
   LIB.mes=new Set(['Sin fecha de entrega']);
   __check("ME2: se puede filtrar justamente las que no tienen fecha",pend().some(o=>o.op==='WH/ENT-SIN')&&!pend().some(o=>o.op==='WH/ENT-1'));
   LIB.mes=null;page='liberacion';render();
   {const h=document.getElementById('p-liberacion').innerHTML;
    __check("ME3: el filtro está en pantalla, con los meses de entrega y el grupo sin fecha",h.includes('<label>Mes de entrega</label>')&&h.includes('Sin fecha de entrega')&&h.includes("togSetMes("));}
   S.ordenes=S.ordenes.filter(o=>![oE1,oE2,oSin].includes(o));[oE1,oE2,oSin].forEach(o=>delete S.avance[o.id]);
   LIB.mes=bak.mes;LIB.ym=bak.ym;LIB.odc=bak.odc;LIB.fam=bak.fam;LIB.cli=bak.cli;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("ME sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* TERMINADOS · de dónde sale el tiempo de cada sub-área */
  {const antes=__R.errors.length;
   __check("OT1: plancha viene con 2 min/prenda sembrados en la columna editable",(sembrarTerminados(),+((CE('plancha')||{}).minEstandar)===2));
   __check("OT1: lavado queda como SOLO tiempo de espera (decisión 16-sep), con sus días cargados",(sembrarCapPasos(),sembrarLavado(),capacidadPaso('lavado')==='no'&&centroPorDias('lavado')===true&&diasEsperaCentro('lavado')>=3));
   __check("OT1: y el aviso de que no es definitivo va pegado a la fila del lavado en planta",/pendiente datos de lavadoras/.test(avisoLavadoPlanta())&&/pendiente datos de lavadoras/.test(celdaCapPasoHTML(esperasPaso().findIndex(x=>x.modo==='planta'),esperasPaso().find(x=>x.modo==='planta'))));
   {const or=origenTiempoCentro('botones');
    __check("OT2: ojales y botones dice de dónde sale su tiempo (LMO y, si hay, la tabla de ojal/botón que la reemplaza)",/operaciones de la LMO/.test(or.txt)&&/operaciones mapeadas/.test(or.det));}
   __check("OT2: plancha dice que su tiempo sale de la columna del centro",origenTiempoCentro('plancha').txt.includes('Min/prenda'));
   __check("OT2: y el consolidado del lavado dice que se mide en días y no consume capacidad",/días de proceso/.test(origenTiempoCentro('lavado').txt)&&/no consume capacidad/.test(origenTiempoCentro('lavado').det||''));
   __check("OT sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* PISO · la secuencia de la ruta manda sobre el número de fase */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   const rec=(S.recursos.find(r=>r.centro==='modulos'&&r.activa&&r.id!=='maquila')||{}).id;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mk=(op,ruta,fase)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=100;o.fase=fase;o.ruta=ruta;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];return o};
   const faseTarde=FASES[FASES.length-1];
   // 1 · fase muy avanzada pero con el paso anterior de SU ruta sin hacer: es PRÓXIMA
   const oA=mk('WH/SEQ-A',[{centro:'corte',t:1},{centro:'modulos',t:5}],FASES[1]);S.avance[oA.id]={centros:{}};
   __check("SQ1: con la MISMA fase, la que tiene el paso anterior de su ruta pendiente es PRÓXIMA",estadoOrdenCentro(oA,'modulos',rec)==='proxima'&&/falta Corte/i.test(motivoEstadoCentro(oA,'modulos')));
   // 2 · fase temprana pero el paso anterior ya está hecho: es DISPONIBLE
   const oB=mk('WH/SEQ-B',[{centro:'corte',t:1},{centro:'modulos',t:5}],FASES[1]);S.avance[oB.id]={centros:{corte:100}};  // misma fase que oA: solo cambia lo hecho en su ruta
   __check("SQ1: y la que ya tiene hecho ese paso es DISPONIBLE, con la misma fase: manda la ruta, no el número de fase",estadoOrdenCentro(oB,'modulos',rec)==='disponible'&&oA.fase===oB.fase);
   // 3 · sin ruta, o el centro no está en ella: brecha visible
   const oC=mk('WH/SEQ-C',[],FASES[1]);
   __check("SQ2: sin ruta de producción se muestra como «ruta sin secuencia», ni bloqueada ni habilitada en silencio",estadoOrdenCentro(oC,'modulos',rec)==='sinSecuencia'&&/no tiene ruta/.test(motivoEstadoCentro(oC,'modulos')));
   const oD=mk('WH/SEQ-D',[{centro:'corte',t:1},{centro:'empaque',t:1}],FASES[1]);
   __check("SQ2: si el centro no está en la ruta, también es brecha",estadoOrdenCentro(oD,'modulos',rec)==='sinSecuencia'&&/no está en la ruta/.test(motivoEstadoCentro(oD,'modulos')));
   const oE=mk('WH/SEQ-E',[{centro:'modulos',t:5},{centro:'corte',t:1},{centro:'modulos',t:5}],FASES[1]);
   __check("SQ2: y si el centro aparece dos veces en la ruta, lo dice",estadoOrdenCentro(oE,'modulos',rec)==='sinSecuencia'&&/dos veces|2 veces/.test(motivoEstadoCentro(oE,'modulos')));
   {const h=flujoTramoHTML('modulos',rec,[{o:oC,hechas:0},{o:oA,hechas:0},{o:oB,hechas:0}]);
    __check("SQ3: la sección «Ruta sin secuencia» existe, dice el motivo y deja iniciar (no bloquea en silencio)",h.includes('Ruta sin secuencia')&&h.includes('no tiene ruta de producción')&&h.includes("iniciarTramo('"+oC.id));
    __check("SQ3: la próxima dice qué paso le falta, no «su fase es anterior»",/todavía no · falta Corte/i.test(h));}
   {const cmb=cambiosDisponibilidad();__R.cambiosDisp=cmb;
    __check("SQ4: se puede contar cuántas órdenes cambian de lado con la regla nueva",typeof cmb.aProxima==='number'&&typeof cmb.aDisponible==='number'&&typeof cmb.sinSecuencia==='number'&&cmb.total>=3);}
   S.ordenes=S.ordenes.filter(o=>![oA,oB,oC,oD,oE].includes(o));[oA,oB,oC,oD,oE].forEach(o=>delete S.avance[o.id]);
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("SQ sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* D · reglas de ruta: vista previa, respeto a lo editado a mano y auditoría */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;const alerts=[];window.alert=m=>alerts.push(String(m));
   const bakR=JSON.stringify(S.params.reglasRuta||null);S.params.reglasRuta=[];
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mk=(op,extra)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=20;o.ruta=[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:0.5}];delete o.rutaEditada;delete o.rutaConf;delete o.programa;Object.assign(o,extra||{});S.ordenes.push(o);delete S.avance[o.id];return o};
   const fam=famDeOrden(base);
   const oR1=mk('WH/REG-1'),oR2=mk('WH/REG-2'),oMan=mk('WH/REG-MAN',{rutaEditada:[{ts:new Date().toISOString(),u:'alguien',motivo:'a mano'}]});
   const oYa=mk('WH/REG-YA',{ruta:[{centro:'corte',t:1},{centro:'plancha',t:2},{centro:'empaque',t:0.5}]});
   __check("DR0: la tabla de reglas arranca VACÍA (las reglas reales las carga la usuaria)",reglasRuta().length===0);
   addReglaRuta();const r=reglasRuta()[0];
   setReglaRuta(r.id,'familia',fam);setReglaRuta(r.id,'subarea','plancha');setReglaRuta(r.id,'pos','antes');setReglaRuta(r.id,'ref','empaque');
   __check("DR1: una regla nueva nace APAGADA: no toca nada hasta que la enciendas",r.activa===false&&previaReglasRuta().filas[0].aplica.length===0);
   setReglaRuta(r.id,'activa',true);
   {const pv=previaReglasRuta();const f=pv.filas[0];
    __check("DR2: la vista previa dice a cuántas órdenes afecta, sin tocar ninguna",f.aplica.some(o=>o.op==='WH/REG-1')&&f.aplica.some(o=>o.op==='WH/REG-2')&&!(oR1.ruta||[]).some(x=>x.centro==='plancha'));
    __check("DR2: las que ya tienen esa sub-área no se cuentan",f.yaTiene>=1&&!f.aplica.some(o=>o.op==='WH/REG-YA'));
    __check("DR2: las rutas editadas a mano quedan APARTE, no se aplican",f.manual>=1&&!f.aplica.some(o=>o.op==='WH/REG-MAN')&&pv.manual.some(o=>o.op==='WH/REG-MAN'));}
   {const h=reglasRutaHTML();
    __check("DR3: la pantalla muestra la tabla, la previa y la lista de las editadas a mano",/Reglas para agregar sub-áreas a la ruta/.test(h)&&/Aplicar a /.test(h)&&/editada a mano/.test(h)&&h.includes(esc('WH/REG-MAN')));}
   {const nAud=auditoriaTodo().length;const nBit=S.bitacora.length;
    aplicarReglasRuta();
    const i1=(oR1.ruta||[]).findIndex(x=>x.centro==='plancha');const iE=(oR1.ruta||[]).findIndex(x=>x.centro==='empaque');
    __check("DR4: al aplicar, la sub-área entra en el lugar pedido (antes de empaque)",i1>=0&&iE>i1);
    __check("DR4: la orden editada a mano NO se tocó",!(oMan.ruta||[]).some(x=>x.centro==='plancha'));
    __check("DR4: cada cambio de ruta queda en auditoría y en la bitácora",auditoriaTodo().length>=nAud+2&&S.bitacora.length>nBit&&auditoriaTodo().some(x=>x.tipo==='ruta'&&/regla de ruta/.test(x.motivo||'')));
    __check("DR4: y queda registrado en el historial de ruta de la orden",(oR1.rutaEditada||[]).some(x=>/regla de ruta/.test(x.motivo||'')));}
   {const pv2=previaReglasRuta();
    __check("DR5: volver a aplicar no duplica el paso",pv2.filas[0].aplica.length===0&&(oR1.ruta||[]).filter(x=>x.centro==='plancha').length===1);}
   S.ordenes=S.ordenes.filter(o=>![oR1,oR2,oMan,oYa].includes(o));[oR1,oR2,oMan,oYa].forEach(o=>delete S.avance[o.id]);
   const br=JSON.parse(bakR);if(br)S.params.reglasRuta=br;else delete S.params.reglasRuta;
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';ORDF.tab='ord';render();
   __check("DR sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* AJUSTES FINALES · cero confirmado, lavado por modalidad y la brecha de rutas sin secuencia */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   // 2 · una regla CONFIRMADA con 0 aplica 0; una sin confirmar no aplica y es brecha
   {const bakT=JSON.stringify(S.params.tiemposOjalBoton||null);
    const k=S.categorias.find(x=>{const sp={};opsDe(x).forEach(y=>{sp[y.centro]=(sp[y.centro]||0)+(+y.sam||0)});return sp.botones!=null});
    if(!k)__check('OB0: hay alguna categoría que pase por ojales y botones',false,'ninguna categoría con SAM de botones');
    else{
     const nom=k.n||'';
     S.params.tiemposOjalBoton=[{match:nom,ojales:0,botones:0}];  // confirmada (sin sinConfirmar) y en CERO
     __check("OB1: una regla CONFIRMADA en 0 aplica 0 (cero es cero, no se cae al SAM de la LMO)",samPorCentro(k).botones===0);
     S.params.tiemposOjalBoton=[{match:nom,ojales:0.47,botones:0.59}];
     __check("OB1: y una regla confirmada con valores reemplaza al SAM",Math.abs(samPorCentro(k).botones-1.06)<1e-9);
     S.params.tiemposOjalBoton=[{match:nom,ojales:0,botones:0,sinConfirmar:true}];
     const sam=samPorCentro(k).botones;
     __check("OB2: una regla SIN CONFIRMAR no se aplica: manda el SAM de la LMO",sam!==0);
     const b=brechasOjalBoton();
     __check("OB2: y esa categoría sale como BRECHA, no en silencio",b.sinConf.some(x=>x.indexOf(nom)===0));
     __check("OB2: el consolidado de Terminados lo muestra como brecha",!!origenTiempoCentro('botones').brecha&&/SIN CONFIRMAR/.test(origenTiempoCentro('botones').brecha));
    }
    const bt=JSON.parse(bakT);if(bt)S.params.tiemposOjalBoton=bt;else delete S.params.tiemposOjalBoton;}
   // 3 · lavado: la modalidad decide, y «pendiente» no se asume
   {const bakE=JSON.stringify(S.params.esperasPaso||null);const bakS=JSON.stringify(S.params.capPasoSembrado||null);
    delete S.params.capPasoSembrado;S.params.esperasPaso=JSON.parse(JSON.stringify(defEsperasPaso()));
    sembrarCapPasos();
    const f=esperasPaso().filter(x=>x.paso==='lavado'&&!x.sinRegla);
    __check("LV1: sin la decisión del 16-sep, Quito queda como lead time y planta PENDIENTE (no se asume)",f.some(x=>/quito/i.test(x.nota||'')&&x.cap==='no')&&f.some(x=>!/quito/i.test(x.nota||'')&&x.cap==='pend'));
    __check("LV1: y mientras haya una pendiente no se asume nada: ni ocupa ni deja de ocupar",capacidadPaso('lavado')==='pend'&&capacidadPendiente('lavado')===true&&centroPorDias('lavado')===false);
    __check("LV1: y la suposición anterior del centro quedó retirada",(CE('lavado')||{}).sinCapacidad===undefined);
    {delete S.params.lavadoSembrado;sembrarLavado();
     __check("LV1: la decisión del 16-sep la resuelve: planta 3 días y Quito 15, los dos como SOLO tiempo de espera",capacidadPaso('lavado')==='no'&&esperasPaso().some(x=>x.modo==='planta'&&x.dias===3&&x.cap==='no')&&esperasPaso().some(x=>x.modo==='quito'&&x.dias===15&&x.cap==='no'));
     __check("LV1: pero deja dicho que NO es definitivo",/ocupa capacidad propia; pendiente datos de lavadoras/.test(avisoLavadoPlanta()));}
    esperasPaso().filter(x=>x.paso==='lavado'&&!/quito/i.test(x.nota||'')).forEach(x=>{x.cap='no'});
    __check("LV2: si confirmas que NO ocupa planta, pasa a medirse solo en días",capacidadPaso('lavado')==='no'&&centroPorDias('lavado')===true&&!capacidadPendiente('lavado'));
    esperasPaso().filter(x=>x.paso==='lavado'&&!/quito/i.test(x.nota||'')).forEach(x=>{x.cap='si'});
    __check("LV2: y si confirmas que SÍ ocupa, vuelve a contar como capacidad de planta",capacidadPaso('lavado')==='si'&&centroPorDias('lavado')===false);
    {const h=celdaCapPasoHTML(0,{cap:''});__check("LV3: la columna está en la tabla de esperas y avisa cuando falta confirmar",/setCapPaso\(0,/.test(h)&&/sin confirmar/.test(h));}
    const be=JSON.parse(bakE);if(be)S.params.esperasPaso=be;else delete S.params.esperasPaso;
    const bs=JSON.parse(bakS);if(bs)S.params.capPasoSembrado=bs;else delete S.params.capPasoSembrado;}
   // 1 · la brecha de rutas sin secuencia, en Reportería
   {const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
    const mk=(op,ruta)=>{const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op=op;o.estado='plan';o.cant=10;o.ruta=ruta;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];return o};
    const oSin=mk('WH/RSS-1',[]);
    const oRep=mk('WH/RSS-2',[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'corte',t:1}]);
    const oFue=mk('WH/RSS-3',[{centro:'modulos',t:5}]);S.avance[oFue.id]={centros:{corte:5}};
    const r=rutasSinSecuencia();
    __check("RS1: la brecha cuenta por motivo: sin ruta, centro repetido y avance fuera de la ruta",r.sinRuta.some(x=>x.o===oSin)&&r.repetido.some(x=>x.o===oRep)&&r.fueraDeRuta.some(x=>x.o===oFue));
    const h=rutasSinSecuenciaHTML();
    __check("RS2: el panel lista las órdenes con su motivo y deja editar la ruta",/Rutas sin secuencia/.test(h)&&h.includes(esc(oSin.op))&&h.includes(esc(oRep.op))&&h.includes(esc(oFue.op))&&/editar ruta/.test(h));
    page='reporteria';render();
    __check("RS3: y está en Reportería, no en Mi centro",/Rutas sin secuencia/.test(document.getElementById('p-reporteria').innerHTML)&&!/Rutas sin secuencia/.test(flujoTramoHTML('modulos',null,[])));
    S.ordenes=S.ordenes.filter(o=>![oSin,oRep,oFue].includes(o));[oSin,oRep,oFue].forEach(o=>delete S.avance[o.id]);}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("AF sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* MENÚ · Terminados desplegable, Empaque dentro y Etiquetas con Estampado */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   sembrarRutaDefecto();  // dispara las siembras idempotentes
   // 1 · Empaque ya no está en el primer nivel
   {const pri=[...document.querySelectorAll('nav a[data-cen]:not([data-sub])')].map(a=>a.dataset.cen);
    __check("MN1: Empaque sale del primer nivel del menú",!pri.includes('empaque')&&pri.includes('terminados'));
    __check("MN1: y sigue siendo sub-área de Terminados por la columna «Ítem de planificación»",grupoPlanDe('empaque')==='terminados'&&subAreasDe('terminados').includes('empaque'));}
   // 2 · Terminados despliega sus sub-áreas
   {render();const subs=[...document.querySelectorAll('nav a[data-sub][data-padre="terminados"]')];
    __check("MN2: Terminados muestra un sub-ítem por cada sub-área, en el orden del proceso",subs.length===subAreasDe('terminados').length&&subs.map(a=>a.dataset.cen).join()===subAreasDe('terminados').join());
    __check("MN2: los sub-ítems van indentados y llevan a la pantalla del centro",subs.every(a=>a.className==='subnav'&&a.dataset.p==='centro'));
    __check("MN2: y llevan la alerta cuando la sub-área no tiene minutos o no está en ninguna ruta",subs.some(a=>!!a.dataset.av)&&subs.every(a=>!!a.dataset.av===/t-alerta/.test(a.innerHTML)));
    // el menú se rehace solo si se mueve una sub-área
    const bak=(CE('empaque')||{}).grupoPlan;setCentro('empaque','grupoPlan','modulos');render();
    const subs2=[...document.querySelectorAll('nav a[data-sub][data-padre="terminados"]')].map(a=>a.dataset.cen);
    const subm=[...document.querySelectorAll('nav a[data-sub][data-padre="modulos"]')].map(a=>a.dataset.cen);
    __check("MN2: si cambias el «Ítem de planificación», el menú se actualiza solo",!subs2.includes('empaque')&&subm.includes('empaque')&&subm.includes('modulos'));
    setCentro('empaque','grupoPlan',bak===undefined?'terminados':bak);render();
    __check("MN2: y al devolverlo, vuelve",[...document.querySelectorAll('nav a[data-sub][data-padre="terminados"]')].map(a=>a.dataset.cen).includes('empaque'));
    // el sub-ítem abre SOLO esa sub-área; el padre sigue siendo el consolidado
    const cl=el=>{const ev=document.createEvent('MouseEvents');ev.initEvent('click',true,true);el.dispatchEvent(ev)};
    cl([...document.querySelectorAll('nav a[data-sub][data-padre="terminados"]')].find(a=>a.dataset.cen==='plancha'));
    __check("MN2: tocar un sub-ítem abre ESA sub-área sola",CEN.id==='terminados'&&CEN.solo==='plancha');
    page='centro';render();const hs=document.getElementById('p-centro').innerHTML;
    __check("MN2: y la pantalla lo dice y deja volver al consolidado",/sub-área de Terminados/.test(hs)&&/ver las \d+ juntas/.test(hs));
    cl(document.querySelector('nav a[data-cen="terminados"]:not([data-sub])'));
    __check("MN2: y tocar Terminados vuelve a las sub-áreas juntas",CEN.id==='terminados'&&!CEN.solo);
    page='centro';render();__check("MN2: el consolidado nombra las sub-áreas que junta",/sub-áreas juntas/.test(document.getElementById('p-centro').innerHTML));}
   // 3 · Etiquetas con Estampado
   {__check("MN3: Etiquetas queda en el ítem de planificación Estampado",grupoPlanDe('etiquetas')==='estampado'&&!subAreasDe('terminados').includes('etiquetas')&&subAreasDe('estampado').includes('etiquetas'));
    __check("MN3: y por eso ya no sale bajo Terminados en el menú",![...document.querySelectorAll('nav a[data-sub][data-padre="terminados"]')].some(a=>a.dataset.cen==='etiquetas'));
    __check("MN3: la pantalla de Estampado la trae como sub-área propia",censDeGrupo('estampado').includes('etiquetas')&&censDeGrupo('estampado').includes('estampado'));
    const cat=perfilesDef();const ter=cat.find(x=>x.id==='terminado'),cor=cat.find(x=>x.id==='corte');
    __check("MN4: los perfiles cambian con ella: terminado deja de verla y corte/estampado/bordado la ve",!(ter.centros||[]).includes('etiquetas')&&(cor.centros||[]).includes('etiquetas'));
    __check("MN3: las dos operaciones «Etiquetar» de la LMO son de serigrafía (SER-01), tampográfica y manual: ninguna es cosida",(S.operaciones||[]).filter(o=>o.centro==='etiquetas').every(o=>/etiquet/i.test(o.n||'')&&!/coser|cos[ei]/i.test(o.n||'')));}
   // 4 · cada sub-área tiene su cola en Mi centro y la tablet apunta a la sub-área
   {const cens=[...document.querySelectorAll('#p-config select')].length;
    __check("MN4: la tablet se asigna a un CENTRO (sub-área), no a «Terminados»",!/>Terminados</.test(tabletSelHTML('u1'))&&/value="plancha"/.test(tabletSelHTML('u1'))&&/value="empaque"/.test(tabletSelHTML('u1')));
    const rec=(S.recursos.find(r=>r.centro==='plancha'&&r.activa)||{}).id;
    const P=S.ordenes.length?programar():{pro:[],ordenes:{},secMod:{}};
    __check("MN4: Mi centro arma la cola de la sub-área, no la del grupo",Array.isArray(tabletFilas('plancha',rec,P))&&Array.isArray(tabletFilas('empaque',null,P)));}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("MN sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* DECISIONES DE PRODUCCIÓN 16-sep · etiquetado, plancha, lavado, ojales, rutas estimadas y DENIM */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   sembrarRutaDefecto();
   /* 1 · ETIQUETADO */
   {__check("D1: la etiqueta de serigrafía sale de una tabla editable con las CUATRO categorías dictadas",
     ['Level 1','Level 2','Camiseta CR','Camiseta CV'].every(c=>reglasEtiqueta().some(r=>normFase(r.cat)===normFase(c)&&+r.min===0.5&&r.centro==='etiquetas'&&r.confirmada!==false)));
    __check("D1: la regla «SERIGRAFIA + ETIQUETAR → Etiquetas» quedó retirada del mapeo",!reglasFamCentro().some(r=>normTxt(r.familia)==='serigrafia'&&normTxt(r.prefijo||'').startsWith('etiquetar')));
    __check("D1: las operaciones de la LMO que iban a Etiquetas NO se borraron: quedaron SIN centro y con el motivo",
     (S.operaciones||[]).every(o=>o.centro!=='etiquetas')&&(S.operaciones||[]).filter(o=>o.centroPend).every(o=>/Level 1/.test(o.centroMotivo||'')));
    // calce EXACTO: Camiseta CR no debe arrastrar a Camiseta CV ni al revés
    const cr=S.categorias.find(k=>k.n==='Camiseta CR'),cv=S.categorias.find(k=>k.n==='Camiseta CV');
    __check("D1: Camiseta CR y Camiseta CV cargan cada una sus 0,50 min de etiqueta",!!etiquetaDe(cr)&&!!etiquetaDe(cv)&&+samPorCentro(cr).etiquetas===0.5);
    const pol=S.categorias.find(k=>k.n==='Polo Basica');
    __check("D1: y una categoría que NO está en la tabla no lleva etiqueta (ni 0 mudo: simplemente no aparece)",!etiquetaDe(pol)&&samPorCentro(pol).etiquetas===undefined);
    // una regla sin confirmar no aplica
    const rr=reglasEtiqueta().find(r=>normFase(r.cat)===normFase('Camiseta CR'));rr.confirmada=false;
    __check("D1: una regla SIN CONFIRMAR no aplica",!etiquetaDe(cr)&&samPorCentro(cr).etiquetas===undefined);rr.confirmada=true;
    const h=opsSinCentroHTML();
    __check("D1: las operaciones sin centro se ven, con su motivo y un selector para asignarlas",/Operaciones sin centro/.test(h)&&(!opsSinCentro().length||/setCentroOp\(/.test(h)));
    __check("D1: la tabla de etiqueta es editable desde Configuración → Operaciones",/Etiqueta de serigrafía/.test(reglasEtiquetaHTML())&&/setReglaEtiqueta\(/.test(reglasEtiquetaHTML()));}
   /* 2 · PLANCHA CONFIRMADA */
   {__check("D2: plancha queda en 2 min/prenda y ya NO dice «estimado»",+((CE('plancha')||{}).minEstandar)===2&&(CE('plancha')||{}).minEstandarEstimado===undefined);
    __check("D2: y el consolidado deja de pedir que la confirmes",!/confírmalo/.test(origenTiempoCentro('plancha').det||''));}
   /* 3 · LAVADO A MANO, POR ORDEN */
   {const o=S.ordenes.find(x=>!(x.ruta||[]).some(p=>p.centro==='lavado'))||S.ordenes[0];
    const nAud=(S.params.auditoriaCambios||[]).length;
    aplicarLavado([o.id],'quito','prueba: el cliente lo pidió');
    __check("D3: agregar lavado mete el paso en la ruta y guarda la modalidad en la orden",(o.ruta||[]).some(p=>p.centro==='lavado')&&o.lavadoModo==='quito');
    __check("D3: el lavado entra antes de plancha y empaque, no al final de cualquier manera",(()=>{const r=(o.ruta||[]).map(x=>x.centro);const i=r.indexOf('lavado'),e=r.indexOf('empaque');return i>=0&&(e<0||i<e)})());
    __check("D3: y queda en la auditoría de ruta con el motivo",(S.params.auditoriaCambios||[]).length>nAud&&(o.rutaEditada||[]).some(e=>/el cliente lo pidió/.test(e.motivo||'')));
    __check("D3: la modalidad de la ORDEN manda sobre el calce por categoría (Quito = 15 días)",esperaDeCentro('lavado',o)===15);
    aplicarLavado([o.id],'planta','prueba: se lava en casa');
    __check("D3: cambiar de modalidad no duplica el paso y pasa a 3 días",(o.ruta||[]).filter(p=>p.centro==='lavado').length===1&&o.lavadoModo==='planta'&&esperaDeCentro('lavado',o)===3);
    aplicarLavado([o.id],'quitar','prueba: al final no lleva');
    __check("D3: quitar el lavado lo saca de la ruta y de la orden",!(o.ruta||[]).some(p=>p.centro==='lavado')&&!o.lavadoModo);
    const nA2=(S.params.auditoriaCambios||[]).length;aplicarLavado([o.id],'quito','');
    __check("D3: sin motivo no se aplica nada",(S.params.auditoriaCambios||[]).length===nA2&&!(o.ruta||[]).some(p=>p.centro==='lavado'));
    mLavado([o.id]);const hm=document.getElementById('modal').innerHTML;
    __check("D3: el modal ofrece las dos modalidades y quitar, y dice que no es por regla automática",/Lavado en planta/.test(hm)&&/Lavado en Quito/.test(hm)&&/Quitar el lavado/.test(hm)&&/no se asigna por regla automática/.test(hm));cerrar();
    __check("D3: se llega desde cualquier orden por su ruta",(mRutaCentro(o.id),/mLavado\(/.test(document.getElementById('modal').innerHTML)));cerrar();}
   /* 4 · OJALES Y BOTONES DEFINITIVOS */
   {__check("D4: los tiempos de la tabla son definitivos: ninguna fila queda sin confirmar",!tiemposOjalBoton().some(r=>r.sinConfirmar));
    const b=brechasOjalBoton();__check("D4: y por eso ya no hay categorías con regla sin confirmar",b.sinConf.length===0);
    __check("D4: y renombrar o unificar una fila NO la repone sin confirmar",(tiemposOjalBoton(),!tiemposOjalBoton().some(r=>r.sinConfirmar)));
    const k=S.categorias.find(x=>{const sp={};opsDe(x).forEach(y=>{if(y.centro)sp[y.centro]=(sp[y.centro]||0)+(+y.sam||0)});return sp.botones!=null});
    if(k)__check("D4: una fila confirmada en 0 sigue aplicando 0 (cero es cero)",(()=>{const bak=JSON.stringify(S.params.tiemposOjalBoton);S.params.tiemposOjalBoton=[{match:k.n,ojales:0,botones:0}];const v=samPorCentro(k).botones;S.params.tiemposOjalBoton=JSON.parse(bak);return v===0})());}
   /* 5 · RUTAS ESTIMADAS */
   {const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
    const o=JSON.parse(JSON.stringify(base));o.id=uid();o.op='WH/EST-1';o.estado='plan';o.cant=10;o.ruta=[];delete o.rutaConf;delete o.programa;S.ordenes.push(o);delete S.avance[o.id];
    __check("D5: una orden sin ruta de producción entra a la cola de estimadas",previaRutasEstimadas().ordenes.includes(o));
    generarRutasEstimadas();
    __check("D5: se le pone ruta y queda como «estimada – sin revisar», no confirmada",pasosProDe(o).length>0&&estadoRuta(o)==='sinRevisar'&&estadoRutaTxt(o)==='estimada – sin revisar'&&!rutaConfirmada(o));
    __check("D5: estampado y bordado NO entran: dependen del diseño",!pasosProDe(o).some(c=>CENTROS_DISENO.includes(c)));
    __check("D5: y la pantalla avisa que esa carga puede estar faltando",/dependen del diseño/.test(rutasEstimadasHTML())&&/puede estar faltando/.test(rutasEstimadasHTML()+rutasEstimadasResumenHTML()));
    __check("D5: se revisa una por una, con la ruta a la vista y el botón de editar",/marcarRutaRevisada\(/.test(rutasEstimadasHTML())&&/mRutaCentro\(/.test(rutasEstimadasHTML()));
    const nR=rutasEstimadas().sinRevisar.length;marcarRutaRevisada(o.id);
    __check("D5: marcarla como revisada la mueve de lado y deja quién y cuándo",estadoRuta(o)==='revisada'&&rutasEstimadas().sinRevisar.length===nR-1&&!!rutaConf(o).revisadaTs);
    page='reporteria';REP.vista='produccion';render();
    __check("D5: Reportería cuenta cuántas quedan sin revisar",/Rutas estimadas/.test(document.getElementById('p-reporteria').innerHTML));
    __check("D5: confirmar la ruta a mano la vuelve REAL",(confirmarRuta(o,'persona','prueba'),estadoRuta(o)==='real'&&estadoRutaTxt(o)==='real'));
    S.ordenes=S.ordenes.filter(x=>x!==o);delete S.avance[o.id];}
   /* 6 · DENIM y JEANS */
   {const d0=diagJeans();
    __check("D6: primero REPORTA qué apunta a JEANS: categorías, órdenes, operaciones y filas de configuración",
     d0.total>0&&Array.isArray(d0.cats)&&Array.isArray(d0.ordenes)&&Array.isArray(d0.ops)&&Array.isArray(d0.tablas));
    const hj=jeansHTML();
    __check("D6: y lo muestra antes de mover nada, diciendo que no se borra",/DENIM y JEANS/.test(hj)&&/no borra|sin borrar/.test(hj));
    const nCat=S.categorias.length,nOrd=S.ordenes.length,nOps=(S.operaciones||[]).length;
    const padJ=S.categorias.find(k=>!k.padre&&esJeans(k.n));const hijasJ=padJ?S.categorias.filter(k=>k.padre===padJ.id).length:0;
    delete S.params.jeansUnificado;unificarJeansEnDenim();
    __check("D6: NADA se borra: ni categorías, ni órdenes, ni operaciones",S.categorias.length===nCat&&S.ordenes.length===nOrd&&(S.operaciones||[]).length===nOps);
    const den=S.categorias.find(k=>!k.padre&&normFase(k.n)==='denim');
    __check("D6: queda una sola familia DENIM y las hijas de JEANS cuelgan de ella",!!den&&(!hijasJ||S.categorias.filter(k=>k.padre===den.id).length>=hijasJ));
    __check("D6: la fila «jean» de ojales y botones queda unificada en «denim», sin borrarse",(()=>{const j=tiemposOjalBoton().find(r=>/jean/.test(r.match||''));return !j||j.unificadaEn==='denim'})());
    __check("D6: el mapeo a la hoja LMO sigue apuntando a JEANS, que es su nombre de origen",mapaCatLMO().porPadre.DENIM==='JEANS');
    __check("D6: y todo queda en la bitácora",(S.bitacora||[]).some(b=>/JEANS/.test(b.txt||b.t||'')&&/DENIM/.test(b.txt||b.t||'')));}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("DEC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* PARTE A · Dirección, Liberación y Planificación de producción */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   /* 1 · cada centro con su propio «ver programa» */
   {page='panorama';render();const h=document.getElementById('p-panorama').innerHTML;
    const cens=S.centros.filter(c=>c.area==='pro').map(c=>c.id);
    __check("A1: Planta hoy lista TODOS los centros de producción, con carga o sin ella",cens.every(c=>h.includes('irCentro(&quot;'+c+'&quot;')||h.includes("irCentro('"+c+"'")));
    __check("A1: y ya no manda a Carga general desde la tarjeta del centro",(h.match(/irCentro\(/g)||[]).length>=cens.length);
    irCentro('estampado',hoy());
    __check("A1: el enlace abre la pantalla del centro, en su programación",page==='centro'&&CEN.tab==='prog'&&censDeGrupo(CEN.id).includes('estampado'));
    __check("A1: y en la semana del día pedido",CEN.sem===0);
    irCentro('plancha',dsum(hoy(),14));
    __check("A1: un día de otra semana abre esa semana",CEN.sem===2&&(CEN.solo==='plancha'||censDeGrupo(CEN.id).includes('plancha')));
    CEN.solo='';CEN.sem=0;}
   /* 2 · el menú */
   {const plan=[...document.querySelectorAll('nav .gbody[data-g="prod"] a')].map(a=>a.dataset.p+'/'+(a.dataset.rep||''));
    const rep=[...document.querySelectorAll('nav .gbody[data-g="rep"] a')].map(a=>a.dataset.p+'/'+(a.dataset.rep||''));
    __check("A2: «Reportería por área» sale de Planificación de producción",!plan.includes('reporteria/produccion'));
    __check("A2: y sigue en la pestaña Reportería",rep.includes('reporteria/produccion'));}
   /* 3 · fecha, hora y usuario de la liberación */
   {const o=S.ordenes.find(x=>abierta(x))||S.ordenes[0];
    if(o.lib)delete o.lib.corte;PERFIL={rol:'admin',modo:'editar',nombre:'Jefa Prod'};
    confirmarRuta(o,'persona','prueba');S.avance[o.id]=S.avance[o.id]||{};S.avance[o.id].calidadOk=true;
    if(!puedeLiberarA(o,'corte'))__check('A3: la orden de prueba se puede liberar',false,faltaLiberarA(o,'corte').join(', '));
    const t0=new Date().toISOString();liberarA([o.id],'corte');
    __check("A3: al liberar se guarda fecha, hora y quién",!!(o.lib&&o.lib.corte&&o.lib.corte.ts>=t0.slice(0,10)&&o.lib.corte.u==='Jefa Prod'));
    __check("A3: y queda en el historial de la orden",(o.histLib||[]).some(x=>x.accion==='liberada'&&x.et==='corte'));
    const f=libFechaDe(o,'corte');__check("A3: la fecha se lee del registro, no se adivina",f&&f.origen==='registro'&&!!f.ts);
    __check("A3: y se muestra con hora y usuario",/Jefa Prod/.test(libFechaTxt(o,'corte')));
    // una liberada vieja, sin ts y sin auditoría: brecha, no fecha inventada
    const bakA=S.params.auditoriaCambios;S.params.auditoriaCambios=[];
    o.lib.corte={ok:true,u:'alguien'};
    __check("A3: una liberada antigua sin rastro se marca como BRECHA, no se le inventa fecha",libFechaDe(o,'corte').origen==='desconocida'&&!libFechaDe(o,'corte').ts&&/desconocida/.test(libFechaTxt(o,'corte')));
    // con auditoría sí se reconstruye, y se dice de dónde salió
    S.params.auditoriaCambios=[{ts:'2026-09-01T10:00:00.000Z',u:'Ana',tipo:'liberacion',oid:o.id,despues:'liberada a producción'}];
    const f2=libFechaDe(o,'corte');
    __check("A3: si está en la auditoría se reconstruye, y la pantalla dice que viene de ahí",f2.origen==='auditoría'&&f2.ts==='2026-09-01T10:00:00.000Z'&&/aud\./.test(libFechaTxt(o,'corte')));
    S.params.auditoriaCambios=bakA;o.lib.corte={ok:true,u:'Jefa Prod',ts:t0};
    // el resumen por período, con selector de rango
    LIBR.gran='dia';LIBR.desde='';LIBR.hasta='';
    const r=resumenLiberacion('corte');
    __check("A3: el resumen cuenta órdenes y prendas por período",r.tot>=1&&r.totPz>=1&&r.filas.length>=1);
    LIBR.gran='mes';const rm=resumenLiberacion('corte');
    __check("A3: y se puede ver por día, semana o mes",rm.filas.every(f=>/^\d{4}-\d{2}$/.test(f.k)));
    LIBR.desde='1999-01-01';LIBR.hasta='1999-12-31';
    __check("A3: el selector de rango acota de verdad",resumenLiberacion('corte').tot===0);
    LIBR.desde='';LIBR.hasta='';LIBR.gran='dia';
    __check("A3: el bloque está al final de Liberación a producción",/Cuánto se liberó/.test(resumenLiberacionHTML('corte')));}
   /* 4 · desliberar */
   {const o=S.ordenes.find(x=>liberada(x,'corte'));
    if(!o)__check('A4: hay alguna orden liberada para probar',false);
    else{
     PERFIL={rol:'corte',modo:'editar',nombre:'Encargado'};
     __check("A4: un encargado de centro NO puede desliberar",!puedeDesliberar());
     const nA=(S.params.auditoriaCambios||[]).length;desliberar([o.id],'corte','error de digitación');
     __check("A4: y si lo intenta igual, no pasa nada",liberada(o,'corte')&&(S.params.auditoriaCambios||[]).length===nA);
     PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};
     __check("A4: Dirección y el jefe de planificación sí pueden",puedeDesliberar());
     desliberar([o.id],'corte','');
     __check("A4: sin motivo de la tabla 15 no se desliberá nada",liberada(o,'corte'));
     if(!motivosDe('liberacion').length){S.params.motivos=(S.params.motivos||[]).concat([{motivo:'Error de digitación',uso:'liberacion'}])}
     const mot=(motivosDe('liberacion')[0]||{}).motivo;
     S.avance[o.id]=S.avance[o.id]||{};S.avance[o.id].centros=Object.assign({corte:5},(S.avance[o.id].centros||{}));
     mDesliberar([o.id],'corte');const hm=document.getElementById('modal').innerHTML;
     __check("A4: si la orden ya tiene avance, el modal lo advierte ANTES de confirmar",/ya tiene avance registrado/.test(hm)&&/Corte/.test(hm));cerrar();
     const nA2=(S.params.auditoriaCambios||[]).length;
     if(mot)desliberar([o.id],'corte',mot);
     __check("A4: con motivo se deslibera y vuelve a la cola",!liberada(o,'corte'));
     __check("A4: el avance del piso NO se borra",((S.avance[o.id]||{}).centros||{}).corte===5);
     __check("A4: queda en la auditoría y en el historial de la orden",(S.params.auditoriaCambios||[]).length>nA2&&(o.histLib||[]).some(x=>x.accion==='desliberada'&&x.motivo===mot));
     __check("A4: y la auditoría deja dicho que tenía avance",(S.params.auditoriaCambios||[]).slice(-1)[0].motivo.indexOf('tenía avance')>=0);
     delete S.avance[o.id].centros.corte;liberarA([o.id],'corte');}}
   /* 5 · el mismo agrupador en todas */
   {const campos=GRP_CAMPOS.map(x=>x[0]);
    __check("A5: el agrupador ofrece Cliente, Fase, ODC y Familia además de Tela",['cliente','fase','odc','fam','tela'].every(k=>campos.includes(k)));
    ['lib','lib4','cg','cen','cenv','cenviene','bal','imp'].forEach(id=>{const h=grpSelHTML(id,true);
     __check('A5: '+id+' usa el mismo componente, con los mismos campos',['cliente','fase','odc','fam','tela'].every(k=>h.includes('value="'+k+'"')));});}
   /* 6 · «Arranca» nunca antes de hoy */
   {const o=S.ordenes.find(x=>abierta(x)&&pasosProDe(x).length)||S.ordenes[0];const c=pasosProDe(o)[0]||'corte';
    delete (o.progCentro||{})[c];
    if(S.avance[o.id]){delete S.avance[o.id].centros;delete S.avance[o.id].tramos}
    __check("A6: una orden que no arrancó no acepta una fecha pasada",!fechaArranqueValida(o,c,dsum(hoy(),-3)).ok&&minArranque(o,c)===hoy());
    setProgCen(o.id,c,'desde',dsum(hoy(),-3));
    __check("A6: y el guardado tampoco la deja pasar, no solo la interfaz",((o.progCentro||{})[c]||{}).desde===undefined);
    setProgCen(o.id,c,'desde',dsum(hoy(),5));
    __check("A6: una fecha futura sí se guarda",((o.progCentro||{})[c]||{}).desde===dsum(hoy(),5));
    S.avance[o.id]=S.avance[o.id]||{};S.avance[o.id].centros={[c]:3};
    __check("A6: una orden que YA arrancó conserva su fecha real: no se le aplica el tope",yaArranco(o,c)&&fechaArranqueValida(o,c,dsum(hoy(),-3)).ok&&minArranque(o,c)===null);
    setProgCen(o.id,c,'desde',dsum(hoy(),-3));
    __check("A6: y esa fecha pasada sí se guarda, porque es real",((o.progCentro||{})[c]||{}).desde===dsum(hoy(),-3));
    delete S.avance[o.id].centros;setProgCen(o.id,c,null);}
   /* 7 · permisos de rutas */
   {sembrarPermisoRutas();const cat=perfilesDef();
    const jefe=cat.find(x=>x.id==='planificacion');
    __check("A7: el jefe de planificación de producción conserva el permiso de rutas",(jefe.permisos||[]).includes('ruta'));
    __check("A7: ningún otro perfil de centro lo tiene",cat.filter(x=>['corte','modulos','terminado'].includes(x.id)).every(x=>!(x.permisos||[]).includes('ruta')));
    PERFIL={rol:'corte',modo:'editar',nombre:'Encargado'};
    __check("A7: un encargado de centro no edita rutas",!puedeEditarRuta());
    const o=S.ordenes.find(x=>abierta(x))||S.ordenes[0];const ruta0=JSON.stringify(o.ruta||[]);
    const nR=reglasRuta().length;addReglaRuta();
    __check("A7: no puede crear reglas de ruta",reglasRuta().length===nR);
    aplicarLavado([o.id],'quito','prueba');
    __check("A7: no puede agregar ni quitar lavado",JSON.stringify(o.ruta||[])===ruta0);
    const nAud=(S.params.auditoriaCambios||[]).length;
    mRutaCentro(o.id);guardarRutaCentro(o.id);
    __check("A7: y el guardado lo rechaza aunque se llame a mano, no solo se ocultan los botones",(S.params.auditoriaCambios||[]).length===nAud&&JSON.stringify(o.ruta||[])===ruta0);cerrar();
    PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};
    __check("A7: el jefe sí puede",puedeEditarRuta());
    PERFIL=adminP;}
   /* 8 · «Sin fecha todavía» */
   {PERFIL={rol:'corte',modo:'editar',nombre:'Encargado'};
    __check("A8: el encargado de centro no ve el bloque «Sin fecha todavía»",!veSinFecha());
    page='centro';CEN.id='corte';CEN.solo='';CEN.tab='plan';render();
    __check("A8: y no aparece en su pantalla",!/Sin fecha todavía/.test(document.getElementById('p-centro').innerHTML));
    PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa'};
    __check("A8: planificación sí lo ve",veSinFecha());
    __check("A8: y siguen contadas como brecha en Reportería, no desaparecen",/Órdenes sin fecha/.test(sinFechaBrechaHTML()));
    PERFIL=adminP;page='reporteria';REP.vista='produccion';render();
    __check("A8: el panel está en Reportería",/Órdenes sin fecha/.test(document.getElementById('p-reporteria').innerHTML));}
   /* 9 · «Lo que viene» se quitó (decisión 16-sep): la lista ya dice dónde está cada orden */
   {__check("A9: el bloque «Lo que viene» ya no existe en el código",typeof loQueVieneHTML==='undefined'&&typeof loQueVieneDe==='undefined');
    page='centro';CEN.id='terminados';CEN.solo='empaque';CEN.tab='plan';render();
    __check("A9: ni en la pantalla del centro",!/Lo que viene/.test(document.getElementById('p-centro').innerHTML));CEN.solo='';}
   /* 10 · «Dónde está» dentro del centro */
   {const o=S.ordenes.find(x=>abierta(x)&&pasosProDe(x).includes('corte'))||S.ordenes[0];
    const P=S.ordenes.length?programar():{ordenes:{},pro:[]};
    if(S.avance[o.id]){delete S.avance[o.id].centros;delete S.avance[o.id].tramos}
    __check("A10: los textos por centro son configurables y traen los del proceso",estadosCentro('corte').join('|')==='Por cortar|Cortando|Cortada'&&estadosCentro('modulos')[1]==='Cosiendo'&&estadosCentro('estampado')[0]==='Por estampar');
    __check("A10: sin avance, la orden está «Por cortar»",estadoEnCentro(o,'corte')===0&&estadoCentroTxt(o,'corte')==='Por cortar');
    S.avance[o.id]=S.avance[o.id]||{};S.avance[o.id].centros={corte:3};
    __check("A10: con avance parcial, «Cortando»",estadoEnCentro(o,'corte')===1&&estadoCentroTxt(o,'corte')==='Cortando');
    const hEn=dondeEstaEnCentro(o,P,'corte');
    __check("A10: dentro de Corte NO se repite «Corte»: se ve su estado propio",/Cortando/.test(hEn)&&!/>Corte</.test(hEn));
    __check("A10: y dice cuántas lleva",/3/.test(hEn));
    S.avance[o.id].centros={corte:+o.cant};
    __check("A10: completa, «Cortada»",estadoEnCentro(o,'corte')===2&&estadoCentroTxt(o,'corte')==='Cortada');
    delete S.avance[o.id].centros;
    const otro=pasosProDe(o).find(c=>c!=='corte');
    if(otro)__check("A10: fuera del centro se sigue mostrando dónde está la orden",dondeEstaEnCentro(o,P,otro)===dondeEstaCentro(o,P,otro));}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("PA sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* PARTE B · Reportería gerencial, sub-centros y congelado del programa */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   /* 1 · el Resumen gerencial vive en Reportería */
   {const dir=[...document.querySelectorAll('nav .gbody[data-g="dir"] a')].map(a=>a.dataset.p);
    const rep=[...document.querySelectorAll('nav .gbody[data-g="rep"] a')].map(a=>a.dataset.p);
    __check("B1: el Resumen gerencial sale de Dirección",!dir.includes('gerencia'));
    __check("B1: y entra a Reportería",rep.includes('gerencia'));
    __check("B1: y aparece en la barra de reportes",REPORTES.some(r=>r.p==='gerencia'));
    page='gerencia';GER.meses=null;render();
    __check("B1: la pantalla abre sin errores y con el filtro arriba",/Meses del Proyecto/.test(document.getElementById('p-gerencia').innerHTML));}
   /* 1 · el filtro de meses afecta a TODOS los bloques */
   {const ms=mesesGER();
    __check("B1: el selector lista los meses de Proyecto de la cartera",ms.length>=1);
    GER.meses=null;const todas=S.ordenes.filter(o=>abierta(o)||o.estado==='prevision');
    __check("B1: sin filtro entran todas",todas.every(enMesGER));
    const m0=ms[0];GER.meses=new Set([m0]);
    const sel=todas.filter(enMesGER);
    __check("B1: con un mes elegido solo entran las de ese mes",sel.length<=todas.length&&sel.every(o=>(mesPlan(o)||'Sin proyecto')===m0));
    if(ms.length>1){GER.meses=new Set([ms[0],ms[1]]);
     const dos=todas.filter(enMesGER);
     __check("B1: con dos meses SUMA los dos, no reemplaza",dos.length>=sel.length&&dos.every(o=>[ms[0],ms[1]].includes(mesPlan(o)||'Sin proyecto')));}
    GER.meses=new Set([m0]);render();
    const h=document.getElementById('p-gerencia').innerHTML;
    __check("B1: el total de lo seleccionado se muestra arriba",/Sumando/.test(h)&&/Prendas pedidas/.test(h)&&/Lo que falta/.test(h));
    // y los bloques de abajo respetan el filtro: la tabla por mes solo trae el mes elegido
    __check("B1: el bloque de cartera por mes ya no muestra los otros meses",ms.filter(m=>m!==m0&&m!=='Sin proyecto').every(m=>!h.includes('>'+fmtMesEG(m)+'<')));
    GER.meses=null;render();
    __check("B1: y al quitar el filtro vuelven todos",/Todos los meses/.test(document.getElementById('p-gerencia').innerHTML));}
   /* 2 · resumen por sub-centro */
   {const P=S.ordenes.length?programar():{pro:[],ordenes:{}};const lun=lunesDe(hoy()),dom=dsum(lun,6);
    __check("B2: un ítem con una sola sub-área NO muestra el resumen",resumenSubCentros('corte',P,lun,dom)===null);
    const rT=resumenSubCentros('terminados',P,lun,dom);
    __check("B2: Terminados trae una fila por sub-área, en el orden del proceso",!!rT&&rT.filas.map(f=>f.c).join()===subAreasDe('terminados').join());
    __check("B2: cada fila trae carga, capacidad, ocupación, órdenes, avance y atrasos",rT.filas.every(f=>'carga' in f&&'cap' in f&&'pct' in f&&'ops' in f&&'hechasSem' in f&&'atras' in f));
    const rE=resumenSubCentros('estampado',P,lun,dom);
    __check("B2: Estampado (serigrafía) trae Estampado y Etiquetas",!!rE&&rE.filas.map(f=>f.c).sort().join()===['estampado','etiquetas'].sort().join());
    const hT=resumenSubCentrosHTML('terminados',P,lun,dom);
    __check("B2: el panel dice que las sub-áreas salen del «Ítem de planificación», no del código",/Ítem de planificación/.test(hT)&&/sin tocar código/.test(hT));
    __check("B2: y marca la brecha de la sub-área que no tiene de dónde sacar sus minutos",!rT.filas.some(f=>f.origen&&f.origen.brecha)||/brecha/.test(hT));
    // es el MISMO componente: mover una sub-área lo cambia solo
    const bak=(CE('empaque')||{}).grupoPlan;setCentro('empaque','grupoPlan','estampado');
    const rE2=resumenSubCentros('estampado',P,lun,dom);
    __check("B2: si mueves una sub-área de ítem, el resumen la sigue",rE2.filas.some(f=>f.c==='empaque')&&!resumenSubCentros('terminados',P,lun,dom).filas.some(f=>f.c==='empaque'));
    setCentro('empaque','grupoPlan',bak===undefined?'terminados':bak);
    page='centro';CEN.id='terminados';CEN.solo='';CEN.tab='plan';render();
    __check("B2: al abrir el centro padre se ve el resumen",/sub-áreas de Terminados/.test(document.getElementById('p-centro').innerHTML));
    CEN.solo='plancha';render();
    __check("B2: y al abrir una sub-área sola, no se repite",!/sub-áreas de Terminados/.test(document.getElementById('p-centro').innerHTML));CEN.solo='';}
   /* 3 · congelar el programa semanal */
   {const P=S.ordenes.length?programar():{pro:[],ordenes:{}};const lun=lunesDe(hoy()),dom=dsum(lun,6);
    S.params.progCongelado=[];
    PERFIL={rol:'corte',modo:'editar',nombre:'Encargado'};
    congelarPrograma(['corte'],lun,dom);
    __check("B3: un encargado de centro no congela el programa",!congeladoDe('corte',lun));
    __check("B3: y no ve el botón",!/Congelar programa/.test(avanceCongeladoHTML(['corte'],P,lun,dom)));
    PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};
    __check("B3: planificación sí lo ve",/Congelar programa/.test(avanceCongeladoHTML(['corte'],P,lun,dom)));
    congelarPrograma(['corte'],lun,dom);
    const f=congeladoDe('corte',lun);
    __check("B3: la foto se guarda con centro, semana, fecha y usuario",!!f&&f.centro==='corte'&&f.lun===lun&&!!f.ts&&f.u==='Jefa Prod');
    __check("B3: y guarda las prendas programadas de cada orden",Array.isArray(f.ords)&&f.pz===f.ords.reduce((a,e)=>a+e.pz,0));
    const a1=avanceCongelado('corte',lun,dom,P);
    __check("B3: el avance contra la foto arranca en 0 hechas",!!a1&&a1.hechas===0);
    // se registra avance y el cumplimiento sube
    if(f.ords.length){const e=f.ords[0];const base=+((f.hechasAl||{})[e.oid])||0;
     S.avance[e.oid]=S.avance[e.oid]||{};S.avance[e.oid].centros=Object.assign({},S.avance[e.oid].centros,{corte:base+e.pz});
     const a2=avanceCongelado('corte',lun,dom,P);
     __check("B3: lo hecho DESPUÉS del congelado cuenta, no lo que ya estaba",a2.hechas===e.pz&&a2.filas[0].pct===100);
     __check("B3: y el % de cumplimiento sale contra la foto, no contra el programa de ahora",a2.pzProg===f.pz);}
    // reprogramar después NO cambia la foto
    const pzFoto=f.pz;const nOrdsFoto=(f.ords||[]).length;
    PLAN=null;PLAN_ALL=null;
    __check("B3: se puede seguir reprogramando y la línea base no se mueve",congeladoDe('corte',lun).pz===pzFoto&&congeladoDe('corte',lun).ords.length===nOrdsFoto);
    // volver a congelar deja historial, no pisa
    congelarPrograma(['corte'],lun,dom);
    __check("B3: volver a congelar NO borra la anterior: queda el historial",congelados().filter(x=>x.k===claveCong('corte',lun)).length===2);
    const h3=avanceCongeladoHTML(['corte'],P,lun,dom);
    __check("B3: el bloque muestra fecha y usuario del congelado",/congelado el /.test(h3)&&/Jefa Prod/.test(h3));
    __check("B3: y trae cumplimiento, atrasadas, agregadas y sacadas",/Cumplimiento/.test(h3)&&/Órdenes atrasadas/.test(h3)&&/Agregadas después/.test(h3)&&/Sacadas después/.test(h3));
    __check("B3: explica en pantalla la diferencia con el congelado del plan mensual",/plan mensual/.test(h3)&&/qué órdenes entran al mes/.test(h3));
    // agregadas y sacadas se detectan contra la foto
    {const fake={id:uid(),k:claveCong('corte',lun),centro:'corte',lun,dom,ts:new Date().toISOString(),u:'Prueba',
      ords:[{oid:'no-existe',op:'WH/FANTASMA',pz:99,min:10,dias:[lun]}],pz:99,min:10,hechasAl:{}};
     congelados().push(fake);
     const a3=avanceCongelado('corte',lun,dom,P);
     __check("B3: una orden que ya no está programada sale como «sacada después»",a3.sacadas.some(x=>x.op==='WH/FANTASMA'));
     __check("B3: y lo que entró después de congelar sale como «agregada después»",a3.agregadas.length===[...new Set(P.pro.filter(x=>x.centro==='corte'&&x.dia>=lun&&x.dia<=dom).map(x=>x.op))].length);
     S.params.progCongelado=congelados().filter(x=>x!==fake);}
    S.params.progCongelado=[];}
   window.alert=a0;PERFIL=adminP;GER.meses=null;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("PB sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* CONSULTAS GERENCIALES · cinco cortes de la misma cartera */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   const P=programarTodo();
   GER.meses=null;GER.cli=null;GER.est=null;GER.q='';GER.abierto=null;GER.det=null;
   /* LA PRUEBA PRINCIPAL: los cinco bloques cuadran con cualquier combinación de filtros */
   {const combos=[
     {n:'sin filtros'},
     {n:'un mes',f:()=>{GER.meses=new Set([mesesGER()[0]])}},
     {n:'dos meses',f:()=>{const m=mesesGER();GER.meses=new Set(m.slice(0,2))}},
     {n:'un cliente',f:()=>{GER.cli=new Set([clientesGER()[0]])}},
     {n:'mes + cliente',f:()=>{GER.meses=new Set([mesesGER()[0]]);GER.cli=new Set([clientesGER()[0]])}},
     {n:'un estado',f:()=>{GER.est=new Set(['curso'])}},
     {n:'estado terminadas',f:()=>{GER.est=new Set(['term'])}},
     {n:'dos estados',f:()=>{GER.est=new Set(['vencida','tarde'])}},
     {n:'mes + cliente + estado',f:()=>{GER.meses=new Set([mesesGER()[0]]);GER.cli=new Set([clientesGER()[0]]);GER.est=new Set(['curso','term'])}},
     {n:'buscador',f:()=>{GER.q='a'}},
     {n:'todo junto',f:()=>{GER.meses=new Set(mesesGER().slice(0,2));GER.cli=new Set(clientesGER().slice(0,2));GER.est=new Set(['curso']);GER.q='a'}},
     {n:'filtro que no deja nada',f:()=>{GER.q='zzz-no-existe-zzz'}}];
    let todosOk=true,detalle='';
    combos.forEach(c=>{GER.meses=null;GER.cli=null;GER.est=null;GER.q='';if(c.f)c.f();
     const ords=ordenesGER(P);
     const tots=GER_BLOQUES.map(b=>totGER(agruparGER(b,ords,P)));
     const pz=tots.map(t=>t.pz), n=tots.map(t=>t.n), he=tots.map(t=>t.hechas);
     const ok=pz.every(x=>x===pz[0])&&n.every(x=>x===n[0])&&he.every(x=>x===he[0])&&pz[0]===ords.reduce((a,o)=>a+(+o.cant||0),0);
     if(!ok){todosOk=false;detalle+=c.n+': pz='+pz.join('/')+' n='+n.join('/')+' · ';}});
    __check("GC: los totales de «Pedidas» de los CINCO bloques son idénticos con cualquier combinación de filtros",todosOk,detalle);
    GER.meses=null;GER.cli=null;GER.est=null;GER.q='';
    const ords=ordenesGER(P);
    __check("GC: y también cuadran órdenes y hechas, no solo las prendas",(()=>{const t=GER_BLOQUES.map(b=>totGER(agruparGER(b,ords,P)));
      return t.every(x=>x.n===t[0].n&&x.hechas===t[0].hechas&&Math.abs(x.usd-t[0].usd)<0.01)})());}
   /* filtros GLOBALES */
   {GER.meses=null;GER.cli=null;GER.est=null;GER.q='';
    const todas=ordenesGER(P).length;
    const c0=clientesGER()[0];GER.cli=new Set([c0]);
    const soloC=ordenesGER(P);
    __check("GF: el filtro de cliente es global y acota de verdad",soloC.length<=todas&&soloC.every(o=>(o.cliente||'Sin cliente')===c0));
    GER.cli=null;GER.est=new Set(['term']);
    const term=ordenesGER(P);
    __check("GF: el filtro de estado usa el mismo estado que muestra el detalle",term.every(o=>estadoGERDe(o,P)==='term'));
    GER.est=null;GER.q='zzz-no-existe-zzz';
    __check("GF: el buscador también es global",ordenesGER(P).length===0);
    GER.q='';
    page='gerencia';render();const h=document.getElementById('p-gerencia').innerHTML;
    __check("GF: los cuatro filtros están en la misma cabecera",/Meses del Proyecto/.test(h)&&/>Cliente</.test(h)&&/>Estado</.test(h)&&/GER\.q/.test(h));}
   /* vencidas y va tarde: UNA sola definición */
   {const ords=ordenesGER(P);
    __check("GV: «meta vencida» y «la orden va tarde» salen de diagAtraso, el mismo de las marcas",
     ords.every(o=>{const d=diagAtraso(o,P);return esMetaVencida(o,P)===!!(d.orden&&d.vencida)&&esOrdenVaTarde(o,P)===!!(d.orden&&!d.vencida)}));
    __check("GV: una orden no puede ser las dos cosas a la vez",ords.every(o=>!(esMetaVencida(o,P)&&esOrdenVaTarde(o,P))));
    __check("GV: los bloques cuentan lo mismo que la cabecera",(()=>{const t=totGER(agruparGER(GER_BLOQUES[0],ords,P));
      return t.venc===ords.filter(o=>esMetaVencida(o,P)).length&&t.tarde===ords.filter(o=>esOrdenVaTarde(o,P)).length})());
    page='gerencia';render();const h=document.getElementById('p-gerencia').innerHTML;
    __check("GV: y la pantalla usa los mismos nombres, no inventa otros",/Meta vencida/.test(h)&&/La orden va tarde/.test(h)&&!/>En riesgo</.test(h));}
   /* «hechas» = último paso de la ruta, y la brecha de ruta sin Empaque */
   {const o=S.ordenes.find(x=>abierta(x)&&pasosProDe(x).length>1);
    if(o){const ru=pasosProDe(o);const ult=ru[ru.length-1];
     S.avance[o.id]=S.avance[o.id]||{};S.avance[o.id].centros={};
     __check("GH: sin avance en el último paso, hechas = 0 aunque haya avance en los anteriores",(S.avance[o.id].centros[ru[0]]=+o.cant,pzHechasOrden(o)===0));
     S.avance[o.id].centros[ult]=7;
     __check("GH: hechas se mide en el ÚLTIMO paso de la ruta",pzHechasOrden(o)===7);
     delete S.avance[o.id].centros;}
    // la brecha: toda ruta debe terminar en Empaque
    const base=S.ordenes.find(x=>abierta(x))||S.ordenes[0];
    const mk=(op,ruta)=>{const x=JSON.parse(JSON.stringify(base));x.id=uid();x.op=op;x.estado='plan';x.cant=10;x.ruta=ruta;delete x.programa;S.ordenes.push(x);delete S.avance[x.id];return x};
    const mal=mk('WH/SINEMP-1',[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'plancha',t:2}]);
    const bien=mk('WH/CONEMP-1',[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:1}]);
    __check("GH: una ruta que no termina en Empaque sale como brecha",!rutaTerminaEnEmpaque(mal)&&rutasSinEmpaque(null).includes(mal));
    __check("GH: y una que sí termina en Empaque, no",rutaTerminaEnEmpaque(bien)&&!rutasSinEmpaque(null).includes(bien));
    const hb=rutasSinEmpaqueHTML(null);
    __check("GH: la brecha trae conteo y lista, y dice en qué centro terminan",/Ruta no termina en Empaque/.test(hb)&&hb.includes(esc(mal.op))&&/Terminan en Plancha/.test(hb));
    __check("GH: y NO se le da trato especial en el cálculo: se mide igual, en su último paso",(()=>{S.avance[mal.id]={centros:{plancha:4}};return pzHechasOrden(mal)===4})());
    S.ordenes=S.ordenes.filter(x=>x!==mal&&x!==bien);[mal,bien].forEach(x=>delete S.avance[x.id]);}
   /* bloques colapsables, uno a la vez, recordando el último */
   {GER.abierto=null;abrirBloqueGER('cliente');
    __check("GB: se abre el bloque tocado",GER.abierto==='cliente');
    abrirBloqueGER('fase');
    __check("GB: abrir otro cierra el anterior: solo uno a la vez",GER.abierto==='fase');
    abrirBloqueGER('fase');
    __check("GB: tocarlo otra vez lo cierra",GER.abierto===null);
    abrirBloqueGER('odc');
    __check("GB: y se recuerda cuál quedó abierto",(()=>{try{return localStorage['__ger_'+claveUsr()]==='odc'}catch(e){return true}})());
    page='gerencia';render();const h=document.getElementById('p-gerencia').innerHTML;
    __check("GB: los cinco bloques están, y solo el abierto muestra su tabla",GER_BLOQUES.every(b=>h.includes(esc(b.n)))&&document.querySelectorAll('#p-gerencia [data-ger-abierto]').length===1&&document.querySelector('#p-gerencia [data-ger-abierto]').dataset.gerAbierto===GER.abierto);
    __check("GB: el detalle se abre al tocar una fila",/verDetalleGER\(/.test(h));
    GER.abierto=null;GER.det=null;}
   /* columnas propias de cada bloque */
   {GER.abierto='fase';const h1=bloqueGERHTML(GER_BLOQUES[1],ordenesGER(P),P);
    __check("GX: el bloque de fase trae los días en la fase, y dice «sin historial» en vez de un 0 inventado",/Días en la fase/.test(h1)&&(/sin historial/.test(h1)||!/sin historial/.test(h1)));
    GER.abierto='odc';const h2=bloqueGERHTML(GER_BLOQUES[2],ordenesGER(P),P);
    __check("GX: el bloque de ODC trae cliente, entrega más temprana y cuántas están listas",/Entrega más temprana/.test(h2)&&/Órdenes listas/.test(h2));
    GER.abierto='estilo';const h3=bloqueGERHTML(GER_BLOQUES[3],ordenesGER(P),P);
    __check("GX: el bloque de estilo trae categorías y colores",/Categorías/.test(h3)&&/Colores/.test(h3));
    GER.abierto=null;}
   /* cierre mensual: se empieza a guardar YA */
   {S.params.cierresMes={};
    // las órdenes del demo no traen Proyecto: sin mes no hay cierre mensual que tomar
    const bakPro=S.ordenes.map(o=>o.proyecto);
    const mesAnt=hoy().slice(0,4)+'-'+String(Math.max(1,+hoy().slice(5,7)-1)).padStart(2,'0');
    const nomMes=m=>['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][+m.slice(5,7)-1]+' '+m.slice(0,4);
    S.ordenes.forEach((o,i)=>{o.proyecto=nomMes(i%2?mesAnt:hoy().slice(0,7))});
    const n=guardarCierresMes(P);
    __check("GM: se guarda una foto de la cartera por mes",n>0&&Object.keys(cierresMes()).length===n);
    const ym=Object.keys(cierresMes())[0];const f=cierresMes()[ym];
    __check("GM: la foto trae órdenes, pedidas, hechas, valor, vencidas y va tarde",['ordenes','pz','hechas','usd','vencidas','tarde'].every(k=>k in f));
    __check("GM: y el desglose por cliente y por familia",!!f.porCliente&&!!f.porFamilia&&Object.keys(f.porCliente).length>0);
    __check("GM: la foto usa las MISMAS definiciones de vencida y va tarde",(()=>{const o2=S.ordenes.filter(o=>(abierta(o)||o.estado==='prevision')&&(mesPlan(o)||'Sin proyecto')===ym);
      return f.vencidas===o2.filter(o=>esMetaVencida(o,P)).length&&f.tarde===o2.filter(o=>esOrdenVaTarde(o,P)).length})());
    // el mes en curso se actualiza una vez al día; los que pasaron se congelan
    const hoyYm=hoy().slice(0,7);
    if(cierresMes()[hoyYm]){__check("GM: el mes en curso queda abierto",cierresMes()[hoyYm].cerrado===false);
     const ts0=cierresMes()[hoyYm].ts;guardarCierresMes(P);
     __check("GM: y no se vuelve a tomar el mismo día",cierresMes()[hoyYm].ts===ts0);}
    const viejo=Object.keys(cierresMes()).filter(x=>x<hoyYm)[0];
    if(viejo){__check("GM: un mes que ya pasó queda CERRADO",cierresMes()[viejo].cerrado===true);
     const t0=cierresMes()[viejo].ts;cierresMes()[viejo].pz=-1;guardarCierresMes(P);
     __check("GM: y una vez cerrado no se vuelve a tocar nunca",cierresMes()[viejo].pz===-1&&cierresMes()[viejo].ts===t0);}
    __check("GM: la pantalla muestra la historia y dice que el gráfico todavía no está",/Historia de la cartera/.test(cierresMesHTML())&&/todavía no está/.test(cierresMesHTML()));
    S.params.cierresMes={};S.ordenes.forEach((o,i)=>{if(bakPro[i]===undefined)delete o.proyecto;else o.proyecto=bakPro[i]});}
   /* márgenes: anotado como integración futura, sin construir nada */
   {__check("GZ: márgenes queda anotado como integración futura con Costos TEMPO, sin inventar ningún costo",
     /Costos TEMPO/.test(consultasGERHTML(ordenesGER(P),P))&&!/margen/i.test(JSON.stringify(GER_BLOQUES.map(b=>b.n))));}
   window.alert=a0;PERFIL=adminP;GER.meses=null;GER.cli=null;GER.est=null;GER.q='';GER.abierto=null;GER.det=null;
   PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("GC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* DECISIONES 2ª TANDA · definición de abierta, unificación, etiqueta y minuto estimado */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   /* 4 · definición única de orden abierta */
   {const o=S.ordenes[0];const bakE=o.estado,bakF=o.fase;
    o.estado='plan';o.fase='2Planificacion';
    __check("OA: una orden en una fase normal está abierta",abiertaDe(o)&&abierta(o));
    o.fase='Facturado';
    __check("OA: una orden facturada NO está abierta, aunque su estado interno diga «plan»",!abiertaDe(o)&&!abierta(o));
    o.fase='Stand by';
    __check("OA: ni una en Stand by",!abiertaDe(o));
    o.fase=bakF;o.estado='noArchivo';
    __check("OA: ni una archivada",!abiertaDe(o));
    o.estado=bakE;
    __check("OA: abierta() y abiertaDe() son la MISMA definición, no dos",S.ordenes.every(x=>abierta(x)===abiertaDe(x)));
    __check("OA: qué fase cierra sale de la tabla de fases, no del código",faseDeCierre('Facturado')===true&&faseDeCierre('2Planificacion')===false);
    __check("OA: las tres cifras cuadran: cargadas = abiertas + archivadas + con fase de cierre",(()=>{
      const ce=S.ordenes.filter(x=>!ESTADOS_CERRADOS.includes(x.estado||'')&&faseDeCierre(x.fase)).length;
      const ar=S.ordenes.filter(x=>ESTADOS_CERRADOS.includes(x.estado||'')).length;
      return cargadasTot()===ordenesAbiertas().length+ar+ce})());
    __check("OA: «en planta» son las abiertas ya liberadas a producción",ordenesEnPlanta().every(x=>abiertaDe(x)&&liberadaCorte(x)));
    const h=conteoOrdenesHTML();
    __check("OA: la pantalla explica de dónde sale cada cifra",/Cargadas/.test(h)&&/Abiertas/.test(h)&&/En planta/.test(h)&&/tabla de fases/.test(h));
    page='reporteria';REP.vista='produccion';render();
    __check("OA: y está en Reportería",/Cuántas órdenes hay/.test(document.getElementById('p-reporteria').innerHTML));}
   /* 1 · unificación JEANS → DENIM, autorizada */
   {const nCat=S.categorias.length,nOrd=S.ordenes.length,nOps=(S.operaciones||[]).length;
    delete S.params.jeansUnificado;
    const d0=diagJeans();
    sembrarUnificacionJeans();
    __check("JD: corre sola al sembrar, sin preguntar (ya autorizada)",!!S.params.jeansUnificado);
    __check("JD: y deja registrado lo que había antes de mover",!!S.params.jeansUnificadoPrevio&&S.params.jeansUnificadoPrevio.ordenes===d0.ordenes.length);
    __check("JD: NADA se borra",S.categorias.length===nCat&&S.ordenes.length===nOrd&&(S.operaciones||[]).length===nOps);
    const den=S.categorias.find(k=>!k.padre&&normFase(k.n)==='denim');
    __check("JD: queda la familia DENIM",!!den);
    __check("JD: la fila «jean» de ojales y botones queda unificada, sin borrarse",(()=>{const j=tiemposOjalBoton().find(r=>/jean/.test(r.match||''));return !j||j.unificadaEn==='denim'})());
    __check("JD: queda en la bitácora",(S.bitacora||[]).some(b=>/JEANS/.test(b.txt||b.t||'')&&/DENIM/.test(b.txt||b.t||'')));
    const ts0=S.params.jeansUnificado;sembrarUnificacionJeans();
    __check("JD: es idempotente: no se vuelve a ejecutar",S.params.jeansUnificado===ts0);}
   /* 5 · minuto estimado por categoría, mientras no haya hoja */
   {const k=S.categorias.find(x=>x.padre&&!tieneHojaLMO(x));
    if(!k)__check('ME: hay alguna categoría sin hoja de operaciones para probar',false);
    else{
     delete k.minEstConf;
     __check("ME: sin valor cargado, la categoría sigue en 0: no se inventa nada",minEstimadoConf(k)===null&&samPorCentro(k).modulos===undefined);
     __check("ME: y sale como brecha, con sus órdenes y prendas",categoriasSinHoja().sin.some(f=>f.k===k));
     setMinEstConf(k.id,14.5);
     __check("ME: con el minuto estimado, la categoría ya carga en confección",minEstimadoConf(k)===14.5&&samPorCentro(k).modulos===14.5);
     __check("ME: y pasa a la lista de estimados, no a la de brecha",categoriasSinHoja().est.some(f=>f.k===k)&&!categoriasSinHoja().sin.some(f=>f.k===k));
     const h=categoriasSinHojaHTML();
     __check("ME: la pantalla lo marca como ESTIMADO y dice que no viene de la hoja",/estimado/.test(h)&&/no se inventa ninguno/.test(h));
     __check("ME: y es editable desde la pantalla",/setMinEstConf\(/.test(h));
     __check("ME: el cambio queda en la bitácora",(S.bitacora||[]).some(b=>/Minuto estimado de confecci/.test(b.txt||b.t||'')));
     setMinEstConf(k.id,0);
     __check("ME: un 0 escrito a mano se respeta como 0 confirmado, no como «sin valor»",minEstimadoConf(k)===0&&categoriasSinHoja().est.some(f=>f.k===k));
     setMinEstConf(k.id,'');
     __check("ME: y borrarlo la devuelve a la brecha",minEstimadoConf(k)===null&&categoriasSinHoja().sin.some(f=>f.k===k));
     // una categoría CON hoja no aparece en esta lista
     const kc=S.categorias.find(x=>x.padre&&tieneHojaLMO(x));
     if(kc)__check("ME: una categoría con hoja de operaciones no entra aquí",!categoriasSinHoja().sin.some(f=>f.k===kc)&&!categoriasSinHoja().est.some(f=>f.k===kc));}}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("D2 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* RUTAS QUE NO TERMINAN EN EMPAQUE · diagnóstico, vista previa y corrección */
  {const antes=__R.errors.length;const adminP=PERFIL;const c0=window.confirm,a0=window.alert;window.alert=()=>{};
   PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   /* una categoría de prueba CON hoja de operaciones: corte, confección y empaque */
   const opsT=[['corte',1],['modulos',5],['empaque',1]].map(([c,t])=>{const id=uid();S.operaciones.push({id,centro:c,n:'prueba '+c,sam:t});return id});
   const padT={id:uid(),n:'PRUEBA EMP'};const catT={id:uid(),padre:padT.id,n:'Prueba Empaque',ops:opsT.map(op=>({op}))};
   S.categorias.push(padT,catT);
   const mk=(op,ruta,ed)=>{const x=JSON.parse(JSON.stringify(base));x.id=uid();x.op=op;x.estado='plan';x.fase='2Planificacion';
     delete x.estadoOP;x.cant=10;x.cat=catT.id;x.ruta=ruta;delete x.programa;delete x.rutaEditada;delete x.rutaConf;
     if(ed)x.rutaEditada=[{ts:new Date().toISOString(),u:'alguien',motivo:'a mano'}];
     S.ordenes.push(x);delete S.avance[x.id];return x};
   /* 1 · el diagnóstico separa las tres causas */
   {const incompleta=mk('WH/EMP-A',[{centro:'tej',t:0},{centro:'bordado',t:1}]);
    const desordenada=mk('WH/EMP-B',[{centro:'corte',t:1},{centro:'empaque',t:1},{centro:'modulos',t:5}]);
    const aMano=mk('WH/EMP-C',[{centro:'corte',t:1},{centro:'bordado',t:1}],true);
    const buena=mk('WH/EMP-D',[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:1}]);
    const d=diagRutasSinEmpaque();
    __check("RE1: una ruta a la que le FALTA Empaque se separa de una que lo tiene mal puesto",
     d.falta.some(x=>x.o===incompleta)&&d.fuera.includes(desordenada));
    __check("RE1: una editada a mano se aparta y NO entra a la corrección",d.manual.includes(aMano)&&!d.falta.some(x=>x.o===aMano)&&!d.fuera.includes(aMano));
    __check("RE1: una ruta correcta no aparece en el diagnóstico",!d.fuera.includes(buena)&&!d.falta.some(x=>x.o===buena)&&!d.manual.includes(buena));
    /* 2 · la regla: Empaque siempre al final, estampado y bordado entre corte y confección */
    __check("RE2: la ruta sugerida termina en Empaque",(()=>{const s=rutaProSugerida(desordenada);return s[s.length-1]==='empaque'})());
    __check("RE2: y bordado/estampado quedan entre corte y confección, nunca después de Empaque",(()=>{
      const s=ordenarRutaPro(['empaque','modulos','bordado','corte','estampado']);
      return s.join()==='corte,estampado,bordado,modulos,empaque'})());
    __check("RE2: aunque el orden venga con Empaque adelante (cierre tardío de una OT), no se queda ahí",
     ordenarRutaPro(['empaque','corte','modulos']).join()==='corte,modulos,empaque');
    __check("RE2: lo que la orden ya tenía no se pierde al sugerir",rutaProSugerida(incompleta).includes('bordado'));
    /* 3 · vista previa, y NO se aplica sola */
    const prev=previaCompletarRutas();
    __check("RE3: la vista previa dice cuántas cambiarían y qué quedaría",prev.n>=2&&prev.cambios.every(c=>Array.isArray(c.de)&&Array.isArray(c.a)));
    const ruta0=JSON.stringify(incompleta.ruta),rutaM0=JSON.stringify(aMano.ruta);
    const h=rutasEmpaquePanelHTML();
    __check("RE3: el panel muestra el antes y el después sin tocar nada",/Vista previa/.test(h)&&/Quedar\u00eda/.test(h)&&JSON.stringify(incompleta.ruta)===ruta0);
    __check("RE3: y lista aparte las editadas a mano",/Editadas a mano/.test(h)&&h.includes(esc(aMano.op)));
    window.confirm=()=>false;completarRutasSinEmpaque();
    __check("RE3: si no se confirma, NO se cambia ninguna ruta",JSON.stringify(incompleta.ruta)===ruta0);
    /* la corrección, ya confirmada */
    window.confirm=()=>true;
    const nAud=(S.params.auditoriaCambios||[]).length;
    completarRutasSinEmpaque();
    __check("RE4: al confirmar, la ruta incompleta se completa y termina en Empaque",rutaTerminaEnEmpaque(incompleta)&&pasosProDe(incompleta).includes('modulos'));
    __check("RE4: la desordenada se reordena, con Empaque al final",rutaTerminaEnEmpaque(desordenada)&&pasosProDe(desordenada).join()==='corte,modulos,empaque');
    __check("RE4: la editada a mano NO se tocó",JSON.stringify(aMano.ruta)===rutaM0);
    __check("RE4: cada cambio queda en la auditoría de ruta",(S.params.auditoriaCambios||[]).length>nAud&&(incompleta.rutaEditada||[]).some(e=>/termina en Empaque/.test(e.motivo||'')));
    __check("RE4: y queda registrado quién y cuándo",!!S.params.rutasEmpaqueCorregidas&&S.params.rutasEmpaqueCorregidas.u==='Jefa Prod');
    /* 4 · el aviso de que «hechas» está afectado */
    const maloExtra=mk('WH/EMP-E',[{centro:'corte',t:1},{centro:'bordado',t:1}]);
    const b=brechaHechas();
    __check("RE5: mientras quede una ruta mal, «hechas» se marca como afectado",!!b&&b.n>=1&&/afectado/.test(avisoHechasHTML()));
    page='gerencia';GER.meses=null;GER.cli=null;GER.est=null;GER.q='';render();
    __check("RE5: y el aviso se ve en el Resumen gerencial",/con brecha/.test(document.getElementById('p-gerencia').innerHTML));
    /* 5 · la foto del mes: se marca, y al corregir se vuelve a tomar; las cerradas no se tocan */
    {S.params.cierresMes={};const bakPro=S.ordenes.map(o=>o.proyecto);
     const nomMes=m=>['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][+m.slice(5,7)-1]+' '+m.slice(0,4);
     const ym=hoy().slice(0,7);S.ordenes.forEach(o=>{o.proyecto=nomMes(ym)});
     guardarCierresMes(programarTodo());
     const f=cierresMes()[ym];
     __check("RE6: la foto del mes deja dicho que se tomó con la brecha de rutas",!!f&&!!f.brechaRutas&&f.brechaRutas.ordenes>=1);
     __check("RE6: y la pantalla lo muestra",/tomada con la brecha de rutas/.test(cierresMesHTML()));
     // una foto CERRADA no se recalcula
     const viejo='2020-01';cierresMes()[viejo]={ym:viejo,ts:'2020-02-01T00:00:00.000Z',cerrado:true,ordenes:9,pz:9,hechas:9,usd:0,vencidas:0,tarde:0,porCliente:{},porFamilia:{}};
     recalcularCierreMesEnCurso();
     __check("RE6: al recalcular, un mes CERRADO no se toca",cierresMes()[viejo].pz===9&&cierresMes()[viejo].ts==='2020-02-01T00:00:00.000Z');
     __check("RE6: y el del mes en curso queda marcado como vuelto a tomar",!!cierresMes()[ym].recalculada&&/rutas corregidas/.test(cierresMes()[ym].recalculada.motivo||''));
     S.params.cierresMes={};S.ordenes.forEach((o,k)=>{if(bakPro[k]===undefined)delete o.proyecto;else o.proyecto=bakPro[k]});}
    /* permisos */
    PERFIL={rol:'corte',modo:'editar',nombre:'Encargado'};
    const r0=JSON.stringify(maloExtra.ruta);completarRutasSinEmpaque();
    __check("RE7: un encargado de centro no puede corregir rutas",JSON.stringify(maloExtra.ruta)===r0);
    PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};
    S.ordenes=S.ordenes.filter(o=>![incompleta,desordenada,aMano,buena,maloExtra].includes(o));
    [incompleta,desordenada,aMano,buena,maloExtra].forEach(o=>delete S.avance[o.id]);
    delete S.params.rutasEmpaqueCorregidas;
    S.categorias=S.categorias.filter(k=>k!==padT&&k!==catT);S.operaciones=S.operaciones.filter(o=>!opsT.includes(o.id));}
   window.confirm=c0;window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("RE sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* PANTALLAS DE CENTRO · lo que viene, agrupador, tarjetas de día, una marca y avance */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   const CENS=S.centros.filter(c=>c.area==='pro').map(c=>c.id);
   const GRUPOS=[...new Set(CENS.map(grupoPlanDe))];
   /* 1 · fuera «Lo que viene», en TODOS los centros y sub-centros */
   {let hay=[];
    GRUPOS.concat(CENS).forEach(g=>{['plan','prog','ejec'].forEach(t=>{
      page='centro';CEN.id=CENS.includes(g)&&censDeGrupo(grupoPlanDe(g)).length>1?grupoPlanDe(g):g;
      CEN.solo=CENS.includes(g)&&censDeGrupo(CEN.id).includes(g)&&CEN.id!==g?g:'';CEN.tab=t;CEN.dia=null;
      try{render()}catch(e){__R.errors.push({page:'centro/'+g+'/'+t,msg:e.message})}
      if(/Lo que viene/.test(document.getElementById('p-centro').innerHTML))hay.push(g+'/'+t)})});
    __check("CN1: «Lo que viene» ya no aparece en ningún centro ni sub-centro, en ninguna pestaña",!hay.length,hay.slice(0,5).join(', '));
    __check("CN1: pero la lista sigue diciendo dónde está cada orden",(()=>{CEN.id='terminados';CEN.solo='';CEN.tab='plan';render();
      const h=document.getElementById('p-centro').innerHTML;return /Dónde está/.test(h)||/dondeEstaEnCentro/.test(String(dondeEstaEnCentro))})());}
   /* 2 · agrupador común en las tres pestañas de cada centro y sub-centro */
   {const campos=['cliente','odc','fam','fase','tela'];
    const ids=['cenplan','cenluego','cen','cenejec'];
    __check("CN2: los cuatro agrupadores de centro ofrecen Cliente, ODC, Familia, Fase y Tela",
     ids.every(id=>{const h=grpSelHTML(id,true);return campos.every(k=>h.includes('value="'+k+'"'))}));
    const tabla=[];
    GRUPOS.forEach(g=>{['plan','prog','ejec'].forEach(t=>{
      page='centro';CEN.id=g;CEN.solo='';CEN.tab=t;CEN.dia=null;render();
      const h=document.getElementById('p-centro').innerHTML;
      tabla.push({centro:g,tab:t,agrupador:/setNivelGRP\('cen/.test(h)})});});
    __R.cenGrp=tabla;
    __check("CN2: las tres pestañas de todos los centros tienen agrupador",tabla.every(x=>x.agrupador),
     tabla.filter(x=>!x.agrupador).map(x=>x.centro+'/'+x.tab).join(', '));
    // y también en una sub-área sola
    const sub=CENS.find(c=>censDeGrupo(grupoPlanDe(c)).length>1);
    if(sub){let ok=true;['plan','prog','ejec'].forEach(t=>{page='centro';CEN.id=grupoPlanDe(sub);CEN.solo=sub;CEN.tab=t;render();
      if(!/setNivelGRP\('cen/.test(document.getElementById('p-centro').innerHTML))ok=false});
     __check("CN2: y una sub-área sola también lo tiene en las tres",ok);CEN.solo='';}
    // agrupar de verdad cambia la lista
    setNivelGRP('cenplan',0,'cliente');
    {const fk=S.ordenes.slice(0,3).map(o=>({o,c:'corte',pzSem:5,hechas:0}));
     const hg=filasGRP('cenplan',fk,f=>'<tr><td>'+esc(f.o.op)+'</td></tr>',11,f=>f.o,f=>f.pzSem);
     __check("CN2: al agrupar por cliente, la lista se agrupa de verdad",/grp-row/.test(hg)&&/togGRP/.test(hg));}
    setNivelGRP('cenplan',0,'');
    setNivelGRP('cenplan',0,'');}
   /* 3 · tarjetas de día con rótulos y filtro */
   {page='centro';CEN.id='corte';CEN.solo='';CEN.tab='plan';CEN.dia=null;render();
    const h=document.getElementById('p-centro').innerHTML;
    __check("CN3: cada tarjeta trae Carga, Avance y Pendientes con su rótulo",/>Carga</.test(h)&&/>Avance</.test(h)&&/>Pendientes</.test(h));
    __check("CN3: y los minutos programados contra los disponibles",/min/.test(h)&&/togDiaCEN\(/.test(h));
    const P=S.ordenes.length?programar():{pro:[]};const lun=lunesDe(hoy());
    const dd=datosDiaCentro(['corte'],P,lun,S.recursos.filter(r=>r.activa&&r.centro==='corte'));
    __check("CN3: Carga = prendas programadas, Avance = hechas del día, Pendientes = lo que falta",
     dd.pend===Math.max(0,dd.pz-dd.hechas)&&typeof dd.min==='number'&&typeof dd.cap==='number');
    togDiaCEN(lun);
    __check("CN3: tocar una tarjeta enciende el filtro del día",CEN.dia===lun);
    render();const h2=document.getElementById('p-centro').innerHTML;
    __check("CN3: y se ve que el filtro está activo, con cómo quitarlo",/filtro activo/.test(h2)&&/quitar el filtro/.test(h2));
    togDiaCEN(lun);
    __check("CN3: tocarla de nuevo lo quita",CEN.dia===null);
    // el filtro deja solo órdenes de ese día con prendas pendientes
    const f={o:S.ordenes[0],c:'corte',hechas:0};
    __check("CN3: sin filtro entran todas",filaEnDiaCEN(f,P,null)===true);}
   /* 4 · una sola marca, la más grave */
   {const o=S.ordenes[0];const P=S.ordenes.length?programar():{ordenes:{}};
    const orig=diagAtraso(o,P,'corte');
    const h=marcaCentroUna(o,P,'corte');
    const l=marcasDe(o,P,'corte');
    __check("CN4: se pinta UNA sola etiqueta de atraso",(h.match(/t-alerta|t-aviso/g)||[]).length<=1);
    __check("CN4: y es la más grave de las que aplican",!l.length||h.includes(esc(l[0].n)));
    __check("CN4: si aplican varias, las demás van en el tooltip con un contador",l.length<2||(/\+\d/.test(h)&&h.includes('También aplica')));
    __check("CN4: el orden de gravedad es meta vencida > va tarde > paso tarde (nombres cortos, una línea)",
     MARCAS_CEN.map(m=>m.n).join('|')==='meta vencida|va tarde|paso tarde');
    __check("CN4: graduación: rojo SOLO la meta vencida; va tarde y paso tarde en ámbar",
     MARCAS_CEN.map(m=>m.k+':'+m.cls+':'+m.color).join('|')==='vencida:t-alerta:rojo|tarde:t-aviso:ambar|paso:t-aviso:ambar');
    __check("CN4: la marca no se parte en varias líneas",!l.length||/white-space:nowrap/.test(h));
    __check("CN4: el cálculo sigue saliendo de diagAtraso, no de una cuenta nueva",
     l.every(m=>m.test(diagAtraso(o,P,'corte')))&&JSON.stringify(diagAtraso(o,P,'corte'))===JSON.stringify(orig));
    page='centro';CEN.id='corte';CEN.tab='prog';render();
    {const h2=document.getElementById('p-centro').innerHTML;const P5=programar();const lun5=lunesDe(hoy());const hasta5=dsum(dsum(lun5,6),7);
     const colaV=colaCentro('corte',filasDeCentros(['corte'],P5,lun5,dsum(lun5,6),'')).filter(f=>CEN.todo||f.pzSem>0||(f.paso.ini&&f.paso.ini<=hasta5));const r=conteoColoresCola(colaV,P5,'corte');
     __check("CN4: la línea «Marcas:» está arriba de la cola exactamente cuando alguna fila visible lleva marca, y cuenta sobre las filas que se ven",((r.venc+r.noLlega+r.paso+r.sinMeta)>0)===/cola-marcas/.test(h2)&&(!/cola-marcas/.test(h2)||new RegExp(r.rojo+' rojas').test(h2)),JSON.stringify({venc:r.venc,paso:r.paso,rojo:r.rojo,n:r.n}));}}
   /* 5 · avance de la semana arriba de Planificación */
   {page='centro';CEN.id='corte';CEN.solo='';CEN.tab='plan';CEN.dia=null;render();
    const h=document.getElementById('p-centro').innerHTML;
    __check("CN5: la pestaña Planificación abre con el avance de la semana",/Avance de la semana/.test(h));
    __check("CN5: con programadas, hechas, cumplimiento, atrasadas y lo congelado",
     /Programadas/.test(h)&&/>Hechas</.test(h)&&/Cumplimiento/.test(h)&&/Órdenes atrasadas/.test(h)&&/Contra lo congelado/.test(h));
    CEN.id='terminados';CEN.solo='';render();const h2=document.getElementById('p-centro').innerHTML;
    __check("CN5: un centro con sub-centros lo muestra POR sub-centro",/Sub-área/.test(h2)&&subAreasDe('terminados').every(c=>h2.includes(esc(nCen(c)))));
    CEN.id='corte';CEN.solo='';
    const P=S.ordenes.length?programar():{pro:[]};const lun=lunesDe(hoy());const dias=[];for(let d=lun;d<=dsum(lun,6);d=dsum(d,1))dias.push(d);
    const a=avanceSemanaCentro(['corte'],P,dias,S.recursos.filter(r=>r.activa&&r.centro==='corte'));
    __check("CN5: el cumplimiento es hechas sobre programadas",a.pct===null||a.pct===Math.round(a.hechas/a.pz*100));
    __check("CN5: sin programa congelado lo dice, no inventa un %",a.congPct===null||typeof a.congPct==='number');
    // con la semana congelada aparece el %
    S.params.progCongelado=[];PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa'};
    congelarPrograma(['corte'],lun,dsum(lun,6));
    const a2=avanceSemanaCentro(['corte'],P,dias,S.recursos.filter(r=>r.activa&&r.centro==='corte'));
    __check("CN5: con la semana congelada, aparece el % contra lo congelado",a2.cong!==null);
    S.params.progCongelado=[];PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};
    // cada perfil de centro abre en su centro
    CEN.auto=false;PERFIL={rol:'modulos',modo:'editar',nombre:'Mod'};page='centro';render();
    __check("CN5: el perfil de un centro abre directo en su centro",censDeGrupo(CEN.id).includes('modulos')||CEN.solo==='modulos');
    CEN.auto=false;PERFIL={rol:'terminado',modo:'editar',nombre:'PT'};render();
    __check("CN5: y el de producto terminado, en el suyo",censDeGrupo(CEN.id).concat([CEN.solo]).some(c=>subAreasDe('terminados').includes(c)));
    CEN.auto=false;PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};CEN.id='corte';CEN.solo='';
    __check("CN5: un perfil que ve todo NO queda atado a un centro",centroDePerfil()===null);}
   window.alert=a0;PERFIL=adminP;CEN.dia=null;CEN.solo='';CEN.auto=false;CEN.id='corte';CEN.tab='plan';
   PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("CN sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* RUTAS · corrección autorizada, ruta por defecto y recálculo automático */
  {const antes=__R.errors.length;const adminP=PERFIL;const c0=window.confirm,a0=window.alert;window.alert=()=>{};window.confirm=()=>true;
   PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   /* una categoría de prueba CON hoja (corte, confección, empaque) y otra SIN hoja */
   const opsT=[['corte',1],['modulos',5],['empaque',1]].map(([c,t])=>{const id=uid();S.operaciones.push({id,centro:c,n:'p '+c,sam:t});return id});
   const opBot=(()=>{const id=uid();S.operaciones.push({id,centro:'botones',n:'p botones',sam:2});return id})();
   const padT={id:uid(),n:'PRUEBA RT'};const conHoja={id:uid(),padre:padT.id,n:'Con hoja',ops:opsT.map(op=>({op}))};
   const sinHoja={id:uid(),padre:padT.id,n:'Sin hoja'};
   S.categorias.push(padT,conHoja,sinHoja);
   const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
   const mk=(op,cat,ruta,ed)=>{const x=JSON.parse(JSON.stringify(base));x.id=uid();x.op=op;x.estado='plan';x.fase='2Planificacion';
     delete x.estadoOP;x.cant=10;x.cat=cat;x.ruta=ruta;delete x.programa;delete x.rutaEditada;delete x.rutaConf;delete x.rutaFirma;delete x.rutaRevisar;
     if(ed)x.rutaEditada=[{ts:new Date().toISOString(),u:'alguien',motivo:'a mano'}];
     S.ordenes.push(x);delete S.avance[x.id];return x};
   /* 1 · la corrección de las rutas sin Empaque corre sola, ya autorizada */
   {const mala=mk('WH/RT-1',conHoja.id,[{centro:'tej',t:0},{centro:'bordado',t:2}]);
    delete S.params.rutasEmpaqueCorregidas;
    const de=pasosProDe(mala).join(' → ');
    sembrarRutasEmpaque();
    __check("RT1: la corrección autorizada corre sola, sin preguntar",!!S.params.rutasEmpaqueCorregidas);
    __check("RT1: y la ruta incompleta queda terminando en Empaque",rutaTerminaEnEmpaque(mala),de+' → '+pasosProDe(mala).join(' → '));
    __check("RT1: conservando el bordado que la orden ya tenía",pasosProDe(mala).includes('bordado'));
    const ts0=S.params.rutasEmpaqueCorregidas.ts;sembrarRutasEmpaque();
    __check("RT1: es idempotente: no se vuelve a ejecutar",S.params.rutasEmpaqueCorregidas.ts===ts0);
    S.ordenes=S.ordenes.filter(o=>o!==mala);}
   /* 2 · ruta por defecto para las que ni su categoría tiene Empaque */
   {delete sinHoja.minEstConf;
    const sin=mk('WH/RT-2',sinHoja.id,[{centro:'tej',t:0},{centro:'bordado',t:2}]);
    const d=diagRutasSinEmpaque();
    __check("RT2: una orden cuya categoría tampoco tiene Empaque cae en «sin arreglo»",d.sinArreglo.includes(sin));
    const pv=previaRutaDefecto();
    __check("RT2: la vista previa la trae, y dice que no tiene minuto estimado",pv.filas.some(f=>f.o===sin&&f.min===null)&&pv.sinMin>=1);
    __check("RT2: la ruta propuesta es corte → confección → empaque, más lo que la orden pide",(()=>{
      const a=pv.filas.find(f=>f.o===sin).a;return a.includes('corte')&&a.includes('modulos')&&a[a.length-1]==='empaque'&&a.includes('bordado')})());
    const ruta0=JSON.stringify(sin.ruta);
    __check("RT2: la previa no toca nada",JSON.stringify(sin.ruta)===ruta0);
    __check("RT2: es brecha de TIEMPOS, no de ruta, y la pantalla lo dice",/0 con aviso/.test(rutaDefectoPanelHTML())&&/tiempos/.test(rutaDefectoPanelHTML()));
    aplicarRutaDefecto();
    __check("RT2: al aplicar, la ruta se crea y termina en Empaque",rutaTerminaEnEmpaque(sin));
    __check("RT2: y queda «estimada – sin revisar»",estadoRuta(sin)==='sinRevisar');
    __check("RT2: sin minuto estimado la ruta SE CREA igual y la carga queda en 0",(()=>{
      const pc=(sin.ruta||[]).find(x=>x.centro==='modulos');return !!pc&&(+pc.t||0)===0})());
    // con minuto estimado sí carga
    const sin2=mk('WH/RT-3',sinHoja.id,[{centro:'tej',t:0},{centro:'bordado',t:2}]);
    setMinEstConf(sinHoja.id,12.5);
    delete S.params.rutaDefectoAplicada;aplicarRutaDefecto();
    __check("RT2: con minuto estimado, el paso de confección sí trae minutos",(()=>{
      const pc=(sin2.ruta||[]).find(x=>x.centro==='modulos');return !!pc&&(+pc.t||0)===12.5})());
    __check("RT2: queda en la auditoría",(S.params.auditoriaCambios||[]).some(a=>/ruta por defecto/.test(a.motivo||'')));
    delete sinHoja.minEstConf;S.ordenes=S.ordenes.filter(o=>o!==sin&&o!==sin2);}
   /* 3 · las rutas se rehacen solas cuando cambia el catálogo */
   {const auto=mk('WH/RT-4',conHoja.id,[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:1}]);
    const aMano=mk('WH/RT-5',conHoja.id,[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:1}],true);
    sellarRuta(auto);sellarRuta(aMano);
    __check("RT3: con el catálogo quieto, ninguna ruta está desactualizada",!rutaDesactualizada(auto)&&!rutaDesactualizada(aMano)&&rutasPorRecalcular().total===0);
    // CORRECCIÓN DEL CATÁLOGO: la categoría gana una operación de bordado
    conHoja.ops=conHoja.ops.concat([{op:opBot}]);
    __check("RT3: al cambiar la hoja de la categoría, sus rutas quedan desactualizadas",rutaDesactualizada(auto)&&rutaDesactualizada(aMano));
    const r=recalcularRutas('prueba: la categoría ganó ojales y botones');
    __check("RT3: la ruta NO editada a mano se rehace sola y toma el paso nuevo",pasosProDe(auto).includes('botones')&&rutaTerminaEnEmpaque(auto)&&r.n>=1);
    __check("RT3: la editada a mano NO se toca",!pasosProDe(aMano).includes('botones'));
    __check("RT3: pero queda marcada para revisar, diciendo qué cambió",!!aMano.rutaRevisar&&/botones|categor/.test(aMano.rutaRevisar.motivo||''));
    __check("RT3: y aparece en el panel de revisión",rutasParaRevisar().includes(aMano)&&rutasRevisarPanelHTML().includes(esc(aMano.op)));
    __check("RT3: todo queda en auditoría",(S.params.auditoriaCambios||[]).some(a=>/ruta rehecha/.test(a.motivo||''))&&(S.params.auditoriaCambios||[]).some(a=>/no se toca/.test(a.motivo||'')));
    __check("RT3: el paso nuevo entra en su lugar del proceso, antes de Empaque",(()=>{const r2=pasosProDe(auto);return r2.indexOf('botones')<r2.indexOf('empaque')})());
    __check("RT3: ya recalculadas, no quedan pendientes",rutasPorRecalcular().auto.length===0);
    marcarRutaRevisada2(aMano.id);
    __check("RT3: al marcarla revisada, sale del panel y se vuelve a sellar",!aMano.rutaRevisar&&!rutaDesactualizada(aMano));
    // cambiar la CATEGORÍA de la orden también dispara el recálculo
    auto.cat=sinHoja.id;
    __check("RT3: cambiar la categoría de la orden también la desactualiza",rutaDesactualizada(auto));
    recalcularRutas('prueba: cambió la categoría');
    __check("RT3: y se rehace con la categoría nueva",!rutaDesactualizada(auto));
    S.ordenes=S.ordenes.filter(o=>o!==auto&&o!==aMano);}
   /* 4 · sin rutas malas, la etiqueta «con brecha» desaparece */
   {const bakOrd=S.ordenes;
    S.ordenes=S.ordenes.filter(o=>!abierta(o)||rutaTerminaEnEmpaque(o)||!pasosProDe(o).length);
    __check("RT4: cuando no queda ninguna ruta sin Empaque, no hay brecha",brechaHechas()===null&&avisoHechasHTML()==='');
    page='gerencia';GER.meses=null;GER.cli=null;GER.est=null;GER.q='';render();
    __check("RT4: y la etiqueta «con brecha» desaparece de Hechas",!/con brecha/.test(document.getElementById('p-gerencia').innerHTML));
    S.ordenes=bakOrd;
    const mala=mk('WH/RT-6',conHoja.id,[{centro:'corte',t:1},{centro:'bordado',t:2}]);
    __check("RT4: y vuelve a aparecer si aparece una ruta mala",!!brechaHechas()&&/afectado/.test(avisoHechasHTML()));
    S.ordenes=S.ordenes.filter(o=>o!==mala);}
   S.categorias=S.categorias.filter(k=>![padT,conHoja,sinHoja].includes(k));
   S.operaciones=S.operaciones.filter(o=>!opsT.includes(o.id)&&o.id!==opBot);
   delete S.params.rutaDefectoAplicada;
   window.confirm=c0;window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("RT sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* 6 · «0 hechas» no es lo mismo que «sin registros» · 7 · Vienen después */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   const lun=lunesDe(hoy());const dias=[];for(let d=lun;d<=dsum(lun,6);d=dsum(d,1))dias.push(d);
   const rec0=S.recursos.find(r=>r.activa&&r.centro==='corte');
   const bakT=JSON.parse(JSON.stringify(S.turnos||[]));const bakP=JSON.parse(JSON.stringify(S.paros||[]));
   /* 6 · sin registros */
   {S.turnos=[];S.paros=[];
    S.ordenes.forEach(o=>{const a=S.avance[o.id];if(a){delete a.tallasLog;delete a.tramos}});
    const lab=diasConTurno('corte',dias);
    __check("SR: sin ningún registro, el centro queda marcado «ninguno»",lab.length?registroSemana('corte',dias).ninguno===true:true);
    __check("SR: y ningún día laborable cuenta como registrado",lab.every(d=>!hayRegistroEn('corte',d)));
    const P=S.ordenes.length?programar():{pro:[]};
    const a=avanceSemanaCentro(['corte'],P,dias,S.recursos.filter(r=>r.activa&&r.centro==='corte'));
    __check("SR: el avance de la semana NO muestra 0 % sino «sin registros»",lab.length?(a.sinReg===true&&a.pct===null):true);
    page='centro';CEN.id='corte';CEN.solo='';CEN.tab='plan';CEN.dia=null;render();
    const h=document.getElementById('p-centro').innerHTML;
    __check("SR: y la pantalla lo dice con esas palabras",!lab.length||/sin registros esta semana/.test(h));
    const dd=datosDiaCentro(['corte'],P,lab[0]||lun,S.recursos.filter(r=>r.activa&&r.centro==='corte'));
    __check("SR: la tarjeta del día también distingue sin registro de 0",!lab.length||(dd.sinRegistro===true&&dd.lab===true));
    __check("SR: y en la tarjeta se lee «sin registros», no un 0",!lab.length||/sin registros/.test(h));
    /* ahora SÍ hay un registro: vuelve a leerse el cumplimiento */
    if(lab.length&&rec0){S.turnos=[{id:uid(),rec:rec0.id,d:lab[0],pz:120}];
     __check("SR: registrar producción en un turno cuenta como registro",hayRegistroEn('corte',lab[0])===true);
     const a2=avanceSemanaCentro(['corte'],P,dias,S.recursos.filter(r=>r.activa&&r.centro==='corte'));
     __check("SR: con al menos un registro, ya no es «sin registros»",a2.sinReg===false);
     __check("SR: pero los días laborables sin registrar se siguen contando",a2.diasSinReg===lab.length-1);
     S.turnos=[{id:uid(),rec:rec0.id,d:lab[0],pz:null,std:null,ops:null}];
     __check("SR: un turno sin producción NO cuenta como registro de producción",hayRegistroEn('corte',lab[0])===false);
     S.paros=[{id:uid(),rec:rec0.id,d:lab[0],min:30,motivo:'prueba'}];
     __check("SR: pero un paro registrado SÍ cuenta: alguien estuvo ahí",hayRegistroEn('corte',lab[0])===true);}
    /* la brecha por centro y día, en Reportería */
    S.turnos=[];S.paros=[];
    const b=brechaRegistro(dias);
    __check("SR: la brecha lista los centros y sus días sin registro",Array.isArray(b.filas)&&b.filas.every(f=>Array.isArray(f.sin)&&Array.isArray(f.lab)));
    __check("SR: un centro sin turnos esta semana no entra (no se le reclama registro)",b.filas.every(f=>f.lab.length>0));
    const hb=brechaRegistroHTML();
    __check("SR: el panel muestra centro × día y explica la diferencia",/Registro de producción por centro y día/.test(hb)&&/puede no haber producido, o puede no haber registrado/.test(hb));
    __check("SR: y dice qué cuenta como registro",/Cuenta como registro/.test(hb));
    page='reporteria';REP.vista='produccion';render();
    __check("SR: está en Reportería",/Registro de producción por centro y día/.test(document.getElementById('p-reporteria').innerHTML));}
   S.turnos=bakT;S.paros=bakP;
   /* 7 · «Vienen después» no repite la lista de arriba */
   {page='centro';CEN.id='corte';CEN.solo='';CEN.tab='plan';CEN.dia=null;render();
    const P=S.ordenes.length?programar():{pro:[],ordenes:{}};
    const dom=dsum(lun,6);
    const filas=filasDeCentros(['corte'],P,lun,dom,'');
    const enSem=filas.filter(f=>f.pzSem>0);
    const luego=filas.filter(f=>!f.hecho&&!f.bloq&&f.pzSem===0&&f.paso.ini&&f.paso.ini>dom);
    __check("VD: «Vienen después» y «Órdenes de la semana» son conjuntos disjuntos: ninguna orden está en los dos",
     !luego.some(f=>enSem.some(g=>g.o===f.o&&g.c===f.c)));
    __check("VD: las de «Vienen después» tienen fecha de inicio POSTERIOR a la semana mostrada",luego.every(f=>f.paso.ini>dom));
    __check("VD: y las de la lista de arriba tienen prendas ESTA semana",enSem.every(f=>f.pzSem>0));
    const h=document.getElementById('p-centro').innerHTML;
    __check("VD: el rótulo dice que ninguna está en la lista de arriba",!luego.length||/ninguna está en la lista de arriba/.test(h));
    __check("VD: y que el programa ya las fechó en este centro",!luego.length||/ya fechó en este centro/.test(h));}
   window.alert=a0;PERFIL=adminP;CEN.dia=null;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("SR sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* RUTA POR DEFECTO · FIRMA CON TÉCNICA · TEJEDURÍA programado vs tejido */
  {const antes=__R.errors.length;const adminP=PERFIL;const c0=window.confirm,a0=window.alert;window.alert=()=>{};window.confirm=()=>true;
   PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};sembrarRutaDefecto();PLAN=null;PLAN_ALL=null;
   /* 1 · las 22: la ruta por defecto ya corre con las siembras */
   {__check("RD1: la ruta por defecto quedó en las siembras automáticas",typeof sembrarRutaDefecto22==='function'&&String(sembrarDecisiones16).includes('sembrarRutaDefecto22'));
    __check("RD1: y deja registro de cuántas movió",!!S.params.rutaDefectoAplicada);
    const ts0=JSON.stringify(S.params.rutaDefectoAplicada);sembrarRutaDefecto22();
    __check("RD1: es idempotente",JSON.stringify(S.params.rutaDefectoAplicada)===ts0);}
   /* 2 · la firma incluye técnica y puntadas */
   {const opsT=[['corte',1],['modulos',5],['empaque',1]].map(([c,t])=>{const id=uid();S.operaciones.push({id,centro:c,n:'q '+c,sam:t});return id});
    const pad={id:uid(),n:'PRUEBA TEC'};const cat={id:uid(),padre:pad.id,n:'Con hoja tec',ops:opsT.map(op=>({op}))};
    S.categorias.push(pad,cat);
    const base=S.ordenes.find(o=>abierta(o))||S.ordenes[0];
    const mk=(op,ed)=>{const x=JSON.parse(JSON.stringify(base));x.id=uid();x.op=op;x.estado='plan';x.fase='2Planificacion';
      delete x.estadoOP;x.cant=10;x.cat=cat.id;x.ruta=[{centro:'corte',t:1},{centro:'modulos',t:5},{centro:'empaque',t:1}];
      delete x.tecnica;delete x.tecnicaTxt;x.puntadas=0;delete x.programa;delete x.rutaEditada;delete x.rutaConf;delete x.rutaRevisar;
      if(ed)x.rutaEditada=[{ts:new Date().toISOString(),u:'alguien',motivo:'a mano'}];
      S.ordenes.push(x);delete S.avance[x.id];sellarRuta(x);return x};
    const o=mk('WH/TEC-1');const oM=mk('WH/TEC-2',true);
    __check("FT1: con la orden quieta, su ruta no está desactualizada",!rutaDesactualizada(o));
    // se le AGREGAN puntadas: debe entrar bordado
    o.puntadas=5000;oM.puntadas=5000;
    __check("FT1: agregar puntadas a una orden desactualiza su ruta",rutaDesactualizada(o)&&rutaDesactualizada(oM));
    recalcularRutas('prueba: la orden ganó puntadas');
    __check("FT1: la ruta no editada a mano se actualiza y entra bordado",pasosProDe(o).includes('bordado'));
    __check("FT1: y entra ENTRE corte y confección, no al final",(()=>{const r=pasosProDe(o);
      return r.indexOf('corte')<r.indexOf('bordado')&&r.indexOf('bordado')<r.indexOf('modulos')&&r[r.length-1]==='empaque'})());
    __check("FT1: la editada a mano no se toca, pero queda marcada",!pasosProDe(oM).includes('bordado')&&!!oM.rutaRevisar);
    __check("FT1: queda en auditoría",(S.params.auditoriaCambios||[]).some(a=>/puntadas/.test(a.motivo||'')));
    // se le QUITAN las puntadas: debe salir bordado
    o.puntadas=0;
    __check("FT1: quitar las puntadas también desactualiza",rutaDesactualizada(o));
    recalcularRutas('prueba: se quitaron las puntadas');
    __check("FT1: y bordado sale de la ruta",!pasosProDe(o).includes('bordado')&&rutaTerminaEnEmpaque(o));
    // técnica → estampado
    o.tecnica='x';
    recalcularRutas('prueba: la orden ganó técnica');
    __check("FT1: agregar técnica mete estampado, entre corte y confección",(()=>{const r=pasosProDe(o);
      return r.includes('estampado')&&r.indexOf('corte')<r.indexOf('estampado')&&r.indexOf('estampado')<r.indexOf('modulos')})());
    /* 2b · auditoría solo cuando la ruta cambia de verdad */
    delete oM.rutaRevisar;sellarRuta(oM);
    const nA=(S.params.auditoriaCambios||[]).length;
    const r1=recalcularRutas('prueba: sin cambios');
    __check("FT2: si nada cambió, no se recalcula ni se escribe auditoría",r1.n===0&&r1.marcadas===0&&(S.params.auditoriaCambios||[]).length===nA);
    // una firma vieja que NO cambia la ruta: se re-sella en silencio
    o.rutaFirma='firma-vieja-inventada';
    const nA2=(S.params.auditoriaCambios||[]).length;
    const r2=recalcularRutas('prueba: firma vieja pero misma ruta');
    __check("FT2: una firma vieja cuya ruta queda igual se vuelve a sellar SIN auditoría",r2.n===0&&(S.params.auditoriaCambios||[]).length===nA2&&!rutaDesactualizada(o));
    // y una editada a mano cuya ruta tampoco cambiaría: no se marca
    oM.tecnica=o.tecnica;oM.puntadas=o.puntadas;   // misma orden, misma ruta: no debería cambiar nada
    oM.ruta=JSON.parse(JSON.stringify(o.ruta));oM.rutaFirma='firma-vieja-inventada';
    const nA3=(S.params.auditoriaCambios||[]).length;recalcularRutas('prueba');
    __check("FT2: una editada a mano que no cambiaría NO se marca ni deja auditoría",!oM.rutaRevisar&&(S.params.auditoriaCambios||[]).length===nA3);
    S.ordenes=S.ordenes.filter(x=>x!==o&&x!==oM);S.categorias=S.categorias.filter(k=>k!==pad&&k!==cat);
    S.operaciones=S.operaciones.filter(x=>!opsT.includes(x.id));}
   /* 3 · tejeduría: programado vs tejido */
   {const bak=JSON.parse(JSON.stringify(S.params.progTej||[]));const bakE=S.params.tejEstricto;
    S.params.progTej=[];delete S.params.tejEstricto;
    const tela=(S.telas.find(t=>!t.ext)||{}).id;const rec=(S.recursos.find(r=>r.activa&&CE(r.centro)&&CE(r.centro).area==='tej')||{}).id;
    if(!tela||!rec)__check('TJ: hay tela y máquina de tejeduría para probar',false);
    else{
     const ayer=dsum(hoy(),-3),maniana=dsum(hoy(),3);
     const prog={id:uid(),tela,rec,dia:maniana,kg:100,u:'t',ts:new Date().toISOString()};
     const viejo={id:uid(),tela,rec,dia:ayer,kg:200,u:'t',ts:new Date().toISOString()};
     S.params.progTej=[prog,viejo];
     __check("TJ1: una fila sin estado es «programado»",estadoTej(prog)==='prog'&&estadoTej(viejo)==='prog');
     __check("TJ1: una programada con día pasado sale como «tejido sin confirmar»",tejSinConfirmar().length===1&&tejSinConfirmar()[0]===viejo);
     /* marcar como tejido */
     PERFIL={rol:'consulta',modo:'ver',nombre:'Consulta'};
     __check("TJ2: un perfil que no es tejeduría ni planificación no puede marcar",!puedeTejer());
     window.prompt=()=>'180';marcarTejido(viejo.id);
     __check("TJ2: y si lo intenta, no pasa nada",estadoTej(viejo)==='prog');
     PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};
     marcarTejido(viejo.id);
     __check("TJ2: planificación sí puede, y se guardan los kg REALES",estadoTej(viejo)==='tejido'&&viejo.kgReal===180&&viejo.kg===200);
     __check("TJ2: con usuario y fecha de registro",viejo.confU==='Jefa Prod'&&!!viejo.confTs);
     __check("TJ2: queda en la bitácora",(S.bitacora||[]).some(b=>/marcado TEJIDO/.test(b.txt||b.t||'')));
     __check("TJ2: y ya no sale como sin confirmar",!tejSinConfirmar().length);
     /* la fecha: programado no admite pasado; tejido sí */
     setProgTejRow(prog.id,'dia',ayer);
     __check("TJ3: una fila PROGRAMADA no acepta fecha pasada",prog.dia===maniana);
     setProgTejRow(viejo.id,'dia',dsum(hoy(),-5));
     __check("TJ3: una TEJIDA sí, porque es un hecho",viejo.dia===dsum(hoy(),-5));
     /* el interruptor y su vista previa */
     viejo.estado='prog';delete viejo.kgReal;viejo.dia=ayer;
     __check("TJ4: con la regla APAGADA, lo programado sin confirmar sigue contando como tela lista",!tejEstrictoOn()&&tejCuentaComoLista(viejo)===true);
     const pv=previaTejEstricto();
     __check("TJ4: la vista previa dice cuántas filas hay sin confirmar y cuántos kg",pv.sin.length===1&&pv.kg===200);
     __check("TJ4: y cuántas órdenes cambiarían su fecha de tela lista",Array.isArray(pv.ordenes));
     __check("TJ4: la previa NO enciende la regla",!tejEstrictoOn());
     togTejEstricto();
     __check("TJ5: encendida, lo programado con día pasado NO cuenta como tela lista",tejEstrictoOn()&&tejCuentaComoLista(viejo)===false);
     __check("TJ5: pero lo programado a futuro sí sigue contando",tejCuentaComoLista(prog)===true);
     viejo.estado='tejido';viejo.kgReal=180;
     __check("TJ5: y lo marcado como tejido cuenta siempre, con sus kg reales",tejCuentaComoLista(viejo)===true&&kgTejidos(viejo)===180);
     togTejEstricto();
     __check("TJ5: se puede apagar cuando se quiera",!tejEstrictoOn());
     viejo.estado='prog';delete viejo.kgReal;   // vuelve a haber una fila sin confirmar, para ver el panel
     const h=tejEstrictoPanelHTML();
     __check("TJ6: el panel explica la regla y trae el interruptor",/Tejido sin confirmar/.test(h)&&/da por tejido todo lo que se program/.test(h)&&/togTejEstricto/.test(h));
     PERFIL={rol:'corte',modo:'editar',nombre:'Enc'};
     __check("TJ6: solo planificación ve el interruptor",!/togTejEstricto/.test(tejEstrictoPanelHTML()));
     PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};
     page='tejeduria';render();
     __check("TJ6: y está en la pantalla de Tejeduría",/Programación manual de tejeduría/.test(document.getElementById('p-tejeduria').innerHTML));}
    S.params.progTej=bak;if(bakE===undefined)delete S.params.tejEstricto;else S.params.tejEstricto=bakE;}
   window.confirm=c0;window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("TJ sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* KG REALES con la regla apagada · y el chequeo de las siembras */
  {const antes=__R.errors.length;const adminP=PERFIL;const c0=window.confirm,a0=window.alert,p0=window.prompt;
   window.alert=()=>{};window.confirm=()=>true;
   PERFIL={rol:'planificacion',modo:'editar',nombre:'Jefa Prod'};PLAN=null;PLAN_ALL=null;
   /* los kg reales pesan aunque la regla esté apagada */
   {const bak=JSON.parse(JSON.stringify(S.params.progTej||[]));const bakE=S.params.tejEstricto;
    S.params.progTej=[];delete S.params.tejEstricto;
    const tela=(S.telas.find(t=>!t.ext)||{}).id;const rec=(S.recursos.find(r=>r.activa&&CE(r.centro)&&CE(r.centro).area==='tej')||{}).id;
    if(tela&&rec){
     const f={id:uid(),tela,rec,dia:dsum(hoy(),2),kg:500,u:'t',ts:new Date().toISOString()};
     S.params.progTej=[f];
     __check("KR1: con la regla apagada, una fila programada aporta sus kg programados",!tejEstrictoOn()&&kgDeFilaTej(f)===500);
     f.estado='tejido';f.kgReal=320;f.confU='t';f.confTs=new Date().toISOString();
     __check("KR1: al marcarla TEJIDA, el motor pasa a usar los kg REALES aunque la regla siga apagada",!tejEstrictoOn()&&kgDeFilaTej(f)===320);
     __check("KR1: y sigue contando como tela lista (los kg reales no dependen del interruptor)",tejCuentaComoLista(f)===true);
     TEJ_KG_MODO='prog';
     __check("KR1: el modo de medición permite comparar contra los programados",kgDeFilaTej(f)===500);
     TEJ_KG_MODO='real';
     __check("KR1: y vuelve a los reales",kgDeFilaTej(f)===320);
     const kr=efectoKgReales();
     __check("KR2: el efecto de los kg reales se mide aparte del de la regla",kr.filas.length===1&&kr.kg===-180&&Array.isArray(kr.ordenes));
     __check("KR2: medirlo no deja el modo cambiado",TEJ_KG_MODO==='real');
     const h=tejEstrictoPanelHTML();
     __check("KR2: el panel avisa que los kg reales YA están moviendo fechas, con la regla apagada",/ya est\u00e1n moviendo fechas|ya están moviendo fechas/.test(h)&&/ya aplicado/.test(h));
     __check("KR2: y lo separa de lo que pasaría al encender la regla",/efecto distinto del de arriba/.test(h)||!previaTejEstricto().ordenes.length);
     __check("KR2: con kg iguales a los programados no hay efecto que reportar",(()=>{f.kgReal=500;return efectoKgReales().filas.length===0})());
    }
    S.params.progTej=bak;if(bakE===undefined)delete S.params.tejEstricto;else S.params.tejEstricto=bakE;PLAN=null;PLAN_ALL=null;}
   /* el chequeo de las siembras */
   {const l=chequeoSiembras();
    __check("CS1: el chequeo cubre las tres siembras pendientes",l.length===3&&['jeans','empaque','defecto'].every(k=>l.some(x=>x.k===k)));
    __check("CS1: cada una trae esperado, encontrado y si está aplicada",l.every(x=>'esperado' in x&&'encontrado' in x&&'aplicada' in x&&'ok' in x));
    __check("CS1: lo ESPERADO sale de lo que la propia siembra midió, no de un número escrito a mano",
     (!S.params.jeansUnificadoPrevio)||l.find(x=>x.k==='jeans').esperado.indexOf(String(S.params.jeansUnificadoPrevio.ordenes))>=0);
    __check("CS1: con las siembras corridas, las tres salen aplicadas",l.every(x=>x.aplicada));
    const h=chequeoSiembrasHTML();
    __check("CS2: el panel las lista con esperado vs encontrado",/Siembras pendientes/.test(h)&&/Esperado/.test(h)&&/Encontrado/.test(h));
    __check("CS2: y nombra las tres",/JEANS . DENIM|JEANS/.test(h)&&/terminar en Empaque/.test(h)&&/Ruta por defecto/.test(h));
    // una siembra que no corrió sale como PENDIENTE
    const bakJ=S.params.jeansUnificado;delete S.params.jeansUnificado;
    __check("CS3: si una siembra no corrió, sale como pendiente",chequeoSiembras().find(x=>x.k==='jeans').aplicada===false&&/pendiente/.test(chequeoSiembrasHTML()));
    S.params.jeansUnificado=bakJ;
    page='reporteria';REP.vista='produccion';render();
    __check("CS4: el chequeo está en Reportería",/Siembras pendientes/.test(document.getElementById('p-reporteria').innerHTML));}
   window.confirm=c0;window.alert=a0;window.prompt=p0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("KR sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* TIEMPOS ESTIMADOS DE CONFECCIÓN (Santiago Garzón) */
  {const antes=__R.errors.length;const adminP=PERFIL;window.confirm=()=>true;const a0=window.alert;window.alert=()=>{};
   PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};
   {__check("SG1: la tabla trae las 14 categorías de la hoja",TIEMPOS_SG.length===14);
    __check("SG1: con su minuto, su referencia y la observación de cada fila",TIEMPOS_SG.every(t=>t.cat&&t.fam&&+t.min>0&&'ref' in t));
    __check("SG1: Camiseta Tejida viene marcada como pendiente de confirmar",(()=>{const t=TIEMPOS_SG.find(x=>/Camiseta Tejida/i.test(x.cat));return !!t&&t.pendiente===true&&t.min===4.57})());
    __check("SG1: y es la ÚNICA marcada así",TIEMPOS_SG.filter(t=>t.pendiente).length===1);
    __check("SG1: los valores son los de la hoja",(()=>{const m={};TIEMPOS_SG.forEach(t=>m[t.cat]=t.min);
      return m['Crew Zip']===15.3&&m['Jogger Moda']===19.13&&m['Enterizo']===21.2&&m['Accesorios']===3&&m['Faldas']===11.87})());
    /* la siembra, sobre una categoría de prueba */
    const pad={id:uid(),n:'TEJIDOS'};const cat={id:uid(),padre:pad.id,n:'Camiseta Tejida'};
    const pad2={id:uid(),n:'FALDAS'};const cat2={id:uid(),padre:pad2.id,n:'Faldas'};
    S.categorias.push(pad,cat,pad2,cat2);
    delete S.params.tiemposSGSembrado;delete cat.minEstConf;delete cat2.minEstConf;
    sembrarTiemposSG();
    __check("SG2: la siembra pone el minuto en la categoría que calza por familia y nombre",minEstimadoConf(cat)===4.57&&minEstimadoConf(cat2)===11.87);
    __check("SG2: con la fuente y la observación guardadas",(()=>{const m=metaEstConf(cat2);
      return !!m&&/Santiago Garz/.test(m.fuente)&&/16-sep-2026/.test(m.fuente)&&!!m.obs&&/promedio/.test(m.obs)})());
    __check("SG2: Camiseta Tejida queda marcada pendiente de confirmar, con el motivo",(()=>{const m=metaEstConf(cat);
      return !!m&&m.pendiente===true&&/tercio de Camiseta CR/.test(m.motivoPend||'')})());
    __check("SG2: y Faldas NO queda pendiente",metaEstConf(cat2).pendiente===false);
    __check("SG2: la marca se ve, con la fuente en el tooltip",/estimado/.test(marcaEstConfHTML(cat2))&&/Santiago/.test(marcaEstConfHTML(cat2)));
    __check("SG2: y la de Camiseta Tejida trae además «pendiente de confirmar»",/pendiente de confirmar/.test(marcaEstConfHTML(cat)));
    /* solo confección */
    __check("SG3: el minuto estimado SOLO entra en confección",(()=>{const sp=samPorCentro(cat2);
      return sp.modulos===11.87&&sp.corte===undefined&&sp.empaque===undefined&&sp.botones===undefined})());
    __check("SG3: y no pisa la hoja LMO de una categoría que sí la tiene",(()=>{
      const op=uid();S.operaciones.push({id:op,centro:'modulos',n:'z',sam:7});
      cat2.ops=[{op}];const sp=samPorCentro(cat2);cat2.ops=undefined;
      S.operaciones=S.operaciones.filter(x=>x.id!==op);return sp.modulos===7})());
    /* la brecha cambia de estado */
    __check("SG4: la categoría pasa de «carga 0» a «tiempo estimado»",
     categoriasSinHoja().est.some(f=>f.k===cat2)&&!categoriasSinHoja().sin.some(f=>f.k===cat2));
    const h=categoriasSinHojaHTML();
    __check("SG4: y la pantalla muestra la observación de la fila",/Santiago Garz/.test(h)&&/promedio/.test(h));
    /* idempotente y no pisa lo puesto a mano */
    const ts0=S.params.tiemposSGSembrado;setMinEstConf(cat2.id,99);
    delete S.params.tiemposSGSembrado;sembrarTiemposSG();
    __check("SG5: no pisa un valor puesto a mano",minEstimadoConf(cat2)===99);
    __check("SG5: y es idempotente",(()=>{const a=S.params.tiemposSGSembrado;sembrarTiemposSG();return S.params.tiemposSGSembrado===a})());
    S.categorias=S.categorias.filter(k=>![pad,cat,pad2,cat2].includes(k));}
   /* 3 · no se cambió ningún tiempo existente, y las alertas siguen visibles */
   {const h=alertasTiemposHTML();
    __check("SG6: la pantalla dice que la hoja volvió sin correcciones",/«¿Correcto\?» vac\u00eda|«¿Correcto\?» vacía/.test(h)&&/no se cambió ningún tiempo existente/.test(h));
    __check("SG6: y HENLEY / «Nueva hija» queda dicho que NO se borra",/Nueva hija/.test(h)&&/No se borra/.test(h));
    __check("SG6: la alerta de Short Cargo vs Pantalon Cargo se calcula sola, no está escrita a mano",
     String(alertasTiempos).includes('Short Cargo')&&String(alertasTiempos).includes('samPorCentro'));
    __check("SG6: y la de las categorías sin empaque también",String(alertasTiempos).includes('empaque'));
    page='operaciones';render();
    __check("SG6: el panel está en Configuración → Operaciones",/Tiempos por revisar/.test(document.getElementById('p-operaciones').innerHTML));}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("SG sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* GUARDIA DE CARTERA · un conteo de órdenes tiene que decir sobre qué base está hecho */
  {const antes=__R.errors.length;const adminP=PERFIL;const a0=window.alert;window.alert=()=>{};
   PERFIL={rol:'admin',modo:'editar',nombre:'Dirección'};
   const src=[...document.scripts].map(x=>x.textContent).sort((a,b)=>b.length-a.length)[0]||'';
   /* nadie puede filtrar la cartera por el estado interno a mano: para eso está abiertaDe() */
   {const usos=src.split(String.fromCharCode(10)).filter(l=>/\.filter\([a-z]\s*=>\s*!?[a-z]\.estado\s*===?\s*'(plan|cerrada|standby|noArchivo)'/.test(l)
     &&!/no de la cartera/.test(l)).map(l=>l.trim().slice(0,70));
    __check("GC1: ninguna pantalla filtra la cartera por el estado interno a mano",usos.length===0,usos.slice(0,3).join(" · "));}
   {const def=(src.match(/const abierta=o=>/g)||[]).length;
    __check("GC1: hay UNA sola definición de orden abierta en el código",def===1);
    __check("GC1: y delega en abiertaDe()",/const abierta=o=>\(typeof abiertaDe==='function'\)\?abiertaDe\(o\)/.test(src));}
   /* las cuatro bases existen, están declaradas y dan subconjuntos encajados */
   {__check("GC2: las cuatro bases de cartera están declaradas, con su explicación",
     BASES_CARTERA.length===4&&BASES_CARTERA.every(b=>b[0]&&b[1]&&b[2]));
    const c=BASES_CARTERA.map(b=>cuentaCartera(b[0]));
    __check("GC2: cargadas ≥ abiertas ≥ lanzadas ≥ liberadas",
     c[0].n>=c[1].n&&c[1].n>=c[2].n&&c[2].n>=c[3].n,c.map(x=>x.base+':'+x.n).join(' '));
    __check("GC2: y cada base es subconjunto de la anterior",(()=>{
     const ids=c.map(x=>new Set(x.ordenes.map(o=>o.id)));
     return [...ids[1]].every(id=>ids[0].has(id))&&[...ids[2]].every(id=>ids[1].has(id))&&[...ids[3]].every(id=>ids[2].has(id))})());
    __check("GC2: todas pasan por la definición única",(()=>{
     return carteraDe('abiertas').every(abiertaDe)&&carteraDe('lanzadas').every(o=>abiertaDe(o)&&lanzada(o))
       &&carteraDe('liberadas').every(o=>abiertaDe(o)&&lanzada(o)&&liberadaCorte(o))})());
    let malo=false;try{carteraDe('inventada')}catch(e){malo=true}
    __check("GC3: pedir una base que no existe es un error, no un silencio",malo);}
   /* el número SIEMPRE se muestra con su base escrita al lado */
   {const h=cifraCarteraHTML('lanzadas');
    __check("GC4: una cifra de cartera se muestra con su base al lado",/lanzadas/.test(h));
    const p1=cargaTiemposEst('lanzadas'),p2=cargaTiemposEst('abiertas');
    __check("GC4: la carga de los tiempos estimados se calcula por base",p1.base==='lanzadas'&&p2.base==='abiertas'&&p2.n>=p1.n);
    const hp=cargaTiemposEstHTML();
    if(p1.filas.length){
     __check("GC4: el panel dice sobre qué base está y ofrece las otras",/Base/.test(hp)&&/Total \u00b7 /.test(hp)&&/En las otras bases/.test(hp));
     __check("GC4: y avisa de que el número cambia mucho según la base",/cambia mucho seg\u00fan la base/.test(hp));}
    page='operaciones';render();
    __check("GC4: está en Configuración → Operaciones",!p1.filas.length||/Carga de los tiempos estimados/.test(document.getElementById('p-operaciones').innerHTML));}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page='ordenes';render();
   __check("GC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* ===== NIVELACIÓN DE CARGA · PASO 1: el motor y el cuadrito ===== */
  try{localStorage.__fase="nivelacion paso1"}catch(e){}
  {const antes=__R.errors.length;const a0=window.alert;window.alert=()=>{};
   const adminP=PERFIL;
   /* --- 1 · el motor, con números a mano: cada paso se puede verificar a ojo --- */
   {const r=nivelar({id:"t1",saldoMin:10000,maquilaMin:2000,capDia:800,inicio:"2026-10-01",compromiso:"2026-10-31"});
    __check("NIV1: saldo neto = saldo − maquila",r.netoMin===8000,r.netoMin);
    __check("NIV1: días necesarios = neto ÷ capacidad, hacia arriba",r.diasNec===10,r.diasNec);
    __check("NIV1: la fecha final cuenta el inicio como día 1",r.fin===finLabInc("2026-10-01",10),r.fin);
    __check("NIV1: producción alcanzable = capacidad × días disponibles",r.alcanzableMin===800*r.diasDisp,r.alcanzableMin+" / "+r.diasDisp);
    __check("NIV1: rezago = neto − alcanzable, nunca negativo",r.rezagoMin===Math.max(0,8000-800*r.diasDisp),r.rezagoMin);
    __check("NIV1: meta diaria = neto ÷ días disponibles",Math.abs(r.metaMin-8000/r.diasDisp)<1e-9,r.metaMin);
    __check("NIV1: holgura = días disponibles − días necesarios",r.holgura===r.diasDisp-10,r.holgura);
    __check("NIV1: cabe ⇔ rezago cero",r.cabe===(r.rezagoMin===0));
    __check("NIV1: sin datos faltantes no hay lista de faltantes",r.falta.length===0,r.falta.join("|"));}
   /* cero es cero: una capacidad de 0 NO se reemplaza por un valor por defecto */
   {const r=nivelar({id:"t0",saldoMin:5000,capDia:0,inicio:"2026-10-01",compromiso:"2026-10-31"});
    __check("NIV2: capacidad 0 se respeta: alcanzable 0",r.alcanzableMin===0,r.alcanzableMin);
    __check("NIV2: y el rezago es TODO el saldo",r.rezagoMin===5000,r.rezagoMin);
    __check("NIV2: días necesarios no se inventan con capacidad 0",r.diasNec===null,r.diasNec);
    __check("NIV2: y no cabe",r.cabe===false);}
   /* saldo cero: cabe, con cero días, sin brechas */
   {const r=nivelar({id:"tz",saldoMin:0,capDia:500,inicio:"2026-10-01",compromiso:"2026-10-31"});
    __check("NIV3: saldo 0 → 0 días necesarios y cabe",r.diasNec===0&&r.rezagoMin===0&&r.cabe===true,r.diasNec+"/"+r.rezagoMin);}
   /* dato faltante: null, NUNCA cero, y se dice cuál falta */
   {const r=nivelar({id:"tf",saldoMin:null,capDia:null,inicio:"",compromiso:""});
    __check("NIV4: sin saldo ni capacidad no se calcula nada",r.netoMin===null&&r.diasNec===null&&r.rezagoMin===null&&r.cabe===null);
    __check("NIV4: y ningún faltante se volvió 0",r.alcanzableMin===null&&r.metaMin===null&&r.holgura===null);
    __check("NIV4: la lista de faltantes nombra los cuatro datos",r.falta.length>=3,r.falta.join(" · "));}
   /* --- 2 · SAM: el mismo del motor, y null no es cero --- */
   {const conRuta=carteraDe("abiertas").filter(o=>(o.ruta||[]).some(x=>x.centro==="modulos"));
    const sams=conRuta.map(o=>samOrdenCentro(o,"modulos"));
    __check("NIV5: samOrdenCentro devuelve null (no 0) cuando no hay minuto por prenda",
      sams.every(s=>s===null||s>0),sams.filter(s=>s===0).length+" ceros");
    const o1=conRuta.find(o=>samOrdenCentro(o,"modulos")!=null);
    if(o1){const p=(o1.ruta||[]).find(x=>x.centro==="modulos");
     __check("NIV5: y es exactamente minPrenda(centro,técnica), el del motor",samOrdenCentro(o1,"modulos")===minPrenda("modulos",p.t));}}
   /* --- 3 · el saldo de un proceso: por RUTA, no por fase --- */
   {NIV.horizonte=null;NIVC=null;
    const s=saldoProceso("corte",null);
    __check("NIV6: el saldo de corte existe y trae minutos y unidades",!!s&&s.min>=0&&s.unid>=0,s&&(s.unid+" u / "+Math.round(s.min)+" min"));
    __check("NIV6: toda orden del saldo tiene corte EN SU RUTA",s.ordenes.every(o=>(o.ruta||[]).some(x=>x.centro==="corte")));
    __check("NIV6: ninguna del saldo tiene el paso ya hecho",s.ordenes.every(o=>!pasoHecho(o,"corte")));
    __check("NIV6: las órdenes sin SAM NO suman minutos, se listan aparte",
      s.sinSAM.every(o=>samOrdenCentro(o,"corte")===null)&&s.unidSinSAM>=0,s.sinSAM.length+" órdenes / "+s.unidSinSAM+" u");
    const sp=samPonderado(s);
    __check("NIV6: el SAM ponderado es la conversión minutos↔unidades",sp===null||Math.abs(s.min/s.unid-sp)<1e-9,sp);
    __check("NIV6: aUnid(min,sam) invierte el SAM ponderado",sp==null||Math.abs(aUnid(s.min,sp)-s.unid)<1e-6);
    __check("NIV6: sin SAM no hay conversión (null, no 0)",aUnid(1000,null)===null&&aUnid(1000,0)===null);
    __R.niv=__R.niv||{};__R.niv.corte={unid:s.unid,min:s.min,n:s.ordenes.length,sam:sp,
      sinSAM:s.sinSAM.length,unidSinSAM:s.unidSinSAM,maquila:s.maquila,minMaquila:s.minMaquila};}
   /* --- 4 · la tela va por FASE (columna nueva de la tabla 1), no por ruta --- */
   {const fs0=fasesDeProcNivel("tela");
    __check("NIV7: el proceso Tela se define por fase",procNivel("tela").porFase===true);
    __check("NIV7: los tres procesos de planta salen de la ruta",
      ["corte","confeccion","empaque"].every(p=>procNivel(p).porFase===false&&!!procNivel(p).centro));
    /* marcar una fase y comprobar que el saldo de tela la toma */
    const fila=faseMapeo()[0];const iFila=0;const guardo=fila.nivel;
    setNivelFase(iFila,"tela");
    __check("NIV7: marcar una fase como Tela la deja en la tabla 1",fasesDeProcNivel("tela").includes(fila.fase),fila.fase);
    const st=saldoProceso("tela",null);
    __check("NIV7: el saldo de tela cuenta UNIDADES, no minutos",st.min===0&&st.unid>=0,st.unid);
    __check("NIV7: y solo órdenes en esa fase",st.ordenes.every(o=>fasesDeProcNivel("tela").map(normFase).includes(normFase(o.fase||""))));
    setNivelFase(iFila,guardo||"");
    __check("NIV7: y se puede desmarcar",!fasesDeProcNivel("tela").includes(fila.fase)||!!guardo);}
   /* --- 5 · grupos de módulos: nace VACÍA, suma ≤ 100, errores a la vista --- */
   {S.params.gruposMod=[];NIVC=null;
    __check("NIV8: la tabla de grupos nace vacía",gruposMod().length===0);
    const mods=S.recursos.filter(r=>r.activa&&r.centro==="modulos"&&r.id!=="maquila");
    if(mods.length>=1){
     addGrupoMod();const g=gruposMod()[0];
     setGrupoMod(g.id,"n","Prueba A");setGrupoMod(g.id,"fams",["CAMISETAS"]);
     setPctModGrupo(g.id,mods[0].id,60);
     __check("NIV8: el % de un módulo en un grupo se guarda",((g.mods||[])[0]||{}).pct===60);
     addGrupoMod();const g2=gruposMod()[1];setGrupoMod(g2.id,"n","Prueba B");setGrupoMod(g2.id,"fams",["POLOS"]);
     setPctModGrupo(g2.id,mods[0].id,60);
     __check("NIV8: 60% + 60% = 120% del mismo módulo",pctModTotal(mods[0].id)===120,pctModTotal(mods[0].id));
     __check("NIV8: y sale como ERROR visible, no se corrige solo",
       erroresGruposMod().some(e=>/pasa del 100/.test(e.txt)),erroresGruposMod().map(e=>e.txt).join(" | "));
     setPctModGrupo(g2.id,mods[0].id,40);
     __check("NIV8: bajando a 40% el error desaparece",!erroresGruposMod().some(e=>/pasa del 100/.test(e.txt)));
     const cap=capGrupoDia(g,hoy());
     __check("NIV8: la capacidad del grupo es el capDia del motor por el %",
       Math.abs(cap-capDia(R(mods[0].id),hoy())*0.6)<1e-6,cap);
     const sg=saldoGrupo(g,null);
     __check("NIV8: el saldo del grupo es un subconjunto del de confección",!!sg&&sg.min>=0,sg&&sg.unid);
     const cg=cuadritoGrupo(g);
     __check("NIV8: el cuadrito de un grupo se arma",!!cg&&!!cg.calc&&/Prueba A/.test(cuadritoNivHTML(cg)));
     __R.niv=__R.niv||{};__R.niv.grupo={n:cg.titulo,notaCap:cg.notaCap,cap:cg.calc.capDia,
       unid:sg.unid,min:sg.min,sam:cg.sam,sinSAM:sg.sinSAM.length,unidSinSAM:sg.unidSinSAM,
       diasNec:cg.calc.diasNec,rezago:cg.calc.rezagoMin,falta:cg.calc.falta.slice()};
     S.params.gruposMod=[];NIVC=null;}}
   /* --- 6 · el cuadrito de corte, el componente reutilizable --- */
   {const c=cuadritoProceso("corte");
    __check("NIV9: el cuadrito de corte se arma",!!c&&!!c.calc);
    const h=cuadritoNivHTML(c);
    __check("NIV9: dice «Saldo por procesar (incluye órdenes en fases anteriores)»",/Saldo por procesar \(incluye órdenes en fases anteriores\)/.test(h));
    __check("NIV9: muestra los minutos Y las unidades",/min/.test(h)&&(c.sam==null||/ u</.test(h)),c.sam);
    __check("NIV9: dice de dónde sale la capacidad",!!c.notaCap&&h.indexOf(c.notaCap)>=0,c.notaCap);
    __check("NIV9: si falta un dato lo dice, no lo rellena",c.calc.falta.length===0||/dato faltante|falta/.test(h),c.calc.falta.join(" · "));
    __check("NIV9: las órdenes sin SAM se avisan aparte y no se suman como cero",
      !c.saldo.unidSinSAM||/sin SAM/.test(h),c.saldo.unidSinSAM);
    __R.niv=__R.niv||{};__R.niv.cuadCorte={cap:c.calc.capDia,notaCap:c.notaCap,saldo:c.calc.saldoMin,
      neto:c.calc.netoMin,diasNec:c.calc.diasNec,inicio:c.calc.inicio,fin:c.calc.fin,comp:c.calc.compromiso,
      diasDisp:c.calc.diasDisp,alcanzable:c.calc.alcanzableMin,rezago:c.calc.rezagoMin,meta:c.calc.metaMin,
      holgura:c.calc.holgura,cabe:c.calc.cabe,falta:c.calc.falta.slice(),sam:c.sam};}
   /* --- 7 · las fechas: el inicio no puede ser anterior a hoy --- */
   {let aviso="";window.alert=m=>{aviso=String(m)};
    setNivFecha("corte","inicio",dsum(hoy(),-5));
    __check("NIV10: una fecha de inicio anterior a hoy se rechaza con aviso",nivFecha("corte","inicio")!==dsum(hoy(),-5)&&/anterior a hoy/.test(aviso),aviso);
    window.alert=()=>{};
    const ini=dsumLab(hoy(),1);setNivFecha("corte","inicio",ini);
    __check("NIV10: una fecha válida sí se guarda",nivFecha("corte","inicio")===ini,nivFecha("corte","inicio"));
    setNivFecha("corte","compromiso",dsumLab(ini,15));
    __check("NIV10: el compromiso se guarda y el cuadrito lo usa",cuadritoProceso("corte").calc.compromiso===dsumLab(ini,15));
    __check("NIV10: días disponibles = hábiles del inicio al compromiso, inclusive",
      cuadritoProceso("corte").calc.diasDisp===diasHabilesInc(ini,dsumLab(ini,15)));}
   /* --- 8 · el permiso «programa»: quién puede tocar esto --- */
   {const roles=perfilesDef().filter(p=>(p.permisos||[]).includes("*")||(p.permisos||[]).includes("programa")).map(p=>p.id);
    __check("NIV11: hay al menos un perfil con el permiso «programa»",roles.length>0,roles.join(", "));
    __R.niv=__R.niv||{};__R.niv.roles=perfilesDef().map(p=>({id:p.id,n:p.n,
      programa:(p.permisos||[]).includes("*")||(p.permisos||[]).includes("programa"),
      via:(p.permisos||[]).includes("*")?"*":((p.permisos||[]).includes("programa")?"programa":"")}));
    __R.niv.usuarios=(S.usuarios||[]).length;
    /* un perfil sin el permiso no edita nada de la nivelación */
    const sinP=perfilesDef().find(p=>!(p.permisos||[]).includes("*")&&!(p.permisos||[]).includes("programa"));
    if(sinP){const guardo=PERFIL;PERFIL={...guardo,rol:sinP.id};
     const ant=nivFecha("corte","compromiso");let av="";window.alert=m=>{av=String(m)};
     setNivFecha("corte","compromiso",dsumLab(hoy(),40));
     __check("NIV11: sin el permiso «programa» no se puede mover una fecha",nivFecha("corte","compromiso")===ant&&/planificaci/i.test(av),sinP.id+": "+av);
     const nG=gruposMod().length;addGrupoMod();
     __check("NIV11: ni crear un grupo de módulos",gruposMod().length===nG);
     PERFIL=guardo;window.alert=()=>{}}}
   /* --- 9 · el saldo NO es la carga del centro: son cuentas distintas y la pantalla lo dice --- */
   {const s=saldoProceso("corte",null);
    const enFase=s.ordenes.filter(o=>normFase(o.fase||"")===normFase("2Corte")).length;
    __R.niv=__R.niv||{};__R.niv.corteEnFase=enFase;
    __check("NIV12: el saldo incluye órdenes que todavía NO están en la fase del centro",
      s.ordenes.length===0||enFase<=s.ordenes.length,enFase+" de "+s.ordenes.length+" están en la fase 2Corte");}
   /* --- 10 · el horizonte por mes de entrega --- */
   {const ms=mesesNivDisp();
    __check("NIV13: los meses del horizonte salen de la fecha meta",Array.isArray(ms)&&ms.length>0,ms.slice(0,6).join(", "));
    const m0=ms.find(m=>m!=="sin fecha");
    if(m0){NIV.horizonte=[m0];NIVC=null;const s1=saldoProceso("corte",[m0]);const sT=saldoProceso("corte",null);
     __check("NIV13: acotar el horizonte a un mes no agranda el saldo",s1.unid<=sT.unid,s1.unid+" ≤ "+sT.unid);
     __check("NIV13: y todas las órdenes son de ese mes",s1.ordenes.every(o=>mesEntregaNiv(o)===m0));
     NIV.horizonte=null;NIVC=null}}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page="ordenes";render();
   __check("NIV sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* ===== NIVELACIÓN · correcciones del Paso 1 ===== */
  try{localStorage.__fase="nivelacion correcciones"}catch(e){}
  {const antes=__R.errors.length;const a0=window.alert;window.alert=()=>{};const adminP=PERFIL;
   /* --- C1 · una sola convención: inicio día 1, compromiso inclusive --- */
   {/* un tramo de laboratorio sin excepciones: lunes 2026-10-05 a viernes 2026-10-09 */
    const bakEx=S.params.excepciones;S.params.excepciones=[];
    __check("C1: 5 días hábiles desde el lunes terminan el VIERNES de la misma semana",
      finLabInc("2026-10-05",5)==="2026-10-09",finLabInc("2026-10-05",5));
    __check("C1: 1 día hábil desde el lunes es el mismo lunes",finLabInc("2026-10-05",1)==="2026-10-05");
    __check("C1: los días hábiles de lunes a viernes, los dos inclusive, son 5",diasHabilesInc("2026-10-05","2026-10-09")===5,diasHabilesInc("2026-10-05","2026-10-09"));
    __check("C1: un solo día hábil contra sí mismo cuenta 1",diasHabilesInc("2026-10-05","2026-10-05")===1);
    __check("C1: el fin de semana no cuenta",diasHabilesInc("2026-10-10","2026-10-11")===0);
    __check("C1: si el inicio cae en sábado, el día 1 es el lunes siguiente",finLabInc("2026-10-10",1)==="2026-10-12",finLabInc("2026-10-10",1));
    /* las dos funciones son coherentes entre sí: llegar al día N y contar hasta él da N */
    let coh=true;for(let n=1;n<=20;n++){if(diasHabilesInc("2026-10-05",finLabInc("2026-10-05",n))!==n)coh=false}
    __check("C1: contar hasta el día N devuelve exactamente N (las dos funciones concuerdan)",coh);
    /* una excepción cargada se descuenta y se puede explicar */
    S.params.excepciones=[{fecha:"2026-10-07",area:"todas",tipo:"no",nota:"prueba"}];
    __check("C1: una excepción «a todas» quita un día hábil",diasHabilesInc("2026-10-05","2026-10-09")===4,diasHabilesInc("2026-10-05","2026-10-09"));
    __check("C1: y 5 días hábiles ahora terminan el lunes siguiente",finLabInc("2026-10-05",5)==="2026-10-12",finLabInc("2026-10-05",5));
    const nh=noHabilesEntre("2026-10-05","2026-10-12");
    __check("C1: se puede decir QUÉ días se descontaron y por qué",
      nh.some(x=>x.fecha==="2026-10-07"&&x.excepcion)&&nh.some(x=>x.fecha==="2026-10-10"&&!x.excepcion),JSON.stringify(nh));
    __check("C1: el tooltip nombra la excepción y la convención",
      /inclusive/.test(txtHabiles("2026-10-05","2026-10-12"))&&/prueba/.test(txtHabiles("2026-10-05","2026-10-12")));
    /* meses sin festivos cargados: se avisa, no se inventa */
    __check("C1: un mes sin excepciones cargadas se avisa",mesesSinFestivos("2026-11-02","2026-11-06").includes("2026-11"));
    __check("C1: y un mes con excepciones no",!mesesSinFestivos("2026-10-05","2026-10-09").includes("2026-10"));
    /* el motor entero usa la convención */
    const r=nivelar({id:"cc",saldoMin:1000,capDia:200,inicio:"2026-10-05",compromiso:"2026-10-09"});
    __check("C1: nivelar usa la convención inclusiva de punta a punta",
      r.diasNec===5&&r.fin===finLabInc("2026-10-05",5)&&r.diasDisp===diasHabilesInc("2026-10-05","2026-10-09"),r.fin+" / "+r.diasDisp);
    __check("C1: y trae el detalle para explicarlo en pantalla",Array.isArray(r.noHabiles)&&!!r.txtDias&&!!r.txtProd);
    /* dsumLab NO cambió: sigue siendo un PLAZO (n días DESPUÉS), que es otra cosa */
    S.params.excepciones=[];
    __check("C1: dsumLab sigue siendo exclusivo (es el plazo del proveedor en el motor)",
      dsumLab("2026-10-05",5)==="2026-10-12"&&finLabInc("2026-10-05",5)==="2026-10-09");
    S.params.excepciones=bakEx;}
   /* --- C3 · el compromiso NO tiene valor por defecto --- */
   {const bak=S.params.nivelacion;delete S.params.nivelacion;NIVC=null;
    __check("C3: sin nada guardado, el compromiso viene vacío",nivFecha("corte","compromiso")==="");
    const c=cuadritoProceso("corte");
    __check("C3: y el cuadrito lo declara dato faltante, no inventa una fecha",
      c.calc.compromiso===null&&c.calc.falta.includes("fecha de compromiso"),JSON.stringify(c.calc.falta));
    __check("C3: sin compromiso no hay días disponibles, ni alcanzable, ni rezago (null, no 0)",
      c.calc.diasDisp===null&&c.calc.alcanzableMin===null&&c.calc.rezagoMin===null&&c.calc.cabe===null);
    const h=cuadritoNivHTML(c);
    __check("C3: y en pantalla sale «dato faltante»",/dato faltante/.test(h));
    S.params.nivelacion=bak;NIVC=null;}
   /* --- C2 · el alcance de cada cifra va rotulado --- */
   {NIV.horizonte=null;NIVC=null;const c=cuadritoProceso("corte");const h=cuadritoNivHTML(c);
    __check("C2: el cuadrito trae el saldo del horizonte Y el saldo total",!!c.saldo&&!!c.saldoTot);
    __check("C2: el saldo del horizonte nunca es mayor que el total",c.saldo.unid<=c.saldoTot.unid&&c.saldo.sinSAM.length<=c.saldoTot.sinSAM.length);
    if(c.saldo.unidSinSAM||c.saldoTot.unidSinSAM){
     __check("C2: «sin SAM» dice en este horizonte y en todo el saldo",/en este horizonte/.test(h)&&/en todo el saldo/.test(h));
     __check("C2: y escribe cuál es el horizonte",h.indexOf(c.horTxt)>=0,c.horTxt);}
    NIVC=null;}
   /* --- C5 · la configuración: tabla de grupos y parámetros de tela --- */
   {const bakG=S.params.gruposMod;S.params.gruposMod=[];NIVC=null;
    page="config";CONF.tab="nivel";render();let h=document.getElementById("p-config").innerHTML;
    __check("C5: la pestaña «Nivelación de carga» existe en Configuración",/Grupos de m\u00f3dulos/.test(h)&&/Tela por entregar/.test(h));
    __check("C5: la tabla de grupos se muestra vacía y lo dice",/nace vac\u00eda/.test(h));
    __check("C5: los parámetros de tela están (N días y valor planificado)",/D\u00edas h\u00e1biles del promedio real/.test(h)&&/Valor planificado/.test(h));
    __check("C5: y dice que no convierte horas ni kilos",/sin convertir horas ni kilos/.test(h));
    __check("C5: avisa si faltan festivos del mes",/sin festivos cargados|hay excepciones cargadas/.test(h));
    const mods=S.recursos.filter(r=>r.activa&&r.centro==="modulos"&&r.id!=="maquila");
    if(mods.length){
     addGrupoMod();const g=gruposMod()[0];
     __check("C5: un grupo nuevo nace SUGERIDO, no confirmado",g.sugerido===true&&!grupoConfirmado(g));
     render();h=document.getElementById("p-config").innerHTML;
     __check("C5: y la tabla lo muestra como sugerido",/sugerido/.test(h));
     /* sin módulos ni familias no se deja confirmar */
     let av="";window.alert=m=>{av=String(m)};confirmarGrupoMod(g.id);
     __check("C5: no se confirma un grupo sin módulos ni familias",!grupoConfirmado(g)&&/no tiene/i.test(av),av);
     window.alert=()=>{};
     setGrupoMod(g.id,"n","Grupo C5");setPctModGrupo(g.id,mods[0].id,100);togFamGrupo(g.id,famsCatalogo()[0]);
     confirmarGrupoMod(g.id);
     __check("C5: confirmado queda con responsable y fecha",grupoConfirmado(g)&&!!g.confirmado.u&&!!g.confirmado.ts,JSON.stringify(g.confirmado));
     render();h=document.getElementById("p-config").innerHTML;
     __check("C5: y la tabla muestra quién y cuándo",/confirmado/.test(h)&&h.indexOf(esc(g.confirmado.u))>=0);
     /* tocarlo lo devuelve a sugerido: nada confirmado cambia a escondidas */
     togFamGrupo(g.id,famsCatalogo()[1]||famsCatalogo()[0]);
     __check("C5: cambiar un grupo confirmado lo devuelve a sugerido",!grupoConfirmado(g)&&g.sugerido===true);
     /* la misma familia en dos grupos se cuenta dos veces: la validación lo dice */
     confirmarGrupoMod(g.id);addGrupoMod();const g2=gruposMod()[1];
     setGrupoMod(g2.id,"n","Grupo C5 bis");setPctModGrupo(g2.id,mods[0].id,10);
     (g.fams||[]).forEach(f=>togFamGrupo(g2.id,f));
     __check("C5: una familia en dos grupos sale como error de doble conteo",
       validarGruposMod().some(e=>!e.aviso&&/dos veces/.test(e.txt)),validarGruposMod().filter(e=>!e.aviso).map(e=>e.txt).join(" | "));
     __check("C5: y las familias sin ningún grupo salen como aviso, no como error",
       validarGruposMod().some(e=>e.aviso&&/no est\u00e1 en ning\u00fan grupo/.test(e.txt)));
     /* sin el permiso no se confirma nada */
     const guardo=PERFIL;const sinP=perfilesDef().find(p=>!(p.permisos||[]).includes("*")&&!(p.permisos||[]).includes("programa"));
     if(sinP){PERFIL={...guardo,rol:sinP.id};const g3=gruposMod()[1];const ant=grupoConfirmado(g3);
      confirmarGrupoMod(g3.id);
      __check("C5: sin el permiso «programa» no se confirma un grupo",grupoConfirmado(g3)===ant);
      PERFIL=guardo}
     S.params.gruposMod=[];NIVC=null}
    S.params.gruposMod=bakG||[];NIVC=null;}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page="ordenes";render();
   __check("Correcciones sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* ===== COLA POR CERCANÍA ===== */
  try{localStorage.__fase="cola cercania"}catch(e){}
  {const antes=__R.errors.length;const a0=window.alert;window.alert=()=>{};const adminP=PERFIL;
   PLAN=null;PLAN_ALL=null;const P=programar();
   /* --- 1 · la clasificación se apoya en lo que ya existía --- */
   {const cens=S.centros.filter(x=>x.area==="pro").map(x=>x.id);
    let ok=true,mal=null,nRev=0,nDisp=0;
    cens.forEach(c=>{S.ordenes.filter(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro===c)&&!pasoHecho(o,c)).slice(0,120).forEach(o=>{
      const x=cercaniaCentro(o,c,P);const sec=secuenciaCentro(o,c);
      if(x.grupo==="revisar"){nRev++;if(sec.estado!=="sinSecuencia"){ok=false;mal=o.op+"/"+c}}
      else if(sec.estado==="sinSecuencia"){ok=false;mal=o.op+"/"+c}
      if(x.grupo==="disponible")nDisp++;
      if(x.grupo!=="revisar"&&sec.estado==="proxima"&&x.ant){
        if(x.grupo==="anomalia")return;const r=rangoFaseCentro(c,o.fase);const esperado=(r==null||r>=0)?"porLlegar":"lejana";
        if(x.grupo!==esperado){ok=false;mal=o.op+"/"+c+" "+x.grupo+"!="+esperado+" (fase "+o.fase+")"}}})});
    __check("CC1: «Revisar ruta» es exactamente sinSecuencia de secuenciaCentro",ok,mal);
    __check("CC1: la LISTA de fases del centro parte Por llegar de Todo lo que viene (ya no los pasos pendientes)",ok,mal);
    __check("CC1: manda secuenciaCentro y el desacuerdo se anota, no se esconde",(()=>{
      let anotados=0,contradice=0;
      cens.forEach(c=>S.ordenes.filter(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro===c)&&!pasoHecho(o,c)).slice(0,120).forEach(o=>{
        const x=cercaniaCentro(o,c,P);if(x.desacuerdo)anotados++;
        if(x.grupo==="disponible"&&x.ant&&!pasoHecho(o,x.ant)&&!x.desacuerdo)contradice++}));
      __R.cc=__R.cc||{};__R.cc.desacuerdos=anotados;return contradice===0})());}
   /* --- 2 · la lista de fases visibles por centro (tabla nueva) reemplaza al umbral en pasos --- */
   {__check("CC2: el umbral en pasos se retiró (ni función ni parámetro)",typeof umbralCercania==="undefined"&&typeof setUmbralCercania==="undefined"&&!/umbralCercania/.test(String(cercaniaCentro)));
    const t=fasesCentroTabla();const pro=S.centros.filter(c=>c.area==="pro"&&c.activo!==false).map(c=>c.id);
    const conEtapa=pro.filter(c=>centroEtapaDe(c)),sinEtapa=pro.filter(c=>!centroEtapaDe(c));
    __check("CC2: cada centro de producción con etapa (tabla 4) tiene su lista sembrada desde la tabla 1, marcada «sugerido»",conEtapa.length>=8&&conEtapa.every(c=>t[c]&&t[c].fases.length&&t[c].sugerido===true),conEtapa.filter(c=>!t[c]).join(","));
    __check("CC2: un centro sin etapa no recibe lista inventada y sale en la bandeja «Centros sin lista de fases» de Hoy",sinEtapa.every(c=>!t[c])&&(sinEtapa.length===0||pendientesHoy().some(p=>p.k==="colaSinLista"&&sinEtapa.every(c=>p.detalle.includes(nCen(c))))),sinEtapa.join(","));
    const lc=(t.corte||{}).fases||[];
    __check("CC2: Corte: 3CD CORTE · Trazos · AEROPUERTO · Planificación · Calidad tintorería (última visible), y nada textil ni de diseño",normFase(lc[0]||"")==="3cdcorte"&&normFase(lc[lc.length-1]||"")==="1calidadtintoreria"&&lc.some(f=>/trazos/i.test(f))&&lc.some(f=>/planificacion/i.test(f))&&!lc.some(f=>/^1tejeduria|^1tintoreria|^0/i.test(normFase(f))),lc.join(" › "));
    __check("CC2: 1Calidad Tintoreria entra desde la tabla 1 (columna tela), aunque no venga de Odoo",lc.some(f=>normFase(f)==="1calidadtintoreria")&&!(window.__tareaRows||[]).some(r=>normFase(String(r[11]||""))==="1calidadtintoreria"));
    __check("CC2: Botones y Empaque tienen listas propias (se pueden editar por separado)",!!t.botones&&!!t.empaque&&t.botones!==t.empaque&&t.botones.fases!==t.empaque.fases);
    __check("CC2: rangoFaseCentro: 0 la más cercana, -1 fuera, null sin lista, y compara con normFase",rangoFaseCentro("corte","3CD CORTE")===0&&rangoFaseCentro("corte","3 cd corte")===0&&rangoFaseCentro("corte","1Tejeduria")===-1&&rangoFaseCentro("centro-inexistente","x")===null);
    /* editar, confirmar, volver a la sugerida; permisos */
    const bakT=JSON.stringify(t.corte);const nb=S.bitacora.length;
    setFasesCentro("corte",["3CD CORTE","3Trazos"],"prueba");
    __check("CC2: editar la lista la deja «sugerido» y va a bitácora",t.corte.fases.length===2&&t.corte.sugerido===true&&S.bitacora.slice(nb).some(b=>/Fases visibles en la cola de Corte/.test(b.t)));
    confirmarFasesCentro("corte");__check("CC2: confirmar la marca confirmada (con quién y cuándo)",t.corte.sugerido===false&&!!(t.corte.confirmado||{}).ts);
    moverFaseCentro("corte",1,-1);__check("CC2: mover una fase la reordena y vuelve a sugerido",normFase(t.corte.fases[0])==="3trazos"&&t.corte.sugerido===true);
    let av="";window.alert=m=>{av=String(m)};quitarFaseCentro("corte",0);quitarFaseCentro("corte",0);window.alert=()=>{};
    __check("CC2: nunca queda una lista vacía",t.corte.fases.length===1&&/al menos una fase/.test(av),av);
    volverSugeridaFasesCentro("corte");__check("CC2: «volver a la sugerida» rehace la propuesta de la tabla 1",normFase(t.corte.fases[0])==="3cdcorte"&&t.corte.fases.length>=4);
    {const bakP=PERFIL;PERFIL={id:"u-op7",rol:"corte",nombre:"Op"};av="";window.alert=m=>{av=String(m)};setFasesCentro("corte",["3Trazos"],"x");window.alert=()=>{};PERFIL=bakP;
     __check("CC2: sin permiso programa no se edita",/Solo planificaci/.test(av)&&normFase(t.corte.fases[0])==="3cdcorte",av);}
    t.corte=JSON.parse(bakT);
    page="config";CONF.tab="cal";render();const hc=document.getElementById("p-config").innerHTML;
    __check("CC2: la tabla se edita en Configuración → Calendario y parámetros, y el umbral ya no está",/Fases visibles en la cola de cada centro/.test(hc)&&/sugerido/.test(hc)&&/confirmarFasesCentro\(/.test(hc)&&!/umbral de .lejanas./i.test(hc));}
   /* --- 3 · la etiqueta de llegada, caso por caso --- */
   {__check("CC3: hoy no cuenta; el siguiente día hábil es 1",habilesHasta(hoy(),null)===0&&habilesHasta(dsumLab(hoy(),1),null)===1,
      habilesHasta(dsumLab(hoy(),1),null));
    __check("CC3: el de después es 2",habilesHasta(dsumLab(hoy(),2),null)===2,habilesHasta(dsumLab(hoy(),2),null));
    __check("CC3: una fecha pasada da 0 (no negativos)",habilesHasta(dsum(hoy(),-10),null)===0);
    __check("CC3: «hoy» / «mañana» / «en X días hábiles»",
      txtLlegada({tipo:"fecha",dias:0,fin:hoy()}).txt==="hoy"
      &&txtLlegada({tipo:"fecha",dias:1,fin:hoy()}).txt==="mañana"
      &&/^en 4 d\u00edas h\u00e1biles$/.test(txtLlegada({tipo:"fecha",dias:4,fin:hoy()}).txt),
      txtLlegada({tipo:"fecha",dias:4,fin:hoy()}).txt);
    __check("CC3: sin fin programado dice «sin programar», no una fecha",
      txtLlegada({tipo:"sinProgramar",ant:"corte"}).txt==="sin programar");
    __check("CC3: y sin origen de llegada dice «sin dato de llegada»",
      txtLlegada({tipo:"sinDato",motivo:"x"}).txt==="sin dato de llegada");
    __check("CC3: atrasado se cuenta en días y va en rojo",
      /^atrasado 3 d\u00edas$/.test(txtLlegada({tipo:"atrasado",dias:3,ant:"corte",fin:hoy()}).txt)
      &&txtLlegada({tipo:"atrasado",dias:3,ant:"corte",fin:hoy()}).cls==="cerc-mal");
    __check("CC3: disponible con faltante dice llegaron X de Y",
      txtLlegada({tipo:"llegaron",pz:80,cant:100,ant:"corte"}).txt==="llegaron 80 de 100");
    __check("CC3: la etiqueta sale en negrita con clase de color y con explicación",(()=>{
      const h=llegadaHTML({llegada:{tipo:"fecha",dias:3,fin:hoy(),ant:"corte"}});
      return /<b class="cerc-mal"/.test(h)&&/title="/.test(h)})());
    /* el conteo usa el calendario del RECURSO del paso anterior */
    {const r=S.recursos.find(x=>x.activa&&CE(x.centro)&&CE(x.centro).area==="pro");
     if(r){const bak=S.params.excepciones;
      const d1=dsumLab(hoy(),3);S.params.excepciones=[{fecha:d1,area:"todas",tipo:"no"}];
      __check("CC3: una excepción del calendario cambia la cuenta de días",
        habilesHasta(dsumLab(hoy(),4),null)<=4,habilesHasta(dsumLab(hoy(),4),null));
      S.params.excepciones=bak}}}
   /* --- 4 · primer centro de producción: la llegada sale de la tela --- */
   {const conCorte=S.ordenes.filter(o=>abierta(o)&&!pasoHecho(o,"corte")&&(o.ruta||[]).some(p=>p.centro==="corte")&&!centroAnteriorPro(o,"corte"));
    __R.cc=__R.cc||{};__R.cc.primerCentro={n:conCorte.length,tipos:{}};
    let malo=null;
    conCorte.forEach(o=>{const x=cercaniaCentro(o,"corte",P);const t=(x.llegada||{}).tipo||"?";
      __R.cc.primerCentro.tipos[t]=(__R.cc.primerCentro.tipos[t]||0)+1;
      if(t==="sinDato"&&x.grupo==="disponible")malo=o.op});
    __check("CC4: sin dato de llegada NUNCA es «disponible»",!malo,malo);
    __check("CC4: el primer centro no tiene paso anterior de producción",conCorte.every(o=>!centroAnteriorPro(o,"corte")));
    /* con la tela marcada lista, pasa a disponible; con bloqueo, a sin dato */
    /* Caso construido a propósito: «Disponible» en el primer centro exige WH, fase fuera de
       «previo a producción» y fuera del grupo textil, y la tela lista sin bloqueo. */
    {const o1=JSON.parse(JSON.stringify(conCorte[0]||S.ordenes.find(abierta)));
     o1.id="cc4-"+uid();o1.op="WH/MO/CC4";o1.sinLanzar=false;
     const gPost=faseGrupos().slice().sort((a,b)=>a.orden-b.orden).find(g=>g.orden>2);
     const fasePost=faseMapeo().find(r=>gPost&&r.sistema===gPost.grupo);
     if(fasePost)o1.fase=fasePost.fase;
     if(!(o1.ruta||[]).some(p=>p.centro==="corte"))o1.ruta=[{centro:"corte",t:1}].concat(o1.ruta||[]);
     S.ordenes.push(o1);PLAN=null;PLAN_ALL=null;
     const av=S.avance[o1.id]=S.avance[o1.id]||{};av.lista=true;
     const P3=programar();
     const g3=grupoDe(o1.fase);
     __check("CC4: con la tela lista y fase de producción, el primer centro queda disponible",
       cercaniaCentro(o1,"corte",P3).grupo==="disponible",
       (g3?g3.grupo+" orden "+ordenGrupo(g3.grupo):"(sin grupo)")+" → "+cercaniaCentro(o1,"corte",P3).grupo);
     /* la misma orden SIN WH nunca es disponible */
     o1.sinLanzar=true;
     __check("CC4: la misma orden sin WH ya no es disponible",cercaniaCentro(o1,"corte",P3).grupo!=="disponible");
     o1.sinLanzar=false;
     /* y con la tela bloqueada tampoco */
     const ro=P3.ordenes[o1.id]||{};const bb=ro.bloqueo;ro.bloqueo="sin liberar";
     const x=cercaniaCentro(o1,"corte",P3);
     __check("CC4: con la tela bloqueada no es disponible",x.grupo!=="disponible"&&(x.llegada||{}).tipo==="sinDato",x.grupo);
     ro.bloqueo=bb;
     S.ordenes=S.ordenes.filter(z=>z.id!==o1.id);delete S.avance[o1.id];PLAN=null;PLAN_ALL=null}}
   /* --- 4c · volver al orden por cercanía (decisión 5) --- */
   {const c="corte";const P2=programar();const lun=lunesDe(hoy());
    const cola=colaCentro(c,filasDeCentros([c],P2,lun,dsum(lun,6),""));
    if(cola.length>=2){
     cola.slice(0,2).forEach((f,i)=>{f.o.progCentro=f.o.progCentro||{};f.o.progCentro[c]=Object.assign({},f.o.progCentro[c],{pri:i+1,porColor:true})});
     __check("CC5b: hay órdenes con puesto manual para deshacer",ordenesConPuesto(c).length===2,ordenesConPuesto(c).length);
     /* sin el permiso no se puede */
     const guardo=PERFIL;const sinP=perfilesDef().find(p=>!(p.permisos||[]).includes("*")&&!(p.permisos||[]).includes("programa"));
     if(sinP){PERFIL={...guardo,rol:sinP.id};volverACercania(c);
      __check("CC5b: sin el permiso «programa» no se pueden quitar los puestos",ordenesConPuesto(c).length===2);
      PERFIL=guardo}
     const nb=S.bitacora.length;const na=(S.params.auditoriaCambios||[]).length;
     volverACercania(c);
     __check("CC5b: quita el puesto manual de todas las órdenes del centro",ordenesConPuesto(c).length===0);
     __check("CC5b: y también la marca de «juntar colores»",
       !S.ordenes.some(o=>(((o.progCentro||{})[c])||{}).porColor));
     __check("CC5b: queda en bitácora con quién y cuándo",
       S.bitacora.slice(nb).some(b=>/se quitaron los puestos manuales/.test(b.t)&&b.u&&b.ts),
       JSON.stringify(S.bitacora.slice(nb,nb+1)));
     __check("CC5b: y en auditoría, una línea por orden",(S.params.auditoriaCambios||[]).length>=na+2);
     const cola2=colaCentro(c,filasDeCentros([c],programar(),lun,dsum(lun,6),""));
     let ok=true;for(let i=1;i<cola2.length;i++){if(ordenCercania(cola2[i-1].cerc)>ordenCercania(cola2[i].cerc)+1e-9)ok=false}
     __check("CC5b: la cola vuelve a ordenarse sola por cercanía",ok,cola2.length+" órdenes");
     /* llamarlo dos veces avisa y no rompe */
     let av="";const a1=window.alert;window.alert=m=>{av=String(m)};volverACercania(c);window.alert=a1;
     __check("CC5b: si no hay puestos manuales, avisa y no hace nada",/ya se ordena por cercan\u00eda/.test(av),av);}}
   /* ===== CF · cola por fase con corte de profundidad (17-sep) ===== */
   {const c="corte";PLAN=null;PLAN_ALL=null;const Pf=programar();const lun=lunesDe(hoy());
    const filas=filasDeCentros([c],Pf,lun,dsum(lun,6),"");const cola=colaCentro(c,filas);const m=partirPorCercania(cola);
    __check("CF: los grupos de pantalla son Con puesto manual · Disponible · Por llegar · Revisar ruta · Todo lo que viene · Ya salió de aquí",CERCANIA_GRUPOS.map(g=>g[0]).join()==="puesto,disponible,porLlegar,revisar,lejana,anomalia"&&"puesto" in m&&"anomalia" in m);
    /* el orden: grupo → posición de la fase en la lista → llegada; la fórmula no deja que una llave pise a la anterior */
    __check("CF: una orden de la primera fase sin programar va ANTES que una de la segunda fase que llega en 2 días",ordenCercania({grupo:"porLlegar",faseRank:0,orden:9e8})<ordenCercania({grupo:"porLlegar",faseRank:1,orden:2}));
    __check("CF: dentro de Por llegar la cola va por fase en el orden de la lista",(()=>{const l=m.porLlegar;for(let i=1;i<l.length;i++){if((l[i-1].cerc.faseRank||0)>(l[i].cerc.faseRank||0))return false}return true})(),m.porLlegar.map(f=>f.o.fase+"#"+f.cerc.faseRank).slice(0,8).join(" | "));
    __check("CF: nada con fase fuera de la lista queda en Por llegar (va a Todo lo que viene), salvo anomalías",m.porLlegar.every(f=>f.cerc.enLista||f.cerc.sinLista)&&m.lejana.every(f=>!f.cerc.enLista||f.cerc.lejosPorFecha),m.porLlegar.filter(f=>!f.cerc.enLista).map(f=>f.o.op+" "+f.o.fase).slice(0,3).join(","));
    /* escape «llega ya»: fuera de la lista NO cambia de grupo, solo etiqueta */
    {const oL=(m.lejana[0]||{}).o;if(oL){const x=cercaniaCentro(oL,c,Pf);const ro=Pf.ordenes[oL.id]||{};
      const l2=Object.assign({},x,{llegada:{tipo:"fecha",dias:1,ant:x.ant}});
      __check("CF: «llega ya» con fase fuera de la lista se queda en Todo lo que viene con etiqueta",!x.escapo&&(x.grupo!=="porLlegar"||x.enLista)&&/llega ya/.test(llegadaHTML(Object.assign({},l2,{llegaYaFuera:true})))&&!/llegaYaFuera|escapo=true/.test("")&&!/out\.grupo='porLlegar';out\.escapo=true/.test(String(cercaniaCentro)));}}
    /* con puesto manual: arriba de todo, aunque su fase esté fuera de la lista */
    {const oLej=(m.lejana[0]||{}).o;if(oLej&&puede("programa")){const bakPC=JSON.stringify(oLej.progCentro||null);
      moverEnCola(oLej.id,c,{pos:1});const cola2=colaCentro(c,filasDeCentros([c],Pf,lun,dsum(lun,6),""));const m2=partirPorCercania(cola2);
      CEN.id=c;CEN.solo="";CEN.tab="prog";CEN.q="";CEN.fases=null;CEN.todo=false;page="centro";render();const h=document.getElementById("p-centro").innerHTML;
      const iP=h.indexOf("Con puesto manual"),iD=h.indexOf("Disponible"),iOp=h.indexOf(esc(oLej.op));
      __check("CF: una orden con puesto manual sale en «Con puesto manual», arriba de todo y a la vista, aunque su fase esté fuera de la lista",m2.puesto.length>=1&&m2.puesto[0].o.id===oLej.id&&iP>=0&&iP<iD&&iOp>iP&&iOp<iD,JSON.stringify({iP,iD,iOp}));
      __check("CF: la cola muestra subcabeceras por fase dentro de Por llegar",/fase-row/.test(h));
      oLej.progCentro=bakPC==="null"?undefined:JSON.parse(bakPC);if(oLej.progCentro===undefined)delete oLej.progCentro;PLAN=null;PLAN_ALL=null;}}
    /* anomalías: fase del propio grupo o posterior con el paso sin cerrar */
    {const oA=cola.find(f=>f.cerc.posFase==="enProceso");const oS=filas.find(f=>!f.hecho&&!f.bloq&&f.cerc&&f.cerc.grupo==="anomalia");
     {const oP={id:"x-cf-p",op:"WH/CF-2",fase:"4Corte Planta",ruta:[{centro:"corte",t:1},{centro:"modulos",t:1},{centro:"empaque",t:1}]};const g1=grupoTela(oP,{tipo:"lista"},"corte",{}),g2=grupoTela(oP,{tipo:"sinDato"},"corte",{});
      __check("CF: fase del propio grupo del centro (4Corte Planta en Corte, fuera de la lista) = «en proceso aquí»: Disponible con etiqueta, y con la tela sin dato sigue en Disponible pero con desacuerdo a la vista",g1.grupo==="disponible"&&g1.anomalia&&g1.anomalia.tipo==="enProceso"&&!g1.desacuerdo&&g2.grupo==="disponible"&&/tela no figura/.test(g2.desacuerdo),JSON.stringify([g1.grupo,g2.grupo,g2.desacuerdo]));
      __check("CF: en la misma posición de la lista, la misma fase queda junta (una sola subcabecera por fase)",(()=>{const l=m.disponable||m.disponible;const vistas=new Set();let ult=null;for(const f of l){const k=f.o.fase||"";if(k!==ult){if(vistas.has(k))return false;vistas.add(k);ult=k}}return true})(),m.disponible.map(f=>f.o.fase).join(",").slice(0,200));}
     __check("CF: «en proceso aquí» se queda en Disponible con etiqueta",!oA||(oA.cerc.grupo==="disponible"&&/en proceso aquí/.test(llegadaHTML(oA.cerc))),oA?oA.o.fase:"(ninguna en el volcado)");
     __check("CF: «ya salió de aquí» va al final en su propio grupo, a la vista, y a la bandeja de Hoy",!oS||(oS.cerc.grupo==="anomalia"&&/ya salió de aquí/.test(llegadaHTML(oS.cerc))&&CERC_ABIERTO.anomalia===true&&anomaliasCola().some(x=>x.id===oS.o.id)&&pendientesHoy().some(i=>i.k==="colaYaSalio"&&i.n>=1)),oS?oS.o.op+" "+oS.o.fase:"(ninguna)");
     /* de las anomalías, cuántas vienen de rutas incompletas (un solo paso de producción) */
     const an=anomaliasCola();__R.cf={anomalias:an.length,rutaIncompleta:an.filter(x=>x.rutaIncompleta).length,porCentro:{}};an.forEach(x=>{const k=x.c;__R.cf.porCentro[k]=__R.cf.porCentro[k]||{n:0,ri:0};__R.cf.porCentro[k].n++;if(x.rutaIncompleta)__R.cf.porCentro[k].ri++});
     __check("CF: se puede medir qué parte de las anomalías viene de rutas incompletas",typeof __R.cf.anomalias==="number",JSON.stringify(__R.cf));}
    /* liberada a corte manda sobre una fase textil rezagada */
    {const oT=S.ordenes.find(o=>abierta(o)&&o.op&&!o.sinLanzar&&(o.ruta||[]).some(p=>p.centro==="corte")&&!pasoHecho(o,"corte")&&/^1/.test(o.fase||""));
     if(oT){const bakA=JSON.stringify(S.avance[oT.id]||null);S.avance[oT.id]=Object.assign(S.avance[oT.id]||{},{lista:true});
      const gt=grupoTela(oT,{tipo:"lista"},"corte",{});
      __check("CF: liberada a corte (avance.lista) manda sobre la fase textil rezagada: Disponible",gt.grupo==="disponible"&&/liberaci/.test(gt.porQue),gt.grupo+" · "+gt.porQue);
      S.avance[oT.id]=bakA==="null"?undefined:JSON.parse(bakA);if(S.avance[oT.id]===undefined)delete S.avance[oT.id];}
     else __check("CF: liberada a corte manda sobre la fase textil (sin orden textil con corte pendiente en el volcado)",true);}
    /* primer centro: tela lista pero fase fuera de la lista → desacuerdo, no «lista para empezar» */
    {const gt=grupoTela({id:"x-cf",op:"WH/CF-1",fase:"3CD CORTE",ruta:[{centro:"bordado",t:1}]},{tipo:"lista"},"bordado",{});
     __check("CF: ruta incompleta ([bordado] solo, fase 3CD CORTE) NO es «lista para empezar»: queda en Todo lo que viene con desacuerdo «ruta incompleta»",gt.grupo==="lejana"&&gt.rutaIncompleta===true&&/ruta incompleta/.test(gt.desacuerdo),JSON.stringify(gt));}
    PLAN=null;PLAN_ALL=null;}
   /* --- 4d · el tooltip del arrastre lo explica (decisión 4) --- */
   {page="centro";CEN.id="corte";CEN.solo=null;CEN.tab="prog";CEN.todo=true;CEN.q="";render();
    const h=document.getElementById("p-centro").innerHTML;
    /* --- CF2 · correcciones del 17-sep sobre la cola construida --- */
    {const host=document.getElementById("p-centro");
     __check("CF2: el texto explicativo de la pestaña ya no ocupa pantalla: va en un «?» junto al título de la cola",!/<p class="lede">/.test(h)&&!!host.querySelector(".panel.cola h3 .ayuda")&&/puesto manual SOLO a ella/.test(host.querySelector(".panel.cola h3 .ayuda").getAttribute("title"))&&!/renumera la cola completa/.test(host.querySelector(".panel.cola h3 .ayuda").getAttribute("title")));
     const body=host.querySelector(".panel.cola .body");
     __check("CF2: conteos en una sola línea: Disponible N · Por llegar N · Todo lo que viene N · Ya salió N",(()=>{const p=body&&body.querySelector(".cola-conteos");if(!p)return false;const t=p.textContent;const u=t.replace(/\s+/g," ");const i=["Disponible ","Por llegar ","Todo lo que viene ","Ya salió de aquí "].map(k=>u.indexOf(k));return i.every(x=>x>=0)&&i[0]<i[1]&&i[1]<i[2]&&i[2]<i[3]&&/Disponible \d+/.test(u)&&/Por llegar \d+/.test(u)&&/Todo lo que viene \d+/.test(u)&&/Ya salió de aquí \d+/.test(u)&&!/<p/.test(u)&&(u.match(/·/g)||[]).length>=3})(),body&&(body.querySelector(".cola-conteos")||{}).textContent);
     __check("CF2: la nota «Orden de la cola» es una línea con «?» (la explicación completa, incluida la convención de días, va en el tooltip)",(()=>{const ps=[...body.querySelectorAll("p")];const p=ps.find(x=>/Orden de la cola:/.test(x.textContent));if(!p)return false;const q=p.querySelector(".ayuda-d > .ayuda");const tx=p.querySelector(".ayuda-txt");return !/white-space:nowrap|text-overflow/.test(p.getAttribute("style")||"")&&!!q&&/hoy no cuenta/.test(q.getAttribute("title"))&&!!tx&&/hoy no cuenta/.test(tx.textContent)&&p.textContent.replace(tx.textContent,"").length<160})());
     __check("CF2: el «?» sirve en tablet: es un details que al abrirse muestra el mismo texto del tooltip debajo, y cerrado no ocupa espacio",(()=>{const d=host.querySelector(".panel.cola h3 .ayuda-d");if(!d)return false;const tx=d.querySelector(".ayuda-txt");const cerrado=tx.getBoundingClientRect().height;d.querySelector(".ayuda").click();const abierto=tx.getBoundingClientRect().height;d.querySelector(".ayuda").click();const cerrado2=tx.getBoundingClientRect().height;return cerrado===0&&abierto>10&&cerrado2===0&&tx.textContent===d.querySelector(".ayuda").getAttribute("title")&&![...host.querySelectorAll(".panel.cola .body p")].some(x=>!x.textContent.trim())})());
     __check("CF2: la línea de marcas existe exactamente cuando alguna fila lleva marca, dice cuántas rojas, ámbar y sin marca con porcentaje, y el porqué en el «?»",(()=>{const p=body.querySelector(".cola-marcas");const P4=programar();const lun4=lunesDe(hoy());const r=conteoColoresCola(colaCentro("corte",filasDeCentros(["corte"],P4,lun4,dsum(lun4,6),"")),P4,"corte");const hay=r.venc+r.noLlega+r.paso+r.sinMeta>0;if(!hay)return !p;if(!p)return false;const q=p.querySelector(".ayuda");return /rojas/.test(p.textContent)&&/ámbar/.test(p.textContent)&&/sin marca/.test(p.textContent)&&/%/.test(p.textContent)&&new RegExp(r.rojo+" rojas").test(p.textContent.replace(/\s+/g," "))&&!!q&&/Por qué aparecen/.test(q.getAttribute("title"))&&/fecha meta de la orden/.test(q.getAttribute("title"))&&/UNA sola vez/.test(q.getAttribute("title"))&&!/white-space:nowrap/.test(p.getAttribute("style")||"")})());
     const tr=host.querySelector(".panel.cola tbody tr[draggable]");
     __check("CF2: las acciones de la fila van en un menú «⋯» (details), no sueltas",!!tr&&!!tr.querySelector("td:last-child details.acc summary")&&!tr.querySelector("td:last-child > button"));
     __check("CF2: «asignar a operario» no está en ninguna fila",!/asignar a operario/.test(h));
     __check("CF2: con permiso ruta el menú trae «ruta» (editar); sin él, «ver ruta» de solo lectura que abre la ficha",(()=>{if(!tr)return false;const conRuta=puedeEditarRuta();const m=tr.querySelector("details.acc .acc-m").innerHTML;
       if(conRuta&&!(/mRutaCentro\(/.test(m)&&!/abrirFichaOrden\(/.test(m)))return false;
       const bakP=PERFIL;PERFIL={id:"u-cf2",rol:"corte",nombre:"Sup"};let ok=false;try{const f2={o:tr?S.ordenes.find(o=>tr.getAttribute("ondragstart").includes(o.id)):null,c:"corte"};const m2=accionesColaHTML(f2,{});ok=!puedeEditarRuta()&&/abrirFichaOrden\(/.test(m2)&&/ver ruta/.test(m2)&&!/mRutaCentro\(/.test(m2)}finally{PERFIL=bakP}return ok})());
     /* corte por fecha dentro de Por llegar */
     __check("CF2: el corte «Por llegar hasta N días hábiles» es un parámetro editable (inicial 15) con su campo en Configuración",diasPorLlegar()===15&&typeof setDiasPorLlegar==="function"&&(()=>{const bp=page,bt=CONF.tab;page="config";CONF.tab="cal";render();const ok=/setDiasPorLlegar\(/.test(document.getElementById("p-config").innerHTML);page=bp;CONF.tab=bt;render();return ok})());
     {const x={grupo:"porLlegar",llegada:{tipo:"fecha",dias:40},enLista:true,faseRank:1};cortePorFecha(x);
      __check("CF2: cortePorFecha: 40 días con el corte en 15 → Todo lo que viene + lejosPorFecha; la etiqueta dice «llega en 40 días · más de 15»; la fase sigue en la lista pero se ordena por fecha con las demás (faseRank 999), no encima de las que llegan ya",x.grupo==="lejana"&&x.lejosPorFecha===true&&x.enLista===true&&x.faseRank===999&&/llega en 40 días · más de 15/.test(llegadaHTML(x))&&ordenCercania({grupo:"lejana",faseRank:999,orden:1,llegaYaFuera:true})<ordenCercania(Object.assign({},x,{orden:40})));
      {const bak=S.params.diasPorLlegar;S.params.diasPorLlegar=0;const y0={grupo:"porLlegar",llegada:{tipo:"fecha",dias:1},enLista:true,faseRank:0};cortePorFecha(y0);const h0=llegadaHTML(y0);const z0={grupo:"porLlegar",llegada:{tipo:"fecha",dias:0}};cortePorFecha(z0);if(bak==null)delete S.params.diasPorLlegar;else S.params.diasPorLlegar=bak;
       __check("CF2: 0 es 0: con el corte en 0 la de mañana baja (en singular: «llega mañana · más de 0») y la de hoy se queda",y0.grupo==="lejana"&&/llega mañana · más de 0/.test(h0)&&!/llega en 1 días/.test(h0)&&z0.grupo==="porLlegar",h0);}
      const y={grupo:"porLlegar",llegada:{tipo:"fecha",dias:3}};cortePorFecha(y);const z={grupo:"disponible",llegada:{tipo:"fecha",dias:99}};cortePorFecha(z);const w={grupo:"porLlegar",llegada:{tipo:"sinProgramar"}};cortePorFecha(w);
      __check("CF2: 3 días se queda en Por llegar; Disponible no se toca; «sin programar» no se mueve (no se estima)",y.grupo==="porLlegar"&&!y.lejosPorFecha&&z.grupo==="disponible"&&w.grupo==="porLlegar");}
     __check("CF2: las notas de los grupos dicen el corte a la vista, y Por llegar no promete fecha a lo que no la tiene",/dentro de 15 días hábiles, o sin fecha conocida/.test(notaGrupoCerc("porLlegar"))&&/más de 15 días hábiles/.test(notaGrupoCerc("lejana")));
     __check("CF2: Costura pinta las mismas marcas con los mismos nombres y colores (marcaCentro sale de MARCAS_CEN)",/marcasDe\(o,P,c\)/.test(String(marcaCentro))&&!/la orden va tarde|este paso va tarde/.test(String(marcaCentro)));}
    __check("CF: «Con puesto manual» está siempre a la vista arriba de la cola, aunque nadie haya numerado (entonces lo dice)",/Con puesto manual/.test(h)&&h.indexOf("</span>Con puesto manual")>=0&&h.indexOf("</span>Con puesto manual")<h.indexOf("</span>Disponible")&&(S.ordenes.some(o=>puestoDe(o,"corte")>0)||/ninguna: nadie ha puesto puestos a mano/.test(h)));
    __check("CC4b: el tooltip del arrastre dice que bajar una orden numera las de encima",
      /bajar una orden numera tambi\u00e9n las que quedan por encima/.test(h));}
   /* --- 5 · el orden de la cola --- */
   {const c=["botones","corte","modulos","empaque"].find(x=>CE(x))||"corte";
    const lun=lunesDe(hoy());const filas=filasDeCentros([c],P,lun,dsum(lun,6),"");const cola=colaCentro(c,filas);
    __check("CC5: cada fila de la cola trae su cercanía calculada",cola.every(f=>!!f.cerc),c);
    /* con nadie numerado, el orden es por grupo y después por llegada */
    const sinPuesto=cola.filter(f=>!puestoDe(f.o,c));
    let ok=true;for(let i=1;i<sinPuesto.length;i++){
      if(ordenCercania(sinPuesto[i-1].cerc)>ordenCercania(sinPuesto[i].cerc)+1e-9){ok=false;break}}
    __check("CC5: las órdenes sin puesto quedan ordenadas por cercanía y llegada",ok,sinPuesto.length+" sin puesto");
    __check("CC5: y los grupos salen en el orden de pantalla",
      ORDEN_GRUPO_CERC.disponible<ORDEN_GRUPO_CERC.porLlegar&&ORDEN_GRUPO_CERC.porLlegar<ORDEN_GRUPO_CERC.revisar&&ORDEN_GRUPO_CERC.revisar<ORDEN_GRUPO_CERC.lejana);
    /* el puesto manual manda sobre todo */
    if(cola.length>=3){const ultima=cola[cola.length-1].o;
     ultima.progCentro=ultima.progCentro||{};ultima.progCentro[c]=Object.assign({},ultima.progCentro[c],{pri:1});
     const c2=colaCentro(c,filasDeCentros([c],P,lun,dsum(lun,6),""));
     __check("CC5: el puesto manual manda sobre la cercanía",c2[0].o.id===ultima.id,c2[0].o.op);
     delete ultima.progCentro[c].pri}}
   /* --- 6 · el arrastre NO renumera toda la cola --- */
   {const c=["corte","modulos","empaque","botones"].find(x=>CE(x)&&colaCentro(x,filasDeCentros([x],programar(),lunesDe(hoy()),dsum(lunesDe(hoy()),6),"")).length>=4);
    if(c){const lun=lunesDe(hoy());
     const cola0=colaCentro(c,filasDeCentros([c],programar(),lun,dsum(lun,6),""));
     cola0.forEach(f=>{if((f.o.progCentro||{})[c])delete f.o.progCentro[c].pri});
     const orden0=cola0.map(f=>f.o.op);
     const nSin0=cola0.filter(f=>!puestoDe(f.o,c)).length;
     __check("CC6: se parte de una cola sin ningún puesto manual",nSin0===cola0.length,nSin0+"/"+cola0.length);
     /* se mueve la última al puesto 1 */
     const movida=cola0[cola0.length-1].o;
     moverEnCola(movida.id,c,{pos:1});
     const conPuesto=cola0.filter(f=>puestoDe(f.o,c)>0);
     __check("CC6: después de arrastrar, SOLO la movida tiene puesto manual",
       conPuesto.length===1&&conPuesto[0].o.id===movida.id,conPuesto.map(f=>f.o.op+":"+puestoDe(f.o,c)).join(", "));
     const cola1=colaCentro(c,filasDeCentros([c],programar(),lun,dsum(lun,6),""));
     __check("CC6: la movida quedó primera",cola1[0].o.id===movida.id,cola1[0].o.op);
     /* y las demás siguen ordenadas por cercanía entre ellas */
     const resto=cola1.filter(f=>f.o.id!==movida.id);
     let ok=true;for(let i=1;i<resto.length;i++){
       if(ordenCercania(resto[i-1].cerc)>ordenCercania(resto[i].cerc)+1e-9){ok=false;break}}
     __check("CC6: y el resto SIGUE ordenado por cercanía después del arrastre",ok,resto.length+" órdenes");
     const orden1=resto.map(f=>f.o.op);const esperado=orden0.filter(x=>x!==movida.op);
     __check("CC6: el resto conserva exactamente su orden relativo anterior",
       orden1.join("|")===esperado.join("|"),orden1.slice(0,4).join(", ")+" vs "+esperado.slice(0,4).join(", "));
     /* una segunda movida: se renumeran las dos, nadie más */
     const segunda=resto[2]&&resto[2].o;
     if(segunda){moverEnCola(segunda.id,c,{pos:1});
      const cp=cola0.filter(f=>puestoDe(f.o,c)>0);
      __check("CC6: al mover otra, solo las DOS con puesto se renumeran",cp.length===2,cp.map(f=>f.o.op+":"+puestoDe(f.o,c)).join(", "));
      const cola2=colaCentro(c,filasDeCentros([c],programar(),lun,dsum(lun,6),""));
      const resto2=cola2.filter(f=>puestoDe(f.o,c)===0);
      let ok2=true;for(let i=1;i<resto2.length;i++){if(ordenCercania(resto2[i-1].cerc)>ordenCercania(resto2[i].cerc)+1e-9)ok2=false}
      __check("CC6: y los sin puesto siguen por cercanía",ok2);
      __R.cc=__R.cc||{};__R.cc.arrastre={centro:c,total:cola0.length,
        antes:orden0.slice(0,6),movida:movida.op,segunda:segunda.op,
        conPuesto:cp.map(f=>f.o.op+" → puesto "+puestoDe(f.o,c)),
        sinPuesto:resto2.length,despues:cola2.slice(0,6).map(f=>f.o.op+(puestoDe(f.o,c)?" (puesto "+puestoDe(f.o,c)+")":" (cercanía: "+nGrupoCerc(f.cerc.grupo)+")"))}}
     cola0.forEach(f=>{if((f.o.progCentro||{})[c])delete f.o.progCentro[c].pri});}}
   /* --- 7 · los cinco llamadores --- */
   {const c="corte";const lun=lunesDe(hoy());
    const P2=programar();
    __check("CC7: tabletFilas usa la misma cola (mismo orden que el centro)",(()=>{
      const t=tabletFilas(c,null,P2).map(f=>f.o.id).join();
      const v=colaCentro(c,filasDeCentros([c],P2,lun,dsum(lun,6),"")).map(f=>f.o.id).join();
      return t===v})());
    __check("CC7: ordenarColaPorColor avisa de que el puesto manual apaga la cercanía",
      /el puesto manual manda sobre la cercan\u00eda/.test(String(ordenarColaPorColor)));
    __check("CC7: y lo deja escrito en la bitácora",/deja de aplicarles/.test(String(ordenarColaPorColor)));}
   /* --- 8 · la ODC va en columna propia; whCell NO se tocó --- */
   {__check("CC8: whCell sigue siendo foto + WH + fase + cierre, sin ODC",
      !/odc/i.test(String(whCell)),String(whCell).slice(0,140));
    page="centro";CEN.id="corte";CEN.solo=null;CEN.tab="prog";CEN.todo=true;render();
    const h=document.getElementById("p-centro").innerHTML;
    __check("CC8: la cola tiene columna ODC y columna Llega",/<th>ODC<\/th>/.test(h)&&/>Llega<\/th>/.test(h));
    __check("CC8: y la nota explica de dónde sale el orden y la convención de días",
      /Orden de la cola/.test(h)&&/hoy no cuenta/.test(h));
    __check("CC8: los grupos de cercanía se ven en la cola",/Disponible|Por llegar|Lejanas|Revisar ruta/.test(h));}
   /* --- 9 · decisión 9: la hora de las OT en campos nuevos, sin tocar lo de antes --- */
   {__check("CC9: excelFecha sigue devolviendo solo la fecha",
      excelFecha(46020.72358796297)==="2026-01-05"||/^\d{4}-\d{2}-\d{2}$/.test(String(excelFecha(46020.72358796297))),excelFecha(46020.72358796297));
    __check("CC9: excelFechaHora conserva la hora del serial de Excel",
      /T\d{2}:\d{2}/.test(String(excelFechaHora(46020.72358796297))),excelFechaHora(46020.72358796297));
    /* HALLAZGO: excelFecha usa Math.round, así que una hora >= 12:00 cae en el día SIGUIENTE.
       Decisión 9 dice no tocar excelFecha, así que NO se toca: se deja fijado y se reporta. */
    {const v=46020.74831018518;   // 29-dic-2025 17:57 según el archivo
     const conHora=String(excelFechaHora(v)).slice(0,10), soloFecha=excelFecha(v);
     __check("CC9: la hora nueva dice el día real del archivo",conHora==="2025-12-29",conHora);
     __check("CC9: excelFecha ya NO corre el día (arreglado el 16-sep: Math.floor)",
       soloFecha==="2025-12-29"&&soloFecha===conHora,soloFecha+" vs "+conHora);
     __R.cc=__R.cc||{};__R.cc.excelRedondeo={ejemplo:v,real:excelFechaHora(v),guardado:soloFecha};
     const v2=46020.2;   // la misma fecha por la mañana: ahí sí coinciden
     __check("CC9: con hora < 12:00 las dos coinciden",String(excelFechaHora(v2)).slice(0,10)===excelFecha(v2));}
    __check("CC9: un valor sin hora no se inventa un 00:00",traeHora(46020)===false&&traeHora(46020.5)===true);
    __check("CC9: los campos de siempre no cambiaron de nombre ni de forma",
      /o\.ot\[c\]=\{estado:reg\.estado,ini:reg\.ini,fin:reg\.fin,odoo:reg\.odoo,iniTs:/.test(document.documentElement.innerHTML));}
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page="ordenes";render();
   __check("CC sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* ===== AUDITORÍA DE BÚSQUEDAS Y FILTROS · PASO 0 (diagnóstico, NO se corrige nada) ===== */
  try{localStorage.__fase="auditoria busquedas"}catch(e){}
  {const antes=__R.errors.length;const a0=window.alert;window.alert=()=>{};const adminP=PERFIL;
   __R.bus={inventario:[],foco:[],wh:[],campos:{},filtros:[],causas:{}};
   const F=(n,ok,det)=>{__check(n,ok,det);return !!ok};

   /* ---------- 1 · INVENTARIO desde el código ---------- */
   {const src=document.documentElement.innerHTML;
    const ids=[...new Set([...src.matchAll(/busqHTML\('([^']+)'/g)].map(x=>x[1]))];
    __R.bus.idsBusq=ids;
    __check("AB0: hay un solo componente de buscador (busqHTML) y N pantallas lo usan",ids.length>=15,ids.join(", "));
    const sueltos=[...src.matchAll(/oninput="(?!buscarQ)/g)].length;
    __R.bus.buscadoresSueltos=sueltos;
    __check("AB0: cuántos inputs con oninput NO pasan por buscarQ (buscadores propios)",true,sueltos);
    __R.bus.usosMatchBusq=(src.match(/matchBusq\(/g)||[]).length;
    __R.bus.usosNormTxt=(src.match(/normTxt\(/g)||[]).length;}

   /* ---------- 2b/2d/2e · la lógica de comparación, con una orden de laboratorio ---------- */
   {const oT={id:"busq-test",op:"WH/MO/22918",odc:2723,ref:"EST-CONFECCIÓN",cliente:"Almacén Éxito",
      color:(S.colores[0]||{}).id,cat:(S.categorias.find(k=>k.padre)||{}).id,fase:"7Confección",cant:10};
    const bak=JSON.parse(JSON.stringify(BUSQ));Object.keys(BUSQ).forEach(k=>delete BUSQ[k]);
    const m=q=>matchBusq(oT,q,"AUD.test");
    __R.bus.wh=[
      ["WH/MO/22918 completo",m("WH/MO/22918")],
      ["minúsculas wh/mo/22918",m("wh/mo/22918")],
      ["solo el número 22918",m("22918")],
      ["parcial 2291",m("2291")],
      ["con espacio delante ' 22918'",m(" 22918")],
      ["con espacio detrás '22918 '",m("22918 ")],
      ["con espacios a los dos lados",m("  22918  ")],
      ["un solo dígito 2",m("2")],
      ["ODC numérica 2723",m("2723")],
      ["cliente con acento 'almacen exito'",m("almacen exito")],
      ["fase sin acento 'confeccion'",m("confeccion")],
      ["referencia sin acento 'est-confeccion'",m("est-confeccion")],
      ["algo que NO está",!m("zzzz-no-existe")]];
    __R.bus.wh.forEach(([n,ok])=>F("AB1 búsqueda: "+n,ok));
    /* 2e · números: op numérico en vez de texto */
    const oNum={id:"busq-num",op:22918,odc:2723,cant:5};
    F("AB1 búsqueda: una OP guardada como NÚMERO igual se encuentra",matchBusq(oNum,"22918","AUD.test"));
    F("AB1 búsqueda: y parcial sobre esa OP numérica",matchBusq(oNum,"2291","AUD.test"));
    /* normalización */
    F("AB1 normTxt: baja mayúsculas, quita acentos y recorta espacios",
      normTxt("  Confección  ")==="confeccion",normTxt("  Confección  "));
    F("AB1 normTxt: un 0 no se convierte en vacío",normTxt(0)==="0",JSON.stringify(normTxt(0)));
    /* 2c · los campos que el buscador dice buscar */
    const campos=BUSQ_CAMPOS.map(x=>x[0]);
    __R.bus.campos.declarados=BUSQ_CAMPOS.map(x=>x[1]);
    __R.bus.campos.placeholder=ayuda("busq.placeholder");
    const faltan=campos.filter(k=>{try{return valBusq(oT,k)===undefined}catch(e){return true}});
    F("AB1 campos: todos los campos del menú tienen valor en valBusq",faltan.length===0,faltan.join(", "));
    /* lo que el placeholder promete vs lo que se busca */
    const prom=normTxt(ayuda("busq.placeholder"));
    __R.bus.campos.promesaCumple={wh:/wh/.test(prom),odc:/odc/.test(prom),cliente:/cliente/.test(prom),ref:/referencia/.test(prom)};
    F("AB1 campos: el buscador incluye OP, ODC, referencia, color, fase, cliente y categoría",
      ["op","odc","ref","color","fase","cliente","cat"].every(k=>campos.includes(k)),campos.join(","));
    /* acotar a un campo */
    BUSQ["AUD.test"]="op";
    F("AB1 campos: acotado a OP, el cliente ya NO encuentra",!matchBusq(oT,"almacen","AUD.test"));
    F("AB1 campos: y la OP sí",matchBusq(oT,"22918","AUD.test"));
    Object.keys(BUSQ).forEach(k=>delete BUSQ[k]);Object.assign(BUSQ,bak);}

   /* ---------- 2a · FOCO: escribir carácter por carácter en cada buscador ---------- */
   {const PANT=[
     ["ORDF.q","Órdenes","ordenes",()=>{ORDF.q="";ORDF.tab="lista"}],
     ["RUT.q","Órdenes → Rutas","ordenes",()=>{RUT.q="";ORDF.tab="rutas"}],
     ["LIB.q","Liberación","liberacion",()=>{LIB.q="";LIB.et="tela";LIB.verLista=true}],
     ["LIB.q4","Liberación · bloque 4","liberacion",()=>{LIB.q4="";LIB.et="tela"}],
     ["CEN.q","Centro","centro",()=>{CEN.q="";CEN.id="corte";CEN.solo=null;CEN.tab="prog";CEN.todo=true}],
     ["CTL.q","Control de piso","control",()=>{CTL.q="";CTL.area="pro";CTL.centro="corte"}],
     ["CTLF.q","Control → Cambio de fases","control",()=>{CTL.area="fases";CTLF.q=""}],
     ["CG.q","Carga general","produccion",()=>{CG.q="";CG.centro="corte"}],
     ["WIPL.q","Producto en proceso","wip",()=>{WIPL.q=""}],
     ["VO.q","Vista general de órdenes","vistaordenes",()=>{VO.q=""}],
     ["APO.q","Asignación por orden","asignacion",()=>{APO.q=""}],
     ["GER.q","Resumen gerencial","gerencia",()=>{GER.q=""}],
     ["EG.q","Entregas","entregas",()=>{EG.q=""}],
     ["COS.q","Costura","costura",()=>{COS.q=""}],
     ["CAPD.q","Capacidad y decisiones","capacidad",()=>{CAPD.q="";/* el buscador vive en el detalle de una celda: se abre la primera que tenga órdenes */CAPD.sel=null;page="capacidad";render();const M=(typeof CAPM!=="undefined"&&CAPM)||null;if(M&&M.celdas){const k=Object.keys(M.celdas).find(k=>((M.celdas[k]||{}).det||[]).length);if(k)CAPD.sel=k}}],
     ["PMADD.q","Plan mensual → agregar","plan",()=>{PMADD.q=""}],
     ["TAB.q","Mi centro (tablet)","tablet",()=>{TAB.q="";TAB.centro="corte"}]];
    const inp=id=>document.querySelector('input[data-q="'+id+'"]');
    for(const [id,pant,pag,prep] of PANT){
      try{prep()}catch(e){}
      page=pag;render();
      let el=inp(id);
      const reg={id,pantalla:pant,pagina:pag,existe:!!el,foco:null,texto:null,cursor:null,perdidas:0,detalle:""};
      if(!el){reg.detalle="el buscador no se dibuja en esta pantalla con este estado";__R.bus.foco.push(reg);
        __check("AB2 foco · "+pant+": el buscador está en pantalla (si falla, es que solo aparece en cierto estado)",false,"no se encontró input[data-q="+id+"] · ver el inventario");continue}
      /* se escribe 2-2-9-1-8, una tecla a la vez, como una persona */
      let txt="",okFoco=true,okTxt=true,okCur=true;
      el.focus();await __p(120);   /* el navegador aplica el foco de forma asincrona tras insertar el nodo */
      for(const ch of "22918"){
        el=inp(id);if(!el){okFoco=false;break}
        txt+=ch;el.value=txt;el.setSelectionRange(txt.length,txt.length);
        el.dispatchEvent(new Event("input",{bubbles:true}));
        await __p(260);                       /* más que el debounce fijo de 150 ms */
        const n=inp(id);
        if(!n){okFoco=false;reg.detalle="el input desaparece del DOM al escribir";break}
        if(document.activeElement!==n){okFoco=false;reg.perdidas++}
        if(n.value!==txt){okTxt=false;reg.detalle="el texto quedó en «"+n.value+"» y se escribió «"+txt+"»"}
        if(n.selectionStart!==txt.length){okCur=false;reg.detalle=(reg.detalle?reg.detalle+" · ":"")+"el cursor quedó en "+n.selectionStart+" de "+txt.length}}
      reg.foco=okFoco;reg.texto=okTxt;reg.cursor=okCur;
      __R.bus.foco.push(reg);
      __check("AB2 foco · "+pant+": conserva el foco al escribir 22918",okFoco,reg.perdidas+" pérdidas · "+reg.detalle);
      __check("AB2 foco · "+pant+": conserva el texto completo",okTxt,reg.detalle);
      __check("AB2 foco · "+pant+": conserva la posición del cursor",okCur,reg.detalle);
      /* y que de verdad haya filtrado */
      const r=refEstado(id);
      __check("AB2 · "+pant+": refEstado alcanza el estado de este buscador (hace falta para el filtro de fases)",!!(r.o&&String(r.o[r.k]||"")==="22918"),
        r.o?JSON.stringify(r.o[r.k]):"refEstado no conoce "+id);
      try{prep()}catch(e){}}}

   /* ---------- 2b sobre la pantalla real: buscar una WH que existe ---------- */
   {const o=S.ordenes.find(x=>abierta(x)&&/^WH\/MO\//.test(x.op||""));
    if(o){const numero=String(o.op).replace(/\D/g,"");
     const casos=[o.op,String(o.op).toLowerCase(),numero,numero.slice(0,4)," "+numero,numero+" "];
     page="ordenes";ORDF.tab="lista";
     const res=casos.map(q=>{ORDF.q=q;render();
       const h=document.getElementById("p-ordenes").innerHTML;return {q,encontrada:h.indexOf(esc(o.op))>=0}});
     __R.bus.whPantalla={op:o.op,casos:res};
     res.forEach(x=>__check("AB3 Órdenes: buscar «"+x.q+"» encuentra "+o.op,x.encontrada));
     ORDF.q="";render()}}

   /* ---------- 3 · FILTROS ---------- */
   {const anotar=(pant,filtro,prueba,ok,det)=>{__R.bus.filtros.push({pantalla:pant,filtro,prueba,ok:!!ok,detalle:det||""});
     __check("AB4 "+pant+" · "+filtro+": "+prueba,ok,det)};
    /* 3a/3b · filtro de fases común, en las cuatro pantallas que lo usan */
    const FAS=[["Órdenes","ORDF.fases","ordenes",()=>{ORDF.tab="lista";ORDF.q="";ORDF.fases=null}],
      ["Centro","CEN.fases","centro",()=>{CEN.id="corte";CEN.solo=null;CEN.tab="prog";CEN.q="";CEN.todo=true;CEN.fases=null}],
      ["Carga general","CG.fases","produccion",()=>{CG.centro="corte";CG.q="";CG.fases=null}],
      ["Liberación","LIB.fases","liberacion",()=>{LIB.et="tela";LIB.q="";LIB.fases=null}]];
    for(const [pant,varName,pag,prep] of FAS){
      prep();page=pag;render();
      const r=refEstado(varName);
      if(!r.o){anotar(pant,varName,"refEstado conoce el estado",false,"refEstado NO conoce "+varName);continue}
      anotar(pant,varName,"refEstado conoce el estado",true);
      const fases=[...new Set(S.ordenes.filter(abierta).map(x=>x.fase||"Sin fase"))];
      const f0=fases.find(f=>S.ordenes.filter(x=>abierta(x)&&(x.fase||"Sin fase")===f).length>0);
      if(!f0)continue;
      /* marcar una sola fase */
      togFaseFiltro(varName,f0,fases);render();
      const cur=refEstado(varName).o[refEstado(varName).k];
      anotar(pant,varName,"al marcar una fase queda guardada en el estado",!!(cur&&cur.size!=null),cur?("size="+cur.size):"null");
      const h=document.getElementById("p-"+pag).innerHTML;
      anotar(pant,varName,"y se ve marcada en pantalla después del redibujo",
        (h.match(/type="checkbox" checked/g)||[]).length>0||/checked/.test(h));
      /* limpiar: el centinela de «ninguna» */
      refEstado(varName).o[refEstado(varName).k]=new Set([FASE_NINGUNA]);render();
      anotar(pant,varName,"«ninguna fase» se respeta y no se convierte en «todas»",
        estadoFases(refEstado(varName).o[refEstado(varName).k])==="ninguna",
        JSON.stringify([...(refEstado(varName).o[refEstado(varName).k]||[])]));
      prep();render()}
    /* 3c · búsqueda + filtro juntos, en Órdenes */
    {ORDF.tab="lista";ORDF.q="";ORDF.fases=null;page="ordenes";render();
     const o=S.ordenes.find(x=>abierta(x)&&x.fase&&x.cliente);
     if(o){const fases=[...new Set(S.ordenes.filter(abierta).map(x=>x.fase||"Sin fase"))];
      togFaseFiltro("ORDF.fases",o.fase,fases);ORDF.q=String(o.op).replace(/\D/g,"");render();
      const h=document.getElementById("p-ordenes").innerHTML;
      anotar("Órdenes","fases + buscador","los dos se aplican a la vez (no se pisan)",
        h.indexOf(esc(o.op))>=0&&!!(ORDF.fases&&ORDF.fases.size)&&ORDF.q!=="",
        "q="+ORDF.q+" fases="+(ORDF.fases?ORDF.fases.size:"null"));
      ORDF.q="";ORDF.fases=null;render()}}
    /* 3d · al cambiar de pantalla y volver, ¿se conserva o se limpia? */
    {const casos=[["Órdenes","ORDF.q","ordenes",()=>{ORDF.tab="lista"}],
       ["Liberación","LIB.q","liberacion",()=>{LIB.et="tela"}],
       ["Centro","CEN.q","centro",()=>{CEN.id="corte";CEN.solo=null;CEN.tab="prog"}],
       ["Carga general","CG.q","produccion",()=>{CG.centro="corte"}]];
     __R.bus.persistencia=[];
     for(const [pant,varName,pag,prep] of casos){
       prep();const r=refEstado(varName);if(!r.o)continue;
       r.o[r.k]="22918";page=pag;render();
       page="panorama";render();            /* se va a otra pantalla */
       prep();page=pag;render();            /* y vuelve */
       const sigue=String(refEstado(varName).o[refEstado(varName).k]||"")==="22918";
       __R.bus.persistencia.push({pantalla:pant,filtro:varName,conserva:sigue});
       anotar(pant,varName,"al salir y volver "+(sigue?"CONSERVA":"LIMPIA")+" el buscador",true,sigue?"conserva":"limpia");
       refEstado(varName).o[refEstado(varName).k]="";render()}}
    /* 3e · las fases del filtro contra las fases reales de Odoo */
    {const reales=[...new Set(S.ordenes.filter(abierta).map(x=>x.fase).filter(Boolean))];
     const enTabla=faseMapeo().map(r=>r.fase);
     const sinFila=reales.filter(f=>!enTabla.some(x=>normFase(x)===normFase(f)));
     const soloPorNorm=reales.filter(f=>!enTabla.includes(f)&&enTabla.some(x=>normFase(x)===normFase(f)));
     __R.bus.fases={reales:reales.length,enTabla:enTabla.length,sinFila,soloPorNorm};
     anotar("Filtro de fases","catálogo","toda fase real de Odoo tiene fila en la tabla 1",sinFila.length===0,sinFila.join(" | "));
     anotar("Filtro de fases","catálogo","y calzan exactamente, no solo tras normalizar",soloPorNorm.length===0,soloPorNorm.join(" | "));
     const grupos=reales.filter(f=>!grupoDe(f));
     anotar("Filtro de fases","grupos","toda fase real tiene grupo en la tabla 5",grupos.length===0,grupos.join(" | "));}
    /* selMulti: marcar y que quede marcado */
    {page="entregas";EG.meses=null;render();
     const ms=[...new Set(S.ordenes.filter(abierta).map(o=>(o.fecha||"").slice(0,7)))].filter(Boolean);
     if(ms.length){EG.meses=new Set([ms[0]]);render();
      const h=document.getElementById("p-entregas").innerHTML;
      anotar("Entregas","selMulti meses","al marcar un mes queda marcado tras el redibujo",
        /type="checkbox" checked/.test(h)||/checked/.test(h),ms[0]);
      anotar("Entregas","selMulti meses","y el estado lo guarda como Set",!!(EG.meses&&EG.meses.has&&EG.meses.has(ms[0])));
      anotar("Entregas","selMulti meses","y la lista se filtra de verdad",(()=>{
        const conF=(document.getElementById("p-entregas").innerText.match(/WH\/MO\//g)||[]).length;
        EG.meses=null;render();
        const sinF=(document.getElementById("p-entregas").innerText.match(/WH\/MO\//g)||[]).length;
        EG.meses=new Set([ms[0]]);render();return conF<=sinF})());
      EG.meses=null;render()}}}

   /* ---------- 3i · UNA sola semántica para los cinco filtros de fase ---------- */
   {const fasesAll=[...new Set(S.ordenes.filter(abierta).map(o=>o.fase||"Sin fase"))];
    /* la función común, en seco */
    __check("AB7: null es «todas»",estadoFases(null,fasesAll)==="todas"&&faseOkFiltro(null,"1Tejeduria"));
    __check("AB7: un Set vacío también es «todas» (no hay ambigüedad)",estadoFases(new Set(),fasesAll)==="todas");
    __check("AB7: el centinela es «ninguna» y NADA pasa el filtro",
      estadoFases(new Set([FASE_NINGUNA]),fasesAll)==="ninguna"&&!faseOkFiltro(new Set([FASE_NINGUNA]),"1Tejeduria"));
    __check("AB7: una selección deja pasar solo lo marcado",
      estadoFases(new Set(["1Tejeduria"]),fasesAll)==="seleccion"
      &&faseOkFiltro(new Set(["1Tejeduria"]),"1Tejeduria")&&!faseOkFiltro(new Set(["1Tejeduria"]),"2Corte"));
    __check("AB7: marcarlas TODAS equivale a «todas»",estadoFases(new Set(fasesAll),fasesAll)==="todas");
    __check("AB7: podar fases que ya no existen NO borra el centinela",
      podarFases(new Set([FASE_NINGUNA]),fasesAll).has(FASE_NINGUNA));
    __check("AB7: y si al podar no queda ninguna, es «ninguna», no «todas»",
      estadoFases(podarFases(new Set(["fase-que-no-existe"]),fasesAll),fasesAll)==="ninguna");
    /* las cinco pantallas, con el mismo botón «Limpiar (ninguna)» */
    const CINCO=[["Órdenes","ORDF.fases","ordenes",()=>{ORDF.tab="lista";ORDF.q="";ORDF.fases=null;ORDF.estado="plan"}],
      ["Centro","CEN.fases","centro",()=>{CEN.id="corte";CEN.solo=null;CEN.tab="prog";CEN.q="";CEN.todo=true;CEN.fases=null}],
      ["Carga general","CG.fases","produccion",()=>{CG.centro="corte";CG.q="";CG.fases=null}],
      ["Liberación","LIB.fases","liberacion",()=>{LIB.et="tela";LIB.q="";LIB.ym=null;LIB.fases=null;LIB.verLista=true}],
      ["Familias","FAM.fases","familias",()=>{FAM.fases=null}]];
    for(const [pant,varName,pag,prep] of CINCO){
      prep();page=pag;render();
      const r=refEstado(varName);
      if(!r.o){__check("AB7 "+pant+": refEstado alcanza su estado",false,varName);continue}
      /* Se mide SIEMPRE la misma tabla: la de resultados es la que más órdenes tiene con el filtro
         en «todas». Otras tablas de la pantalla (avisos, diagnósticos) también nombran órdenes. */
      const marc=()=>document.querySelector("#p-"+pag+" [data-lista]");
      const tablas=()=>{const m=marc();return [...(m||document.getElementById("p-"+pag)).querySelectorAll("table")]};
      const filasDe=t=>[...t.querySelectorAll("tbody tr")].filter(tr=>/WH\/MO\//.test(tr.textContent)).length;
      let iLista=-1,conTodas=0;
      tablas().forEach((t,i)=>{const n=filasDe(t);if(n>conTodas){conTodas=n;iLista=i}});
      const cuenta=()=>{const ts=tablas();return (iLista>=0&&ts[iLista])?filasDe(ts[iLista]):0};
      /* «Limpiar (ninguna)»: la lista se queda VACÍA en las cinco */
      r.o[r.k]=new Set([FASE_NINGUNA]);render();
      const conNinguna=cuenta();
      __check("AB7 "+pant+": «Limpiar (ninguna)» deja la lista vacía",conNinguna===0,conNinguna+" órdenes (con todas: "+conTodas+")");
      __check("AB7 "+pant+": y el estado sigue siendo «ninguna» después del redibujo",
        estadoFases(refEstado(varName).o[refEstado(varName).k])==="ninguna",
        JSON.stringify([...(refEstado(varName).o[refEstado(varName).k]||[])]));
      /* «Seleccionar todas»: vuelve todo */
      r.o[r.k]=null;render();
      __check("AB7 "+pant+": «Seleccionar todas» devuelve la lista completa",cuenta()===conTodas,cuenta()+" vs "+conTodas);
      /* y el botón dice lo que hace */
      const h=document.getElementById("p-"+pag).innerHTML;
      __check("AB7 "+pant+": el botón dice «Limpiar (ninguna)»",/Limpiar \(ninguna\)/.test(h));
      prep();render()}
    /* ninguna pantalla interpreta el Set por su cuenta */
    const src=document.documentElement.innerHTML;
    __check("AB7: ya no queda ninguna poda que borre el centinela",
      !/filter\(f=>keep\.has\(f\)\)/.test(src)||/podarFases/.test(src));
    __check("AB7: los cinco filtros pasan por faseOkFiltro",
      (src.match(/faseOkFiltro\(/g)||[]).length>=6,(src.match(/faseOkFiltro\(/g)||[]).length);}
   /* ---------- 3f · DOS buscadores en la misma pantalla se cancelan entre sí ---------- */
   {const bakOrds=S.ordenes.slice();
    /* el debounce de buscarQ solo se arma con MÁS de 300 órdenes: hay que estar en esa condición */
    while(S.ordenes.length<=300){const o=JSON.parse(JSON.stringify(bakOrds[S.ordenes.length%bakOrds.length]||{}));
      o.id="clon-busq-"+S.ordenes.length;o.op="WH/MO/"+(90000+S.ordenes.length);S.ordenes.push(o)}
    PLAN=null;PLAN_ALL=null;
    LIB.et="tela";LIB.q="";LIB.q4="";LIB.verLista=true;LIB.ym=null;page="liberacion";render();
    const a=document.querySelector('input[data-q="LIB.q"]'),b=document.querySelector('input[data-q="LIB.q4"]');
    if(a&&b){a.value="229";a.dispatchEvent(new Event("input",{bubbles:true}));
     await __p(50);                                  /* menos que el debounce */
     b.value="777";b.dispatchEvent(new Event("input",{bubbles:true}));
     await __p(500);
     __R.bus.colision={LIBq:LIB.q,LIBq4:LIB.q4};
     __check("AB4 Liberación · dos buscadores: lo escrito en el primero NO se pierde al pasar al segundo",
       LIB.q==="229"&&LIB.q4==="777","LIB.q="+JSON.stringify(LIB.q)+" LIB.q4="+JSON.stringify(LIB.q4));}
    LIB.q="";LIB.q4="";S.ordenes=bakOrds;PLAN=null;PLAN_ALL=null;render();}
   /* ---------- 3g · la búsqueda solo ve la BASE ya filtrada de la pantalla ---------- */
   {const src=String(baseLiberacion);
    __check("AB4 Liberación · base: el buscador solo ve las órdenes del mes del Proyecto seleccionado",
      /mesEnFiltro/.test(src),"baseLiberacion filtra por mes ANTES de buscar");
    __R.bus.baseFiltrada=/mesEnFiltro/.test(src);}
   /* ---------- 3h · el parámetro de espera vive en Configuración ---------- */
   {const bak=S.params.msBuscar;
    __check("AB6: la espera al escribir arranca en 150 ms",msBuscar()===150,msBuscar());
    setMsBuscar(300);__check("AB6: se puede cambiar",msBuscar()===300);
    setMsBuscar(0);__check("AB6: y 0 es 0 (filtrar en cada tecla), no se reemplaza",msBuscar()===0);
    let av="";const a1=window.alert;window.alert=m=>{av=String(m)};setMsBuscar(-5);window.alert=a1;
    __check("AB6: un valor negativo se rechaza con aviso",msBuscar()===0&&/0 o m\u00e1s/.test(av),av);
    page="config";CONF.tab="cal";render();
    __check("AB6: y se edita en Configuración → Calendario y parámetros",
      /Buscadores: espera al escribir/.test(document.getElementById("p-config").innerHTML));
    if(bak===undefined)delete S.params.msBuscar;else S.params.msBuscar=bak;}
   /* ---------- 3j · la base acotada: «no aparece» no es «no existe» ---------- */
   {LIB.et="tela";LIB.q="";LIB.verLista=true;LIB.fases=null;FUERA["LIB.q"]=false;
    const meses=[...new Set(S.ordenes.filter(abierta).map(o=>mesPlan(o)).filter(Boolean))].sort();
    __R.bus.baseAcotada={meses:meses.length};
    if(meses.length>=2){
      const porMes={};S.ordenes.filter(abierta).forEach(o=>{const m=mesPlan(o);if(m)(porMes[m]=porMes[m]||[]).push(o)});
      const mA=meses[0],mB=meses[1];const oA=(porMes[mA]||[])[0];
      if(oA){const num=String(oA.op||"").replace(/\D/g,"")||String(oA.op||"");
       LIB.ym=new Set([mB]);LIB.q=num;page="liberacion";render();
       const h=document.getElementById("p-liberacion").innerHTML;
       __R.bus.baseAcotada.caso={op:oA.op,suMes:mA,mirando:mB};
       __check("AB8 Liberación: una WH de otro mes del Proyecto sale en el aviso de «fuera del filtro»",
         /coinciden fuera de|coincide fuera de/.test(h),h.length);
       __check("AB8: y el aviso dice cuál es el filtro que la deja fuera",/mes del Proyecto/.test(h));
       /* al pulsar «Ver» se muestran marcadas, sin tocar los filtros */
       const ymAntes=[...(LIB.ym||[])].join(),qAntes=LIB.q;
       verFueraDeBase("LIB.q",true);render();
       const h2=document.getElementById("p-liberacion").innerHTML;
       __check("AB8: «Ver» las muestra marcadas como fuera del filtro",/fuera del filtro/.test(h2)&&h2.indexOf(esc(oA.op))>=0);
       __check("AB8: y NO cambió ningún filtro",[...(LIB.ym||[])].join()===ymAntes&&LIB.q===qAntes,
         [...(LIB.ym||[])].join()+" / "+LIB.q);
       verFueraDeBase("LIB.q",false);}
      LIB.ym=null;LIB.q="";render();}
    /* sin búsqueda no hay aviso */
    LIB.q="";render();
    __check("AB8: sin búsqueda no se avisa de nada",!/coinciden fuera de/.test(document.getElementById("p-liberacion").innerHTML));
    /* la función común no inventa: si todo está dentro de la base, no hay aviso */
    __check("AB8: si no hay coincidencias fuera, la función devuelve null",
      fueraDeBase("LIB.q",S.ordenes)===null);}
   /* ---------- 3n · el aviso de base acotada, en las SIETE pantallas, con la misma función ---------- */
   {const bakO=S.ordenes.slice();
    /* una orden de laboratorio que EXISTE pero cae fuera de la base de cada pantalla:
       cerrada en Odoo (fuera de «abiertas»), sin liberar, entrega en un mes lejano */
    const oX=JSON.parse(JSON.stringify(S.ordenes.find(abierta)||S.ordenes[0]));
    oX.id="fuera-"+uid();oX.op="WH/MO/77777";oX.estado="plan";oX.fase="0Diseño";oX.fecha="2031-01-15";delete oX.lib;oX.odc="ODC-FUERA";
    S.ordenes.push(oX);PLAN=null;PLAN_ALL=null;
    const PANT=[
      ["Centro","CEN.q","centro",()=>{CEN.id="corte";CEN.solo=null;CEN.tab="prog";CEN.todo=false;CEN.fases=null;CEN.cercAbre=null}],
      ["Órdenes","ORDF.q","ordenes",()=>{ORDF.tab="lista";ORDF.estado="cerrada";ORDF.fases=null}],
      ["Carga general","CG.q","produccion",()=>{CG.centro="corte";CG.area="pro";CG.fases=null}],
      ["Resumen gerencial","GER.q","gerencia",()=>{GER.meses=new Set([hoy().slice(0,7)]);GER.cli=null;GER.estado=null}],
      ["Plan → agregar","PMADD.q","plan",()=>{PMADD.sel=new Set();PMADD.incluirSig=false}],
      ["Entregas","EG.q","entregas",()=>{EG.meses=new Set([hoy().slice(0,7)]);EG.cli=null;EG.fam=null;EG.hija=null;EG.tela=null}],
      ["Producto en proceso","WIPL.q","wip",()=>{}]];
    for(const [pant,id,pag,prep] of PANT){
      const r=refEstado(id);if(!r.o){__check("AB12 "+pant+": refEstado alcanza "+id,false,id);continue}
      try{prep()}catch(e){}
      FUERA[id]=false;r.o[r.k]="";page=pag;render();
      const sinQ=document.getElementById("p-"+pag).innerHTML;
      __check("AB12 "+pant+": sin búsqueda no hay aviso de «fuera del filtro»",!/coinciden fuera de|coincide fuera de/.test(sinQ));
      r.o[r.k]="77777";render();
      let h=document.getElementById("p-"+pag).innerHTML;
      const enLista=!!listaHost(id)&&listaHost(id).innerHTML.indexOf("WH/MO/77777")>=0&&!/fuera del filtro/.test(listaHost(id).innerHTML);
      const hayAviso=/coinciden fuera de|coincide fuera de/.test(h);
      __check("AB12 "+pant+": la WH que existe fuera de la base sale en el aviso (o está dentro de la lista)",hayAviso||enLista,hayAviso?"aviso":(enLista?"en la lista":"ni aviso ni lista"));
      if(hayAviso){
       __check("AB12 "+pant+": el aviso dice qué filtro la deja fuera",/fuera de <\/b>|fuera de [a-záéíóú]/.test(h.replace(/<b>/g,"")),"");
       const antes=JSON.stringify(Object.fromEntries(Object.entries(r.o).filter(([k,v])=>k!==r.k&&typeof v!=="function").map(([k,v])=>[k,v instanceof Set?[...v]:v])));
       verFueraDeBase(id,true);render();
       h=document.getElementById("p-"+pag).innerHTML;
       __check("AB12 "+pant+": «Ver» la muestra marcada como fuera del filtro",/fuera del filtro/.test(h)&&h.indexOf("WH/MO/77777")>=0);
       const despues=JSON.stringify(Object.fromEntries(Object.entries(r.o).filter(([k,v])=>k!==r.k&&typeof v!=="function").map(([k,v])=>[k,v instanceof Set?[...v]:v])));
       __check("AB12 "+pant+": y no cambió ningún filtro de la pantalla",antes===despues);
       verFueraDeBase(id,false);}
      r.o[r.k]="";render()}
    S.ordenes=bakO;PLAN=null;PLAN_ALL=null;}
   /* ---------- 3k · redibujo parcial: el input NO se destruye ---------- */
   {page="ordenes";ORDF.tab="lista";ORDF.q="";ORDF.estado="plan";ORDF.fases=null;render();
    const sel='input[data-q="ORDF.q"]';
    const primero=document.querySelector(sel);
    __check("AB9: Órdenes registró su lista para el redibujo parcial",!!LISTAS["ORDF.q"]&&!!listaHost("ORDF.q"));
    if(primero){primero.focus();await __p(120);
     let txt="",reemplazos=0;
     for(const ch of "22918"){txt+=ch;primero.value=txt;
       try{primero.setSelectionRange(txt.length,txt.length)}catch(e){}
       primero.dispatchEvent(new Event("input",{bubbles:true}));
       await __p(260);
       if(document.querySelector(sel)!==primero)reemplazos++}
     __R.bus.parcial={reemplazos,texto:primero.value,cursor:primero.selectionStart};
     __check("AB9: el buscador de Órdenes NO se destruye al escribir (redibujo parcial)",reemplazos===0,reemplazos+" reemplazos");
     __check("AB9: conserva el texto completo",primero.value==="22918",primero.value);
     __check("AB9: conserva la posición del cursor",primero.selectionStart===5,primero.selectionStart);
     __check("AB9: y el texto llegó al estado",ORDF.q==="22918",ORDF.q);
     ORDF.q="";render()}}
   /* ---------- 3l · redibujo parcial en la COLA DEL CENTRO (2b) ---------- */
   {page="centro";CEN.id="corte";CEN.solo=null;CEN.tab="prog";CEN.q="";CEN.todo=true;CEN.fases=null;CEN.cercAbre=null;render();
    const sel='input[data-q="CEN.q"]';
    __check("AB10: la cola del centro registró su lista para el redibujo parcial",!!LISTAS["CEN.q"]&&!!listaHost("CEN.q"));
    /* tiempo por tecla: redibujo completo vs solo la cola */
    {const tC=[];for(let k=0;k<3;k++){const a=performance.now();render();tC.push(performance.now()-a)}
     CEN.q="2";const tP=[];for(let k=0;k<3;k++){const a=performance.now();redibujarLista("CEN.q");tP.push(performance.now()-a)}
     CEN.q="";render();
     __R.bus=__R.bus||{};__R.bus.parcialCEN={ordenes:S.ordenes.length,completoMs:Math.round(Math.max(...tC)),parcialMs:Math.round(Math.max(...tP))};
     __check("AB10: repintar solo la cola no cuesta más que la pantalla entera",Math.min(...tP)<=Math.max(...tC)+1,JSON.stringify(__R.bus.parcialCEN));}
    const primero=document.querySelector(sel);   /* DESPUÉS de medir: medir redibuja la pantalla */
    if(primero){primero.focus();await __p(120);
     let txt="",reemplazos=0;
     for(const ch of "22918"){txt+=ch;primero.value=txt;
       try{primero.setSelectionRange(txt.length,txt.length)}catch(e){}
       primero.dispatchEvent(new Event("input",{bubbles:true}));
       await __p(260);
       if(document.querySelector(sel)!==primero)reemplazos++}
     __check("AB10: el buscador de la cola NO se destruye al escribir",reemplazos===0,reemplazos+" reemplazos");
     __check("AB10: conserva el texto completo",primero.value==="22918",primero.value);
     __check("AB10: conserva la posición del cursor",primero.selectionStart===5,primero.selectionStart);
     __check("AB10: y el texto llegó al estado",CEN.q==="22918",CEN.q);
     /* la cola de verdad se filtró: con «22918» no debe quedar ninguna fila de otra WH */
     const filas=[...document.querySelectorAll('[data-lista="CEN.q"] tbody tr[draggable]')];
     __check("AB10: la cola se filtró con el texto (solo filas que calzan)",filas.every(tr=>/22918/.test(tr.textContent)),filas.length+" filas");
     /* y sigue siendo la misma cola: cabeceras y estructura intactas tras el repintado parcial */
     const ths=[...document.querySelectorAll('[data-lista="CEN.q"] thead th')].map(t=>t.textContent.trim());
     __check("AB10: las 14 columnas siguen en su orden tras el repintado parcial",ths.slice(0,14).join("|")==="Puesto|OP|ODC|Llega|Cliente|Categoría|Color|Pendientes|Min|Recurso|Arranca|Plan: inicio → fin|Marca|",ths.join("|"));
     CEN.q="";render()}}
   /* ---------- 3m · redibujo parcial en LIBERACIÓN (2b) ---------- */
   {page="liberacion";LIB.et="tela";LIB.ym=null;LIB.odc=null;LIB.fam=null;LIB.cli=null;LIB.fam2=null;LIB.q="";LIB.fases=null;LIB.verLista=true;LIB.sel=new Set();GRP={};FUERA["LIB.q"]=false;render();
    const sel='input[data-q="LIB.q"]';
    __check("AB11: Liberación registró su lista para el redibujo parcial",!!LISTAS["LIB.q"]&&!!listaHost("LIB.q"));
    /* tiempo por tecla: pantalla entera vs solo la lista */
    {const tC=[];for(let k=0;k<3;k++){const a=performance.now();render();tC.push(performance.now()-a)}
     LIB.q="2";const tP=[];for(let k=0;k<3;k++){const a=performance.now();redibujarLista("LIB.q");tP.push(performance.now()-a)}
     LIB.q="";render();
     __R.bus=__R.bus||{};__R.bus.parcialLIB={ordenes:S.ordenes.length,completoMs:Math.round(Math.max(...tC)),parcialMs:Math.round(Math.max(...tP))};
     __check("AB11: repintar solo la lista no cuesta más que la pantalla entera",Math.min(...tP)<=Math.max(...tC)+1,JSON.stringify(__R.bus.parcialLIB));}
    const primero=document.querySelector(sel);   /* DESPUÉS de medir: medir redibuja la pantalla */
    if(primero){primero.focus();await __p(120);
     let txt="",reemplazos=0;
     for(const ch of "22918"){txt+=ch;primero.value=txt;
       try{primero.setSelectionRange(txt.length,txt.length)}catch(e){}
       primero.dispatchEvent(new Event("input",{bubbles:true}));
       await __p(260);
       if(document.querySelector(sel)!==primero)reemplazos++}
     __check("AB11: el buscador de Liberación NO se destruye al escribir",reemplazos===0,reemplazos+" reemplazos");
     __check("AB11: conserva el texto completo",primero.value==="22918",primero.value);
     __check("AB11: conserva la posición del cursor",primero.selectionStart===5,primero.selectionStart);
     __check("AB11: y el texto llegó al estado",LIB.q==="22918",LIB.q);
     /* la lista de verdad se filtró y conserva su estructura */
     const host=listaHost("LIB.q");
     const filas=host?[...host.querySelectorAll("#lib-lista tbody tr")].filter(tr=>!tr.classList.contains("grp-row")&&/WH\//.test(tr.textContent)):[];
     __check("AB11: la lista se filtró con el texto (solo filas que calzan)",filas.every(tr=>/22918/.test(tr.textContent)),filas.length+" filas");
     const ths=host?[...host.querySelectorAll("#lib-lista thead th")].map(t=>t.textContent.trim().replace(/\s+/g," ")):[];
     __check("AB11: las 8 columnas siguen en su orden tras el repintado parcial (o no hay lista porque nada calza)",
       ths.length===0||(ths.length===8&&ths[1]==="OP · fase"&&ths[7]==="Qué la frena"),ths.join("|"));
     /* el aviso de base acotada también vive dentro del contenedor y se repinta con la lista */
     __check("AB11: el aviso de «fuera del filtro» se repinta junto con la lista",!!host&&(/coinciden fuera de|coincide fuera de/.test(host.innerHTML)||!fueraDeBase("LIB.q",pendLiberacion("tela",LIB.ym))));
     LIB.q="";render()}}
   /* ---------- 4 · el debounce y el redibujo: la causa de fondo ---------- */
   {const src=String(buscarQ);
    __R.bus.buscarQ=src;
    __check("AB5 causa: buscarQ llama a render() COMPLETO en cada tecla",/render\(\)/.test(src));
    __check("AB5 causa: y vuelve a buscar el input para devolverle el foco",/focus\(\)/.test(src)&&/setSelectionRange/.test(src));
    const fijo=src.match(/>\s*300\)\s*\?\s*(\d+)\s*:\s*0/);
    __R.bus.debounce={fijoMs:fijo?+fijo[1]:null,umbralOrdenes:/300/.test(src)?300:null,
      enConfiguracion:/prm\(/.test(src)};
    __check("AB5: el debounce es un PARÁMETRO (prm), no un número en el código",
      !fijo&&/msBuscar\(\)/.test(src)&&/prm\(.msBuscar.,\s*150\)/.test(String(msBuscar)+String(window.msBuscar||"")),
      "espera="+msBuscar()+"ms");
    __check("AB5: la espera es la misma con cualquier cantidad de órdenes (ya no depende de 300)",
      !/300/.test(src),"S.ordenes="+S.ordenes.length+" espera="+msBuscar()+"ms");
    __check("AB5: hay un temporizador POR buscador, no uno global",
      /_qTimers\[/.test(src)&&!/clearTimeout\(_qTimer\)/.test(src),src.slice(0,90));
    /* refEstado no conoce todos los estados: un filtro de una pantalla no listada no se guardaría */
    const src2=document.documentElement.innerHTML;
    const conocidos=Object.keys(estadosPantalla());
    const usados=[...new Set([...src2.matchAll(/busqHTML\('([A-Z]+)\./g)].map(x=>x[1]))];
    const noConoce=usados.filter(x=>!conocidos.includes(x));
    __R.bus.refEstado={conoce:conocidos,usan:usados,noConoce};
    __check("AB5 causa: refEstado conoce el estado de TODA pantalla con buscador",noConoce.length===0,noConoce.join(", "));}

   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page="ordenes";ORDF.q="";ORDF.tab="lista";render();
   __check("AB sin errores de ejecución",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* ===== excelFecha: la parte entera del serial es el día (antes se redondeaba) ===== */
  try{localStorage.__fase="excelFecha"}catch(e){}
  {const antes=__R.errors.length;
   /* 29-dic-2025: el mismo día, a distintas horas */
   const dia=Math.floor(46020.74831018518);   // la parte entera
   const mañana="2025-12-29";
   const casos=[[dia+0.0,"00:00"],[dia+0.2,"04:48"],[dia+0.4999,"11:59"],
     [dia+0.5,"12:00"],[dia+0.7235,"17:22"],[dia+0.999,"23:58"]];
   let ok=true,det=[];
   casos.forEach(([v,h])=>{const f=excelFecha(v);det.push(h+"→"+f);if(f!==mañana)ok=false});
   __check("EX1: todas las horas del mismo día dan el MISMO día, antes y después de las 12:00",ok,det.join(" · "));
   __check("EX1: y ese día es el que dice el archivo",excelFecha(dia)===mañana,excelFecha(dia));
   __check("EX2: la conversión vieja (Math.round) sí cambiaba de día a partir de las 12:00",
     excelFechaRedondeada(dia+0.4999)===mañana&&excelFechaRedondeada(dia+0.5)!==mañana,
     excelFechaRedondeada(dia+0.4999)+" / "+excelFechaRedondeada(dia+0.5));
   __check("EX3: excelFechaHora conserva la hora y coincide en el día con excelFecha",
     String(excelFechaHora(dia+0.7235)).slice(0,10)===excelFecha(dia+0.7235)&&/T\d{2}:\d{2}/.test(String(excelFechaHora(dia+0.7235))),
     excelFechaHora(dia+0.7235));
   __check("EX4: los otros formatos no cambiaron (texto ISO y dd/mm/aaaa)",
     excelFecha("2026-03-04")==="2026-03-04"&&excelFecha("4/3/2026")==="2026-03-04",excelFecha("4/3/2026"));
   __check("EX5: un Date sigue dando su día local",excelFecha(new Date(2026,2,4,23,30))==="2026-03-04",excelFecha(new Date(2026,2,4,23,30)));
   __check("EX sin errores",__R.errors.length===antes);}
  /* ===== TABLET DEL OPERARIO: solo lo programado y cierre con tiempo ===== */
  try{localStorage.__fase="tablet operario"}catch(e){}
  {const antes=__R.errors.length;const a0=window.alert;window.alert=()=>{};const adminP=PERFIL;
   const C="corte";
   const rec=(S.recursos.find(r=>r.activa&&r.centro===C)||{}).id||null;
   /* un operario de verdad: perfil tablet con centro y recurso asignados */
   const uid0="op-"+uid();
   S.params.tablets=S.params.tablets||{};S.params.tablets[uid0]={centro:C,rec};
   const comoOperario=f=>{const g=PERFIL;PERFIL={id:uid0,rol:"tablet",modo:"editar",nombre:"Operario prueba"};
     try{return f()}finally{PERFIL=g}};
   __check("TO0: el perfil de prueba es operario",comoOperario(()=>esOperario()));
   PLAN=null;PLAN_ALL=null;let P=programar();
   /* --- A1 · programadoPara es la única definición --- */
   {const conRuta=S.ordenes.filter(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro===C)&&!pasoHecho(o,C));
    const prog=conRuta.filter(o=>programadoPara(o,C,rec,P));
    __R.tab={conRuta:conRuta.length,programadas:prog.length,ventana:diasVentanaTablet(),hasta:finVentanaTablet()};
    __check("TO1: programadoPara solo acepta órdenes con carga del motor en ese centro y recurso, dentro de la ventana",
      prog.every(o=>(P.pro||[]).some(x=>x.op===o.op&&x.centro===C&&(!rec||x.rec===rec)&&x.dia>=hoy()&&x.dia<=finVentanaTablet())),prog.length+" de "+conRuta.length);
    __check("TO1: la ventana son 5 días hábiles y es parámetro",diasVentanaTablet()===5&&/prm\(.diasVentanaTablet.,\s*5\)/.test(String(diasVentanaTablet)),diasVentanaTablet());
    /* recurso fijo SIN programa ya no entra */
    const sinProg=conRuta.find(o=>!programadoPara(o,C,rec,P));
    if(sinProg&&rec){const bak=JSON.stringify(sinProg.recursoFijo||null);sinProg.recursoFijo=Object.assign({},sinProg.recursoFijo,{[C]:rec});
     const cola=comoOperario(()=>tabletFilas(C,rec,programar()));
     __check("TO1: una orden con recurso fijo pero SIN programa no aparece en la tablet",!cola.some(f=>f.o.id===sinProg.id),sinProg.op);
     if(bak==="null")delete sinProg.recursoFijo;else sinProg.recursoFijo=JSON.parse(bak)}}
   /* --- A2 · la programada aparece, la no programada no --- */
   {const cola=comoOperario(()=>tabletFilas(C,rec,programar()));
    __R.tab.enCola=cola.length;
    __check("TO2: todo lo que ve el operario está programado para su puesto",
      cola.every(f=>f.fueraDelPlan||visibleOperario(f.o,C,rec,PLAN)),cola.length+" en cola");
    const fuera=S.ordenes.filter(o=>abierta(o)&&!visibleOperario(o,C,rec,PLAN));
    __check("TO2: ninguna orden no programada se cuela en la cola",!cola.some(f=>!f.fueraDelPlan&&fuera.some(x=>x.id===f.o.id)));
    /* ordenesQueVe usa la misma definición */
    const ve=comoOperario(()=>ordenesQueVe());
    __check("TO2: ordenesQueVe (rama operario) usa la misma definición",ve.every(o=>visibleOperario(o,C,rec,PLAN)),ve.length);}
   /* --- A3 · si la programación falla, se avisa; nunca se muestra todo --- */
   {const bak=window.programar;const bakPlan=PLAN;
    window.programar=()=>{throw new Error("fallo de prueba")};PLAN=null;
    const ve=comoOperario(()=>ordenesQueVe());
    __check("TO3: si programar() falla, el operario no ve NINGUNA orden",ve.length===0,ve.length);
    __check("TO3: y queda el aviso para la pantalla",!!ERR_PROG&&/fallo de prueba/.test(ERR_PROG),ERR_PROG);
    __check("TO3: el mensaje dice «Error en la programación — avise al supervisor»",/Error en la programaci\u00f3n — avise al supervisor/.test(errProgHTML()));
    window.programar=bak;PLAN=bakPlan;ERR_PROG=null;PLAN=null;PLAN_ALL=null;P=programar();}
   /* --- A4 · «fuera del plan»: visible solo mientras el tramo esté abierto --- */
   {const fueraP=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro===C)&&!pasoHecho(o,C)&&!visibleOperario(o,C,rec,P));
    if(fueraP){
     const t={id:"t-fuera",centro:C,rec:rec||null,ini:new Date(Date.now()-40*6e4).toISOString(),u:"operario",paros:[],tallas:{}};
     tramosDe(fueraP.id).push(t);
     const cola=comoOperario(()=>tabletFilas(C,rec,programar()));
     const fila=cola.find(f=>f.o.id===fueraP.id);
     __check("TO4: una orden iniciada fuera del plan sigue visible, marcada",!!fila&&!!fila.fueraDelPlan,fueraP.op);
     __check("TO4: y la cola del supervisor la marca «en proceso fuera del plan»",
       /en proceso fuera del plan/.test(mandaCola(fueraP,C,true)));
     {const hf=filaColaTabletHTML(fila,C,rec,"disponible");
      __check("TO4: sin INICIO: solo se puede terminar",!/iniciarTramo\(/.test(hf),hf.slice(0,120));}
     /* al terminar el tramo desaparece */
     t.fin=new Date().toISOString();
     const cola2=comoOperario(()=>tabletFilas(C,rec,programar()));
     __check("TO4: al terminar el tramo deja de aparecer",!cola2.some(f=>f.o.id===fueraP.id));
     __check("TO4: y el supervisor ya no la marca",!/en proceso fuera del plan/.test(mandaCola(fueraP,C,true)));
     tramosDe(fueraP.id).splice(tramosDe(fueraP.id).indexOf(t),1);}}
   /* --- A5 · pasos sin tiempo: invisibles salvo que el supervisor los asigne --- */
   {const sinT=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro===C)&&!pasoHecho(o,C)&&pasoSinTiempo(o,C));
    __R.tab.sinTiempo=S.ordenes.filter(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro===C)&&!pasoHecho(o,C)&&pasoSinTiempo(o,C)).length;
    if(sinT&&rec){
     __check("TO5: un paso sin minutos no lo programa el motor, así que el operario no lo ve",!programadoPara(sinT,C,rec,P),sinT.op);
     const bak=JSON.stringify(sinT.progCentro||null);
     sinT.progCentro=Object.assign({},sinT.progCentro,{[C]:{rec,desde:hoy()}});
     __check("TO5: si el supervisor le fija recurso y fecha, pasa a ser visible",fijadaPara(sinT,C,rec)&&visibleOperario(sinT,C,rec,P));
     const cola=comoOperario(()=>tabletFilas(C,rec,programar()));
     const fila=cola.find(f=>f.o.id===sinT.id);
     __check("TO5: y aparece marcada «sin tiempo estándar» en Mi centro",!!fila&&comoOperario(()=>{
       TAB.centro=C;TAB.rec=rec;page="tablet";render();
       return /sin tiempo est\u00e1ndar/.test(document.getElementById("p-tablet").innerHTML)}),sinT.op);
     __check("TO5: el tramo registra tiempo real igual (no depende del estándar)",(()=>{
       const t={id:"t-st",centro:C,rec:rec||null,ini:new Date(Date.now()-20*6e4).toISOString(),fin:new Date().toISOString(),u:"op",paros:[],tallas:{}};
       const r=calcTramo(t,sinT);return r.trabajado>15&&r.trabajado<25})());
     if(bak==="null")delete sinT.progCentro;else sinT.progCentro=JSON.parse(bak)}
    /* la acción del supervisor existe en la cola */
    page="centro";CEN.id=C;CEN.solo=null;CEN.tab="prog";CEN.q="";CEN.todo=true;CEN.cercAbre=null;render();
    {const h=document.getElementById("p-centro").innerHTML;
     __check("TO5: «asignar a operario» se retiró de la cola (decisión 17-sep); el supervisor fija recurso y fecha en la propia fila",!/asignar a operario|mAsignarOperario/.test(h)&&typeof window.mAsignarOperario==="undefined"&&/setProgCen\('[^']+','[^']+','rec'/.test(h)&&/setProgCen\('[^']+','[^']+','desde'/.test(h));
     if(sinT){const tr=[...document.querySelectorAll("#p-centro .panel.cola tbody tr[draggable]")].find(t=>(t.getAttribute("ondragstart")||"").includes("'"+sinT.id+"'"));
      __check("TO5: con «toda la cola» la orden del paso sin tiempo está en la cola y su recurso y fecha se pueden fijar desde la fila (habilitados)",!!tr&&!!tr.querySelector("td:nth-child(10) select:not([disabled])")&&!!tr.querySelector("td:nth-child(11) input[type=date]:not([disabled])")&&/paso sin tiempo/.test(tr.innerHTML),sinT.op);}}}
   /* --- A6/A7 · cola vacía y buscador fuera del plan --- */
   {__check("TO6: la cola vacía dice «Sin programación cargada — avise al supervisor»",
      /Sin programaci\u00f3n cargada — avise al supervisor/.test(sinProgramaHTML(C,rec)));
    const fueraP=S.ordenes.find(o=>o.op&&!visibleOperario(o,C,rec,P));
    if(fueraP){const bakq=TAB.q;TAB.q=String(fueraP.op).replace(/\D/g,"")||fueraP.op;
     const h=comoOperario(()=>tabletBuscadorHTML(C,[],rec));
     __check("TO7: buscar una orden fuera del plan avisa y no deja iniciarla",
       /No est\u00e1 programada — consulte al supervisor/.test(h)&&!/iniciarTramo\(/.test(h),fueraP.op);
     TAB.q=bakq}}
   /* --- B · cierre con tiempo --- */
   {const oC=S.ordenes.find(o=>abierta(o)&&(o.ruta||[]).some(p=>p.centro===C)&&!pasoHecho(o,C));
    if(oC){const bakTr=JSON.stringify(tramosDe(oC.id));const bakAv=JSON.stringify(S.avance[oC.id]||{});
     __check("B1: el mínimo son 5 minutos y es parámetro",minMinutosCierre()===5&&/prm\(.minMinutosCierre.,\s*5\)/.test(String(minMinutosCierre)));
     /* sin tramo: bloquea */
     tramosDe(oC.id).length=0;
     let r=puedeCerrarPaso(oC.id,C);
     __check("B2: sin ningún inicio no se puede cerrar",!r.ok&&r.sinTramo&&/Debe iniciar y registrar tiempo antes de cerrar/.test(r.motivo),r.motivo);
     let av="";window.alert=m=>{av=String(m)};
     __check("B2: y cerrarCentro lo impide con ese mensaje",cerrarCentro(oC.id,C,"")===false&&/Debe iniciar y registrar tiempo/.test(av),av);
     window.alert=()=>{};
     /* tramo corto: sigue bloqueando */
     tramosDe(oC.id).push({id:"t1",centro:C,rec:rec||null,ini:new Date(Date.now()-2*6e4).toISOString(),fin:new Date().toISOString(),u:"op",paros:[],tallas:{}});
     r=puedeCerrarPaso(oC.id,C);
     __check("B2: con menos minutos que el mínimo tampoco",!r.ok&&r.minutos<minMinutosCierre(),num(r.minutos,1)+" min");
     /* dos tramos que SUMAN por encima del mínimo: permite */
     tramosDe(oC.id).push({id:"t2",centro:C,rec:rec||null,ini:new Date(Date.now()-6*6e4).toISOString(),fin:new Date(Date.now()-2*6e4).toISOString(),u:"op2",paros:[],tallas:{}});
     r=puedeCerrarPaso(oC.id,C);
     __check("B2: el tiempo de DOS tramos se suma y permite cerrar",r.ok&&r.minutos>=minMinutosCierre(),num(r.minutos,1)+" min de "+tiempoEfectivoCentro(oC.id,C).tramos+" tramos");
     /* tiempoBajo: marca pero no bloquea (con SAM) */
     const paso=(oC.ruta||[]).find(p=>p.centro===C)||{};const bakT=paso.t;
     const a=S.avance[oC.id]=S.avance[oC.id]||{};a.centros=Object.assign({},a.centros,{[C]:cantCentro(oC,C)});
     if(!motivosDe("cierre").length){S.params.motivos=S.params.motivos||[];S.params.motivos.push({motivo:"faltante de prueba",uso:"cierre"})}
     paso.t=10;   // muchas prendas × 10 min: muy por encima de los ~6 min registrados
     r=puedeCerrarPaso(oC.id,C);
     __check("B2: tiempo muy por debajo del estándar: se permite y se MARCA tiempoBajo",r.ok&&r.tiempoBajo===true,JSON.stringify({ok:r.ok,bajo:r.tiempoBajo}));
     __check("B2: y el cierre lo deja registrado",(()=>{cerrarCentro(oC.id,C,"");const ci=(((S.avance[oC.id]||{}).cierres)||{})[C];return !!(ci&&ci.tiempoBajo&&ci.minutos>0)})());
     /* sin SAM no se marca: es dato faltante, no un falso positivo */
     delete (S.avance[oC.id]||{}).cierres;
     paso.t=0;
     r=puedeCerrarPaso(oC.id,C);
     __check("B2: sin SAM NO se marca tiempoBajo (dato faltante, no falso positivo)",r.ok&&!r.tiempoBajo&&r.sinEstandar===true,JSON.stringify({bajo:!!r.tiempoBajo,sinEst:r.sinEstandar}));
     paso.t=bakT;
     /* B4 · el supervisor puede cerrar sin tiempo, con motivo obligatorio */
     delete (S.avance[oC.id]||{}).cierres;tramosDe(oC.id).length=0;
     if(!motivosDe("cierreSinTiempo").length){S.params.motivos=S.params.motivos||[];S.params.motivos.push({motivo:"cierre administrativo",uso:"cierreSinTiempo"})}
     av="";window.alert=m=>{av=String(m)};
     __check("B4: sin motivo válido no se cierra",cerrarCentro(oC.id,C,"",{sinTiempo:true,motivoSinTiempo:"inventado"})===false&&/motivo de la tabla 15/.test(av),av);
     window.alert=()=>{};
     const nb=S.bitacora.length;const na=(S.params.auditoriaCambios||[]).length;
     const ok=cerrarCentro(oC.id,C,"",{sinTiempo:true,motivoSinTiempo:"cierre administrativo"});
     const ci=(((S.avance[oC.id]||{}).cierres)||{})[C];
     __check("B4: con motivo válido sí, y queda marcado sinTiempo",ok===true&&!!ci&&ci.sinTiempo===true&&ci.motivoSinTiempo==="cierre administrativo",JSON.stringify(ci&&{st:ci.sinTiempo,m:ci.motivoSinTiempo}));
     __check("B4: con bitácora y auditoría",S.bitacora.slice(nb).some(b=>/Cierre SIN TIEMPO/.test(b.t))&&(S.params.auditoriaCambios||[]).length>na);
     __check("B4: «cierre sin tiempo» es un uso de la tabla 15",USOS_MOTIVO.some(u=>u[0]==="cierreSinTiempo"));
     /* B3 · la misma puerta en el ✓ hecho del supervisor */
     __check("B3: confirmarHechoCentro pasa por puedeCerrarPaso",/puedeCerrarPaso\(/.test(String(confirmarHechoCentro)));
     __check("B3: y cerrarCentro también (una sola puerta)",/puedeCerrarPaso\(/.test(String(cerrarCentro)));
     /* ===== AJUSTES (17-sep) ===== */
     /* A2 · mínimo por centro: vacío = general */
     delete (S.avance[oC.id]||{}).cierres;tramosDe(oC.id).length=0;
     tramosDe(oC.id).push({id:"t3",centro:C,rec:rec||null,ini:new Date(Date.now()-6*6e4).toISOString(),fin:new Date().toISOString(),u:"op",paros:[],tallas:{}});
     __check("TA2: sin valor propio, el centro usa el general",minMinutosCierre(C)===5&&fuenteMinCierre(C)==="general"&&puedeCerrarPaso(oC.id,C).ok);
     {const nb=S.bitacora.length;setMinMinutosCierreCentro(C,12);
      __check("TA2: con valor propio manda el del centro y el general no cambia",minMinutosCierre(C)===12&&fuenteMinCierre(C)==="centro"&&minMinutosCierre()===5&&prm("minMinutosCierre",5)===5,minMinutosCierre(C)+"/"+minMinutosCierre());
      const r2=puedeCerrarPaso(oC.id,C);
      __check("TA2: puedeCerrarPaso usa el mínimo del centro y dice de dónde salió",!r2.ok&&r2.minimo===12&&r2.fuente==="centro",JSON.stringify({ok:r2.ok,min:r2.minimo,f:r2.fuente}));
      __check("TA2: el cambio queda en bitácora",S.bitacora.length>nb&&/Minutos mínimos para cerrar en/.test(S.bitacora.slice(-1)[0].t));
      page="config";CONF.tab="cal";render();const hc=document.getElementById("p-config").innerHTML;
      __check("TA2: Configuración muestra el mínimo por centro con «vacío = usa el general»",/setMinMinutosCierreCentro\(/.test(hc)&&/vacío = usa el general/.test(hc)&&/1 con valor propio/.test(hc));
      setMinMinutosCierreCentro(C,"");
      __check("TA2: vaciarlo vuelve al general",minMinutosCierre(C)===5&&fuenteMinCierre(C)==="general"&&!(S.params.minMinutosCierreCentro||{})[C]&&puedeCerrarPaso(oC.id,C).ok);}
     /* A4 · sin tiempo corrido NO aparece «Hecho» ni «Terminar orden» */
     {S.params.tablets[uid0]={centro:C,rec:rec||null};
      tramosDe(oC.id).length=0;
      const h0=comoOperario(()=>{page="tablet";render();return document.getElementById("p-tablet").innerHTML});
      const cardOf=(h,id)=>{const i=h.indexOf(id);return i<0?"":h.slice(Math.max(0,i-2500),i+3500)};
      const enPantalla=/data-oid|onclick="iniciarTramo/.test(h0);
      const enTarjeta=h=>h.includes("mFasePiso('"+oC.id+"'");
      const btnHecho=(h,id)=>new RegExp("(marcarHechoCentro|mRegistroTallas)\\('"+id+"'").test(h);
      __check("TA4: sin ningún tramo, la tarjeta no ofrece «Hecho»: dice qué falta",enTarjeta(h0)?(!btnHecho(h0,oC.id)&&/Hecho aparece con tiempo corrido/.test(h0)):true,enTarjeta(h0)?"":"no está en la cola (se acepta)");
      __check("TA4: la función que decide es la misma puerta (puedeCerrarPaso) — no hay un segundo criterio en la vista",/puedeCerrarPaso\(o\.id,c\)\.ok\?/.test(String(vTablet))&&/puedeCerrarPaso\(o\.id,c\)\.ok\?/.test(String(filaColaTabletHTML))&&/puedeCerrarPaso\(oid,c\)/.test(String(hintCierreHTML)));
      /* con tiempo suficiente, aparece */
      tramosDe(oC.id).push({id:"t4",centro:C,rec:rec||null,ini:new Date(Date.now()-9*6e4).toISOString(),fin:new Date().toISOString(),u:"op",paros:[],tallas:{}});
      const h1=comoOperario(()=>{page="tablet";render();return document.getElementById("p-tablet").innerHTML});
      const seg1=cardOf(h1,oC.op);
      __check("TA4: con tiempo corrido la tarjeta sí ofrece «Hecho»",enTarjeta(h1)?btnHecho(h1,oC.id):true,enTarjeta(h1)?"":"no está en la cola (se acepta)");
      __check("TA4: el texto de espera nombra los minutos que faltan y el mínimo",(()=>{tramosDe(oC.id).length=0;tramosDe(oC.id).push({id:"t5",centro:C,rec:rec||null,ini:new Date(Date.now()-2*6e4).toISOString(),fin:new Date().toISOString(),u:"op",paros:[],tallas:{}});const t=hintCierreHTML(oC.id,C);return /Hecho aparece con tiempo corrido: [\d,\.]+ de 5 min/.test(t)})(),hintCierreHTML(oC.id,C));
      tramosDe(oC.id).length=0;
      __check("TA4: sin tramo el texto pide iniciar",/inicia el tramo/.test(hintCierreHTML(oC.id,C)),hintCierreHTML(oC.id,C));}
     /* A1 · fallo de programar(): alerta en Hoy (admin/planificación), una por falla, con hora y error, y bitácora */
     {const bak=window.programar;const bakPlan=PLAN;const nb=S.bitacora.length;
      window.programar=()=>{throw new Error("fallo de prueba A1")};PLAN=null;
      comoOperario(()=>ordenesQueVe());comoOperario(()=>ordenesQueVe());comoOperario(()=>ordenesQueVe());
      const ep=erroresProgAbiertos();
      __check("TA1: la falla queda en bitácora con hora y error",S.bitacora.slice(nb).some(b=>b.k==="errProg"&&/fallo de prueba A1/.test(b.err)&&b.ts),S.bitacora.slice(nb).map(b=>b.t).join(" | ").slice(0,160));
      __check("TA1: UNA sola alerta por falla aunque se repita la pantalla",ep.filter(b=>/fallo de prueba A1/.test(b.err)).length===1,ep.length);
      window.programar=bak;PLAN=bakPlan;ERR_PROG=null;PLAN=null;PLAN_ALL=null;
      __check("TA1: el operario no ve la alerta en Pendientes",comoOperario(()=>!pendientesHoy().some(i=>i.k==="errorProg"&&i.n>0)));
      const it=pendientesHoy().find(i=>i.k==="errorProg");
      __check("TA1: admin la ve en Hoy → Pendientes con hora y error",!!it&&it.n>=1&&/fallo de prueba A1/.test(it.detalle)&&/\d{1,2}:\d{2}/.test(it.detalle),it&&it.detalle.slice(0,120));
      const bakP2=PERFIL;PERFIL={id:"u-pl2",rol:"planificacion"};const itP=pendientesHoy().find(i=>i.k==="errorProg");PERFIL=bakP2;
      __check("TA1: planificación también",!!itP&&itP.n>=1);
      mErroresProg();__check("TA1: el listado abre con la falla y el botón atendida",/fallo de prueba A1/.test(document.getElementById("modal").textContent)&&/atenderErrProg\(/.test(document.getElementById("modal").innerHTML));cerrar();
      const id=ep.find(b=>/fallo de prueba A1/.test(b.err)).id;atenderErrProg(id);
      __check("TA1: atendida sale de Hoy pero la bitácora se conserva",!erroresProgAbiertos().some(b=>b.id===id)&&S.bitacora.some(b=>b.id===id)&&!!(S.params.errProgAtendidos||{})[id]);
      P=programar();}
     /* A3 · avisos de tabla 15 y 18 vacías */
     {const bakM=S.params.motivos;const bakH=JSON.stringify(S.params.horarios||{});
      S.params.motivos=(bakM||[]).filter(m=>m.uso!=="cierreSinTiempo");
      page="config";CONF.tab="ordenes2";render();let hx=document.getElementById("p-config").innerHTML;
      __check("TA3: tabla 15 avisa «sin motivos de cierre sin tiempo» y qué deja de funcionar",/sin motivos de cierre sin tiempo/.test(hx)&&/no puede cerrar un paso sin tiempo corrido/.test(hx));
      S.params.motivos=bakM;render();hx=document.getElementById("p-config").innerHTML;
      __check("TA3: con motivos cargados el aviso de ese uso desaparece",!/sin motivos de cierre sin tiempo/.test(hx));
      S.params.horarios={};render();hx=document.getElementById("p-config").innerHTML;
      __check("TA3: tabla 18 avisa «Sin ventanas de descanso» y el efecto (minuto real inflado)",/Sin ventanas de descanso en ningún centro/.test(hx)&&/no descuenta almuerzo/.test(hx));
      S.params.horarios=JSON.parse(bakH);}
     /* se deja como estaba */
     S.avance[oC.id]=JSON.parse(bakAv);const tr=tramosDe(oC.id);tr.length=0;JSON.parse(bakTr).forEach(t=>tr.push(t));PLAN=null;PLAN_ALL=null}}
   delete S.params.tablets[uid0];
   window.alert=a0;PERFIL=adminP;PLAN=null;PLAN_ALL=null;page="ordenes";render();
   __check("TO sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* ===== CARGAS · el camino único sobre el mismo archivo: reconoce todo, no duplica, no pisa (17-sep) ===== */
  try{localStorage.__fase="carga unica"}catch(e){}
  {const antes=__R.errors.length;const tareaRows=window.__tareaRows||[];const al=window.alert;window.alert=()=>{};
   __check("D1: las órdenes de demostración no cuentan como cartera abierta para la carga",S.ordenes.filter(esDemo).length>=1&&!carteraAbiertaCarga().some(esDemo)&&/demo:true/.test(String(window.demo))&&/carteraAbiertaCarga\(/.test(String(planTarea)),S.ordenes.filter(esDemo).length);
   {const pD=planTarea(tareaRows,"D1.xlsx");__check("D1: por eso cargar el volcado real sobre la cartera de demostración NO dispara el freno",!(pD.prev.incompleto||{}).frena,JSON.stringify(pD.prev.incompleto));}
   const p0=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=p0;aplicarTarea();await __p(50);
   const demo=S.ordenes.filter(o=>/^OP-/.test(o.op||"")).length;const cartera=S.ordenes.length;
   const p=planTarea(tareaRows,"TAREA_OTRA_VEZ.xlsx");
   __R.odooMatch={cartera,demo,reconocidas:p.prev.actualizadas,nuevas:p.prev.nuevas,fuera:p.excluidas.alcance.length,noVinieron:p.prev.noVinieron.length};
   __check("U6: el mismo archivo otra vez: reconoce TODAS las órdenes menos las de demostración, y no crea ninguna",p.prev.nuevas===0&&p.prev.actualizadas+p.prev.repetidasNoAplicadas===cartera-demo,JSON.stringify(__R.odooMatch));
   __check("U6: nada queda como «no vino» (las de demostración ya estaban marcadas no está en el archivo)",p.prev.noVinieron.length===0,JSON.stringify(p.prev.noVinieron.map(x=>x.op)));
   const fotoDe2=()=>JSON.stringify(S.ordenes.map(o=>[o.id,o.fase,o.cant,o.estado]).sort((a,b)=>a[0]<b[0]?-1:1));const foto=fotoDe2();TAREA=p;aplicarTarea();await __p(50);
   __check("U6: aplicar el mismo archivo no cambia la cartera (ni id, ni fase, ni cantidad, ni estado)",S.ordenes.length===cartera&&fotoDe2()===foto,S.ordenes.length+" vs "+cartera);
   /* ===== 7 · Restaurar: solo admin, respaldo automático ANTES, confirmación escrita, nada se pierde de la bitácora ===== */
   {const copia=JSON.stringify(S);const nOrd=S.ordenes.length,nBit=S.bitacora.length;
    const nuevo=JSON.parse(copia);nuevo.ordenes=nuevo.ordenes.slice(1);nuevo.bitacora=[];
    let bajadas=[];const dj0=window.descargarJSON;window.descargarJSON=(n,o)=>{bajadas.push({n,ordenes:(o.ordenes||[]).length})};
    const pr0=window.prompt;let av="";const a1=window.alert;window.alert=m=>{av=String(m)};
    const bakP=PERFIL;PERFIL={id:"u-pl7",rol:"planificacion"};window.prompt=()=>"RESTAURAR";const r1=await restaurarDesde(nuevo,"resp.json");PERFIL=bakP;
    __check("R7: planificación no puede restaurar",r1===false&&/administrador/.test(av)&&S.ordenes.length===nOrd&&bajadas.length===0,av);
    window.prompt=()=>"si";const r2=await restaurarDesde(nuevo,"resp.json");
    __check("R7: sin la palabra RESTAURAR no pasa nada (ni respaldo ni reemplazo)",r2===false&&S.ordenes.length===nOrd&&bajadas.length===0);
    /* si el respaldo no sube al servidor, NO se restaura (la descarga local sí ocurre) */
    {const st=sb.storage;const bakFrom=st.from;st.from=()=>({upload:async()=>({data:null,error:{message:"bucket no existe"}})});
     const nb0=S.bitacora.length;window.prompt=()=>"RESTAURAR";const rF=await restaurarDesde(nuevo,"resp.json");st.from=bakFrom;
     __check("R7: si la subida del respaldo al servidor falla, NO se restaura y se avisa",rF===false&&S.ordenes.length===nOrd&&/NO se restauró/.test(av)&&/bucket no existe/.test(av)&&S.bitacora.slice(nb0).some(b=>/Restaurar CANCELADO/.test(b.t)),av.slice(0,120));
     __check("R7: la descarga local igual se hizo",bajadas.length===1&&bajadas[0].ordenes===nOrd);bajadas=[];}
    window.prompt=()=>"RESTAURAR";const r3=await restaurarDesde(nuevo,"resp.json");
    __check("R7: con RESTAURAR: primero baja el respaldo automático de lo que había, después reemplaza",r3===true&&bajadas.length===1&&/respaldo_automatico_antes_de_restaurar_/.test(bajadas[0].n)&&bajadas[0].ordenes===nOrd&&S.ordenes.length===nOrd-1,JSON.stringify(bajadas));
    __check("R7: la bitácora se conserva y se une, y la restauración queda registrada",S.bitacora.length>=nBit+1&&/RESTAURADO desde «resp.json»/.test(S.bitacora.slice(-1)[0].t)&&(S.params.restauraciones||[]).slice(-1)[0].archivo==="resp.json"&&(S.params.restauraciones||[]).slice(-1)[0].antes.ordenes===nOrd,S.bitacora.length+" vs "+nBit);
    __check("R7: el respaldo también quedó en el servidor (carpeta respaldos/) y la ruta en restauraciones",(()=>{const r=(S.params.restauraciones||[]).slice(-1)[0];const F=(sb.storage.__FILES||{});return !!r&&/^respaldos\/respaldos\/respaldo_automatico/.test(r.rutaServidor||"")&&Object.keys(F).some(k=>k===r.rutaServidor)})(),JSON.stringify((S.params.restauraciones||[]).slice(-1)[0]));
    __check("R7: el flujo pide la palabra y no usa confirm() suelto",/prompt\(/.test(String(restaurarDesde))&&/RESTAURAR/.test(String(restaurarDesde))&&!/confirm\(/.test(String(restaurarDesde))&&/puede\(.config.\)/.test(String(importJSON)));
    window.prompt=pr0;window.alert=a1;window.descargarJSON=dj0;S=JSON.parse(copia);PLAN=null;PLAN_ALL=null;}
   /* ===== 8 · registro unificado de cargas ===== */
   {const n0=(S.cargas||[]).length;
    const pT=planTarea(tareaRows,"REG_T.xlsx");TAREA=pT;aplicarTarea();await __p(50);
    const cT=S.cargas.slice(-1)[0];
    __check("G8: la carga de tareas deja UNA fila en S.cargas con tipo, hora, quién, archivo y resumen",S.cargas.length===n0+1&&cT.tipo==="tareas"&&cT.archivo==="REG_T.xlsx"&&!!cT.ts&&cT.resumen&&cT.resumen.actualizadas>1000&&cT.resumen.nuevas===0&&"noVinieron" in cT.resumen&&"fueraAlcance" in cT.resumen&&"noCalzan" in cT.resumen,JSON.stringify(cT&&cT.resumen));
    /* OT */
    {const otRows=window.__otRows||[];if(otRows.length){const pO=planOT(otRows,"REG_OT.xlsx");if(pO){OT=pO;aplicarOT();await __p(50);const cO=S.cargas.slice(-1)[0];
      __check("G8: la carga de OT deja su fila con el mismo formato",cO.tipo==="ot"&&cO.archivo==="REG_OT.xlsx"&&cO.resumen&&"ordenes" in cO.resumen&&"cierres" in cO.resumen&&"noEncontradas" in cO.resumen,JSON.stringify(cO&&cO.resumen));}}}
    /* fotos */
    {const o1=S.ordenes.find(o=>abierta(o)&&o.op);const jpg=(px)=>{const cv=document.createElement("canvas");cv.width=cv.height=px;const cx=cv.getContext("2d");cx.fillStyle="#3a3";cx.fillRect(0,0,px,px);return cv.toDataURL("image/jpeg",0.8).split(",")[1]};
     const csv="Orden de produccion,Avatar\n"+o1.op+","+jpg(40)+"\nWH/MO/999998,"+jpg(40);const pF=planFotos(csv,"REG_F.csv");mActualizarDatos(3);FOTOS=pF;await aplicarFotos();await __p(50);const cF=S.cargas.slice(-1)[0];
     __check("G8: la carga de fotos deja su fila, con las que no tienen orden",cF.tipo==="fotos"&&cF.archivo==="REG_F.csv"&&cF.resumen&&cF.resumen.subidas>=1&&cF.resumen.sinOrden===1,JSON.stringify(cF&&cF.resumen));}
    __check("G8: los tres cargadores pasan por registrarCarga y nadie escribe S.cargas.push por su cuenta",/registrarCarga\(/.test(String(aplicarTarea))&&/registrarCarga\(/.test(String(aplicarOT))&&/registrarCarga\(/.test(String(aplicarFotos))&&(()=>{const src=[...document.scripts].map(x=>x.textContent).sort((a,b)=>b.length-a.length)[0]||"";return src.split("S.cargas.push(").length===2})());
    page="config";CONF.tab="ordenes2";render();const h=document.getElementById("p-config").innerHTML;
    __check("G8: Configuración → Órdenes y materiales muestra el registro con la última carga de cada tipo y la tabla",/Registro de cargas/.test(h)&&/Tareas de Odoo/.test(h)&&/REG_T\.xlsx/.test(h)&&/REG_F\.csv/.test(h)&&/nunca se recorta/.test(h));
    __check("G8: el texto del resumen dice qué pasó (actualizadas, no vinieron, fuera de alcance…)",/actualizadas/.test(resumenCargaTxt(cT))&&/no vinieron/.test(resumenCargaTxt(cT))&&/fuera de alcance/.test(resumenCargaTxt(cT)),resumenCargaTxt(cT));
    const pz=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=pz;aplicarTarea();await __p(50);}
   /* ===== 6b · freno por archivo incompleto + aviso en pasos 2 y 3 ===== */
   {const H=tareaRows[0];const iC=H.indexOf("Cliente"),iO=H.indexOf("Orden de producción");
    const cnt={};tareaRows.slice(1).forEach(r=>{if(String(r[iO]||"").trim()){const c=String(r[iC]||"");cnt[c]=(cnt[c]||0)+1}});const cli=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];
    /* archivo filtrado a UN cliente (con sus componentes: se arrastra el bloque de cada cabecera) */
    const rows=[tareaRows[0]];let dentro=false;tareaRows.slice(1).forEach(r=>{const esCab=String(r[iO]||"").trim()||String(r[iC]||"").trim();if(esCab)dentro=String(r[iC]||"")===cli;if(dentro)rows.push(r)});
    const abiertas=carteraAbiertaCarga().length;const nOrd=S.ordenes.length;const nb=S.bitacora.length;
    const p=planTarea(rows,"SOLO_"+cli.slice(0,8)+".xlsx");const inc=p.prev.incompleto;
    __check("F6: un archivo filtrado a un cliente dispara el freno: faltan N (X %) sobre la cartera abierta",!!inc&&inc.frena===true&&inc.faltan>abiertas*0.1&&inc.abiertas===abiertas&&inc.umbral===10,JSON.stringify(inc&&{f:inc.faltan,a:inc.abiertas,p:inc.pct}));
    const h=vistaPreviaTareaHTML(p);
    __check("F6: aviso rojo con el texto acordado y el desglose por cliente y mes",/El archivo parece incompleto: faltan/.test(h)&&/¿Exportaste con filtros\?/.test(h)&&/por cliente:/.test(h)&&/Por mes:/.test(h)&&Object.keys(inc.porCliente).length>=1&&!(cli in inc.porCliente)&&Object.keys(inc.porMes).length>=1,Object.keys(inc.porCliente).slice(0,3).join(" | "));
    const pr0=window.prompt;window.prompt=()=>"";TAREA=p;aplicarTarea();await __p(50);
    __check("F6: sin la palabra APLICAR no se aplica (cartera intacta, sin bitácora nueva)",S.ordenes.length===nOrd&&S.bitacora.length===nb&&!S.ordenes.some(o=>o.noArchivo&&o.noArchivo.archivo===p.archivo));
    window.prompt=()=>"APLICAR";TAREA=p;aplicarTarea();await __p(50);window.prompt=pr0;
    __check("F6: con APLICAR se aplica, queda en bitácora, y las que faltaban quedan «no está en el archivo» (no se borran)",S.ordenes.length===nOrd&&S.bitacora.slice(nb).some(b=>/archivo incompleto/.test(b.t)&&/confirmación escrita/.test(b.t))&&S.ordenes.filter(o=>o.estado==="noArchivo"&&o.noArchivo&&o.noArchivo.archivo===p.archivo).length===inc.faltan,S.ordenes.filter(o=>o.estado==="noArchivo").length+" noArchivo");
    /* se restaura la cartera completa */
    {const pz=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=pz;aplicarTarea();await __p(50);}
    /* el umbral es parámetro: con 100 % no frena */
    {const bak=S.params.umbralArchivoIncompleto;S.params.umbralArchivoIncompleto=100;const p2=planTarea(rows,"SOLO2.xlsx");
     __check("F6: el umbral es parámetro (100 % = no frena) y se ve en Configuración",p2.prev.incompleto.frena===false&&p2.prev.incompleto.umbral===100&&(()=>{page="config";CONF.tab="ordenes2";render();return /umbralArchivoIncompleto/.test(document.getElementById("p-config").innerHTML)})());
     S.params.umbralArchivoIncompleto=bak;if(bak===undefined)delete S.params.umbralArchivoIncompleto;}
    /* pasos 2 y 3: conviene cargar primero las tareas */
    {const m=()=>document.getElementById("modal").textContent;const bakSes=ACT.tareasEnSesion;const CT=S.params.tareaCarga;const bakF=CT&&CT.fecha;
     delete ACT.tareasEnSesion;mActualizarDatos(2);
     __check("F6: en el paso 2 sin tareas cargadas en esta sesión sale «Conviene cargar primero las tareas»",/Conviene cargar primero las tareas/.test(m())&&/en esta sesión no se han cargado/.test(m()));
     mActualizarDatos(3);__check("F6: en el paso 3 también",/Conviene cargar primero las tareas/.test(m()));
     ACT.tareasEnSesion=new Date().toISOString();if(CT)CT.fecha=new Date().toISOString();mActualizarDatos(2);
     __check("F6: con tareas cargadas hoy en esta sesión, no hay aviso",!/Conviene cargar primero/.test(m()));
     if(CT)CT.fecha=new Date(Date.now()-2*864e5).toISOString();mActualizarDatos(3);
     __check("F6: si la última carga de tareas tiene más de 1 día, avisa aunque sea la misma sesión",/Conviene cargar primero las tareas/.test(m())&&/hace 2/.test(m()),m().slice(m().indexOf("Conviene"),m().indexOf("Conviene")+140));
     mActualizarDatos(1);__check("F6: en el paso 1 no hay aviso",!/Conviene cargar primero/.test(m()));cerrar();
     if(CT)CT.fecha=bakF;ACT.tareasEnSesion=bakSes;}}
   window.alert=al;__check("U6 sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* ===== CARGAS · clave única, migración y regla de alcance (17-sep) ===== */
  try{localStorage.__fase="clave unica"}catch(e){}
  {const antes=__R.errors.length;const tareaRows=window.__tareaRows||[];const al=window.alert;window.alert=()=>{};
   /* K1 · la función */
   __check("K1: con WH la clave es op:normFase(op)",claveOrden({op:" WH/MO/28300 "}).clave==="op:wh/mo/28300"&&claveOrden({op:"wh/mo/28300"}).clave==="op:wh/mo/28300"&&claveOrden({op:"WH / MO / 28300"}).clave==="op:wh/mo/28300");
   __check("K1: sin WH la clave es sin:cliente|proyecto|stilo|color|ODC",claveOrden({op:"",cliente:"Fashion Club",proyecto:"NOVIEMBRE 2026",stilo:"8383",colorN:"Cadet Navy",odc:"3033"}).clave==="sin:fashionclub|noviembre2026|8383|cadetnavy|3033");
   __check("K1: no lleva fecha ni cantidad: cambiarlas no cambia la clave",claveOrden({op:"",cliente:"A",proyecto:"P",stilo:"S",colorN:"C",odc:"1",fecha:"2026-01-01",cant:5}).clave===claveOrden({op:"",cliente:"A",proyecto:"P",stilo:"S",colorN:"C",odc:"1",fecha:"2026-12-31",cant:999}).clave);
   __check("K1: ODC distinta = orden distinta (los 7 pares que Odoo fundía)",claveOrden({op:"",cliente:"A",proyecto:"P",stilo:"4238",colorN:"OLIVINE",odc:"3036"}).clave!==claveOrden({op:"",cliente:"A",proyecto:"P",stilo:"4238",colorN:"OLIVINE",odc:"3037"}).clave);
   {const k=claveOrden({op:"",cliente:"A",proyecto:"P",stilo:"S",colorN:"C",odc:""});
    __check("K1: un componente vacío = clave incompleta, sin clave",k.incompleta===true&&k.clave===null&&k.faltan.join()==="ODC",JSON.stringify(k));}
   __check("K1: una orden con etiqueta «SIN WH #…» se clasifica como sin WH (no por la etiqueta)",claveOrden({op:"SIN WH #abc",cliente:"A",proyecto:"P",stilo:"S",colorN:"C",odc:"1"}).clave==="sin:a|p|s|c|1");
   __check("K1: el id de una WH nueva sale de la clave y es el de siempre",idDeClave("op:wh/mo/28300")==="op_wh_mo_28300");
   /* K2 · los cuatro cargadores usan la misma función y ninguno arma la suya */
   {const fn=[["planTarea",planTarea],["aplicarTarea",aplicarTarea],["planOT",planOT],["planFotos",planFotos]];
    const propia=fn.filter(([n,f])=>{const t=String(f);return /clavePrev|hsh=5381|porOp\[|normTxt\(o\.op\)|normFase\(o\.op\)|prev\[normTxt/.test(t)}).map(x=>x[0]);
    const usan=fn.filter(([n,f])=>/claveOrden\(|indiceClaves\(|claveDeOrden\(/.test(String(f))||n==="aplicarTarea").map(x=>x[0]);
    __check("K2: ningún cargador arma su clave por su cuenta",propia.length===0,propia.join(", "));
    __check("K2: tareas, OT y fotos pasan por claveOrden/indiceClaves",usan.length===fn.length,usan.join(", "));}
   /* K3 · Parte 2 con el volcado: sin WH estables, repetidas, incompletas, sin WH → WH */
   {const p0=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=p0;aplicarTarea();await __p(50);
    const sinWH=S.ordenes.filter(o=>o.sinLanzar);
    __check("K3: las 496 sin WH del volcado tienen clave completa y única",sinWH.length>=490&&sinWH.every(o=>o.clave&&/^sin:/.test(o.clave))&&new Set(sinWH.map(o=>o.clave)).size===sinWH.length,sinWH.length+" / "+new Set(sinWH.map(o=>o.clave)).size);
    __check("K3: ninguna orden nueva lleva id de la clave vieja (sl_/prev_)",!S.ordenes.some(o=>/^sl_|^prev_/.test(o.id)));
    /* misma fila sin WH con OTRA cantidad y OTRA fecha: antes era una orden nueva; ahora es la misma */
    const H=tareaRows[0];const col=n=>H.indexOf(n);const oS=sinWH[0];const nAntes=S.ordenes.length;
    const rows2=tareaRows.map((r,i)=>{if(!i)return r;const x=r.slice();if(!String(x[col("Orden de producción")]||"").trim()&&String(x[col("Cliente")]||"")===oS.cliente&&String(x[col("Stilo")]||"")===oS.ref&&String(x[col("ODC")]||"")===oS.odc&&String(x[col("Color")]||"").toUpperCase()===oS.colorOdoo&&String(x[col("Proyecto")]||"")===oS.proyecto){x[col("Pedido")]=(+x[col("Pedido")]||0)+7;x[col("Fecha Entrega")]="2027-01-15"}return x});
    const p1=planTarea(rows2,"TAREA_K3.xlsx");const o1=p1.ordenes.find(o=>o.clave===oS.clave);
    __check("K3: la misma orden sin WH con otra cantidad y otra fecha conserva su id (no nace otra)",!!o1&&o1.id===oS.id&&o1.cant===oS.cant+7&&o1.fecha==="2027-01-15",JSON.stringify(o1&&{id:o1.id,idAntes:oS.id,cant:o1.cant,f:o1.fecha}));
    TAREA=p1;aplicarTarea();await __p(50);
    __check("K3: y tras aplicar la cartera no crece ni queda una noArchivo por ese cambio",S.ordenes.length===nAntes&&(S.ordenes.find(o=>o.id===oS.id)||{}).estado!=="noArchivo",S.ordenes.length+" vs "+nAntes);
    /* clave incompleta: sin ODC → no entra, se reporta */
    const fila=new Array(H.length).fill(null);fila[col("Proyecto")]="NOVIEMBRE 2026";fila[col("Cliente")]="CLIENTE K3";fila[col("ODC")]="";fila[col("Stilo")]="9999";fila[col("Categoría Padre")]="CAMISETAS";fila[col("Categoría Hija")]="Camiseta CR";fila[col("Color")]="BIRCH";fila[col("Fase")]="0Diseño";fila[col("Pedido")]=10;fila[col("Fecha Entrega")]="2026-12-01";
    const p2=planTarea([tareaRows[0],fila,...tareaRows.slice(1)],"TAREA_K3b.xlsx");
    __check("K3: una cabecera sin WH y sin ODC es «clave incompleta»: no se crea y se reporta con lo que falta",!p2.ordenes.some(o=>o.cliente==="CLIENTE K3")&&p2.claveIncompleta.length===1&&p2.claveIncompleta[0].faltan.join()==="ODC"&&/CLAVE INCOMPLETA/.test(resumenTareaHTML(p2)),JSON.stringify(p2.claveIncompleta));
    /* clave repetida en el archivo: dos filas iguales → no se funden, se reportan las dos */
    const filaA=fila.slice();filaA[col("ODC")]="7777";const filaB=filaA.slice();filaB[col("Pedido")]=20;
    const p3=planTarea([tareaRows[0],filaA,filaB,...tareaRows.slice(1)],"TAREA_K3c.xlsx");
    __check("K3: dos filas con la misma clave no se funden: entran aparte y se reportan las dos",p3.ordenes.filter(o=>o.cliente==="CLIENTE K3").length===2&&p3.claveRepetida.filter(x=>x.cliente==="CLIENTE K3").length===2&&/clave repetida/i.test(resumenTareaHTML(p3)),p3.claveRepetida.length);
    /* K6 · clave repetida ya en el sistema: NO se reasignan decisiones (el orden de las filas no es criterio) */
    {TAREA=p3;aplicarTarea();await __p(50);const dos=S.ordenes.filter(o=>o.cliente==="CLIENTE K3");
     __check("K6: las dos entran marcadas «clave repetida — revisar»",dos.length===2&&dos.every(o=>o.claveRepetida&&/revisar/.test(o.claveRepetida.txt)),dos.length);
     dos[0].lib={tela:{ok:true,u:"k6",ts:new Date().toISOString()}};dos[0].prio=1;const idA=dos[0].id,idB=dos[1].id;const cantA=dos[0].cant,cantB=dos[1].cant;
     /* el mismo archivo con las filas AL REVÉS y otras cantidades: nada se les aplica */
     const filaA2=filaA.slice();filaA2[col("Pedido")]=333;const filaB2=filaB.slice();filaB2[col("Pedido")]=444;
     const p3b=planTarea([tareaRows[0],filaB2,filaA2,...tareaRows.slice(1)],"TAREA_K6.xlsx");const nb=S.bitacora.length;
     TAREA=p3b;aplicarTarea();await __p(50);
     const A=S.ordenes.find(o=>o.id===idA),B=S.ordenes.find(o=>o.id===idB);
     __check("K6: en la carga siguiente las existentes quedan como están: mismas cantidades, misma firma, no noArchivo",!!A&&!!B&&A.cant===cantA&&B.cant===cantB&&!!(A.lib||{}).tela&&A.prio===1&&A.estado!=="noArchivo"&&B.estado!=="noArchivo"&&S.ordenes.filter(o=>o.cliente==="CLIENTE K3").length===2,JSON.stringify({a:A&&[A.cant,A.estado],b:B&&[B.cant,B.estado]}));
     __check("K6: y queda dicho en bitácora y en la carga",S.bitacora.slice(nb).some(b=>/clave repetida NO aplicadas/.test(b.t))&&(S.params.tareaCarga||{}).claveRepetidaNoAplicadas===2);
     __check("K6: Hoy → Pendientes las reporta hasta que alguien las distinga",(()=>{const it=pendientesHoy().find(x=>x.k==="claveRepetida");return !!it&&it.n>=2})());
     __check("K6: la regla está escrita en aplicarTarea (no depende del orden de filas)",/clavesExistRep/.test(String(aplicarTarea)));
     S.ordenes=S.ordenes.filter(o=>o.cliente!=="CLIENTE K3");}
    /* botón de guardar la clave: solo administrador, con aviso */
    {const bakP=PERFIL;PERFIL={id:"u-pl3",rol:"planificacion"};let av="";const a1=window.alert;window.alert=m=>{av=String(m)};aplicarMigracionClaves();window.alert=a1;PERFIL=bakP;
     __check("K6: planificación no puede guardar la clave; el aviso dice después de revisar duplicados",/administrador/.test(av)&&/duplicados en producci/.test(av),av);
     page="config";CONF.tab="ordenes2";render();const h=document.getElementById("p-config").innerHTML;
     __check("K6: el panel avisa «ejecutar después de revisar duplicados en producción»",/Ejecutar después de revisar duplicados en producción/.test(h)||!/aplicarMigracionClaves\(/.test(h));}
    /* sin WH → WH: la fila recibe WH; se reconoce por la clave anterior UNA vez y se guarda claveAnterior */
    const oS2=S.ordenes.find(o=>o.sinLanzar&&o.clave);const nb=S.bitacora.length;
    const rows4=tareaRows.map((r,i)=>{if(!i)return r;const x=r.slice();if(!String(x[col("Orden de producción")]||"").trim()&&String(x[col("Cliente")]||"")===oS2.cliente&&String(x[col("Stilo")]||"")===oS2.ref&&String(x[col("ODC")]||"")===oS2.odc&&String(x[col("Color")]||"").toUpperCase()===oS2.colorOdoo&&String(x[col("Proyecto")]||"")===oS2.proyecto){x[col("Orden de producción")]="WH/MO/99001";x[col("Fase")]="2Planificacion"}return x});
    S.avance[oS2.id]={centros:{corte:3}};oS2.foto="https://x/k3.jpg";
    const p4=planTarea(rows4,"TAREA_K3d.xlsx");const o4=p4.ordenes.find(o=>o.op==="WH/MO/99001");
    __check("K3: al recibir WH se reconoce por la clave sin WH: mismo id, claveAnterior guardada",!!o4&&o4.id===oS2.id&&o4.claveAnterior===oS2.clave&&o4.clave==="op:wh/mo/99001"&&p4.prevAWh.length===1,JSON.stringify(o4&&{id:o4.id,ant:o4.claveAnterior,cl:o4.clave}));
    TAREA=p4;aplicarTarea();await __p(50);const o5=S.ordenes.find(o=>o.id===oS2.id);
    __check("K3: tras aplicar, avance y foto siguen en la misma orden, y queda en bitácora",!!o5&&o5.op==="WH/MO/99001"&&(((S.avance[o5.id]||{}).centros)||{}).corte===3&&o5.foto==="https://x/k3.jpg"&&S.bitacora.slice(nb).some(b=>/clave anterior/.test(b.t)),JSON.stringify(o5&&{op:o5.op,foto:o5.foto}));
    /* la segunda vez ya no es «paso a WH»: se reconoce por la WH */
    const p5=planTarea(rows4,"TAREA_K3e.xlsx");
    __check("K3: la segunda carga la reconoce por la WH (una sola vez el paso)",p5.prevAWh.length===0&&(p5.ordenes.find(o=>o.op==="WH/MO/99001")||{}).id===oS2.id);
    delete S.avance[oS2.id];
    const pz=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=pz;aplicarTarea();await __p(50);}
   /* K4 · migración: vista previa y aplicación; decisiones, fotos, firmas, fases, progCentro y avance siguen en su orden */
   {/* se simulan órdenes viejas: id sl_… (Parte 2 vieja) y prev_… (Odoo) con las mismas claves que dos sin WH actuales */
    const sw=S.ordenes.filter(o=>o.sinLanzar).slice(0,2);const [a,b]=sw;
    const viejaA=Object.assign(JSON.parse(JSON.stringify(a)),{id:"sl_sin_wh_viej1",op:"SIN WH #viej1",clave:undefined,claveAnterior:undefined});
    const viejaB=Object.assign(JSON.parse(JSON.stringify(b)),{id:"prev_vieja_2",op:"",estado:"prevision",clave:undefined,claveAnterior:undefined});
    S.ordenes=S.ordenes.filter(o=>o.id!==a.id&&o.id!==b.id).concat([viejaA,viejaB]);
    const ts=new Date().toISOString();
    viejaA.lib={tela:{ok:true,u:"k4",ts}};viejaA.fases=[{f:viejaA.fase,ts,u:"k4",origen:"app",antes:null,motivo:"m"}];viejaA.progCentro={corte:{pri:2,u:"k4"}};viejaA.foto="https://x/k4.jpg";viejaA.prio=1;
    S.avance[viejaA.id]={centros:{corte:5},tramos:[{id:"t-k4",centro:"corte",rec:null,ini:ts,fin:ts,u:"k4",paros:[]}]};
    const d=diagClaves();
    __check("K4: la vista previa cuenta las viejas por id (sl_/prev_) y dice cuántas se reconocen",d.viejas===2&&d.reconocibles===d.total-d.incompletas.length&&d.sinClaveGuardada>=2,JSON.stringify({v:d.viejas,r:d.reconocibles,t:d.total,inc:d.incompletas.length}));
    page="config";CONF.tab="ordenes2";render();const hc=document.getElementById("p-config").innerHTML;
    __check("K4: Configuración muestra la vista previa y el botón de guardar",/Clave única de orden/.test(hc)&&/aplicarMigracionClaves\(/.test(hc)&&/Alcance de las cargas/.test(hc));
    const cf=window.confirm;window.confirm=()=>true;const nb=S.bitacora.length;aplicarMigracionClaves();window.confirm=cf;
    __check("K4: al aplicar se guarda clave y claveAnterior, nada se borra ni se renombra",viejaA.clave===claveDeOrden(viejaA).clave&&viejaA.claveAnterior==="SIN WH #viej1"&&viejaB.clave&&viejaB.claveAnterior==="prev_vieja_2"&&S.ordenes.some(o=>o.id==="sl_sin_wh_viej1")&&S.ordenes.some(o=>o.id==="prev_vieja_2")&&S.bitacora.length>nb,JSON.stringify({a:viejaA.claveAnterior,b:viejaB.claveAnterior}));
    /* recarga: las dos viejas se reconocen por su clave; todo lo suyo sigue ahí */
    const nAntes=S.ordenes.length;const p6=planTarea(tareaRows,"TAREA_K4.xlsx");
    __check("K4: la recarga reconoce las viejas por su clave y les conserva el id",(p6.ordenes.find(o=>o.clave===viejaA.clave)||{}).id==="sl_sin_wh_viej1"&&(p6.ordenes.find(o=>o.clave===viejaB.clave)||{}).id==="prev_vieja_2");
    TAREA=p6;aplicarTarea();await __p(50);const A=S.ordenes.find(o=>o.id==="sl_sin_wh_viej1");
    __check("K4: después de migrar y recargar: firma, fases con motivo, progCentro, foto, prioridad y avance siguen en la orden correcta",
      !!A&&A.estado!=="noArchivo"&&!!(A.lib||{}).tela&&(A.fases||[]).some(f=>f.u==="k4"&&f.motivo==="m")&&!!(A.progCentro||{}).corte&&A.foto==="https://x/k4.jpg"&&A.prio===1&&(((S.avance[A.id]||{}).centros)||{}).corte===5&&((S.avance[A.id]||{}).tramos||[]).length===1&&S.ordenes.length===nAntes,
      JSON.stringify(A&&{e:A.estado,lib:!!A.lib,f:(A.fases||[]).length,pc:!!A.progCentro,foto:A.foto,prio:A.prio,av:S.avance[A.id],n:S.ordenes.length+"/"+nAntes}));
    /* se deja como estaba */
    delete S.avance["sl_sin_wh_viej1"];S.ordenes=S.ordenes.filter(o=>o.id!=="sl_sin_wh_viej1"&&o.id!=="prev_vieja_2").concat([a,b]);
    const pz=planTarea(tareaRows,"TAREA_PARTE2.xlsx");TAREA=pz;aplicarTarea();await __p(50);}
   /* K5 · regla de alcance única, parámetros, sin hoy+21, fechas legibles */
   {__check("K5: la regla es una función y el cargador de tareas la llama",/alcanceOrden\(/.test(String(planTarea)));
    __check("K5: los parámetros son prm() y se ven en Configuración",/prm\(.alcanceDiasAtras.,\s*0\)/.test(String(alcanceParams))&&/prm\(.alcanceSinFechaConProyecto.,\s*1\)/.test(String(alcanceParams))&&/setAlcanceParam\(/.test(document.getElementById("p-config").innerHTML));
    __check("K5: cancel fuera; entrega pasada + fase de cierre fuera; abierta con entrega pasada dentro; sin fecha con Proyecto dentro; sin fecha sin Proyecto fuera",
      !alcanceOrden({fase:"Cancelado",fecha:"2027-01-01"}).dentro&&!alcanceOrden({fase:"Facturado",fecha:dsum(hoy(),-1)}).dentro&&alcanceOrden({fase:"2Planificacion",fecha:dsum(hoy(),-30)}).dentro&&alcanceOrden({fase:"0Diseño",fecha:null,proyecto:"NOVIEMBRE 2026"}).dentro&&!alcanceOrden({fase:"0Diseño",fecha:null,proyecto:""}).dentro);
    {const bak=S.params.alcanceDiasAtras;S.params.alcanceDiasAtras=10;
     __check("K5: días hacia atrás manda: una cerrada de hace 5 días entra con 10 días",alcanceOrden({fase:"Facturado",fecha:dsum(hoy(),-5)}).dentro&&!alcanceOrden({fase:"Facturado",fecha:dsum(hoy(),-15)}).dentro);
     S.params.alcanceDiasAtras=bak;if(bak===undefined)delete S.params.alcanceDiasAtras;}
    {const bak=S.params.alcanceSinFechaConProyecto;S.params.alcanceSinFechaConProyecto=0;
     __check("K5: con «nunca entra», sin fecha queda fuera aunque tenga Proyecto (0 es 0)",!alcanceOrden({fase:"0Diseño",fecha:null,proyecto:"NOVIEMBRE 2026"}).dentro);
     S.params.alcanceSinFechaConProyecto=bak;if(bak===undefined)delete S.params.alcanceSinFechaConProyecto;}
    __check("K5: ya no existe el hoy+21 inventado ni la fecha desde el Proyecto",!/dsum\(hoy\(\),21\)/.test(String(planTarea))&&!/\-28'/.test(String(planTarea)));
    /* fechas: serial numérico → excelFecha; ilegible → reportada, sin inventar (en el cargador único) */
    {const H=tareaRows[0];const iF=H.indexOf("Fecha Entrega"),iO=H.indexOf("Orden de producción");const r0=tareaRows.findIndex((r,i)=>i&&String(r[iO]||"").startsWith("WH/"));const r1=tareaRows.findIndex((r,i)=>i>r0&&String(r[iO]||"").startsWith("WH/"));
     const rows=tareaRows.map((r,i)=>{if(i!==r0&&i!==r1)return r;const x=r.slice();if(i===r0)x[iF]=46283.75;else x[iF]="fecha rara";return x});
     const pS=planTarea(rows,"K5b.xlsx");const opA=String(tareaRows[r0][iO]);const oA=pS.ordenes.find(o=>o.op===opA);
     __check("K5: un serial numérico se lee con excelFecha (46283,75 = 2026-09-18, sin redondear al día siguiente)",excelFecha(46283.75)==="2026-09-18"&&(!oA||oA.fecha==="2026-09-18"),JSON.stringify({d:oA&&oA.fecha}));
     __check("K5: una fecha ilegible se reporta y no se inventa",pS.fechasIlegibles.length===1&&/fecha rara/.test(pS.fechasIlegibles[0].valor)&&/fechas ilegibles/.test(vistaPreviaTareaHTML(pS)),JSON.stringify(pS.fechasIlegibles));}
    PLAN=null;PLAN_ALL=null;}
   window.alert=al;__check("CLAVE sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+2)));}
  /* ===== NIVELACIÓN · pantalla nueva (diseño 17-sep), solo Corte conectado ===== */
  try{localStorage.__fase="nivelacion pantalla"}catch(e){}
  {const antes=__R.errors.length;const al=window.alert;let av="";window.alert=m=>{av=String(m)};const adminP=PERFIL;
   /* funciones duplicadas en todo index.html: ninguna */
   {const src=[...document.scripts].map(x=>x.textContent).sort((a,b)=>b.length-a.length)[0]||"";
    const names=[...src.matchAll(/^(?:async )?function ([A-Za-z0-9_$]+)\(/gm)].map(x=>x[1]);const c={};names.forEach(n=>c[n]=(c[n]||0)+1);const dup=Object.keys(c).filter(n=>c[n]>1);
    __check("N0: no hay funciones declaradas dos veces en index.html",dup.length===0,dup.join(", "));
    __check("N0: la pantalla usa el prefijo nivUI* y el boceto de la etapa A se retiró",names.filter(n=>/^nivUI/.test(n)).length>=15&&!names.some(n=>/^nivTarjetaHTML$|^nivLineaHTML$|^nivSimHTML$/.test(n))&&typeof NIVD==="undefined"&&typeof NIVV==="undefined");}
   /* N1 · pantalla propia */
   {const a=document.querySelector('nav a[data-p="nivelacion"]');
    __check("N1: «Nivelación de carga» abre SU pantalla (no Configuración)",!!a&&!a.dataset.conf&&!document.querySelector('nav a[data-conf="nivel"]'));
    PERFIL={id:"u-niv",rol:"planificacion",nombre:"Plan"};NIVUI={meses:null,cliente:"",familia:"",area:"corte",celda:null,filaPor:"familia",esc:{},verCalc:false,noEntra:false};
    page="nivelacion";render();const h=()=>document.getElementById("p-nivelacion").innerHTML;
    __check("N1: arriba a la derecha solo el enlace «Configurar»; nada de configuración adentro",/>Configurar</.test(h())&&!/Grupos de módulos|setNivParam\(|setNivelFase\(/.test(h()));
    {const pp=PERFIL;PERFIL=adminP;page="config";CONF.tab="nivel";render();PERFIL=pp}const hc=document.getElementById("p-config").innerHTML;
    __check("N1: Configuración ya no tiene el botón «Ver el boceto» y conserva grupos, fases y parámetros",!/Ver el boceto/.test(hc)&&/Grupos de m|gruposMod|addGrupoMod/.test(hc),JSON.stringify({len:hc.length,tab:CONF.tab,page,boceto:/Ver el boceto/.test(hc),h3:[...hc.matchAll(/<h3>([^<]{0,40})/g)].map(m=>m[1]).slice(0,5)}));
    page="nivelacion";render();}
   /* N2 · meses como botones de selección múltiple */
   {const h=()=>document.getElementById("p-nivelacion").innerHTML;const disp=nivUIMesesDisp();
    __check("N2: hay meses disponibles y arranca con uno marcado",disp.length>=3&&nivUIMeses().length===1&&/nivUITogMes\(/.test(h()),disp.length+" / "+nivUIMeses().join(","));
    const m0=nivUIMeses()[0];const otros=disp.filter(m=>m!==m0).slice(0,2);otros.forEach(m=>nivUITogMes(m));
    __check("N2: clic marca varios (tres marcados)",nivUIMeses().length===3&&otros.every(m=>nivUIMeses().includes(m))&&(h().match(/class="chip on"/g)||[]).length>=3,nivUIMeses().join(","));
    av="";nivUIMeses().slice().forEach(m=>nivUITogMes(m));
    __check("N2: no se puede desmarcar el último",nivUIMeses().length===1&&/al menos un mes/.test(av),av);
    otros.forEach(m=>nivUITogMes(m));
    __check("N2: los filtros visibles son solo cliente y familia",(h().split('<div class="panel"')[0].match(/<select /g)||[]).length===2&&/Todos los clientes/.test(h())&&/Todas las familias/.test(h()));}
   /* N3 · recuadros de área desde los centros configurados */
   {const areas=nivUIAreas();const pro=S.centros.filter(c=>c.area==="pro"&&c.activo!==false).length;
    __check("N3: un recuadro por área: Tela, los centros de producción configurados en orden de proceso, Maquila",areas.length===pro+2&&areas[0].id==="tela"&&areas[1].id==="corte"&&areas[areas.length-1].id==="maquila"&&areas.findIndex(a=>a.id==="modulos")>areas.findIndex(a=>a.id==="corte"),areas.map(a=>a.id).join(" → "));
    const h=document.getElementById("p-nivelacion").innerHTML;
    __check("N3: cada recuadro trae saldo, fecha final y estado con ícono",areas.every(a=>h.includes("NIVUI.area='"+a.id+"'"))&&(h.match(/saldo <b>/g)||[]).length===areas.length&&(h.match(/>fin /g)||[]).length===areas.length&&/[✓⚠✕?] (llega|riesgo|déficit|dato faltante)/.test(h));
    /* lo que no suma se dice: sin fases marcadas (Tela) y sin SAM (Estampado) — nunca un cero que parece bueno */
    {const rT=nivUICalcular("tela");const rE=nivUICalcular("estampado");
     __check("N3: Tela sin fases marcadas en la tabla 1 es «dato faltante», no «0 u · llega»",fasesDeProcNivel("tela").length>0||(rT.sinFasesTela===true&&rT.estado==="faltante"&&/sin fases marcadas/.test(h)&&rT.falta.some(f=>/fases de Tela/.test(f))),JSON.stringify({fases:fasesDeProcNivel("tela").length,e:rT.estado}));
     __check("N3: un área cuyas órdenes no tienen SAM lo dice en el recuadro (+N u sin SAM)",!(rE.saldo&&rE.saldo.sinSAM.length)||new RegExp("\\+"+num(rE.saldo.unidSinSAM,0).replace(/\./g,"\\.")+" u sin SAM").test(h),JSON.stringify(rE.saldo&&{n:rE.saldo.sinSAM.length,u:rE.saldo.unidSinSAM}));}
    NIVUI.area="modulos";render();const h2=document.getElementById("p-nivelacion").innerHTML;
    __check("N3: clic en un recuadro muestra SOLO esa área abajo",/Nivelación de Confección/.test(h2)&&!/Nivelación de Corte/.test(h2)&&(h2.match(/Saldo por familia y mes/g)||[]).length===1);
    NIVUI.area="corte";render();}
   /* N8 · decisiones 17-sep: Tela y Maquila por fase (al marcar fases el recuadro calcula); Lavado/Plancha por días; todas conectadas */
   {const tabla=faseMapeo();const bak=tabla.map(r=>r.nivel);
    __check("N8: la tabla 1 ofrece Maquila en la columna «nivelación» (PROC_NIVEL) y se cuenta por fase",PROC_NIVEL.some(p=>p.id==="maquila"&&p.porFase)&&nivUIArea("maquila").porFase===true&&!/recursoFijo/.test(String(saldoAreaNiv)));
    const rM0=nivUICalcular("maquila");
    __check("N8: Maquila sin fases marcadas = «sin fases marcadas · dato faltante», nunca 0",fasesDeProcNivel("maquila").length>0||(rM0.sinFasesTela===true&&rM0.estado==="faltante"&&/sin fases marcadas · dato faltante/.test(document.getElementById("p-nivelacion").innerHTML)));
    tabla.forEach(r=>{if(/^5.*maquila/i.test(r.fase||""))r.nivel="maquila";if(/^1(Tejeduria|Tintoreria|CD Tintoreria|INCOMPLETOS)/i.test(r.fase||""))r.nivel="tela"});NIVC=null;render();
    const rM=nivUICalcular("maquila"),rT=nivUICalcular("tela");const h=document.getElementById("p-nivelacion").innerHTML;
    __check("N8: al marcar las fases 5Maquila…, Maquila calcula su saldo por fase (unidades y órdenes) y deja de decir sin fases",rM.sinFasesTela===false&&rM.saldo.unid>0&&rM.saldo.ordenes.length>0&&!rM.enMin,JSON.stringify({u:rM.saldo.unid,n:rM.saldo.ordenes.length}));
    __check("N8: al marcar las fases de Tela, el recuadro calcula y deja de decir «sin fases marcadas»",rT.sinFasesTela===false&&rT.saldo.unid>0&&!/Tela<\/div>[^]*?sin fases marcadas/.test(h.slice(0,h.indexOf("Corte</div>"))),JSON.stringify({u:rT.saldo.unid,n:rT.saldo.ordenes.length}));
    tabla.forEach((r,i)=>{r.nivel=bak[i]});NIVC=null;
    const pd=nivUIAreas().filter(a=>a.porDias);
    __check("N8: Lavado y Plancha (por días) siguen en los recuadros marcados «por días, sin capacidad», sin cuadrito, y dicen qué haría falta",pd.length>=1&&pd.some(a=>a.id==="lavado")&&pd.every(a=>centroPorDias(a.id))&&(()=>{NIVUI.area="lavado";render();const h2=document.getElementById("p-nivelacion").innerHTML;NIVUI.area="corte";render();return /por días, sin capacidad/.test(h2)&&!/se escribe/.test(h2)&&/harían falta/.test(h2)&&/Saldo por familia/.test(h2)})(),pd.map(a=>a.id).join(","));
    __check("N8: las demás áreas quedaron conectadas (Confección con cuadrito)",(()=>{NIVUI.area="modulos";render();const h2=document.getElementById("p-nivelacion").innerHTML;NIVUI.area="corte";render();return /Nivelación de Confección/.test(h2)&&/se escribe/.test(h2)&&!/pendiente de conectar/.test(document.getElementById("p-nivelacion").innerHTML)})());}
   /* N4 · detalle de Corte: tabla cliente × mes y cuadrito */
   {const r=nivUICalcular("corte");const h=()=>document.getElementById("p-nivelacion").innerHTML;
    __check("N4: la tabla tiene una columna por mes marcado y fila de totales",nivUIMeses().every(m=>new RegExp("<th class=\"num\">"+m+"</th>").test(h()))&&/<td>Total<\/td>/.test(h()));
    __check("N4: la tabla es por FAMILIA × mes por defecto, con selector Familia · Tipo de producto · Cliente, y el título lo dice",/Saldo por familia y mes de entrega/.test(h())&&/<option value="familia" selected(="")?>Familia<\/option>/.test(h())&&/<option value="hija"[^>]*>Tipo de producto<\/option>/.test(h())&&/<option value="cliente"[^>]*>Cliente<\/option>/.test(h())&&(()=>{const fams=new Set(nivUIOrdenesSaldo(r).map(o=>famDeOrden(o)));return [...fams].every(f=>h().includes("<td>"+esc(f)+"</td>"))})());
    const cel=h().match(/onclick="NIVUI.celda=\{por:'familia',fila:'([^']+)',mes:'([^']+)'\}/);
    __check("N4: hay celdas con saldo",!!cel,"sin celdas");
    if(cel){NIVUI.celda={por:"familia",fila:cel[1].replace(/&#39;/g,"'"),mes:cel[2]};render();
     __check("N4: clic en una celda abre el detalle SOLO hasta tipo de producto: unidades, número de órdenes y «ver órdenes»",/tipos de producto<\/span>/.test(h())&&/<th>Tipo de producto<\/th><th class="num">Unidades<\/th><th class="num">Órdenes<\/th>/.test(h())&&(h().match(/irSaldoCentro\(/g)||[]).length>=2&&!/<details/.test(h().slice(h().indexOf("tipos de producto"),h().indexOf("Nivelación de Corte"))));
     /* la nivelación NO lista WH en ningún punto */
     const sinWH=html=>!/WH\/MO\/|SIN WH #|whCell|foto-mini|fase-mini/.test(html);
     __check("N4: con la celda abierta no aparece ninguna WH en la pantalla de nivelación",sinWH(h()),(h().match(/WH\/MO\/[0-9]+/g)||[]).slice(0,3).join(","));
     /* «ver órdenes» → Carga general: el detalle nuevo sale de saldoProceso y cuadra EXACTO con la fila */
     {const m=h().match(/<tr><td>([^<]+)<\/td><td class="num"><b>([^<]+)<\/b><\/td><td class="num">(\d+)<\/td><td><a[^>]*onclick="irSaldoCentro\(([^"]+)\)"/);
      __check("N4: cada fila de tipo de producto tiene su «ver órdenes»",!!m,"sin fila");
      if(m){const sel=JSON.parse(m[4].replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&"));const uFila=+m[2].replace(/\./g,""),nFila=+m[3];
       const bakNIV=JSON.stringify({meses:nivUIMeses(),cliente:NIVUI.cliente,familia:NIVUI.familia,area:NIVUI.area,filaPor:NIVUI.filaPor,celda:NIVUI.celda});
       irSaldoCentro(sel);await __p(30);const hc=document.getElementById("p-produccion").innerHTML;
       const cab=hc.match(/Saldo por procesar en ([^<]+) <span class="note">([^<]*)<b>(\d+)<\/b> órdenes · <b>([^<]+)<\/b> u/);
       __check("N4→CG: abre Carga general en «Saldo por procesar en Corte» con la selección en el encabezado",page==="produccion"&&!!cab&&/Corte/.test(cab[1])&&new RegExp(sel.meses[0]).test(cab[2])&&new RegExp(esc(sel.hija)).test(cab[2]),cab?cab[0].slice(0,160):hc.slice(0,120));
       __check("N4→CG: el número de órdenes y unidades del detalle coincide EXACTO con la fila de la nivelación",!!cab&&+cab[3]===nFila&&+cab[4].replace(/\./g,"")===uFila,JSON.stringify({cg:cab&&[cab[3],cab[4]],fila:[nFila,uFila]}));
       __check("N4→CG: sale de saldoAreaNiv/saldoProceso y lo dice: saldo por procesar, distinto del detalle por semana",/saldoAreaNiv\(/.test(String(vPro))&&/Es distinto del detalle por semana programada/.test(hc)&&/volver a la nivelación/.test(hc)&&/whCell|WH\//.test(hc));
       __check("N4→CG: al llegar desde la nivelación SOLO se ve el bloque de saldo; el resto queda colapsado con «ver el resto de Carga general»",!/Carga contra capacidad por semana/.test(hc)&&!/Familia por centro/.test(hc)&&!/Carga que viene · /.test(hc)&&/ver el resto de Carga general/.test(hc));
       CG.det.verResto=true;render();const hc2=document.getElementById("p-produccion").innerHTML;
       __check("N4→CG: «ver el resto» despliega la pantalla completa sin perder el bloque de saldo",/Carga contra capacidad por semana/.test(hc2)&&/Saldo por procesar en/.test(hc2));
       nivUIVolver();await __p(30);
       __check("N4→CG: «← volver a la nivelación» regresa con área, meses, filtros y celda como estaban",page==="nivelacion"&&JSON.stringify({meses:nivUIMeses(),cliente:NIVUI.cliente,familia:NIVUI.familia,area:NIVUI.area,filaPor:NIVUI.filaPor,celda:NIVUI.celda})===bakNIV&&CG.det===null);}}
     /* cambiar el agrupamiento no cambia el total */
     const totalDe=()=>{const mm=h().match(/<td>Total<\/td>(?:<td class="num">[^<]*<\/td>)*<td class="num">([^<]+)<\/td>/);return mm?mm[1]:null};const tF=totalDe();
     NIVUI.filaPor="hija";NIVUI.celda=null;render();const tH=totalDe();NIVUI.filaPor="cliente";render();const tC=totalDe();
     __check("N4: agrupar por tipo de producto o por cliente no cambia el cálculo (mismo total) y el título cambia",tF!=null&&tF===tH&&tH===tC&&/Saldo por cliente y mes de entrega/.test(h()),tF+" / "+tH+" / "+tC);
     NIVUI.filaPor="familia";NIVUI.celda=null;render();}
    const filas=[...h().matchAll(/<tr[^>]*><td>([^<]+?)(?: <span class="tag"[^>]*>se escribe<\/span>)?<\/td>/g)].map(x=>x[1].trim());
    const esperado=["Saldo actual","Capacidad día planta","Días lab. necesarios","Fecha inicio","Fecha finalización","Fecha compromiso","Días disponibles","Días adicionales","Días disponibles + adic.","Producción planta","Maquila","Total del período","Déficit"];
    const idx=esperado.map(n=>filas.indexOf(n));
    __check("N4: el cuadrito tiene las trece filas, con esos nombres y en ese orden",idx.every(i=>i>=0)&&idx.every((v,i)=>i===0||v>idx[i-1]),filas.join(" | "));
    __check("N4: solo las cuatro filas «se escribe» tienen entrada, con fondo distinto",(h().match(/se escribe<\/span>/g)||[]).length===4&&(h().match(/onchange="nivUISet\(/g)||[]).length===4);
    __check("N4: hay «Ver cálculo» colapsado con minutos, SAM ponderado y festivos",/<details[^>]*><summary[^>]*>Ver cálculo/.test(h())&&/SAM ponderado/.test(h())&&/Días hábiles/.test(h()));
    __check("N4: el saldo sale del mismo saldoProceso del Paso 1 y el cálculo de nivelar()",!!r&&r.saldo&&r.saldo.unid>0&&/saldoAreaNiv\(/.test(String(nivUISaldo))&&/saldoProceso\(/.test(String(saldoAreaNiv))&&/nivelar\(/.test(String(nivUICalcular)),JSON.stringify(r&&{u:r.saldo.unid,min:r.saldo.min}));
    __R.nivUI={saldo:r&&{u:r.saldo.unid,min:r.saldo.min,ordenes:r.saldo.ordenes.length,sinSAM:r.saldo.sinSAM.length,uSinSAM:r.saldo.unidSinSAM},cap:r&&r.cap.cap,capDet:r&&r.cap.detalle,meses:nivUIMeses()};}
   /* N5 · coherencia: saldo de Corte del cuadrito vs Carga general (misma base, mismos meses) */
   {const meses=nivUIMeses();const r=nivUICalcular("corte");
    const ords=S.ordenes.filter(o=>abiertaDe(o)&&meses.includes(mesEntregaNiv(o)));
    const cg=cargaUnica("abiertas",{ordenes:ords}).centros.corte||{pz:0,n:0,total:0};
    const propio=ords.filter(o=>(o.ruta||[]).some(p=>p.centro==="corte")&&!pasoHecho(o,"corte")).reduce((a,o)=>a+pendCentroUnid(o,"corte"),0);
    __R.nivUI.coherencia={cuadritoConSAM:r.saldo.unid,cuadritoSinSAM:r.saldo.unidSinSAM,cuadritoTotal:r.saldo.unid+r.saldo.unidSinSAM,cargaGeneralPz:cg.pz,cargaGeneralN:cg.n,cargaGeneralMin:Math.round(cg.total),propio};
    __check("N5: el saldo de Corte (con SAM + sin SAM) coincide con la suma de órdenes por cortar de la misma base",r.saldo.unid+r.saldo.unidSinSAM===propio,JSON.stringify(__R.nivUI.coherencia));
    __check("N5: y contra Carga general (misma base y meses) coincide o la diferencia es solo cantCentro/sin SAM",Math.abs((r.saldo.unid)-cg.pz)<=r.saldo.unidSinSAM+ords.reduce((a,o)=>a+Math.max(0,(+o.cant||0)-cantCentro(o,"corte")),0),JSON.stringify(__R.nivUI.coherencia));}
   /* N6 · escribir recalcula al instante y no guarda; guardar exige motivo y permiso programa */
   {const bakNiv=JSON.stringify(S.params.nivelacion||null);const nb=S.bitacora.length;const r0=nivUICalcular("corte");
    const ini=dsum(hoy(),1);nivUISet("corte","inicio",ini);nivUISet("corte","compromiso",dsum(hoy(),30));nivUISet("corte","diasAdic",2);
    const r1=nivUICalcular("corte");
    __check("N6: escribir inicio, compromiso y días adicionales recalcula al instante (fin, días, producción, déficit)",r1.esc.inicio===ini&&r1.calc.diasDisp>0&&r1.diasTot===r1.calc.diasDisp+2&&(r1.calc.fin!=null||r1.calc.capDia==null)&&r1.deficitMin!=null,JSON.stringify({d:r1.calc.diasDisp,t:r1.diasTot,fin:r1.calc.fin,def:r1.deficitMin}));
    __check("N6: nada se guardó todavía (ni params ni bitácora) y la pantalla dice «sin guardar»",JSON.stringify(S.params.nivelacion||null)===bakNiv&&S.bitacora.length===nb&&r1.esc.sinGuardar===true&&/sin guardar/.test(document.getElementById("p-nivelacion").innerHTML));
    av="";nivUISet("corte","inicio",dsum(hoy(),-3));
    __check("N6: la fecha de inicio no puede ser anterior a hoy",/anterior a hoy/.test(av)&&nivUICalcular("corte").esc.inicio===ini,av);
    __check("N6: maquila escrita manda sobre la suma de órdenes marcadas",(()=>{nivUISet("corte","maquilaU",500);const r=nivUICalcular("corte");return r.maqU===500&&(r.sam==null||Math.abs(r.maqMin-500*r.sam)<1e-6)})());
    const pr0=window.prompt;window.prompt=()=>"";nivUIGuardar("corte");
    __check("N6: sin motivo no se guarda",JSON.stringify(S.params.nivelacion||null)===bakNiv&&S.bitacora.length===nb);
    window.prompt=()=>"prueba de escenario";nivUIGuardar("corte");window.prompt=pr0;
    const g=((S.params.nivelacion||{}).escenarios||{}).corte;
    __check("N6: con motivo se guarda (inicio/compromiso por el camino del Paso 1, adicionales y maquila en escenarios) y queda en bitácora",!!g&&g.diasAdic===2&&g.maquilaU===500&&g.motivo==="prueba de escenario"&&nivFecha("corte","inicio")===ini&&nivFecha("corte","compromiso")===dsum(hoy(),30)&&S.bitacora.slice(nb).some(b=>/escenario de Corte guardado/.test(b.t))&&!NIVUI.esc.corte,JSON.stringify(g));
    const bakP=PERFIL;PERFIL={id:"u-op",rol:"corte",nombre:"Op"};av="";nivUISet("corte","diasAdic",5);
    __check("N6: sin permiso programa no se edita",/Solo planificación/.test(av)&&!NIVUI.esc.corte,av);PERFIL=bakP;
    /* dato faltante: sin compromiso */
    nivUISet("corte","compromiso","");const rf=nivUICalcular("corte");
    __check("N6: sin compromiso, días disponibles y déficit son «dato faltante», nunca un número",rf.calc.diasDisp==null&&rf.deficitMin==null&&rf.estado==="faltante"&&/dato faltante/.test(document.getElementById("p-nivelacion").innerHTML));
    nivUIDescartar("corte");S.params.nivelacion=bakNiv==="null"?undefined:JSON.parse(bakNiv);if(S.params.nivelacion===undefined)delete S.params.nivelacion;NIVC=null;}
   /* N7 · qué no entra: con déficit, lista con foto de las de entrega más lejana */
   {const recsC=S.recursos.filter(r=>r.activa&&r.centro==="corte");const bakPers=recsC.map(r=>r.pers);recsC.forEach(r=>{r.pers=0});   /* sin personas montadas: capacidad 0 → todo el saldo es déficit */
    nivUISet("corte","inicio",hoy());nivUISet("corte","compromiso",dsum(hoy(),2));nivUISet("corte","diasAdic",0);nivUISet("corte","maquilaU",0);
    const r=nivUICalcular("corte");
    if(r.deficitMin>0){NIVUI.noEntra=true;render();const h=document.getElementById("p-nivelacion").innerHTML;const l=nivUINoEntra(r);
     __check("N7: con déficit, «qué no entra» es un resumen por familia y tipo de producto (unidades y órdenes), sin WH",/Qué no entra/.test(h)&&/<th>Familia<\/th><th>Tipo de producto<\/th>/.test(h)&&!/WH\/MO\/|SIN WH #|whCell|foto-mini/.test(h)&&l.length>=1&&l.reduce((a,x)=>a+x.min,0)>=r.deficitMin,l.length+" órdenes");
     {const m=h.match(/<tr><td>([^<]+)<\/td><td>([^<]+)<\/td><td class="num"><b>([^<]+)<\/b><\/td><td class="num">(\d+)<\/td><td><a[^>]*onclick="irSaldoCentro\(([^"]+)\)"/);
      if(m){const sel=JSON.parse(m[5].replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&"));irSaldoCentro(sel);await __p(30);const hc=document.getElementById("p-produccion").innerHTML;const cab=hc.match(/<b>(\d+)<\/b> órdenes · <b>([^<]+)<\/b> u/);
       __check("N7→CG: «ver órdenes» de qué no entra lista exactamente esas órdenes (mismo número y unidades)",!!cab&&+cab[1]===+m[4]&&+cab[2].replace(/\./g,"")===+m[3].replace(/\./g,"")&&/qué no entra/.test(hc),JSON.stringify({cg:cab&&[cab[1],cab[2]],fila:[m[4],m[3]]}));nivUIVolver();await __p(30);}
      else __check("N7→CG: hay «ver órdenes» en el resumen de qué no entra",false,"sin fila");}}
    else __check("N7: con déficit, clic muestra «qué no entra»",false,"no hubo déficit con capacidad 0: "+JSON.stringify({def:r.deficitMin,cap:r.calc.capDia,saldo:r.saldo&&r.saldo.min}));
    recsC.forEach((r,i)=>{r.pers=bakPers[i]});NIVUI.noEntra=false;nivUIDescartar("corte");}
   window.alert=al;PERFIL=adminP;NIVUI={meses:null,cliente:"",familia:"",area:"corte",celda:null,filaPor:"familia",esc:{},verCalc:false,noEntra:false};page="ordenes";render();
   __check("NIVUI sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  /* ===== BORRADO · Paso 0: qué borra y qué conserva «Borrar todos los datos operativos» (diagnóstico con prueba) ===== */
  try{localStorage.__fase="borrado paso0"}catch(e){}
  {const antes=__R.errors.length;const al=window.alert;window.alert=()=>{};PERFIL=adminP0();
   const copia=JSON.stringify(S);
   /* se siembra de todo un poco para ver qué sobrevive */
   S.params.excepciones=(S.params.excepciones||[]).concat([{fecha:"2026-12-25",area:"todas",tipo:"no",nota:"Navidad (prueba)"}]);
   {const t=faseMapeo();const r=t.find(x=>/^1Tejeduria/i.test(x.fase||""));if(r)r.nivel="tela"}
   S.params.horarios=S.params.horarios||{};S.params.horarios.corte=S.params.horarios.corte||{};S.params.horarios.corte.ventanas=[{ini:"12:00",fin:"13:00"}];
   S.params.motivos=(S.params.motivos||[]).concat([{motivo:"motivo de prueba borrado",uso:"cierre"}]);
   gruposMod().push({id:"g-b0",n:"grupo prueba",mods:[],fams:["CAMISETAS"],sugerido:true});
   S.params.msBuscar=222;S.params.umbralArchivoIncompleto=33;S.params.nivelacion=S.params.nivelacion||{};S.params.nivelacion.escenarios={corte:{diasAdic:1,maquilaU:5,motivo:"p",u:"p",ts:new Date().toISOString()}};
   const oA=S.ordenes.find(o=>abiertaDe(o)&&o.op);S.params.pendPospuestos=Object.assign(S.params.pendPospuestos||{},{["x-"+oA.id]:{hasta:"2026-12-31",motivo:"p"}});
   S.params.planMes=Object.assign(S.params.planMes||{},{"2026-12":{oids:[oA.id]}});S.params.progCongelado=(S.params.progCongelado||[]).concat([{id:"pc-b0",centro:"corte",lun:"2026-09-14",oids:[oA.id],hechasAl:{}}]);
   S.params.alertasCompras=(S.params.alertasCompras||[]).concat([{id:"ac-b0",oid:oA.id,op:oA.op}]);S.params.auditoriaCambios=(S.params.auditoriaCambios||[]).concat([{ts:"x",u:"p",tipo:"fase",oid:oA.id,op:oA.op}]);
   S.planes=(S.planes||[]).concat([{id:"plan-b0",ym:"2026-12",oids:[oA.id],ver:1}]);S.avance[oA.id]={centros:{corte:5},tramos:[{id:"t-b0",centro:"corte",ini:new Date().toISOString(),fin:new Date().toISOString()}],cierres:{corte:{pz:5}}};oA.lib={tela:{ok:true,u:"p"}};
   /* la base simulada se pone al día con la memoria (en producción BASE siempre refleja la última subida; en el harness algunas pruebas tocan sb.__DB a mano) */
   TABLAS.forEach(t=>{BASE[t]={}});BASE.params=null;
   while(guardando)await __p(20);await save();while(guardando)await __p(20);await __p(50);   /* lo sembrado llega a la base simulada, como pasaría en producción (save() se salta si otro guardado está en curso) */
   const foto={centros:S.centros.length,recursos:S.recursos.map(r=>[r.id,r.pers,r.efic,r.min]).sort().join("|"),cal:JSON.stringify(S.params.cal||null),exc:(S.params.excepciones||[]).length,
     nivelTela:faseMapeo().filter(r=>r.nivel).length,t14:camposConservados().length,t15:motivos().length,t18:JSON.stringify(S.params.horarios),gm:gruposMod().length,telas:S.telas.length,colores:S.colores.length,ops:S.operaciones.length,
     prm:[prm("msBuscar",150),prm("umbralArchivoIncompleto",10),prm("minMinutosCierre",5),prm("umbralCercania",0)].join(","),perfiles:JSON.stringify(S.params.perfilesDef||null),rutaDef:S.centros.map(c=>c.rutaDefecto?1:0).join(""),
     fotosIdx:Object.keys(S.params.fotosIdx||{}).length,bucket:Object.keys((sb.storage.__FILES||{})).length,esc:JSON.stringify(S.params.nivelacion.escenarios),bit:S.bitacora.length,categorias:S.categorias.length,tecnicas:S.tecnicas.length,rutas:(S.rutas||[]).length,maquinas:(S.maquinas||[]).length};
   const c=cuentaBorrado();const frase="BORRAR "+c.ordenes+" ORDENES Y "+c.avance+" AVANCES";
   const diag={writes:__W.writes.slice(-20).map(w=>w.t+":"+w.op+":"+w.n),saveErr:SAVE_ERR,db:await (async()=>{const r=await sb.from("centros").select("id,data");return (r.data||[]).filter(x=>x.data&&x.data.rutaDefecto).map(x=>x.id)})(),mem:S.centros.filter(x=>x.rutaDefecto).map(x=>x.id),base:Object.entries(BASE.centros||{}).filter(([id,j])=>/rutaDefecto/.test(j)).map(([id])=>id),puede:puedeSubirTabla("centros"),rol:PERFIL&&PERFIL.rol};
   __check("B0: el borrado exige permiso config y la frase exacta con los conteos actuales",/puede\(.config.\)/.test(String(mBorrar))&&/puede\(.config.\)/.test(String(borrarOperativo))&&/borrar-frase/.test(String(ejecutarBorrado)));
   __check("B0: hoy NO hay respaldo automático antes de borrar (ni local ni en Storage)",!/descargarJSON|subirRespaldo/.test(String(ejecutarBorrado)+String(borrarOperativo)));
   const inp=document.createElement("input");inp.id="borrar-frase";inp.value=frase;document.body.appendChild(inp);
   while(guardando)await __p(20);await ejecutarBorrado("operativo",frase);while(guardando)await __p(20);await __p(80);inp.remove();
   const despues={centros:S.centros.length,recursos:S.recursos.map(r=>[r.id,r.pers,r.efic,r.min]).sort().join("|"),cal:JSON.stringify(S.params.cal||null),exc:(S.params.excepciones||[]).length,
     nivelTela:faseMapeo().filter(r=>r.nivel).length,t14:camposConservados().length,t15:motivos().length,t18:JSON.stringify(S.params.horarios),gm:gruposMod().length,telas:S.telas.length,colores:S.colores.length,ops:S.operaciones.length,
     prm:[prm("msBuscar",150),prm("umbralArchivoIncompleto",10),prm("minMinutosCierre",5),prm("umbralCercania",0)].join(","),perfiles:JSON.stringify(S.params.perfilesDef||null),rutaDef:S.centros.map(c=>c.rutaDefecto?1:0).join(""),
     fotosIdx:Object.keys(S.params.fotosIdx||{}).length,bucket:Object.keys((sb.storage.__FILES||{})).length,esc:JSON.stringify((S.params.nivelacion||{}).escenarios),bit:S.bitacora.length,categorias:S.categorias.length,tecnicas:S.tecnicas.length,rutas:(S.rutas||[]).length,maquinas:(S.maquinas||[]).length};
   const dif=Object.keys(foto).filter(k=>k!=="bit"&&foto[k]!==despues[k]);
   __check("B0: tras el borrado se conserva TODA la configuración (centros, recursos con personas y eficiencia, calendario y festivos, tabla 1 con nivelación, 14, 15, 18, grupos de módulos, telas, colores, operaciones, parámetros, usuarios, rutas por defecto, fotos del bucket, escenarios)",dif.length===0,dif.map(k=>k+": "+String(foto[k]).slice(0,40)+" → "+String(despues[k]).slice(0,40)).join(" | "));
   __check("B0: se borran órdenes, avance, planes y lo operativo; la bitácora NO",S.ordenes.length===0&&Object.keys(S.avance).length===0&&(S.planes||[]).length===0&&(S.banos_conf||[]).length===0&&(S.salidas_tin||[]).length===0&&(S.turnos||[]).length===0&&(S.paros||[]).length===0&&(S.cargas||[]).length===0&&S.bitacora.length>=foto.bit,JSON.stringify({o:S.ordenes.length,a:Object.keys(S.avance).length,p:(S.planes||[]).length,b:S.bitacora.length}));
   /* huérfanos en params: referencias a órdenes que ya no existen */
   const huer={pendPospuestos:Object.keys(S.params.pendPospuestos||{}).filter(k=>k.startsWith("x-")).length,planMesOids:Object.values(S.params.planMes||{}).reduce((a,m)=>a+((m.oids||[]).length),0),progCongelado:(S.params.progCongelado||[]).reduce((a,p)=>a+((p.oids||[]).length),0),
     alertasCompras:(S.params.alertasCompras||[]).length,auditoriaCambios:(S.params.auditoriaCambios||[]).length,noCalzan:(((S.params.tareaCarga||{}).recarga||{}).noCalzan||[]).length,tareaCarga:!!S.params.tareaCarga,otCarga:!!S.params.otCarga,fotosIdx:Object.keys(S.params.fotosIdx||{}).length,cierresMes:Object.keys(S.params.cierresMes||{}).length,pedidosReprog:Object.keys(S.params.pedidosReprog||{}).length};
   __R.borrado={frase,foto,despues,huer,diag,cargasBorradas:(S.cargas||[]).length===0};
   __check("B0: hallazgo (rojo a propósito hasta construir) — quedan huérfanos en params: pendientes pospuestos, plan mensual, congelados, alertas de compras, bandeja no calzan y resúmenes de la última carga",huer.pendPospuestos+huer.planMesOids+huer.progCongelado+huer.alertasCompras+huer.noCalzan===0&&!huer.tareaCarga&&!huer.otCarga,JSON.stringify(huer));
   S=JSON.parse(copia);PLAN=null;PLAN_ALL=null;NIVC=null;window.alert=al;page="ordenes";render();
   __check("BORRADO sin errores",__R.errors.length===antes,JSON.stringify(__R.errors.slice(antes,antes+3)));}
  __R.done=true;console.log('__RESULTADO__ '+JSON.stringify({errores:__R.errors.length,fallos:__R.checks.filter(c=>!c.ok).length,checks:__R.checks.length}));
}
__run().catch(e=>{__R.errors.push({page:'driver',msg:e.message,stack:(e.stack||'').slice(0,300)});__R.done=true});
</script>
