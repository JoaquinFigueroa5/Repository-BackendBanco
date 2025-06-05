import { Router } from "express"
import { getAccounts, getAccountsById, createAccounts, updateAccount } from "./account.controller.js"

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

router.put(
    "/:id",
    updateAccount
)

export default router;