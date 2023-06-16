"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db = new sequelize_1.Sequelize('railway', 'root', 'ri7FqDt5cAhrbgNiXp2D', {
    host: 'containers-us-west-125.railway.app',
    dialect: 'mysql',
    port: 6369
});
exports.default = db;
//# sourceMappingURL=connect.js.map