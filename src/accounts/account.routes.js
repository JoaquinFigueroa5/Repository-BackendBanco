import { Router } from "express";
import { check } from "express-validator";
import { getAccounts, getAccountsById, createAccounts, updateAccount, getUserAccount } from "./account.controller.js";
import { validateFields } from "../middlewares/validate-fields.js"; // asegúrate de tener este middleware
import { validateJWT } from "../middlewares/validate-jwt.js";
import { validateAdmin } from "../middlewares/validate-user.js";

const router = Router();
router.get(
  "/my-account",
  [
    validateJWT
  ],
  getUserAccount
)

router.get("/", getAccounts);

router.get("/:id", getAccountsById);

router.post(
  "/",
  [
    check("userId", "El ID del usuario es obligatorio").not().isEmpty(),
    check("userId", "El ID del usuario debe ser un ID válido").isMongoId(),
    validateJWT,
    validateAdmin,
    validateFields
  ],
  createAccounts
);

router.put(
  "/:id",
  [
    check("id", "El ID de la cuenta debe ser válido").isMongoId(),
    check("balance").optional().isNumeric().withMessage("El balance debe ser numérico si se envía"),
    validateFields
  ],
  updateAccount
);


export default router;
