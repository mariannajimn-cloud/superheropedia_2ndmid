import express from 'express';
import { fileURLToPath } from 'node:url';
import characterRoutes from './routes/charactersRoutes.js';
import { ApiError, errorHandler } from './middleware/errors.js';

const app = express();

app.use('/api', characterRoutes);

app.use('/api', (req, res, next) => {
  next(new ApiError(404, 'API route not found.'));
});

app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));

app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found.'));
});

app.use(errorHandler);

export { app };
