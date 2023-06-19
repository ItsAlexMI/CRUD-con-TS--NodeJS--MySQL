import express, { Application } from 'express';
import cors from 'cors';
import userRoutes from '../routes/usuarios.routes';

export class Server {
  private app: Application;
  private port: string;
  private apiRoutes = {
    usuarios: '/api/usuarios',
  };

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '8000';
    this.middleware();
    this.routes();
  }

  middleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  routes() {
    this.app.use(this.apiRoutes.usuarios, userRoutes);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('El servidor está corriendo en el puerto', this.port);
    });
  }
}
