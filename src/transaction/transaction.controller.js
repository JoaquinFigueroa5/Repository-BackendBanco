import Transaction from './transaction.model.js';
import Account from '../accounts/account.model.js';

export const createTransaction = async (req, res) => {
  try {
    const { accountId, type, amount, details, destinationAccountId } = req.body;

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

    const newTransaction = new Transaction({
      accountId,
      type,
      amount,
      details,
      destinationAccountId
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

export const getTransactions = async (req, res) => {
  try {
    const { accountId, limit = 10, skip = 0 } = req.query;

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
              path: 'destinationAccountId',
              populate: { path: 'userId', select: 'name surname' }
            }
        ])
    ]);

    const transactionsFormatted = transactions.map(tx => ({
        ...tx.toObject(),
        amount: tx.amount.toString()
    }));

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
    const { accountId, type, amount, details, destinationAccountId } = req.body;

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