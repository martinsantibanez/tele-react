const fs = require('fs');
const path = require('path');
const args = process.argv;
console.log('args', args);
const dir = args[2];
if (!dir) throw new Error('Usage: node extract.js <dir>');
const resolvedPath = path.resolve(dir);
const files = fs.readdirSync(resolvedPath);
const matches = [];
console.log('files', files);
const notMatched = [];

for (const filename of files) {
  const filepath = path.join(resolvedPath, filename);
  const file = fs.readFileSync(filepath, 'utf8');
  const match = file.match(/file:\"(.*)\",/);
  if (!match) {
    notMatched.push(filename);
    continue
  }
  const m3u8Url = match[1];
  const elementTitle = `${filename.replace('_', ' ')}`;
  const newSlug = filename.replace('.html', '');
  matches.push(`${newSlug} : {
    slug: "${newSlug} ",
    listTitle: "${elementTitle}",
    m3u8Url: "${m3u8Url}"
  },`);
}
fs.writeFileSync(`${dir}.js`, matches.join('\n'));

for (const match of matches) {
  console.log(match);
}

console.log('-----');
console.log('notMatched', notMatched);
