const builder = require('botbuilder');
const https = require('https');
const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

function getBooksData(key) {
    https.get("https://www.googleapis.com/books/v1/volumes?q=" + key + "&maxResults=20", function(res) { //retrieve data from given url
        var d = '';
        res.on('data', function(item){ //join individual items
            d += item;
        });
        res.on('end', function(){ //parse JSON string
            var e = JSON.parse(d);
            for (var i = 0; i < e.items.length; i++) {
                console.log(i + 1 + ":" + e.items[i].volumeInfo.title);
            }
        });
    });
}

const intents = new builder.IntentDialog(); //create intent dialog instance
bot.dialog('/', intents);
intents.matches(/^Hi/i, [ //perform text matching
    function(session) {
        builder.Prompts.text(session, 'Hey I am a book bot. Welcome to Book Searching. To start, which book topic interests you?');
    },
    function (session, results) {
        session.send('Here are books for topic -%s', results.response);
        getBooksData(results.response);
    }
]);

intents.onDefault(builder.DialogAction.send('Hello! I am a chat bot. Say Hi to me to get started.')); //default response

