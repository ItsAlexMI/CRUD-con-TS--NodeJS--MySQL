// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.Server2 = void 0;
// var dotenv_1 = require("dotenv");
// var server_1 = require("./models/server");
// var express_1 = require("express");
// dotenv_1.default.config();
// var server = new server_1.Server();
// server.listen();
// var app = (0, express_1.default)();
// var port = 3000;
// // Configurar directorio de vistas y motor de plantillas EJS
// app.set('public', './public');
// app.set('view engine', 'ejs');
// // Rutas
// app.get('/', function (req, res) {
//     res.render('index', { title: 'Mi página' });
// });
// // Iniciar servidor
// app.listen(port, function () {
//     console.log("Servidor en funcionamiento en http://localhost:".concat(port));
// });
// var Server2 = /** @class */ (function () {
//     function Server2() {
//         this.app = (0, express_1.default)();
//         this.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
//         // Configurar middlewares y rutas
//         this.configureMiddlewares();
//         this.configureRoutes();
//     }
//     Server2.prototype.configureMiddlewares = function () {
//         // Configurar middlewares aquí, como body-parser, cors, etc.
//     };
//     Server2.prototype.configureRoutes = function () {
//         // Configurar rutas aquí utilizando this.app, por ejemplo:
//         // this.app.get('/', (req, res) => { ... });
//     };
//     Server2.prototype.listen = function () {
//         var _this = this;
//         this.app.listen(this.port, function () {
//             console.log("Servidor en funcionamiento en http://localhost:".concat(_this.port));
//         });
//     };
//     return Server2;
// }());
// exports.Server2 = Server2;
