let map;
let pickupLatLng = null;
let dropLatLng = null;
let directionsService;
let directionsRenderer;

function initMap() {
  const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: defaultLocation,
  });

  // Services for routing
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Autocomplete setup
  const pickupInput = document.getElementById("pickup");
  const dropInput = document.getElementById("drop");

  const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
    componentRestrictions: { country: "in" },
  });
  const dropAutocomplete = new google.maps.places.Autocomplete(dropInput, {
    componentRestrictions: { country: "in" },
  });

  pickupAutocomplete.addListener("place_changed", () => {
    const place = pickupAutocomplete.getPlace();
    pickupLatLng = place.geometry?.location;
  });

  dropAutocomplete.addListener("place_changed", () => {
    const place = dropAutocomplete.getPlace();
    dropLatLng = place.geometry?.location;
  });

  // Autofill pickup with current location (optional)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const latlng = { lat, lng };
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          pickupInput.value = results[0].formatted_address;
          pickupLatLng = latlng;
        }
      });
    });
  }
}

document.getElementById("rideForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const pickup = document.getElementById("pickup").value;
  const drop = document.getElementById("drop").value;

  if (!pickup || !drop || !pickupLatLng || !dropLatLng) {
    alert("Please enter both pickup and drop locations.");
    return;
  }

  // Draw route
  directionsService.route(
    {
      origin: pickupLatLng,
      destination: dropLatLng,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);

        // Distance & duration
        const route = response.routes[0].legs[0];
        const distanceText = route.distance.text;
        const durationText = route.duration.text;
        const distanceValue = route.distance.value / 1000; // meters to km

        // Fare Estimation (basic example: ₹15/km + ₹20 base fare)
        const fare = Math.round(20 + distanceValue * 15);

        // Store booking in localStorage
        const rideData = {
          pickup,
          drop,
          distance: distanceText,
          duration: durationText,
          fare: `₹${fare}`,
          timestamp: new Date().toISOString(),
        };

        let bookings = JSON.parse(localStorage.getItem("sreedaarviBookings")) || [];
        bookings.push(rideData);
        localStorage.setItem("sreedaarviBookings", JSON.stringify(bookings));

        alert(`Ride booked from ${pickup} to ${drop}
Distance: ${distanceText}
ETA: ${durationText}
Fare: ₹${fare}`);
      } else {
        alert("Route could not be calculated: " + status);
      }
    }
  );
});
