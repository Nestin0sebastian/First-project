const express = require('express');
const wishlistModel = require('../model/wishlistschema'); // Adjust the path accordingly
const CategoryModel = require('../model/catagoryschema')
const cartmodel = require('../model/cartschema');





const addToWishlist = async (req, res) => {
    try {
        const productId = req.body.productId;
        const quantity = req.body.quantity || 1;
        const userId = req.session.dataofuser._id;

        // Find the user's wishlist
        let userWishlist = await wishlistModel.findOne({ user: userId });

        if (!userWishlist) {
            // If the user doesn't have a wishlist, create a new one
            userWishlist = new wishlistModel({
                user: userId,
                products: [],
            });
        }

        // Check if the product already exists in the wishlist
        const existingProductIndex = userWishlist.products.findIndex(
            (product) => product.product.toString() === productId.toString()
        );

        if (existingProductIndex !== -1) {
            // If the product exists, update its quantity
            userWishlist.products[existingProductIndex].quantity += quantity;
        } else {
            // If the product doesn't exist, add it to the wishlist with the specified quantity
            userWishlist.products.push({ product: productId, quantity });
        }

        // Save the updated wishlist
        await userWishlist.save();

        console.log('Product added to wishlist successfully!');
        res.status(200).send("Product added to wishlist successfully!");
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).send("Internal Server Error");
    }
};

const wishdisplay = async (req, res) => {
    try {
        const userId = req.session.dataofuser._id;

        // Find the user's cart, populate product details
        const wishlist = await wishlistModel.findOne({ user: userId }).populate('products.product'); // Make sure 'Cart' model is properly referenced


console.log(wishlist,']]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]')
        res.render('user/wishlist', { wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


const remove = async (req, res) => {
    try {
        const productId = req.body.productId;
        const userId = req.session.dataofuser._id;

        let wishlist = await wishlistModel.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        // Use filter to remove the product from the wishlist
        wishlist.products = wishlist.products.filter(product => product.product.toString() !== productId);
console.log(wishlist.products,'///////////////////////////////////')
        await wishlist.save();

        res.status(200).json({ success: true, message: 'Successfully deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addTocart = async (req, res) => {
    const productId = req.body.productId;
    const quantity = req.body.quantity || 1;
    const userId = req.session.dataofuser._id; // Assuming userId is stored in the session

    try {
        // Find the user's cart and populate the product details
        let userCart = await cartmodel.findOne({ user: userId });

        console.log(userCart, ';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;');

        if (!userCart) {
            // If the user doesn't have a cart, create a new one
            userCart = new cartmodel({
                user: userId,
                products: [],
                totalAmount: 0
            });
        }

        // Check if the product already exists in the user's cart
        const existingProduct = userCart.products.find(
            (product) => product.product.toString() === productId
        );

        console.log(userCart);

        if (existingProduct) {
            // If the product exists, update its quantity
            existingProduct.quantity += quantity;
        } else {
            // If the product doesn't exist, add it to the cart with the specified quantity
            userCart.products.push({ product: productId, quantity });
        }

        // You can update the totalAmount based on the product prices here
        // Assuming you have a function to calculate the totalAmount based on products in the cart

        // Save the updated cart
        await userCart.save();

        res.status(200).json({msg:"Product added to cart successfully!"});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};




module.exports = { addToWishlist,wishdisplay,remove ,addTocart};
