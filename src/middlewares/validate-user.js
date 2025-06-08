import User from '../users/user.model.js'

export const validateOwner = async(req, res, next) => {
    const { id } = req.params;
    const authenticatedUser = req.usuario.id;
    const user = req.usuario.role;
    console.log("Authenticated user:", user);

    if (user != "ADMIN_ROLE" && authenticatedUser !== id) {
        return res.status(403).json({
            success: false,
            msg: "You can only desactivate your own account"
        });
    }
    next()
}

export const validateEmail = async(req, res, next) => {
    const { email } = req.body;
    const authenticatedUser = req.usuario.email;
    if (email != authenticatedUser) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                msg: 'Email is already in use by another user'
            });
        }
    }
    next()
}

export const validateRole = async(req, res, next) => {
    const { id } = req.params;
    const authenticatedUser = req.usuario.id;
    const role = req.usuario.role;
    if(role != "ADMIN_ROLE" && authenticatedUser != id){
        return res.status(400).json({
            success: false,
            msg: "You don't have an authorized for modified"
        })
    }
    next()
}

export const validateAdmin = async (req, res, next) => {
    const authenticatedUser = req.usuario;
    if (authenticatedUser.role !== "ADMIN_ROLE") {
        return res.status(400).json({
            success: false,
            msg: "You are not authorized to perform this action"
        })
    }
    next()
}


export const validateIncome = (req, res, next) => {
    if (req.body.income < 100) {
        return res.status(400).json({
            success: false,
            msg: 'Ingresos insuficientes para crear una cuenta'
        })
    }
    
    next()
}

export const validateSensitiveFields = (req, res, next) => {
    const { id } = req.params; // ID del usuario que se intenta modificar
    const authenticatedUser = req.usuario.id; // ID del usuario logueado
    const { password, dpi } = req.body;

    // Si se intenta cambiar password o dpi
    const wantsToChangeSensitive = password || dpi;

    if (wantsToChangeSensitive && id !== authenticatedUser) {
        return res.status(403).json({
            success: false,
            msg: "Solo el propietario de la cuenta puede modificar su contraseña o DPI"
        });
    }

    next();
};