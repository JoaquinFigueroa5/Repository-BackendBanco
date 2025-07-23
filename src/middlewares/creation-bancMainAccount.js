import Account from "../accounts/account.model.js";

export const createBankmain= async () => {
    try {
        const existAccount = await Account.findOne({ accountNumber: "0000000001" });

        if (!existAccount) {
            const mainAccount = new Account({
                userId: '687f46f1f04f0c8322d8f664',
                accountNumber: "0000000001", 
                balance: 10000000.00,
                status: true
            });

            await mainAccount.save();
        }
    } catch (error) {
        console.error("Error creating main account:", error);
    }
};
