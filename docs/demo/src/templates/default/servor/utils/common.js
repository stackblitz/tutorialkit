const fs = require('fs');
const os = require('os');
const net = require('net');

const fileWatch =
  process.platform !== 'linux'
    ? (path, cb) => fs.watch(path, { recursive: true }, cb)
    : (path, cb) => {
        if (fs.statSync(path).isDirectory()) {
          fs.watch(path, cb);
          fs.readdirSync(path).forEach((xx) => fileWatch(`${path}/${xx}`, cb));
        }
      };

module.exports.fileWatch = fileWatch;

const usePort = (port = 0) =>
  new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on('error', reject);

    server.listen(port, () => {
      return (address = server.address()) && server.close(() => resolve(address.port));
    });
  });

module.exports.usePort = usePort;

const networkIps = Object.values(os.networkInterfaces())
  .reduce((every, i) => [...every, ...i], [])
  .filter((i) => i.family === 'IPv4' && i.internal === false)
  .map((i) => i.address);

module.exports.networkIps = networkIps;
