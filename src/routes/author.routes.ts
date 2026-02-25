import { Router } from 'express';
import { AuthorController } from '../controllers/author.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authenticate, authorize(['author']), AuthorController.getDashboard);

export default router;
