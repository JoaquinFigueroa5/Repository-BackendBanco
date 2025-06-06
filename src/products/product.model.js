import { Schema, Types, model } from "mongoose";
import mongoose from "mongoose";

const ProductSchema = Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
       type: mongoose.Types.Decimal128,
       required: true, 
    },
    asset: {
        type: Boolean,
        default: true
    },
    image:{
        type: String,
        required: false
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

export default model ("Product", ProductSchema)