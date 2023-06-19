"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const usuarios_routes_1 = __importDefault(require("../routes/usuarios.routes"));
class Server {
    constructor() {
        this.apiRoutes = {
            usuarios: '/api/usuarios',
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '8000';
        this.middleware();
        this.routes();
    }
    middleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static('public'));
    }
    routes() {
        this.app.use(this.apiRoutes.usuarios, usuarios_routes_1.default);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log('El servidor está corriendo en el puerto', this.port);
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map