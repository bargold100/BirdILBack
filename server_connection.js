// //var path = require("path");
// //var app = require('./main');
// //var https = require('https');
// //var fs = require('fs');
// import path from "path";
// import app from "./app.js";
// import https from "https";
// import fs from 'fs';



// var privateKey  = fs.readFileSync('privkey.pem', 'utf8');
// var certificate = fs.readFileSync('fullchain.pem', 'utf8');
// var credentials = {key: privateKey, cert: certificate};
// // var server = http.createServer(app);
// var server = https.createServer(credentials, app);

// // var httpsOptions = {
// //   key: fs.readFileSync(path.join(__dirname, "privkey.pem")),//server.key
// //   cert: fs.readFileSync(path.join(__dirname, "fullchain.pem")),//server.cert
// // }

// /**
//  * Get port from environment and store in Express.
//  */
// var port = normalizePort(process.env.PORT || '443');

// app.set('port', port);

// /**
//  * Create HTTP server.
//  */
// //var server = https.createServer(httpsOptions, app);

// /**
//  * Listen on provided port, on all network interfaces.
//  */
// server.listen(port);
// server.on('error', onError);
// server.on('listening', onListening);

// /**
//  * Normalize a port into a number, string, or false.
//  */
// function normalizePort(val) {
//   var port = parseInt(val, 10);

//   if (isNaN(port)) {
//     // named pipe
//     return val;
//   }

//   if (port >= 0) {
//     // port number
//     return port;
//   }

//   return false;
// }

// /**
//  * Event listener for HTTP server "error" event.
//  */
// function onError(error) {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }
//   var bind = typeof port === 'string'
//     ? 'Pipe ' + port
//     : 'Port ' + port;
//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case 'EACCES':
//       console.error(bind + ' requires elevated privileges');
//       process.exit(1);
//       break;
//     case 'EADDRINUSE':
//       console.error(bind + ' is already in use');
//       process.exit(1);
//       break;
//     default:
//       throw error;
//   }
// }

// /**
//  * Event listener for HTTP server "listening" event.
//  */
// server.address("https://ibra.cs.bgu.ac.il");
// function onListening() {
//   var addr = server.address();
//   var bind = typeof addr === 'string'
//     ? 'pipe ' + addr
//     : 'port ' + addr.port;
//     console.log(`Server listen in port ${port} in adrress ${addr.address}`);
// }
import path from "path";
import app from "./app.js";
import https from "https";
import fs from 'fs';
import express from 'express';
const app_express = express();

const privateKey  = fs.readFileSync('privkey.pem', 'utf8');
const certificate = fs.readFileSync('fullchain.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};

const port = normalizePort(process.env.PORT || '443');
app_express.set('port', port);

const server = https.createServer(credentials, app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
server.address("https://ibra.cs.bgu.ac.il");
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    console.log(`Server listen in port ${port} in adrress ${addr.address}`);
}
