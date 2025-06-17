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
            numberAccount: account._id,
            amount
        });

        await deposit.save();

        const savedDeposit = await deposit.populate('numberAccount', 'accountNumber');

        return res.status(201).json({
            success: true,
            msg: 'Deposit created successfully',
            deposit: savedDeposit
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while creating the deposit',
            error: error.message
        });
    }
};


export const revertDeposit = async (req, res) => {
    try {

        const { id } = req.params;
        const deposit = await Deposit.findById(id).populate('numberAccount')
        
        if (!deposit) {
            return res.status(404).json({
                success: false,
                msg: 'Deposit not found'
            })
        }

        if (deposit.reversed) {
            return res.status(400).json({
                success: false,
                msg: 'Deposit has already been reverted'
            })
        }

        const now = new Date();
        const diffSeconds = (now - deposit.depositDate) / 1000;

        if (diffSeconds > 60) {
            return res.status(400).json({
                success: false,
                msg: 'Cannot revert, more than 1 minute has passed'
            })
        }
        
        const account = await Account.findOne({ accountNumber: deposit.numberAccount.accountNumber });
        
        if (!account) {
            return res.status(404).json({
                success: false,
                msg: 'Account not found'
            })
        }

        account.balance = (parseFloat(account.balance) - parseFloat(deposit.amount)).toFixed(2);
        await account.save();

        deposit.reversed = true;
        await deposit.save();

        return res.status(200).json({
            success: true,
            msg: 'Deposit reverted successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while reverting the deposit',
            error: error.message
        })
    }
}

export const getDeposits = async (req, res) => {
    try {

        const deposits = await Deposit.find().populate('numberAccount')
        return res.status(200).json({
            success: true,
            deposits
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while fetching deposits',
            error: error.message
        })
    }
}

export const getDepositById = async (req, res) => {
    try {
        const { id } = req.params;
        const deposit = await Deposit.findById(id);

        if (!deposit) {
            return res.status(404).json({
                success: false,
                msg: 'Deposit not found'
            })
        }

        return res.status(200).json({
            success: true,
            deposit
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while fetching the deposit',
            error: error.message
        })
    }
}

export const getDepositsByAccount = async (req, res) => {
    try {
        const { numberAccount } = req.params;
        const deposits = await Deposit.find({ numberAccount });

        if (deposits.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'No deposits found for this account'
            });
        }

        return res.status(200).json({
            success: true,
            deposits
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while fetching deposits for the account',
            error: error.message
        });
    }
}