import { response } from "express";
import Account from "./account.model.js";
import User from "../users/user.model.js";

export const getAccounts = async (req = request, res = response) => {
    try {
        const {limite = 10, desde = 0 } = req.query;
        const query = { status: true }
        const [total, accounts] = await Promise.all([
            Account.countDocuments(query),
            Account.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            accounts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener las cuentas",
            error
        })
    }
}

export const getAccountsById = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await Account.findById(id)

        if (!account) {
            return res.status(404).json({
                success: false,
                msg: "Cuenta no encontrada"
            });
        }
        res.status(200).json({
            success: true,
            account
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener el curso",
            error
        })
    }
}

export const createAccounts = async (req, res) => {
    try {
        const data = req.body;
        const user = await User.findById(data.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            })            
        }
        const account = new Account({
            ...data,
            userId: user._id 
        });

        await account.save();

        res.status(201).json({
            success: true,
            msg: "Se creo la cuenta con exito",
            account
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Se produjo un error al crear la cuenta"
        })
    }
}