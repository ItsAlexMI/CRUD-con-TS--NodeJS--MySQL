import { Sequelize } from "sequelize";

const db = new Sequelize('railway', 'root', 'ri7FqDt5cAhrbgNiXp2D',{
    host: 'containers-us-west-125.railway.app',
    dialect: 'mysql',
    port: 6369
});

export default db;