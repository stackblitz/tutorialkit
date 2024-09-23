import fs from 'node:fs';
import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('./index.html', 'utf8'));

    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('Not found');
});

server.listen(8000);
