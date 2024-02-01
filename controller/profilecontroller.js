
const session=require('express-session')
const express=require('express')
const path=require('path')
const router=express.Router()
const addressmodel = require('../model/addressschema');
const userModel = require('../model/schema');
const cartmodel = require('../model/cartschema');
const ordermodel=require('../model/orderschema.js');
const profileget = async (req, res) => {
  try {
    let discountAmount = req.session.discountAmount || 0
    const userdata=await userModel.findById(req.session.dataofuser)
console.log(userdata,'LLLLLLLLLLLLLLL')
const data=await userModel.findById(req.session.dataofuser._id)
    // const data = req.session.dataofuser;
    const address = await addressmodel.findOne({ user: req.session.dataofuser._id });
    console.log(req.session.dataofuser._id);

    const orders = await ordermodel.find({ userId: req.session.dataofuser._id }).populate('products.productId');
    console.log(']]]]]]]]]]',orders + '    ///////////////////////  ???');
    
    res.render('user/profile', { data, address, orders,userdata ,discountAmount});
    console.log(orders,'ordersssssssssssssssssssss')
  } catch (error) {
    // Handle errors appropriately
    console.error("Error in profileget:", error);
    res.status(500).send('Internal Server Error');
  }
};




const accountpost = async (req, res) => {
    // console.log("/////////////////////////")
    try {
      const profile = await userModel.findById({_id:req.params.id});
      if (profile) {
        profile.firstname = req.body.firstname || profile.firstname;
        profile.lastname = req.body.lastname || profile.lastname;
        profile.email = req.body.email || profile.email;  
        profile.contact = req.body.contact || profile.contact;
  
        await profile.save(); // Assuming 'userModel' is a mongoose model for profiles
     
  
        res.redirect('/profileget');
      } else {
        res.redirect('/error');
      }
    } catch (error) {
      console.log(error);
      res.redirect('/error');
    }
  };
  

  const addaddress= async (req,res)=>{
    const address=await addressmodel.find({})
    res.render('user/addaddress',{address})
  }

  const addresspost = async (req, res) => {
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
        const existingAddress = await addressmodel.findOne({ user: req.session.dataofuser._id });

        if (existingAddress) {
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
                // Redirect to "/addresserror" if the address already exists
                return res.redirect("/addresserror");
            }

            existingAddress.addresses.push(newAddress);
            await existingAddress.save();
        } else {
            // If no user address found, create a new entry
            const newEntry = new addressmodel({ user: req.session.dataofuser._id, addresses: [newAddress] });
            await newEntry.save();
        }

        // Redirect to '/profileget' if the address is added successfully
        res.redirect('/profileget');
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Error adding address', error: error.message });
    }
};


  
const editaddress = async (req, res) => {
  try {
      const addressId = req.params.editId;
      const userId = req.session.dataofuser._id;
      const userAddress = await addressmodel.findOne({ user: userId });
      // Find the address that matches the addressId
      const matchingAddress = userAddress.addresses.find(address => address._id.toString() === addressId);
      if (matchingAddress) {
         res.render('user/editaddress',{matchingAddress})
      } else {
          // If not found, return a 404 error
          res.status(404).json({ error: 'Address not found' });
      }
  } catch (error) {
      // Handle any errors appropriately
      res.status(500).json({ error: 'Internal Server Error' });
  }
};



const addrespost = async (req, res) => {
  
  try {
    
      const addressId = req.params.editId;
      const userId = req.session.dataofuser._id;
      const userAddress = await addressmodel.findOne({ user: userId });
      // Find the address that matches the addressId
      const address = userAddress.addresses.find(address => address._id.toString() === addressId);

       console.log(req.body)  
      
    if (address) {
      address.fullname = req.body.fullname || address.fullname;
      address.contact = req.body.phone || address.phone;
      address.pincode = req.body.pincode || address.pincode;  
      address.state = req.body.state || address.state;
      address.address = req.body.housename || address.housename;
      address.locality = req.body.locality || address.locality;
      address.city = req.body.city || address.city;

      await userAddress.save(); // Assuming 'userModel' is a mongoose model for profiles
   

      res.redirect('/profileget');
    } else {
      res.redirect('/error');
    }
  } catch (error) {
    console.log(error);
    res.redirect('/error');
  }
};

const deleteaddress = async (req, res) => {
  try {
console.log('[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]')
    const addressId = req.params.addressId;
    const userdata = req.session.dataofuser._id;
console.log(addressId,';;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;')
    // Find the user's address
    const userAddress = await addressmodel.findOne({ user: userdata });

    if (!userAddress) {
      return res.status(404).json({ error: 'User not found or unauthorized' });
    }

    // Find the index of the address within the addresses array
    const addressIndex = userAddress.addresses.findIndex(address => address._id.toString() === addressId);

    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Remove the address from the addresses array
    userAddress.addresses.splice(addressIndex, 1);

    // Save the updated user address without the deleted address
    await userAddress.save();

    // Handle successful deletion
    return res.status(200).json({ message: 'Address deleted successfully' });


    // ... further logic or response handling for successful deletion

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addresserror=(req,res)=>{
  res.render('user/addresserror')
}






module.exports={profileget,accountpost,addaddress,addresspost,editaddress,addrespost,deleteaddress,addresserror}