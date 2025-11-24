// app.js - lógica completa del sistema
const STORAGE_KEY = "farmacia_pedidos_v2";

// -------------------- STORAGE --------------------
function loadPedidos(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function savePedidos(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function genId(){
  return Math.random().toString(36).slice(2,9);
}

// -------------------- CRUD --------------------
function addPedido(pedido){
  const list = loadPedidos();
  list.unshift(pedido);
  savePedidos(list);
}

function updatePedidoStatus(id, status){
  const list = loadPedidos();
  const idx = list.findIndex(p => p.id === id);
  if(idx !== -1){
    list[idx].estado = status;
    savePedidos(list);
    return true;
  }
  return false;
}

function removePedido(id){
  let list = loadPedidos();
  list = list.filter(p => p.id !== id);
  savePedidos(list);
}

// -------------------- TABLA --------------------
function renderPedidosTable(targetSelector, options = {}){
  const container = document.querySelector(targetSelector);
  if(!container) return;

  const list = loadPedidos();
  const filtered = options.status ? list.filter(p => p.estado === options.status) : list;

  if(filtered.length === 0){
    container.innerHTML = '<div class="small">No hay pedidos.</div>';
    return;
  }

  const rows = filtered.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.cliente}</td>
      <td>${p.items}</td>
      <td class="small">${p.estado}</td>
      <td>
        <button class="btn" onclick="onVer('${p.id}')">Ver</button>
        <button class="btn ghost" onclick="onProcesar('${p.id}')">Procesar</button>
        <button class="btn ghost" onclick="onEnviar('${p.id}')">Enviar</button>
        <button class="btn ghost" onclick="onEliminar('${p.id}')">Eliminar</button>
      </td>
    </tr>
  `).join("");

  container.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Cliente</th><th>Items</th><th>Estado</th><th>Acciones</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// -------------------- ACCIONES --------------------
function onVer(id){
  const p = loadPedidos().find(x => x.id === id);
  if(!p){ alert("Pedido no encontrado"); return; }

  alert(
    `Pedido ${p.id}
Cliente: ${p.cliente}
Items: ${p.items}
Paciente: ${p.paciente}
Fecha: ${p.fecha}
Operación: ${p.nroOperacion}
Doctor: ${p.doctor}
% Comisión: ${p.comision}
Nro RP: ${p.nroRP}
Canal: ${p.canal}
Envío: ${p.envio}
Estado: ${p.estado}
Notas: ${p.notas}

(Receta y pago guardados en base64)`
  );
}

function onProcesar(id){
  if(confirm("¿Marcar como Procesado?")){
    updatePedidoStatus(id, "Procesado");
    location.reload();
  }
}

function onEnviar(id){
  if(confirm("¿Marcar como Enviado?")){
    updatePedidoStatus(id, "Enviado");
    location.reload();
  }
}

function onEliminar(id){
  if(confirm("¿Eliminar pedido?")){
    removePedido(id);
    location.reload();
  }
}

// -------------------- FORMULARIO --------------------
async function fileToBase64(file){
  return new Promise((resolve) => {
    if(!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

function handleIngresoForm(formId){
  const f = document.getElementById(formId);
  if(!f) return;

  f.addEventListener("submit", async (e)=>{
    e.preventDefault();

    // Campos
    const cliente = f.cliente.value.trim();
    const items = f.items.value.trim();

    if(!cliente || !items){
      alert("Complete Cliente e Items.");
      return;
    }

    const receta = await fileToBase64(f.fotoReceta.files[0]);
    const pago = await fileToBase64(f.fotoPago.files[0]);

    const pedido = {
      id: genId(),
      cliente,
      items,
      paciente: f.paciente.value.trim(),
      fecha: f.fecha.value,
      nroOperacion: f.nroOperacion.value.trim(),
      tipoOperacion: f.tipoOperacion.value,
      doctor: f.doctor.value.trim(),
      comision: f.comision.value.trim(),
      nroRP: f.nroRP.value.trim(),
      canal: f.canal.value,
      envio: f.envio.value.trim(),
      estado: f.estado.value,
      notas: f.notas.value.trim(),
      receta,
      pago,
      createdAt: new Date().toISOString()
    };

    addPedido(pedido);

    alert("Pedido creado correctamente.");
    f.reset();
    window.location.href = "index.html";
  });
}

// -------------------- SEED --------------------
function seedSampleData(){
  if(localStorage.getItem(STORAGE_KEY)) return;

  const sample = [
    {
      id: genId(),
      cliente: "Rosa Pérez",
      items: "Ibuprofeno x1, Jarabe x1",
      estado: "Pendiente",
      paciente: "Paciente 1",
      fecha: "2025-11-24",
      notas: "Retira en local",
      receta: null,
      pago: null
    }
  ];

  savePedidos(sample);
}

// -------------------- EXPOSE --------------------
window.renderPedidosTable = renderPedidosTable;
window.handleIngresoForm = handleIngresoForm;
window.seedSampleData = seedSampleData;
