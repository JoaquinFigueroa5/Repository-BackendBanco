import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { loginValidator, registerValidator } from "../middlewares/validator.js";
import { validateIncome } from "../middlewares/validate-user.js";

const router= Router()

router.post(
    '/login',
    loginValidator,
    login
)

router.post(
    "/register",
    registerValidator,
    validateIncome,
    register
)


export default router