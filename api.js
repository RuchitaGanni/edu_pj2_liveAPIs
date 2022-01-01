var exp = require('express');

var dotenv = require('dotenv');
var mongo = require('mongodb');
var cors = require('cors');
var MongoClient = mongo.MongoClient;
dotenv.config();
//var mongoUrl = process.env.MongoLiveUrl;
var mongoUrl = "mongodb+srv://ruchita:ruchita123@cluster0.2ssc4.mongodb.net/project2?retryWrites=true&w=majority";
var port = process.env.PORT || 8122;

var bodyparse = require('body-parser');

// save the database connection
var db;




// creating object of express. because express have method to use
const app = exp();
app.use(cors());
//using body parser to read inputs from post
app.use(bodyparse.urlencoded({ extended: true }))
app.use(bodyparse.json())


// creating routes

app.get('/', (req, res) => {
    res.send("welcome ruchita");
})

//1.get deliversble locations
app.get('/locations', (req, res) => {
    db.collection('locations').find().sort({ location_id: 1 }).toArray((err, result) => {
        if (err) throw err;

        res.send(result)
    })
})



//2.get main categories
app.get('/category', (req, res) => {
    db.collection('category').find().sort({ id: 1 }).toArray((err, result) => {
        if (err) throw err;

        res.send(result)
    })
})


//list of products against categories

app.get('/products', (req, res) => {
    var query = {};
    if (req.query.category_id) {
        query = { category_id: Number(req.query.category_id) }
    }
    db.collection('products').find(query).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

//3.get main categories
app.get('/sub_category/:main_category_id', (req, res) => {
    var main_cid = Number(req.params.main_category_id);

    db.collection('sub_category').find({ main_category_id: main_cid }).sort({ id: 1 }).toArray((err, result) => {
        if (err) throw err;

        res.send(result)
    })
})

//4.insert orders against user 
app.post('/saveOrder', (req, res) => {
    db.collection('orders').insertOne(req.body, (err, result) => {
        if (err) throw err;
        res.send("order placed");
    })
})

//5.update cartitem qty
app.put('/updateStatus', (req, res) => {
    //console.log(req.body.product_id,'bbb');
    var product_id = req.body.product_id; //Number(req.params.user_id);
    var quantity = req.body.quantity;// req.body.status?req.body.status:"Pending"

    db.collection('cart_list').updateOne(
        { product_id: product_id, status: 0 },
        {
            $set: {
                "quantity": quantity
            }
        }
    )
    res.send('order status updated');

})

//6.delete order items from list against product_id
///db.products.remove( { qty: { $gt: 20 } }, true )
app.delete('/deleteOrder/:product_id', (req, res) => {
    var productId = Number(req.params.product_id);
    db.collection('cart_list').deleteOne({ product_id: productId }, (err, result) => {
        if (err) throw "error" + err;
        res.send(result)
    })
})

//7. get items in cart list table
app.get('/getOrders', (req, res) => {
    var query = {};
    if (req.query.product_id) {
        query = { product_id: Number(req.query.product_id), status: 0 }
    } else {
        query = { status: 0 }
    }
    db.collection('cart_list').find(query).sort({ id: 1 }).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})


//add item to cart

app.post('/addToCart', (req, res) => {
    db.collection('cart_list').insertOne(req.body, (err, result) => {
        if (err) throw err;
        res.send("item added to cart");
    })
})


app.put('/updateItemStatus', (req, res) => {
    //console.log(req.body.product_id,'bbb');
    var product_id = req.body.product_id; //Number(req.params.user_id);
    console.log(req.body.product_id,'pid',req.body.order_id)
    // req.body.status?req.body.status:"Pending"
    var order_id = req.body.order_id;
    try {
        db.collection('cart_list').updateOne(
            { product_id: product_id, status: 0 },
            {
                $set: {
                    "status": 1,
                    "order_id": order_id
                }
            }
        )
        res.send('order status updated')
    } catch (e) {
        res.send(e);
    }
})
//mealtypes using projections
//  app.get('/getMealtypes',(req,res)=>{
//     // var projection={"content": 0,_id:0};{projection:{mealtype:1,content:1,_id:0}}
//     db.collection('mealtypes').find({},{projection:{mealtype:1,content:1,_id:0}}).toArray((err,result) => {
//         if(err) throw err;
//         // console.log(result);
//         res.send(result)
//     })

// })



/* can comment this server part since included in below mongodb 
app.listen(port,()=>{
    console.log(`listening on port ${port}`);
})
*/


app.put('/updateCats', (req, res) => {

    db.collection('category').updateOne(
        { user: id },
        {
            $set: {
                "status": status
            }
        }
    )
    res.send('order status updated')
})

//connection with mongodb
MongoClient.connect(mongoUrl, (err, client) => {
    if (err) console.log("Error While Connecting");
    db = client.db('project2');  //db name  //change db name here when connecting with atlas db
    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    })
    // client.close();
})