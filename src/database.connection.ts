import mongoose from "mongoose"

export function connectDB() {

    mongoose.connect(process.env.NODE_ENV === "production" ? process.env.LIVE_DB_CONNECTION_STRING as string : process.env.DB_CONNECTION_STRING as string, {
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