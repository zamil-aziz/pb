export async function processPayment({ amount, method, description }) {
    console.log(`Processing payment: $${amount} via ${method} for ${description}`);

    // Simulate payment processing
    return new Promise((resolve, reject) => {
        // 95% success rate for simulated payments
        if (Math.random() > 0.05) {
            setTimeout(resolve, 2000); // Simulate 2-second processing time
        } else {
            setTimeout(() => reject(new Error('Payment declined')), 2000);
        }
    });
}
