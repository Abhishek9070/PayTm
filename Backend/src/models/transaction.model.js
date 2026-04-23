import mongoose,{Schema} from "mongoose";

const transactionSchema = new Schema({
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    receiver:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    amount:{
        type:Number,
        required:true,
        min:1
    },
    status:{
        type:String,
        required:true,
        enum:["pending","success","failed"],
        default:"pending"
    }
},{timestamps:true})

export const Transaction = mongoose.model("Transaction",transactionSchema)