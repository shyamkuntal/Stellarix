const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database")



// handling uncaught exception error
process.on("uncaughtException",err => {
    console.log(`Error:  ${err.message}`)
    console.log("Shutting Down the Server Due to uncaught Exception")
    process.exit(1);
})

dotenv.config({path:"backend/config/config.env"});
connectDatabase(); // connect to database

app.listen(process.env.PORT, () => {

    console.log(`server is working on http://localhost:${process.env.PORT}`)
});


// unhandled promise rejection
process.on("unhandledRejection", err => {
    console.log(`Error:  ${err.message}`)
    console.log("Shutting Down the Server Due to unhandled Promise Rejection")

    server.close(() => {
        process.exit(1);
    })
})