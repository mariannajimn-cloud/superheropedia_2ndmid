import express from 'express';
import { fileURLToPath } from 'node:url';
import characterRoutes from './routes/characters.js';
import { ApiError, errorHandler } from './middleware/errors.js';

const app = express();

app.use('/api/characters', characterRoutes);

app.use('/api', (req, res, next) => {
  next(new ApiError(404, 'API route not found.'));
});

app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));

app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found.'));
});

app.use(errorHandler);

export { app };
