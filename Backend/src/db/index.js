import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const dbConnection = async ()=>{
    try {
        const databaseConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`MongoDB connected succesfully running at :${databaseConnectionInstance.connection.host}`)
    } catch (error) {
        console.log("DB connection error ",error)
        throw(error)
    }
}

export default dbConnection
