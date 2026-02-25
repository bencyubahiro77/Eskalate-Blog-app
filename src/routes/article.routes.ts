import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { PublicController } from '../controllers/public.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth.middleware';

const router = Router();

// Author only routes (must be before /:id to avoid "me" being treated as a dynamic param)
router.post('/', authenticate, authorize(['author']), ArticleController.create);
router.get('/me', authenticate, authorize(['author']), ArticleController.getMyArticles);
router.put('/:id', authenticate, authorize(['author']), ArticleController.update);
router.delete('/:id', authenticate, authorize(['author']), ArticleController.delete);

// Public routes (/:id must come last to avoid swallowing /me)
router.get('/', PublicController.getArticles);
router.get('/:id', optionalAuthenticate, PublicController.getArticleDetail);

export default router;
