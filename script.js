const apiKey = "00f515fd53a31cafd9607a9c3bdb9f70";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const leftPanel = document.querySelector(".left-panel");
const forecastList = document.querySelector("#forecast-list");

// We need to save the data globally so we can switch tabs without re-fetching
let globalForecastData = []; 

async function checkWeather(city) {
    try {
        const response = await fetch(weatherUrl + city + `&appid=${apiKey}`);
        if (!response.ok) throw new Error("City not found");
        
        const data = await response.json();

        // 1. Update Left Panel (Current Weather)
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        document.querySelector(".desc").innerHTML = data.weather[0].description;
        
        const weatherMain = data.weather[0].main;
        const iconCode = data.weather[0].icon;
        document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        updateBackground(weatherMain);
        
        // 2. Fetch Forecast Data
        getForecast(city);

    } catch (error) {
        alert("City not found! Please check the spelling.");
    }
}

async function getForecast(city) {
    const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    const data = await response.json();
    globalForecastData = data.list; // Save data for toggling

    // Show Hourly by default
    showHourly(); 
}

// --- TAB SWITCHING FUNCTIONS ---

function showHourly() {
    // 1. Highlight the correct tab
    document.querySelectorAll(".tab-btn")[0].classList.add("active");
    document.querySelectorAll(".tab-btn")[1].classList.remove("active");

    // 2. Filter Data: Get next 8 items (approx 24 hours)
    const hourlyData = globalForecastData.slice(0, 8);
    
    // 3. Render List
    forecastList.innerHTML = "";
    hourlyData.forEach(item => {
        const time = new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(item.main.temp) + "°C";
        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;

        const html = `
            <div class="list-item">
                <p class="item-time">${time}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png">
                <p class="item-desc">${desc}</p>
                <p class="item-temp">${temp}</p>
            </div>
        `;
        forecastList.innerHTML += html;
    });
}

function showWeekly() {
    // 1. Highlight the correct tab
    document.querySelectorAll(".tab-btn")[0].classList.remove("active");
    document.querySelectorAll(".tab-btn")[1].classList.add("active");

    // 2. Filter Data: Get one reading per day (12:00 PM)
    const weeklyData = globalForecastData.filter(item => item.dt_txt.includes("12:00:00"));

    // 3. Render List
    forecastList.innerHTML = "";
    weeklyData.forEach(item => {
        const date = new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const temp = Math.round(item.main.temp) + "°C";
        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;

        const html = `
            <div class="list-item">
                <p class="item-time" style="width:120px">${date}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png">
                <p class="item-desc">${desc}</p>
                <p class="item-temp">${temp}</p>
            </div>
        `;
        forecastList.innerHTML += html;
    });
}

function updateBackground(weather) {
    // Dynamic Gradient based on weather
    if (weather === "Clear") {
        leftPanel.style.background = "linear-gradient(135deg, #fce38a, #f38181)";
    } else if (weather === "Clouds") {
        leftPanel.style.background = "linear-gradient(135deg, #5c6bc0, #512da8)";
    } else if (weather === "Rain") {
        leftPanel.style.background = "linear-gradient(135deg, #243b55, #141e30)";
    } else if (weather === "Drizzle") {
        leftPanel.style.background = "linear-gradient(135deg, #4ca1af, #c4e0e5)";
    } else if (weather === "Mist") {
        leftPanel.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
    } else {
        leftPanel.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
    }
}

// Event Listeners
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keydown", (e) => {
    if(e.key === "Enter") checkWeather(searchBox.value);
});

// ... (Keep all your existing code above) ...

// NEW: Function to get user's location automatically
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Success! We got the coordinates
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Now call the API with coordinates instead of city name
                checkWeatherByCoords(lat, lon);
            },
            (error) => {
                // Error (User denied permission or location failed)
                console.log("Geolocation error:", error);
                alert("Please allow location access or search for a city manually.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// NEW: Function to fetch weather using Latitude & Longitude
async function checkWeatherByCoords(lat, lon) {
    // Note: We use a slightly different URL for coordinates
    const coordsUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastUrlCoords = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(coordsUrl);
        const data = await response.json();

        // 1. Update Left Panel (Current Weather)
        document.querySelector(".city").innerHTML = data.name; // API gives us the city name for coords!
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
        document.querySelector(".desc").innerHTML = data.weather[0].description;
        
        const weatherMain = data.weather[0].main;
        const iconCode = data.weather[0].icon;
        document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        updateBackground(weatherMain); // Use your existing background function

        // 2. Fetch Forecast Data (We need a similar fetch for the forecast endpoint)
        const forecastResponse = await fetch(forecastUrlCoords);
        const forecastData = await forecastResponse.json();
        
        globalForecastData = forecastData.list; // Save data for toggling
        showHourly(); // Show the list

    } catch (error) {
        console.error("Error fetching weather by coords:", error);
    }
}

// CALL THIS FUNCTION AUTOMATICALLY ON PAGE LOAD
getUserLocation();