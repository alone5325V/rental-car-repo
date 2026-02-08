document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const STORAGE_KEY = 'holiday_cars_db';
    const LOGIN_USER = 'admin';
    const LOGIN_PASS = 'admin123';

    // DOM Elements
    const loginOverlay = document.getElementById('login-overlay');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const addCarForm = document.getElementById('add-car-form');
    const carListBody = document.getElementById('car-list-body');
    const downloadBtn = document.getElementById('download-json-btn');
    const resetBtn = document.getElementById('reset-data-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // --- AUTHENTICATION ---
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('admin-user').value;
        const pass = document.getElementById('admin-pass').value;

        if (user === LOGIN_USER && pass === LOGIN_PASS) {
            sessionStorage.setItem('isLoggedIn', 'true');
            showDashboard();
        } else {
            loginError.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        location.reload();
    });

    function showDashboard() {
        loginOverlay.classList.add('hidden');
        dashboard.classList.remove('hidden');
        initializeData();
    }

    // --- DATA HANDLING ---
    function initializeData() {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
            renderTable(JSON.parse(localData));
        } else {
            fetch('cars.json')
                .then(res => res.json())
                .then(data => {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    renderTable(data);
                })
                .catch(err => console.error("Could not load initial data", err));
        }
    }

    // --- RENDER TABLE ---
    function renderTable(data) {
        carListBody.innerHTML = '';

        Object.entries(data).forEach(([id, car]) => {
            // Handle image array safely
            const imgUrl = Array.isArray(car.image) && car.image.length > 0 ? car.image[0] : './photos/placeholder.jpg';
            const price = car.pricing["OFF season"]["same-day rates"] || 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${imgUrl}" class="car-thumb" alt="car"></td>
                <td>
                    <span class="model-info">${car.info["Car Model"]}</span>
                    <span class="model-type">${car.info["Vehicle Type"]}</span>
                    <div style="font-size:0.75rem; color:#888;">ID: ${id}</div>
                </td>
                <td style="font-size:0.85rem;">
                    <i class="fas fa-gas-pump"></i> ${car.info["Fuel Type"] || '-'}<br>
                    <i class="fas fa-cogs"></i> ${car.info["Engine Displacement"] || '-'}
                </td>
                <td style="font-weight:bold; color:#1A2B4C;">¥${price.toLocaleString()}</td>
                <td>
                    <button class="btn-danger delete-btn" data-id="${id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            carListBody.appendChild(tr);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                deleteCar(this.getAttribute('data-id'));
            });
        });
    }

    // --- ADD CAR LOGIC (COMPLEX JSON BUILDER) ---
    addCarForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Gather Basic Inputs
        const id = document.getElementById('car-id').value.trim();
        const basePrice = parseInt(document.getElementById('car-price').value);

        if (!id) { alert("ID is required"); return; }

        // 2. Helper: Parse Comma Separated Strings into Arrays
        const parseArray = (val) => val.split(',').map(s => s.trim()).filter(s => s !== "");

        const images = parseArray(document.getElementById('car-images').value);
        const stdEquip = parseArray(document.getElementById('car-equipment').value);
        const safeEquip = parseArray(document.getElementById('car-safety').value);

        // 3. Construct the Full Complex Object
        const newCar = {
            "image": images.length > 0 ? images : ["./photos/placeholder.jpg"],

            "pricing": {
                "OFF season": {
                    "same-day rates": basePrice,
                    "2 days and 1 night": Math.floor(basePrice * 1.9), // Auto-calc logic
                    "3 days and 2 nights": Math.floor(basePrice * 2.8),
                    "3 nights and 4 days": Math.floor(basePrice * 3.6),
                    "4 nights and 5 days": Math.floor(basePrice * 4.4)
                },
                "Top season": {
                    "same-day rates": basePrice + 500,
                    "2 days and 1 night": Math.floor((basePrice + 500) * 1.9),
                    "3 days and 2 nights": Math.floor((basePrice + 500) * 2.8),
                    "3 nights and 4 days": Math.floor((basePrice + 500) * 3.6),
                    "4 nights and 5 days": Math.floor((basePrice + 500) * 4.4)
                }
            },

            "info": {
                "Car Model": document.getElementById('car-model').value,
                "Body Color": document.getElementById('car-color').value || "Silver",
                "Commander/ Width/ Height": document.getElementById('car-dims').value || "1700/ 1765/ 1600 mm",
                "Standard Equipment": stdEquip.length > 0 ? stdEquip : ["Air Conditioning", "ABS"],
                "No Smoking/ Smoking": "No Smoking",
                "Vehicle Type": document.getElementById('car-type').value,
                "Mission": document.getElementById('car-mission').value,
                "Capacity(Persons)": document.getElementById('car-capacity').value,
                "Fuel Type": document.getElementById('car-fuel').value || "Petrol",
                "Engine Displacement": document.getElementById('car-engine').value || "1000 cc",
                "Safety Equipment": safeEquip.length > 0 ? safeEquip : ["Airbags"]
            }
        };

        // 4. Save
        const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (currentData[id]) {
            if (!confirm("ID already exists. Overwrite?")) return;
        }

        currentData[id] = newCar;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

        renderTable(currentData);
        addCarForm.reset();
        alert("Car Added Successfully!");
    });

    // --- DELETE CAR ---
    function deleteCar(id) {
        if (confirm('Delete this car permanently?')) {
            const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY));
            delete currentData[id];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
            renderTable(currentData);
        }
    }

    // --- DOWNLOAD JSON ---
    downloadBtn.addEventListener('click', () => {
        const data = localStorage.getItem(STORAGE_KEY);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cars.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // --- RESET ---
    resetBtn.addEventListener('click', () => {
        if (confirm("Reset data to original file?")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });
});