async function handleBooking() {
  const pickup = document.getElementById("pickup").value;
  const drop = document.getElementById("drop").value;
  const vehicle = document.getElementById("vehicleType").value;
  const plate = document.getElementById("plateType").value;

  if (!pickup || !drop) return alert("Please enter both locations.");
  if (plate === "White" && vehicle !== "Bike") return alert("White plates only allowed for bikes.");

  const from = await geocode(pickup);
  const to = await geocode(drop);
  if (!from || !to) return alert("Invalid pickup or drop location.");

  if (control) control.remove();
  map.setView(from, 13);

  const iconUrl = vehicle === 'Bike'
    ? 'assets/icons/bike.png'
    : vehicle === 'Auto'
    ? 'assets/icons/auto.png'
    : 'assets/icons/car.png';

  const vehicleIcon = L.icon({ iconUrl, iconSize: [32, 32], iconAnchor: [16, 32] });

  L.marker(from, { icon: vehicleIcon }).addTo(map);
  L.marker(to).addTo(map);

  control = L.Routing.control({
    waypoints: [L.latLng(...from), L.latLng(...to)],
    routeWhileDragging: false
  }).addTo(map);

  control.on('routesfound', function (e) {
    const route = e.routes[0];
    const distance = route.summary.totalDistance / 1000;
    const time = route.summary.totalTime / 60; // in minutes
    const fare = calculateFare(distance, vehicle);

    document.getElementById("fareOutput").innerText =
      `Distance: ${distance.toFixed(2)} km | Time: ${time.toFixed(0)} mins | Fare: ₹${fare}`;

    saveRide({ pickup, drop, vehicle, plate, fare });
  });
}
