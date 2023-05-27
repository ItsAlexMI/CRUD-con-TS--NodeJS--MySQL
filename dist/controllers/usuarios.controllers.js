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
exports.deleteUsuario = exports.putUsuario = exports.postUsuarios = exports.getUsuario = exports.getUsuarios = void 0;
const usuario_1 = __importDefault(require("../models/usuario"));
const getUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usuarios = yield usuario_1.default.findAll();
    res.json(usuarios);
});
exports.getUsuarios = getUsuarios;
const getUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const usuario = yield usuario_1.default.findByPk(id);
    if (usuario) {
        res.json(usuario);
    }
    else {
        res.status(404).json({
            message: `No existe el usuario con el id ${id}`,
        });
    }
});
exports.getUsuario = getUsuario;
const postUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    try {
        const existeEmail = yield usuario_1.default.findOne({
            where: {
                email: body.email,
            },
        });
        if (existeEmail) {
            return res.status(400).json({
                message: "El email que esta registrando ya esta en uso",
            });
        }
        const usuario = yield usuario_1.default.create({
            nombre: body.nombre,
            email: body.email,
            estado: body.estado,
        });
        yield (yield usuario).save();
        res.status(200).json({
            message: "El registro se agrego correctamente",
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Por favor hable con el administrador",
        });
    }
});
exports.postUsuarios = postUsuarios;
const putUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    try {
        const usuario = yield usuario_1.default.findByPk(id);
        if (usuario) {
            yield usuario.update(body);
            res.status(200).json({
                message: "El registro se actualizo correctamente",
            });
        }
        else {
            res.status(404).json({
                message: `No existe el usuario con el id ${id}`,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: "Por favor hable con el administrador",
        });
    }
});
exports.putUsuario = putUsuario;
const deleteUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const usuario = yield usuario_1.default.findByPk(id);
    if (usuario) {
        //await usuario.update({ estado: false });
        yield usuario.destroy();
        res.status(200).json({
            message: "El registro se elimino correctamente",
        });
    }
    else {
        return res.status(404).json({
            message: `No existe el usuario con el id ${id}`,
        });
    }
});
exports.deleteUsuario = deleteUsuario;
//# sourceMappingURL=usuarios.controllers.js.map