
// app.js - shared logic for pages (uses localStorage)
const STORAGE_KEY = "farmacia_pedidos_v1";

function loadPedidos(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}
function savePedidos(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function genId(){ return Math.random().toString(36).slice(2,9); }

function addPedido(pedido){
  const list = loadPedidos();
  list.unshift(pedido);
  savePedidos(list);
}

function updatePedidoStatus(id, status){
  const list = loadPedidos();
  const idx = list.findIndex(p=>p.id===id);
  if(idx!==-1){ list[idx].status = status; savePedidos(list); return true; }
  return false;
}

function removePedido(id){
  let list = loadPedidos();
  list = list.filter(p=>p.id!==id);
  savePedidos(list);
}

function renderPedidosTable(targetSelector, options={}){
  const container = document.querySelector(targetSelector);
  if(!container) return;
  const list = loadPedidos();
  const filtered = options.status ? list.filter(p=>p.status===options.status) : list;
  if(filtered.length===0){
    container.innerHTML = '<div class="small">No hay pedidos.</div>'; return;
  }
  const rows = filtered.map(p=>{
    return `<tr>
      <td>${p.id}</td>
      <td>${p.cliente}</td>
      <td>${p.items}</td>
      <td class="small">${p.status}</td>
      <td>
        ${options.showActions ? `<button class="btn" onclick="onVer('${p.id}')">Ver</button>` : ''}
        ${options.allowProcess ? `<button class="btn ghost" onclick="onProcesar('${p.id}')">Procesar</button>` : ''}
        ${options.allowShip ? `<button class="btn ghost" onclick="onEnviar('${p.id}')">Enviar</button>` : ''}
        <button class="btn ghost" onclick="onEliminar('${p.id}')">Eliminar</button>
      </td>
    </tr>`}).join("");
  container.innerHTML = `<table class="table"><thead><tr><th>ID</th><th>Cliente</th><th>Items</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function onVer(id){
  const list = loadPedidos();
  const p = list.find(x=>x.id===id);
  if(!p){ alert("Pedido no encontrado"); return; }
  alert(`Pedido ${p.id}\nCliente: ${p.cliente}\nItems: ${p.items}\nEstado: ${p.status}\nNotas: ${p.notas||''}`);
}

function onProcesar(id){
  if(confirm("Marcar pedido como 'Procesado'?")){
    updatePedidoStatus(id,'Procesado');
    location.reload();
  }
}

function onEnviar(id){
  if(confirm("Marcar pedido como 'Enviado'?")){
    updatePedidoStatus(id,'Enviado');
    location.reload();
  }
}

function onEliminar(id){
  if(confirm("Eliminar pedido?")){
    removePedido(id);
    location.reload();
  }
}

// Helpers for forms
function handleIngresoForm(formId){
  const f = document.getElementById(formId);
  if(!f) return;
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    const cliente = f.querySelector('[name=cliente]').value.trim();
    const items = f.querySelector('[name=items]').value.trim();
    const notas = f.querySelector('[name=notas]').value.trim();
    if(!cliente || !items){ alert("Complete cliente e items"); return; }
    const pedido = { id: genId(), cliente, items, notas, status: 'Pendiente', createdAt: new Date().toISOString() };
    addPedido(pedido);
    f.reset();
    alert("Pedido creado!");
    window.location.href = "index.html";
  });
}

// Quick dashboard stats
function renderDashboardStats(){
  const list = loadPedidos();
  const total = list.length;
  const pendientes = list.filter(p=>p.status==='Pendiente').length;
  const procesados = list.filter(p=>p.status==='Procesado').length;
  const enviados = list.filter(p=>p.status==='Enviado').length;
  const elTotal = document.getElementById('stat-total');
  if(elTotal) elTotal.textContent = total;
  const elPend = document.getElementById('stat-pend');
  if(elPend) elPend.textContent = pendientes;
  const elProc = document.getElementById('stat-proc');
  if(elProc) elProc.textContent = procesados;
  const elEnv = document.getElementById('stat-env');
  if(elEnv) elEnv.textContent = enviados;
}

// Simple sample data loader (for demo)
function seedSampleData(){
  if(localStorage.getItem(STORAGE_KEY)) return;
  const sample = [
    { id: genId(), cliente: 'Rosa Perez', items: 'Ibuprofeno x1, Jarabe x1', notas: 'Retira en local', status:'Pendiente', createdAt: new Date().toISOString() },
    { id: genId(), cliente: 'Juan Gomez', items: 'Vitamina C x2', notas: '', status:'Procesado', createdAt: new Date().toISOString() },
    { id: genId(), cliente: 'Clara Ruiz', items: 'Antibiotico x1', notas: 'Envio a domicilio', status:'Enviado', createdAt: new Date().toISOString() }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
}

// expose some functions to window for inline onclicks
window.renderPedidosTable = renderPedidosTable;
window.handleIngresoForm = handleIngresoForm;
window.renderDashboardStats = renderDashboardStats;
window.seedSampleData = seedSampleData;
