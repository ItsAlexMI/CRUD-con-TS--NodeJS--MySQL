import dotenv from "dotenv";
import { Server } from "./models/server";
import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import path from "path";
import bodyParser from "body-parser";
import session, { SessionData } from "express-session";

dotenv.config();

const server = new Server();
server.listen();

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "secret-key", // Cambia esto por una clave secreta más segura
    resave: false,
    saveUninitialized: false,
  })
);

// Configuración de Express
app.set("views", path.join(__dirname, "public")); // Establecer el directorio de vistas como "public"
app.set("view engine", "ejs"); // Establecer el motor de vistas como "ejs"

// Ruta principal
app.get("/", (req: Request, res: Response) => {
  res.render("login", { title: "Inicio de sesión" });
});

app.get("/register", (req: Request, res: Response) => {
  res.render("register", { title: "Registro" });
});

app.get(
  "/student",
  (
    req: Request<any, any, any, any> & { session?: CustomSessionData },
    res: Response
  ) => {
    const username = req.session.username; // Obtener el nombre de usuario de la sesión

    console.log("Valor de username en la sesión:", username);

    res.render("student", { title: "Estudiante", username: username });
  }
);

app.get("/teacher", (req: Request, res: Response) => {
  const username = req.query.username;
  const role = req.query.role;
  console.log("Valores recibidos:", username, role);
  // Configuración de la base de datos SQLite
  const dbPath = path.join(__dirname, "database.sqlite");

  const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
      console.error(
        "Error al conectar a la base de datos SQLite:",
        error.message
      );
      res
        .status(500)
        .json({ error: "Error al conectar a la base de datos SQLite" });
    } else {
      db.all<{ codigo: string }>(`SELECT codigo FROM grupos`, (error, rows) => {
        if (error) {
          console.error("Error al obtener los grupos:", error.message);
          res.status(500).json({ error: "Error al obtener los grupos" });
        } else {
          const groups: string[] = rows.map((row) => row.codigo);
          res.render("teacher", {
            title: "Profesor",
            username: username,
            groups: groups,
            role: role,
          });
        }
      });
    }
  });
});

// Configuración de la base de datos SQLite
const dbPath = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error(
      "Error al conectar a la base de datos SQLite:",
      error.message
    );
  } else {
    console.log("Conexión exitosa a la base de datos SQLite");
    // Crear la tabla "usuarios" y "grupos" si no existen
    db.run(
      `CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT,
      role TEXT
    )`,
      (error) => {
        if (error) {
          console.error("Error al crear la tabla usuarios:", error.message);
        } else {
          console.log("Tabla usuarios creada exitosamente");
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS grupos (
      id INTEGER PRIMARY KEY,
      codigo TEXT,
      profesor_id INTEGER,
      estudiantes_ids TEXT,
      FOREIGN KEY (profesor_id) REFERENCES usuarios (id)
    )`,
      (error) => {
        if (error) {
          console.error("Error al crear la tabla grupos:", error.message);
        } else {
          console.log("Tabla grupos creada exitosamente");
        }
      }
    );

    db.run(
      `CREATE TABLE tareas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  grupo_id INTEGER,
  FOREIGN KEY (grupo_id) REFERENCES grupos (id)
    )`,
      (error) => {
        if (error) {
          console.error("Error al crear la tabla grupos:", error.message);
        } else {
          console.log("Tabla grupos creada exitosamente");
        }
      }
    );
  }
});

// Define una interfaz para describir la estructura de la fila de la base de datos
interface UsuarioRow {
  role: string;
  id: number;

  // Otras propiedades de la fila si las hay
}
interface GrupoRow {
  id: number;
  codigo: string;
  profesor_id: number;
  estudiantes_ids: string; // Agrega esta propiedad al tipo
}

interface CustomSessionData extends SessionData {
  username?: string;
}

interface GrupoRow {
  id: number;
}


declare module "express-session" {
  interface SessionData {
    username?: string;
  }
}

// Ruta para registrar un usuario
app.post("/register", (req: Request, res: Response) => {
  // Obtener los datos del formulario de registro
  const { username, password, role } = req.body;

  // Verificar si el usuario ya existe
  db.get(
    `SELECT * FROM usuarios WHERE username = ?`,
    [username],
    (error, row) => {
      if (error) {
        console.error("Error al consultar los datos:", error.message);
        res.status(500).json({ error: "Error al registrar el usuario" });
      } else if (row) {
        // Si el usuario ya existe, enviar una respuesta con un mensaje de error
        res.status(400).json({ error: "El usuario ya existe" });
      } else {
        // Insertar los datos en la tabla usuarios
        db.run(
          `INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)`,
          [username, password, role],
          function (error) {
            if (error) {
              console.error("Error al insertar los datos:", error.message);
              res.status(500).json({ error: "Error al registrar el usuario" });
            } else {
              console.log("Datos insertados exitosamente");

              // Si el rol es "Profesor", crear un grupo
              if (role === "Profesor") {
                const profesorId = this.lastID;
                const groupCode = generateGroupCode();

                // Insertar los datos en la tabla grupos
                db.run(
                  `INSERT INTO grupos (codigo, profesor_id) VALUES (?, ?)`,
                  [groupCode, profesorId],
                  (error) => {
                    if (error) {
                      console.error(
                        "Error al insertar los datos del grupo:",
                        error.message
                      );
                    } else {
                      console.log("Grupo creado exitosamente");
                    }
                  }
                );
              }

              res
                .status(200)
                .json({ message: "Usuario registrado exitosamente" });
            }
          }
        );
      }
    }
  );
});

// Ruta para iniciar sesión

app.post("/", (req: Request, res: Response) => {
  // Obtener los datos del formulario de inicio de sesión
  const { username, password } = req.body;

  // Verificar si los datos existen en la base de datos
  db.get(
    `SELECT role FROM usuarios WHERE username = ? AND password = ?`,
    [username, password],
    (error, row: UsuarioRow) => {
      if (error) {
        console.error("Error al consultar los datos:", error.message);
        res.status(500).json({ error: "Error al iniciar sesión" });
      } else if (row) {
        const role = row.role;

        // Establecer el nombre de usuario en la sesión
        req.session.username = username;

        // Redireccionar al usuario según su rol
        if (role === "Estudiante") {
          res.redirect("/student");
        } else if (role === "Profesor") {
          res.redirect(`/teacher?username=${username}&role=${role}`);
        } else {
          res.status(401).json({ error: "Rol de usuario inválido" });
        }
      } else {
        res.status(401).json({ error: "Credenciales inválidas" });
      }
    }
  );
});

app.post("/student", (req: Request, res: Response) => {
  // Obtener el nombre de usuario correspondiente y asignarlo a la variable `username`
  const username = req.query.username;

  // Obtener los grupos disponibles
  db.all<GrupoRow>(`SELECT * FROM grupos`, (error, rows) => {
    if (error) {
      console.error("Error al obtener los grupos:", error.message);
      res.status(500).json({ error: "Error al obtener los grupos" });
    } else {
      const groups: GrupoRow[] = rows;

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
app.post("/group", (req: Request, res: Response) => {
  const { username, role, groupname } = req.body;
  console.log("Valores recibidos:", username, role, groupname);

  // Obtener el ID del profesor
  db.get(
    `SELECT id FROM usuarios WHERE username = ? AND role = 'Profesor'`,
    [username],
    (error, row: UsuarioRow) => {
      if (error) {
        console.error("Error al consultar el ID del profesor:", error.message);
        res.status(500).json({ error: "Error al crear el grupo" });
      } else if (row) {
        const profesorId = row.id;

        // Insertar los datos en la tabla grupos
        db.run(
          `INSERT INTO grupos (codigo, profesor_id) VALUES (?, ?)`,
          [groupname, profesorId],
          (error) => {
            if (error) {
              console.error(
                "Error al insertar los datos del grupo:",
                error.message
              );
              res.status(500).json({ error: "Error al crear el grupo" });
            } else {
              console.log("Grupo creado exitosamente");
              res.redirect(`/teacher?username=${username}&role=${role}`);
            }
          }
        );
      } else {
        res.status(400).json({ error: "No se encontró el profesor" });
      }
    }
  );
});

// Cerrar la conexión cuando hayas terminado
app.on("close", () => {
  db.close((error) => {
    if (error) {
      console.error(
        "Error al cerrar la conexión con la base de datos SQLite:",
        error.message
      );
    } else {
      console.log("Conexión con la base de datos SQLite cerrada exitosamente");
    }
  });
});

app.post(
  "/join-group",
  (
    req: Request<any, any, any, any> & { session?: CustomSessionData },
    res: Response
  ) => {
    const { groupname } = req.body;
    const username =
      req.session && req.session.username ? req.session.username : "";

    console.log(username, groupname);

    // Obtener el ID del grupo
    db.get<GrupoRow>(
      `SELECT id, estudiantes_ids FROM grupos WHERE codigo = ?`,
      [groupname],
      (error, row) => {
        if (error) {
          console.error("Error al consultar el ID del grupo:", error.message);
          res.status(500).json({ error: "Error al unirse al grupo" });
        } else if (row) {
          const grupoId = row.id;
          const estudiantesIds = row.estudiantes_ids || "";
          const estudiantesIdsArray = estudiantesIds.split(",").filter(Boolean); // Convertir la cadena en un array de IDs

          if (estudiantesIdsArray.includes(username)) {
            // El estudiante ya está en el grupo
            console.log("El estudiante ya está en el grupo");
            res.redirect(`/student?username=${username}`);
          } else {
            // Agregar el nuevo ID de estudiante a la lista
            estudiantesIdsArray.push(username);

            // Actualizar la tabla grupos con la nueva lista de IDs de estudiantes
            const nuevaListaEstudiantesIds = estudiantesIdsArray.join(",");
            db.run(
              `UPDATE grupos SET estudiantes_ids = ? WHERE id = ?`,
              [nuevaListaEstudiantesIds, grupoId],
              (error) => {
                if (error) {
                  console.error(
                    "Error al actualizar los datos del grupo:",
                    error.message
                  );
                  res.status(500).json({ error: "Error al unirse al grupo" });
                } else {
                  console.log("Estudiante unido al grupo exitosamente");

                  // Almacenar el valor de username en la sesión
                  req.session.username = username;

                  res.redirect(`/student`);
                }
              }
            );
          }
        } else {
          res.status(400).json({ error: "No se encontró el grupo" });
        }
      }
    );
  }
);

app.post("/assign-task", (req: Request, res: Response) => {
  const { groupname, task, taskdescription } = req.body;
  const groupCode = groupname; // Asigna el valor de 'groupname' a 'groupCode'

  // Obtener el ID del grupo
  db.get<GrupoRow>(
    `SELECT id FROM grupos WHERE codigo = ?`,
    [groupCode],
    (error, row: GrupoRow) => {
      if (error) {
        console.error("Error al consultar el ID del grupo:", error.message);
        res.status(500).json({ error: "Error al asignar la tarea" });
      } else if (row) {
        const groupId = row.id;

        // Insertar la tarea en la tabla de tareas
        db.run(
          `INSERT INTO tareas (titulo, descripcion, grupo_id) VALUES (?, ?, ?)`,
          [task, taskdescription ,groupId],
          (error) => {
            if (error) {
              console.error("Error al insertar la tarea:", error.message);
              res.status(500).json({ error: "Error al asignar la tarea" });
            } else {
              console.log("Tarea asignada exitosamente");
              res.status(200).json({ message: "Tarea asignada exitosamente" });
            }
          }
        );
      } else {
        res.status(400).json({ error: "No se encontró el grupo" });
      }
    }
  );
});



function generateGroupCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
