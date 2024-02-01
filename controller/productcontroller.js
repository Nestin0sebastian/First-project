const session=require('express-session')
const express=require('express')
const addproduct = require('../model/productschema');
const addcatagory = require('../model/catagoryschema');
const multer=require('multer')
const path=require('path');
const categorymodel = require('../model/catagoryschema');
const router=express.Router()

// const fullproducts=(req,res)=>{
//     res.render('admin/product')
// }





const ITEMS_PER_PAGE = 10;

const productlist = async (req, res) => {
  const page = +req.query.page || 1;

  try {
    const totalProducts = await addproduct.countDocuments({});
    const products = await addproduct.find({})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("category");

    res.render('admin/product', {
      products,
      currentPage: page,
      hasPreviousPage: page > 1,
      hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
      previousPage: page - 1,
      nextPage: page + 1,
      lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};




const insert=async(req,res)=>{
  const category = await addcatagory.find({})
    res.render('admin/addproduct',{category})
}


const insertpost=async(req,res)=>{
  
    console.log(req.files);
    console.log(req.body);
    const productdatas={
       
    
     productImage: req.files.map((img)=>img.path.replace(/\\/g,'/').replace('public/','/') ),
    productName:req.body.name,
    description:req.body.description,
    category:req.body.category,
    currentQut:req.body.quantity,
    price:req.body.price,
    size:req.body.size



    }

    console.log(productdatas)
        
        const productdata = await addproduct.create(productdatas)
           


        console.log(productdata); 
        return res.status(200).redirect('/admin/fullproducts');
    

}






const listed=async (req, res) => {
    try {

      const { productId } = req.params;
      const product = await addproduct.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'User not found' });
      }

  
      // Toggle the user's block status
      console.log(product. islist );
      product.islist = !product.islist
      await product.save();
  
      res.json({ message: 'User status updated successfully', isblocked: product.islist });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error'});
}
};

const productedit=async (req,res)=>{
  try {
    console.log(req.query.id);
    const product = await addproduct.findOne({_id:req.query.id})
    const category=await categorymodel.find({})
    console.log(category);
    if(product){

      
      res.render('admin/editproduct',{y:product,category})
    }else{
      res.redirect('/admin/product')
    }

  } catch (error) {
    console.log(error)
    
  }
  
}



const editpost=async (req, res) =>{ 
    
    try {
      
      const product = await addproduct.findOne({ _id: req.query.id });
      console.log("///////",product)
      if (product) {
        console.log(req.body);
        console.log(req.file);

        product.productImage=product.productImage.concat(req.files.map((img)=>img.path.replace(/\\/g,'/').replace('public/','/') )).slice(0, 4)  ,
  
    product.productName=req.body.name ||product.productName,
      product.category=req.body.category ||product.category, 
      product.currentQut=req.body.quantity ||product.currentQut,
      product.description=req.body.description||product.description
      product.price=req.body.price||product.price,
      product.size=req.body.size ||product.size
    
    
        
        await product.save();                                        

        
        res.redirect('/admin/fullproducts'); 
      } else {
            res.redirect('/error'); 
      }
    } catch (error) {
      console.log(error);
      // Handle any errors that occur during the update process
      res.redirect('/error'); // Redirect to an error page
    }
  }

const removeImage = async(req,res)=>{
  try{
 
    const { productId, imageIndex } = req.body;
    console.log("product remove ", productId, imageIndex);
    const product = await addproduct.findOne({ _id: productId });
    product.productImage.splice(imageIndex, 1);
    product.save()
    res.status(200).json({ message: 'Image removed successfully', updatedProduct: product });
  }catch(err){
    console.log(err);
  }
}

function cropimage(){



}





module.exports={
    productlist,
    insert,
    insertpost,
    listed,
    productedit,
    editpost,
    removeImage

}