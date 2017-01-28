// variables
var state, weatherReport, skycons = new Skycons({"color":"blue"});

$(document).ready(function() {
	$(".nav a").on("click", function(){ // sets the active class to the selected navbar
		$(".nav").find(".active").removeClass("active");
		$(this).parent().addClass("active");
	});
	
	getWeather("current"); // on open - set to show current weather and call.
});

function getWeather(passState){
	loadingStart();
	if(passState == "refresh" || state == passState){
		getLocalWeather(); // if user wants updated data or clicked again on same option - refreshes data
		return;
	} else {
		state = passState; // saves the state
		if(weatherReport == null){
			getLocalWeather(); // if first time - no saved data, calls webservice
		} else {
			callbackForGetLocalWeather(weatherReport); // skips webservice, uses previously recieved data.
		}
	}
};

function getLocalWeather(){
	$.getJSON('https://freegeoip.net/json/').done (function(location) // finds approximate location based on IP
	{
		// setup endpoint with location
		var endpoint = "https://api.darksky.net/forecast/23f9713f6e88d6a0c5a1ad12e0ef6f6b/" + location.latitude+ "," +location.longitude +"?units=si&exclude=hourly;flags";
		// call webservice to get forecast.
		$.ajax({
			url: endpoint,
			dataType: "jsonp",
			jsonpCallback: "callbackForGetLocalWeather",
			jsonp: "callback",
			timeout: 10000,
			error: function(data){ // incase of a timeout
				callbackError();
				return;
			}
		});
	});	
}

function callbackForGetLocalWeather(data){
	if(data == null || !data.currently){ // checks for data response and that it includes data.
		callbackError();
		return;
	}
	weatherReport = data; // saves data for reuse without calling ws
	clearWeatherBox(); // clear box for redrawing
	if(state == "current"){ // current uses currently, the rest all use the 'daily' part of the response.
		buildCurrentWeather(weatherReport);
	} else {
		buildWeatherForecast(weatherReport);
	}
}

function buildCurrentWeather(data) {
	var obj = cloneTemplate(data.currently,0,timeConverter(data.currently.time));
	document.getElementById("weatherbox").appendChild(obj);
	skycons.add(document.getElementById("iconID0"), data.currently.icon);
	loadingStop();
	skycons.play(); // play weather icons
};

function buildWeatherForecast(data) {
	var j, dataLength;
	if(!isNaN(state)){ // if state is a number - it means a specific day is requested, and only it runs.
		j = parseInt(state);
		dataLength = j + 1;
	} else {
		j = 0;
		dataLength = data.daily.data.length;
	}
	for(j; j < dataLength; j++){ // data.daily.data.length
		var obj = cloneTemplate(data.daily.data[j],j,dateConverter(data.daily.data[j].time));
		document.getElementById("weatherbox").appendChild(obj);
		var iconID = "iconID"+j;
		skycons.add(document.getElementById(iconID), data.daily.data[j].icon);
	}
	loadingStop();
	skycons.play(); // play weather icons
};

function cloneTemplate(forecastData,num,date){ // clone box template for reuse.
  var cloneTemplate = document.getElementById("template").cloneNode(true);
  var iconID = "iconID"+num;
  cloneTemplate.removeAttribute("style");
  cloneTemplate.setAttribute("id","DivID"+num);
  cloneTemplate.children[0].className += " " + forecastData.icon;
  // set weather date
  var forecastDate = document.createElement("h4");
  forecastDate.innerHTML = date;
  // set weather summary
  var forecastSummary = document.createElement("p");
  forecastSummary.innerHTML = forecastData.summary;
  // set weather temperature
  var forecastTemperature = document.createElement("p");
  if(state == "current"){
	  forecastTemperature.innerHTML = forecastData.temperature + "&#8451;";
  } else {
	  forecastTemperature.innerHTML = forecastData.temperatureMin + "&#8451; - " + forecastData.temperatureMax + "&#8451;";  
  }
  forecastTemperature.className = " temperatureClass label-primary";
  // set weather icon
  var canvas = document.createElement("canvas");
  canvas.id = iconID;
  canvas.width = "128";
  canvas.height = "128";
  cloneTemplate.children[0].appendChild(forecastDate);
  cloneTemplate.children[0].appendChild(forecastSummary);
  cloneTemplate.children[0].appendChild(canvas);
  cloneTemplate.children[0].appendChild(forecastTemperature);
  return cloneTemplate;
}

function clearWeatherBox(){ // clears the weatherbox div in prep for new data.
	var clearWeatherNode = document.getElementById("weatherbox");
	while (clearWeatherNode.firstChild) {
		clearWeatherNode.removeChild(clearWeatherNode.firstChild);
	}
}

function loadingStart(){
	document.getElementById("loading").removeAttribute("style");
	document.getElementById("weatherbox").setAttribute("style","display: none;");
}

function loadingStop(){
	document.getElementById("loading").setAttribute("style","display: none;");
	document.getElementById("weatherbox").removeAttribute("style");
}

function callbackError(){
	clearWeatherBox();
	var errorBox = "<h2>An Error has occured, please provide a shrubbery to continue.</h2></br><small>The Knights Who...</small>";
	document.getElementById("weatherbox").innerHTML += errorBox;
}

function dateConverter(timestamp){ // translate unix timestamp to human date
  var a = new Date(timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var day = days[a.getDay()];
  var date = a.getDate();
  var time = day + " " + date + " " + month + " " + year;
  return time;
}

function timeConverter(timestamp){ // translate unix timestamp to human time
  var a = new Date(timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var day = days[a.getDay()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = day + " " + date + " "  + month + " " + year + " " + hour + ":" + min + " ";
  return time;
}


function dat(){
	document.getElementById("dat").innerHTML = "were you expecting the end of the world?";
}