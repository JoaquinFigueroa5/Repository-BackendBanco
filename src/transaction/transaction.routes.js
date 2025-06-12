import { Router } from "express";
import { check } from "express-validator";
import { createTransaction, getTransactions, getTransactionById, updateTransaction, getTransactionsByUser, deleteTransaction } from "./transaction.controller.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { existAccountById, destinationAccountById } from "../helpers/db-validator.js";
import { validateJWT } from "../middlewares/validate-jwt.js";

const router = Router();

router.get("/", getTransactions);

router.get(
    "/user/",
    [
        validateJWT
    ],
    getTransactionsByUser
)
router.get("/:id", getTransactionById);



router.post(
    "/",
    [
        check("accountId", "Account ID is required").not().isEmpty(),
        check("accountId", "Account ID must be a valid ID").isMongoId(),
        check("type", "Transaction type is required").not().isEmpty(),
        check("accountId").custom(existAccountById),
        check("type", "Transaction type must be one of 'Transferencia', 'Deposito', 'Reversion'")
            .isIn(['Transferencia', 'Deposito', 'Reversion']),
        check("amount", "Amount is required").not().isEmpty(),
        check("amount", "Amount must be a positive number").isDecimal({ gt: 0 }),
        check("details", "Details must be between 5 and 100 characters").isLength({ max: 75 }),
        check("destinationAccountId", "Destination account ID is required").not().isEmpty(),
        check("destinationAccountId", "Destination account ID must be a valid ID").isMongoId(),
        check("destinationAccountId").custom(destinationAccountById),
        validateFields,
    ],
    createTransaction
)

router.put(
    "/:id",
    [
        check("id", "Transaction ID must be a valid ID").isMongoId(),
        check("accountId", "Account ID is required").not().isEmpty(),
        check("accountId", "Account ID must be a valid ID").isMongoId(),
        check("accountId").custom(existAccountById),
        check("type", "Transaction type is required").not().isEmpty(),
        check("type", "Transaction type must be one of 'Transferencia', 'Deposito', 'Reversion'")
            .isIn(['Transferencia', 'Deposito', 'Reversion']),
        check("amount", "Amount is required").not().isEmpty(),
        check("amount", "Amount must be a positive number").isDecimal({ gt: 0 }),
        check("details", "Details must be between 5 and 100 characters").isLength({ max: 75 }),
        check("destinationAccountId", "Destination account ID is required").not().isEmpty(),
        check("destinationAccountId", "Destination account ID must be a valid ID").isMongoId(),
        check("destinationAccountId").custom(destinationAccountById),
        validateFields,
    ],
    updateTransaction
)

router.delete(
    "/:id",
    [
        check("id", "Transaction ID must be a valid ID").isMongoId(),
        validateFields,
    ],
    deleteTransaction
)

export default router;