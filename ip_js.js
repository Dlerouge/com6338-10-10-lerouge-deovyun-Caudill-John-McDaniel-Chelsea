document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationInfoDiv = document.getElementById('locationInfo');
    const messageBoxDiv = document.getElementById('messageBox');
    const messageBoxContent = messageBoxDiv.querySelector('.message-box');

    const latitudeSpan = document.getElementById('latitude');
    const longitudeSpan = document.getElementById('longitude');
    const citySpan = document.getElementById('city');
    const stateSpan = document.getElementById('state');
    const countrySpan = document.getElementById('country');

    const API_KEY = '3bf2d8719d95c3ffdd507ee90305830f'; //open weather api

    
    function showMessage(message, type = 'info') {
        messageBoxContent.textContent = message;
        messageBoxContent.className = `message-box ${type}`; 
        messageBoxDiv.classList.remove('d-none');
    }

    
    function hideMessage() {
        messageBoxDiv.classList.add('d-none');
    }

    
    function getUserLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (error) => {
                        let errorMessage = 'Unable to retrieve your location.';
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = 'User denied the request for Geolocation.';
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = 'Location information is unavailable.';
                                break;
                            case error.TIMEOUT:
                                errorMessage = 'The request to get user location timed out.';
                                break;
                            case error.UNKNOWN_ERROR:
                                errorMessage = 'An unknown error occurred.';
                                break;
                        }
                        reject(new Error(errorMessage));
                    }
                );
            } else {
                reject(new Error('Geolocation is not supported by your browser.'));
            }
        });
    }

   
    async function reverseGeocode(latitude, longitude) {
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.length > 0) {
                const location = data[0];
                return {
                    city: location.name,
                    state: location.state || 'N/A',
                    country: location.country
                };
            } else {
                throw new Error('No location data found for the given coordinates.');
            }
        } catch (error) {
            console.error('Error during reverse geocoding:', error);
            throw new Error(`Could not retrieve location details: ${error.message}`);
        }
    }

    
    function displayLocation(locationData) {
        latitudeSpan.textContent = locationData.latitude.toFixed(4);
        longitudeSpan.textContent = locationData.longitude.toFixed(4);
        citySpan.textContent = locationData.city;
        stateSpan.textContent = locationData.state;
        countrySpan.textContent = locationData.country;
        locationInfoDiv.classList.remove('d-none'); 
    }

   
    function storeLocation(locationData) {
        try {
            localStorage.setItem('userLocation', JSON.stringify(locationData));
            console.log('Location stored in local storage:', locationData);
        } catch (e) {
            console.error('Error storing location in local storage:', e);
            showMessage('Could not save location data to local storage.', 'error');
        }
    }

    
    function getStoredLocation() {
        try {
            const storedData = localStorage.getItem('userLocation');
            return storedData ? JSON.parse(storedData) : null;
        } catch (e) {
            console.error('Error retrieving location from local storage:', e);
            return null;
        }
    }

    
    getLocationBtn.addEventListener('click', async () => {
        hideMessage(); 
        showMessage('Fetching your location...', 'info');

        try {
            
            let locationData = getStoredLocation();

            if (locationData) {
                showMessage('Location retrieved from local storage.', 'success');
                displayLocation(locationData);
            } else {
                
                const coords = await getUserLocation();
                const geoData = await reverseGeocode(coords.latitude, coords.longitude);

                locationData = {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    city: geoData.city,
                    state: geoData.state,
                    country: geoData.country
                };

                displayLocation(locationData);
                storeLocation(locationData); 
                showMessage('Location successfully fetched and displayed!', 'success');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(`Error: ${error.message}`, 'error');
            locationInfoDiv.classList.add('d-none'); 
        }
    });

    
    const initialStoredLocation = getStoredLocation();
    if (initialStoredLocation) {
        displayLocation(initialStoredLocation);
        showMessage('Location loaded from previous session.', 'info');
    }
});