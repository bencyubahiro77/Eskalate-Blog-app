import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import articleRoutes from './routes/article.routes';
import authorRoutes from './routes/author.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);
app.use('/author', authorRoutes);

// Error Handling
app.use(errorHandler);

export default app;
