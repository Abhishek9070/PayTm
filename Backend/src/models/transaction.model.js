import mongoose,{Schema} from "mongoose";

const transactionSchema = new Schema({
    sendersId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    reciversId:{
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
        enum:["Pending","Success","Failed"],
        default:"Pending"
    }
},{timestamps:true})

export const transaction = mongoose.model("Transaction",transactionSchema)