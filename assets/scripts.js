let key = "e524bd652acebbfcd0b12ffc52dbf544";
let city = "New York";

let date = moment().format("dddd, MMMM Do YYYY");
let dateTime = moment().format("YYYY-MM-DD HH:MM:SS");

let cityHistory = [];

$(".search").on("click", function (event) {
  event.preventDefault();
  city = $(this).parent(".btnPar").siblings(".textVal").val().trim();
  if (city === "") {
    return;
  }
  cityHistory.push(city);

  localStorage.setItem("city", JSON.stringify(cityHistory));
  fiveForecast.empty();
  getHistory();
  getWeatherToday();
});

let contHist = $(".cityHist");
function getHistory() {
  contHist.empty();

  for (let i = 0; i < cityHistory.length; i++) {
    let row = $("<row>");
    let button = $("<button>").text(`${cityHistory[i]}`);

    row.addClass("row histBtnRow");
    button.addClass("btn btn-outline-secondary histBtn");
    button.attr("type", "button");

    contHist.prepend(row);
    row.append(button);
  }
  if (!city) {
    return;
  }

  $(".histBtn").on("click", function (event) {
    event.preventDefault();
    city = $(this).text();
    fiveForecast.empty();
    getWeatherToday();
  });
}

let cardTodayBody = $(".cardBodyToday");

function getWeatherToday() {
  let getUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${key}`;

  $(cardTodayBody).empty();

  $.ajax({
    url: getUrlCurrent,
    method: "GET",
  }).then(function (response) {
    $(".cardTodayCityName").text(response.name);
    $(".cardTodayDate").text(date);

    $(".icons").attr(
      "src",
      `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
    );

    let Temp = $("<p>").text(`Temperature: ${response.main.temp} °F`);
    cardTodayBody.append(Temp);

    let Feel = $("<p>").text(`Feels Like: ${response.main.feels_like} °F`);
    cardTodayBody.append(Temp);

    let Humid = $("<p>").text(`Humidity: ${response.main.humidity} %`);
    cardTodayBody.append(Humid);

    let wind = $("<p>").text(`Wind Speed: ${response.wind.speed} MPH`);
    cardTodayBody.append(wind);

    let cityLongitude = response.coord.lon;

    let cityLatitude = response.coord.lat;
    let getUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLatitude}&lon=${cityLongitude}&exclude=hourly,daily,minutely&appid=${key}`;

    $.ajax({
      url: getUrl,
      method: "GET",
    }).then(function (response) {
      let pElUvi = $("<p>").text(`UV Index: `);
      let uviSpan = $("<span>").text(response.current.uvi);
      let uvi = response.current.uvi;
      pElUvi.append(uviSpan);
      cardTodayBody.append(pElUvi);

      if (uvi >= 0 && uvi <= 2) {
        uviSpan.attr("class", "green");
      } else if (uvi > 2 && uvi <= 5) {
        uviSpan.attr("class", "yellow");
      } else if (uvi > 5 && uvi <= 7) {
        uviSpan.attr("class", "orange");
      } else if (uvi > 7 && uvi <= 10) {
        uviSpan.attr("class", "red");
      } else {
        uviSpan.attr("class", "purple");
      }
    });
  });
  getFiveDayForecast();
}

let fiveForecast = $(".fiveForecast");

function getFiveDayForecast() {
  let getUrlFiveDay = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${key}`;

  $.ajax({
    url: getUrlFiveDay,
    method: "GET",
  }).then(function (response) {
    let fiveDayArray = response.list;
    let myWeather = [];

    $.each(fiveDayArray, function (index, value) {
      testObj = {
        date: value.dt_txt.split(" ")[0],
        time: value.dt_txt.split(" ")[1],
        temp: value.main.temp,
        feels_like: value.main.feels_like,
        icon: value.weather[0].icon,
        humidity: value.main.humidity,
      };

      if (value.dt_txt.split(" ")[1] === "12:00:00") {
        myWeather.push(testObj);
      }
    });

    for (let i = 0; i < myWeather.length; i++) {
      let divCard = $("<div>");
      divCard.attr("class", "card text-white bg-primary mb-3 cardOne");
      divCard.attr("style", "max-width: 200px;");
      fiveForecast.append(divCard);

      let divHeader = $("<div>");
      divHeader.attr("class", "card-header");
      var m = moment(`${myWeather[i].date}`).format("MM-DD-YYYY");
      divHeader.text(m);
      divCard.append(divHeader);

      let divBody = $("<div>");
      divBody.attr("class", "card-body");
      divCard.append(divBody);

      let divIcon = $("<img>");
      divIcon.attr("class", "icons");
      divIcon.attr(
        "src",
        `https://openweathermap.org/img/wn/${myWeather[i].icon}@2x.png`
      );
      divBody.append(divIcon);

      let pTemp = $("<p>").text(`Temperature: ${myWeather[i].temp} °F`);
      divBody.append(pTemp);

      let pFeel = $("<p>").text(`Feels Like: ${myWeather[i].feels_like} °F`);
      divBody.append(pFeel);

      let pHumid = $("<p>").text(`Humidity: ${myWeather[i].humidity} %`);
      divBody.append(pHumid);
    }
  });
}

function initLoad() {
  let cityHistoryStorage = JSON.parse(localStorage.getItem("city"));

  if (cityHistoryStorage !== null) {
    cityHistory = cityHistoryStorage;
  }
  getHistory();
  getWeatherToday();
}

initLoad();
