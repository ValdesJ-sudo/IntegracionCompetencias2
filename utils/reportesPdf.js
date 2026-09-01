function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL');
}

function encabezado(titulo) {
  return [
    { text: titulo, style: 'titulo' },
    { text: `Generado el ${new Date().toLocaleDateString('es-CL')}`, style: 'subtitulo' },
    { text: ' ', margin: [0, 8] }
  ];
}

const estilosBase = {
  styles: {
    titulo: { fontSize: 18, bold: true, margin: [0, 0, 0, 2] },
    subtitulo: { fontSize: 9, color: '#666666' },
    tableHeader: { bold: true, fillColor: '#eeeeee' },
    vacio: { italics: true, color: '#888888', margin: [0, 10, 0, 0] }
  },
  defaultStyle: { fontSize: 10 },
  pageMargins: [40, 50, 40, 50]
};

// datos: filas con { correo, fecha, hora }
function construirReporteAtrasos(datos) {
  return {
    ...estilosBase,
    content: [
      ...encabezado('Reporte de Atrasos'),
      datos.length === 0
        ? { text: 'No se registraron atrasos.', style: 'vacio' }
        : {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: [
                [
                  { text: 'Correo', style: 'tableHeader' },
                  { text: 'Fecha', style: 'tableHeader' },
                  { text: 'Hora de entrada', style: 'tableHeader' }
                ],
                ...datos.map(fila => [fila.correo, formatearFecha(fila.fecha), fila.hora])
              ]
            },
            layout: 'lightHorizontalLines'
          }
    ]
  };
}

// datos: filas con { correo, fecha, hora }
function construirReporteAnticipadas(datos) {
  return {
    ...estilosBase,
    content: [
      ...encabezado('Reporte de Salidas Anticipadas'),
      datos.length === 0
        ? { text: 'No se registraron salidas anticipadas.', style: 'vacio' }
        : {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: [
                [
                  { text: 'Correo', style: 'tableHeader' },
                  { text: 'Fecha', style: 'tableHeader' },
                  { text: 'Hora de salida', style: 'tableHeader' }
                ],
                ...datos.map(fila => [fila.correo, formatearFecha(fila.fecha), fila.hora])
              ]
            },
            layout: 'lightHorizontalLines'
          }
    ]
  };
}

// datos: filas con { correo }
function construirReporteInasistencias(datos) {
  return {
    ...estilosBase,
    content: [
      ...encabezado('Reporte de Inasistencias del Día'),
      datos.length === 0
        ? { text: 'No hay inasistencias registradas hoy.', style: 'vacio' }
        : {
            table: {
              headerRows: 1,
              widths: ['*'],
              body: [
                [{ text: 'Correo', style: 'tableHeader' }],
                ...datos.map(fila => [fila.correo])
              ]
            },
            layout: 'lightHorizontalLines'
          }
    ]
  };
}

module.exports = {
  construirReporteAtrasos,
  construirReporteAnticipadas,
  construirReporteInasistencias
};