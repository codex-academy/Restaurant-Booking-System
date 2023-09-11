// restaurant.js
const restaurant = (db) => {
    async function getTables() {
        return await db.manyOrNone(
            "SELECT * FROM table_booking WHERE booked = false"
        );
    }

    async function bookTable({ tableName, username, phoneNumber, seats }) {
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

    async function getBookedTables() {
        return await db.any("SELECT * FROM table_booking WHERE booked = true");
    }

    async function isTableBooked(tableName) {
        const result = await db.one(
            "SELECT EXISTS (SELECT 1 FROM table_booking WHERE table_name = $1 AND booked = true)",
            [tableName]
        );
        return result.exists;
    }

    async function cancelTableBooking(tableName) {
        return await db.none(
            "UPDATE table_booking " +
            "SET booked = false, username = NULL, number_of_people = NULL, contact_number = NULL " +
            "WHERE table_name = $1 AND booked = true",
            [tableName]
        );
    }

    async function getBookedTablesForUser(username) {
        return await db.any(
            "SELECT * FROM table_booking WHERE username = $1 AND booked = true",
            [username]
        );
    }

    return {
        getTables,
        bookTable,
        getBookedTables,
        isTableBooked,
        cancelTableBooking,
        getBookedTablesForUser,
    };
};

export default restaurant;








// const restaurant = (db) => {

//     async function getTables() {
//         // get all the available tables
//         return await db.manyOrNone(
//             "SELECT * FROM table_booking WHERE booked = false"
//         );
//     }

   
//     // async function bookTable(tableName, username, numberOfPeople, contactNumber) {
//     //     // book a table by name
//     //     return await db.none(
//     //         "UPDATE table_booking " +
//     //         "SET booked = true, username = $1, number_of_people = $2, contact_number = $3 " +
//     //         "WHERE table_name = $4 AND booked = false",
//     //         [username, numberOfPeople, contactNumber, tableName]
//     //     );
//     // }
  
    


//     async function getBookedTables() {
//         return await db.any("SELECT * FROM table_booking WHERE booked = true"
//     )}
    
//     async function isTableBooked(tableName) {
//         // get booked table by name
//         const result = await db.one(
//             "SELECT EXISTS (SELECT 1 FROM table_booking WHERE table_name = $1 AND booked = true)",
//             [tableName]
//         );   
//         return result.exists;
//     }
    

//     async function cancelTableBooking(tableName) {
//         // cancel a table by name
//         return await db.none(
//             "UPDATE table_booking " +
//             "SET booked = false, username = NULL, number_of_people = NULL, contact_number = NULL " +
//             "WHERE table_name = $1 AND booked = true",
//             [tableName] );
//             //we don't expect any rows to be returned as a result of the update.
//     }
    

//     async function getBookedTablesForUser(username) {
//        return await db.any(
//         "SELECT * FROM table_booking WHERE username = $1 AND booked = true"
//        )
//     }

//     return {
//         getTables,
//         bookTable,
//         getBookedTables,
//         isTableBooked,
//         cancelTableBooking,
//         getBookedTablesForUser
//     }
// }

// export default restaurant;