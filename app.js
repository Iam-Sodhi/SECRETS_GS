//jshint esversion:6
require('dotenv').config(); //right at top
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt=require('mongoose-encryption');
const app = express();
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


mongoose.connect("mongodb://127.0.0.1:27017/userDB");
//mongoose.connect("mongodb+srv://Gautam_Sodhi:Noobcoder888@cluster0.obpadln.mongodb.net/userDB?retryWrites=true&w=majority");

const userSchema=new mongoose.Schema({
    email: String,
    password: String,
});

//console.log(process.env.API_KEY);
userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']}); //****ADD BEORE DECLARING THE MODEL */

const User=mongoose.model('user',userSchema);

app.get('/', function(req, res)
{	res.render("home");
})
app.get('/login', function(req, res)
{	res.render("login");
})
app.get('/register', function(req, res)
{	res.render("register");
})

app.post('/register', function(req, res){
    const newUser = new User({
        email:req.body.username,
        password:req.body.password,
    });
    newUser.save().then(function(){
        res.render("secrets");
    }).catch(function(err){
        console.log(err);
    });
})
app.post('/login', function(req, res){
    const username=req.body.username;
    const password=req.body.password;
    User.findOne({email:username}).then(function(foundUser){
        if(foundUser.password===password){
        res.render("secrets");
        }
    }).catch(function(err){
        console.log(err);
    })
})

app.listen('3000',function(){
console.log('listening on port port- http://localhost:3000');
})