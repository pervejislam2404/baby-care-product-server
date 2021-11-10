const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvyqk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("baby_collection");
        const productCollection = database.collection("babyProducts");
        const usersCollection = database.collection("users");
        const orderCollection = database.collection("ordered");
        const reviewCollection = database.collection("review");

        app.get('/products',async (req,res)=>{
            const query = {};
            const result = await  productCollection.find(query).limit(6).toArray();
            res.json(result);
        })

        app.post('/users', async (req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

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
       

        app.put('/makeAdmin/:email', async (req,res)=>{
            const email = req.params.email;
            const query = {email: email};
            const updateDocs = {$set:{role: 'admin'}};
            const result = await usersCollection.updateOne(query,updateDocs);
            res.send(result)
        })

        app.get('/singleProduct/:id', async (req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectID(id)};
            const result = await productCollection.findOne(query);
            res.json(result);
        })

        app.post('/saveOrder', async (req,res)=>{
            const product = req.body;
            const result = await orderCollection.insertOne(product);
            res.json(result)
        })

        app.get('/userOrders/:email', async (req,res)=>{
            const email = req.params.email;
            const query = {email: email};
            const result = await orderCollection.find(query).toArray();
            res.json(result)
        })

        app.delete('/deleteOrder/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectID(id)};
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

        app.get('/getAllOrders', async (req,res)=>{
            const query = {};
            const result = await orderCollection.find(query).toArray();
            res.json(result);
        })

        app.get('/getAllProducts', async (req,res)=>{
            const query = {};
            const result = await productCollection.find(query).toArray();
            res.json(result);
        })


        app.put('/setStatus/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectID(id)};
            const updateDocs ={$set:{status: 'shipped'}};
            const result = await orderCollection.updateOne(query,updateDocs);
            res.json(result); 
        })


        app.delete('/deleteProduct/:id', async (req,res)=>{
            const id = req.params.id;
            console.log(id)
            const query = {_id: ObjectID(id)};
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })


        app.post('/addProduct', async (req,res)=>{
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result);
        })

        app.post('/saveReview', async (req,res)=>{
            const review = req.body;
           const result = await reviewCollection.insertOne(review);
           res.json(result);
        })

        app.get('/getAllReview', async (req,res)=>{
            const query = {};
            const result = await reviewCollection.find(query).toArray();
            res.json(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log('server running at port ' + port)
})