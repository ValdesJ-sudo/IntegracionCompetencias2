const path = require('path');
const PdfPrinter = require('pdfmake');

// pdfmake NO trae fuentes por defecto en Node: hay que apuntar a archivos .ttf reales.
// Descarga la familia "Roboto" desde Google Fonts y coloca los 4 archivos en /fonts
// (mismo nivel que /routes y /utils), o ajusta las rutas si usas otra fuente.
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../fonts/Roboto-MediumItalic.ttf'),
  }
};

const printer = new PdfPrinter(fonts);

// Genera el documento pdfkit a partir de una docDefinition de pdfmake
function crearPdf(docDefinition) {
  return printer.createPdfKitDocument(docDefinition);
}

// Genera y transmite el PDF directo en la respuesta HTTP (sin guardarlo en disco)
function enviarPdf(res, docDefinition, nombreArchivo) {
  const doc = crearPdf(docDefinition);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

  doc.pipe(res);
  doc.end();
}

module.exports = { crearPdf, enviarPdf };