const file404 = require('./404.js');
const helium = require('./helium.js');
const hydrogen = require('./hydrogen.js');
const index = require('./index.js');
const styles = require('./styles');
const net = require('net');

let contentType = "text/html; charset=utf-8";
let body = "";
let date = "";

// this creates a server
const server = net.createServer((socket) => {
  socket.setEncoding('utf8');
  socket.on('data', (data) => {
    let URI = data.slice(4, data.indexOf("H") - 1);

    if (URI === "/" || URI === "/index.html") {
      body = index.index;
    } else if (URI === "/hydrogen.html") {
      body = hydrogen.hydrogen;
    } else if (URI === "/helium.html") {
      body = helium.helium;
    } else if (URI === "/css/styles.css") {
      body = styles.styles;
      contentType = "text/css";
    } else {
      body = file404.file404;
    }
    date = new Date().toUTCString();

    let response = `
      HTTP/1.1 200 OK
      Server: skynet/4.1.15
      Date: ${date}
      Content-Type: ${contentType}
      Content-Length: ${body.length}

      ${body}
    `;

    socket.end(response);
  });
})
  .on('error', (err) => {
    console.log(err);
  });

server.listen(8080, () => {
  console.log('Server is UP');
});