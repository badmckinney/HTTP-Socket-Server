const http = require('http');
const net = require('net');
let args = process.argv;

/**********************
    User Arguments
**********************/

if (!args[2]) {
  console.log(`

****************
help / usage
****************

  * Use the 'node client.js' command with a valid web address to 
    get the data from that endpoint printed for you.

example: node client.js localhost8080/helium.html

  * Additionally, you can specify 3 options after the web address:

    1) Specify the request method. You can specify which http request 
       method you would like to use by typing either "GET", "POST", 
       "PUT", or "DELETE" (case-insensitive). By default, the request will
       be a GET request

    2) If you want to only get the response header back instead of both the 
       header and full response body, you can specify with the "-h" flag. By
       default, You will receive the full header and body in the response.

    3) Lastly, you can specify a port if necessary. This can be done by using
       the keyword "port" immediately followed by the desired port number. By
       default, port80 will be used.

    These 3 options can be specified in any order and/or specified completely
    indepenedent of eachother.

    Below is an example of using all 3 options:

example: node client.js google.com -h GET port80

  `);

} else {

  let URI = args[2].slice(args[2].indexOf('/'));
  let host;
  let port = 80;
  let method = 'GET';
  let headersOnly = false;
  let requestHeader;
  let methods = ["GET", "POST", "PUT", "DELETE"];

  args.forEach(arg => {
    if (arg === "-h") {
      headersOnly = true;
    } else if (arg.slice(0, 4).toLowerCase() === "port") {
      port = arg.slice(4);
    } else if (methods.includes(arg.toUpperCase())) {
      method = arg;
    }
  });


  if (args[2].slice(0, 9) === "localhost") {
    port = 8080;
    host = args[2].slice(0, 9);

    requestHeader = `${method} ${URI} HTTP/1.1\r\n`;
    requestHeader += `host: ${host}:8080\r\n`;
    requestHeader += `date: ${new Date().toUTCString()}\r\n`;
    requestHeader += `\r\n`;
  } else {

    host = args[2].slice(0, args[2].indexOf('/'));

    requestHeader = `${method} ${URI} HTTP/1.1\r\n`;
    requestHeader += `host: ${host}\r\n`;
    requestHeader += `date: ${new Date().toUTCString()}\r\n`;
    requestHeader += `\r\n`;
  }

  /***************
      Client
  ***************/

  const responseHeaders = {};
  let responseBody;

  let client = net.createConnection(port, host);
  client.setEncoding('utf-8');

  client.on('connect', () => {
    console.log('connected');
    client.write(requestHeader);
  });

  client.on('error', (err) => {
    if (err.code === "ENOTFOUND") {
      process.stdout.write(`${err.code}: ${host} cannot be reached. Please provide a valid web address`);
    } else if (err.code === "ETIMEDOUT") {
      process.stdout.write(`${err.code}: Connection timed out. Please check that you are using the proper port`);
    } else {
      process.stdout.write(`There was an error: ${err.code}`);
    }
  });

  client.on('data', (data) => {
    let status = data.slice(data.indexOf('.') + 3, data.indexOf('\r\n'));
    let responseHeader = data.slice(data.indexOf('\r\n'), data.indexOf('\r\n\r\n'));
    responseBody = data.slice(data.indexOf('\r\n\r\n') + 1);

    if (status[0] === "4") {
      process.stdout.write(`Client Error: ${status}`);
    } else if (status[0] === "5") {
      process.stdout.write(`Server Error: ${status}`);
    } else {

      if (headersOnly) {
        process.stdout.write(`${responseHeader} \r\n`);
      } else {
        process.stdout.write(`${responseBody} \r\n`);
      }
    };

    let headers = responseHeader.split('\r\n');
    headers.forEach(header => {
      if (header) {
        let colonIndex = header.indexOf(':');
        let key = `${header.slice(0, colonIndex)}`;
        let value = header.slice(colonIndex + 2);
        responseHeaders[key] = value;
      }
    });

    client.end();
  });

  client.on('end', () => {
    console.log('connection ended');
  });
};
