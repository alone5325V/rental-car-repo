
// --- License Toggle Logic (Keep UI logic same) ---
function toggleLicense(type) {
    document.querySelectorAll('[id^="license-warning"]').forEach(el => el.classList.remove('active'));
    if (type === 'IDP') document.getElementById('license-warning-idp').classList.add('active');
    if (type === 'JAF') document.getElementById('license-warning-jaf').classList.add('active');
}

function checkFormValidity() {
    const chk1 = document.getElementById('chk_license').checked;
    const chk2 = document.getElementById('chk_terms').checked;
    document.getElementById('submitBtn').disabled = !(chk1 && chk2);
}

// --- SUBMISSION & SUPABASE INTEGRATION ---
document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
        // 1. Retrieve Draft Data
        const draftData = JSON.parse(localStorage.getItem('bookingDraft'));
        if (!draftData) throw new Error("No booking data found. Please restart.");

        // 2. Prepare Customer Object
        const formData = new FormData(e.target);
        const customerPayload = {
            name_alphabet: formData.get('name_en').toUpperCase(),
            nationality: formData.get('nationality'),
            mobile_phone: formData.get('phone'), // Important for Japan rentals
            // license_type handles radio buttons automatically via FormData
            license_type: formData.get('license_type'),
            // Mapping extra fields if you add them to HTML later:
            // email: formData.get('email'), 
            is_active: true
        };

        // 3. Insert Customer into Supabase
        const { data: customerData, error: custError } = await supabase
            .from('customers')
            .insert([customerPayload])
            .select()
            .single(); // .single() returns one object instead of array

        if (custError) throw custError;

        // 4. Create Pending Booking Linked to Customer
        const bookingPayload = {
            car_id: draftData.car_id,
            customer_id: customerData.id, // Linking Foreign Key
            start_date: draftData.start_date,
            end_date: draftData.end_date,
            total_days: draftData.total_days,
            total_price: draftData.total_price,
            status: 'pending'
        };

        const { data: bookingData, error: bookError } = await supabase
            .from('bookings')
            .insert([bookingPayload])
            .select()
            .single();

        if (bookError) throw bookError;

        // 5. Success! Store Booking ID for Payment
        localStorage.setItem('currentBookingId', bookingData.id);
        localStorage.setItem('driverName', customerData.name_alphabet); // For UI display

        window.location.href = 'payment.html';

    } catch (error) {
        console.error('Submission Error:', error);
        alert('Error saving reservation: ' + error.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});