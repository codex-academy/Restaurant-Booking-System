// Import required packages and modules
import 'dotenv/config';
import express from "express";
import pgp from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "flash-express";
import restaurant from './services/restaurant.js';
import session from "express-session";
//create an express app
const app = express()
// Set up middleware for serving static files, sessions, flash messages, and request body parsing
app.use(express.static('public'));
app.use(session({ secret: "your-secret-key", resave: false, saveUninitialized: true }));
app.use(flash());
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
            // Fetch available tables from the database
    // Render the 'index' template with table data
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
        // Extract data from the request body (table name, username, phoneNumber, seats)
        // Attempt to book the table
        // If booking is successful, set a success flash message
        // If there is an error, set an error flash message
        // Redirect back to the home page
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
    // Fetch all booked tables from the database
    // Render the 'bookings' template with the booked tables data
    try {
        const bookedTables = await restaurant(db).getBookedTables();
        res.render('bookings', { tables: bookedTables });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/bookings/:username", async (req, res) => {
    // Show all the bookings made by a given user and allow booking cancellations
    // Extract the username from the request parameters
    // Fetch bookings for the specified user from the database
    // Render the 'user_bookings' template with the user's bookings data
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
    // Extract the table name to be canceled from the request body
    // Attempt to cancel the booking for the specified table
    // Redirect back to the bookings page
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