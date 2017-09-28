const http = require('http');
const url = require('url');
const os = require('os');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var port = Number(process.argv[2]);

http.createServer(function(request, response){
    var result;
    var pathName = request.url;
    console.log(pathName);

    if (pathName === '/api/1'){
        result = getSpaceData();
    }
    else if (pathName === '/api/2'){
        result = getCPU();
    }
    if (result){
        response.writeHead(200, { 'content-type' : 'application/json' });
        response.end(JSON.stringify(result));
    }
    else {
        response.writeHead(404);
        response.end();
    }   
}).listen(port);

//This function gets the astronaut names that are currently in space
function getSpaceData(){
    var xmlhttp = new XMLHttpRequest();
    var url = "http://api.open-notify.org/astros.json";
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = JSON.parse(xmlhttp.responseText);
    }
    var peopleAttr = response.people;
    var names = [];
    for (i=0; i<peopleAttr.length; i++){
        names.push(peopleAttr[i].name); 
    }
    return {
        astronauts: names
    }
}

//This function gets the machine's CPU model and average CPU speed (Ghz)
function getCPU(){
    var response = os.cpus();
    var cpuModel = [];
    var cpuSpeed = [];
    var total = 0;

    for (j=0; j<response.length; j++){
        cpuModel.push(response[j].model);
        speedGhz = response[j].speed * 0.001;
        cpuSpeed.push(speedGhz);
    }

    for (k=0; k < cpuSpeed.length; k++){
        total += cpuSpeed[k];
    }
    var avgCpuSpeed = total/cpuSpeed.length; 
    return {
        model: cpuModel,
        average_speed: avgCpuSpeed + "Ghz"
    }
}


