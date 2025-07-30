document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationInfoDiv = document.getElementById('locationInfo');
    const messageBox = document.getElementById('messageBox');
    const messageBoxContent = messageBox.querySelector('.message-box');

    // Function to display messages in the custom message box
    function showMessage(message, type = 'info') {
        messageBoxContent.textContent = message;
        messageBoxContent.className = `message-box ${type}`; // Set class for styling (info, success, error)
        messageBox.classList.remove('d-none'); // Show the message box
    }

    // Function to hide the message box
    function hideMessage() {
        messageBox.classList.add('d-none'); // Hide the message box
    }

    // Function to fetch IP address and then location details
    async function fetchLocation() {
        hideMessage(); // Hide any previous messages
        showMessage('Fetching your location...', 'info');

        try {
            // 1. Get the user's IP address
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (!ipResponse.ok) {
                throw new Error(`HTTP error! status: ${ipResponse.status}`);
            }
            const ipData = await ipResponse.json();
            const ipAddress = ipData.ip;

            // 2. Use the IP address to get location details from ip-api.com
            // Note: The user provided an API key for Google Maps, but ip-api.com does not require one for basic lookups.
            // If a more robust IP geolocation service requiring an API key were used, it would be included here.
            const locationResponse = await fetch(`http://ip-api.com/json/${ipAddress}`);
            if (!locationResponse.ok) {
                throw new Error(`HTTP error! status: ${locationResponse.status}`);
            }
            const locationData = await locationResponse.json();

            if (locationData.status === 'success') {
                document.getElementById('latitude').textContent = locationData.lat;
                document.getElementById('longitude').textContent = locationData.lon;
                document.getElementById('city').textContent = locationData.city;
                document.getElementById('state').textContent = locationData.regionName;
                document.getElementById('country').textContent = locationData.country;

                locationInfoDiv.classList.remove('d-none'); // Show the location info block
                showMessage('Location found successfully!', 'success');

                // Initialize and display the map
                initMap(locationData.lat, locationData.lon);

            } else {
                throw new Error(`Location API error: ${locationData.message}`);
            }

        } catch (error) {
            console.error('Error fetching location:', error);
            showMessage(`Failed to retrieve location: ${error.message}. Please try again later.`, 'error');
            locationInfoDiv.classList.add('d-none'); // Hide the location info block on error
        }
    }

    // Google Maps Initialization
    let map;
    let marker;

    async function initMap(lat, lon) {
        // The API key is provided by the user: AIzaSyCKpvVvZeGOVlSYsCbfWVOgh7NgK2fXSyE
        // It's loaded dynamically for security and flexibility.
        const googleMapsApiKey = 'AIzaSyCKpvVvZeGOVlSYsCbfWVOgh7NgK2fXSyE';

        // Load the Google Maps API script dynamically
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMapCallback`;
        script.async = true;
        document.head.appendChild(script);

        // Define the callback function globally or attach to window
        window.initMapCallback = () => {
            const mapOptions = {
                center: { lat: lat, lng: lon },
                zoom: 10, // Adjust zoom level as needed
                mapTypeId: 'roadmap' // Can be 'roadmap', 'satellite', 'hybrid', 'terrain'
            };

            // Check if map container exists
            let mapContainer = document.getElementById('map');
            if (!mapContainer) {
                // If map container doesn't exist, create it
                mapContainer = document.createElement('div');
                mapContainer.id = 'map';
                mapContainer.style.width = '100%';
                mapContainer.style.height = '400px'; // Set a default height
                mapContainer.style.borderRadius = '0.5rem';
                mapContainer.style.marginTop = '1rem';

                const locationInfoCardBody = document.querySelector('#locationInfo .card-body');
                if (locationInfoCardBody) {
                    locationInfoCardBody.appendChild(mapContainer);
                } else {
                    console.error('Could not find location info card body to append map.');
                    return;
                }
            }

            map = new google.maps.Map(mapContainer, mapOptions);

            marker = new google.maps.Marker({
                position: { lat: lat, lng: lon },
                map: map,
                title: 'Your Location'
            });
        };
    }


    // Event listener for the button
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', fetchLocation);
    } else {
        console.error('Get Location button not found!');
    }
});


 //final updates