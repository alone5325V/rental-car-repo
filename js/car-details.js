document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const carId = params.get('id');

    if (!carId) {
        // If accessed directly without ID, gentle redirect or alert
        console.warn("No car ID provided.");
        document.getElementById('loading-overlay').textContent = "No car ID provided in URL.";
        return;
    }

    // Fetching JSON data
    fetch('cars.json')
        .then(response => response.json())
        .then(data => {
            // Safety check if carId exists
            const carData = carId ? data[carId] : null;

            if (!carData) {
                document.getElementById('loading-overlay').textContent = "Car not found in database.";
                return;
            }

            populatePage(carId, carData);
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
            document.getElementById('loading-overlay').textContent = "Error loading data.";
        });
});

function populatePage(id, data) {
    const info = data.info;
    const pricing = data.pricing;

    // --- A. Fill Header (UPDATED) ---
    const imageSource = Array.isArray(data.image) ? data.image[0] : data.image;

    if (imageSource) {
        document.getElementById('hero-image').src = imageSource;
    } else {
        document.getElementById('hero-image').src = 'placeholder.jpg';
    }

    document.getElementById('car-model').textContent = info["Car Model"];
    document.getElementById('vehicle-type-tag').textContent = info["Vehicle Type"];
    document.getElementById('car-subtitle').textContent = `${info["Body Color"]} | ${info["Capacity(Persons)"]} Persons`;

    // --- B. Fill Pricing Table ---
    const pricingBody = document.getElementById('pricing-body');
    pricingBody.innerHTML = '';

    const durationKeys = [
        "same-day rates", "2 days and 1 night", "3 days and 2 nights", "3 nights and 4 days", "4 nights and 5 days"
    ];

    const createPriceRow = (seasonName, seasonData, color) => {
        let rowHtml = `<tr><td style="font-weight:bold; color:${color};">${seasonName}</td>`;
        durationKeys.forEach(key => {
            const price = seasonData[key] ? "¥" + seasonData[key].toLocaleString() : "-";
            rowHtml += `<td class="price-val">${price}</td>`;
        });
        rowHtml += `</tr>`;
        return rowHtml;
    };

    if (pricing["OFF season"]) {

        pricingBody.innerHTML += createPriceRow("OFF SEASON", pricing["OFF season"], "#1A2B4C");
    }
    if (pricing["Top season"]) {
        pricingBody.innerHTML += createPriceRow("TOP SEASON", pricing["Top season"], "#C5A059");
    }

    // --- C. Fill Info Table ---
    const infoBody = document.getElementById('info-body');
    infoBody.innerHTML = '';

    for (const [key, value] of Object.entries(info)) {
        let displayValue = value;

        if (Array.isArray(value)) {
            displayValue = value.map(item => `<span class="equip-badge">${item}</span>`).join('');
        }

        if (key === "No Smoking/ Smoking" && value.includes("No")) {
            displayValue = `<span style="color: #d9534f;"><i class="fas fa-ban"></i> ${value}</span>`;
        }

        const row = `
                    <tr>
                        <td class="key-col">${key}</td>
                        <td>${displayValue}</td>
                    </tr>
                `;
        infoBody.innerHTML += row;
    }

    // --- LOGIC TO CONNECT TO RESERVATION PAGE ---
    const reserveLink = document.getElementById('reserve-link');
    if (reserveLink) {
        reserveLink.href = `reservation.html?id=${id}`;
    }

    // --- D. Reveal Page ---
    document.getElementById('loading-overlay').style.display = 'none';
    document.getElementById('main-content').style.opacity = '1';
}