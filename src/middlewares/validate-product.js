import User from "../users/user.model.js"

export const validateProduct = async (req, res, next) => {
    const authenticatedUser = req.usuario.role;
    if (authenticatedUser !== "USER_ROLE") {
        return res.status(403).json({
            success: false,
            msg: 'You do not have permission to modify products'
        });
    }

    next()

}