import http from 'node:http';
import fs from 'node:fs';

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync('./index.html', 'utf-8'));

    return;
  }

  if (req.url === '/about.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('About page');

    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('Not found');
});

server.listen(8000);
