const builder = require('botbuilder'); //provides access to Bot Builder
const connector = new builder.ConsoleConnector().listen(); //connect to console
const bot = new builder.UniversalBot(connector); //use Universal Bot

bot.dialog('/', function(session) { //create a simple dialog
    session.send("Hello! I am a chat bot. How can I help you?");
});
