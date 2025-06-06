import { Router } from 'express';
import { createDeposit } from './deposit.controller.js';

const router = Router();

router.post('/', createDeposit)

export default router;