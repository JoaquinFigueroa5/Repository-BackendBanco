import Deposit from './deposit.model.js';
import Account from '../accounts/account.model.js';

export const createDeposit = async (req, res) => {
    try {
        const { numberAccount, amount } = req.body;
        const user = req.usuario;

        const account = await Account.findOne({ accountNumber: numberAccount, status: true });

        if (!account) {
            return res.status(404).json({
                success: false,
                msg: 'Account not found'
            });
        }

        if (user.role === 'USER_ROLE') {
            const userAccount = await Account.findOne({ userId: user._id, status: true });
            if (!userAccount) {
                return res.status(403).json({
                    success: false,
                    msg: 'You do not have an active account'
                });
            }
            if (userAccount.accountNumber !== numberAccount) {
                return res.status(403).json({
                    success: false,
                    msg: 'You can only deposit to your own account'
                });
            }
        }

        account.balance = (parseFloat(account.balance) + parseFloat(amount)).toFixed(2);
        await account.save();

        const deposit = new Deposit({
            numberAccount: account._id,
            amount,
            createdBy: user._id,
        })

        await deposit.save();

        return res.status(201).json({
            success: true,
            msg: 'Deposit created successfully',
            deposit
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while creating the deposit',
            error: error.message
        })
    }
}

export const revertDeposit = async (req, res) => {
    try {

        const { id } = req.params;
        const deposit = await Deposit.findById(id);

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
        const diffSeconds = (now - deposit.createdAt) / 1000;

        if (diffSeconds > 60) {
            return res.status(400).json({
                success: false,
                msg: 'Cannot revert, more than 1 minute has passed'
            })
        }

        const account = await Account.findById(deposit.numberAccount);
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

export const getMyDeposits = async (req, res) => {
    try {

        const user = req.usuario

        if (user.role === 'ADMIN_ROLE') {
            const deposits = await Deposit.find({ createdBy: user._id })
                .populate({
                    path: 'numberAccount',
                    select: 'accountNumber balance',
                    populate: {
                        path: 'userId',
                        select: 'name surname'
                    }
                })

            return res.status(200).json({
                success: true,
                deposits: deposits.map(dep => ({
                    _id: dep._id,
                    amount: dep.amount.toString(),
                    accountNumber: dep.numberAccount?.accountNumber || null,
                    accountHolder: dep.numberAccount?.userId ? `${dep.numberAccount.userId.name} ${dep.numberAccount.userId.surname}` : null,
                    createdAt: dep.createdAt,
                    reversed: dep.reversed
                }))
            })
        }

        const deposits = await Deposit.find({ createdBy: user._id })
            .populate({
                path: 'numberAccount',
                select: 'accountNumber balance',
                populate: {
                    path: 'userId',
                    select: 'name surname'
                }
            })

        if (!deposits.length) {
            return res.status(404).json({
                success: false,
                msg: 'You do not have any deposits'
            })
        }

        return res.status(200).json({
            success: true,
            deposits: deposits.map(dep => ({
                _id: dep._id,
                amount: dep.amount.toString(),
                accountNumber: dep.numberAccount?.accountNumber || null,
                accountHolder: dep.numberAccount?.userId ? `${dep.numberAccount.userId.name} ${dep.numberAccount.userId.surname}` : null,
                destinationAccount: dep.numberAccount?.accountNumber || null,
                createdAt: dep.createdAt,
                reversed: dep.reversed
            }))
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'An error occurred while fetching your deposits',
            error: error.message
        })
    }
}

export const getDeposits = async (req, res) => {
    try {

        const deposits = await Deposit.find();
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