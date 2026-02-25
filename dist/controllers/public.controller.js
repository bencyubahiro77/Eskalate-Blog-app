"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const public_service_1 = require("../services/public.service");
class PublicController {
    static async getArticles(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.size) || 10;
            const { category, author, q } = req.query;
            const { articles, total } = await public_service_1.PublicService.getArticles({
                category: req.query.category,
                author: req.query.author,
                q: req.query.q,
                page,
                size
            });
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
    static async getArticleDetail(req, res, next) {
        try {
            const article = await public_service_1.PublicService.getArticleById(req.params.id, req.user?.id);
            const response = {
                Success: true,
                Message: 'Article retrieved successfully',
                Object: article,
                Errors: null,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PublicController = PublicController;
