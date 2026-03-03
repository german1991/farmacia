const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// rutas API
// rutas API
app.use('/api/pedidos', require('./backend/routes/pedidos.routes'));
app.use('/api/clientes', require('./backend/routes/clientes.routes'));
app.use('/api/cuenta-corriente', require('./backend/routes/cuentaCorriente.routes'));
app.use('/api/arqueo', require('./backend/routes/arqueo.routes')); // <--- NUEVA RUTA



// servir archivos HTML, JS, CSS desde la raíz
app.use(express.static(__dirname, { index: false }));

// ruta home → login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
