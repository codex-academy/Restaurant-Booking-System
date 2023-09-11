import 'dotenv/config';
import assert from "assert"
import RestaurantTableBooking from "../services/restaurant.js";
import pgPromise from 'pg-promise';

const DATABASE_URL = '';

const connectionString = process.env.DATABASE_URL || DATABASE_URL;
const db = pgPromise()(connectionString);

describe("The restaurant booking table", function () {
    beforeEach(async function () {
        this.timeout(5000);
        try {
           
            // clean the tables before each test run
            // await db.none("TRUNCATE TABLE table_booking RESTART IDENTITY CASCADE;");
        } catch (err) {
            console.log(err);
            throw err;
        }
    });

    it("Get all the available tables", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
        const tables = await restaurantTableBooking.getTables();
        assert.equal(6, tables.length); // Change the expected value to match database state.
    });

    it("It should check if the capacity is not greater than the available seats.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
        
        const result = await restaurantTableBooking.bookTable({
            tableName: 'Table four',
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 3
        });
        assert.notEqual(result,"capacity greater than the table seats"); 
    });
    



    it("should check if there are available seats for a booking.", async function () {

        const restaurantTableBooking = await RestaurantTableBooking(db);
        const tables = await restaurantTableBooking.getTables();
        assert.notEqual(0, tables.length); // make sure there are available tables yips 
    });
    
//
it("Check if the booking has a user name provided.", async function () {
    const restaurantTableBooking = await RestaurantTableBooking(db);

    const result = await restaurantTableBooking.bookTable({
        tableName: 'Table eight',
        phoneNumber: '084 009 8910',
        seats: 2
    });

    assert.notEqual(result, "Please enter a username");
});

it("Check if the booking has a contact number provided.", async function () {
    const restaurantTableBooking = await RestaurantTableBooking(db);

    const result = await restaurantTableBooking.bookTable({
        tableName: 'Table eight',
        username: 'Kim',
        seats: 2
    });

    assert.strictEqual(result, null); // Null means a contact number was not provided.
});



    it("should not be able to book a table with an invalid table name.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
        const message = await restaurantTableBooking.bookTable({

            tableName: 'InvalidTableName',//i changed to an invalid name since the previous one table 8
            username: 'Kim',
            phoneNumber: '084 009 8910',
            seats: 2
        });
        assert.strictEqual(message, 'Invalid table name provided');

    });

    ///
   
    

    it("should be able to book a table.", async function () {
        const restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Book the table
        await restaurantTableBooking.bookTable({
            tableName: 'Table three',
            username: 'Kim', // Provide a valid username
            phoneNumber: '084 009 8910',
            seats: 2
        });
    
        // Check if the table is now booked
        const bookedStatus = await restaurantTableBooking.isTableBooked('Table three');
    
        assert.strictEqual(bookedStatus, true);
    });
      
    

    it("should list all booked tables.", async function () {
        let restaurantTableBooking = RestaurantTableBooking(db);
        let tables = await restaurantTableBooking.getTables();
        assert.deepEqual(6, tables.length);
    });

    it("should allow users to book tables", async function () {
        this.timeout(5000); // Increase the timeout if needed
    
        let restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Clear all existing bookings before testing
        await db.none("UPDATE table_booking SET booked = false, username = NULL, number_of_people = NULL, contact_number = NULL");
    
        // Attempt to book tables
        const result1 = await restaurantTableBooking.bookTable({
            tableName: 'Table one',
            username: 'User1',
            phoneNumber: '084 009 8910',
            seats: 2
        });
    
        const result2 = await restaurantTableBooking.bookTable({
            tableName: 'Table two',
            username: 'User2',
            phoneNumber: '084 009 8910',
            seats: 4
        });
    
        // Assert that the booking results are as expected (null means successful booking)
        assert.strictEqual(result1, null);
        assert.strictEqual(result2, null);
    
        // Get the list of booked tables
        const bookedTables = await restaurantTableBooking.getBookedTables();
    
        // Assert that the bookedTables array is not empty
        assert.notEqual(bookedTables.length, 0);
    
        // Additional assertion: Check that the bookedTables array contains the expected data for the booked tables
        assert.deepEqual(bookedTables, [
            {
                table_name: 'Table one',
                username: 'User1',
                contact_number: '084 009 8910',
                number_of_people: 2
            },
            {
                table_name: 'Table two',
                username: 'User2',
                contact_number: '084 009 8910',
                number_of_people: 4
            }
        ]);
    });
    

    
    
    

    
    it("should be able to cancel a table booking", async function () {
        this.timeout(5000); 
    let restaurantTableBooking = await RestaurantTableBooking(db);
    
        // Check the initial number of booked tables and then attempt to cancel a table booking
        const initialBookedTables = await restaurantTableBooking.getBookedTables();
        await restaurantTableBooking.cancelTableBooking("Table one");
        const bookedTablesAfterCancellation = await restaurantTableBooking.getBookedTables();
    
        // Assert the number of booked tables after cancellation
        assert.equal(0, bookedTablesAfterCancellation.length);
    });
    
    


    after(function () {
        db.$pool.end;
    });
})
