import mongoose,{Schema} from "mongoose";

const transactionSchema = new Schema({
    type: {
        type: String,
        enum: ["transfer", "deposit", "withdrawal"],
        required: true
    },
    // For transfers: use `sender` and `receiver`.
    // For deposits/withdrawals: use `userId` and `direction`.
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:false,
        index:true
    },
    receiver:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:false,
        index:true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
        index: true
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
    ,
    direction: {
        type: String,
        enum: ["debit", "credit", "send", "receive"],
        required: false
    }
    ,
    razorpayOrderId: {
        type: String,
        required: false,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        required: false,
        index: true
    }
},{timestamps:true})

export const Transaction = mongoose.model("Transaction",transactionSchema)