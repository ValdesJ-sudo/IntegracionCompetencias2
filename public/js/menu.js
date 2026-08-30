const btnMarcar = document.getElementById('btn-marcar');
const listaHistorial = document.getElementById('lista-historial');

const textoBoton = {
  entrada: 'Marcar Entrada',
  salida: 'Marcar Salida'
};

let proximaAccion = 'entrada';

const actualizarBoton = (accion) => {
  proximaAccion = accion;
  btnMarcar.textContent = textoBoton[accion];
  btnMarcar.dataset.accion = accion;
}

// Revisar el rol al cargar la página para mostrar o ocultar el boton de admin
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/usuarios/me');
    if (res.ok) {
      const data = await res.json();
      if (data.rol === 'administrador') {
        document.getElementById('btn-enlace-admin').style.display = 'inline-block';
      }
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
  }

  try {
    const res = await fetch('/api/asistencia/estado');
    if (res.ok) {
      const data = await res.json();
      actualizarBoton(data.ultimaAccion === 'entrada' ? 'salida' : 'entrada');
    }
  } catch (error) {
    console.error('Error obteniendo estado de asistencia:', error);
  }
});

const marcarAsistencia = async (accion) => {
  try {
    const response = await fetch('/api/asistencia/marcar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion })
    });

    const data = await response.json();

    if (response.ok) {
      if (listaHistorial.querySelector('li').textContent === 'Esperando acción...') {
        listaHistorial.innerHTML = '';
      }

      const ahora = new Date();
      const li = document.createElement('li');
      li.className = 'registro';
      li.textContent = `${accion.toUpperCase()} registrada a las ${ahora.toLocaleTimeString()}`;
      listaHistorial.prepend(li);

      actualizarBoton(accion === 'entrada' ? 'salida' : 'entrada');
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
};

btnMarcar?.addEventListener('click', () => marcarAsistencia(proximaAccion));