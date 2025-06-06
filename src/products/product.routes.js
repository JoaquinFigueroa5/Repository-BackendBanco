import { Router } from "express";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { deleteProduct, getProduct, saveProduct, updateProduct } from "./product.controller.js";
import { validateProduct } from "../middlewares/validate-product.js";

const router = Router();

router.post(
    "/",
    [
        validateJWT,
        validateProduct,
        validateFields
    ],
    saveProduct
)

router.get("/", getProduct)

router.put(
    "/:id",
    [
        validateJWT,
        check("id", "not is a valid ID").isMongoId(),
        validateProduct,
        validateFields

    ],
    updateProduct
)

router.delete(
    "/:id",
    [
        validateJWT,
        check("id", "not a valid ID").isMongoId(),
        validateProduct,
        validateFields
    ],
    deleteProduct
)


export default router