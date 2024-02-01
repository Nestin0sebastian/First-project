const bcrypt = require('bcrypt');
const userModel = require('../model/schema');
require('dotenv').config();
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const session=require('express-session')
const { token } = require('morgan');
const addressmodel = require('../model/addressschema');

const addproduct = require('../model/productschema');
const CategoryModel = require('../model/catagoryschema')

const login = (req, res) => {
    res.render('user/login', { message: '' });                                      
};

const signup = (req, res) => {
    res.render('user/signup', { message: '' });
};

const home = (req, res) => {
    res.render('user/home');
};

const otp = (req, res) => {

    let err=req.session.otperr;
    req.session.otperr=''

    res.render('user/otp', { message: '' ,err});
};

const signin=(req,res)=>{
    res.render('user/home')
}




const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};


function generateOtp() {
    return randomstring.generate({
        length: 6,
        charset: 'numeric',
    });
}

function sendOtp(email, otp) {
    console.log(email, otp)
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        },
    });













    console.log( process.env.EMAIL_ADDRESS,
        process.env.EMAIL_PASSWORD   
   )
 
   
  mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Your OTP for registering at LapBook',
        text: `Your OTP for verification is ${otp}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}


function sendresetlink (email,token){
 const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,

    },
})

        

    const resetpasswordLink = `http://localhost:3000/forgotpassword?token=${token}`;
      

    const  mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: 'Reset Your Password',
        text: `<p> Use the following link to reset your password: <a href="${resetpasswordLink}">${resetpasswordLink}</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ' + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}








const signuppost = async (req, res) => {
    try {
        const { firstname, lastname, email, contact, password, referrer } = req.body;

        const checkEmail = await userModel.findOne({ email: email });

        if (checkEmail && checkEmail.email === email) {
            return res.render('user/login', { message: 'This account already exists' });
        }

        const hashedPassword = await securePassword(password);

        // Check if referrer exists in the refferalId field of any user
        const referrerUser = await userModel.findOne({ refferalId: referrer });

        if (referrerUser) {
            referrerUser.wallet += 500;
            await referrerUser.save();
        }
        
        const user = userModel({
            firstname: firstname,
            lastname: lastname,
            contact: contact,
            email: email,
            password: hashedPassword,
            referrer: referrerUser ? referrerUser._id : null,
            wallet:null,
        });
        req.session.userData = user;

        const otp = generateOtp();

        const expirationTime = new Date(Date.now() + 30 * 1000); // 30 seconds in milliseconds

        req.session.otp = {
            code: otp,
            generatedAt: Date.now(), // Store the timestamp when the OTP was generated
            expirationTime: expirationTime.getTime(), // Store the expiration time as a timestamp
        };

        sendOtp(email, otp);

        res.redirect('/otp');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


// Other functions (resendOtp, loadOtpVerification, verifyOtp, loadLogin, verifyLogin)

// const verification=(req,res)=>{

// if(req.session.otp==req.body){
//     res.redirect('/')
// }
    
// }

const postotp = async (req, res) => {
    try {

        console.log(req.session.otp)
        req.session.otp;
        const enteredOtp = req.body.otp;

        if (req.session.otp.code === enteredOtp && req.session.otp.expirationTime > Date.now()) {
          
            const datas = await userModel.create({
                firstname: req.session.userData.firstname,
                lastname: req.session.userData.lastname,
                contact: req.session.userData.contact,
                email: req.session.userData.email,
                password: req.session.userData.password,
                refferalId: generateRandomId(8),
                referrer:req.session.userData.referrer,
               
            });
            function generateRandomId(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let randomId = '';
            
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    randomId += characters.charAt(randomIndex);
                }
            
                return randomId;
            }
            
            // If user creation is successful, redirect to '/login'
            console.log(datas); // Log the data if needed
            return res.status(200).redirect('/login');
        } else {
            // Invalid OTP
            req.session.otperr="invalid otp or time expired"
            return res.redirect('/otp')
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};



    
    const loginpost = async (req, res) => {
        
        try {
          const loguser = await userModel.findOne({ email: req.body.email });
         
        
          if (loguser) {
            if(loguser.isblocked){
                redirect("/login")
            }
        const passwordMatch = await bcrypt.compare(req.body.password, loguser.password);
            if (passwordMatch) {
                req.session.dataofuser=loguser
              res.redirect('/');
             }else {
            //   req.session.user = loguser.email;
              return res.redirect('/login');
            }
          } else {
            req.session.errorMessage = 'Invalid Password';
            res.redirect('/login');
          }
        } catch (error) {
          console.log(error);
          req.session.error = error;
          res.redirect('/login');
        }
      };


const forgototp=(res,req)=>{
    res.render('user/otp')

}



      const forget=(req,res)=>{
        res.render('user/forgotpassword')
      }




      const forgetemail=(req,res)=>{
        res.render('user/email')
      }











      const emailpost = async (req, res) => {
        try {
            const { email } = req.body;
            const user = await userModel.findOne({ email });
    
            if (user && user.email === email) {
                const token = generateResetPasswordToken(); // Custom function to generate a reset password token
    
                user.resetpasswordToken = token;
                user.resetTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // Token valid for 10 minutes
    
                await user.save();
    
                sendresetlink(email, token);
                res.send("Password link sent successfully");
            } else {
                res.status(404).send('Email not found');
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Internal Server Error');
        }
    };
    

    
   
       
     
    







    
    
        const otpdisplay=(req,res)=>{
            res.render('user/forgototp')
        }  
    

        const displaypost = async (req, res) => {
            try {
                const storedOtp = req.session.otp;
                const enteredOtp = req.body.otp;
        
                if (storedOtp === enteredOtp) {
                 
                
                    
                    res.redirect("/forgot?token="+num); 
                } else {
                    // Invalid OTP
                    return res.status(400).send("Invalid OTP");
                }
            } catch (error) {
                console.error(error);
                return res.status(500).send("Internal Server Error");
            }
        };



const resetpassword=async(req,res)=>{
     try {
       let token=req.query.token;
        const user=await userModel.find({resetpasswordToken:token})

        if(user){
            res.render('user/forgotpassword',{token})
        }
     } catch (error) {
        
     }
}





        const resetpasswordpost = async (req, res) => {
        
            

            if (req.body.password1 === req.body.password2) {
                try {
                    console.log(req.body);
                const  token = req.query.token;

                    const user = await userModel.findOne({resetpasswordToken:token  });
                    
                    if (user) {
                        console.log(req.body);
                        
                    
                        user.password =await bcrypt.hash(req.body.password2,10);
                        
                
                        await user.save();
                        
                
                        return res.redirect('/login');
                    } else {
        
                        return res.redirect('/error');
                    }
                } catch (error) {

                    console.error(error);
                    return res.redirect('/error');
                }
            } else {
                
                return res.render('user/forgotpassword', { message: 'Check your password' });
            }
        };
        
        const resend = async (req, res) => {
            try {
                const email = req.session.userData.email ;
               
        
                // if (!userExists) {
                //     res.status(404).send('User not found');
                //     return;
                // }
        
                const newOtp = generateOtp();
                delete req.session.otp;
                req.session.otp = {
                    code: newOtp,
                    generatedAt: Date.now(),
                    expirationTime: new Date(Date.now() + 30 * 1000).getTime(), // Set expiration time (30 seconds in this example)
                };
        
                sendOtp(email, newOtp);
        
                res.status(200).json({success:true})
            } catch (error) {
                console.log(error.message);
                res.status(500).send('Internal Server Error');
            }
        };
        
        const catagory = async (req, res) => {
            try {
                let queryCondition = { islist: true };
        
                if (req.query.search && req.query.search.trim().length > 0) {
                    const searchText = req.query.search;
                    const regex = new RegExp(searchText, 'i');
                    queryCondition.$or = [{ productName: { $regex: regex } }];
                }
        
                const queryArray = req.query.selectedCategories || [];
                if (queryArray.length > 0) {
                    queryCondition.category = { $in: queryArray };
                }
        
                console.log(queryCondition, 'Query Condition');
        
                const products = await addproduct.find(queryCondition).populate('category');
                const category = await CategoryModel.find({});
        
                if (products && products.length > 0) {
                    res.render('user/catagory', { products, category });
                } else {
                    res.render('user/noProducts');
                }
            } catch (error) {
                console.error('Error:', error);
                res.status(500).render('errorPage', { error });
            }
        };
        
        
        




  const detailedview=async(req,res)=>{
    const id=req.params.productId
    const data = await addproduct.findOne({_id:id})
      
    res.render('user/detailedview',{data})
  }



  const logout=(req,res)=>{
    req.session.destroy()
    res.redirect('/')

  }


  const changepassword=(req,res)=>{
    res.render('user/changepassword')
  }

// Replace with the actual path
  
  // Import SweetAlert2 library
  const Swal = require('sweetalert2');
  
  const changepasswordpost = async (req, res) => {
      const userId = req.session.dataofuser._id;
      const currentPassword = req.body.currentPassword;
      const newPassword = req.body.newPassword;
      const confirmPassword = req.body.confirmPassword;
  
      try {
          // Find the user by ID
          const userData = await userModel.findById(userId);
  
          // Validate current password using bcrypt.compare
          const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password);
  
          if (!isCurrentPasswordValid) {
              return res.status(400).json({ message: 'Invalid current password' });
          }
  
          // Validate new password and confirm password
          if (newPassword !== confirmPassword) {
              return res.status(400).json({ message: 'New password and confirm password do not match' });
          }
  
          // Hash the new password before saving it to the database
          const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the number of salt rounds
  
          // Update the user's password with the hashed password
          userData.password = hashedPassword;
          await userData.save();
  
          // Show SweetAlert success message
          Swal.fire({
              icon: 'success',
              title: 'Password changed successfully!',
              showConfirmButton: false,
              timer: 1500 // Close the alert after 1.5 seconds
          });
  
          res.redirect('/profileget');
      } catch (error) {
          console.error('Error:', error);
  
          // Show SweetAlert error message
          Swal.fire({
              icon: 'error',
              title: 'Internal Server Error',
              text: 'An error occurred while processing your request. Please try again later.'
          });
  
          res.status(500).json({ message: 'Internal Server Error' });
      }
  };
  

  
module.exports = {
    login,
    home,
    signuppost,
    signup,
    otp,
    postotp,
    loginpost ,
    forget,
    forgetemail,
    emailpost,
    otpdisplay,
    displaypost, 
    resetpasswordpost,
    resetpassword,
    resend,
    catagory,
    detailedview,
    logout,
    changepassword,
    changepasswordpost
 
  
    
    
    
};