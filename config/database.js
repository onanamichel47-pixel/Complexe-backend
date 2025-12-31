// config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // Render → Postgres
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 30000,
    },
    dialectOptions: {
      ssl: false, // internal DB avec sslmode=disable
    },
    define: {
      timestamps: true,
      underscored: true,
    },
    timezone: '+01:00',
  });
} 

export default sequelize;
