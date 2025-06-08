import { Router } from "express";
import { check } from "express-validator";
import { deleteUser, getUserProfile, getUsers, updateUser } from "./user.controller.js";
import { existUserById, existUsername } from "../helpers/db-validator.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateOwner, validateEmail, validateAdmin } from "../middlewares/validate-user.js";
import { registerValidator } from "../middlewares/validator.js";

const router = Router()

router.get(
    "/",
    [
        validateJWT,
        validateAdmin
    ],
    getUsers
)

router.put(
    "/:id",
    [
        validateJWT,
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existUserById),
        validateFields
    ],
    updateUser

)

router.delete(
    "/:id",
    [
        validateJWT,
        check("id", "Not a valid ID").isMongoId(),
        check("id").custom(existUserById),
        validateOwner,
        validateFields
    ],
    deleteUser
)

router.get(
    '/profile',
    [
        validateJWT,
    ],
    getUserProfile
)

export default router;