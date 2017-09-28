const builder = require('botbuilder'); //provides access to Bot Builder
const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

bot.dialog('/', new builder.IntentDialog(). //create IntentDialog instance
    matches(/^Hello/i, function (session) { //match text expression
        session.send("Hi There!");
    })
    .onDefault(function(session) {
        session.send("I did not understand that. Say Hello to me!");
    }));

