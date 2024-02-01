
const session=require('express-session')
const express=require('express')
const path=require('path')
const router=express.Router()
const addressmodel = require('../model/addressschema');
const userModel = require('../model/schema');
const cartmodel = require('../model/cartschema');
const ordermodel=require('../model/orderschema.js');



const dailyreport= async (req,res)=>{
    const data= await ordermodel.find().populate('products.productId')
    res.render('admin/dailyreport',{data})
}



const weeklyreport= async (req,res)=>{
    const data= await ordermodel.find().populate('products.productId')
    res.render('admin/weeklyreport',{data})
}



const yearlyreport= async (req,res)=>{
    const data= await ordermodel.find().populate('products.productId')
    res.render('admin/yearlyreport',{data})
}





module.exports={dailyreport,weeklyreport,yearlyreport}