require('dotenv').config()

const manifest = JSON.parse(require('fs').readFileSync(0, 'utf8'))
const entry = manifest['src/index.js']

const base = process.env.DEPLOY_DRIVE || ''

console.log(`
<!doctype html>
<html>
<head>
  <title>Means</title>
  ${entry.css.map(css => `<link rel="stylesheet" href="${base}/.ui/${css}" />`).join('\n')}
  <script type="module" src="${base}/.ui/${entry.file}"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`.trim())