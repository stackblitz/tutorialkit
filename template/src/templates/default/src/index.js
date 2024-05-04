const servor = require('servor');
const { createServer } = require('http');

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
createServer((_req, res) => res.end('Server 2')).listen(2);

servor({
  root: 'src/',
  reload: true,
  port: 8080,
});
