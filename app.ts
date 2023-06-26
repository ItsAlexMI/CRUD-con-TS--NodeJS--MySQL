import dotenv from 'dotenv';
import { Server } from './models/server';
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

dotenv.config();

const server = new Server();
server.listen();

const app = express();
const port = 3000;

app.use(express.json());
// Configuración de Express
app.set('views', path.join(__dirname, 'public')); // Establecer el directorio de vistas como "public"
app.set('view engine', 'ejs'); // Establecer el motor de vistas como "ejs"

// Ruta principal
app.get('/', (req: Request, res: Response) => {
  res.render('login', { title: 'Inicio de sesión' });
});

app.get('/register', (req: Request, res: Response) => {
  res.render('register', { title: 'Registro' });
});

app.get('/student', (req: Request, res: Response) => {
  // Obtener el nombre de usuario correspondiente y asignarlo a la variable `username`
  const username = req.query.username;

  res.render('student', { title: 'Estudiante', username: username });
});

app.get('/teacher', (req: Request, res: Response) => {
  res.render('teacher', { title: 'Profesor', username: req.query.username });
});

// Configuración de la base de datos SQLite
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Error al conectar a la base de datos SQLite:', error.message);
  } else {
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
  } else {
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
  } else {
    console.log('Tabla grupos creada exitosamente');
  }
});

// Define una interfaz para describir la estructura de la fila de la base de datos
interface UsuarioRow {
  role: string;
  id: number;

  // Otras propiedades de la fila si las hay
}

// Ruta para registrar un usuario
app.post('/register', (req: Request, res: Response) => {
  // Obtener los datos del formulario de registro
  const { username, password, role } = req.body;

  // Verificar si el usuario ya existe
  db.get(`SELECT * FROM usuarios WHERE username = ?`, [username], (error, row) => {
    if (error) {
      console.error('Error al consultar los datos:', error.message);
      res.status(500).json({ error: 'Error al registrar el usuario' });
    } else if (row) {
      // Si el usuario ya existe, enviar una respuesta con un mensaje de error
      res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    } else {
      // Si el usuario no existe, insertarlo en la base de datos
      db.run(`INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)`, [username, password, role], function (error) {
        if (error) {
          console.error('Error al insertar los datos:', error.message);
          res.status(500).json({ error: 'Error al registrar el usuario' });
        } else {
          // Obtener el ID del usuario recién registrado
          const userId = this.lastID;

          // Redireccionar al usuario a la página correspondiente según su rol
          if (role === 'student') {
            res.redirect(`/student?username=${username}`);
          } else if (role === 'teacher') {
            res.redirect(`/teacher?username=${username}`);
          } else {
            res.status(400).json({ error: 'Rol de usuario no válido' });
          }
        }
      });
    }
  });
});

// Ruta para autenticar al usuario
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Verificar las credenciales del usuario en la base de datos
  db.get(`SELECT * FROM usuarios WHERE username = ? AND password = ?`, [username, password], (error, row: UsuarioRow) => {
    if (error) {
      console.error('Error al consultar los datos:', error.message);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    } else if (row) {
      // Si las credenciales son válidas, redireccionar al usuario a la página correspondiente según su rol
      if (row.role === 'student') {
        res.redirect(`/student?username=${username}`);
      } else if (row.role === 'teacher') {
        res.redirect(`/teacher?username=${username}`);
      } else {
        res.status(400).json({ error: 'Rol de usuario no válido' });
      }
    } else {
      // Si las credenciales no son válidas, enviar una respuesta con un mensaje de error
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  });
});

// Ruta para crear un grupo de clases

app.post('/group', (req: Request, res: Response) => {
  const { username } = req.query;

  // Verificar si el profesor existe en la base de datos y tiene el rol "Profesor"
  db.get(`SELECT * FROM usuarios WHERE username = ? AND role = 'Profesor'`, [username], (error, row: UsuarioRow) => {
    if (error) {
      console.error('Error al consultar los datos:', error.message);
      res.status(500).json({ error: 'Error al crear el grupo' });
    } else if (row) {
      // Si el profesor existe, insertar el grupo en la base de datos
      const groupCode = generateGroupCode(); // Generar un código de grupo aleatorio

      db.run(`INSERT INTO grupos (codigo, profesor_id) VALUES (?, ?)`, [groupCode, row.id], function (error) {
        if (error) {
          console.error('Error al insertar los datos:', error.message);
          res.status(500).json({ error: 'Error al crear el grupo' });
        } else {
          res.redirect(`/teacher?username=${username}`);
        }
      });
    } else {
      // Si el profesor no existe o no tiene el rol "Profesor", enviar una respuesta con un mensaje de error
      res.status(400).json({ error: 'No se encontró al profesor' });
    }
  });
});



// Ruta para que un estudiante se una a un grupo de clases
app.post('/join', (req: Request, res: Response) => {
  const { username, code } = req.body;

  // Verificar si el grupo existe en la base de datos
  db.get(`SELECT * FROM grupos WHERE codigo = ?`, [code], (error, row: { id: number }) => {
    if (error) {
      console.error('Error al consultar los datos:', error.message);
      res.status(500).json({ error: 'Error al unirse al grupo' });
    } else if (row) {
      // Obtener el ID del grupo
      const groupId = row.id;

      // Verificar si el estudiante existe en la base de datos
      db.get(`SELECT * FROM usuarios WHERE username = ? AND role = 'student'`, [username], (error, row: UsuarioRow) => {
        if (error) {
          console.error('Error al consultar los datos:', error.message);
          res.status(500).json({ error: 'Error al unirse al grupo' });
        } else if (row) {
          // Si el estudiante existe, actualizar el registro en la base de datos para unirse al grupo
          db.run(`UPDATE usuarios SET grupo_id = ? WHERE id = ?`, [groupId, row.id], function (error) {
            if (error) {
              console.error('Error al actualizar los datos:', error.message);
              res.status(500).json({ error: 'Error al unirse al grupo' });
            } else {
              res.redirect(`/student?username=${username}`);
            }
          });
        } else {
          // Si el estudiante no existe, enviar una respuesta con un mensaje de error
          res.status(400).json({ error: 'No se encontró al estudiante' });
        }
      });
    } else {
      // Si el grupo no existe, enviar una respuesta con un mensaje de error
      res.status(400).json({ error: 'No se encontró el grupo' });
    }
  });
});

// Generar un código de grupo aleatorio
function generateGroupCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 6;

  let code = '';
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

// Ruta para manejar todas las demás rutas no encontradas
app.get('*', (req: Request, res: Response) => {
  res.status(404).send('Página no encontrada');
});

// Iniciar el servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
