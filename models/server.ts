import express, { Application, Express } from "express";

import db from '../database/connect';

import cors from 'cors';

import userRoutes from "../routes/usuarios.routes";



export class Server {
  private app: Application;
  private port: string;
  private apiRoutes = {
    usuarios: "/api/usuarios",
  };
  constructor() {
    this.app = express();
    this.port = process.env.PORT || "8000";
    this.dbConnect();
    this.middleware();
    this.routes();
  }

  async dbConnect(){
    try{

      await db.authenticate();
      console.log('DataBase online');

    } catch(error:any){

      throw new Error(error);

    }
  }

  middleware(){
    //Trabajar con el Cross Domain

    this.app.use(cors());

    //Leer del body

    this.app.use(express.json());

    //Carpeta publica

    this.app.use(express.static('public'))

  }


  routes() {
    this.app.use(this.apiRoutes.usuarios, userRoutes);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("El servidor esta corriendo en el puerto", this.port);
    });
  }
}

export class Server2 {
  private app: Express;
  private port: number;
  apiRoutes: any;

  constructor() {
    this.app = express();
    this.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    // Configurar middlewares y rutas
    this.configureMiddlewares();
    this.configureRoutes();
  }

  private configureMiddlewares(): void {
    this.app.use(cors());

    //Leer del body

    this.app.use(express.json());

    //Carpeta publica

    this.app.use(express.static('public'))

  }

  private configureRoutes(): void {
    this.app.use(this.apiRoutes.usuarios, userRoutes);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor en funcionamiento en http://localhost:${this.port}`);
    });
  }
}
