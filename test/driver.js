<script>
/* Guion de pruebas: se ejecuta cuando la app terminó de cargar */
async function __esperar(f,ms){const t0=Date.now();while(!f()){if(Date.now()-t0>ms)throw new Error('timeout esperando');await new Promise(r=>setTimeout(r,50))}}
function __check(nombre,cond,detalle){__R.checks.push({nombre,ok:!!cond,detalle:detalle===undefined?'':String(detalle)})}
const __p=ms=>new Promise(r=>setTimeout(r,ms));
async function __run(){try{__R.prevFuzz=localStorage.__fuzz||'';localStorage.__fuzz=''}catch(e){}
  await __esperar(()=>S&&PERFIL&&document.getElementById('login')&&!document.getElementById('login').classList.contains('on'),8000);
  const sd=seed();['centros','recursos','telas','colores'].forEach(t=>S[t]=sd[t]);
  S.colores.forEach((c,i)=>{c.cod=['19-4005','11-0601','17-4402','19-3921','19-1758'][i]+' TCX'});
  const mkCat=(p,hs)=>{const P={id:uid(),n:p,padre:null,recursos:[]};S.categorias.push(P);hs.forEach(h=>S.categorias.push({id:uid(),n:h,padre:P.id,recursos:[]}))};
  mkCat('CAM BÁSICA',['Camiseta CV','Camiseta CR']);mkCat('POLO PIQUÉ',['Polo Basica']);mkCat('HOODIE',['Hoodies']);mkCat('JEAN',['Jeans']);
  demo();await __p(100);
  __check('órdenes demo cargadas',S.ordenes.length===5,S.ordenes.length);
  const paginas=['ordenes','panorama','gerencia','liberacion','wip','entregas','plan','familias','escenarios','cumplimiento','tejeduria','tintoreria','centro','produccion','costura','balanceo','imprimir','control','linea','categorias','operaciones','config','usuarios','albaran'];
  for(const p of paginas){const antes=__R.errors.length;page=p;try{render()}catch(e){__R.errors.push({page:p,msg:'render: '+e.message,stack:(e.stack||'').split('\n').slice(0,3).join(' | ')})}
    const chips=[...document.querySelectorAll('main .chip[onclick], main .chips .chip')].slice(0,40);
    for(const ch of chips){try{ch.click()}catch(e){__R.errors.push({page:p,msg:'chip: '+e.message})}}
    await __p(10);
    __check('página '+p+' sin errores',__R.errors.length===antes,__R.errors.slice(antes).map(e=>e.msg).join(' || '))}
  for(const a of ['tej','tin','pro']){const antes=__R.errors.length;page='control';CTL.area=a;try{render()}catch(e){__R.errors.push({page:'control/'+a,msg:e.message})}__check('control de piso '+a,__R.errors.length===antes)}
  for(const c of Object.keys(CENTROS_PROD)){for(const tab of ['plan','prog','ejec']){const antes=__R.errors.length;page='centro';CEN.id=c;CEN.tab=tab;try{render()}catch(e){__R.errors.push({page:'centro/'+c+'/'+tab,msg:e.message})}__check('centro '+c+' '+tab,__R.errors.length===antes)}}
  /* flujo tintorería: armar por color → confirmar → salió → calidad → liberar a corte */
  liberarA(S.ordenes.map(o=>o.id),'tela');await __p(50);__check('órdenes liberadas a tela',S.ordenes.every(o=>liberada(o,'tin')),S.ordenes.filter(o=>!liberada(o,'tin')).map(o=>o.op+': '+faltaLiberarA(o,'tela').join('/')).join('; '));
  PLAN=null;let P=programar();const grupos=Object.values(armGrupos(P));
  __check('hay grupos por armar',grupos.length>0,grupos.length+' grupos');
  __check('nada marcado por defecto',grupos.every(g=>armGet(g.gk,g).size===0));
  const colores=[...new Set(grupos.map(g=>g.color))];
  colores.forEach(col=>{grupos.filter(g=>g.color===col).forEach(g=>{ARM.sel[g.gk]=new Set(Object.keys(g.items))});confirmarArmColor(col)});
  await __p(100);PLAN=null;P=programar();
  const conf=P.banos.filter(b=>b.confirmado&&!b.error);
  __check('baños confirmados programados',conf.length>0&&conf.every(b=>b.dia&&b.rec),conf.map(b=>b.colorN+'@'+b.rec+' '+b.dia+' '+Math.round(b.kg)+'kg').join('; '));
  __check('máquina apta por rol de color (claro→DANITECH 1, oscuro→DANITECH 2)',conf.every(b=>{const r=R(b.rec);const claro=profColor(C(b.color))==='claro';return !r.rolColor||r.rolColor==='ambos'||(r.rolColor==='claro')===claro}),conf.map(b=>b.colorN+'→'+nRec(b.rec)).join('; '));
  __check('baño confirmado cabe en su máquina',conf.every(b=>b.kg<=(b.cap||0)*1.05+1e-6),conf.map(b=>Math.round(b.kg)+'kg en '+nRec(b.rec)+' ('+b.cap+')').join('; '));
  __check('sin grupos pendientes tras confirmar',Object.keys(armGrupos(P)).length===0,Object.keys(armGrupos(P)).join(','));
  const b0=conf[0];const oid0=b0.oids[0];const o0=S.ordenes.find(o=>o.id===oid0);
  __check('antes de salir: no liberable a corte',!puedeLiberar(o0),faltaLiberar(o0).join(', '));
  page='control';CTL.area='tin';CTL.todo=true;render();
  __check('control tin muestra botón salió',document.querySelector('main button[onclick^="mSalioBano"]')!=null);
  banoListo(b0.oids.join(','));await __p(50);
  __check('tras salió: orden en calidad',enCalidad(o0),'fase='+o0.fase);
  __check('tras salió: fase 1Calidad Tintoreria',o0.fase==='1Calidad Tintoreria',o0.fase);
  __check('tras salió: aún no liberable (falta calidad)',!puedeLiberar(o0)&&faltaLiberar(o0).some(x=>x.includes('calidad')),faltaLiberar(o0).join(', '));
  render();__check('panel calidad lista la orden',document.querySelector('main').innerHTML.includes('Aprobar calidad'));
  __check('fila del baño marca en calidad',document.querySelector('main').innerHTML.includes('>en calidad<'));
  calidadAprobar(b0.oids.join(','));await __p(50);
  __check('tras aprobar: fase 2Planificacion',o0.fase==='2Planificacion',o0.fase);
  __check('tras aprobar: liberable a corte',puedeLiberar(o0),faltaLiberar(o0).join(', '));
  __check('tras aprobar: aparece botón liberar a corte',document.querySelector('main').innerHTML.includes('liberar a corte'));
  liberarCorte(oid0);await __p(50);
  __check('liberada a corte',liberadaCorte(o0)&&(S.avance[oid0]||{}).lista===true);
  const b1=conf.find(b=>b.id!==b0.id&&!b.oids.includes(oid0));
  if(b1){banoListo(b1.oids.join(','));calidadRechazar(b1.oids.join(','));await __p(50);const o1=S.ordenes.find(o=>o.id===b1.oids[0]);const a1=S.avance[o1.id]||{};
    __check('rechazo: marcada reproceso y fase 1Tintoreria',a1.reproc===true&&!a1.tinturada&&o1.fase==='1Tintoreria',o1.fase);
    PLAN=null;P=programar();__check('rechazo: baño reprogramado como reproceso',P.banos.some(b=>b.oids.includes(o1.id)&&b.reproc));}
  else __check('segundo baño para probar rechazo',false,'solo había un baño');
  for(const et of ['tela','corte']){const antes=__R.errors.length;page='liberacion';LIB.et=et;try{render()}catch(e){__R.errors.push({page:'liberacion/'+et,msg:e.message})}__check('liberación '+et,__R.errors.length===antes)}
  for(const p of ['panorama','tintoreria','produccion','control','plan','cumplimiento','entregas','wip','gerencia']){const antes=__R.errors.length;page=p;try{render()}catch(e){__R.errors.push({page:p+'(2)',msg:e.message})}__check('re-render '+p,__R.errors.length===antes)}
  /* 6) pulsar todos los botones y enlaces con onclick de cada página (confirm→false para no borrar nada) */
  window.confirm=()=>false;const omit=/logout|exportJSON|importJSON|demo\(|print\(|location\.|window\.open|borrarTodo|resetear/;
  for(const p of paginas){page=p;try{render()}catch(e){}
    const ctrls=[...document.querySelectorAll('main [onclick], main button')].filter(el=>!omit.test(el.getAttribute('onclick')||'')).slice(0,120);
    let n=0;for(const el of ctrls){const antes=__R.errors.length;const oc=(el.getAttribute('onclick')||el.textContent||'').slice(0,70);
      try{localStorage.__fuzz=p+' | '+(el.getAttribute('onclick')||'').slice(0,160)+' | '+el.textContent.trim().slice(0,40)}catch(e){}
      try{el.click()}catch(e){__R.errors.push({page:p,msg:'click: '+e.message,src:oc})}
      try{localStorage.__fuzz=''}catch(e){}
      await __p(0);if(__R.errors.length>antes){__R.errors.slice(antes).forEach(x=>x.src=(x.src||'')+' ← '+oc)}
      try{cerrar()}catch(e){}n++}
    __check('botones de '+p+' ('+n+') sin errores',true)}
  __check('fase de botones terminada sin errores nuevos',__R.errors.filter(e=>String(e.msg).startsWith('click:')||e.src&&e.src.includes('←')).length===0,__R.errors.filter(e=>e.src&&e.src.includes('←')).map(e=>e.page+': '+e.msg+' ← '+e.src.split('←')[1]).join(' || '));
  window.confirm=()=>true;
  await __p(300);const db=sb.__DB;__check('guardado en BD simulada: órdenes',(db.ordenes||[]).length===5,(db.ordenes||[]).length);
  __check('guardado: banos_conf',(db.banos_conf||[]).length>0,(db.banos_conf||[]).length);__check('guardado: avance',(db.avance||[]).length>0,(db.avance||[]).length);
  __R.done=true;console.log('__RESULTADO__ '+JSON.stringify({errores:__R.errors.length,fallos:__R.checks.filter(c=>!c.ok).length,checks:__R.checks.length}));
}
__run().catch(e=>{__R.errors.push({page:'driver',msg:e.message,stack:(e.stack||'').slice(0,300)});__R.done=true});
</script>
