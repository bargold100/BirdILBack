const port = process.env.port || 3001;
//const path = require('path');
//const express = require('express');
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
const app = express(); 


// Have Node serve the files for our built React app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.resolve(__dirname, '../birds_front_end_2023/build')));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {

  res.sendFile(path.resolve(__dirname, '../birds_front_end_2023/build', 'index.html'));
});




// const express = require('express'); //Import the express dependency
// const app = express();              //Instantiate an express app, the main work horse of this server
// const port = 3000;                  //Save the port number where your server will be listening

// //Idiomatic expression in express to route and respond to a client request
// app.get("/api", (req, res) => {
//     res.json({ message: "Hello from server!" });
//   });

// // app.get('/', (req, res) => {        //get requests to the root ("/") will route here
// //     res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
// //                                                         //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
// // });



const http = require('http');

const hostname = 'ibra.cs.bgu.ac.il';
// const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
//     console.log(`Now listening on port ${port}`); 
// });