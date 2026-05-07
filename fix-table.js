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
  let original = content;

  // 1. Fix the `tr` container to be `block` instead of `flex flex-col`
  content = content.replace(/flex flex-col lg:table-row/g, 'block lg:table-row');
  content = content.replace(/flex flex-col sm:table-row/g, 'block sm:table-row');
  content = content.replace(/flex flex-col md:table-row/g, 'block md:table-row');

  // 2. Ensure all `td`s have `lg:table-cell` if they have `flex justify-between` but missing the table-cell
  // E.g., <td className="flex justify-between items-center px-1 ... lg:border-0"> -> add lg:table-cell
  // I will just broadly replace "flex justify-between" with "flex justify-between lg:table-cell" 
  // ONLY if it doesn't already have lg:table-cell
  const tdRegex = /className=['"]([^'"]*flex justify-between[^'"]*)['"]/g;
  content = content.replace(tdRegex, (match, p1) => {
    if (!p1.includes('lg:table-cell') && !p1.includes('sm:table-cell') && !p1.includes('md:table-cell')) {
      return `className="${p1} lg:table-cell"`;
    }
    return match;
  });

  // 3. Make sure all remaining `sm:hidden` or `md:hidden` labels inside td are converted to `lg:hidden`
  // since we unified the breakpoint to lg.
  content = content.replace(/<span className=['"]([^'"]*hidden[^'"]*)['"]/g, (match, p1) => {
    if (p1.includes('font-bold')) { // this is our label
      let newClass = p1.replace(/sm:hidden/g, 'lg:hidden').replace(/md:hidden/g, 'lg:hidden');
      return `<span className="${newClass}"`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed classes in:', file);
  }
});
