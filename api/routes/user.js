const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/users.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');


router.post('/signup',(req,res,next)=>{
    User.find({email:req.body.email})
    .count()
    .exec()
    .then(result=>{
        if(result==1){
            res.status(409).json({
                message:"Error creating user, email address already used"
            })
        }else{
            bcrypt.hash(req.body.password, 10, function(err, hash){
                if(err){
                    res.status(500).json({
                        error:err,
                        message:"Error creating user"
                    })
                }else{
                    const user = new User({
                        _id : mongoose.Types.ObjectId(),
                        email : req.body.email,
                        password:hash
                    })
                    user.save()
                    .then(result=>{
                        console.log(result)
                        res.status(201).json({
                            message:"User created",
                            user:result
                        })
                    })
                    .catch(error=>{
                        console.log(error)
                        res.status(500).json({
                            err:error
                        })
                    })
                }
            })
        }
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
});

router.post('/login',(req,res)=>{
    User.find({email:req.body.email})
    .exec()
    .then(user=>{
        if(user.length<1){
            console.log('no user found')
            res.status(401).json({
                message:"Auth failed"
            })
        }else{
            bcrypt.compare(req.body.password, user[0].password, function(err, resCompare) {
                if(err){
                    console.log(err)
                    res.status(401).json({
                        error:'Auth failed'
                    })
                }
                if(resCompare){
                    const token = jwt.sign({
                        email:user[0].email,
                        userId:user[0]._id
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn:3600
                    },)
                    res.status(200).json({
                        message:'loggedin',
                        token:token
                    })
                }else{
                    console.log('Wrong password')
                    res.status(401).json({
                        error:'Auth failed'
                    })
                }
            });
        }
    })
    .catch(err=>{
        console.log(err)
        res.statusCode(500).json({
            error:err
        })
    })
})

router.delete('/:userId',(req,res)=>{
    User.remove({_id:req.params.userId})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:"user deleted"
        })
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})

router.get('/',(req,res)=>{
    User.find()
    .select('_id email password')
    .exec()
    .then(result=>{
        console.log(result)
        res.status(200).json({
            users:result
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})
module.exports=router
