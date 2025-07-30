 
 const getLocationBtn = document.getElementById('getLocationBtn');
 const locationInfoDiv = document.getElementById('locationInfo');
 const latitudeSpan = document.getElementById('latitude');
 const longitudeSpan = document.getElementById('longitude');
 const citySpan = document.getElementById('city');
 const stateSpan = document.getElementById('state');
 const countrySpan = document.getElementById('country');
 const messageBoxContainer = document.getElementById('messageBox');
 const messageBox = messageBoxContainer.querySelector('.message-box');

 
 const API_KEY = '8d2c99b3ed3cafc54ff38b0c9027aaa6';

  
 function showMessage(message, type) {
     messageBox.textContent = message;
     messageBox.classList.remove('d-none', 'info', 'success', 'error'); 
     messageBoxContainer.classList.remove('d-none');

     if (type === 'success') {
         messageBox.classList.add('success');
     } else if (type === 'error') {
         messageBox.classList.add('error');
     } else { 
         messageBox.classList.add('info');
     }
 }


 function clearMessageBox() {
     messageBoxContainer.classList.add('d-none'); 
     messageBox.textContent = '';
     messageBox.classList.remove('info', 'success', 'error');
 }

 async function success(position) {
     clearMessageBox(); 
     const latitude = position.coords.latitude;
     const longitude = position.coords.longitude;

     latitudeSpan.textContent = latitude.toFixed(6);
     longitudeSpan.textContent = longitude.toFixed(6);

    
     showMessage('Fetching detailed location information...', 'info');

     try {
         
         const geoApiUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
         const response = await fetch(geoApiUrl);
         const data = await response.json();

         if (response.ok && data.length > 0) {
             const locationData = data[0];
             citySpan.textContent = locationData.name || 'N/A';
             stateSpan.textContent = locationData.state || 'N/A';
             countrySpan.textContent = locationData.country || 'N/A';
             locationInfoDiv.classList.remove('d-none'); 
             clearMessageBox(); 
             showMessage('Location details retrieved successfully!', 'success');
         } else {
             citySpan.textContent = 'N/A';
             stateSpan.textContent = 'N/A';
             countrySpan.textContent = 'N/A';
             locationInfoDiv.classList.remove('d-none');
             showMessage('Could not retrieve detailed location information from the API.', 'error');
         }
     } catch (error) {
         console.error('Error fetching location details:', error);
         citySpan.textContent = 'N/A';
         stateSpan.textContent = 'N/A';
         countrySpan.textContent = 'N/A';
         locationInfoDiv.classList.remove('d-none');
         showMessage('An error occurred while fetching location details. Please try again.', 'error');
     }
 }


 function error(err) {
     console.warn(`Geolocation ERROR(${err.code}): ${err.message}`);
     locationInfoDiv.classList.add('d-none'); // Hide the location info block on error
     let errorMessage = 'Unable to retrieve your location.';
     switch (err.code) {
         case err.PERMISSION_DENIED:
             errorMessage = 'Location access was denied. Please enable location services for this site in your browser settings.';
             break;
         case err.POSITION_UNAVAILABLE:
             errorMessage = 'Location information is unavailable. Your device might not be able to determine its position.';
             break;
         case err.TIMEOUT:
             errorMessage = 'The request to get user location timed out. Please try again.';
             break;
         case err.UNKNOWN_ERROR:
             errorMessage = 'An unknown error occurred while trying to get your location.';
             break;
     }
     showMessage(errorMessage, 'error');
 }

 
 getLocationBtn.addEventListener('click', () => {
     clearMessageBox(); 
     if (navigator.geolocation) {
         showMessage('Requesting your location...', 'info');
         
         navigator.geolocation.getCurrentPosition(success, error, {
             enableHighAccuracy: true, 
             timeout: 10000,           
             maximumAge: 0             
         });
     } else {
         showMessage('Geolocation is not supported by your browser. Please update or use a different browser.', 'error');
     }
 });

 //final updates