const pdf = require('pdf-parse');
const fs = require('fs');

console.log('Type of pdf-parse:', typeof pdf);
console.log('Value of pdf-parse:', pdf);

if (typeof pdf !== 'function') {
    console.error('CRITICAL: pdf-parse is not a function!');
    try {
        const defaultExport = require('pdf-parse').default;
        console.log('Checking default export:', defaultExport);
    } catch (e) {
        console.log('No default export found.');
    }
} else {
    console.log('pdf-parse is a function. Ready to parse.');
}