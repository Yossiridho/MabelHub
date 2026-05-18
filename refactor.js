const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src', 'app'));
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('<Sidebar />')) {
    content = content.replace(/\s*<Sidebar \/>/g, '');
    changed = true;
  }
  
  const importRegex = /import\s+Sidebar\s+from\s+['"][^'"]*sidebar[^'"]*['"];?\r?\n?/g;
  if (content.match(importRegex)) {
    content = content.replace(importRegex, '');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Processed:', file);
  }
});
console.log('Refactoring complete.');
