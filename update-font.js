const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove all occurrences of font-serif and font-sans classes
content = content.replace(/\bfont-serif\b\s*/g, '');
content = content.replace(/\bfont-sans\b\s*/g, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed font overrides from dashboard page.');
