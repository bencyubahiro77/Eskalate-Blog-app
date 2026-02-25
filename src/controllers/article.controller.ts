import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ArticleService } from '../services/article.service';
import { BaseResponse, PaginatedResponse } from '../interfaces/response.interface';

export class ArticleController {
    static async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const article = await ArticleService.create(req.user!.id, req.body);
            const response: BaseResponse = {
                Success: true,
                Message: 'Article created successfully',
                Object: article,
                Errors: null,
            };
            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const articleId: string = String(req.params.id);
            const authorId: string = String(req.user!.id);
            const article = await ArticleService.update(articleId, authorId, req.body);
            const response: BaseResponse = {
                Success: true,
                Message: 'Article updated successfully',
                Object: article,
                Errors: null,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const articleId = String(req.params.id);
            const authorId = String(req.user!.id);
            await ArticleService.softDelete(articleId, authorId);
            const response: BaseResponse = {
                Success: true,
                Message: 'Article deleted successfully',
                Object: null,
                Errors: null,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async getMyArticles(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;

            const { articles, total } = await ArticleService.getMyArticles(req.user!.id, page, size);

            const response: PaginatedResponse = {
                Success: true,
                Message: 'Articles retrieved successfully',
                Object: articles,
                PageNumber: page,
                PageSize: size,
                TotalSize: total,
                Errors: null,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}
