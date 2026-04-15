const { PDFParse } = require('pdf-parse');
console.log('Type of PDFParse:', typeof PDFParse);
try {
    const instance = new PDFParse(Buffer.from([]));
    console.log('Instance created successfully with new');
    console.log('Methods of instance:', Object.keys(Object.getPrototypeOf(instance)));
} catch (e) {
    console.log('Failed with new:', e.message);
}
