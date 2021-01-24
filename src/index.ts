import mongoose from "mongoose"
import express from "express"
import { connectDB } from "./database.connection"
import quoteModel from "./quote.model"
import { isDefaultClause, visitFunctionBody } from "typescript"
const port = 25720
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request codes
// 200 - allting gick bra
// 201 - resurs skapad, servern skapade någonting
// 404 - sidan kunde inte hittas
// 400 - du har fuckat upp (exempelvis fel parametara eller fel variabler)
// 500 - servern crashade eller servern gjorde något fel

// alex.com/login/
// localhost/login = 127.0.0.1/login
app.get("/quote", async (req, res) => {

	// Hämta alla quotes med en specifik author
	// ELLER hämta en quote med id

	// OM vi har author men ingen id kör if

	if (req.query.author != null && req.query.id == null) {
		let documents = await quoteModel.find({
			author: req.query.author
		})
		res.json({
			message: "här kommer alla quotes",
			quotes: documents
		})
	}

	else if (req.query.id != null && req.query.author == null) {
		let id = req.query.id
		let document = await quoteModel.findOne({
			_id: id
		}) as mongoose.Document & {
			quote: string,
			author: string,
			createdAt: Date,
			updatedAt: Date
		}

		
		if (document != null) {
			res.json({
				message: "Här kommer datan",
				quote: document.quote,
				author: document.author,
				createdAt: document.createdAt,
				updatedAt: document.updatedAt
			})

			return;
		}
	}

	else {
		res.json({
			message: "du måste skicka med id eller author"
		})
	}
})

app.post("/quote", async (req, res) => {

	// TEST user input

	if (req.body.author == undefined || req.body.quote == undefined) {
		res.json({
			message: "du glömde att fylla i author eller quote"
		})

		return;
	}

	// TODO se till att det alltid är rätt variabelr med
	
	const newQuote = {
		author: req.body.author,
		quote: req.body.quote
	}

	// OBS, jätteviktigt att "newQuote" har rätt struktur
	let databaseQuote
	let createdQuote: mongoose.Document<any> & {
		quote: string,
		author: string
	}
	try {
		databaseQuote = new quoteModel(newQuote)
		createdQuote = (await databaseQuote.save()) as mongoose.Document<any> & {
			quote: string,
			author: string
		}
	}

	catch (error) {
		res.json({
			message: "Någonting fungerade inte"
		})
		return
	}

	// <går åt helvete>
	//console.log(newQuote.author);

	res.json({
		message: "Allt gick bra",
		quote: {
			quote: createdQuote.quote,
			author: createdQuote.author,
			id: createdQuote._id
		}
	})

	// Skicka tillbaka:
	// meddelande som talar om hur det gick
	// skicka tillbaka quote så klienten kan se hur den blev
	// skicka tillbaka id av quoten
})

app.delete("/quote", async (req, res) => {

	// TEST user input
	if (req.body.id == undefined) {
		res.json({
			message: "du skickade inte med id"
		})
		return;
	}

	// Fråga databasen om id finns
	console.log("yes1")
	
	let id = req.body.id
	let document = await quoteModel.findOne({
		_id: id
	})

	console.log("yes2")

	// OM id är null så ska vi meddelandet
	
	if (document == null) {
		res.json({
		message: "din beskrivning matchade inte något dokument"
		})
		return;
	}

	else {
		await quoteModel.deleteOne({
			_id: id
		})
		
		res.json({
			message: "raderad!"
		})
	}

	console.log("Yes 3", document)

	// om den finns, så ta
})

app.patch("/quote", async (req, res) => {

	// TEST user input
	if (req.body.id == undefined || req.body.quote == undefined) {
		// DUBBELKOLLA ATT DET FINNS EN QUOTE) {
		res.json({
			message: "Du skickade inte med en id eller quote"
		})
		return;
	}
	await quoteModel.updateOne({
		_id: req.body.id
	}, 
	
	{
		quote: req.body.quote
	})

	res.json({
		message: "allting gick bra"
	})

	// HÄR UPPDATERAR VI QUOTESN
})

/* 
	POST alex.com/login
	GET alex.com/user
	POST alex.com/user 
*/

app.listen(port, async () => {
	console.log("server is running");
	connectDB();
})