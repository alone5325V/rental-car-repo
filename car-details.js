document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const carId = params.get('id');

    if (!carId) {
        console.warn("No car ID provided.");
        document.getElementById('loading-overlay').textContent = "No car ID provided in URL.";
        return;
    }

    // 1. Initialize Supabase (REPLACE WITH YOUR ACTUAL URL AND ANON KEY)
    const SUPABASE_URL = 'https://kshpzepziymekpfyvpyr.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaHB6ZXB6aXltZWtwZnl2cHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Njg4NjksImV4cCI6MjA4NjU0NDg2OX0.cf-HVfuRL18v9cdroBPamF6YQxAEaKYQ4aLDxrkvk7o';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Helper: Get public image URL
    function getImageUrl(imagePath) {
        if (!imagePath) return 'placeholder.jpg';
        const { data } = supabase.storage.from('car-photos').getPublicUrl(imagePath);
        return data.publicUrl;
    }

    // 2. Fetch specific car by ID
    async function fetchCarDetails() {
        try {
            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .eq('id', carId)
                .single(); // Use single() to get an object instead of an array

            if (error) throw error;
            if (!data) {
                document.getElementById('loading-overlay').textContent = "Car not found in database.";
                return;
            }

            populatePage(carId, data);
        } catch (err) {
            console.error('Error loading from Supabase:', err);
            document.getElementById('loading-overlay').textContent = "Error loading data.";
        }
    }

    fetchCarDetails();

    function populatePage(id, data) {
        // Reconstruct the "info" object so your old loop works perfectly
        const info = {
            "Car Name": data.car_name,
            "Car Model": data.car_model,
            "Vehicle Type": data.vehicle_type,
            "Body Color": data.body_color,
            "Capacity(Persons)": data.capacity,
            "Dimensions": data.dimensions,
            "Mission": data.mission,
            "Fuel Type": data.fuel_type,
            "Engine Displacement": data.engine_displacement,
            "Standard Equipment": data.standard_equipement || [],
            "Safety Equipment": data.safety_equipment || [],
            "No Smoking/ Smoking": data.smoking_allowed ? "Smoking Allowed" : "No Smoking"
        };

        // Fallback to empty object if pricing is null
        const pricing = data.pricing || {};

        // --- A. Fill Header ---
        const imagePath = Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null;
        document.getElementById('hero-image').src = getImageUrl(imagePath);

        document.getElementById('car-model').textContent = info["Car Model"] || info["Car Name"];
        document.getElementById('vehicle-type-tag').textContent = info["Vehicle Type"] || 'Standard';
        document.getElementById('car-subtitle').textContent = `${info["Body Color"] || 'N/A'} | ${info["Capacity(Persons)"] || '-'} Persons`;

        // --- B. Fill Pricing Table (Unchanged logic) ---
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

        // --- C. Fill Info Table  ---
        const infoBody = document.getElementById('info-body');
        infoBody.innerHTML = '';

        for (const [key, value] of Object.entries(info)) {
            // Skip empty/null fields for a cleaner UI
            if (value === null || value === "") continue;

            let displayValue = value;

            if (Array.isArray(value)) {
                if (value.length === 0) continue; // Skip empty arrays
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
});