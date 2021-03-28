const express = require('express')

const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()




const port = 4000
const app = express()

app.use(cors());
app.use(bodyParser.json());




var serviceAccount = require("./configs/burj---al--arab-firebase-adminsdk-xa0gd-c0cbbe6414.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});



const password = 'shumit0011';




const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.papr4.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("Bookings");
    console.log('db connected successfully')
    // perform actions on the collection object


    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })

    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if(bearer && bearer.startsWith ('Bearer')){
         const idToken =bearer.split(' ')[1];
         
         admin
         .auth()
         .verifyIdToken(idToken)
         .then((decodedToken) => {
             const tokenEmail = decodedToken.email;
             const queryEmail = req.query.email;
            

             if(tokenEmail == queryEmail){
                bookings.find({ email: queryEmail})
                // bookings.find({})
                .toArray((err,documents) =>{
                    res.status(200).send(documents);
                })
             }
            else{
                res.status(401).send('un authorized access') 
            }
             // ...
         })
         .catch((error) => {
            res.status(401).send('un authorized access') 
         });
        }
        else{
           res.status(401).send('un authorized access') 
        }
       

      
    })
});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port);