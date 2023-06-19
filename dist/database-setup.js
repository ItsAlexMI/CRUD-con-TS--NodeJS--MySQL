"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const dbPath = 'database.sqlite';
const connection = new sqlite3_1.default.Database(dbPath, (error) => {
    if (error) {
        console.error('Error al conectar a la base de datos:', error.message);
    }
    else {
        console.log('Conexión exitosa a la base de datos SQLite');
    }
});
connection.serialize(() => {
    connection.run('CREATE TABLE IF NOT EXISTS your_table (id INTEGER PRIMARY KEY, name TEXT)');
    connection.run('INSERT INTO your_table (name) VALUES ("John Doe")');
    connection.all('SELECT * FROM your_table', (error, rows) => {
        if (error) {
            console.error('Error al realizar la consulta:', error.message);
        }
        else {
            console.log('Filas obtenidas:', rows);
        }
    });
});
connection.close((error) => {
    if (error) {
        console.error('Error al cerrar la conexión:', error.message);
    }
    else {
        console.log('Conexión cerrada correctamente');
    }
});
//# sourceMappingURL=database-setup.js.map