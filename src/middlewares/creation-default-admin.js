import argon2 from "argon2";
import User from '../users/user.model.js'

export const createAdmin = async () => {
    try {
        const existAdmin = await User.findOne({ role: "ADMIN_ROLE" });

        if (!existAdmin) {
            const hashed = await argon2.hash("ADMINB");
            const adminUser = new User({
                username: "ADMINB",
                email: "ADMINB@gmail.com",
                password: hashed,
                role: "ADMIN_ROLE"
            });

            await adminUser.save();
        }
    } catch (error) {
        console.error("Error creating admin");
    }
};
