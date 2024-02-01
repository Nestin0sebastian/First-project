const session=require('express-session')
const express=require('express')

const addressmodel=require('../model/addressschema');
const ordermodel=require('../model/orderschema.js');
const product = require('../model/productschema');
const niceInvoice = require("nice-invoice");
const addcart=require('../model/cartschema');
const path=require('path');
const router=express.Router()
const PDFDocument = require('pdfkit');
require('dotenv').config();
const Razorpay = require('razorpay');
const userModel = require('../model/schema');

const razorpay = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.Secret_key
});




const checkout = async (req, res) => {
    try {const discount=req.session.discountAmount || 0;
         const userId = req.session.dataofuser._id;

        // Find the user's cart, populate product details
         const userCart = await addcart.findOne({ user: userId,'products.isSelected':true }).populate('products.product'); // Make sure 'Cart' model is properly referenced
        const address = await addressmodel.findOne({ user: req.session.dataofuser._id });
        console.log(userCart);
        console.log(address); // Log address to check its content
        res.render('user/checkout', { address ,userCart,discount});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving addresses');
    }
};




const addout = async (req, res) => {

    const { fullname, contact, pincode, state, address, locality, city } = req.body;

    const newAddress = {
        fullname,
        contact,
        pincode,
        state,
        address,
        locality,
        city
    };

    try {
        // Find if the user's address already exists
        console.log(req.session.dataofuser._id);
        const existingAddress = await addressmodel.findOne({ user: req.session.dataofuser._id });

        if (existingAddress) {
            // Check if the address already exists in the addresses array
            const addressExists = existingAddress.addresses.some(addr => (
                addr.fullname == fullname &&
                addr.contact == contact &&
                addr.pincode == pincode &&
                addr.state == state &&
                addr.address == address &&
                addr.locality == locality &&
                addr.city == city
            ));

            if (addressExists) {
                return res.status(400).json({ message: 'Address already exists' });
            }

            // Add the new address to the addresses array
            existingAddress.addresses.push(newAddress);

            // Save the updated addresses array
            await existingAddress.save();
        } else {
            // If no user address found, create a new entry
            const newEntry = new addressmodel({ user: req.session.dataofuser._id, addresses: [newAddress] });
            await newEntry.save();
        }

        // Redirect to the "/checkout" route after adding the address
        res.redirect("/checkout");
    } catch (error) {
        res.status(500).json({ message: 'Error adding address', error: error.message });
    }
}











const checkoutpost = async (req, res) => {
    try {

        console.log( process.env.key_id,
           process.env.Secret_key,'llllllllllllllllllflflflflfl')

        const userId = req.session.dataofuser._id;
        const userAddresses = await addressmodel.findOne({ user: userId });
        const paymentmethod = req.body.paymentmethod;
        const selectedAddressId = req.body.addressId;

        if (!userAddresses) {
            return res.status(404).json({ message: 'No addresses found for the user' });
        }

        const selectedAddress = userAddresses.addresses.find(address => address._id.toString() === selectedAddressId.toString());

        if (!selectedAddress) {
            return res.status(404).json({ message: 'Address not found for the provided ID' });
        }

        if (paymentmethod === 'cod') {
            try {
                const selectedProducts = await addcart.findOne({ user: userId }).populate('products.product');
                const cartProducts = selectedProducts.products.filter(item => item.isSelected === true);
        
                // Validate products and update quantities
                for (const cartProduct of cartProducts) {
                    const quantitydecrease = await product.findById(cartProduct.product._id);
        
                    if (!quantitydecrease || quantitydecrease.currentQut < cartProduct.quantity) {
                        return res.status(400).json({ message: 'Product not found or insufficient quantity' });
                    }
        
                    // Decrease product quantity
                    quantitydecrease.currentQut -= cartProduct.quantity;
                    await quantitydecrease.save();
                }
        
                const orders = new ordermodel({
                    userId: userId,
                    paymentMethod: paymentmethod,
                    address: {
                        name: selectedAddress.fullname,
                        mobile: selectedAddress.contact,
                        homeAddess: selectedAddress.address,
                        pincode: selectedAddress.pincode,
                        locality: selectedAddress.locality,
                        city: selectedAddress.city,
                        state: selectedAddress.state,
                        altphone: selectedAddress.altphone,
                    },
                    products: [],
                    totalAmount: 0,
                });
                let discountAmount = req.session.discountAmount || 0; // Default to 0 if not defined

                // Create order
                for (const cartProduct of cartProducts) {
                    const productData = {
                        productId: cartProduct.product._id,
                        quantity: cartProduct.quantity,
                        salesPrice: cartProduct.product.price,
                        total: cartProduct.quantity * cartProduct.product.price,
                        cancelstatus: false,
                        reason: '', // Populate this based on certain conditions
                    };
        
                    orders.products.push(productData);
                    orders.totalAmount += productData.total-discountAmount+50;
                }
        
                await orders.save();
        
                console.log(orders, 'Order placed successfully');
        
                // Use $pull to remove products with isSelected: true
                const updatedCart = await addcart.findOneAndUpdate(
                    { user: userId },
                    { $pull: { products: { isSelected: true } } },
                    { new: true } // Return the updated document
                );
        
                console.log('deleted products from cart:', updatedCart);
        
                if (!updatedCart) {
                    return res.status(404).json({ message: 'User cart not found' });
                }
        
                // Optionally, you can send the updated cart as a response
                return res.status(200).json({ message: 'Order placed successfully', order: orders });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        }
    
        else if (paymentmethod === 'razorpay') {
            try {
                const selectedProducts = await addcart.findOne({ user: userId }).populate('products.product');
                const cartProducts = selectedProducts.products.filter(item => item.isSelected === true);
        
                // Validate products and update quantities
                for (const cartProduct of cartProducts) {
                    const quantitydecrease = await product.findById(cartProduct.product._id);
        
                    if (!quantitydecrease || quantitydecrease.currentQut < cartProduct.quantity) {
                        return res.status(400).json({ message: 'Product not found or insufficient quantity' });
                    }
        
                    // Decrease product quantity
                    quantitydecrease.currentQut -= cartProduct.quantity;
                    await quantitydecrease.save();
                }
                let discountAmount = req.session.discountAmount || 0; // Default to 0 if not defined

                const orders = new ordermodel({
                    userId: userId,
                    paymentMethod: paymentmethod,
                    orderId: req.body.razorpayOrderId,
                    address: {
                        name: selectedAddress.fullname,
                        mobile: selectedAddress.contact,
                        homeAddess: selectedAddress.address,
                        pincode: selectedAddress.pincode,
                        locality: selectedAddress.locality,
                        city: selectedAddress.city,
                        state: selectedAddress.state,
                        altphone: selectedAddress.altphone,
                    },
                    products: [],
                    totalAmount: 0,
                });
                const userid = req.session.dataofuser._id;
 
                const usercart =await addcart.findOne({ user: userid,'products.isSelected':true }).populate('products.product'); // Make sure 'Cart' model is properly referenced
                const selectedProduct = usercart.products.filter(product => product.isSelected); 
                 const totalSelectedAmount = selectedProduct.reduce((total, product) => total + (product.product.price * product.quantity), 0); 
                 const total=totalSelectedAmount + 50 

                // Create order
                for (const cartProduct of cartProducts) {
                    const productData = {
                        productId: cartProduct.product._id,
                        quantity: cartProduct.quantity,
                        salesPrice: cartProduct.product.price,
                        total: cartProduct.quantity * cartProduct.product.price,
                        reason: '', // Populate this based on certain conditions
                    };
        
                    orders.products.push(productData);
                    orders.totalAmount += productData.total-discountAmount+50;
                }
        

                const options = {
                    amount: Math.round((total - discountAmount) * 100),
                    currency: 'INR',
                    receipt: 'order_' + Date.now()
                };
        
                const order = await new Promise((resolve, reject) => {
                    razorpay.orders.create(options, (err, order) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        } else {
                            resolve(order);
                        }
                    });
                });
        
                orders.orderId = order.id;
                await orders.save();
        
                // Use $pull to remove products with isSelected: true
                const updatedCart = await addcart.findOneAndUpdate(
                    { user: userId },
                    { $pull: { products: { isSelected: true } } },
                    { new: true } // Return the updated document
                );
        
                console.log('deleted products from cart:', updatedCart);
        
                if (!updatedCart) {
                    return res.status(404).json({ message: 'User cart not found' });
                }
        
                // Optionally, you can send the updated cart as a response
                res.status(200).json({ success: true, orderId: order.id, order, Key_id: process.env.key_id, message: 'Products with isSelected:true deleted successfully', updatedCart });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
         else {
            return res.status(400).json({ message: 'Invalid payment method' });
        }
        

       

        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


const success= async (req,res)=>{
    try {
        console.log('.....................................................')
        const data=req.params.orderId
        console.log(data,'///////////////')
        const orderfind= await ordermodel.findById(data)
        console.log(data,orderfind)
    
    res.render('user/success',{orderfind})
    } catch (error) {
        console.log(error)
    }
   
  
}

const detailedorder = async (req, res) => {
    try {
        const data = req.params.orderId;
        const productIdTomatch = req.query.productid;

        const orders = await ordermodel.findOne({ orderId: data }).populate('products.productId');

        orders.products = orders.products.filter((product) => {
            return product.productId._id.toString() === productIdTomatch; // Use '===' for comparison
        });
        

       console.log(orders) 

        if (!orders) {
            return res.status(404).send('Order not found');
        }

        res.render('user/detailedorder', { order:orders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}











const cancelorder = async (req, res) => {
    const { orderId, productId, reason } = req.body;

    try {
        const orderproduct = await ordermodel.findById(orderId);

        // Update orderStatus and reason
        orderproduct.orderStatus = 'requested';
        orderproduct.reason = reason;
        await orderproduct.save();

        // Check if the order is already cancelled
        if (orderproduct.orderStatus === 'cancelled') {
            const matchedProduct = orderproduct.products.find(prdct => prdct.productId.toString() === productId);

            if (!matchedProduct) {
                return res.status(404).json({ message: 'Product not found in order!' });
            }

            const increasequantity = await product.findById(productId);

            if (!increasequantity) {
                return res.status(404).json({ message: 'Product not found!' });
            }

            // Increase the product quantity
            increasequantity.currentQut += matchedProduct.quantity;
            await increasequantity.save();

            // Update the orderStatus to 'cancelled'
            orderproduct.orderStatus = 'cancelled';
            await orderproduct.save();

            console.log("Order cancelled");
            return res.status(200).json({ message: 'Order cancelled!' });
        }

        console.log("Order status updated to 'requested'");
        return res.status(200).json({ message: 'Order status updated to requested!' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

const invoice = async (req, res) => {
    const data = req.params.orderId;


    const finddata = await ordermodel
        .findById(data)
        .populate('products.productId')
        .populate('userId');

    // Assuming finddata exists and contains necessary information

    // Constructing invoiceDetail object
    const invoiceDetail = {
        shipping: {
            name: finddata.userId.firstname + ' ' + finddata.userId.lastname,
          
            city: finddata.address.city,
            state: finddata.address.state,
            mobile: finddata.address.mobile,
            pin_code: finddata.address.pincode,
        },
        items: finddata.products.map((product) => ({
            item: product.productId.productName,
            description: product.productId.description,
            quantity: product.quantity,
            price: product.productId.price,
        })),
        subtotal: finddata.totalAmount,
        total: finddata.totalAmount+50,
        order_number: finddata.orderId, // Set the correct order number property
        header: {
            company_name: "SoleHaven",
            company_address: "SoleHaven Footwears, Marine Lines, Delhi,+1 786-512-3456",
            
        },
        footer: {
            text: "Thank you for your Purchase!",
        },
        currency_symbol: "₹", // Indian Rupee symbol
        date: {
            billing_date: "January 1, 2023",
            due_date: "January 31, 2023",
        },
    };

    // Generating the PDF
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();

    // Pipe the PDF to the response
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    // Generate PDF content based on the invoiceDetail object
    doc.pipe(res);

    // Add content to the PDF
    doc.font('Helvetica');

    // Header
    doc.fontSize(24).text('Invoice', { align: 'center', underline: true }).moveDown(1);

    // Customer Details Section
    doc.fontSize(12).text('Customer Details:', { underline: true }).moveDown(0.5);
    doc.fontSize(10).text(`Name: ${invoiceDetail.shipping.name}`);
   
    doc.fontSize(10).text(`City: ${invoiceDetail.shipping.city}, State: ${invoiceDetail.shipping.state}`);
    doc.fontSize(10).text(`Mobile: ${invoiceDetail.shipping.mobile}, Pincode: ${invoiceDetail.shipping.pin_code}`);
    doc.moveDown(1);

    // Items Section
    doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.5);
    invoiceDetail.items.forEach(item => {
        doc.fontSize(10).text(`Item: ${item.item}`);
        doc.fontSize(10).text(`Description: ${item.description}`);
        doc.fontSize(10).text(`Quantity: ${item.quantity}, Price: ${item.price}/-`);
        doc.moveDown(0.5);
    });

    // Summary Section
    doc.fontSize(12).text('Summary:', { underline: true }).moveDown(0.5);
    doc.fontSize(10).text(`Subtotal: ${invoiceDetail.subtotal}/-`, { align: 'left' });
    doc.fontSize(10).text('shipping fee:50/-')
    doc.fontSize(10).text(`Total: ${invoiceDetail.total}/-`, { align: 'left' });

    doc.moveDown(1);

    // Company Information Section
    doc.fontSize(12).text('Company Information:', { underline: true }).moveDown(0.5);
    doc.fontSize(10).text(invoiceDetail.header.company_name, { align: 'center' });
    doc.fontSize(8).text(invoiceDetail.header.company_address, { align: 'center' }).moveDown(1);

    // Footer
    doc.fontSize(10).text(invoiceDetail.footer.text, { align: 'center' });

    // End the document
    doc.end();
};



const crypto = require('crypto');

const verify = async (req, res) => {
    try {
        
        
            // const faris=req.body.data.razorpayOrderId

    //  console.log("faris",faris)

        // const {
        //     orderCreationId,
        //     razorpayPaymentId,
        //     razorpayOrderId,
        //     razorpaySignature,
        // } = req.body.data;

        const orderCreationId = req.body.data.orderCreationId;
        const razorpayPaymentId = req.body.data.razorpayPaymentId;
        const razorpayOrderId = req.body.data.razorpayOrderId;
        const razorpaySignature = req.body.data.razorpaySignature;

        console.log()
        const order = await ordermodel.findOne({orderId:razorpayOrderId });
        

        console.log(order, 'llllllllllllllllllllllllllllllllllllllllllpppp');
        const shasum = crypto.createHmac("sha256", process.env.Secret_key);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`); // Add missing backticks

        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            return res.status(400).json({ msg: "Transaction not legit!" });
        }

        // PAYMENT IS LEGIT & VERIFIED
        // You might want to update the order in your database or perform other actions

        res.status(200).json({
            msg: "success",
            orderId:order._id,
            paymentId: razorpayPaymentId,
            order: order, // Include the order data in the response
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: "Server Error" });
    }
};








const wallet = async (req, res) => {
    try {
        const userId = req.session.dataofuser;
        const selectedAddressId = req.body.selectedAddressId; // Assuming you pass selectedAddress through the request body
        const userAddresses = await addressmodel.findOne({ user: userId });
        // Retrieve selectedAddress from the database (assuming userAddresses is an object containing addresses)
        const selectedAddress = userAddresses.addresses.find(address => address._id.toString() === selectedAddressId.toString());
        console.log(selectedAddressId); // Corrected this line

        // Check if selectedAddress is found
        if (!selectedAddress) {
            return res.status(404).json({ message: 'Selected address not found' });
        }

        // Retrieve cart products
        const cartProducts = await getCartProducts(userId);

        // Retrieve the user's wallet balance
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const walletBalance = user.wallet || 0;
        let discountAmount = req.session.discountAmount || 0; // Default to 0 if not defined

        // Calculate the total order amount
        const totalOrderAmount = cartProducts.reduce((total, cartProduct) => {
            return total + cartProduct.quantity * cartProduct.product.price-discountAmount+50;
        }, 0);

        // Check if the wallet balance is sufficient
        if (walletBalance < totalOrderAmount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Deduct the order total from the wallet
        user.wallet -= totalOrderAmount;

        // Save the updated wallet balance
        await user.save();

        const orders = new ordermodel({
            userId: userId,
            paymentMethod: 'wallet',
            address: {
                name: selectedAddress.fullname,
                mobile: selectedAddress.contact,
                homeAddess: selectedAddress.address,
                pincode: selectedAddress.pincode,
                locality: selectedAddress.locality,
                city: selectedAddress.city,
                state: selectedAddress.state,
                altphone: selectedAddress.altphone,
            },
            products: [],
            totalAmount: totalOrderAmount,
        });

        // Create order
        for (const cartProduct of cartProducts) {
            const productData = {
                productId: cartProduct.product._id,
                quantity: cartProduct.quantity,
                salesPrice: cartProduct.product.price,
                total: cartProduct.quantity * cartProduct.product.price,
                cancelstatus: false,
                reason: '', // Populate this based on certain conditions
            };

            orders.products.push(productData);
        }

        await orders.save();

        // Respond with success
// Respond with success
res.status(200).json({ message: 'Order placed successfully', order: orders._id });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};



const getCartProducts = async (userId) => {
    const selectedProducts = await addcart.findOne({ user: userId }).populate('products.product');
    return selectedProducts.products.filter(item => item.isSelected === true);
};


// Example of a function to retrieve cart products


const returnorder = async (req, res) => {
    const orderId = req.body.finderId;
    const productId = req.body.productId;

    try {
        // Find the order by orderId
        const orderproduct = await ordermodel.findById(orderId);

        if (!orderproduct) {
            return res.status(404).json({ message: 'Order not found!' });
        }

        // Find the product in the order by productId
        const matchedProduct = orderproduct.products.find(prdct => prdct.productId.toString() === productId);

        if (!matchedProduct) {
            return res.status(404).json({ message: 'Product not found in order!' });
        }

        // Find the product in the product model by productId
        const increasequantity = await product.findById(productId);

        if (!increasequantity) {
            return res.status(404).json({ message: 'Product not found!' });
        }

        // Increase the product quantity
        increasequantity.currentQut += matchedProduct.quantity;
        await increasequantity.save();

        // Update the orderStatus to 'returned'
        orderproduct.orderStatus = 'returned';

        // Save the order product
        await orderproduct.save();

        // Additional logic: Update user's wallet
        const user = await userModel.findById(req.session.dataofuser._id);
        if (user) {
            // Assuming 'wallet' is a property in the userModel
            user.wallet += orderproduct.totalAmount;
            await user.save();
        }

        console.log("Order returned");
        return res.status(200).json({ message: 'Order returned!' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = { checkout,addout,checkoutpost,success,detailedorder,cancelorder,invoice,verify,wallet,returnorder};








