import { Router } from 'express';
import { 
    createDeposit, 
    getDepositById, 
    getDeposits, 
    getDepositsByAccount, 
    revertDeposit, 
    getDepositsHistory 
} from './deposit.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';

const router = Router();

router.post('/', createDeposit)

router.post('/:id', revertDeposit)

router.get('/', getDeposits)

router.get('/history',
    [
        validateJWT
    ],
    getDepositsHistory)

router.get('/:id', getDepositById)

router.get('/account/:numberAccount', getDepositsByAccount)

router.get('/history', getDepositsHistory)

export default router;