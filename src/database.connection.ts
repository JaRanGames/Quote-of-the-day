import mongoose from "mongoose"

export function connectDB() {
    mongoose.connect("mongodb://127.0.0.1:27017/dailyQuotes?authSource=admin", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})

	mongoose.connection.once("open", () => {
		console.log("Connection to database done!")

		/* const newQuote = new Quote_model({
			
		}) */
	})
}