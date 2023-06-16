"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server2 = exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const connect_1 = __importDefault(require("../database/connect"));
const cors_1 = __importDefault(require("cors"));
const usuarios_routes_1 = __importDefault(require("../routes/usuarios.routes"));
class Server {
    constructor() {
        this.apiRoutes = {
            usuarios: "/api/usuarios",
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || "8000";
        this.dbConnect();
        this.middleware();
        this.routes();
    }
    dbConnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connect_1.default.authenticate();
                console.log('DataBase online');
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
    middleware() {
        //Trabajar con el Cross Domain
        this.app.use((0, cors_1.default)());
        //Leer del body
        this.app.use(express_1.default.json());
        //Carpeta publica
        this.app.use(express_1.default.static('public'));
    }
    routes() {
        this.app.use(this.apiRoutes.usuarios, usuarios_routes_1.default);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("El servidor esta corriendo en el puerto", this.port);
        });
    }
}
exports.Server = Server;
class Server2 {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
        // Configurar middlewares y rutas
        this.configureMiddlewares();
        this.configureRoutes();
    }
    configureMiddlewares() {
        this.app.use((0, cors_1.default)());
        //Leer del body
        this.app.use(express_1.default.json());
        //Carpeta publica
        this.app.use(express_1.default.static('public'));
    }
    configureRoutes() {
        this.app.use(this.apiRoutes.usuarios, usuarios_routes_1.default);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor en funcionamiento en http://localhost:${this.port}`);
        });
    }
}
exports.Server2 = Server2;
//# sourceMappingURL=server.js.map