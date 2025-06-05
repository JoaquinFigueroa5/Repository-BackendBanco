import { Router } from "express"
import { getAccounts, getAccountsById, createAccounts } from "./account.controller.js"

const router = Router()

router.get(
    "/", 
    getAccounts
)

router.get(
    "/:id",
    getAccountsById
)

router.post(
    "/",
    createAccounts
)

export default router;