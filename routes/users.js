
var express = require('express');
var router = express.Router();
const user = require('../controller/usercontroller')
const profile = require('../controller/profilecontroller')
const cart = require('../controller/cartcontroller')
const {isblocked}=require('../middlewares/checkIsblocked')
const {checksession,loginback}=require('../middlewares/isAuthenticate')
const checkout = require('../controller/checkoutcontroller')
const wishlist = require('../controller/wishlistcontroller')
const addcoupon  = require('../controller/couponcontroller')


function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}




router.get('/login',nocache,loginback,user.login)


router.get('/',nocache,checksession,isblocked,user.home)


router.get('/signup',nocache,user.signup)


router.post('/signup',nocache,user.signuppost)


router.get('/otp',nocache,user.otp)


router.post('/otp',user.postotp)


router.post('/loginpost',user.loginpost)
// router.post('/verification',user.verification)


router.get('/forgetemail',nocache,user.forgetemail)

router.post('/emailpost',user.emailpost)
router.get('/forgot',nocache,user.forget)
router.get('/otpdisplay',nocache,user.otpdisplay)
router.post('/reset',user.displaypost)
router.get('/forgotpassword',nocache,user.resetpassword)
router.post('/resetpasswordpost',user.resetpasswordpost)
router.post('/resendotp',nocache,user.resend)
router.get('/shop',checksession,nocache,isblocked,user.catagory)
router.get('/detailedview/:productId',nocache,checksession,isblocked,user.detailedview)
router.get('/profileget',nocache,checksession,isblocked,profile.profileget)
// router.get('/editaccount',profile.edit)
router.post('/accountpost/:id',nocache,checksession,isblocked,profile.accountpost)
router.get('/addaddress',nocache,checksession,isblocked,profile.addaddress)
router.post('/addresspost',nocache,checksession,isblocked,profile.addresspost)




router.post('/cartpost/:productId',checksession,isblocked, cart.cartpost);
router.get('/cartdisplay',checksession,isblocked,nocache,cart.cartdisplay)
router.post('/quantitypost',checksession,isblocked,cart.quantitypost)
router.post('/selectProduct/:productId',checksession,isblocked,cart.selectProduct)

router.get('/logout',nocache,user.logout)
router.delete('/deleteItem/:productId',checksession,isblocked,cart.deleteItem)



router.get('/checkout',checksession,isblocked,nocache,checkout.checkout)
router.post('/addaddress',checksession,isblocked,checkout.addout)
router.post('/checkoutpost',checksession,isblocked,checkout.checkoutpost)
router.get('/success/:orderId',nocache,checksession,isblocked,checkout.success)
router.get('/detailedorder/:orderId',nocache,checksession,isblocked,checkout.detailedorder)
router.get('/editaddress/:editId',nocache,profile.editaddress)
router.post('/editaddresspost/:editId',profile.addrespost)
router.post('/cancelorder',checkout.cancelorder)
router.delete('/deleteaddress/:addressId',profile.deleteaddress)
router.get('/invoice/:orderId',nocache,checkout.invoice)
router.post('/razo_verify',checkout.verify)
router.post('/addToWishlist',checksession,isblocked,wishlist.addToWishlist)
router.get('/wishdisplay',nocache,checksession,isblocked,wishlist.wishdisplay)
router.post('/remove',checksession,isblocked,wishlist.remove)
router.post('/addTocart',checksession,isblocked,wishlist.addTocart)
router.get('/changepassword',nocache,checksession,isblocked,user.changepassword)
router.post('/changepasswordpost',checksession,isblocked,user.changepasswordpost)
router.get('/addresserror',checksession,nocache,isblocked,profile.addresserror)
router.post('/deletecoupon',checksession,isblocked,addcoupon.deletecoupon)
router.post('/deletecart',checksession,isblocked,addcoupon.deletecart)
router.post('/wallet',checksession,isblocked,checkout.wallet)
router.post('/returnorder',checksession,isblocked,checkout.returnorder)












module.exports = router;