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
  content = content.replace(/sm:table/g, 'lg:table');
  content = content.replace(/sm:table-header-group/g, 'lg:table-header-group');
  content = content.replace(/sm:table-row-group/g, 'lg:table-row-group');
  content = content.replace(/sm:table-row/g, 'lg:table-row');
  content = content.replace(/sm:table-cell/g, 'lg:table-cell');
  content = content.replace(/sm:hidden font-bold text-gray-400/g, 'lg:hidden font-bold text-gray-400');
  content = content.replace(/sm:hidden font-bold text-gray-500/g, 'lg:hidden font-bold text-gray-500');
  content = content.replace(/sm:mb-0/g, 'lg:mb-0');
  content = content.replace(/sm:pb-0/g, 'lg:pb-0');
  content = content.replace(/sm:py-1\.5/g, 'lg:py-1.5');
  content = content.replace(/sm:px-2/g, 'lg:px-2');
  content = content.replace(/sm:py-3/g, 'lg:py-3');
  content = content.replace(/sm:py-4/g, 'lg:py-4');
  content = content.replace(/sm:border-0/g, 'lg:border-0');
  content = content.replace(/sm:border-solid/g, 'lg:border-solid');
  content = content.replace(/sm:border-b/g, 'lg:border-b');
  content = content.replace(/sm:border-t-0/g, 'lg:border-t-0');
  content = content.replace(/sm:border-x-0/g, 'lg:border-x-0');
  content = content.replace(/sm:p-0/g, 'lg:p-0');
  content = content.replace(/sm:rounded-none/g, 'lg:rounded-none');
  content = content.replace(/sm:shadow-none/g, 'lg:shadow-none');
  content = content.replace(/sm:text-left/g, 'lg:text-left');
  content = content.replace(/sm:bg-white/g, 'lg:bg-white');
  content = content.replace(/sm:divide-gray-300/g, 'lg:divide-gray-300');
  content = content.replace(/sm:z-auto/g, 'lg:z-auto');
  content = content.replace(/sm:mt-0/g, 'lg:mt-0');
  content = content.replace(/sm:bg-gray-50/g, 'lg:bg-gray-50');
  content = content.replace(/sm:max-w-none/g, 'lg:max-w-none');
  content = content.replace(/<span className="sm:hidden font-bold/g, '<span className="lg:hidden font-bold');
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Refactored classes in:', file);
  }
});
