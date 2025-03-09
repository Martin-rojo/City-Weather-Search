import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import for the routes
import routes from './routes/index.js';

const app = express();

const PORT = process.env.PORT || 3001;

// Serves static files from client dist folder
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect routes
app.use(routes);

// Starts the server on the port
app.listen(PORT, () => console.log(`Localhost: ${PORT}`));