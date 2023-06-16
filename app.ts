import dotenv from 'dotenv';
import {Server} from './models/server';
import express from 'express'
;
const path = require('path');
dotenv.config();

const server = new Server();

server.listen();


const app = express();
const port = 3000;

// Configuración de Express
app.set('views', path.join(__dirname, 'public')); // Establecer el directorio de vistas como "public"
app.set('view engine', 'ejs'); // Establecer el motor de vistas como "html"

// Ruta principal
app.get('/', (req, res) => {
  res.render('login', { title: 'Inicio de sesión' });
});

app.get('/register',(req,res)=>{
  res.render('register',{title: 'Registro'});
});

app.get('/student',(req,res)=>{
  res.render('student',{title: 'Estudiante'});
});

app.get('/teacher',(req,res)=>{
  res.render('teacher',{title: 'Profesor'});
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});


