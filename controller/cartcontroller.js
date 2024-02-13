const session=require('express-session')
const express=require('express')
const addcart = require('../model/cartschema');
const multer=require('multer')
const path=require('path')
const router=express.Router()
const Product = require('../model/productschema');
const Coupon = require('../model/coupenschema');









const cartpost = async (req, res) => {
    const productId = req.params.productId;
    const quantity = req.body.quantity || 1; // If quantity is not provided, default to 1
    const userId = req.session.dataofuser._id; // Assuming userId is stored in the session

    try {
        // Find the user's cart and populate the product details
        let userCart = await addcart.findOne({ user: userId })

        if (!userCart) {
            // If the user doesn't have a cart, create a new one
            userCart = new addcart({
                user: userId,
                products: [],
                totalAmount: 0
            });
        }

        // Check if the product already exists in the user's cart
        const existingProduct = userCart.products.find(
            (product) => product.product._id.toString() === productId
        );
            console.log(userCart)
        if (existingProduct) {
            // If the product exists, update its quantity
            existingProduct.quantity += quantity;
        } else {
            // If the product doesn't exist, add it to the cart with the specified quantity
           // Assuming Product is your model
            userCart.products.push({ product: productId, quantity });
        }
        // const productDetails = await Product.findById(productId); 
        // Update totalAmount based on product prices
        let totalAmount = 0;
        for (const product of userCart.products) {
            const productDetails = await Product.findById(product.product);
            totalAmount += product.quantity * productDetails.price;
        }

        userCart.totalAmount = totalAmount;

        // Save the updated cart
        await userCart.save();


        res.status(200).send("Product added to cart successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



const cartdisplay = async (req, res) => {
    try {
        const userId = req.session.dataofuser._id;

        // Find the user's cart, populate product details
        const userCart = await addcart.findOne({ user: userId }).populate('products.product'); // Make sure 'Cart' model is properly referenced

    console.log(userCart)
    const coupons= await Coupon.find()
    const discount=req.session.discountAmount? req.session.discountAmount:0;


        res.render('user/cart', { userCart,coupons,req,discount });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};




const quantitypost = async (req, res) => {
    try {
        const productId = req.body.productId; // Access productId from the request body
        const quantity = req.body.quantity; // New quantity value to update
        const userId = req.session.dataofuser._id;
        
        let userCart = await addcart.findOne({ user: userId }).populate('products.product');
        
        const existingProduct = userCart.products.find(
            (product) => product.product._id.toString() === productId
        );
        
        if (quantity > existingProduct.product.currentQut) {
            return res.status(500).send("Quantity exceeded");
        }
        
        existingProduct.quantity = quantity;
        
        let totalAmount = 0;
        for (const product of userCart.products) {
            const productDetails = await Product.findById(product.product._id);
            totalAmount += product.quantity * productDetails.price;
        }

        userCart.totalAmount = totalAmount;

        // Save the updated cart
        await userCart.save();
        
        req.session.productId = productId;

        // Send JSON response indicating success
        return res.json({ success: true, message: 'Cart updated successfully', cart: userCart });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error'); // Handle error appropriately
    }
}



const selectProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.session.dataofuser._id;
        
        let userCart = await addcart.findOne({ user: userId });
console.log(userCart,'PPPP}}}{{{PPP')
        userCart.products.forEach((product) => {
            if (product.product.toString() === productId) {
            
                product.isSelected = !product.isSelected;
                console.log("ibbbbbbbbbbbbbbbbbbb",product)
            }
        });

        await userCart.save(); // Await the save operation

        res.status(200).json({ message: "Successfully toggled selection" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const deleteItem = async (req, res) => {
    console.log("////???"+req.params.productId);
    try {
        const productId = req.params.productId; 
        const userId = req.session.dataofuser._id;


        
        let userdet = await addcart.findOne({ user: userId });
        console.log(userdet);

        if (!userdet) {
            return res.status(404).json({ message: 'Cart not found' });
        }

    
        userdet.products = userdet.products.filter(product => product.product.toString() !== productId);

        
        await userdet.save();
        res.status(200).json({success:true,message:"succeffully deleted "})
console.log( userdet.products);
    
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};




module.exports={cartpost,cartdisplay,quantitypost,deleteItem,selectProduct}