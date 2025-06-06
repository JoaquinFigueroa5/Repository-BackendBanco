import Deposit from './deposit.model.js';
import Account from '../accounts/account.model.js';

export const createDeposit = async (req, res) => {
    try {

        const { numberAccount, amount } = req.body;

        const account = await Account.findOne({ accountNumber: numberAccount });

        if (!account) {
            return res.status(404).json({
                success: false,
                msg: 'Account not found'
            });
        }

        account.balance = (parseFloat(account.balance) + parseFloat(amount)).toFixed(2);
        await account.save();

        const deposit = new Deposit({
            numberAccount,
            amount,
        })

        await deposit.save();

        return res.status(201).json({
            success: true,
            msg: 'Deposit created successfully',
            deposit
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg:'An error occurred while creating the deposit',
            error: error.message
        })
    }
}