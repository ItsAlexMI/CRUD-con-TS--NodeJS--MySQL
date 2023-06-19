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
  res.render('student', { title: 'Estudiante' });
});

app.get('/teacher', (req: Request, res: Response) => {
  res.render('teacher', { title: 'Profesor' });
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

// Crear la tabla "usuarios" si no existe
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

// Define una interfaz para describir la estructura de la fila de la base de datos
interface UsuarioRow {
  role: string;
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
      res.status(400).json({ error: 'El usuario ya existe' });
    } else {
      // Insertar los datos en la tabla usuarios
      db.run(`INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)`, [username, password, role], (error) => {
        if (error) {
          console.error('Error al insertar los datos:', error.message);
          res.status(500).json({ error: 'Error al registrar el usuario' });
        } else {
          console.log('Datos insertados exitosamente');
          res.status(200).json({ message: 'Usuario registrado exitosamente' });
        }
      });
    }
  });
});
// Ruta para iniciar sesión
app.post('/', (req: Request, res: Response) => {
  // Obtener los datos del formulario de inicio de sesión
  const { username, password } = req.body;

  // Verificar si los datos existen en la base de datos
  db.get(`SELECT role FROM usuarios WHERE username = ? AND password = ?`, [username, password], (error, row: UsuarioRow) => {
    if (error) {
      console.error('Error al consultar los datos:', error.message);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    } else if (row) {
      const role = row.role;

      // Redireccionar al usuario según su rol
      if (role === 'Estudiante') {
        res.redirect('/student');
      } else if (role === 'Profesor') {
        res.redirect('/teacher');
      } else {
        res.status(401).json({ error: 'Rol de usuario inválido' });
      }
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  });
});

// Cerrar la conexión cuando hayas terminado
app.on('close', () => {
  db.close((error) => {
    if (error) {
      console.error('Error al cerrar la conexión con la base de datos SQLite:', error.message);
    } else {
      console.log('Conexión con la base de datos SQLite cerrada exitosamente');
    }
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});
