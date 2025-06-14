import { Router } from 'express';
import { createDeposit, getDepositById, getDeposits, getDepositsByAccount, revertDeposit, getMyDeposits } from './deposit.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';

const router = Router();

router.post('/',
    [
        validateJWT
    ],
    createDeposit
)

router.post('/:id', 
    [
        validateJWT
    ],
    revertDeposit
)

router.get('/myDeposits',
    [
        validateJWT
    ],
    getMyDeposits
)

router.get('/', getDeposits)

router.get('/:id', getDepositById)

router.get('/account/:numberAccount', getDepositsByAccount)

export default router;