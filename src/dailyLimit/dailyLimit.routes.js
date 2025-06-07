import { Router } from "express";
import {createDailyLimit } from './dailyLimit.controller.js'
import { validateJWT } from "../middlewares/validate-jwt.js";

const router = Router();

router.post(
    '/',
    [
        validateJWT
    ],
    createDailyLimit
)

export default router;
