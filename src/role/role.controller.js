import Role from "./role.model.js"

export const createRoles = async () => {
    try {
        const existRoles = await Role.find({ role: { $in: ["ADMIN_ROLE", "USER_ROLE"] } });

        if (existRoles.length < 2) {
            if (!existRoles.some(role => role.role === "ADMIN_ROLE")) {
                await new Role({ role: "ADMIN_ROLE" }).save();
            }
            if (!existRoles.some(role => role.role === "USER_ROLE")) {
                await new Role({ role: "USER_ROLE" }).save();
            }
        }
    } catch (error) {
        console.error("Error creating roles:", error);
    }
};
