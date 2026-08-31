const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE correo = ? AND estado_activo = TRUE',
      [correo]
    );

    if (rows.length === 0) return res.status(401).send('Usuario no encontrado o inactivo.');

    const usuario = rows[0];
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
    const passwordHasheada = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO usuarios (correo, contrasena, estado_activo) VALUES (?, ?, TRUE)',
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
      const passwordHasheada = await bcrypt.hash(password, 10);

      query = 'UPDATE usuarios SET contrasena = ? WHERE correo = ? AND estado_activo = TRUE';
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
      'UPDATE usuarios SET estado_activo = FALSE WHERE correo = ?',
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


module.exports = router;