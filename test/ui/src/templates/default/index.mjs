import http from 'node:http';
import { readFileSync } from 'node:fs';

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync('./index.html', 'utf8'));

    return;
  }

  if (req.url === '/about.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(readFileSync('./about.html'));

    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('Not found');
});

server.listen(8000);
