import { Router } from "express";
import { check } from "express-validator";
import { getAccounts, getAccountsById, createAccounts, updateAccount } from "./account.controller.js";
import { validateFields } from "../middlewares/validate-fields.js"; // asegúrate de tener este middleware

const router = Router();

router.get("/", getAccounts);

router.get("/:id", getAccountsById);

router.post(
  "/",
  [
    check("userId", "El ID del usuario es obligatorio").not().isEmpty(),
    check("userId", "El ID del usuario debe ser un ID válido").isMongoId(),
    check("balance", "El balance es obligatorio").not().isEmpty(),
    check("balance", "El balance debe ser numérico").isNumeric(),
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
