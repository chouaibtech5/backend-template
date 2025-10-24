import axios from 'axios';
const  stripe = Stripe('pk_test_****');

const bookTour = async tourId => {
    try {
        // 1) Get checkout session from backend
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        alert(err);
    }
};