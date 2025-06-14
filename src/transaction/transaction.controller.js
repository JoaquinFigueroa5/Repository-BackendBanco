import Transaction from './transaction.model.js';
import Account from '../accounts/account.model.js';
import Deposit from '../deposits/deposit.model.js';
import { request, response } from 'express';


export const createTransaction = async (req, res) => {
  try {
    const { accountId, type, amount, details, destinationNumberAccount } = req.body;

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    if (type === 'Transferencia' && Number(amount) > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot exceed Q2000 for Transferencias'
      });
    }

    if (type !== 'Deposito' && !accountId) {
      return res.status(400).json({
        success: false,
        message: 'Origin account is required for this transaction type'
      });
    }

    const destinationAccount = await Account.findOne({ accountNumber: destinationNumberAccount });
    if (!destinationAccount) {
      return res.status(404).json({
        success: false,
        message: 'Destination account not found'
      });
    }

    let accountOwner = null;
    if (type !== 'Deposito') {
      accountOwner = await Account.findById(accountId);
      if (!accountOwner) {
        return res.status(404).json({
          success: false,
          message: 'Origin account not found'
        });
      }
    }

    if (type === 'Transferencia') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const totalTransfers = await Transaction.aggregate([
        {
          $match: {
            accountId: accountOwner._id,
            type: 'Transferencia',
            createdAt: { $gte: startOfDay, $lte: endOfDay }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: "$amount" } }
          }
        }
      ]);

      const previousTotal = totalTransfers[0]?.total || 0;
      const transferAmount = parseFloat(amount);

      if (previousTotal + transferAmount > 10000) {
        return res.status(400).json({
          success: false,
          message: `Daily transfer limit exceeded. You have already transferred Q${previousTotal.toFixed(2)} today`
        });
      }

      const ownerBalance = parseFloat(accountOwner.balance.toString());
      if (ownerBalance < transferAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient funds for transfer'
        });
      }

      accountOwner.balance = (ownerBalance - transferAmount).toFixed(2);
      await accountOwner.save();

      destinationAccount.balance = (
        parseFloat(destinationAccount.balance.toString()) + transferAmount
      ).toFixed(2);
      await destinationAccount.save();
    }

    if (type === 'Deposito') {
      await Deposit.create({
        numberAccount: destinationNumberAccount,
        amount
      });

      destinationAccount.balance = (
        parseFloat(destinationAccount.balance.toString()) + parseFloat(amount)
      ).toFixed(2);
      await destinationAccount.save();
    }

    const newTransaction = new Transaction({
      accountId: type === 'Deposito' ? null : accountId,
      type,
      amount,
      details,
      destinationNumberAccount
    });

    await newTransaction.save();

    res.status(201).json({
      success: true,
      msg: 'Transaction created successfully',
      transaction: newTransaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error creating transaction',
      error: error.message
    });
  }
};


export const getTransactionsByUser = async (req, res) => {
  try {
    const userId = req.usuario._id;

    const userAccounts = await Account.find({ userId, status: true });

    const accountIds = userAccounts.map(account => account._id);

    const transactions = await Transaction.find({
      accountId: { $in: accountIds },
      status: true
    })
      .sort({ createdAt: -1 })
      .populate('accountId');

    const transactionsWithDestAccount = await Promise.all(
      transactions.map(async (tx) => {
        const destAccount = await Account.findOne({ accountNumber: tx.destinationNumberAccount });
        return {
          ...tx.toObject(),
          destinationAccount: destAccount || null
        };
      })
    );


    res.status(200).json({
      success: true,
      transactions: transactionsWithDestAccount
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error getting user transactions',
      error: error.message
    });
  }
};


export const getTransactions = async (req, res) => {
  try {
    const { accountId, limit = 5, skip = 0 } = req.query;

    const query = { status: true };
    if (accountId) {
      query.accountId = accountId;
    }

    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate([
          {
            path: 'accountId',
            populate: { path: 'userId', select: 'name surname' }
          },
          {
            path: 'destinationNumberAccount',
            populate: { path: 'userId', select: 'name surname' }
          }
        ])
    ]);

    const transactionsFormatted = transactions.map(tx => {
      const originUser = tx.accountId?.userId;
      const destUser = tx.destinationNumberAccount?.userId;

      return {
        ...tx.toObject(),
        amount: tx.amount.toString(),
        createdBy: originUser ? `${originUser.name} ${originUser.surname}` : 'Desconocido',
        receivedBy: destUser ? `${destUser.name} ${destUser.surname}` : 'Desconocido'
      };
    });

    res.status(200).json({
      success: true,
      total,
      transactions: transactionsFormatted
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: 'Error fetching transactions',
      error: error.message
    });
  }
};

// export const getTransactionsAdmin = async (req = request, res = response) => {
//   try {
//     const { limite = 10, desde = 0 } = req.query;
//     const query = { status: true };
//     const [total, transactions] = await Promise.all([
//       Transaction.countDocuments(query),
//       Transaction.find(query)
//         .skip(Number(desde))
//         .limit(Number(limite))
//     ])

//     res.status(200).json({
//       success: true,
//       total,
//       transactions
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       msg: "Error to fetch transactions",
//       error
//     })
//   }
// }


export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, status: true });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      transaction: {
        ...transaction.toObject(),
        amount: transaction.amount.toString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountId, type, amount, details, destinationNumberAccount } = req.body;

    const transaction = await Transaction.findOne({ _id: id, status: true });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or inactive'
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    if (type === 'Transferencia' && Number(amount) > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Amount cannot exceed 2000 for Transferencias'
      });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      success: true,
      message: 'Transaction updated',
      transaction: {
        ...updatedTransaction.toObject(),
        amount: updatedTransaction.amount.toString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByIdAndUpdate(id, { status: false }, { new: true });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction disabled',
      transaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating transaction',
      error
    });
  }
};