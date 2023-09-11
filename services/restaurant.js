// restaurant.js
const restaurant = (db) => {
    async function getTables() {
        // Use db.manyOrNone to fetch all available tables
        // Return the result
        return await db.manyOrNone(
            "SELECT * FROM table_booking WHERE booked = false"
        );
    }

    async function bookTable({ tableName, username, phoneNumber, seats }) {
        // Use db.oneOrNone to fetch a table by name check 

        // If the table doesn't exist or is already booked, return an error message
        // update the table status to booked with the provided details
        // SQL query: UPDATE table_booking SET booked = true, username = $1, number_of_people = $2, contact_number = $3 WHERE table_name = $4 AND booked = false
        // Return null if booking is successful
        const table = await db.oneOrNone(
            "SELECT * FROM table_booking WHERE table_name = $1 AND booked = false",
            [tableName]
        );

        if (!table) {
            return "Invalid table name provided";
        }

        if (table.number_of_people < seats) {
            return "Capacity greater than the table seats";
        }

        if (!username) {
            return "Please enter a username";
        }
        const contactNumber = phoneNumber || null;
        await db.none(
            "UPDATE table_booking " +
            "SET booked = true, username = $1, number_of_people = $2, contact_number = $3 " +
            "WHERE table_name = $4 AND booked = false",
            [username, seats, phoneNumber, tableName]
        );

        return null;
    }
    // If the table doesn't exist or is already booked, return an error message
    //or update the table status to booked with the provided details
    //Return null if its sucessful
    async function getBookedTables() {
        return await db.any("SELECT * FROM table_booking WHERE booked = true");
    }

    async function isTableBooked(tableName) {
        const result = await db.one(
            "SELECT EXISTS (SELECT 1 FROM table_booking WHERE table_name = $1 AND booked = true)",
            [tableName]
        );
        // Use db.one to check if a table with the given name is booked
        // Return the boolean result (true if booked, false if not)
        return result.exists;
    }

    async function cancelTableBooking(tableName) {
        return await db.none(
            // Use db.none to cancel a booking for the specified table
            //no need to return anything
            "UPDATE table_booking " +
            "SET booked = false, username = NULL, number_of_people = NULL, contact_number = NULL " +
            "WHERE table_name = $1 AND booked = true",
            [tableName]
        );
    }

    async function getBookedTablesForUser(username) {
        // Use db.any to fetch all bookings for a specific user
        // Return the result
        return await db.any(
            "SELECT * FROM table_booking WHERE username = $1 AND booked = true",
            [username]
        );
    }
    return {
        /// Export the functions as an object
        getTables,
        bookTable,
        getBookedTables,
        isTableBooked,
        cancelTableBooking,
        getBookedTablesForUser,
    };
};
// Export the restaurant module
export default restaurant;




