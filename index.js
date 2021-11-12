const express = require('express');
var admin = require("firebase-admin");
const app = express();
require('dotenv').config();
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// baby-care-products-50b0d-firebase-adminsdk.json

var serviceAccount = require("./baby-care-products-50b0d-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// admin


const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvyqk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// token-check

async function verifyToken(req,res,next){
if(req?.headers?.authorization.startsWith('Bearer ')){
    const token = req.headers?.authorization.split(' ')[1]
   
    try{
       const decodedUser = await admin.auth().verifyIdToken(token);
       req.decodedEmail= decodedUser.email;
    }
    catch{

    }
}


    next()
}

async function run() {
    try {
        await client.connect();
        const database = client.db("baby_collection");
        const productCollection = database.collection("babyProducts");
        const usersCollection = database.collection("users");
        const orderCollection = database.collection("ordered");
        const reviewCollection = database.collection("review");
 
        // fetching-all-data-from-server
        app.get('/products',async (req,res)=>{
            const query = {};
            const result = await  productCollection.find(query).limit(6).toArray();
            res.json(result);
        })

        // inserting-every-logged-user-to-database
        app.post('/users', async (req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        // inserting-every-logged-user-to-database-with-update
        app.put('/users', async (req,res)=>{
            const user = req.body;
            const upsert= {upsert: true};
            const filter = {email: user.email};
            const updateDocs = {
                $set:{email: user.email,name:user.name},
            };
            const result = await usersCollection.updateOne(filter,updateDocs,upsert);
            res.send(result)
        })
          
        // checking-the-admin-validity
        app.get('/checkAdmin/:email', async (req,res)=>{
            const email = req.params.email;
           const query = {email: email};
           const result = await usersCollection.findOne(query);
           if(result?.role === 'admin'){
               res.json({admin:true})
           }else{
               res.json({admin: false})
           }
        })
       

        // make-admin-with-email-and-verify-user-with-jwt 
        app.put('/makeAdmin/:email',verifyToken, async (req,res)=>{
            const email = req.params.email;
           if(req?.decodedEmail){
               const query = {email: email};
               const updateDocs = {$set:{role: 'admin'}};
               const result = await usersCollection.updateOne(query,updateDocs);
               res.send(result)
           }else{
            res.json({})
           }
        })

        // get-every-single-product-details
        app.get('/singleProduct/:id', async (req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectID(id)};
            const result = await productCollection.findOne(query);
            res.json(result);
        })

        // save-every-ordered-product-by-user
        app.post('/saveOrder', async (req,res)=>{
            const product = req.body;
            const result = await orderCollection.insertOne(product);
            res.json(result)
        })

        // get-the-all-products-of-logged-user
        app.get('/userOrders/:email', async (req,res)=>{
            const email = req.params.email;
            const query = {email: email};
            const result = await orderCollection.find(query).toArray();
            res.json(result)
        })

        // delete-an-order-and-verify-user-with-jwt
        app.delete('/deleteOrder/:id',verifyToken, async (req,res)=>{
            const id = req.params.id;
            if(req?.decodedEmail){
            const query = {_id: ObjectID(id)};
            const result = await orderCollection.deleteOne(query);
            res.json(result);
            }else{
                res.json({})
            }
        })

        // get-all-users-order-and-verify-with-jwt-token
        app.get('/getAllOrders', async (req,res)=>{
            if(req?.decodedEmail){
            const query = {};
            const result = await orderCollection.find(query).toArray();
            res.json(result);
            }else{
                res.json({})
            }
        })

        // get-all-main-products
        app.get('/getAllProducts', async (req,res)=>{
            const query = {};
            const result = await productCollection.find(query).toArray();
            res.json(result);
        })


        // updating-the-product-status-and-verify-user-with-jwt
        app.put('/setStatus/:id', async (req,res)=>{
            if(req?.decodedEmail){
                const id = req.params.id;
                const query = {_id: ObjectID(id)};
                const updateDocs ={$set:{status: 'shipped'}};
                const result = await orderCollection.updateOne(query,updateDocs);
                res.json(result); 
            }else{
                res.json({})
            }
        })


        // delete-the-main-product-and-verify-user-with-jwt
        app.delete('/deleteProduct/:id', async (req,res)=>{
            if(req?.decodedEmail){
                const id = req.params.id;
                console.log(id)
                const query = {_id: ObjectID(id)};
                const result = await productCollection.deleteOne(query);
                res.json(result);
            }else{
                res.json({})
            }
        })


        // add-a-product-to-main-product-and-verify-user-with-jwt
        app.post('/addProduct', async (req,res)=>{
            if(req?.decodedEmail){
                const product = req.body;
                const result = await productCollection.insertOne(product);
                res.json(result);
            }else{
                res.json({})
            }
        })

        // save-user-review-to-database-and-verify-user-with-jwt
        app.post('/saveReview', async (req,res)=>{
            if(req?.decodedEmail){
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
            }else{
                res.json({})
            }
        })

        // get-all-users-review-and-verify-user-with-jwt
        app.get('/getAllReview', async (req,res)=>{
            if(req?.decodedEmail){
                const query = {};
                const result = await reviewCollection.find(query).toArray();
                res.json(result);
            }else{
                res.json({})
            }
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log('server running at port ' + port)
})