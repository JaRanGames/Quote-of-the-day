"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
function connectDB() {
    mongoose_1.default.connect("mongodb://127.0.0.1:27017/dailyQuotes?authSource=admin", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    });
    mongoose_1.default.connection.once("open", () => {
        console.log("Connection to database done!");
        /* const newQuote = new Quote_model({
            
        }) */
    });
}
exports.connectDB = connectDB;
