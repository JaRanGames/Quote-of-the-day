import { truncateSync } from "fs";
import mongoose, { Document } from "mongoose"

const Schema = mongoose.Schema;

export interface IComment {
    _id?: string,
    comment: string,
    author: string,
    updatedAt?: string,
    createdAt?: string
}

export interface IQuotes {
    quote: string,
    author: string,
    likes: Array<String>,
    comments: Array<IComment>,
    updatedAt: string,
    createdAt: string
}

const CommentModel = new Schema({
    comment: {
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

const QuotesModel = new Schema({
    quote: {
        type: String,
        required: true
    },
    
    author: {
        type: String,
        required: true
    },

    likes: {
        type: [String],
        required: true
    },

    comments: {
        type: [CommentModel],
        required: true
    }

}, {
    timestamps: true
})

export default mongoose.model("quotes", QuotesModel);