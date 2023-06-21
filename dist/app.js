"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("./models/server");
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const server = new server_1.Server();
server.listen();
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
// Configuración de Express
app.set('views', path_1.default.join(__dirname, 'public')); // Establecer el directorio de vistas como "public"
app.set('view engine', 'ejs'); // Establecer el motor de vistas como "ejs"
// Ruta principal
app.get('/', (req, res) => {
    res.render('login', { title: 'Inicio de sesión' });
});
app.get('/register', (req, res) => {
    res.render('register', { title: 'Registro' });
});
app.get('/student', (req, res) => {
    // Obtener el nombre de usuario correspondiente y asignarlo a la variable `username`
    const username = req.query.username;
    res.render('student', { title: 'Estudiante', username: username });
});
app.get('/teacher', (req, res) => {
    console.log(req.body);
    db.all(`SELECT codigo FROM grupos`, (error, rows) => {
        if (error) {
            console.error('Error al obtener los grupos:', error.message);
            res.status(500).json({ error: 'Error al obtener los grupos' });
        }
        else {
            const groups = rows.map((row) => row.codigo);
            res.render('teacher', { title: 'Profesor', username: req.query.username, groupCode: req.query.groupCode, groups: groups });
        }
    });
});
// Configuración de la base de datos SQLite
const dbPath = path_1.default.join(__dirname, 'database.sqlite');
const db = new sqlite3_1.default.Database(dbPath, (error) => {
    if (error) {
        console.error('Error al conectar a la base de datos SQLite:', error.message);
    }
    else {
        console.log('Conexión exitosa a la base de datos SQLite');
    }
});
// Crear la tabla "usuarios" y "grupos" si no existen
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY,
  username TEXT,
  password TEXT,
  role TEXT
)`, (error) => {
    if (error) {
        console.error('Error al crear la tabla usuarios:', error.message);
    }
    else {
        console.log('Tabla usuarios creada exitosamente');
    }
});
db.run(`CREATE TABLE IF NOT EXISTS grupos (
  id INTEGER PRIMARY KEY,
  codigo TEXT,
  profesor_id INTEGER,
  FOREIGN KEY (profesor_id) REFERENCES usuarios (id)
)`, (error) => {
    if (error) {
        console.error('Error al crear la tabla grupos:', error.message);
    }
    else {
        console.log('Tabla grupos creada exitosamente');
    }
});
// Ruta para registrar un usuario
app.post('/register', (req, res) => {
    // Obtener los datos del formulario de registro
    const { username, password, role } = req.body;
    // Verificar si el usuario ya existe
    db.get(`SELECT * FROM usuarios WHERE username = ?`, [username], (error, row) => {
        if (error) {
            console.error('Error al consultar los datos:', error.message);
            res.status(500).json({ error: 'Error al registrar el usuario' });
        }
        else if (row) {
            // Si el usuario ya existe, enviar una respuesta con un mensaje de error
            res.status(400).json({ error: 'El usuario ya existe' });
        }
        else {
            // Insertar los datos en la tabla usuarios
            db.run(`INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)`, [username, password, role], function (error) {
                if (error) {
                    console.error('Error al insertar los datos:', error.message);
                    res.status(500).json({ error: 'Error al registrar el usuario' });
                }
                else {
                    console.log('Datos insertados exitosamente');
                    // Si el rol es "Profesor", crear un grupo
                    if (role === 'Profesor') {
                        const profesorId = this.lastID;
                        const groupCode = generateGroupCode();
                        // Insertar los datos en la tabla grupos
                        db.run(`INSERT INTO grupos (codigo, profesor_id) VALUES (?, ?)`, [groupCode, profesorId], (error) => {
                            if (error) {
                                console.error('Error al insertar los datos del grupo:', error.message);
                            }
                            else {
                                console.log('Grupo creado exitosamente');
                            }
                        });
                    }
                    res.status(200).json({ message: 'Usuario registrado exitosamente' });
                }
            });
        }
    });
});
// Ruta para iniciar sesión
app.post('/', (req, res) => {
    // Obtener los datos del formulario de inicio de sesión
    const { username, password } = req.body;
    // Verificar si los datos existen en la base de datos
    db.get(`SELECT role FROM usuarios WHERE username = ? AND password = ?`, [username, password], (error, row) => {
        if (error) {
            console.error('Error al consultar los datos:', error.message);
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
        else if (row) {
            const role = row.role;
            // Redireccionar al usuario según su rol
            if (role === 'Estudiante') {
                res.redirect('/student');
            }
            else if (role === 'Profesor') {
                res.redirect('/teacher');
            }
            else {
                res.status(401).json({ error: 'Rol de usuario inválido' });
            }
        }
        else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    });
});
// Ruta para agregar un grupo de clase
app.post('/group', (req, res) => {
    const { username, role } = req.body;
    // Obtener el ID del profesor
    db.get(`SELECT id FROM usuarios WHERE username = ?`, [username], (error, row) => {
        if (error) {
            console.error('Error al consultar el ID del profesor:', error.message);
            res.status(500).json({ error: 'Error al crear el grupo' });
        }
        else if (row) {
            const profesorId = row.id;
            // Generar un código de grupo aleatorio
            const groupCode = generateGroupCode();
            // Insertar los datos en la tabla grupos
            db.run(`INSERT INTO grupos (codigo, profesor_id) VALUES (?, ?)`, [groupCode, profesorId], (error) => {
                if (error) {
                    console.error('Error al insertar los datos del grupo:', error.message);
                    res.status(500).json({ error: 'Error al crear el grupo' });
                }
                else {
                    console.log('Grupo creado exitosamente');
                    res.json({ groupCode });
                }
            });
        }
        else {
            res.status(400).json({ error: 'No se encontró el profesor' });
        }
    });
});
// Cerrar la conexión cuando hayas terminado
app.on('close', () => {
    db.close((error) => {
        if (error) {
            console.error('Error al cerrar la conexión con la base de datos SQLite:', error.message);
        }
        else {
            console.log('Conexión con la base de datos SQLite cerrada exitosamente');
        }
    });
});
function generateGroupCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6;
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
}
// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map