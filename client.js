const http = require('http');
const net = require('net');
let args = process.argv;

if (!args[2]) {
  console.log(`

****************
help / usage
****************
use the 'node client.js' command with a resource endpoint address to 
get the data from that endpoint printed for you.

example: node client.js localhost8080/helium.html

  `);

} else {

  let URI = args[2].slice(args[2].indexOf('/'));
  let host;
  let port;

  if (host === "localhost:8080") {
    port = 8080;
    host = args[2].slice(0, 9);
  } else {
    port = 80;
    host = args[2].slice(0, args[2].indexOf('/'))
  }

  const requestHeader = `GET ${URI} HTTP/1.1
Host: ${host}
Connection: Keep-alive
Accept: */*
Date: ${new Date().toUTCString()} 
  `;

  console.log(requestHeader);

  const client = new net.Socket();
  client.connect(`${port}`, `${host}`, () => {
    console.log('connected');
    client.setEncoding('utf-8');
    client.write(requestHeader);
  });

  client.on('data', (data) => {
    console.log(data.toString('utf8'));
    //client.destroy();
  });

  client.on('close', () => {
    console.log('connection closed');
  });
};
