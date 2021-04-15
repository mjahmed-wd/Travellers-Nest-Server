const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectID;
const port = 5000;
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skjt9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const propertyCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_PROPERTY_COLLECTION);
  const ordersCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_ORDER_COLLECTION);
  const reviewCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_REVIEW_COLLECTION);

  //   app.post("/addProduct", (req, res) => {
  //     const products = req.body;
  //     productsCollection.insertOne(products).then((result) => {
  //       res.json(result.insertedCount);
  //     });
  //   });

  app.get("/allProperties", (req, res) => {
    propertyCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/property/:id", (req, res) => {
    propertyCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });
  //   app.get("/update/:roll", (req, res) => {
  //     res.json(req.params.roll)
  //   });

  //   app.patch("/updateProduct/:id",(req,res)=>{
  //     productsCollection.updateOne({ _id: ObjectId(req.params.id) },
  //     {
  //       $set: {name:req.body.name, price:req.body.price, variant:req.body.variant}
  //     })
  //     .then(result=>{
  //       res.send(result)
  //     })
  //   })

  //   app.delete("/delete/:id", (req, res) => {
  //     productsCollection
  //       .deleteOne({ _id: ObjectId(req.params.id) })
  //       .then((result) => {
  //         res.json(!!result.deletedCount);
  //       });
  //   });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders/:email", (req, res) => {
    // const userEmail = shipment.email;
    ordersCollection
      .find({ "checkInInfo.email": req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // review
  app.post("/postReview", (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review).then((result) => {
      res.json(result.insertedCount);
    });
  });
  app.get("/review",(req,res)=>{
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  })
});

app.listen(process.env.PORT || port);
