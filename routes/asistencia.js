const express = require('express');
const router = express.Router();
const pool = require('../db'); 

const verificarSesion = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No autorizado. Inicie sesión.' });
  }
  next();
};

router.post('/marcar', verificarSesion, async (req, res) => {
  const { accion } = req.body; 
  const id_usuario = req.session.userId;

  try {
    // Revisar cual fue la ultima accion del usuario
    const [historial] = await pool.query(
      'SELECT accion FROM registro_asistencia WHERE id_usuario = ? AND fecha = CURDATE() ORDER BY hora DESC LIMIT 1',
      [id_usuario]
    );

    const ultimaAccion = historial.length > 0 ? historial[0].accion : null;

    // Anti Spam
    if (accion === 'entrada' && ultimaAccion === 'entrada') {
      return res.status(400).json({ error: 'Ya tienes una entrada activa. Debes marcar salida.' });
    }
    
    if (accion === 'salida' && ultimaAccion === 'salida') {
      return res.status(400).json({ error: 'Ya marcaste tu salida previamente.' });
    }

    if (accion === 'salida' && ultimaAccion === null) {
      return res.status(400).json({ error: 'No puedes marcar salida sin haber marcado entrada hoy.' });
    }

    // Si aprueba, se inserta en la bd
    await pool.query(
      'INSERT INTO registro_asistencia (id_usuario, accion, fecha, hora) VALUES (?, ?, CURDATE(), CURTIME())',
      [id_usuario, accion]
    );
    res.json({ mensaje: `Registro de ${accion} exitoso.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la asistencia.' });
  }
});

// Api para obtener el estado del boton
router.get( '/estado', verificarSesion, async ( req, res ) => {
  const id_usuario = req.session.userId;

  try {
    const [historial] = await pool.query(
      'SELECT accion FROM registro_asistencia WHERE id_usuario = ? AND fecha = CURDATE() ORDER BY hora DESC LIMIT 1',
            [id_usuario]
    ); 
    const ultimaAccion = historial.length > 0 ? historial[0].accion : null;
    res.json({ ultimaAccion });
  } catch (error) {
    console.error(error);
    res.status(500).json( 
      { 
        error: 'Error al obtener el estado de asistencia.'
      }
    );
  }
});

router.get('/reporte/atrasos', verificarSesion, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.correo, r.fecha, r.hora 
      FROM registro_asistencia r 
      JOIN usuarios u ON r.id_usuario = u.id_usuario 
      WHERE r.accion = 'entrada' AND r.hora > '09:30:00'
      ORDER BY r.fecha DESC, r.hora DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte.' });
  }
});

router.get('/reporte/anticipadas', verificarSesion, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.correo, r.fecha, r.hora 
      FROM registro_asistencia r 
      JOIN usuarios u ON r.id_usuario = u.id_usuario 
      WHERE r.accion = 'salida' AND r.hora < '17:30:00'
      ORDER BY r.fecha DESC, r.hora DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte.' });
  }
});

router.get('/reporte/inasistencias', verificarSesion, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT correo 
      FROM usuarios 
      WHERE rol = 'empleado' AND estado_activo = TRUE AND id_usuario NOT IN (
        SELECT id_usuario 
        FROM registro_asistencia 
        WHERE fecha = CURDATE()
      )
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte.' });
  }
});

module.exports = router;