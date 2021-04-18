const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
// firebase
const admin = require("firebase-admin");
const serviceAccount = require(`./adminSDK.json`);
// mongodb
const ObjectId = require("mongodb").ObjectID;
const port = 5000;
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skjt9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use(cors());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
  const adminCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_ADMIN_COLLECTION);

  // jwt token verify

  const authCheck = (req, res,next) => {
    const token = req.headers.authorization;
    // console.log(token);
    if (token) {
      // console.log(token)
      admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        console.log(uid);
        next()
      })
      .catch((error) => {
        // Handle error
        console.log(error)
      });
     
    }
    // idToken comes from the client app
    else {
      res.status(401).json({ message: "Unauthorized Action" });
    }
  };

  app.post("/addProperty", authCheck, (req, res) => {
    const products = req.body;
    propertyCollection.insertOne(products).then((result) => {
      res.json(result.insertedCount);
    });
  });

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

  app.patch("/updateProperty/:id", (req, res) => {
    const { name, price, address, country, description } = req.body;
    propertyCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            name: name,
            price: price,
            address: address,
            country: country,
            description: description,
          },
        }
      )
      .then((result) => {
        res.send(result);
      });
  });

  app.delete("/deleteProperty/:id", (req, res) => {
    propertyCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.json(!!result.deletedCount);
      });
  });

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
  app.get("/review", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Admin
  // All Booking
  app.get("/allPlacedOrders", (req, res) => {
    // const userEmail = shipment.email;
    ordersCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // Update Order Status
  app.patch("/updateOrderStatus/:id", (req, res) => {
    const { status } = req.body;
    // console.log(req.body,req.params.id)
    ordersCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: { status: status },
        }
      )
      .then((result) => {
        res.send(result);
      });
  });
  // Admin Manage Section
  // Add Admin
  app.post("/addAdmin", (req, res) => {
    const adminData = req.body;
    adminCollection.insertOne(adminData).then((result) => {
      res.json(result.insertedCount);
    });
  });
  // Check If Admin or not
  app.get("/checkAdminRole/:email", (req, res) => {
    adminCollection
      .find({ email: req.params.email })
      .toArray((err, documents) => {
        if (err) {
          res.sendStatus(400).send("Could not perform the search");
        } else {
          res.json(documents);
        }
      });
  });
});

app.listen(process.env.PORT || port);
