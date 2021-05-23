import mongoose from "mongoose"
import express from "express"
import { connectDB } from "./database.connection"
import quoteModel from "./quote.model"
import { IQuotes } from "./quote.model"
import morgan from "morgan"
import { Socket } from "socket.io"
import { stringify } from "querystring"

const port = 25720
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

const server = require("http").createServer(app);
const io = require("socket.io")(server);

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
	// ELLER hämta bara allt

	// OM vi har author men ingen id kör if

	if (req.query.author == null && req.query.id == null) {
		let documents = await quoteModel.find()
		res.json({
			message: "här kommer alla quotes",
			quotes: documents
		})
	}
	else if (req.query.author != null && req.query.id == null) {
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
		}) as mongoose.Document & IQuotes
		
		if (document != null) {
			res.json({
				message: "Här kommer datan",
				quote: document.quote,
				author: document.author,
				likes: document.likes,
				comments: document.comments,
				createdAt: document.createdAt,
				updatedAt: document.updatedAt,
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

app.patch("/quote/like", async (req, res) => {
	// TEST user input

	if (req.body.id == undefined || req.body.like == undefined || req.body.fingerprint == undefined) {
		res.json({
			message: "du glömde att fylla antingen id, like eller fingerprint"
		})

		return;
	}
	let document = await quoteModel.findOne({
		_id: req.body.id
	}) as unknown as mongoose.Document & {
		quote: string,
		author: string,
		likes: Array<string>,
		createdAt: Date,
		updatedAt: Date
	}

	if (document == null) {
		res.json({
			message: "dumdum det funkade inte"
		})

		return;
	}

	// testa ifall vi ska lägga till eller ta bort en like
	if (req.body.like === "true") {
		const index = document.likes.findIndex((current) => current.toString() === req.body.fingerprint)
		if (index < 0) {
			// lägg till like
			if (document.likes == undefined) 
				document.likes = [req.body.fingerprint]
			else
				document.likes.push(req.body.fingerprint);
		}
	}

	else {
		const index = document.likes.findIndex((current) => current.toString() === req.body.fingerprint)
		document.likes.splice(index, 1)
	}

	document.save()

	// utför rätt operation

	// spara
	res.json({
		message: "det fungerade"
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
	
	let id = req.body.id
	let document = await quoteModel.findOne({
		_id: id
	})

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
	}, {
		quote: req.body.quote
	})

	res.json({
		message: "allting gick bra"
	})

	// HÄR UPPDATERAR VI QUOTESN
})

app.delete("/quote/comment", async (req, res) => {
	// TEST USER INPUT
	if (req.body.commentID == undefined || req.body.commentID.length <= 0 || req.body.quoteID == undefined || req.body.quoteID.length <= 0) {
		// DUBBELKOLLA ATT DET FINNS EN QUOTE) {
		res.json({
			message: "Du är trash"
		})
		return;
	}

	// Hämta rätt quote document
	const quoteDocument = await quoteModel.findOne({
		_id: req.body.quoteID
	}) as mongoose.Document & IQuotes

	 [
		 // comment 1 {jgksjkgj}
		 // comment 2
		 // comment 3
	 ]

	const index = quoteDocument.comments.findIndex((current) => current._id != undefined && current._id.toString() === req.body.commentID.toString())

	if (index == -1) {
		res.json({
			message: "comnmenten finns inte"
		}) 		
		return
	}

	quoteDocument.comments.splice(index, 1)

	quoteDocument.save()
	res.json({
		message: "yes workig"
	})
})

app.post("/quote/comment", async (req, res) => {
	// TESTA INPUT
	if (req.body.comment == undefined || req.body.id == undefined || req.body.comment.length <= 0 || req.body.author == undefined || req.body.author.length <= 0) {
		// DUBBELKOLLA ATT DET FINNS EN QUOTE) {
		res.json({
			message: "Du är trash"
		})
		return;
	}

	// Hämta rätt quoteDOCUMENT
	const quoteDocument = await quoteModel.findOne({
		_id: req.body.id
	}) as mongoose.Document & IQuotes

	// Kolla så att quotedocument faktiskt finns (kolla om det är null)

	if (quoteDocument == null) {
		res.json({
			message: "rgfdaokjhadflköjngklöngakgnaoönb"
		})
		return
	}
	
	// Lägg till comment
	let blä = quoteDocument.comments
	blä.push({
		comment: req.body.comment,
		author: req.body.author
	})

	quoteDocument.save()
	res.json({
		message: "yes everything ok"
	})

	// SPara nya quoteDOCUMENT
})

/* 
	POST alex.com/login
	GET alex.com/user
	POST alex.com/user 
*/

io.on("connection", (socket: Socket) => {
	console.log("HELLO")

	socket.join("main")

	socket.on("like", (data: {
		id: string,
		like: boolean,
		fingerprint: string
	}) => {
		socket.to("main").emit("like", data)
	})

	socket.on("deleteQuote", (data: string) => {
		socket.to("main").emit("deleteQuote", data)
	})

	socket.on("disconnect", () => {
		console.log("Connection ended")
	})
});

server.listen(port, async () => {
	console.log("Server is Running");
	connectDB();
})