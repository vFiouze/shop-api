const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Order = require('../models/order')
const Product = require('../models/products')
const checkAuth = require('../middleware/check-auth')

router.get('/',checkAuth,(req,res)=>{
    Order.find()
    .exec()
    .select('productId quantity _id')
    .populate('productId','name _id')
    .exec()
    .then(docs=>{
        console.log(docs)
        res.status(200).json({
            count:docs.length,
            orders: docs.map(doc=>{
                return{
                    _id:doc._id,
                    product:doc.productId,
                    quantity:doc.quantity,
                    request:{
                        method:'GET',
                        url:'http://'+req.headers.host+'/orders/'+doc._id
                    }
                }

            }),
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.post('/',checkAuth,(req,res)=>{
    console.log(req.body.productId);
    Product.findById(req.body.productId)
    .exec()
    .then(findProduct=>{
        if(!findProduct){
            res.status(404).json({
                message:"Can't make an order with unknow product"
            })
        }else{
            order = new Order({
                _id:mongoose.Types.ObjectId(),
                quantity:req.body.quantity,
                productId:req.body.productId
            })
            order.save()
            .then(result=>{
                console.log(result)
                res.status(200).json({result})
            })
            .catch(err=>{
                console.log(err)
                res.status(500).json({message:err})
            })
        }
    }).catch(errorProduct=>{
        console.log(errorProduct)
        res.status(500).json({
            messag:errorProduct
        })
    })
})

router.get('/:orderId',checkAuth,(req,res)=>{
    Order.findById(req.params.orderId)
    .exec()
    .populate('productId')
    .then(docs=>{
        console.log(docs)
        if(docs){
            res.status(200).json({
                _id:docs._id,
                quantity:docs.quantity,
                productId:docs.productId,
                request:{
                    method:'GET',
                    url:'http://'+req.headers.host+'/products/'+docs.productId._id
    
                }
            })
        }else{
            res.status(200).json({
                message:'Order not found',
            })
        }
        
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
})

router.delete('/:orderId',checkAuth,(req,res)=>{
    Order.remove({_id:req.params.orderId})
    .then(result=>{
        console.log(result)
        res.status(200).json({
            message:'Order deleted',
            request:{
                method:'POST',
                url:'http://'+req.headers.host+'/orders/',
                body:{
                    productId:'String',
                    quantity:'Number',
                }
            }
        })
    })
    .catch(error=>{
        console.log(error)
        res.status(500).json({
            message:error
        })
    })
})
router.patch('/:orderId',checkAuth,(req,res)=>{
    res.status(200).json({
        message:"updated order with id : "+req.params.orderId
    })
})
module.exports=router

