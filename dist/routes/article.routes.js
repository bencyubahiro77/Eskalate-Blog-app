"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const article_controller_1 = require("../controllers/article.controller");
const public_controller_1 = require("../controllers/public.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', public_controller_1.PublicController.getArticles);
router.get('/:id', auth_middleware_1.optionalAuthenticate, public_controller_1.PublicController.getArticleDetail);
// Author only routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['author']), article_controller_1.ArticleController.create);
router.get('/me', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['author']), article_controller_1.ArticleController.getMyArticles);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['author']), article_controller_1.ArticleController.update);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['author']), article_controller_1.ArticleController.delete);
exports.default = router;
