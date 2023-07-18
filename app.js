//jshint esversion:6
require('dotenv').config(); //right at top
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const session=require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
//const findOrCreate = require('mongoose-findorcreate');

//*****Place it here above mongoose.connect & below app.use */
app.use(session({
    secret: 'Our little secret',
    resave: false,
    saveUninitialized: false,
  }))
app.use(passport.initialize());
app.use(passport.session());
//mongoose.connect("mongodb://127.0.0.1:27017/userDB");
mongoose.connect("mongodb+srv://Gautam_Sodhi:Noobcoder888@cluster0.obpadln.mongodb.net/userDB?retryWrites=true&w=majority");


const userSchema=new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String,
});
userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(findOrCreate);
//console.log(process.env.API_KEY);
//userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']}); //****ADD BEORE DECLARING THE MODEL */

const User=mongoose.model('user',userSchema);

passport.use(User.createStrategy());
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
    done(null, user);
  });
passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
  },
  function verify(accessToken, refreshToken, profile, cb){
    
    User.findOne({ googleId: profile.id }).then((foundUser) => {
        if (foundUser) {
          return foundUser;
        } else {
          const newUser = new User({
            googleId: profile.id
          });
          return newUser.save();
        }
      }).then((user) => {
        return cb(null, user);
      }).catch((err) => {
        return cb(err);
      });
  }
  ));

app.get('/', function(req, res)
{	res.render("home");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));
app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/secrets");
  });

app.get('/login', function(req, res)
{	res.render("login");
});
app.get('/register', function(req, res)
{	res.render("register");
});
app.get("/secrets",function(req, res){
 User.find({"secret":{$ne:null}})//pickout the secret of those users where secret field is not null
 .then(function(foundUsers){
    res.render("secrets",{usersWithSecrets:foundUsers});
 })
 .catch(function(err){
    console.log(err);
 });  
})
app.get('/submit',function(req, res){
    if(req.isAuthenticated()){  //means user is logged in
        res.render("submit");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/logout", function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})
app.post('/register', function(req, res){
    User.register({username:req.body.username}, req.body.password,function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.post('/login', function(req, res){
    const user= new User({
        username:req.body.username,
        password:req.body.password,
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});
app.post('/submit',function(req, res){
    const submittedSecret=req.body.secret;
    console.log(req.user._id);
    User.findById(req.user._id).then(function(foundUser){
        foundUser.secret = submittedSecret;
        foundUser.save();
        res.redirect("/secrets");
    }).catch(function(err){
        console.log(err);
    })
})
app.listen('3000',function(){
console.log('listening on port port- http://localhost:3000');
})


//const encrypt=require('mongoose-encryption');
//const md5=require('md5');
//const bcrypt=require('bcrypt');
//const saltRounds=10;
// app.post('/register', function(req, res){
//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        
//         const newUser = new User({
//             email:req.body.username,
//             //password:md5(req.body.password),
//             password:hash,
//         });
//         newUser.save().then(function(){
//             res.render("secrets");
//         }).catch(function(err){
//             console.log(err);
//         });
//     });

// })
// app.post('/login', function(req, res){
//     const username=req.body.username;
//     //const password=md5(req.body.password);
//     const password=req.body.password;

//     User.findOne({email:username}).then(function(foundUser){
//         // if(foundUser.password===password){
//         // res.render("secrets");
//         // }
//         bcrypt.compare(password,foundUser.password, function(err, result) {
//         if(result===true){
//             res.render("secrets");
//             }
           
//         });
//     }).catch(function(err){
//         console.log(err);
//     })
// })
