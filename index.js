const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose=require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

mongoose.connect(process.env.CONNECTION_STRING,{ useNewUrlParser: true,useUnifiedTopology: true})
.then((con)=>{
    console.log('connected to database!!')
})
.catch((err)=>{
    console.log(err)
})


const RouterProducts = require('./api/routes/products')
const RouterOrders = require('./api/routes/orders')
const RouteUser = require('./api/routes/user')

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use('/uploads',express.static('uploads/'))


app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*')//cros error
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')//cros error
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE')
        return res.status(200).json({})
    }
    next()
})

app.use('/products',RouterProducts)
app.use('/orders',RouterOrders)
app.use('/users',RouteUser)

app.use((req,res,next)=>{
    const error = new Error('Not found')
    error.status=404
    next(error)
})

app.use((err,req,res,next)=>{
    res.status(err.status || 500)
    res.json({
        error:{
            message:err.message,
            status:err.status
        }
    })
})

app.listen(process.env.PORT,()=>{
    console.log('Listnening on port '+process.env.PORT+'. Start doing great things!')
})