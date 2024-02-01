
var express = require('express');
var router = express.Router();
const session = require('express-session');
const user = require('../controller/usercontroller')
const profile = require('../controller/profilecontroller')
const cart = require('../controller/cartcontroller')
const {isblocked}=require('../middlewares/checkIsblocked')
const {checksession,loginback}=require('../middlewares/isAuthenticate')
const checkout = require('../controller/checkoutcontroller')
const addressmodel = require('../model/addressschema');
const wishlist = require('../controller/wishlistcontroller')
const addcoupon  = require('../controller/couponcontroller')



router.get('/login',loginback,user.login)


router.get('/',checksession,isblocked,user.home)


router.get('/signup',user.signup)


router.post('/signup',user.signuppost)


router.get('/otp',user.otp)


router.post('/otp',user.postotp)


router.post('/loginpost',user.loginpost)
// router.post('/verification',user.verification)


router.get('/forgetemail',user.forgetemail)

router.post('/emailpost',user.emailpost)
router.get('/forgot',user.forget)
router.get('/otpdisplay',user.otpdisplay)
router.post('/reset',user.displaypost)
router.get('/forgotpassword',user.resetpassword)
router.post('/resetpasswordpost',user.resetpasswordpost)
router.post('/resendotp',user.resend)
router.get('/shop',checksession,isblocked,user.catagory)
router.get('/detailedview/:productId',checksession,isblocked,user.detailedview)
router.get('/profileget',checksession,isblocked,profile.profileget)
// router.get('/editaccount',profile.edit)
router.post('/accountpost/:id',checksession,isblocked,profile.accountpost)
router.get('/addaddress',checksession,isblocked,profile.addaddress)
router.post('/addresspost',checksession,isblocked,profile.addresspost)




router.post('/cartpost/:productId',checksession,isblocked, cart.cartpost);
router.get('/cartdisplay',checksession,isblocked,cart.cartdisplay)
router.post('/quantitypost',checksession,isblocked,cart.quantitypost)
router.post('/selectProduct/:productId',checksession,isblocked,cart.selectProduct)

router.get('/logout',user.logout)
router.delete('/deleteItem/:productId',checksession,isblocked,cart.deleteItem)



router.get('/checkout',checksession,isblocked,checkout.checkout)
router.post('/addaddress',checksession,isblocked,checkout.addout)
router.post('/checkoutpost',checksession,isblocked,checkout.checkoutpost)
router.get('/success/:orderId',checksession,isblocked,checkout.success)
router.get('/detailedorder/:orderId',checksession,isblocked,checkout.detailedorder)
router.get('/editaddress/:editId',profile.editaddress)
router.post('/editaddresspost/:editId',profile.addrespost)
router.post('/cancelorder',checkout.cancelorder)
router.delete('/deleteaddress/:addressId',profile.deleteaddress)
router.get('/invoice/:orderId',checkout.invoice)
router.post('/razo_verify',checkout.verify)
router.post('/addToWishlist',checksession,isblocked,wishlist.addToWishlist)
router.get('/wishdisplay',checksession,isblocked,wishlist.wishdisplay)
router.post('/remove',checksession,isblocked,wishlist.remove)
router.post('/addTocart',checksession,isblocked,wishlist.addTocart)
router.get('/changepassword',checksession,isblocked,user.changepassword)
router.post('/changepasswordpost',checksession,isblocked,user.changepasswordpost)
router.get('/addresserror',checksession,isblocked,profile.addresserror)
router.post('/deletecoupon',checksession,isblocked,addcoupon.deletecoupon)
router.post('/deletecart',checksession,isblocked,addcoupon.deletecart)
router.post('/wallet',checksession,isblocked,checkout.wallet)
router.post('/returnorder',checksession,isblocked,checkout.returnorder)











module.exports = router;