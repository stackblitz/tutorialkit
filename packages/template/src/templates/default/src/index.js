const { createServer } = require('node:http');
const servor = require('servor');

createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });

  res.end(`
    <!DOCTYPE html>
    <html>
      <body>
        <h2>Test results</h2>
        <p>All passed!</p>
      </body>
    </html>
  `);
}).listen(1);

createServer((req, res) => res.end(`Server 2\n${req.method} ${req.url}`)).listen(2);

servor({
  root: 'src/',
  reload: true,
  port: 8080,
});
