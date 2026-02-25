"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorController = void 0;
const author_service_1 = require("../services/author.service");
class AuthorController {
    static async getDashboard(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const size = parseInt(req.query.size) || 10;
            const authorId = req.user.id;
            const { data, total } = await author_service_1.AuthorService.getDashboard(authorId, page, size);
            const response = {
                Success: true,
                Message: 'Dashboard data retrieved successfully',
                Object: data,
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
exports.AuthorController = AuthorController;
