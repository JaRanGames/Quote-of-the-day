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

	// TEST user input
	if (req.query.id == undefined) {
		res.json({
			message: "du skickade inte med id"
		})
		return;
	}

	// Hämta alla quotes med en specifik author
	// ELLER hämta en quote med id

	// OBS: bara när vi gör GET så använder vi query istället för body
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

	console.log("ney");

	//req.body.variabel
	// exempel req.body.username

	res.json({
		message: "det funka inte (fel kod(antar jag))"
	})
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
/* 
	POST alex.com/login
	GET alex.com/user
	POST alex.com/user 
*/

app.listen(port, async () => {
	console.log("server is running");
	connectDB();

	/* Skapa ny quote
	const minQuote = new quoteModel({
		quote: "Om gräset är grönare på andra sidan så har man glömt att vattna sitt eget.",
		author: "Alexander Jaran"
	})

	minQuote.save(); */

	/* Sökte vi upp en quote (element)
	const data = await quoteModel.findOne({
		author: "Alexander Jaran"
	})

	console.log(data) */

	//Uppdaterar
	/*const data = await quoteModel.findOneAndUpdate({
		_id: "5ff1e29266de031c787ac205"
	},
	{
		author: "Linus Svensson"
	}, 
	{
		new: true
	})

	console.log(data);*/

	/* await quoteModel.deleteOne({
		_id: "5ff1e29266de031c787ac205"
	}) */
})