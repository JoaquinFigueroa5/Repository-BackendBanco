import { Schema, model } from 'mongoose';

const DailyLimitSchema = Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Account is required']
    },
    date: {
        type: Date,
        required: [true, 'date is required'],
    },
    amountTransferredToday: {
        type: Schema.Types.Decimal128,
        required: [true, 'amount transferred today is required'],
        default: 0.00
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);

export default model('DailyLimit', DailyLimitSchema);