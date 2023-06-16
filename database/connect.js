"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
var db = new sequelize_1.Sequelize('node', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});
exports.default = db;
