import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AuthorService } from '../services/author.service';
import { PaginatedResponse } from '../interfaces/response.interface';

export class AuthorController {
    static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;
            const authorId = req.user!.id;

            const { data, total } = await AuthorService.getDashboard(authorId, page, size);

            const response: PaginatedResponse = {
                Success: true,
                Message: 'Dashboard data retrieved successfully',
                Object: data,
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
