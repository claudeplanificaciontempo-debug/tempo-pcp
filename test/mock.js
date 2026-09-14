<script>
/* Supabase falso en memoria para pruebas locales */
window.__R={errors:[],alerts:[],checks:[],log:[]};
window.addEventListener('error',e=>{__R.errors.push({page:(typeof page!=='undefined'?page:''),msg:e.message,src:(e.filename||'')+':'+e.lineno,stack:(e.error&&e.error.stack||'').split('\n').slice(0,3).join(' | ')})});
window.addEventListener('unhandledrejection',e=>{__R.errors.push({page:(typeof page!=='undefined'?page:''),msg:'PROMISE: '+(e.reason&&e.reason.message||e.reason),stack:(e.reason&&e.reason.stack||'').split('\n').slice(0,3).join(' | ')})});
window.print=()=>{__R.log.push('print bloqueado en '+(typeof page!=='undefined'?page:''))};window.open=()=>null;
window.alert=m=>{__R.alerts.push({page:(typeof page!=='undefined'?page:''),msg:String(m)})};window.confirm=()=>true;window.prompt=()=>'';
const DB={perfiles:[{id:'u1',email:'prueba@tempo.local',rol:'admin',nombre:'Usuario de prueba',area:null}]};
const tabla=t=>DB[t]=DB[t]||[];
function builder(t){const st={t,op:'select',filters:[],single:false,payload:null,ids:null};
  const b={select(){return b},order(){return b},range(){return b},limit(){return b},eq(k,v){st.filters.push([k,v]);return b},single(){st.single=true;return b},
    upsert(rows){st.op='upsert';st.payload=rows;return b},delete(){st.op='delete';return b},in(k,ids){st.ids=ids;return b},update(obj){st.op='update';st.payload=obj;return b},
    then(res,rej){let rows=tabla(t);try{
      if(st.op==='select'){let out=rows.filter(r=>st.filters.every(([k,v])=>r[k]===v));if(st.single){return res(out.length?{data:out[0],error:null}:{data:null,error:{message:'no rows'}})}return res({data:JSON.parse(JSON.stringify(out)),error:null})}
      if(st.op==='upsert'){(st.payload||[]).forEach(r=>{const i=rows.findIndex(x=>x.id===r.id);const c=JSON.parse(JSON.stringify(r));if(i<0)rows.push(c);else rows[i]=c});return res({data:null,error:null})}
      if(st.op==='delete'){DB[t]=rows.filter(r=>!(st.ids||[]).includes(r.id));return res({data:null,error:null})}
      if(st.op==='update'){rows.filter(r=>st.filters.every(([k,v])=>r[k]===v)).forEach(r=>Object.assign(r,st.payload));return res({data:null,error:null})}
    }catch(e){return res({data:null,error:{message:e.message}})}}};return b}
window.supabase={createClient(){const user={id:'u1',email:'prueba@tempo.local'};return{auth:{getSession:async()=>({data:{session:{user}}}),onAuthStateChange(){},signInWithPassword:async()=>({data:{user},error:null}),signOut:async()=>{}},from:builder,__DB:DB,storage:{__FILES:{},from(b){const F=this.__FILES;return{async upload(p,blob,o){F[b+"/"+p]=blob?blob.size:0;return{data:{path:p},error:null}},async list(){return{data:Object.keys(F).map(k=>({name:k})),error:null}},getPublicUrl(p){return{data:{publicUrl:"https://mock/storage/v1/object/public/"+b+"/"+p}}}}}}}}};
</script>
