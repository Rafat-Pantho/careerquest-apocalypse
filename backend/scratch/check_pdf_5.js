const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function test() {
    try {
        const buffer = Buffer.from([]); // Empty buffer or real file
        const parser = new PDFParse({ data: buffer });
        console.log('Parser instance created');
        // If it's empty it might throw or return empty
        const result = await parser.getText();
        console.log('Text extracted:', result.text);
        await parser.destroy();
    } catch (e) {
        console.log('Error:', e.message);
    }
}

test();
