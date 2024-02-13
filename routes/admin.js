
var express = require('express');
var router = express.Router();
const session = require('express-session');
const admin = require('../controller/admincontroller')
const adcatagory  = require('../controller/catagorycontroller')
const addproduct = require('../controller/productcontroller')
const report = require('../controller/salesreportcontroller')
const addcoupon  = require('../controller/couponcontroller')
const {adminchecksession,adminloginback}=require('../middlewares/adminauthenticate')

const multer=require("multer")
const path=require('path')





const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
      cb(null, 'public/multerimages'); 
    },
    filename:  (req, file, cb)=> {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  

  
function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}














router.get('/adminlogin',nocache,adminloginback,admin.adminlogin)
router.post('/adminloginpost',adminloginback,admin.adminloginpost)
router.get('/userlist',nocache,adminchecksession,admin. userlist)
router.get('/adduser',adminchecksession,admin.adduser)
router.get('/addcategory',adminchecksession,admin.addcategory)
router.get('/',adminchecksession,nocache,admin.adhome)
router.get('/product',adminchecksession,addproduct.productlist)
router.post('/blockUser/:userId',adminchecksession,admin.blockUser)
router.post('/addcategory',adminchecksession,upload.single ('categoryImage'),adcatagory.catagory)
router.get('/fullcatagory',adminchecksession,adcatagory.fullcatagory)
router.post('/upload',adminchecksession,adcatagory.catagory)
router.post('/blockcatagory/:userId',adminchecksession,adcatagory.listed)
router.get('/editcatagory',adminchecksession,upload.single ('categoryImage'),adcatagory.edit)

router.post('/editcatagory',adminchecksession,upload.single ('categoryImage'),adcatagory.editpost)
router.get('/addproduct',adminchecksession,addproduct.insert)
router.get('/fullproducts',adminchecksession,addproduct.productlist)

router.post('/insertpost',upload.array('productImage',4),addproduct.insertpost)
router.post('/blockproduct/:productId',adminchecksession,addproduct.listed)
router.get('/editproduct',upload.array('productImage,4'),addproduct. productedit)
router.post('/editposted',upload.array('productImage'),addproduct.editpost)  
router.post('/removeImage',adminchecksession,addproduct.removeImage)
router.get('/logout',adminchecksession,admin.logout)
router.get('/order',adminchecksession,admin.order)
router.get('/viewdetails/:orderId',adminchecksession,admin.details)
router.post('/updatestatus',adminchecksession,admin.updatestatus)
router.get('/dailyreport',adminchecksession,report.dailyreport)
router.get('/weeklyreport',adminchecksession,report.weeklyreport)
router.get('/yearlyreport',adminchecksession,report.yearlyreport)
router.get('/addcoupon',adminchecksession,addcoupon.createcoupon)
router.post('/createdatapost',adminchecksession,addcoupon.createdatapost)
router.get('/couponslist',adminchecksession,addcoupon.couponslist)
router.post('/toggleListCoupon',adminchecksession,addcoupon.listed)
router.get('/editcoupon/:couponId',adminchecksession,addcoupon.editcoupon)
router.post('/editcouponpost/:couponId',adminchecksession,addcoupon.editcouponpost)
router.post('/applycoupon',adminchecksession,addcoupon.applycoupon)
router.post('/removecoupon',adminchecksession,addcoupon.remove)
router.get('/productoffer',adminchecksession,admin.productoffer)
router.post('/productofferpost',adminchecksession,admin.productofferpost)
router.get('/categoryofferlist',adminchecksession,admin.offerlist)
router.post('/deleteOffer',adminchecksession,admin.deleteOffer)
router.get('/productofferlist',adminchecksession,admin.productofferlist)
router.post('/activated/:itemId',adminchecksession,admin.activated)
router.post('/deactivated/:itemId',adminchecksession,admin.deactivated)
router.post('/catagoryactivate/:dataId',adminchecksession,admin.catagoryactivate)
router.post('/catagorydeactivate/:dataId',adminchecksession,admin.catagorydeactivate)
router.get('/cancelorder',adminchecksession,admin.cancelorder)
router.post('/allowcancel',adminchecksession,admin.allowcancel)
router.post('/rejectcancel',adminchecksession,admin.rejectcancel)
router.get('/weeklygraph',adminchecksession,report.weeklygraph)
router.get('/categorygraph',adminchecksession,report.categorygraph)
router.get('/paymengraph',adminchecksession,report.paymengraph)




















module.exports = router;
