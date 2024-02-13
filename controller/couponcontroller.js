const Coupon = require('../model/coupenschema');
const addcart=require('../model/cartschema');
const cartmodel = require('../model/cartschema');

const createcoupon = (req, res) => {
    res.render('admin/addcoupons');
};



const createdatapost = async (req, res) => {
    try {
        // Extract data from the form submission
        const {
            couponcode,
            discount_percentage,
            max_discount_amount,
            min_amount,
            max_amount,
            expire_date,
            description,
            // Add other form fields as needed
        } = req.body;

        // Create a new coupon instance
        const coupon = new Coupon({
            couponcode,
            discount_percentage,
            max_discount_amount,
            max_amount,
            min_amount,
            expire_date,
            description,
            // Add other form fields as needed
        });

        // Save the coupon to the database
        await coupon.save();

        res.redirect('/admin/couponslist')
    } catch (error) {
        console.error('Error creating coupon:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const couponslist = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.render('admin/couponslist', { coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};  

const  listed=async (req,res)=>{
    const couponId= req.body.id
    console.log(couponId)
    try {
        // Find the coupon by ID
        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Toggle the 'islisted' field
        coupon.islisted = !coupon.islisted;

        // Save the updated coupon
        await coupon.save();

        res.json({ message: 'Coupon status toggled successfully' });
    } catch (error) {
        console.error('Error toggling coupon status:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const editcoupon = async (req, res) => {
    try {
        // Extract the coupon ID from the request parameters
        const couponId = req.params.couponId;
        
        // Find the coupon by ID in the database
        const coupon = await Coupon.findById(couponId);
    
        if (!coupon) {
            // If the coupon is not found, you can handle it accordingly
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Render the 'admin/editcoupon' view with the coupon data
        res.render('admin/editcoupon', { coupon });
    } catch (error) {
        console.error('Error fetching coupon:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const editcouponpost = async (req, res) => {
    try {
        // Extract the coupon ID from the request parameters
        const couponId = req.params.couponId;
        
        // Find the coupon by ID in the database
        const coupon = await Coupon.findById(couponId);
    
        if (!coupon) {
            // If the coupon is not found, you can handle it accordingly
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Update coupon details based on form submission
        coupon.couponcode = req.body.couponcode || coupon.couponcode;
        coupon.description = req.body.description || coupon.description;
        coupon.discount_percentage = req.body.discount_percentage || coupon.discount_percentage;
        coupon.max_discount_amount = req.body.max_discount_amount || coupon.max_discount_amount;
        coupon.min_amount = req.body.min_amount || coupon.min_amount;
        coupon.max_amount = req.body.max_amount || coupon.max_amount;
        coupon.expire_date = req.body.expire_date || coupon.expire_date;

        // Save the updated coupon details
        await coupon.save();

        // Redirect to a success page or the coupon list page
        res.redirect('/admin/couponslist');
    } catch (error) {
        console.error('Error updating coupon:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const applycoupon = async (req, res) => {
    try {
        const couponId = req.body.couponId;
        const userId = req.session.dataofuser;
        req.session.couponId=couponId
        // Fetch the cart data
        const selectedProducts = await addcart.findOne({ user: userId }).populate('products.product');

        // Filter products based on isSelected:true
        const cart = selectedProducts.products.filter(product => product.isSelected === true);

        // Calculate total amount considering quantity
        const totalAmount = cart.reduce((acc, product) => {
            return acc + product.quantity * product.product.price ; // Assuming each product has a 'price' property
        }, 0);

        console.log(totalAmount, 'Total Amount');

        // Check if the user has already applied a coupon
        if (selectedProducts.appliedCoupon) {
            return res.status(200).json({ message: 'You have already applied a coupon' });
        }

        // Find the coupon by ID
        const couponData = await Coupon.findById(couponId);

        // Check if the coupon is not found
        if (!couponData) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Destructure couponData properties
        const { discount_percentage, max_discount_amount, min_amount, max_amount, expire_date } = couponData;

        // Check if the coupon has already been used
        if (couponData.isUsed) {
            return res.status(200).json({ message: 'Coupon has already been used' });
        }

        // Check if the coupon has expired
        const currentDate = new Date();
        if (expire_date && currentDate > new Date(expire_date)) {
            couponData.isExpired = true;
            couponData.status = 'expired';
            await couponData.save();
            return res.status(200).json({ message: 'Coupon has expired' });
        }

        // Check if the totalAmount is within the valid range for the coupon
        if (totalAmount >= min_amount && totalAmount <= max_amount) {
            req.session.total=totalAmount
            const discountAmount = ((totalAmount) * discount_percentage) / 100;
            const discountedTotal = Math.round(Math.max(totalAmount - discountAmount, totalAmount - max_discount_amount));
            req.session.discountAmount=discountAmount

            // Update user and coupon data
            selectedProducts.totalAmount = discountedTotal+50;
            selectedProducts.appliedCoupon = true;
            couponData.isUsed = true;
            req.session.totalAmount = discountedTotal;
             // Assuming you want to update the session with the discounted total
             console.log(selectedProducts.totalAmount,"???????????????????????")
            await selectedProducts.save();
            await couponData.save();

            return res.status(200).json({ message: 'Coupon applied successfully', discountedTotal });
        } else {
            // Coupon is not applicable
            return res.status(200).json({ message: 'Coupon is not applicable to the current total price' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const remove = async (req, res) => {
    const couponId = req.body.couponId;
    const userId = req.session.dataofuser;
    req.session.discountAmount=0
    try {
        // Find the coupon by ID and update the isUsed field to false
        const updatedCoupon = await Coupon.findOneAndUpdate(
            { _id: couponId },
            { $set: { isUsed: false } },
            { new: true } // Return the updated document
        );

        if (!updatedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Find the user's cart and update the appliedCoupon field to false
        const updatedCart = await addcart.findOneAndUpdate(
            { user: userId },
            { $set: { appliedCoupon: false, totalAmount: req.session.total +50 } },
            { new: true } // Return the updated document
        ).populate('products.product');
        req.session.couponId=null   
        req.session.discountAmount=0
        
        if (!updatedCart) {
            return res.status(404).json({ message: 'User cart not found' });
        }

        // Optionally, you can send the updated coupon and cart as a response
        res.json({ updatedCoupon, updatedCart });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deletecoupon = async (req, res) => {
    try {
        // Retrieve couponId from the session
        const couponId = req.session.couponId;

        // Check if couponId is present and valid
        if (!couponId) {
            return res.status(400).json({ message: 'Invalid couponId in session' });
        }

        // Find and delete the coupon
        const deletedCoupon = await Coupon.findById(couponId);
        if (!deletedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Update the isUsed property and save
        deletedCoupon.isuserused = true;

        await deletedCoupon.save();
        // Clear the couponId from the session
        req.session.couponId = null;

        // Respond with success message
        res.status(200).json({ message: 'Coupon deleted successfully' });

        // Find the user's cart and update the appliedCoupon field
        const cart = await cartmodel.findOne({ user: req.session.dataofuser });
        if (cart) {
            cart.appliedCoupon = false;
            await cart.save();
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const deletecart = async (req, res) => {
    const userId = req.session.dataofuser;

    try {
        // Use $pull to remove products with isSelected: true
        const updatedCart = await addcart.findOneAndUpdate(
            { user: userId },
            { $pull: { products: { isSelected: true } } },
            { new: true } // Return the updated document
        );
console.log('deleeteeeeee',updatedCart)
        if (!updatedCart) {
            return res.status(404).json({ message: 'User cart not found' });
        }

        // Optionally, you can send the updated cart as a response
        res.json({ message: 'Products with isSelected:true deleted successfully', updatedCart });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = { createcoupon, createdatapost,couponslist,listed,editcoupon,editcouponpost,applycoupon,remove ,deletecoupon,deletecart};
