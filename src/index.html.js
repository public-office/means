const manifest = JSON.parse(require('fs').readFileSync(0, 'utf8'))
const entry = manifest['src/index.js']

console.log(`
<!doctype html>
<html>
<head>
  <title>Means</title>
  ${entry.css.map(css => `<link rel="stylesheet" href="/${css}" />`).join('\n')}
  <script type="module" src="/${entry.file}"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`)