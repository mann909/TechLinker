import express from 'express';
import cors from 'cors';
import multer from 'multer';
import logger from './utils/logger.js';
import morgan from 'morgan';
import dotenv from 'dotenv';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import v1 from './routes/routes.js';
import init from './config/mongo.js';

dotenv.config();

const morganFormat = ':method :url :status :response-time ms';

const app = express();

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

init();

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
  cors({
    allowedHeaders: 'Content-Type',
    credentials: true,
    methods: ['POST', 'GET', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    origin: process.env.FRONTEND_URL,
  })
);

app.use('', v1);
const databaseStatus = true;

const server = app.listen(process.env.PORT, () => {
  const port = server.address().port;
  console.log(chalk.cyan.bold('********************************'));
  console.log(chalk.green.bold('   🚀 Server Information 🚀'));
  console.log(chalk.cyan.bold('********************************'));
  console.log(chalk.yellow.bold('App Name:    techLinker Web'));
  console.log(chalk.yellow.bold(`Port:        ${port}`));
  console.log(
    chalk.yellow.bold(
      `Database:    ${databaseStatus ? `Datbase Connected Successfullly` : `Connection Error with MongoDb`}`
    )
  );
  console.log(chalk.cyan.bold('********************************'));
  console.log(chalk.green.bold('🚀 Server is up and running! 🚀'));
  console.log(chalk.cyan.bold('********************************'));
});
