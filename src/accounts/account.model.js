import { Schema, model } from "mongoose";

const AccountSchema = Schema ({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, "user is required"],
        unique: true
    },
    accountNumber: {
        type: String,
        required: [true, "the account number is required"],
        unique: true
    },
    balance: {
        type: Schema.Types.Decimal128,
        required: [true, "balance is required"]
    },
    status: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);

export default model("Account", AccountSchema)