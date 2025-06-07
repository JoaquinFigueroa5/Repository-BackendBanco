import express from "express";
import cors from 'cors';
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";
import limiter from "../src/middlewares/validate-cant-request.js";
import authRoutes from '../src/user-auth/auth.routes.js'
import userRoutes from '../src/users/user.routes.js'
import productRoutes from '../src/products/product.routes.js'
import depositRoutes from '../src/deposits/deposit.routes.js'
import { createAdmin } from "../src/middlewares/creation-default-admin.js";
import accountRoutes from "../src/accounts/account.routes.js"
import transactionRoutes from "../src/transaction/transaction.routes.js";

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(limiter)
}

const routes = (app) => {
    app.use('/BancaOnline/v1/auth', authRoutes)
    app.use('/BancaOnline/v1/user', userRoutes)
    app.use('/BancaOnline/v1/accounts', accountRoutes)
    app.use('/BancaOnline/v1/transactions', transactionRoutes)
    app.use('/BancaOnline/v1/product', productRoutes)
    app.use('/BancaOnline/v1/deposit', depositRoutes)
}

const conectarDB = async () => {
    try {
        await dbConnection();
        console.log('Successful connection to the database');
    } catch (error) {
        console.log('Failed to connect to database');
    }
}

export const initServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;
    try {
        middlewares(app);
        conectarDB();
        routes(app);
        app.listen(port);
        createAdmin()
        console.log(`server running on port ${port}`)
    } catch (error) {
        console.log(`server init failed: ${error}`);
    }
}