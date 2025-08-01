import { response } from "express";
import { hash } from 'argon2';
import User from "./user.model.js";
import Account from "../accounts/account.model.js";

export const getUsers = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { status: true }
        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            users
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener usuarios",
            error
        })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, password, email, ...data } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }
        if (password) {
            user.password = await hash(password);
        }
        if (email) {
            user.email = email;
        }

        Object.assign(user, data);

        const updateUser = await user.save();

        res.status(200).json({
            success: true,
            msg: "User update successfully!",
            user: updateUser
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error when updating user',
            error
        });
    }
};



export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(id, { status: false }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            msg: 'User disabled',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deactivating user',
            error
        });
    }
};

export const getUserProfile = (req, res) => {
    try {
        const user = req.usuario;
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener el perfil del usuario"
        })
    }
}

export const addFavorite = async (req, res) => {
    try {
        const userId = req.usuario._id; // Usuario autenticado
        const { id } = req.params; // ID de la cuenta a agregar a favoritos

        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({
                success: false,
                msg: "Account not found"
            });
        }

        const user = await User.findById(userId);

        if (!user.favorites.includes(account._id)) {
            user.favorites.push(account._id);
            await user.save();
        }

        res.status(200).json({
            success: true,
            msg: "Cuenta añadida a favoritos",
            favorites: user.favorites
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error al añadir a favoritos",
            error: error.message
        });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const { id } = req.params; // ID de la cuenta a eliminar de favoritos
        const userId = req.usuario._id; // ID del usuario autenticado

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        if (!Array.isArray(user.favorites)) {
            user.favorites = [];
        }

        // Filtrar la cuenta que se quiere eliminar
        user.favorites = user.favorites.filter(favId => favId.toString() !== id);

        await user.save();

        res.status(200).json({
            success: true,
            msg: 'Favorite removed successfully',
            favorites: user.favorites
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error removing favorite',
            error: error.message
        });
    }
};


export const getAccountsFavorites = async (req, res) => {
    try {
        const userId = req.usuario._id;

        const user = await User.findById(userId)
            .populate({
                path: 'favorites',
                model: 'Account',
                select: 'userId accountNumber balance status',
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: 'name surname'
                }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            favorites: user.favorites,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error retrieving favorites',
            error: error.message,
        });
    }
}
