const areaTrabajo = document.getElementById('area-trabajo-admin');

// Reportes
const cargarReporte = async (endpoint, titulo, endpointPdf) => {
    if (!areaTrabajo) return;
    areaTrabajo.innerHTML = `<p style="color: yellow;">Cargando ${titulo}...</p>`;

    const botonPdf = endpointPdf
        ? `<a href="${endpointPdf}" class="btn" target="_blank" rel="noopener">Descargar PDF</a>`
        : '';
    
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        if (data.length === 0) {
            areaTrabajo.innerHTML = `<div class="encabezado-reporte"><h3>${titulo}</h3>${botonPdf}</div><hr><p>No hay registros que coincidan.</p>`;
            return;
        }

        const mostrarFechas = data[0].hora !== undefined;
        let html = `<div class="encabezado-reporte"><h3>${titulo}</h3>${botonPdf}</div><hr><table class="tabla-reporte"><tr><th>Correo</th>`;
        if (mostrarFechas) html += `<th>Fecha</th><th>Hora</th>`;
        html += `</tr>`;
                    
        data.forEach(row => {
            const fecha = row.fecha ? row.fecha.split('T')[0] : '';
            html += `<tr><td>${row.correo}</td>`;
            if (mostrarFechas) html += `<td>${fecha}</td><td>${row.hora}</td>`;
            html += `</tr>`;
        });
        
        html += `</table>`;
        areaTrabajo.innerHTML = html;
    } catch (error) { 
        areaTrabajo.innerHTML = `<p class="texto-peligro">${error.message || 'Error de conexión.'}</p>`; 
    }
};

document.getElementById('btn-rep-atrasos')?.addEventListener('click', () => cargarReporte('/api/asistencia/reporte/atrasos', 'Entradas Atrasadas', '/api/asistencia/reporte/atrasos/pdf'));
document.getElementById('btn-rep-anticipadas')?.addEventListener('click', () => cargarReporte('/api/asistencia/reporte/anticipadas', 'Salidas Anticipadas', '/api/asistencia/reporte/anticipadas/pdf'));
document.getElementById('btn-rep-inasistencias')?.addEventListener('click', () => cargarReporte('/api/asistencia/reporte/inasistencias', 'Empleados Ausentes Hoy', '/api/asistencia/reporte/inasistencias/pdf'));

// Gestion de usuarios
function mostrarMensaje(elementoId, mensaje, esExito) {
    const el = document.getElementById(elementoId);
    el.textContent = mensaje;
    el.style.color = esExito ? 'var(--color-principal)' : 'var(--color-peligro)';
}

// Crear
document.getElementById('btn-crear-usuario')?.addEventListener('click', () => {
    areaTrabajo.innerHTML = `
        <h3>Crear Nuevo Usuario</h3><hr>
        <form id="form-crear-usuario">
            <input type="email" id="nuevo-correo" class="input-base" placeholder="Correo electrónico" required>
            <input type="password" id="nueva-pass" class="input-base" placeholder="Contraseña" required>
            <button type="submit" class="btn">Guardar Usuario</button>
        </form>
        <p id="msg-usuario"></p>
    `;

    document.getElementById('form-crear-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const correo = document.getElementById('nuevo-correo').value;
        const password = document.getElementById('nueva-pass').value;

        if (!validarCorreo(correo) || !validarPassword(password)) {
            return mostrarMensaje('msg-usuario', 'Datos inválidos. Verifica correo y contraseña (min 6 chars).', false);
        }

        try {
            const response = await fetch('/api/usuarios/crear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password })
            });
            const data = await response.json();
            mostrarMensaje('msg-usuario', data.mensaje || data.error, response.ok);
            if(response.ok) e.target.reset();
        } catch (error) { console.error(error); }
    });
});

// Modificar
document.getElementById('btn-modificar-usuario')?.addEventListener('click', () => {
    areaTrabajo.innerHTML = `
        <h3>Modificar Usuario</h3><hr>
        <form id="form-modificar-usuario">
            <input type="email" id="mod-correo" class="input-base" placeholder="Correo electrónico actual" required>
            <input type="password" id="mod-pass" class="input-base" placeholder="Nueva Contraseña (opcional)">
            <button type="submit" class="btn">Actualizar Usuario</button>
        </form>
        <p id="msg-modificar"></p>
    `;

    document.getElementById('form-modificar-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const correo = document.getElementById('mod-correo').value;
        const password = document.getElementById('mod-pass').value;

        try {
            const response = await fetch('/api/usuarios/modificar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password })
            });
            const data = await response.json();
            mostrarMensaje('msg-modificar', data.mensaje || data.error, response.ok);
            if(response.ok) e.target.reset();
        } catch (error) { console.error(error); }
    });
});

// Eliminar
document.getElementById('btn-eliminar-usuario')?.addEventListener('click', () => {
    areaTrabajo.innerHTML = `
        <h3 class="texto-peligro">Eliminar Usuario</h3><hr>
        <form id="form-eliminar-usuario">
            <input type="email" id="eliminar-correo" class="input-base input-peligro" placeholder="Correo electrónico" required>
            <button type="submit" class="btn btn-peligro">Eliminar Definitivamente</button>
        </form>
        <p id="msg-eliminar"></p>
    `;

    document.getElementById('form-eliminar-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const correo = document.getElementById('eliminar-correo').value;
        
        if (confirm(`¿Está seguro de eliminar a ${correo}?`)) {
            try {
                const response = await fetch('/api/usuarios/eliminar', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo })
                });
                const data = await response.json();
                mostrarMensaje('msg-eliminar', data.mensaje || data.error, response.ok);
            } catch (error) { console.error(error); }
        }
    });
});