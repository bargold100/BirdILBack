
// import { config } from 'dotenv'; 
// //import createError from 'http-errors'
// import express from 'express';
// import path from 'path';
// //import cookieParser from 'cookie-parser';
// import  logger from 'morgan';
// //import  bodyParser from 'body-parser';
// import cors from 'cors'
// import { fileURLToPath } from 'url';
// import {router as ringingsRouter} from './routes/ringings.js';
// import {router as birdsRouter} from './routes/birds.js';

// export default function app(){
// const __filename = fileURLToPath(import.meta.url);

// const __dirname = path.dirname(__filename);
// // import  favicon  from  'serve-favicon';
// // import  hbs from 'express-handlebars';

// //import routes  from 'routes/index';


// //const ringingsRouter = require('./routes/ringings.js');
// var app = express();
// app.use(logger("dev")); //logger
// app.use(express.json()); // parse application/json

// app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
// app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript filesapp.use(express.static(path.join(__dirname, "dist")));
// // app.use(bodyParser.urlencoded({
// //     parameterLimit: 100000,
// //     limit: '50mb',
// //     extended: true
// //   }));

// // view engine setup

// //===============  from svivot   ==================

// app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
// // app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files
// //local:
// //app.use(express.static(path.join(__dirname, "dist")));
// //remote:
// app.use(express.static(path.join(__dirname, '../birds_front_end_2023/build'))); //C:\Users\user\Desktop\assignment3-3-312804446_319081600\dist\index.html
// app.get("/",function(req,res)
// { 
//   //remote: 
//   res.sendFile(path.join(__dirname, '../birds_front_end_2023/build/index.html'));
//   //local:
//   //res.sendFile(__dirname+"/index.html");

// });

// // app.use(cors());
// // app.options("*", cors());

// const corsConfig = {
//   origin: true,
//   credentials: true
// };

// app.use(cors(corsConfig));
// app.options("*", cors(corsConfig));

// var port = process.env.PORT || "3001"; //local=3000 remote=80
// //#endregion
// // const user = require("./routes/user");
// // const recipes = require("./routes/recipes");
// // const auth = require("./routes/auth");



// //var ringingsRouter = require('./routes/ringings');
// //#region cookie middleware
// // app.use(function (req, res, next) {
// //   if (req.session && req.session.user_id) {
// //     DButils.execQuery("SELECT user_id FROM users")
// //       .then((users) => {
// //         if (users.find((x) => x.user_id === req.session.user_id)) {
// //           req.user_id = req.session.user_id;
// //         }
// //         next();
// //       })
// //       .catch((error) => next());
// //   } else {
// //     next();
// //   }
// // });
// //#endregion

// // ----> For cheking that our server is alive
// app.get("/alive", (req, res) => res.send("I'm alive"));

// // Routings
// app.use('/ringings', ringingsRouter);
// app.use('/birds', birdsRouter);
// //app.use("/users", user);
// //app.use(auth);

// // Default router
// app.use(function (err, req, res, next) {
//   console.error(err);
//   res.status(err.status || 500).send({ message: err.message, success: false });
// });


// //local start
// // const server = app.listen(port, () => {
// //   console.log(`Server listen on port ${port}`);
// // });

// // process.on("SIGINT", function () {
// //   if (server) {
// //     server.close(() => console.log("server closed"));
// //   }
// //   process.exit();
// // });
// //local end
// //module.exports=app;

// ////======================== end svivot ===========

// }
// // module.exports=app;
// export { app };

import { config } from 'dotenv'; 
import express from 'express';
import path from 'path';
import logger from 'morgan';
import cors from 'cors'
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, '../birds_front_end_2023/build')));
app.use(bodyParser.json());

app.get("/",function(req,res) { 
  res.sendFile(path.join(__dirname, '../birds_front_end_2023/build/index.html'));
});

const corsConfig = {
  origin: true,
  credentials: true
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

//var port = process.env.PORT || "3001"; //local=3000 remote=80
//#endregion
// const user = require("./routes/user");
// const recipes = require("./routes/recipes");
// const auth = require("./routes/auth");

import {router as ringingsRouter} from './routes/ringings.js';
import {router as birdsRouter} from './routes/birds.js';
import {router as gridRouter} from './routes/grid.js';
import {router as filtersRouter} from './routes/filters.js';

//var ringingsRouter = require('./routes/ringings');
//#region cookie middleware
// app.use(function (req, res, next) {
//   if (req.session && req.session.user_id) {
//     DButils.execQuery("SELECT user_id FROM users")
//       .then((users) => {
//         if (users.find((x) => x.user_id === req.session.user_id)) {
//           req.user_id = req.session.user_id;
//         }
//         next();
//       })
//       .catch((error) => next());
//   } else {
//     next();
//   }
// });
//#endregion

// ----> For cheking that our server is alive
app.get("/alive", (req, res) => res.send("I'm alive"));

// Routings
app.use('/ringings', ringingsRouter);
app.use('/birds', birdsRouter);
app.use('/grid',gridRouter)
app.use('/filters', filtersRouter);
//app.use("/users", user);
//app.use(auth);

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});

const port = process.env.PORT || "3001";
app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});
