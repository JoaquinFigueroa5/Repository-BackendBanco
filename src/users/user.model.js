import { Schema, model } from "mongoose";

const UserSchema = Schema(
    {
        name: {
            type: String,
            required: function () {
                return this.role !== 'ADMIN_ROLE';
            },
            maxLength: [25, "Can't exceed 25 characters"]
        },
        surname: {
            type: String,
            required: function () {
                return this.role !== 'ADMIN_ROLE';
            },
            maxLength: [25, "Can't exceed 25 characters"]
        },
        username: {
            type: String,
            unique: true,
            required: [true, "Username is required"]
        },
        dpi: {
            type: String,
            required: function () {
                return this.role !== 'ADMIN_ROLE';
            },
            unique: true,
            maxLength: [13, "Can't exceed 13 characters"]
        },
        address: {
            type: String,
            required: function () {
                return this.role !== 'ADMIN_ROLE';
            }
        },
        work: {
            type: String,
            required: function () {
                return this.role !== 'ADMIN_ROLE';
            }
        },
        income: {
            type: Schema.Types.Decimal128,
            required: function () {
                return this.role !== 'ADMIN_ROLE';
            }
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: 8
        },
        phone: {
            type: String,
            required: function () {
                return this.role !== 'ADMIN_ROLE';
            },
            minLength: 8,
            maxLength: 8
        },
        role: {
            type: String,
            enum: ["ADMIN_ROLE", "USER_ROLE"],
            default: "USER_ROLE"
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


export default model("User", UserSchema)