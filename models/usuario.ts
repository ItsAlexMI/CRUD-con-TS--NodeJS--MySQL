import { DataTypes, Model, Optional } from 'sequelize';
import { Sequelize } from 'sequelize';

interface UsuarioAttributes {
  id: number;
  nombre: string;
  email: string;
  estado: boolean;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id'> {}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public estado!: boolean;
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite', // Ruta y nombre del archivo de la base de datos SQLite
});

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios', // Nombre de la tabla en SQLite
    timestamps: false,
  }
);

export default Usuario;
