const express = require('express')
const router = express.Router()
const Products = require('../models/products')
const mongoose = require('mongoose')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')
const filter = function(req,file,cb){
    if(file.mimetype=='image/jpeg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}
const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null, 'uploads/')
    },
    filename : function(req,file,cb){
        cb(null,new Date().toISOString() + file.originalname)
    }
})
const upload = multer({storage:storage,fileFilter:filter})



router.get('/',(req,res)=>{
    Products.find()
    .select('name price _id productImage')
    .then(docs=>{
        console.log(docs)
        const response={
            count:docs.length,
            product:docs.map(doc=>{
                return{
                    name:doc.name,
                    price:doc.price,
                    _id:doc._id,
                    productImage:'http://'+req.headers.host+'/'+doc.productImage,
                    request:{
                        type:'GET',
                        url:'http://'+req.headers.host+'/products/'+doc._id

                    }
                }
            })

        }
        res.status(200).json(response)
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({message:err})
    })
})

router.post('/',checkAuth, upload.single('productImage'),(req,res)=>{
    console.log(req.file)
    const data = {
        _id : mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: 'http://'+req.headers.host+'/'+req.file.path
    }
    var product = new Products(data)
    product.save().then(result=>{
        console.log(result)
        res.status(201).json({
            message:'Product created',
            product:{
                name:result.name,
                price:result.price,
                id:result._id,
                productImage:result.productImage,
                request:{
                    method:'GET',
                    url:'http://'+req.headers.host+'/products/'+result._id
                }
            }
        })
    }).catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.get('/:productId',(req,res)=>{
    const id = req.params.productId
    Products.findById(id)
    .select('name price _id productImage')
    .then(result=>{
        if(result){
            console.log(result)
            res.status(200).json({
                name:result.name,
                price:result.price,
                _id:result._id,
                productImage:'http://'+req.headers.host+'/'+result.productImage
            })
        }else{
            res.status(404).json({message:"Doc not found"})
        }
        

    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.delete('/:productId',checkAuth,(req,res)=>{
    Products.remove({_id:req.params.productId})
    .then(result=>{
        res.status(200).json({
            message:"product removed : "+req.params.productId
        })

    })
    .catch(error=>{
        res.status(500).json({
            err:error
        })
    })
    
})
router.patch('/:productId',checkAuth,(req,res)=>{
    const updateOps={}
    for(ops of req.body){
        updateOps[ops.propName] = ops.value
    }
    Products.update({_id:req.params.productId},{ $set:updateOps})
    .then(result=>{
        console.log(result)
        res.status(200).json({result})
    })
    .catch(error=>{
        console.log(error)
        res.status(500).json({
            err:error
        })
    })
})
module.exports=router