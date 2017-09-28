const builder = require('botbuilder');
const https = require('https');
const connector = new builder.ConsoleConnector().listen();
const bot = new builder.UniversalBot(connector);

function getCourseData(key, number, callback) {
    https.get("https://api.uwaterloo.ca/v2/courses/" + key + "/" + number + ".json?key=ce7a786af736c9ffc1bdc08c384812b5", function(res) { //retrieve data from given url
        var d = '';
        res.on('data', function(item){ 
            d += item;
        });
        res.on('end', function(){ 
            var response = JSON.parse(d);
            callback(response);
        });
    });
}

function getBuildings(callback){
    https.get("https://api.uwaterloo.ca/v2/buildings/list.json" + "?key=ce7a786af736c9ffc1bdc08c384812b5", function(res) {
        var d = '';
        res.on('data', function(item){
            d += item;
        });
        res.on('end', function(){ 
            var response = JSON.parse(d);
            callback(response.data);
        });
    });
}

function getCoursesInRoom(building, room, callback){
    https.get("https://api.uwaterloo.ca/v2/buildings/" + building + "/" + room + "/courses.json?key=ce7a786af736c9ffc1bdc08c384812b5", function(res) { //retrieve data from given url
        var d = '';
        res.on('data', function(item){ 
            d += item;
        });
        res.on('end', function(){ 
            var response = JSON.parse(d);
            callback(response.data);
        });
    });
}

function getFoodMenu(year, week, callback){
    https.get("https://api.uwaterloo.ca/v2/foodservices/" + year + "/" + week + "/menu.json?key=ce7a786af736c9ffc1bdc08c384812b5", function(res) { //retrieve data from given url
        var d = '';
        res.on('data', function(item){ 
            d += item;
        });
        res.on('end', function(){ 
            var response = JSON.parse(d);
            callback(response.data);
        });
    });
}

const intents = new builder.IntentDialog(); 
bot.dialog('/', intents);

bot.dialog('/coursesHelper', [
    function(session){
        builder.Prompts.text(session, "What is the subject code? (i.e. BME)");
    },
    function(session, results){
        session.userData.subject = results.response;
        builder.Prompts.text(session, "What is the catalog number? (i.e. 322)");
    },
    function(session, results){
        session.userData.number = results.response;
        getCourseData(session.userData.subject, session.userData.number, function(course) {
            if (course.meta.message == 'No data returned'){
                session.send('There is no data for this course');
                session.replaceDialog('/coursesHelper');
            }
            else {
                session.send("Course Code: " + course.data.subject + course.data.catalog_number + "\n" + "Title: " + course.data.title + "Description: " + course.data.description);
                session.endDialog('Thanks for using the search. Type anything to start another search');
            }
        });
    }
]);

bot.dialog('/courseBot', [
    function(session) {
        session.send(session, "Hey! I am the Charlie the course bot.");
        session.replaceDialog('/coursesHelper');
    }
]);

bot.dialog('/buildingBot', [
    function(session, args) {
        if (args && args.reprompt){
            builder.Prompts.text(session, 'Sorry. I do not understand. Please indicate your choice (i.e. buildings, courses)');
        }
        else {
            builder.Prompts.text(session, 'Hey! I am Billy the buildings bot. What would you like to know? I can list out buildings, courses in a classroom! ');
        }
    },
    function (session, results) {
        if (results.response == "buildings"){
            getBuildings(function(buildings){ 
                for (var i = 0; i < buildings.length; i++) {
                    console.log("Building Name: " + buildings[i].building_name);
                }
            session.endDialog('Thanks for using the search. Type anything to start another search');
            });
        }
        else if (results.response == "courses"){
            session.replaceDialog('/courseBuildingHelper');
        }
        else {
            session.replaceDialog('/buildingBot', { reprompt: true });
        }
    }
]);

bot.dialog('/courseBuildingHelper', [
    function(session){
        builder.Prompts.text(session, "Which building?");
    },
    function(session, results){
        session.userData.building = results.response;
        builder.Prompts.text(session, "Which room?");
    },
    function(session, results){
        session.userData.room = results.response;
        getCoursesInRoom(session.userData.building, session.userData.room, function(course){
            if (course.length == 0){
                session.send('There is no data for this building/room');
                session.replaceDialog('/courseBuildingHelper');
            }
            else {
                for (var i = 0; i < course.length; i++) {
                    session.send("Course Code " + course[i].subject + course[i].catalog_number + "   Weekdays: " + course[i].weekdays + "   Start Time: " + course[i].start_time + "   End Time: " + course[i].end_time);
                }
                session.endDialog('Thanks for using the search. Type anything to start another search');
            }
        });
    } 
]);

bot.dialog('/foodBot', [
    function(session,args){
        if (args && args.reprompt){
            builder.Prompts.text(session, 'Please type a valid year');
        }
        else {
            builder.Prompts.text(session, 'Hey! I am Frank the food bot. I can give you a the food menu for the week. To get started, what is the year?');
        }
    },
    function (session, results){
        session.userData.year = results.response;
        builder.Prompts.text(session, "Which week?");
    },
    function (session, results){
        session.userData.week = results.response;
        getFoodMenu(session.userData.year, session.userData.week, function(menu){
            if (menu.outlets == []){
                session.send('There is no data for this week');
                session.replaceDialog('/foodBot', { reprompt: true });
            }
            else {
                var outlets = menu.outlets;
                if (outlets.length == 0){
                    session.send('There is no data for this week');
                    session.replaceDialog('/foodBot', { reprompt: true });
                }
                else {
                    for (var j = 0; j < outlets.length; j++){
                        session.send('Outlet Name: ' + outlets[j].outlet_name);
                        var menu = outlets[j].menu;
                        for (var k=0; k < menu.length; k++){
                            session.send('     Date: ' + menu[k].date);
                            var lunch = menu[k].meals.lunch;
                            var dinner = menu[k].meals.dinner;
                            for (l=0; l < lunch.length; l++){
                                var lunchItem = lunch[l];
                                session.send('            Lunch Item: ' + lunchItem.product_name);
                            }
                            for (d=0; d < dinner.length; d++){
                                var dinnerItem = dinner[d];
                                session.send('            Dinner Item: ' + dinnerItem.product_name);
                            }
                        }
                    }
                    session.endDialog('Thanks for using the search. Type anything to start another search');
                }
            }
        });
    }
]);

intents.matches(/^courses/i, "/courseBot");
intents.matches(/^buildings/i, "/buildingBot"); 
intents.matches(/^food/i, "/foodBot");

intents.onDefault(builder.DialogAction.send('Hello! I am the Waterloo bot (Aka Waterbot). I am here to provide you with information regarding courses, buildings, and food. To get started, what would you like to know? (i.e. courses, buildings, food)')); //default response
