const servor = require('servor');
const { createServer } = require('http');

createServer((_req, res) => res.end('Server 1')).listen(1);
createServer((_req, res) => res.end('Server 2')).listen(2);

servor({
  root: 'src/',
  reload: true,
  port: 8080,
});
