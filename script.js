let searchInput = document.querySelector(".weatherSearch");
let city = document.querySelector(".weatherCity");
let day = document.querySelector(".weatherDay");
let homeCityCondition = document.querySelector(".weatherNow>.value");
let humidity = document.querySelector(".weatherIndicatorHumidity>.value");
let wind = document.querySelector(".weatherIndicatorWind>.value");
let pressure = document.querySelector(".weatherIndicatorPressure>.value");
let image = document.querySelector(".weatherImage");
let temperature = document.querySelector(".weatherTemperature>.value");
let forecastBlock = document.querySelector(".weatherForecast");
let weatherAPIKey = "bc14a4b5c3bcfae5f905abd7f636b20f";
let weatherBaseEndpoint = "https://api.openweathermap.org/data/2.5/weather?units=metric&appid=" + weatherAPIKey;
let forecastBaseEndpoint = "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" + weatherAPIKey; // 5 day forecast which includes weather data for every 3 hours

let weatherImages = [
    {
        url: "images/clear-sky.svg",
        ids: [800],
    },
    {
        url: "images/broken-clouds.svg",
        ids: [803, 804],
    },
    {
        url: "images/few-clouds.svg",
        ids: [801],
    },
    {
        url: "images/broken-clouds.svg",
        ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
    },
    {
        url: "images/rain.svg",
        ids: [500, 501, 502, 503, 504],
    },
    {
        url: "images/broken-clouds.svg",
        ids: [802],
    },
    {
        url: "images/shower-rain.svg",
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321],
    },
    {
        url: "images/snow.svg",
        ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
    },
    {
        url: "images/thunderstorm.svg",
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
    },
];

let getWeatherByCityName = async (city) => {
    // This function gets the weather details for the current day (based on the city name)

    let endpoint = weatherBaseEndpoint + "&q=" + city;
    let response = await fetch(endpoint);

    let weather = await response.json();
    // console.log(response);
    // console.log(weather);
    return weather;
};

// getWeatherByCityName("Mumbai");
// getWeatherByCityName("Dubai");

let getForecastByCityID = async (id) => {
    // this function gets the weather forecast based on the cityID and stores it into an array

    let endpoint = forecastBaseEndpoint + "&id=" + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    // console.log(forecast);
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach((day) => {
        let date = new Date(day.dt_txt.replace(" ", "T"));
        let hours = date.getHours();
        if (hours === 12) {
            daily.push(day);
        }
    });
    console.log(daily);
    return daily;
};

let homeCityWeather = async (city) => {
    let weather = await getWeatherByCityName(city);
    // console.log(weather);
    if (weather.cod === "404") {
        alert("City not found, please try again!");
        return;
    }
    let cityID = weather.id;
    updateCurrentWeather(weather);
    let forecast = await getForecastByCityID(cityID);
    updateForecast(forecast);
};

searchInput.addEventListener("keydown", async (e) => {
    if (e.keyCode === 13) {
        homeCityWeather(searchInput.value);
        e.currentTarget.value = "";
    }
});

let updateCurrentWeather = (data) => {
    //function which updates the current weather data

    city.textContent = data.name + ", " + data.sys.country;
    day.textContent = dayOfWeek();
    homeCityCondition.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;

    let windDirection;
    let deg = data.wind.deg;
    if (deg > 45 && deg <= 135) {
        windDirection = "East";
    } else if (deg > 135 && deg <= 225) {
        windDirection = "South";
    } else if (deg > 225 && deg <= 315) {
        windDirection = "West";
    } else {
        windDirection = "North";
    }
    wind.textContent = windDirection + ", " + data.wind.speed;

    temperature.textContent = data.main.temp > 0 ? "+" + Math.round(data.main.temp) : Math.round(data.main.temp);

    let imgID = data.weather[0].id;
    weatherImages.forEach((object) => {
        if (object.ids.includes(imgID)) {
            image.src = object.url;
        }
    });
};

let updateForecast = (forecast) => {
    // function updates the weather data for the 5 day forecast

    forecastBlock.innerHTML = "";
    forecast.forEach((day) => {
        let iconUrl = "http://openweathermap.org/img/wn/" + day.weather[0].icon + "@2x.png";
        let dayName = dayOfWeek(day.dt * 1000);

        let temperature = day.main.temp > 0 ? "+" + Math.round(day.main.temp) : Math.round(day.main.temp);

        let humidityForecast = day.main.humidity;
        let pressureForecast = day.main.pressure;
        let windSpeedForecast = day.wind.speed;

        let windDirectionForecast;
        let degForecast = day.wind.deg;
        if (degForecast > 45 && degForecast <= 135) {
            windDirectionForecast = "East";
        } else if (degForecast > 135 && degForecast <= 225) {
            windDirectionForecast = "South";
        } else if (degForecast > 225 && degForecast <= 315) {
            windDirectionForecast = "West";
        } else {
            windDirectionForecast = "North";
        }

        let forecastItem = `
        <article class="weatherForecastItem">
            <img src="${iconUrl}" alt="${day.weather[0].description}" class="weatherForecastIcon" />
            <h3 class="weatherForecastDay">${dayName}</h3>
            <p class="weatherForecastTemperature"><span class="value">${temperature}</span> &deg;C</p>            
            <p class="weatherIndicator weatherIndicatorHumidity"><span class="value">${humidityForecast}</span>%</p>
            <p class="weatherIndicator weatherIndicatorWind"><span class="value">${windDirectionForecast}, ${windSpeedForecast}</span>m/s</p>
            <p class="weatherIndicator weatherIndicatorPressure"><span class="value">${pressureForecast}</span>hPa</p>
        </article>`;

        forecastBlock.insertAdjacentHTML("beforeend", forecastItem);
    });
};

let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString("en-EN", { weekday: "long" });
};

let init = async () => {
    await homeCityWeather("Cluj-Napoca");
    document.body.style.filter = "blur(0)";
};
init();
