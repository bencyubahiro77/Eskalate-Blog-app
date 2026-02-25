import { Request, Response, NextFunction } from 'express';
import { PublicService } from '../services/public.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BaseResponse, PaginatedResponse } from '../interfaces/response.interface';

export class PublicController {
    static async getArticles(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;
            const { category, author, q } = req.query;

            const { articles, total } = await PublicService.getArticles({
                category: req.query.category as string,
                author: req.query.author as string,
                q: req.query.q as string,
                page,
                size
            });

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

    static async getArticleDetail(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const article = await PublicService.getArticleById(req.params.id, req.user?.id);
            const response: BaseResponse = {
                Success: true,
                Message: 'Article retrieved successfully',
                Object: article,
                Errors: null,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}
