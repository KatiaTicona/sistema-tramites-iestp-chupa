const KEY="tramites_iestp_chupa_v02";
const initial=[
{id:"TRM-2026-001",solicitante:"María Quispe",dni:"72845120",tipo:"Certificado de estudios",estado:"En proceso",etapa:2,fecha:"01/10/2026",detalle:"Solicitud de certificado de estudios."},
{id:"TRM-2026-002",solicitante:"Juan Pérez",dni:"70451236",tipo:"Constancia de estudios",estado:"En revisión",etapa:1,fecha:"01/10/2026",detalle:"Constancia para trámite externo."},
{id:"TRM-2026-003",solicitante:"Ana Mamani",dni:"74632108",tipo:"Récord académico",estado:"Finalizado",etapa:4,fecha:"30/09/2026",detalle:"Entrega de récord académico."},
{id:"TRM-2026-004",solicitante:"Luis Flores",dni:"71984521",tipo:"Certificado de estudios",estado:"Por hacer",etapa:0,fecha:"30/09/2026",detalle:"Nueva solicitud."}
];
let data=JSON.parse(localStorage.getItem(KEY)||"null")||initial;
let currentView="dashboard";
const app=document.getElementById("app"), title=document.getElementById("pageTitle");

function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function badge(s){return `<span class="badge ${s.toLowerCase().replaceAll(" ","-")}">${s}</span>`}
function stats(){return {total:data.length,proceso:data.filter(x=>x.estado==="En proceso").length,revision:data.filter(x=>x.estado==="En revisión").length,final:data.filter(x=>x.estado==="Finalizado").length}}
function render(){
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===currentView));
 const names={dashboard:"Panel de Secretaría Académica",nuevo:"Registrar nuevo trámite",seguimiento:"Seguimiento de trámite",tramites:"Gestión de trámites",reportes:"Reportes e indicadores"};
 title.textContent=names[currentView];
 ({dashboard:dashboard,nuevo:nuevo,seguimiento:seguimiento,tramites:tramites,reportes:reportes}[currentView])();
}
function dashboard(){
 const s=stats();
 app.innerHTML=`<div class="grid stats">
 <div class="card"><div class="stat-label">Trámites registrados</div><div class="stat-value">${s.total}</div><div class="stat-note">Total en el prototipo</div></div>
 <div class="card"><div class="stat-label">En proceso</div><div class="stat-value">${s.proceso}</div><div class="stat-note">Atención activa</div></div>
 <div class="card"><div class="stat-label">En revisión</div><div class="stat-value">${s.revision}</div><div class="stat-note">Pendientes de revisión</div></div>
 <div class="card"><div class="stat-label">Finalizados</div><div class="stat-value">${s.final}</div><div class="stat-note">Atendidos</div></div>
 </div>
 <div class="grid two" style="margin-top:18px">
 <div class="card"><h2 class="section-title">Trámites recientes</h2>${table(data.slice(0,5),true)}</div>
 <div class="card"><h2 class="section-title">Flujo de atención</h2><div class="timeline">
 ${["Recepción","Revisión","Atención","Entrega"].map((x,i)=>`<div class="step ${i<2?"done":""} ${i===2?"current":""}"><div class="dot">${i<2?"✓":i+1}</div><div><strong>${x}</strong><small>${i<2?"Etapa completada":i===2?"Etapa de atención":"Pendiente"}</small></div></div>`).join("")}</div></div>
 </div>`;
}
function table(rows, compact=false){
 if(!rows.length)return `<div class="empty">No hay trámites registrados.</div>`;
 return `<div class="table-wrap"><table class="table"><thead><tr><th>Código</th><th>Solicitante</th><th>Trámite</th><th>Estado</th>${compact?"":"<th>Fecha</th><th>Acción</th>"}</tr></thead><tbody>${rows.map(x=>`<tr><td><strong>${x.id}</strong></td><td>${x.solicitante}</td><td>${x.tipo}</td><td>${badge(x.estado)}</td>${compact?"":`<td>${x.fecha}</td><td><button class="btn btn-secondary" onclick="viewDetail('${x.id}')">Gestionar</button></td>`}</tr>`).join("")}</tbody></table></div>`
}
function nuevo(){
 app.innerHTML=`<div class="card"><h2 class="section-title">Datos del solicitante y trámite</h2>
 <form id="form" class="form-grid">
 <div class="field"><label>Nombres y apellidos</label><input id="nombre" required></div>
 <div class="field"><label>DNI</label><input id="dni" maxlength="8" required></div>
 <div class="field"><label>Tipo de trámite</label><select id="tipo"><option>Certificado de estudios</option><option>Constancia de estudios</option><option>Récord académico</option><option>Otro trámite académico</option></select></div>
 <div class="field"><label>Correo electrónico</label><input id="correo" type="email"></div>
 <div class="field full"><label>Descripción</label><textarea id="detalle" placeholder="Información adicional de la solicitud"></textarea></div>
 <div class="field"><label>Fecha</label><input id="fecha" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
 <div class="actions full"><button class="btn btn-primary">Registrar trámite</button><button type="button" class="btn btn-secondary" onclick="go('dashboard')">Cancelar</button></div>
 </form></div>`;
 document.getElementById("form").onsubmit=e=>{e.preventDefault();const n=data.length+1;const id=`TRM-2026-${String(n).padStart(3,"0")}`;data.unshift({id,solicitante:nombre.value,dni:dni.value,tipo:tipo.value,estado:"Por hacer",etapa:0,fecha:fecha.value,detalle:detalle.value});save();toast(`Trámite ${id} registrado`);go("seguimiento");setTimeout(()=>{document.getElementById("codigo").value=id;buscar()},150)}
}
function seguimiento(){
 app.innerHTML=`<div class="card"><h2 class="section-title">Consultar estado</h2><div class="search-row"><input id="codigo" placeholder="Ej. TRM-2026-001"><button class="btn btn-primary" onclick="buscar()">Consultar</button></div><div id="resultado"></div></div>`;
}
function buscar(){
 const c=document.getElementById("codigo").value.trim().toUpperCase(), x=data.find(a=>a.id===c), r=document.getElementById("resultado");
 if(!x){r.innerHTML=`<div class="empty">No se encontró el código indicado.</div>`;return}
 r.innerHTML=`<div class="card" style="margin-top:15px;border-color:#dbeafe"><div class="stat-label">Código de trámite</div><h2 style="margin:5px 0">${x.id}</h2><p><strong>${x.tipo}</strong> · ${x.solicitante}</p>${badge(x.estado)}<div class="timeline">${["Recepción","Revisión","Atención","Entrega"].map((n,i)=>`<div class="step ${i<x.etapa?"done":""} ${i===x.etapa?"current":""}"><div class="dot">${i<x.etapa?"✓":i+1}</div><div><strong>${n}</strong><small>${i<x.etapa?"Completada":i===x.etapa?"Estado actual":"Pendiente"}</small></div></div>`).join("")}</div></div>`;
}
function tramites(){
 app.innerHTML=`<div class="card"><div class="search-row"><input id="filtro" placeholder="Buscar por código, DNI, nombre o trámite..." oninput="filtrar()"><button class="btn btn-primary" onclick="go('nuevo')">＋ Nuevo trámite</button></div><div id="tabla">${table(data)}</div></div>`;
}
function filtrar(){const q=document.getElementById("filtro").value.toLowerCase();document.getElementById("tabla").innerHTML=table(data.filter(x=>Object.values(x).some(v=>String(v).toLowerCase().includes(q))))}
function viewDetail(id){
 const x=data.find(a=>a.id===id); if(!x)return;
 app.innerHTML=`<div class="card"><button class="btn btn-secondary" onclick="go('tramites')">← Volver</button><h2 style="margin:18px 0 4px">${x.id}</h2><p><strong>${x.solicitante}</strong> · DNI ${x.dni}</p><p>${x.tipo}</p><hr><div class="form-grid"><div class="field"><label>Estado</label><select id="estado"><option ${x.estado==="Por hacer"?"selected":""}>Por hacer</option><option ${x.estado==="En proceso"?"selected":""}>En proceso</option><option ${x.estado==="En revisión"?"selected":""}>En revisión</option><option ${x.estado==="Finalizado"?"selected":""}>Finalizado</option></select></div><div class="field"><label>Etapa</label><select id="etapa">${["Recepción","Revisión","Atención","Entrega"].map((v,i)=>`<option value="${i}" ${x.etapa===i?"selected":""}>${v}</option>`).join("")}</select></div></div><div class="actions"><button class="btn btn-primary" onclick="update('${x.id}')">Guardar cambios</button></div></div>`;
}
function update(id){const x=data.find(a=>a.id===id);x.estado=document.getElementById("estado").value;x.etapa=Number(document.getElementById("etapa").value);save();toast("Trámite actualizado");go("tramites")}
function reportes(){
 const s=stats(), max=Math.max(s.total,1);
 app.innerHTML=`<div class="grid two"><div class="card"><h2 class="section-title">Distribución por estado</h2><div class="chart">${[["Por hacer",data.filter(x=>x.estado==="Por hacer").length],["En proceso",s.proceso],["En revisión",s.revision],["Finalizado",s.final]].map(([n,v])=>`<div class="bar-row"><span>${n}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><strong>${v}</strong></div>`).join("")}</div></div><div class="card"><h2 class="section-title">Indicadores</h2><p><strong>${s.final}</strong> trámites finalizados</p><p><strong>${s.proceso+s.revision}</strong> trámites con atención pendiente</p><p><strong>${s.total?Math.round(s.final/s.total*100):0}%</strong> de finalización en el prototipo</p></div></div>`;
}
function go(v){currentView=v;render()}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>go(b.dataset.view));
render();
