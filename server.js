const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(session({
    secret: 'clave_secreta_super_segura',
    resave: false,
    saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// solo administradores
app.use('/admin.html', (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login.html');
    if (req.session.rol !== 'administrador') return res.redirect('/menu.html');
    next();
});

// usuarios logeados
app.use('/menu.html', (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login.html');
    next();
});

// Entrega los archivos publicos si se paso la verificacion
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const usuariosRoutes = require('./routes/usuarios');
app.use('/', usuariosRoutes);

const asistenciaRoutes = require('./routes/asistencia');
app.use('/api/asistencia', asistenciaRoutes);

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});