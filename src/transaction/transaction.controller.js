import Transaction from './transaction.model.js';
import Account from '../accounts/account.model.js';
import Deposit from '../deposits/deposit.model.js';
import { request, response } from 'express';
import mongoose from 'mongoose';

export const createTransaction = async (req, res) => {
  try {
    const { accountId, type, amount, details, destinationNumberAccount } = req.body;

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    if (type === 'Transferencia' && Number(amount) >= 2000) {
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

    const accountIds = userAccounts.map(acc => acc._id);
    const accountNumbers = userAccounts.map(acc => acc.accountNumber);

    const sentTransactions = await Transaction.find({
      accountId: { $in: accountIds },
      status: true
    })
      .sort({ createdAt: -1 })
      .populate('accountId');

    const receivedTransactions = await Transaction.find({
      destinationNumberAccount: { $in: accountNumbers },
      status: true
    })
      .sort({ createdAt: -1 })
      .populate('accountId');

    const sentWithDestInfo = await Promise.all(
      sentTransactions.map(async (tx) => {
        const destAccount = await Account.findOne({ accountNumber: tx.destinationNumberAccount });
        return {
          ...tx.toObject(),
          type: 'sent',
          destinationAccount: destAccount || null
        };
      })
    );

    const receivedWithSenderInfo = await Promise.all(
      receivedTransactions.map(async (tx) => {
        const originAccount = await Account.findById(tx.accountId);
        return {
          ...tx.toObject(),
          type: 'received',
          originAccount: originAccount || null
        };
      })
    );

    const allTransactions = [...sentWithDestInfo, ...receivedWithSenderInfo]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      transactions: allTransactions
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
export const getTransactionByIdUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5, skip = 0 } = req.query;
    const { role } = req.usuario;

    if (role !== 'ADMIN_ROLE') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can view transactions of other users.'
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format'
      });
    }

    const userIdObject = new mongoose.Types.ObjectId(userId);

    const userAccounts = await Account.find({ userId: userIdObject, status: true });

    if (!userAccounts.length) {
      return res.status(404).json({
        success: false,
        message: 'No accounts found for this user'
      });
    }

    const accountIds = userAccounts.map(acc => acc._id);
    const accountNumbers = userAccounts.map(acc => acc.accountNumber);

    // Traer todas las transacciones (sin límite ni skip)
    const sentTransactions = await Transaction.find({
      accountId: { $in: accountIds },
      status: true
    })
      .populate('accountId');

    const receivedTransactions = await Transaction.find({
      destinationNumberAccount: { $in: accountNumbers },
      status: true
    })
      .populate('accountId');

    const sentWithDestInfo = await Promise.all(
      sentTransactions.map(async (tx) => {
        const destAccount = await Account.findOne({ accountNumber: tx.destinationNumberAccount });
        return {
          ...tx.toObject(),
          type: 'sent',
          destinationAccount: destAccount || null
        };
      })
    );

    const receivedWithSenderInfo = receivedTransactions.map((tx) => ({
      ...tx.toObject(),
      type: 'received',
      originAccount: tx.accountId || null
    }));

    // Combinar y ordenar todas las transacciones por fecha (más recientes primero)
    const allTransactionsSorted = [...sentWithDestInfo, ...receivedWithSenderInfo]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Aplicar skip y limit sobre el arreglo ya ordenado
    const paginatedTransactions = allTransactionsSorted.slice(Number(skip), Number(skip) + Number(limit));

    res.status(200).json({
      success: true,
      total: allTransactionsSorted.length, 
      transactions: paginatedTransactions
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