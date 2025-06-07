import { Router } from 'express';
import { createDeposit, getDepositById, getDeposits, getDepositsByAccount, revertDeposit } from './deposit.controller.js';

const router = Router();

router.post('/', createDeposit)

router.post('/:id', revertDeposit)

router.get('/', getDeposits)

router.get('/:id', getDepositById)

router.get('/account/:numberAccount', getDepositsByAccount)

export default router;