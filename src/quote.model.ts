import mongoose from "mongoose"

const Schema = mongoose.Schema;

const Quotes = new Schema({
    quote: {
        type: String,
        required: true
    },
    
    author: {
        type: String,
        required: true
    }

}, {
    timestamps: true
})

export default mongoose.model("quotes", Quotes);