import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { BaseResponse } from '../interfaces/response.interface';

export class AuthController {
    static async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await AuthService.signup(req.body);
            const response: BaseResponse = {
                Success: true,
                Message: 'User registered successfully',
                Object: user,
                Errors: null,
            };
            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await AuthService.login(req.body);
            const response: BaseResponse = {
                Success: true,
                Message: 'Login successful',
                Object: data,
                Errors: null,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}
