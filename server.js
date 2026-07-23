const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const rootDir = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end('500 Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = req.url.split('?')[0];
  let filePath = path.join(rootDir, requestUrl);

  if (requestUrl === '/' || requestUrl === '') {
    filePath = path.join(rootDir, 'index.html');
  }

  if (!filePath.startsWith(rootDir)) {
    res.statusCode = 403;
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.statusCode = 404;
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (dirErr, dirStats) => {
        if (dirErr || !dirStats.isFile()) {
          res.statusCode = 404;
          res.end('404 Not Found');
          return;
        }
        sendFile(res, filePath);
      });
      return;
    }

    sendFile(res, filePath);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
