var express = require('express');
var router = express.Router();
const User=require("../models/userSchema")
const passport = require('passport')
const LocalStreategy = require('passport-local');
passport.use(new LocalStreategy(User.authenticate()))
const nodemailer=require("nodemailer")
const upload = require("../helpers/multer").single("avatar");
const fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Instant Resume | Home' , isLoggedIn: req.user ? true : false, user: req.user });
});

/* GET Signup page */
router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Instant Resume | Signup' , isLoggedIn: req.user ? true : false, user: req.user });
});

/* POST SIGNUP page. */

router.post('/signup', function (req, res) {
 
  const { name,email,username,password } = req.body
  User.register({ name,email,username }, password)
    .then((user) => {
      res.redirect("/signin")
    })
    .catch((err) => {
      res.send(err)
    })
})


/* GET Signin page */
router.get('/signin', function(req, res, next) {
  res.render('signin', { title: 'Instant Resume | Signin' , isLoggedIn: req.user ? true : false, user: req.user });
});

/* POST SIGNIN page. */

router.post("/signin",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/signin",
}),
function(req,res,next){}
);

/* GET Profile page */
router.get('/profile',isLoggedIn,function(req, res, next) {
  res.render('profile', { title: 'Instant Resume | Profile' ,isLoggedIn:req.user?true:false,user: req.user });
});


router.post("/profile/:id", isLoggedIn, async function (req, res, next) {
  // const { name,email,address,mobile,DOB,language,hobbie,degree,college,year,position,description,duration,Linkdin,Github,objective,declaration,title,technolgy,projectDesc,skill } = req.body;
  // const user = { name,email,address,mobile,DOB,language,hobbie,degree,college,year,position,description,duration,Linkdin,Github,objective,declaration,title,technolgy,projectDesc,skill};
  // await User.findOneAndUpdate(req.params.id, user);
  const user=req.body
  await User.findByIdAndUpdate(req.params.id,user)
  res.redirect("/resume/:"+user.id)
  console.log(user)
});


router.post("/upload", isLoggedIn, async function (req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      console.log("ERROR>>>>>", err.message);
      res.send(err.message);
    }
    if (req.file) {
      if (req.user.avatar != "dummy.png") {
        fs.unlinkSync("./public/images/" + req.user.avatar);
      }
      req.user.avatar = req.file.filename;
      req.user
        .save()
        .then(() => {
          res.redirect("/profile");
        })
        .catch((err) => {
          res.send(err);
        });
    }
  });
});

router.get('/resume/:id',isLoggedIn,function(req,res){
  res.render('resume',{ isLoggedIn:req.user?true:false,user:req.user })
})


// /* GET forget page. */
// router.get("/forget-password", function (req, res, next) {
//   try {
//     res.render("forget", {
//       title: "Instant Resume | Forgetpassword",
//       isloggedIn: req.user ? true : false,
//       user: req.user,
//     });
//   } catch (error) {
//     console.log(err);
//   }
// });


/* GET Forget password page. */
router.get('/forget-Password', function (req, res, next) {
  res.render('forget', { title: 'Instant Resume | Forgetpassword', isLoggedIn: req.user ? true : false, user: req.user });
});



/* post send mail */
router.post("/send-mail", async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.send("User is not found");
  const mailUrl = `${req.protocol}://${req.get("host")}/forget-password/${
    user._id
  }`;

  /*--------------- Node mailer code ---------------- */

  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "dsimrodia@gmail.com",
        pass: "qtuzfqypzplhcuwr",
    },
  });

  const mailOptions = {
    from: "Temp Mail Pvt. Ltd.<master.temp@gmail.com>",
    to: req.body.email,
    subject: "Password Reset Link",
    text: "Do not share this link to anyone.",
    html: `<a href=${mailUrl}>Password Reset Link</a>`,
  };

  transport.sendMail(mailOptions, (err, info) => {
    if (err) return res.send(err);
    console.log(info);

    return res.send(
      "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1> <br> <a href='/signin'>Signin</a>"
    );
  });
});


/* Get getpassword page */
router.get("/forget-password/:id", async function (req, res, next) {
  const user = await User.findById(req.params.id);

  try {
    res.render("getpassword", {
      title: "Instant Resume | Get password ",
      isloggedIn: req.user ? true : false,
      user: req.user,
      id: user.id,
    });
  } catch (error) {
    console.log(error);
  }
});

/* post getpassword */
router.post("/forget-password/:id", async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    await user.setPassword(req.body.password);
    await user.save();
    res.redirect("/signin");
  } catch (error) {
    console.log(err);
  }
});


/* GET RESET PASSWORD */

router.get('/reset-password',isLoggedIn,function(req,res){
  res.render('resetpassword',{title:'Instant Resume | Reset Password', isLoggedIn: req.user ? true : false, user: req.user})
})


/* POST Reset Passsword */

router.post("/reset-password",function(req,res){
  const {oldpassword,newpassword}=req.body

  req.user.changePassword(oldpassword,newpassword,function(err,user){
    if(err){
      res.send(err)
    }
    res.redirect('/')
  })
})

/* GET LOGOUT */

router.get('/signout',isLoggedIn,function(req,res){
  req.logOut(()=>{
    res.redirect('/')
  })
})


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/signin");
  }
}
module.exports = router;
