const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuario WHERE correo = ? AND estado_activo = TRUE',
      [correo]
    );

    if (rows.length === 0) return res.status(401).send('Usuario no encontrado o inactivo.');

    const usuario = rows[0];

    // FALTABA: Comparar la contraseña ingresada con el hash de la BD usando bcrypt
    const coincide = await bcrypt.compare(password, usuario.contrasena);

    if (!coincide) {
      return res.status(401).send('Contraseña incorrecta.');
    }

    req.session.userId = usuario.id_usuario;
    req.session.rol = usuario.rol;

    res.redirect(usuario.rol === 'administrador' ? '/admin.html' : '/menu.html');
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).send('Error interno del servidor.');
  }
});

router.post('/api/usuarios/crear', async (req, res) => {
  const { correo, password } = req.body;
  try {
    // FALTABA: Hashear la contraseña antes de guardarla
    const passwordHasheada = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO usuario (correo, contrasena, estado_activo) VALUES (?, ?, TRUE)',
      [correo, passwordHasheada]
    );
    res.json({ mensaje: 'Usuario creado exitosamente.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El correo ya está registrado.' });
    } else {
      res.status(500).json({ error: 'Error al crear el usuario.' });
    }
  }
});

router.put('/api/usuarios/modificar', async (req, res) => {
  const { correo, password } = req.body;
  try {
    let query = '';
    let params = [];

    if (password && password.trim() !== '') {
      // FALTABA: Hashear la nueva contraseña
      const passwordHasheada = await bcrypt.hash(password, 10);

      query = 'UPDATE usuario SET contrasena = ? WHERE correo = ? AND estado_activo = TRUE';
      params = [passwordHasheada, correo];
    } else {
      return res.status(400).json({ error: 'No se enviaron datos para actualizar.' });
    }

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado o está inactivo.' });
    }
    res.json({ mensaje: 'Usuario actualizado exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al modificar el usuario.' });
  }
});

router.delete('/api/usuarios/eliminar', async (req, res) => {
  const { correo } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE usuario SET estado_activo = FALSE WHERE correo = ?',
      [correo]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ mensaje: 'Usuario dado de baja exitosamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
});

// verificar rol en el frontend
router.get('/api/usuarios/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'No autorizado' });
  res.json({ rol: req.session.rol });
});

// RUTA TEMPORAL CORREGIDA (usando router, pool y columnas reales)
router.get('/api/migrar-passwords', async (req, res) => {
  try {
    const [usuarios] = await pool.query('SELECT id_usuario, contrasena FROM usuarios');
    let actualizados = 0;

    for (let usuario of usuarios) {
      // Validamos que exista la contraseña y no empiece con '$' (indicativo de bcrypt)
      if (usuario.contrasena && !usuario.contrasena.startsWith('$')) {
        const passwordHasheada = await bcrypt.hash(usuario.contrasena, 10);

        await pool.query(
          'UPDATE usuario SET contrasena = ? WHERE id_usuario = ?',
          [passwordHasheada, usuario.id_usuario]
        );
        actualizados++;
      }
    }

    res.json({ mensaje: `Proceso terminado. Se actualizaron ${actualizados} usuarios.` });
  } catch (error) {
    console.error('Error migrando contraseñas:', error);
    res.status(500).json({ error: 'Error al leer la base de datos' });
  }
});

module.exports = router;