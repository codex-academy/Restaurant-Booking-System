import 'dotenv/config';
import express from "express";
import pgp from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "flash-express";
import restaurant from './services/restaurant.js';
const session = require("express-session"); 

const app = express()

app.use(express.static('public'));
app.use(flash());
app.use(
    session({
      secret: "somethingamazing",
      resave: false,
      saveUninitialized: false,
    })
  );
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});


app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

const DATABASE_URL = '';

const connectionString = process.env.DATABASE_URL || DATABASE_URL;
const db = pgp()(connectionString);


// db.connect()
// .then(obj => console.log("testing"))
// .catch(err => console.log("sometthhhing"))
//testing to see if the database is connected 

///Routes

// Show tables that can be booked and allow the client to book a table
app.get("/", async (req, res) => {
    try {
        const tables = await restaurant(db).getTables();
        res.render('index', { tables });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

// Book a table that has not already been booked
app.post("/book", async (req, res) => {
    try {
        const { tableName, username, phoneNumber, seats } = req.body;
        const errorMessage = await restaurant(db).bookTable({
            tableName,
            username,
            phoneNumber,
            seats
        });
        if (errorMessage) {
            req.flash("error", errorMessage);
        } else {
            req.flash("success", "Table booked successfully!");
        }
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});



app.get("/bookings", async (req, res) => {
    
    // Show all the bookings made
    try {
        const bookedTables = await restaurant(db).getBookedTables();
        res.render('bookings', { tables: bookedTables });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// app.get("/bookings", (req, res) => {
//     res.render('bookings', { tables: [{}, {}, {}, {}, {}, {}] })
// });


app.get("/bookings/:username", async (req, res) => {
   // Show all the bookings made by a given user and allow booking cancellations
    try {
        const { username } = req.params;
        const userBookings = await restaurant(db).getBookedTablesForUser(username);
        res.render('user_bookings', { tables: userBookings });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/cancel", async (req, res) => {
    // Cancel the booking for the selected table
    try {
        const { tableName } = req.body;
        await restaurant(db).cancelTableBooking(tableName);
        res.redirect("/bookings");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});


/////////
var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('🚀  server listening on:', portNumber);
});