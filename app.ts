import dotenv from "dotenv";
import { Server } from "./models/server";
import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import path from "path";
import bodyParser from "body-parser";
import session, { SessionData } from "express-session";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import multer from "multer";

sgMail.setApiKey("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");
dotenv.config();

const server = new Server();
server.listen();
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    name: "mySession",
    secret: "secret-key", // Cambia esto por una clave secreta más segura
    resave: false,
    saveUninitialized: true,
  })
);

// Configurar el almacenamiento del archivo adjunto utilizando Multer
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, uniqueSuffix + extension);
  }
});

const upload = multer({ storage: storage });
// Configuración de Express
app.set("views", path.join(__dirname, "public")); // Establecer el directorio de vistas como "public"
app.set("view engine", "ejs"); // Establecer el motor de vistas como "ejs"

// Ruta principal
app.get("/", (req: Request, res: Response) => {
  res.render("login", { title: "Inicio de sesión" });
});

app.get("/tareasActivas",   (req: Request, res: Response) => {
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

          // Obtener las tareas desde la base de datos
          db.all("SELECT * FROM tareas", (error, tasks) => {
            if (error) {
              console.error("Error al obtener las tareas:", error.message);
              res.status(500).json({ error: "Error al obtener las tareas" });
              return;
            }

            // Renderizar la plantilla teacher.ejs con los datos de las tareas
            res.render("tareasActivas", {
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

app.get("/asignarTareas",   (req: Request, res: Response) => {
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

          // Obtener las tareas desde la base de datos
          db.all("SELECT * FROM tareas", (error, tasks) => {
            if (error) {
              console.error("Error al obtener las tareas:", error.message);
              res.status(500).json({ error: "Error al obtener las tareas" });
              return;
            }

            // Renderizar la plantilla teacher.ejs con los datos de las tareas
            res.render("asignarTareas", {
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



app.get("/register", (req: Request, res: Response) => {
  res.render("register", { title: "Registro" });
});

app.get("/confirmar", (req: Request, res: Response) => {
  const correo = req.query.correo as string;
  const token = req.query.token as string;

  // Verificar el enlace de confirmación y realizar la inserción del usuario en la base de datos
  db.get(
    `SELECT * FROM usuarios WHERE email = ? AND token = ? AND verified = 0`,
    [correo, token],
    (error, row) => {
      if (error) {
        console.error("Error al consultar los datos:", error.message);
        res.status(500).send("Error al confirmar el correo");
      } else if (!row) {
        console.error("No se encontró ningún usuario para confirmar el correo");
        res.status(404).send("No se encontró ningún usuario para confirmar el correo");
      } else {
        // Actualizar el estado de verificación del usuario en la base de datos
        db.run(
          `UPDATE usuarios SET verified = 1 WHERE email = ?`,
          [correo],
          function (error) {
            if (error) {
              console.error("Error al actualizar el estado de verificación:", error.message);
              res.status(500).send("Error al confirmar el correo");
            } else {
              console.log("Correo confirmado exitosamente");
              res.send("Correo confirmado exitosamente");
            }
          }
        );
      }
    }
  );
});

app.get("/tareasActivasStudents", (req: Request<any, any, any, CustomSessionData>, res: Response) => {
  const username = req.session.username;
  const role = req.query.role;
  console.log("Valor de username en la sesión:", username);

  const dbPath = path.join(__dirname, "database.sqlite");

  const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
      console.error("Error al conectar a la base de datos SQLite:", error.message);
      res.status(500).json({ error: "Error al conectar a la base de datos SQLite" });
    } else {
      db.all<{ codigo: string }>(`SELECT codigo FROM grupos`, (error, rows) => {
        if (error) {
          console.error("Error al obtener los grupos:", error.message);
          res.status(500).json({ error: "Error al obtener los grupos" });
        } else {
          const groups: string[] = rows.map((row) => row.codigo);

          // Realizar la consulta para obtener los correos electrónicos de los estudiantes
          db.all<UsuarioRow>(`SELECT email FROM usuarios WHERE role = 'Estudiante'`, (error, studentRows) => {
            if (error) {
              console.error("Error al obtener los correos electrónicos de los estudiantes:", error.message);
              res.status(500).json({ error: "Error al obtener los correos electrónicos de los estudiantes" });
            } else {
              const students: string[] = studentRows.map((row) => row.email);

              // Obtener las tareas desde la base de datos
              db.all("SELECT * FROM tareas", (error, tasks) => {
                if (error) {
                  console.error("Error al obtener las tareas:", error.message);
                  res.status(500).json({ error: "Error al obtener las tareas" });
                  return;
                }

                // Renderizar la plantilla student.ejs con los datos de las tareas
                res.render("tareasActivasStudents", {
                  title: "Estudiante",
                  username: username,
                  email: students,
                  groups: groups,
                  role: role,
                  tasks: tasks,
                  students: students
                }); 
  console.log("Estudiantes disponibles:", students);
                
              });
            }
          });
        }
      });
    }
  });
});


app.get("/student", (req: Request<any, any, any, CustomSessionData>, res: Response) => {
  const username = req.session.username;
  const role = req.query.role;
  console.log("Valor de username en la sesión:", username);

  const dbPath = path.join(__dirname, "database.sqlite");

  const db = new sqlite3.Database(dbPath, (error) => {
    if (error) {
      console.error("Error al conectar a la base de datos SQLite:", error.message);
      res.status(500).json({ error: "Error al conectar a la base de datos SQLite" });
    } else {
      db.all<{ codigo: string }>(`SELECT codigo FROM grupos`, (error, rows) => {
        if (error) {
          console.error("Error al obtener los grupos:", error.message);
          res.status(500).json({ error: "Error al obtener los grupos" });
        } else {
          const groups: string[] = rows.map((row) => row.codigo);

          // Realizar la consulta para obtener los correos electrónicos de los estudiantes
          db.all<UsuarioRow>(`SELECT email FROM usuarios WHERE role = 'Estudiante'`, (error, studentRows) => {
            if (error) {
              console.error("Error al obtener los correos electrónicos de los estudiantes:", error.message);
              res.status(500).json({ error: "Error al obtener los correos electrónicos de los estudiantes" });
            } else {
              const students: string[] = studentRows.map((row) => row.email);

              // Obtener las tareas desde la base de datos
              db.all("SELECT * FROM tareas", (error, tasks) => {
                if (error) {
                  console.error("Error al obtener las tareas:", error.message);
                  res.status(500).json({ error: "Error al obtener las tareas" });
                  return;
                }

                // Renderizar la plantilla student.ejs con los datos de las tareas
                res.render("student", {
                  title: "Estudiante",
                  username: username,
                  email: students,
                  groups: groups,
                  role: role,
                  tasks: tasks,
                  students: students
                }); 
  console.log("Estudiantes disponibles:", students);
                
              });
            }
          });
        }
      });
    }
  });
});



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
        email TEXT,
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
      `CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        grupo_id INTEGER,
        profesor_email TEXT,
        FOREIGN KEY (grupo_id) REFERENCES grupos (id),
        FOREIGN KEY (profesor_email) REFERENCES usuarios (email)
      )`,
      (error) => {
        if (error) {
          console.error("Error al crear la tabla tareas:", error.message);
        } else {
          console.log("Tabla tareas creada exitosamente");
        }
      }
    );
  }
});

// Define una interfaz para describir la estructura de la fila de la base de datos
interface UsuarioRow {
  role: string;
  id: number;
  username: string;
  password: string;
  email: string;
  verified: number;

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
  email?: string;
  role?: string;

}

interface GrupoRow {
  id: number;
}


declare module "express-session" {
  interface SessionData {
    username?: string;
    email?: string;
  }
}

// Ruta para registrar un usuario
app.post("/send-confirmation-email", (req, res) => {
  const { email } = req.body;

  // Verificar si el correo electrónico ya existe
  db.get(
    `SELECT * FROM usuarios WHERE email = ?`,
    [email],
    (error, row) => {
      if (error) {
        console.error("Error al consultar los datos:", error.message);
        res.status(500).json({ error: "Error al enviar el correo de confirmación" });
      } else if (row) {
        // Si el correo electrónico ya existe, enviar una respuesta con un mensaje de error
        res.status(400).json({ error: "El correo electrónico ya está registrado" });
      } else {
        // Enviar correo de confirmación
        const confirmationCode = 'CONFIRMADO'; // Cambia esto por tu lógica para generar el código de confirmación
        enviarCorreoConfirmacion(email, confirmationCode);

        res.status(200).json({ message: "Correo de confirmación enviado" });
      }
    }
  );
});

app.post("/register", (req, res) => {
  const { username, password, email, role, confirmationCode } = req.body;

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
        // Verificar el código de confirmación
        if (confirmationCode !== 'CONFIRMADO') {
          res.status(400).json({ error: "Código de confirmación incorrecto" });
          return;
        }

        // Insertar los datos en la tabla usuarios
        db.run(
          `INSERT INTO usuarios (username, password, email, role) VALUES (?, ?, ?, ?)`,
          [username, password, email, role],
          function (error) {
            if (error) {
              console.error("Error al insertar los datos:", error.message);
              res.status(500).json({ error: "Error al registrar el usuario" });
            } else {
              console.log("Datos insertados exitosamente");

              res.status(200).json({ message: "Usuario registrado exitosamente" });
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
  const username = req.body.username;
  
  // Obtener el correo electrónico del estudiante
  const email = req.session.email;
  console.log("Valor del correo electrónico del estudiante:", email);

  // Obtener los grupos disponibles
  db.all<GrupoRow>(`
  SELECT grupos.*
  FROM grupos
  INNER JOIN usuarios ON grupos.id = usuarios.grupo_id
  WHERE usuarios.email = ?
`, [email], (error, rows) => {
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
  
      // Almacenar el correo electrónico en la sesión
      req.session.email = email
        ? Array.isArray(email)
          ? String(email[0])
          : String(email)
        : undefined;
  
      console.log("Valor de username en la sesión:", req.session.username);
      console.log("Correo electrónico del estudiante:", req.session.email);
      console.log("Valor del correo electrónico del estudiante:", email);
  
      res.render("student", {
        title: "Estudiante",
        username: username,
        email: email,
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
  const username = req.body.username; // Obtén el nombre de usuario del profesor desde la consulta
  console.log("ERROR:",username)
  // Obtener el ID del profesor
  db.get<{ id: number }>(
    `SELECT id FROM usuarios WHERE username = ? AND role = 'Profesor'`,
    [username],
    (error, row) => {
      if (error) {
        console.error("Error al consultar el ID del profesor:", error.message);
        res.status(500).json({ error: "Error al asignar la tarea" });
      } else if (row) {
        const professorId = row.id;

        // Verificar si el profesor tiene permisos para asignar tareas al grupo
        db.get<{ profesor_id: number }>(
          `SELECT profesor_id FROM grupos WHERE codigo = ?`,
          [groupCode],
          (error, row) => {
            if (error) {
              console.error("Error al verificar el grupo del profesor:", error.message);
              res.status(500).json({ error: "Error al asignar la tarea" });
            } else if (row && row.profesor_id === professorId) {
              // Insertar la tarea en la tabla de tareas
              db.run(
                `INSERT INTO tareas (titulo, descripcion, grupo_id) VALUES (?, ?, ?)`,
                [task, taskdescription, groupCode],
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
              res.status(400).json({ error: "El profesor no tiene permisos para asignar tareas a este grupo" });
            }
          }
        );
      } else {
        res.status(400).json({ error: "No se encontró el profesor" });
      }
    }
  );
});





app.post("/delete-task", (req: Request, res: Response) => {
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
    } else {
      console.log("Tarea eliminada exitosamente");
      res.status(200).json({ message: "Tarea eliminada exitosamente" });
    }
  });
});



app.post("/submit-task", upload.single("archivo"), async (req: Request, res: Response) => {
  const { taskId, textolibre } = req.body;
  const file = req.file;

  // Obtener el correo electrónico del estudiante seleccionado en el formulario
  const studentEmail = req.body.studentEmail;

  console.log("Correo electrónico del estudiante:", studentEmail);
  console.log(taskId, textolibre);

  try {
    // Obtener la información del profesor que subió la tarea
    const row: { profesor_email: string } = await new Promise((resolve, reject) => {
      db.get(
        `SELECT email as profesor_email FROM tareas 
        INNER JOIN usuarios ON tareas.profesor_email = usuarios.email 
        WHERE tareas.id = ?`,
        [taskId],
        (error, row: { profesor_email: string }) => {
          if (error) {
            reject(error);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!row || !row.profesor_email) {
      console.log("No se encontró la tarea especificada");
      return res.status(400).json({ error: "No se encontró la tarea especificada" });
    }

    const professorEmail = row.profesor_email; // Obtener el correo electrónico del profesor

    console.log("Correo electrónico del profesor:", professorEmail);

    // Configurar el transporte de correo electrónico
    const transporter = nodemailer.createTransport({
      // Configura los detalles del transporte de correo (por ejemplo, SMTP)
      // Consulta la documentación de Nodemailer para obtener más información
    });

    // Crea el correo electrónico a enviar
    const correoElectronico = {
      from: studentEmail,
      to: professorEmail,
      subject: "Tarea enviada",
      text: `Se ha enviado una tarea. Descripción adicional: ${textolibre}`,
      attachments: file
        ? [
            {
              filename: file.originalname,
              path: file.path
            }
          ]
        : []
    };

    // Envía el correo electrónico
    const info = await transporter.sendMail(correoElectronico);

    console.log("Correo electrónico enviado:", info.response);
    res.status(200).json({ message: "Tarea enviada exitosamente" });
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    res.status(500).json({ error: "Error al enviar la tarea" });
  }
});



// Función para enviar el correo de confirmación
function enviarCorreoConfirmacion(email: string, codigoConfirmacion: string) {
  // Configuración del correo de confirmación
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email, 
    from: 'taskflow50@gmail.com', 
    subject: 'Correo de verificación',
    text: 'Verifica tu correo para usar TaskFlow',
    html: `Si te llegó este correo de verificación, tu código secreto de confirmación es "${codigoConfirmacion}"`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error: Error) => {
      console.log("Error al enviar el correo de confirmación:", error);
    });
}

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});