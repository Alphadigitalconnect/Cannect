const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'page.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// We want to find the start index of 'TAB 2: ARTICLES CMS' and end at the next '}' before 'TAB 3: EVENTS CMS'
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('TAB 2: ARTICLES CMS')) {
    startIdx = i;
  }
  if (startIdx !== -1 && lines[i].includes('TAB 3: EVENTS CMS')) {
    // Find the closing brace of the previous section, which is typically the line before
    endIdx = i - 1;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  console.log(`Removing lines ${startIdx + 1} to ${endIdx + 1}`);
  console.log('Start:', lines[startIdx]);
  console.log('End:', lines[endIdx]);
  
  lines.splice(startIdx, endIdx - startIdx + 1);
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('Successfully cleaned up!');
} else {
  console.error('Could not find marker lines!');
}
