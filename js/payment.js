document.addEventListener('DOMContentLoaded', () => {
    
    // --- INTEGRATION: Pre-fill Data from Previous Step ---
    const savedName = localStorage.getItem('driverName');
    const cardHolderInput = document.getElementById('cardholder-name');
    
    if (savedName && cardHolderInput) {
        cardHolderInput.value = savedName.toUpperCase();
    }

    // --- 1. Tab Switching Logic ---
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    const payButton = document.getElementById('pay-button');

    // Default Payment Method
    let currentMethod = 'credit-card';

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
            currentMethod = target;

            // Update Button Text based on method
            updateButtonText(target);
        });
    });

    function updateButtonText(method) {
        if (method === 'paypay') {
            payButton.innerHTML = 'PROCEED TO PAYPAY APP <i class="fas fa-external-link-alt"></i>';
            payButton.style.background = '#FF0033'; // PayPay brand color
        } else if (method === 'konbini') {
            payButton.innerHTML = 'ISSUE PAYMENT CODE';
            payButton.style.background = '#F68B1F'; // Generic Konbini orange
        } else {
            payButton.innerHTML = 'PAY JPY 25,300';
            payButton.style.background = '#1A2B4C'; // Original Brand Blue
        }
    }

    // --- 2. Stripe Elements (Mock Setup) ---
    if (typeof Stripe !== 'undefined') {
        const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); 
        const elements = stripe.elements();
        
        const style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': { color: '#aab7c4' }
            },
            invalid: { color: '#fa755a', iconColor: '#fa755a' }
        };

        const card = elements.create('card', {style: style});
        card.mount('#card-element');
    }

    // --- 3. Handle Payment Submission ---
    payButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Visual Loading State
        const originalText = payButton.innerHTML;
        payButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> PROCESSING...';
        payButton.style.opacity = '0.8';
        payButton.disabled = true;

        // Simulate Backend Latency
        setTimeout(() => {
            if (currentMethod === 'credit-card') {
                alert('Payment Successful! \n\nBooking Confirmed for: ' + (savedName || 'Guest'));
            } else if (currentMethod === 'paypay') {
                alert('Redirecting to PayPay...');
            } else {
                alert('Code Issued: 8492-3021\n\nPlease show this at the convenience store.');
            }
            
            // Clean up storage after success
            localStorage.removeItem('driverName');
            
            // Reset Button (for demo)
            payButton.innerHTML = originalText;
            payButton.style.opacity = '1';
            payButton.disabled = false;
        }, 2000);
    });
});