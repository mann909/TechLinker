import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadModels = async () => {
  const modelPromises = fs
    .readdirSync(path.join(__dirname, '../models'))
    .map(async (model) => {
      const importedModel = (await import(`../models/${model}`)).default;
      await importedModel.init();
      return importedModel;
    });

  // Wait for all models to be loaded and initialized
  await Promise.all(modelPromises);
};

const init = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const mongoURI = process.env.DB_URL;

      await mongoose.connect(mongoURI);

      const conn = mongoose.connection;

      conn.once('open', async () => {
        try {
          await loadModels();
          console.log('All models loaded and initialized');
          resolve('Database connected and models initialized');
        } catch (error) {
          console.error('Error loading models:', error);
          reject(error);
        }
      });

      conn.on('error', (err) => {
        console.error('Database connection error:', err);
        reject(err);
      });
    } catch (error) {
      console.error('Connection attempt failed:', error);
      reject(error);
    }
  });
};

export default init;
