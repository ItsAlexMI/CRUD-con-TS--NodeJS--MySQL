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
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
dotenv_1.default.config();
const server = new server_1.Server();
server.listen();
const app = (0, express_1.default)();
const port = 3000;
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
}));
// Configuración de Express
app.set("views", path_1.default.join(__dirname, "public")); // Establecer el directorio de vistas como "public"
app.set("view engine", "ejs"); // Establecer el motor de vistas como "ejs"
// Ruta principal
app.get("/", (req, res) => {
    res.render("login", { title: "Inicio de sesión" });
});
app.get("/register", (req, res) => {
    res.render("register", { title: "Registro" });
});
app.get("/student", (req, res) => {
    const username = req.session.username; // Obtener el nombre de usuario de la sesión
    console.log("Valor de username en la sesión:", username);
    res.render("student", { title: "Estudiante", username: username });
});
app.get("/teacher", (req, res) => {
    const username = req.query.username;
    const role = req.query.role;
    console.log("Valores recibidos:", username, role);
    // Configuración de la base de datos SQLite
    const dbPath = path_1.default.join(__dirname, "database.sqlite");
    const db = new sqlite3_1.default.Database(dbPath, (error) => {
        if (error) {
            console.error("Error al conectar a la base de datos SQLite:", error.message);
            res
                .status(500)
                .json({ error: "Error al conectar a la base de datos SQLite" });
        }
        else {
            db.all(`SELECT codigo FROM grupos`, (error, rows) => {
                if (error) {
                    console.error("Error al obtener los grupos:", error.message);
                    res.status(500).json({ error: "Error al obtener los grupos" });
                }
                else {
                    const groups = rows.map((row) => row.codigo);
                    // Obtener las tareas desde la base de datos
                    db.all("SELECT * FROM tareas", (error, tasks) => {
                        if (error) {
                            console.error("Error al obtener las tareas:", error.message);
                            res.status(500).json({ error: "Error al obtener las tareas" });
                            return;
                        }
                        // Renderizar la plantilla teacher.ejs con los datos de las tareas
                        res.render("teacher", {
                            title: "Profesor",
                            username: username,
                            groups: groups,
                            role: role,
                            tasks: tasks
                        });
                    });
                }
            });
        }
    });
});
// Configuración de la base de datos SQLite
const dbPath = path_1.default.join(__dirname, "database.sqlite");
const db = new sqlite3_1.default.Database(dbPath, (error) => {
    if (error) {
        console.error("Error al conectar a la base de datos SQLite:", error.message);
    }
    else {
        console.log("Conexión exitosa a la base de datos SQLite");
        // Crear la tabla "usuarios" y "grupos" si no existen
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT,
      role TEXT
    )`, (error) => {
            if (error) {
                console.error("Error al crear la tabla usuarios:", error.message);
            }
            else {
                console.log("Tabla usuarios creada exitosamente");
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY,
      codigo TEXT,
      profesor_id INTEGER,
      estudiantes_ids TEXT,
      FOREIGN KEY (profesor_id) REFERENCES usuarios (id)
    )`, (error) => {
            if (error) {
                console.error("Error al crear la tabla grupos:", error.message);
            }
            else {
                console.log("Tabla grupos creada exitosamente");
            }
        });
        db.run(`CREATE TABLE tareas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  grupo_id INTEGER,
  FOREIGN KEY (grupo_id) REFERENCES grupos (id)
    )`, (error) => {
            if (error) {
                console.error("Error al crear la tabla grupos:", error.message);
            }
            else {
                console.log("Tabla grupos creada exitosamente");
            }
        });
    }
});
// Ruta para registrar un usuario
app.post("/register", (req, res) => {
    // Obtener los datos del formulario de registro
    const { username, password, role } = req.body;
    // Verificar si el usuario ya existe
    db.get(`SELECT * FROM usuarios WHERE username = ?`, [username], (error, row) => {
        if (error) {
            console.error("Error al consultar los datos:", error.message);
            res.status(500).json({ error: "Error al registrar el usuario" });
        }
        else if (row) {
            // Si el usuario ya existe, enviar una respuesta con un mensaje de error
            res.status(400).json({ error: "El usuario ya existe" });
        }
        else {
            // Insertar los datos en la tabla usuarios
            db.run(`INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)`, [username, password, role], function (error) {
                if (error) {
                    console.error("Error al insertar los datos:", error.message);
                    res.status(500).json({ error: "Error al registrar el usuario" });
                }
                else {
                    console.log("Datos insertados exitosamente");
                    // Si el rol es "Profesor", crear un grupo
                    if (role === "Profesor") {
                        const profesorId = this.lastID;
                        const groupCode = generateGroupCode();
                        // Insertar los datos en la tabla grupos
                        db.run(`INSERT INTO grupos (codigo, profesor_id) VALUES (?, ?)`, [groupCode, profesorId], (error) => {
                            if (error) {
                                console.error("Error al insertar los datos del grupo:", error.message);
                            }
                            else {
                                console.log("Grupo creado exitosamente");
                            }
                        });
                    }
                    res
                        .status(200)
                        .json({ message: "Usuario registrado exitosamente" });
                }
            });
        }
    });
});
// Ruta para iniciar sesión
app.post("/", (req, res) => {
    // Obtener los datos del formulario de inicio de sesión
    const { username, password } = req.body;
    // Verificar si los datos existen en la base de datos
    db.get(`SELECT role FROM usuarios WHERE username = ? AND password = ?`, [username, password], (error, row) => {
        if (error) {
            console.error("Error al consultar los datos:", error.message);
            res.status(500).json({ error: "Error al iniciar sesión" });
        }
        else if (row) {
            const role = row.role;
            // Establecer el nombre de usuario en la sesión
            req.session.username = username;
            // Redireccionar al usuario según su rol
            if (role === "Estudiante") {
                res.redirect("/student");
            }
            else if (role === "Profesor") {
                res.redirect(`/teacher?username=${username}&role=${role}`);
            }
            else {
                res.status(401).json({ error: "Rol de usuario inválido" });
            }
        }
        else {
            res.status(401).json({ error: "Credenciales inválidas" });
        }
    });
});
app.post("/student", (req, res) => {
    // Obtener el nombre de usuario correspondiente y asignarlo a la variable `username`
    const username = req.query.username;
    // Obtener los grupos disponibles
    db.all(`SELECT * FROM grupos`, (error, rows) => {
        if (error) {
            console.error("Error al obtener los grupos:", error.message);
            res.status(500).json({ error: "Error al obtener los grupos" });
        }
        else {
            const groups = rows;
            // Almacenar el valor de username en la sesión
            req.session.username = username
                ? Array.isArray(username)
                    ? String(username[0])
                    : String(username)
                : undefined;
            res.render("student", {
                title: "Estudiante",
                username: username,
                groups: groups,
                role: "Estudiante",
            });
        }
    });
});
// Ruta para agregar un grupo de clase
app.post("/group", (req, res) => {
    const { username, role, groupname } = req.body;
    console.log("Valores recibidos:", username, role, groupname);
    // Obtener el ID del profesor
    db.get(`SELECT id FROM usuarios WHERE username = ? AND role = 'Profesor'`, [username], (error, row) => {
        if (error) {
            console.error("Error al consultar el ID del profesor:", error.message);
            res.status(500).json({ error: "Error al crear el grupo" });
        }
        else if (row) {
            const profesorId = row.id;
            // Insertar los datos en la tabla grupos
            db.run(`INSERT INTO grupos (codigo, profesor_id) VALUES (?, ?)`, [groupname, profesorId], (error) => {
                if (error) {
                    console.error("Error al insertar los datos del grupo:", error.message);
                    res.status(500).json({ error: "Error al crear el grupo" });
                }
                else {
                    console.log("Grupo creado exitosamente");
                    res.redirect(`/teacher?username=${username}&role=${role}`);
                }
            });
        }
        else {
            res.status(400).json({ error: "No se encontró el profesor" });
        }
    });
});
// Cerrar la conexión cuando hayas terminado
app.on("close", () => {
    db.close((error) => {
        if (error) {
            console.error("Error al cerrar la conexión con la base de datos SQLite:", error.message);
        }
        else {
            console.log("Conexión con la base de datos SQLite cerrada exitosamente");
        }
    });
});
app.post("/join-group", (req, res) => {
    const { groupname } = req.body;
    const username = req.session && req.session.username ? req.session.username : "";
    console.log(username, groupname);
    // Obtener el ID del grupo
    db.get(`SELECT id, estudiantes_ids FROM grupos WHERE codigo = ?`, [groupname], (error, row) => {
        if (error) {
            console.error("Error al consultar el ID del grupo:", error.message);
            res.status(500).json({ error: "Error al unirse al grupo" });
        }
        else if (row) {
            const grupoId = row.id;
            const estudiantesIds = row.estudiantes_ids || "";
            const estudiantesIdsArray = estudiantesIds.split(",").filter(Boolean); // Convertir la cadena en un array de IDs
            if (estudiantesIdsArray.includes(username)) {
                // El estudiante ya está en el grupo
                console.log("El estudiante ya está en el grupo");
                res.redirect(`/student?username=${username}`);
            }
            else {
                // Agregar el nuevo ID de estudiante a la lista
                estudiantesIdsArray.push(username);
                // Actualizar la tabla grupos con la nueva lista de IDs de estudiantes
                const nuevaListaEstudiantesIds = estudiantesIdsArray.join(",");
                db.run(`UPDATE grupos SET estudiantes_ids = ? WHERE id = ?`, [nuevaListaEstudiantesIds, grupoId], (error) => {
                    if (error) {
                        console.error("Error al actualizar los datos del grupo:", error.message);
                        res.status(500).json({ error: "Error al unirse al grupo" });
                    }
                    else {
                        console.log("Estudiante unido al grupo exitosamente");
                        // Almacenar el valor de username en la sesión
                        req.session.username = username;
                        res.redirect(`/student`);
                    }
                });
            }
        }
        else {
            res.status(400).json({ error: "No se encontró el grupo" });
        }
    });
});
app.post("/assign-task", (req, res) => {
    const { groupname, task, taskdescription } = req.body;
    const groupCode = groupname; // Asigna el valor de 'groupname' a 'groupCode'
    // Obtener el ID del grupo
    db.get(`SELECT id FROM grupos WHERE codigo = ?`, [groupCode], (error, row) => {
        if (error) {
            console.error("Error al consultar el ID del grupo:", error.message);
            res.status(500).json({ error: "Error al asignar la tarea" });
        }
        else if (row) {
            const groupId = row.id;
            // Insertar la tarea en la tabla de tareas
            db.run(`INSERT INTO tareas (titulo, descripcion, grupo_id) VALUES (?, ?, ?)`, [task, taskdescription, groupId], (error) => {
                if (error) {
                    console.error("Error al insertar la tarea:", error.message);
                    res.status(500).json({ error: "Error al asignar la tarea" });
                }
                else {
                    console.log("Tarea asignada exitosamente");
                    res.status(200).json({ message: "Tarea asignada exitosamente" });
                }
            });
        }
        else {
            res.status(400).json({ error: "No se encontró el grupo" });
        }
    });
});
app.post("/delete-task", (req, res) => {
    // Obtener el ID de la tarea a eliminar
    const taskId = req.body.taskId;
    // Verificar si el ID de la tarea está presente
    if (!taskId) {
        res.status(400).json({ error: "ID de tarea no proporcionado" });
        return;
    }
    // Eliminar la tarea de la base de datos
    db.run(`DELETE FROM tareas WHERE id = ?`, [taskId], (error) => {
        if (error) {
            console.error("Error al eliminar la tarea:", error.message);
            res.status(500).json({ error: "Error al eliminar la tarea" });
        }
        else {
            console.log("Tarea eliminada exitosamente");
            res.status(200).json({ message: "Tarea eliminada exitosamente" });
        }
    });
});
function generateGroupCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 6;
    let code = "";
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