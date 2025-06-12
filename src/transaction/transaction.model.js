import { Schema, model } from 'mongoose';

const transactionSchema = Schema({
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, "account is required"],
    },
    type: {
        type: String,
        enum: ['Transferencia', 'Deposito', 'Reversion']
    },
    amount: {
        type: Schema.Types.Decimal128,
        required: [true, "the amount is required"]  
    },
    details: {
        type: String,
        default: 'Sin detalles',
    },
    destinationAccountId: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, "the destination account is required"]
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
})

export default model("Transaction", transactionSchema);