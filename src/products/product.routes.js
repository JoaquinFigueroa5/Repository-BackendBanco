import { Router } from "express";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { deleteProduct, getProduct, getAllProducts, saveProduct, updateProduct, reactivateProduct,buyProduct } from "./product.controller.js";
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

router.get("/allProducts", getAllProducts)

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

router.put(
    "/reactivateProduct/:id",
    [
        validateJWT,
        check("id", "not a valid ID").isMongoId(),
        validateProduct,
        validateFields
    ],
    reactivateProduct
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

router.post(
    "/buyProduct",
    validateJWT,
    buyProduct
)


export default router