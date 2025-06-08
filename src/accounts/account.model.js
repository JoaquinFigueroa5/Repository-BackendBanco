import { Schema, model } from "mongoose";

const AccountSchema = Schema ({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, "user is required"],
    },
    accountNumber: {
        type: String
    },
    balance: {
        type: Schema.Types.Decimal128,
        default: 0.00
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