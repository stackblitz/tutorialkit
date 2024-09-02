import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Index page');

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
