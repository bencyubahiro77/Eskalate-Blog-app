"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleController = void 0;
const article_service_1 = require("../services/article.service");
class ArticleController {
    static async create(req, res, next) {
        try {
            const article = await article_service_1.ArticleService.create(req.user.id, req.body);
            const response = {
                Success: true,
                Message: 'Article created successfully',
                Object: article,
                Errors: null,
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const articleId = String(req.params.id);
            const authorId = String(req.user.id);
            const article = await article_service_1.ArticleService.update(articleId, authorId, req.body);
            const response = {
                Success: true,
                Message: 'Article updated successfully',
                Object: article,
                Errors: null,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            const articleId = String(req.params.id);
            const authorId = String(req.user.id);
            await article_service_1.ArticleService.softDelete(articleId, authorId);
            const response = {
                Success: true,
                Message: 'Article deleted successfully',
                Object: null,
                Errors: null,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyArticles(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.size) || 10;
            const { articles, total } = await article_service_1.ArticleService.getMyArticles(req.user.id, page, size);
            const response = {
                Success: true,
                Message: 'Articles retrieved successfully',
                Object: articles,
                PageNumber: page,
                PageSize: size,
                TotalSize: total,
                Errors: null,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ArticleController = ArticleController;
