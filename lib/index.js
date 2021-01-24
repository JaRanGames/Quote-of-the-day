"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_connection_1 = require("./database.connection");
const quote_model_1 = __importDefault(require("./quote.model"));
const port = 25720;
const app = express_1.default();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
    // OBS: bara när vi gör GET så använder vi query istället för body
    let id = req.query.id;
    let document = await quote_model_1.default.findOne({
        _id: id
    });
    if (document != null) {
        res.json({
            message: "HÄr kommer datan",
            quote: document.quote,
            author: document.author,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
        });
        return;
    }
    console.log("ney");
    //req.body.variabel
    // exempel req.body.username
    res.json({
        message: "det funka inte (fel kod(antar jag))"
    });
});
app.post("/quote", async (req, res) => {
    // TODO se till att det alltid är rätt variabelr med
    const newQuote = {
        author: req.body.author,
        quote: req.body.quote
    };
    // OBS, jätteviktigt att "newQuote" har rätt struktur
    let databaseQuote;
    let createdQuote;
    try {
        databaseQuote = new quote_model_1.default(newQuote);
        createdQuote = (await databaseQuote.save());
    }
    catch (error) {
        res.json({
            message: "Någonting fungerade inte"
        });
        return;
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
    });
    // Skicka tillbaka:
    // meddelande som talar om hur det gick
    // skicka tillbaka quote så klienten kan se hur den blev
    // skicka tillbaka id av quoten
});
app.delete("/quote", async (req, res) => {
    // dubbelkolla så att id finns (alltså att vi skickat id från postman)
    // Fråga databasen om id finns
    console.log("yes1");
    let id = req.body.id;
    let document = await quote_model_1.default.findOne({
        _id: id
    });
    console.log("yes2");
    // OM id är null så ska vi meddelandet
    if (document == null) {
        res.json({
            message: "din beskrivning matchade inte något dokument"
        });
        return;
    }
    else {
        await quote_model_1.default.deleteOne({
            _id: id
        });
        res.json({
            message: "raderad!"
        });
    }
    console.log("Yes 3", document);
    // om den finns, så ta
});
/*
    POST alex.com/login
    GET alex.com/user
    POST alex.com/user
*/
app.listen(port, async () => {
    console.log("server is running");
    database_connection_1.connectDB();
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
});
