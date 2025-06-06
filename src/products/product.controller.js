import Product from "./product.model.js";

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

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, ...data } = req.body;

        const product = await Product.findByIdAndUpdate(id, data, { new: true });

        if (!product) {
            return res.status(404).json({
                success: false,
                msg: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Product updated successfully',
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating product',
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