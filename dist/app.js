"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("./models/server");
const express_1 = __importDefault(require("express"));
const path = require('path');
dotenv_1.default.config();
const server = new server_1.Server();
server.listen();
const app = (0, express_1.default)();
const port = 3000;
// Configuración de Express
app.set('views', path.join(__dirname, 'public')); // Establecer el directorio de vistas como "public"
app.set('view engine', 'ejs'); // Establecer el motor de vistas como "html"
// Ruta principal
app.get('/', (req, res) => {
    res.render('index', { title: 'Mi página' });
});
// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map