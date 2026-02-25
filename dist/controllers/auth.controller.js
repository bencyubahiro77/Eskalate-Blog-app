"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async signup(req, res, next) {
        try {
            const user = await auth_service_1.AuthService.signup(req.body);
            const response = {
                Success: true,
                Message: 'User registered successfully',
                Object: user,
                Errors: null,
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const data = await auth_service_1.AuthService.login(req.body);
            const response = {
                Success: true,
                Message: 'Login successful',
                Object: data,
                Errors: null,
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
