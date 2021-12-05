const searchBtn = $(".searchBtn");
const searchInput = $("#city");

// Left column
const cityEl = $(".cityName");
const currentDateEl = $(".currentDate");
const weatherIconEl = $(".weatherIcon");
const historyItemsEl = $("#historyItems");

// Right column
const tempEl = $(".temp");
const humidEl = $(".humidity");
const windEl = $(".windSpeed");
const uvEl = $(".uvIndex");
const cardRow = $(".card-row");

let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

const myKey = "536ae704e8408df81b5c26d27f087f6d";

searchBtn.on("click", function(e) {
    e.preventDefault();
    if (searchInput.val() === "") {
        alert("You must enter a city");
        return;
    }
    console.log("clicked button")
    searchHistory.push(searchInput.val());
    localStorage.setItem("search",JSON.stringify(searchHistory));
    getWeather(searchInput.val());
});

function tempConvert(k) {
    return Math.floor((k - 273.15)*1.8 +32);
}

function getDate(date) {
    let currentDate = new Date(date*1000);
    console.log(currentDate);
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    return month + "/" + day + "/" + year;

}

function dispSearchHist() {
    historyItemsEl.innerHTML = "";
    console.log(searchHistory);
    if(searchHistory.length != 0) {
        for (let i=0; i<searchHistory.length; i++) {
            const historyItem = $("<li>");
            historyItem.append("<a href='#' class='collection-item center'>"+searchHistory[i]);
            historyItem.append("<input type='hidden' id='storedData'></a>");
            let storedData = $('#storedData');
            historyItem.on("click",function() {
                storedData.val(searchHistory[i]);
                console.log(storedData.val());
                getWeather(searchHistory[i]);
            })
            historyItemsEl.append(historyItem);
        }
    }
}

function getWeather(cityName){
    let query = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + myKey;

    fetch(query)
      .then(function(response) {
          //parse response
        return response.json();
      })
      .then(function(response) {
          //get date from data
          cityEl.text(response.name + " (" + getDate(response.dt) + ") ");
          let weatherIcon = response.weather[0].icon;
          //gets icon image from api request
          weatherIconEl.attr("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@4x.png");
          weatherIconEl.attr("alt",response.weather[0].description);
          //convert temp
          tempEl.text("Temperature: " + tempConvert(response.main.temp) + " °F");
          humidEl.text("Humidity: " + response.main.humidity + "%");
          windEl.text("Wind Speed: " + response.wind.speed + " MPH");
          //get uv index using lat and lon data from api
           let lat = response.coord.lat;
           let lon = response.coord.lon;
           //fetch uvIndex from api endpoint
           let uvQuery = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" + "&appid=" + myKey;
           console.log(uvQuery);
           fetch(uvQuery)
             .then(function(uvResponse) {
                 //parse response
                 return uvResponse.json();
             })
             .then(function(uvResponse) {
                $('.badge').remove();
                let uvIndex = $('<span>');
                uvIndex.addClass('badge red')
                uvIndex.text(uvResponse.current.uvi);
                uvEl.append(uvIndex);

                //remove forecast then render it
                let prevCardEl = document.querySelectorAll(".card-panel")

                for(i = 0; i < prevCardEl.length; i++){
                    $('.card-panel').remove();
                }

                //5 day forecast
                 console.log(uvResponse.daily);
                 let dataArry = uvResponse.daily;
                 for(let i = 0; i < 5; i++){
                     console.log(dataArry[i])
                     let dataIcon = "https://openweathermap.org/img/wn/" + dataArry[i].weather[0].icon + "@2x.png";
                     createForecast(getDate(dataArry[i].dt), dataIcon, tempConvert(dataArry[i].temp.day), dataArry[i].humidity, dataArry[i].wind_speed);
                 }
             });
      });
}


function createForecast(date, icon, temp, humidity, windSpeed) {
    // HTML card elements
    let fiveDayCardEl = $("<div>").addClass("card-panel light-blue");
    let cardDate = $("<h3>").addClass("card-title");
    let cardIcon = $("<img>").addClass("weatherIcon");
    let cardTemp = $("<p>").addClass("card-action");
    let cardHumid = $("<p>").addClass("card-text");
    let cardWind = $("<p>").addClass("card-text");

    cardRow.append(fiveDayCardEl);
    cardDate.text(date);
    cardIcon.attr("src", icon);
    cardTemp.text(`Temp: ${temp} °F`);
    cardHumid.text(`Humidity: ${humidity}%`);
    cardWind.text(`Wind Speed: ${windSpeed} MPH`);
    fiveDayCardEl.append(cardDate, cardIcon, cardTemp, cardHumid, cardWind);
}

$(document).ready(function() {
    //on page load, load last searched city as placeholder
    dispSearchHist();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
});