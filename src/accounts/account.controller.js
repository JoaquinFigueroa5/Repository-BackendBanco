import { response } from "express";
import { generateUniqueAccountNumber } from "../helpers/generateAccountNumber.js";
import Account from "./account.model.js";
import User from "../users/user.model.js";

export const getAccounts = async (req = request, res = response) => {
  try {
    const { limite = 10, desde = 0 } = req.query;
    const query = { status: true };
    const [total, accounts] = await Promise.all([
      Account.countDocuments(query),
      Account.find(query).skip(Number(desde)).limit(Number(limite)),
    ]);

    res.status(200).json({
      success: true,
      total,
      accounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al obtener las cuentas",
      error,
    });
  }
};

export const getAccountsById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await Account.findById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        msg: "Cuenta no encontrada",
      });
    }
    res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Esta cuenta no existe",
      error,
    });
  }
};

export const createAccounts = async (req, res) => {
    try {
        const data = req.body;
        const user = await User.findById(data.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado",
            });
        }

        if (user.role !== 'USER_ROLE') {
            return res.status(403).json({
                success: false,
                msg: "Solo los usuarios pueden tener una cuenta",
            });
        }

        const existingAccount = await Account.findOne({ userId: data.userId });
        if (existingAccount) {
            return res.status(400).json({
                success: false,
                msg: "Este usuario ya tiene una cuenta",
            });
        }

        const accountNumber = await generateUniqueAccountNumber();

        const account = new Account({
            ...data,
            userId: user._id,
            accountNumber,
        });

        await account.save();

        res.status(201).json({
            success: true,
            msg: "Se creó la cuenta con éxito",
            account,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Se produjo un error al crear la cuenta",
        });
    }
};
export const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, userId, accountNumber, ...data } = req.body;
        const searchAccount = await Account.findById(id);

        if (!searchAccount) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta no encontrada"
            })
        }

        const account = await Account.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            success: true,
            msg: "Se edito la cuenta con exito",
            account
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Ocurrio un error al editar la cuenta",
            error
        });
    }
}


export const getUserAccount = async (req = request, res = response) => {
  try {
    const userId = req.usuario._id;

    const account = await Account.findOne({ userId, status: true });

    if (!account) {
      return res.status(404).json({
        success: false,
        msg: "No se encontró una cuenta activa para este usuario.",
      });
    }

    res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al obtener la cuenta del usuario.",
      error,
    });
  }
};
