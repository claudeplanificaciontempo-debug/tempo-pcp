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
  __check('nada marcado por defecto',grupos.every(g=>armGet(g.gk,g).size===0));
  {grupos.forEach(g=>{ARM.sel[g.gk]=new Set(Object.keys(g.items))});page='tintoreria';render();const html=document.getElementById('p-tintoreria').innerHTML;__check('armar: etiquetas lleno / previo aprobación / pendiente',/baño lleno|previo aprobación|pendiente/.test(html));grupos.forEach(g=>{delete ARM.sel[g.gk]})}
  const colores=[...new Set(grupos.map(g=>g.color))];
  colores.forEach(col=>{grupos.filter(g=>g.color===col).forEach(g=>{ARM.sel[g.gk]=new Set(Object.keys(g.items))});confirmarArmColor(col)});
  await __p(100);PLAN=null;P=programar();
  const conf=P.banos.filter(b=>b.confirmado&&!b.error);
  __check('baños confirmados programados',conf.length>0&&conf.every(b=>b.dia&&b.rec),conf.map(b=>b.colorN+'@'+b.rec+' '+b.dia+' '+Math.round(b.kg)+'kg').join('; '));
  __check('máquina apta por rol de color (claro→DANITECH 1, oscuro→DANITECH 2)',conf.every(b=>{const r=R(b.rec);const claro=profColor(C(b.color))==='claro';return !r.rolColor||r.rolColor==='ambos'||(r.rolColor==='claro')===claro}),conf.map(b=>b.colorN+'→'+nRec(b.rec)).join('; '));
  __check('cada baño confirmado tiene código interno único',conf.every(b=>/^T[A-Z]{3}\d{2}-[A-Z0-9]+-\d{2}$/.test(b.cod))&&new Set(conf.map(b=>b.cod)).size===conf.length,conf.map(b=>b.cod).join(', '));
  page='tintoreria';render();__check('cuadro muestra el código del baño y reparto de WH partidas',document.getElementById('p-tintoreria').innerHTML.includes(conf[0].cod)&&(document.getElementById('p-tintoreria').innerHTML.includes('% aquí · resto:')||!conf.some(b=>b.oids.some(oid=>conf.filter(x=>x.opsKg[oid]>0).length>1))));
  __check('tintorería: resumen por WH',document.getElementById('p-tintoreria').innerHTML.includes('Resumen por WH')&&document.getElementById('p-tintoreria').innerHTML.includes(conf[0].cod));
  {const b0m=conf[0];const otra=S.recursos.find(r=>r.activa&&r.centro==='tin'&&r.id!==b0m.rec&&r.cap>=b0m.kg);if(otra){moverBano(b0m.id,otra.id);await __p(30);PLAN=null;const bm=programar().banos.find(b=>b.id===b0m.id);
    __check('mover baño a otra máquina a mano',!!bm&&bm.rec===otra.id,bm?nRec(bm.rec):'sin baño');moverBano(b0m.id,'');await __p(30);PLAN=null;__check('baño vuelve a máquina automática',!(S.banos_conf.find(x=>x.id===b0m.id)||{}).recFijo)}else __check('mover baño (sin otra máquina apta)',true)}
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
   const bcBak=S.banos_conf;[oM,oI,oS].forEach(o=>{delete S.avance[o.id]});S.banos_conf=[];oM.fase='1Tintoreria';oI.fase='1Incompletos Tintoreria';oS.fase='1Tela Stock';PLAN=null;let Px=programar();
   __check('fase Tintorería = en máquina: no se arma y la tela llega',estadoTin(oM)==='maquina'&&!Object.values(armGrupos(Px)).some(g=>g.items[oM.id])&&!!Px.ordenes[oM.id].enMaquinaTin);
   __check('incompleto sin kg faltantes: no entra a armar',estadoTin(oI)==='incompleto'&&!Object.values(armGrupos(Px)).some(g=>g.items[oI.id]));
   const telaI=(oI.telas||[]).find(t=>!t.ext&&t.kg>0).tela;setFaltaKg(oI.id,telaI,37);await __p(30);PLAN=null;Px=programar();const gI=Object.values(armGrupos(Px)).find(g=>g.items[oI.id]);
   __check('incompleto con 37 kg faltantes: entra a armar solo con esos kg',!!gI&&Math.abs(gI.items[oI.id].kg-37)<1e-6,gI?gI.items[oI.id].kg:'sin grupo');
   __check('tela en stock = lista para liberar a producción',estadoTin(oS)==='stock'&&faseEstado(oS.fase).lista&&puedeLiberar(oS),faltaLiberar(oS).join(', '));
   page='tintoreria';render();const html=document.getElementById('p-tintoreria').innerHTML;__check('panel Estado de tintorería con los 4 bloques',html.includes('En máquina ahora')&&html.includes('Incompletos: tinturados')&&html.includes('Tela en stock')&&html.includes(oM.op)&&html.includes(oI.op)&&html.includes(oS.op));
   banoListo(oM.id);await __p(30);__check('en máquina → hecho pasa a calidad',enCalidad(oM)&&oM.fase==='1Calidad Tintoreria');
   [oM,oI,oS].forEach((o,i)=>{o.fase=bak[i][0];const a=JSON.parse(bak[i][1]);if(a)S.avance[o.id]=a;else delete S.avance[o.id]});S.banos_conf=bcBak;PLAN=null;}
  /* 8) operaciones: base OPERACIONES.xlsx incorporada y catálogo por categoría */
  {const antes=__R.errors.length;cargarLMOBase();await __p(100);
   __check('base LMO cargada (595 operaciones)',S.operaciones.length===595,S.operaciones.length);
   __check('todas las operaciones con centro PCP válido',S.operaciones.every(o=>CE(o.centro)),[...new Set(S.operaciones.filter(o=>!CE(o.centro)).map(o=>o.centro))].join(','));
   __check('categorías y familias de operación leídas',[...new Set(S.operaciones.map(o=>o.catP))].length===18&&[...new Set(S.operaciones.map(o=>o.famOp))].length===9,[...new Set(S.operaciones.map(o=>o.famOp))].join(','));
   page='operaciones';OPV.abierta=null;OPV.q='';render();const html=document.getElementById('p-operaciones').innerHTML;
   __check('catálogo por categoría renderiza',__R.errors.length===antes&&html.includes('Camiseta')&&html.includes('Ensamble')&&html.includes('Tendido'));
   OPV.q='bolsillo';render();__check('búsqueda en catálogo',document.getElementById('p-operaciones').innerHTML.includes('Pegar Bolsillo')||document.getElementById('p-operaciones').innerHTML.toLowerCase().includes('bolsillo'));OPV.q='';}
  try{localStorage.__fase="fuzz"}catch(e){}
  /* 6) pulsar todos los botones y enlaces con onclick de cada página (confirm→false para no borrar nada) */
  window.confirm=()=>false;const omit=/logout|exportJSON|importJSON|demo\(|print\(|location\.|window\.open|borrarTodo|resetear/;
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
