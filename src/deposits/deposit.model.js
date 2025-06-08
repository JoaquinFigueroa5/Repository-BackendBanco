import { Schema, model } from 'mongoose';

const DepositSchema = new Schema({
    numberAccount: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, "the account number is required"],
    },
    amount: {
        type: Schema.Types.Decimal128,
        required: [true, "the amount is required"],
        min: [0, "the amount must be greater than 0"]
    },
    depositDate: {
        type: Date,
        default: Date.now
    },
    reversed: {
        type: Boolean,
        default: false
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
)

export default model('Deposit', DepositSchema);