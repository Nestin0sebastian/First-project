const session=require('express-session')
const userModel = require('../model/schema');
const { find } = require('../model/cartschema');
const ordermodel=require('../model/orderschema.js');
const addproduct = require('../model/productschema');
const addcatagory = require('../model/catagoryschema');
const offermodel = require('../model/product&catagory-offer');

const adminlogin=(req,res)=>{
    res.render('admin/adminlogin')
}


const adhome=(req,res)=>{
    res.render("admin/adminhome")
}
const adminloginpost = (req, res) => {
    const { email, password } = req.body;
    req.session.admin=email

    console.log(req.body)
    try {
        if (email === data.email && password === data.password) {
        
            res.redirect("/admin");
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500); // Send an internal server error status if an exception occurs
    }
};
const data = {
    email: "nestin@gmail.com",
    password: "Nestin@123"
  
};



const ITEMS_PER_PAGE = 10; // Number of items to display per page

const userlist = async (req, res) => {
  const page = +req.query.page || 1; // Get the requested page from query parameters
  try {
    const totalUsers = await userModel.countDocuments({});
    const users = await userModel.find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('admin/userlist', {
      users,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalUsers,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalUsers / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};




const  adduser=  async (req,res)=>{
    res.render('admin/adduser')
}



const addcategory=async(req,res)=>{
    res.render('admin/addcategory')
}



const product=async (req,res)=>{
    res.render('admin/product')
}




const blockUser=async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await userModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

  
      // Toggle the user's block status
      console.log(user.isblocked );
      user.isblocked = !user.isblocked 
      await user.save();
  
      res.json({ message: 'User status updated successfully', isblocked: user.isblocked });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error'});
}
};



const logout=(req,res)=>{
    
    req.session.destroy();
    res.redirect('/admin/adminlogin')
  
  }
  
  const order=async (req,res)=>{
    
    const data= await ordermodel.find({}).populate('products.productId').populate('userId')
console.log(data,'llllllllllllllllllllllllllllllllllllll')
    res.render('admin/order',{data})
  }




  const details = async (req, res) => {
    console.log("//////////");
    const orderId = req.params.orderId;
  
    try {
      const order = await ordermodel.findOne({ _id: orderId }).populate('products.productId');
      
      res.render('admin/viewdetails', { order });
    } catch (err) {
      // Handle any potential errors here
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }
  



  const updatestatus = async (req, res) => {
    const { orderId, status } = req.body;
    console.log(orderId, status);
  
    try {
      const order = await ordermodel.findOne({ _id: orderId });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      order.orderStatus = status;
      await order.save(); // Await the save operation
  
      return res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

const productoffer=async (req,res)=>{

  const products= await addproduct.find()

  const catagory=await addcatagory.find()
  res.render('admin/product&catagory-offer',{products,catagory})



}
const productofferpost = (req, res) => {
  const {
    offerName,
    selectedType,
    category,
    product,
    discount_percentage,
    max_discount_amount,
    start_date,
    expire_date
  } = req.body;

  // Set a default value for Type if it's an empty string
  const offerType = selectedType || "defaultType";

  // Now you can use these variables to create and save a new document in your database
  // Example using a Mongoose model
  const offer = new offermodel({
    offerName,
    Type: offerType,
    item: offerType === "category" ? category : (offerType === "product" ? product : null),
    discount_percentage,
    max_discount_amount,
    start_date,
    expire_date
  });

  offer.save()
    .then(savedOffer => {
      // Handle success, send a response, redirect, etc.
      res.redirect('/admin/');
    })
    .catch(error => {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.offerName) {
        // Duplicate key error
        res.status(400).json({ message: 'Offer name must be unique' });
      } else {
        // Other errors
        console.error('Error saving offer:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
};




const offerlist = async (req, res) => {
  try {
    // Using a regular expression to find offers where the "Type" field contains "category"
    const data = await offermodel.find({ Type: /category/ });

    res.render('admin/offerlist', { data });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const productofferlist=async (req,res)=>{
  try {
    // Using a regular expression to find offers where the "Type" field contains "category"
    const data = await offermodel.find({ Type: /product/ });

    res.render('admin/productofferlist', { data });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}


 
const deleteOffer = async (req, res) => {
  const offerId = req.body.id; // Assuming the offerId is included in the URL params

  try {
    const result = await offermodel.deleteOne({ _id: offerId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




const activated = async (req, res) => {
  try {
    const itemName = req.params.itemId;

    // Assuming offermodel and addproduct are your Mongoose models
    const item = await offermodel.findById(itemName);
const currentdate=new Date();

    if (item.start_date<=currentdate||item.expire_date<=currentdate) {
      return res.status(404).json({ error: 'Date is not valid' });
    }

    // Update item status
    item.status = 'Active';
    await item.save();

    // Use the correct property for type, assuming it's 'item'
    const type = item.item;

    // Use addproduct model here, adjust the logic as needed
    const findproduct = await addproduct.findOne({ productName: type });

    if (!findproduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const previousPrice = findproduct.price;

    // Round the discountPrice to the nearest whole number
    const discountPrice = Math.round(findproduct.price * item.discount_percentage / 100);

    const discountReal = findproduct.price - discountPrice;

    // Update product prices
    findproduct.price = discountReal;
    findproduct.previous_price = previousPrice;
    findproduct.isoffer=true
    await findproduct.save();

    console.log(findproduct, 'Updated product with discount');

    res.status(200).json({ message: 'Item found and product updated', item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deactivated = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Assuming offermodel and addproduct are your Mongoose models
    const item = await offermodel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update item status
    item.status = 'inActive';
    await item.save();

    // Use the correct property for type, assuming it's 'item'
    const type = item.item;

    // Use addproduct model here, adjust the logic as needed
    const findproduct = await addproduct.findOne({ productName: type });

    if (!findproduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Revert product prices
    findproduct.price = findproduct.previous_price;
    findproduct.previous_price = null;
    findproduct.isoffer=false
    await findproduct.save();

    console.log(findproduct, 'Updated product with discount');

    res.status(200).json({ message: 'Item found and product updated', item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const catagoryactivate = async (req, res) => {
  try {
    const offerId = req.params.dataId;
    console.log(offerId);

    // Find and update the offer status
    const offer = await offermodel.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    const currentdate=Date.now()
    if (offer.start_date<=currentdate||offer.expire_date<=currentdate) {
      return res.status(404).json({ error: 'Date is not valid' });
    }
    offer.status = 'Active';
    await offer.save();

    // Find the associated product
    const productName = offer.item;

    const product = await addcatagory.findOne({ name: productName });
    const products = await addproduct.find({ category: product._id });
    

    if (!product || !products || products.length === 0) {
      return res.status(404).json({ message: 'Product or category not found for the offer' });
    }

    // Assuming you want to apply the same discount to all products
    const previousPrices = products.map(prod => prod.price);
    const discount = Math.floor((previousPrices.reduce((a, b) => a + b, 0) * offer.discount_percentage) / 100);

    for (const prod of products) {
      prod.price = prod.price - discount;
      prod.previous_price = prod.price + discount;
      prod.isoffer = true;
      await prod.save();
    }

    console.log(product, '/>>/>>/>>>/>>>/>>>>>>>>>>>>?>>>>>>>>>>?>>>');
    res.status(200).json({ message: 'Activated', offerId, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



const catagorydeactivate = async (req, res) => {
  try {
    const offerId = req.params.dataId;
    console.log(offerId);

    // Find and update the offer status
    const offer = await offermodel.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.status = 'inActive';
    await offer.save();

    // Find the associated product
    const productName = offer.item;

    const product = await addcatagory.findOne({ name: productName });
    const products = await addproduct.find({ category: product._id });
    

    if (!product || !products || products.length === 0) {
      return res.status(404).json({ message: 'Product or category not found for the offer' });
    }

    // Assuming you want to apply the same discount to all products

    for (const prod of products) {
      prod.price = prod.previous_price;
      prod.previous_price =null;
      prod.isoffer = false;
      await prod.save();
    }

    res.status(200).json({ message: 'Activated', offerId, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const cancelorder=async (req,res)=>{
  const data = await ordermodel.find().populate('products.productId');
res.render('admin/ordercancellation',{data})
}

const allowcancel = async (req, res) => {
  try {
      const orderId = req.body.orderId;
      const order = await ordermodel.findById(orderId);

      if (!order) {
          return res.status(404).json({ error: 'Order not found' });
      }

      // Update order status to 'cancelled'
      order.orderStatus = 'cancelled';
      await order.save();

      console.log(order, 'Order status updated to "cancelled"');

      // Respond with a success message or any other necessary data
      res.status(200).json({ message: 'Order status updated to "cancelled"' });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};


const rejectcancel = async (req, res) => {
  try {
      const orderId = req.body.orderId;
      const order = await ordermodel.findById(orderId);

      if (!order) {
          return res.status(404).json({ error: 'Order not found' });
      }

      // Update order status to 'rejected'
      order.orderStatus = 'rejected';
      await order.save();

      console.log(order, 'Order status updated to "rejected"');

      // Respond with a success message or any other necessary data
      res.status(200).json({ message: 'Order status updated to "rejected"' });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {  
    adminlogin,
    adminloginpost,
    userlist,
    adduser,
    addcategory,
    adhome,
    product,
    blockUser,
    logout,
    order,
    details,
    updatestatus,
    productoffer,
    productofferpost,
    offerlist,
    deleteOffer,
    productofferlist,
    activated,
    deactivated,
    catagoryactivate,
    catagorydeactivate,
    cancelorder,
    allowcancel,
    rejectcancel
}