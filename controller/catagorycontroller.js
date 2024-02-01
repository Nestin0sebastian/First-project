const session=require('express-session')
const express=require('express')
const addcatagory = require('../model/catagoryschema');
const addproduct = require('../model/productschema');

const multer=require('multer')
const path=require('path');
const { product } = require('./admincontroller');
const router=express.Router()


const catagory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Convert the incoming category name to lowercase for case-insensitive comparison
    const categoryNameLowerCase = name.toLowerCase();

    // Find existing category case-insensitively
    const existingCategory = await addcatagory.findOne({ name: { $regex: new RegExp(`^${categoryNameLowerCase}$`, 'i') } });

    if (existingCategory) {
      // Display a simple alert if the category already exists
      return res.send(
        '<script>alert("This category already exists"); window.location.href = "/admin/addcategory";</script>'
      );
    } else {
      const newData = {
        name,
        description,
        image: req.file.path.replace(/\\/g, '/').replace('public/', '/')
      };

      const categoryData = await addcatagory.create(newData);
      console.log(categoryData);
      return res.status(200).redirect('/admin/addcategory');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};


const ITEMS_PER_PAGE = 10;

const fullcatagory = async (req, res) => {
    const page = +req.query.page || 1; // Get the requested page from query parameters

    try {
        const totalCategories = await addcatagory.countDocuments({});
        const categories = await addcatagory.find({})
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        res.render('admin/category', {
            category: categories,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalCategories,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalCategories / ITEMS_PER_PAGE),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};






const listed = async (req, res) => {
  try {
      console.log("//////////////////////////////////////////", req.params)
      const { userId } = req.params;
      const category = await addcatagory.findById(userId);

      if (!category) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Toggle the user's block status
      console.log(category.islist);
      category.islist = !category.islist;
      await category.save();

      // Update islist property for each product in the category
      const products = await addproduct.find({ category: userId });

      for (const product of products) {
          product.islist = !product.islist;
          await product.save();
      }

      res.json({ message: 'User status updated successfully', isblocked: category.islist });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
};



const edit=async (req,res)=>{
  try {
    console.log(req.query.id);
    const item = await addcatagory.findOne({_id:req.query.id})
    console.log(item)
    if(item){

      
      res.render('admin/editcatagory' ,{item})
    }else{
      res.redirect('/admin/fullcatagory')
    }

  } catch (error) {
    console.log(error)
    
  }
  
}



const editpost=async (req, res) =>{ 

  try {
    
    const product = await addcatagory.findOne({ _id: req.query.id });

    if (product) {
      console.log(req.body);
      console.log(req.file);
       
      product.name = req.body.name || product.name; 
      product.description = req.body.description || product.description
      product.image = req.file?.path.replace(/\\/g,'/').replace('public/','/') || product.image


      
      await product.save();                                        

      
      res.redirect('/admin/fullcatagory'); 
    } else {
           res.redirect('/error'); 
    }
  } catch (error) {
    console.log(error);
    // Handle any errors that occur during the update process
    res.redirect('/error'); // Redirect to an error page
  }
}




module.exports= {catagory,fullcatagory,listed,edit,editpost}