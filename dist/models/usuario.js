"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = require("sequelize");
class Usuario extends sequelize_1.Model {
}
const sequelize = new sequelize_2.Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite', // Ruta y nombre del archivo de la base de datos SQLite
});
Usuario.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: false,
});
exports.default = Usuario;
//# sourceMappingURL=usuario.js.map