document.addEventListener('DOMContentLoaded', function () {
    let cityText = document.getElementsByClassName('city')[0];
    let tempText = document.getElementsByClassName('temp')[0];
    let conditionText = document.getElementsByClassName('condition')[0];
    let weatherIcon = document.getElementsByClassName('weather-icon')[0];
    let input = document.getElementsByClassName('input')[0];
    let searchButton = document.getElementsByClassName('search-button')[0];
    let gpsButton = document.getElementsByClassName('gps-button')[0];
    let hourlyMainContainer = document.querySelector('.hourly-main-container');

    function handle_search() {
        if (input.value) {
            const city = input.value
            getWeatherData({ city });
        }
    }

    searchButton.addEventListener('click', handle_search);

    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            handle_search();
        }
    });

    gpsButton.addEventListener('click', getLocationAndWeather);

    getLocationAndWeather();

    function getLocationAndWeather() {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherData({ lat, lon });
        });
    }
    async function getWeatherData({ lat, lon, city }) {
        const api = 'd235471cc10b9febda95dead98d2fc1b';
        let request;

        if (city) {
            request = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api}&units=metric`;
        } else {
            request = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api}&units=metric`;
        }

        try {
            const response = await fetch(request);
            if (!response.ok) throw new Error("Weather data not available.");
            const data = await response.json();

            updateWeatherInfo(data, city); // Pass city to the updateWeatherInfo function
            updateHourlyForecast(data.list);

        } catch (error) {
            console.log(error);
            alert('Failed to fetch weather data. Please try again later.');
        }
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
});
