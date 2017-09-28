const builder = require('botbuilder'); //provides access to Bot Builder
const connector = new builder.ConsoleConnector().listen(); //connect to console
const bot = new builder.UniversalBot(connector); //use Universal Bot

bot.dialog('/', [
    function(session){
    session.beginDialog('/askName');
    },
    function (session, results) {
        session.send('Hello %s! I am a chat bot. How can I help you?',
            results.response);
    }
]);

bot.dialog('/askName', [ //specific dialog accessed with /askName
    function (session){
        builder.Prompts.text(session, 'Hi! What is your name?');
    }
]);

