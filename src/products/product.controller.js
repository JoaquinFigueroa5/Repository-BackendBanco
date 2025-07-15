import Product from "./product.model.js";
import User from "../users/user.model.js";
import Account from "../accounts/account.model.js";
import Transaction from "../transaction/transaction.model.js";

export const saveProduct = async (req, res) => {
    try {
        const data = req.body;

        const product = new Product({
            ...data,
        });

        await product.save();


        res.status(200).json({
            success: true,
            msg: 'Product added successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error saving product',
            error: error.message
        });
    }
};

export const getProduct = async (req, res) => {
    try {
        const products = await Product.find({ status: true });

        res.status(200).json({
            success: true,
            total: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error getting products",
            error: error.message || error
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            success: true,
            total: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error getting products",
            error: error.message || error
        });
    }
};

export const updateProduct = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const product = await Product.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            succes: true,
            msg: 'Producto actualizada exitosamente',
            product
        })

    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: "Error al actualizar el producto",
            error: error.message
        })
    }
} 

export const reactivateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, { status: true }, { new: true });
        
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: "Product not found"
            });
        }
        
        res.status(200).json({
            success: true,
            msg: 'Product reactivated',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error reactivating product",
            error: error.message || error
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(id, { status: false }, { new: true });
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: "Product not found"
            });
        }
        res.status(200).json({
            success: true,
            msg: 'Product disabled',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deactivating Product',
            error
        });
    }
};

export const buyProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.usuario._id; // Obtenido del token (agregado por el middleware)

    // Validación básica de cantidad
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        msg: 'La cantidad debe ser un número entero mayor a 0',
      });
    }

    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'Usuario no encontrado' });
    }

    // Buscar cuenta activa del usuario
    const account = await Account.findOne({ userId, status: true });
    if (!account) {
      return res.status(404).json({ success: false, msg: 'Cuenta del usuario no encontrada o inactiva' });
    }

    // Buscar producto
    const product = await Product.findById(productId);
    if (!product || !product.status) {
      return res.status(404).json({ success: false, msg: 'Producto no disponible o no encontrado' });
    }

    const unitPrice = parseFloat(product.price.toString());
    const totalPrice = parseFloat((unitPrice * qty).toFixed(2));
    const userBalance = parseFloat(account.balance.toString());

    if (userBalance < totalPrice) {
      return res.status(400).json({ success: false, msg: 'Fondos insuficientes para la compra' });
    }

    // Buscar cuenta de la tienda
    const tiendaAccount = await Account.findOne({ accountNumber: '0000000001' });
    if (!tiendaAccount) {
      return res.status(500).json({ success: false, msg: 'Cuenta de tienda no encontrada' });
    }

    // Actualizar saldos
    account.balance = (userBalance - totalPrice).toFixed(2);
    tiendaAccount.balance = (
      parseFloat(tiendaAccount.balance.toString()) + totalPrice
    ).toFixed(2);

    await Promise.all([account.save(), tiendaAccount.save()]);

    // Crear detalle automático
    const details = `Compra de ${qty} unidad(es) de ${product.name}`;

    // Crear transacción
    const transaction = await Transaction.create({
      accountId: account._id,
      type: 'Transferencia',
      amount: totalPrice,
      details,
      destinationNumberAccount: tiendaAccount.accountNumber,
    });

    // Asignar producto al usuario (repite la ID según cantidad)
    for (let i = 0; i < qty; i++) {
      user.products.push(product._id);
    }
    await user.save();

    res.status(200).json({
      success: true,
      msg: `Compra exitosa de ${qty} ${product.name}`,
      product: product.name,
      quantity: qty,
      total: totalPrice.toFixed(2),
      newBalance: account.balance,
      transactionId: transaction._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: 'Error al procesar la compra',
      error: error.message,
    });
  }
};


