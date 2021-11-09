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

        app.get('/products',async (req,res)=>{
            const query = {};
            const result = await  productCollection.find(query).toArray();
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