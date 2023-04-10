let searchInput = document.querySelector(".weatherSearch");
let city = document.querySelector(".weatherCity");
let day = document.querySelector(".weatherDay");
let weatherCityFav = document.querySelector(".weatherCityFav");
let homeCityCondition = document.querySelector(".weatherNow>.value");
let humidity = document.querySelector(".weatherIndicatorHumidity>.value");
let wind = document.querySelector(".weatherIndicatorWind>.value");
let pressure = document.querySelector(".weatherIndicatorPressure>.value");
let image = document.querySelector(".weatherImage");
let temperature = document.querySelector(".weatherTemperature>.value");
let forecastBlock = document.querySelector(".weatherForecast");
let otherCitiesForecastBlock = document.querySelector(".weatherForecastOtherCities");
let favoriteCitiesForecastBlock = document.querySelector(".weatherForecastFavoriteCities");
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
const cities = ["Bucharest", "London", "Paris", "Madrid", "Budapest", "Amsterdam", "Lisbon"];

let getWeatherByCityName = async (city) => {
    // This function gets the weather details for the current day (based on the city name)

    let endpoint = weatherBaseEndpoint + "&q=" + city;
    let response = await fetch(endpoint);

    let weather = await response.json();
    return weather;
};

let getWeatherByCoordinates = async (lat, lng) => {
    // This function gets the weather details based on latitude & longitude

    let endpoint = weatherBaseEndpoint + "&lat=" + lat + "&lon=" + lng;
    let response = await fetch(endpoint);

    let weather = await response.json();
    return weather;
};

let getForecastByCityID = async (id) => {
    // this function gets the weather forecast based on the cityID and stores it into an array

    let endpoint = forecastBaseEndpoint + "&id=" + id;
    let result = await fetch(endpoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach((day) => {
        let date = new Date(day.dt_txt.replace(" ", "T"));
        let hours = date.getHours();
        if (hours === 12) {
            daily.push(day);
        }
    });
    return daily;
};

let homeCityWeather = async (city) => {
    let weather = await getWeatherByCityName(city);
    if (weather.cod === "404") {
        alert("City not found, please try again!");
        return;
    }
    let cityID = weather.id;
    updateCurrentWeather(weather);
    let forecast = await getForecastByCityID(cityID);
    updateForecast(forecast);
};

let otherCitiesWeather = async () => {
    // This function gets the current weather for 3 different random cities from an initial array of cities
    otherCitiesForecastBlock.innerHTML = "";
    cities.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
        const city = cities[i];
        let weather = await getWeatherByCityName(city);
        updateOtherCitiesForecast(weather);
    }
};

let favoriteCitiesWeather = async () => {
    favoriteCitiesForecastBlock.innerHTML = "";
    const currentFavCities = getCookie("favCities")
        .split(",")
        .filter((item) => item != "");
    for (let i = 0; i < currentFavCities.length; i++) {
        const city = currentFavCities[i];
        let weather = await getWeatherByCityName(city);
        getFavoriteCitiesForecast(weather);
    }
};

// Browser cookies utils - start
const setCookie = (name, value, days = 7, path = "/") => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=" + path;
};

const getCookie = (name) => {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, "");
};

const deleteCookie = (name, path) => {
    setCookie(name, "", -1, path);
};
// Browser cookies utils - end

let handleAddRemoveFromFavorites = async (city) => {
    // handle update cookies
    const cookie = getCookie("favCities");

    if (!cookie || cookie.length === 0) {
        setCookie("favCities", city);
    } else {
        let currentFavs = cookie.split(",");
        if (currentFavs.includes(city)) {
            currentFavs = currentFavs.filter((favCity) => favCity !== city);
            if (currentFavs.length === 0) {
                deleteCookie("favCities");
            } else {
                setCookie("favCities", currentFavs.join());
            }
        } else {
            currentFavs.push(city);
            setCookie("favCities", currentFavs.join());
        }
    }

    await favoriteCitiesWeather();

    // handle update favorites icon for each city based on favorites cities
    const currentFavCities = getCookie("favCities").split(",");
    const elements = document.querySelectorAll(".weatherForecastFavorites");
    for (let i = 0; i < elements.length; i++) {
        if (currentFavCities.includes(elements[i].getAttribute("city"))) {
            elements[i].classList.add("favorite");
        } else {
            elements[i].classList.remove("favorite");
        }
    }

    // handle update favorite icon for current city
    const currentCityFavIcon = document.querySelectorAll(".weatherCityFav")[0];
    if (currentFavCities.includes(currentCityFavIcon.getAttribute("city"))) {
        currentCityFavIcon.classList.add("favorite");
    } else {
        currentCityFavIcon.classList.remove("favorite");
    }
};

let currentLocationWeather = async () => {
    // This function gets the latitude and longitude for current user
    let opts = {
        enableHighAccuracy: true,
        maximumAge: 1000 * 60 * 5,
    };
    navigator.geolocation.getCurrentPosition(getCurrentLocationSuccess, getCurrentLocationError, opts);
};

let getCurrentLocationSuccess = async (position) => {
    // If latitude and longitude are successfully retrieved, makes a request to get current weather based on coordinates
    const weather = await getWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
    const cityID = weather.id;
    updateCurrentWeather(weather);
    const forecast = await getForecastByCityID(cityID);
    updateForecast(forecast);

    document.body.style.filter = "blur(0)";
    document.getElementById("preloader-container").style.display = "none";
};

let getCurrentLocationError = (err) => {
    // This function logs an error message if latitude and longitude cannot be retrieved
    // geolocation failed
    console.error("Geolocation failed: ", err);
    document.body.style.filter = "blur(0)";
    document.getElementById("preloader-container").style.display = "none";
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

    handleFavoriteIcon(data.name);

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

let handleFavoriteIcon = (city) => {
    // remove all existing fav icons
    const elems = document.querySelectorAll(".weatherCityFav");
    elems.forEach((elem) => {
        elem.remove();
    });

    // create fav icon element for current city and add onClick event to Add / Remove from favorites
    const favIconContainer = document.createElement("p");
    favIconContainer.classList.add("weatherForecastFavorites");
    favIconContainer.classList.add("relative");
    favIconContainer.classList.add("weatherCityFav");
    const starIcon = document.createElement("i");
    starIcon.classList.add("star");
    favIconContainer.appendChild(starIcon);
    document.querySelector(".weatherCityContainer").appendChild(favIconContainer);
    favIconContainer.addEventListener("click", () => handleAddRemoveFromFavorites(city), false);

    favIconContainer.setAttribute("city", city);
    const currentFavCities = getCookie("favCities").split(",");
    if (currentFavCities.includes(city)) {
        favIconContainer.classList.add("favorite");
    } else {
        favIconContainer.classList.remove("favorite");
    }
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
            windDirectionForecast = "E";
        } else if (degForecast > 135 && degForecast <= 225) {
            windDirectionForecast = "S";
        } else if (degForecast > 225 && degForecast <= 315) {
            windDirectionForecast = "W";
        } else {
            windDirectionForecast = "N";
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

let updateOtherCitiesForecast = (cityWeather) => {
    // For each city, set current weather details
    let iconUrl = "http://openweathermap.org/img/wn/" + cityWeather.weather[0].icon + "@2x.png";
    let temperature = cityWeather.main.temp > 0 ? "+" + Math.round(cityWeather.main.temp) : Math.round(cityWeather.main.temp);

    let item = document.createElement("article");
    item.classList.add("weatherForecastItemOtherCity");

    let forecastItem = `
    <div class="weatherForecastItemOtherCityData">
      <p class="weatherForecastCity">${cityWeather.name}</p>
      <img src="${iconUrl}" alt="${cityWeather.weather[0].description}" class="weatherForecastIcon" />
      <p class="weatherForecastItemDescription">${cityWeather.weather[0].description}</p>
      <p class="weatherForecastTemperature"><span class="value">${temperature}</span> &deg;C</p>
    </div>`;

    item.insertAdjacentHTML("beforeend", forecastItem);
    otherCitiesForecastBlock.appendChild(item);

    item.getElementsByTagName("div")[0].addEventListener(
        "click",
        () => {
            homeCityWeather(cityWeather.name);
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        false
    );

    const currentFavCities = getCookie("favCities").split(",");
    if (currentFavCities.includes(cityWeather.name)) {
        item.firstElementChild.classList.add("favorite");
    }
};

let getFavoriteCitiesForecast = (cityWeather) => {
    // For each city, set current weather details
    let iconUrl = "http://openweathermap.org/img/wn/" + cityWeather.weather[0].icon + "@2x.png";
    let temperature = cityWeather.main.temp > 0 ? "+" + Math.round(cityWeather.main.temp) : Math.round(cityWeather.main.temp);

    let item = document.createElement("article");
    item.classList.add("weatherForecastItemOtherCity");

    let forecastItem = `
    <p class="weatherForecastFavorites" city="${cityWeather.name}"><i class="star"></i></p>
    <div class="weatherForecastItemOtherCityData">
      <p class="weatherForecastCity">${cityWeather.name}</p>
      <img src="${iconUrl}" alt="${cityWeather.weather[0].description}" class="weatherForecastIcon" />
      <p class="weatherForecastItemDescription">${cityWeather.weather[0].description}</p>
      <p class="weatherForecastTemperature"><span class="value">${temperature}</span> &deg;C</p>
    </div>`;

    item.insertAdjacentHTML("beforeend", forecastItem);
    favoriteCitiesForecastBlock.appendChild(item);

    item.firstElementChild.addEventListener("click", () => handleAddRemoveFromFavorites(cityWeather.name), false);

    item.getElementsByTagName("div")[0].addEventListener(
        "click",
        () => {
            homeCityWeather(cityWeather.name);
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        false
    );

    const currentFavCities = getCookie("favCities").split(",");
    if (currentFavCities.includes(cityWeather.name)) {
        item.firstElementChild.classList.add("favorite");
    }
};

let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString("en-EN", { weekday: "long" });
};

let init = async () => {
    await currentLocationWeather();
    await otherCitiesWeather();
    await favoriteCitiesWeather();
};

init();
