document.addEventListener('DOMContentLoaded', function () {
    const cityText = document.querySelector('.city');
    const tempText = document.querySelector('.temp');
    const conditionText = document.querySelector('.condition');
    const weatherIcon = document.querySelector('.weather-icon');
    const input = document.querySelector('.input');
    const searchButton = document.querySelector('.search-button');
    const gpsButton = document.querySelector('.gps-button');
    const hourlyMainContainer = document.querySelector('.hourly-main-container');
    const rainButton = document.querySelector('.rain-button');
    const tempButton = document.querySelector('.temp-button');
    const windButton = document.querySelector('.wind-button');
    const toggleButton = document.getElementById('toggle-units');
    const loadingElement = document.getElementById('loading');
    const api = '5108673f91dfc9438061a113f62b8fca';
    let units = 'metric';
    let lat;
    let lon;
    let currentCity = '';

    const map = L.map('map').setView([51.1913, -114.4678], 10);
    let currentLayer;

    function handle_search() {
        if (input.value) {
            currentCity = input.value;
            getWeatherData({ city: currentCity });
        }
    }

    searchButton.addEventListener('click', handle_search);

    toggleButton.addEventListener('click', function () {
        // Check the current value of units
        // If it's 'metric', change it to 'imperial'
        // Otherwise, change it to 'metric'
        units = (units === 'metric') ? 'imperial' : 'metric';

        // Call the getWeatherData function with the current latitude and longitude
        // and the city (if available)
        getWeatherData({ lat, lon, city: currentCity });
    });

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            handle_search();
        }
    });

    gpsButton.addEventListener('click', function () {
        input.value = ""
        getLocationAndWeather()
    });

    getLocationAndWeather();

    function getLocationAndWeather() {
        navigator.geolocation.getCurrentPosition(function (position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            currentCity = '';  // Clear the city name since using coordinates
            getWeatherData({ lat, lon });
        });
    }

    function showLoading() {
        loadingElement.style.display = 'block';
    }

    function hideLoading() {
        loadingElement.style.display = 'none';
    }

    async function getWeatherData({ lat, lon, city }) {
        showLoading();
        let request;

        if (city) {
            request = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api}&units=${units}`;
        } else if (lat && lon) {
            request = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api}&units=${units}`;
        } else {
            hideLoading();
            alert('Please provide a city name or enable GPS to fetch the weather data.');
            return;
        }

        try {
            const response = await fetch(request);
            if (!response.ok) throw new Error("Weather data not available.");
            const data = await response.json();

            updateWeatherInfo(data, city);
            updateHourlyForecast(data.list);
            setThemeBasedOnTime(data.city.timezone);

            const coordinates = data.city.coord;
            map.setView([coordinates.lat, coordinates.lon], 10);

        } catch (error) {
            console.log(error);
            alert('Failed to fetch weather data. Please try again later.');
        }
        hideLoading();
    }

    function updateWeatherInfo(data, city) {
        if (city) {
            cityText.textContent = capitalize(city);
        } else {
            cityText.textContent = data.city.name || 'Current Location';
        }
        tempText.textContent = Math.round(data.list[0].main.temp) + '°';
        const condition = data.list[0].weather[0].main;
        conditionText.textContent = capitalize(condition);
        weatherIcon.src = `condition_images/${condition.toLowerCase()}.png`;
    }

    function updateHourlyForecast(hourlyData) {
        hourlyMainContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const hour = hourlyData[i];
            const temp = Math.round(hour.main.temp) + '°';
            const icon = `condition_images/${hour.weather[0].main.toLowerCase()}.png`;
            const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const hourlyIndividual = document.createElement('div');
            hourlyIndividual.className = 'hourly-individual';

            const tempDiv = document.createElement('div');
            tempDiv.textContent = temp;

            const iconImg = document.createElement('img');
            iconImg.src = icon;
            iconImg.alt = '';
            iconImg.className = 'hourly-icon';

            const timeDiv = document.createElement('div');
            timeDiv.textContent = time;

            hourlyIndividual.appendChild(tempDiv);
            hourlyIndividual.appendChild(iconImg);
            hourlyIndividual.appendChild(timeDiv);

            hourlyMainContainer.appendChild(hourlyIndividual);
        }
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function setThemeBasedOnTime(timezoneOffset) {
        const now = new Date();
        const localTime = new Date(now.getTime() + timezoneOffset * 1000);
        const hours = localTime.getUTCHours();
        const isDayTime = hours >= 6 && hours <= 18;

        if (isDayTime) {
            document.body.style.background = "linear-gradient(to bottom, #87CEEB, #f0f4f7)";
            document.body.classList.remove('dark-mode');
        } else {
            document.body.style.background = "linear-gradient(to bottom, #2c3e50, #4a6870)";
            document.body.classList.add('dark-mode');
        }
    }

    // Add a base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    function addWeatherLayer(layerType) {
        if (currentLayer) {
            map.removeLayer(currentLayer);
        }
        currentLayer = L.tileLayer(`http://tile.openweathermap.org/map/${layerType}/{z}/{x}/{y}.png?appid=${api}`, {
            maxZoom: 19,
            opacity: 1,
            attribution: '&copy; <a href="https://www.openweathermap.org/">OpenWeatherMap</a>'
        });
        currentLayer.addTo(map);
    }

    rainButton.addEventListener('click', () => addWeatherLayer('precipitation_new'));
    tempButton.addEventListener('click', () => addWeatherLayer('temp_new'));
    windButton.addEventListener('click', () => addWeatherLayer('wind_new'));

    // Initialize the map with a default weather layer
    addWeatherLayer('precipitation_new');
});