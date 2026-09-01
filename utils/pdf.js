const path = require('path');
const pdfMake = require('pdfmake');

// pdfmake necesita que le indiques archivos .ttf reales para poder dibujar texto.
// El propio paquete "pdfmake" ya incluye la familia Roboto en su carpeta /fonts,
// así que la reutilizamos con require.resolve (no hace falta descargar nada aparte).
const fontsDir = path.join(path.dirname(require.resolve('pdfmake/package.json')), 'fonts', 'Roboto');

pdfMake.setFonts({
  Roboto: {
    normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
    bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
    italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
    bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
  }
});

// Nuestros documentos no referencian imágenes locales ni URLs externas, así que
// restringimos ese acceso por seguridad: solo se permite leer los .ttf de la
// carpeta de fuentes; cualquier otro archivo o URL queda bloqueado (evita que
// un docDefinition mal formado termine leyendo archivos del servidor o
// disparando peticiones a internet).
pdfMake.setLocalAccessPolicy((filePath) => filePath.startsWith(fontsDir));
pdfMake.setUrlAccessPolicy(() => false);

// Genera el PDF como Buffer a partir de una docDefinition de pdfmake
async function crearPdfBuffer(docDefinition) {
  const doc = pdfMake.createPdf(docDefinition);
  return doc.getBuffer();
}

// Genera el PDF y lo envía como respuesta HTTP descargable
async function enviarPdf(res, docDefinition, nombreArchivo) {
  const buffer = await crearPdfBuffer(docDefinition);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  res.send(buffer);
}

module.exports = { crearPdfBuffer, enviarPdf };