import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const dbConnection = async ()=>{
    try {
        const databaseConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`, {
            maxPoolSize: 10,
            minPoolSize: 5,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            w: "majority",
            connectTimeoutMS: 10000,
            family: 4
        })
        console.log(`MongoDB connected succesfully running at :${databaseConnectionInstance.connection.host}`)
    } catch (error) {
        console.log("DB connection error ",error)
        throw(error)
    }
}

export default dbConnection
