const express = require('express');
const { getOverview, getTour , getLoginForm , getAccount , updateUserData , alert  } = require('../controller/viewController');
const authController = require('../controller/authController');
const router = express.Router();


const bookingController = require('../controller/bookingController');

router.use(alert );
router.get('/me', authController.protect , getAccount );
router.get('/my-tours', authController.protect , bookingController.getMyTours);
router.get('/',
    //   bookingController.createBookingCheckout ,
       authController.isLoggedIn , (req, res) => {
    res.status(200).render('base' ,
        { tour : 'The Forest Hiker' ,
            user : 'Chouaib'
        });
    });
router.use(authController.isLoggedIn)
router.get('/login',authController.protect ,  getLoginForm );
router.get('/overview', getOverview);
router.get('/tour/:slug', getTour);
router.post('/submit-user-data', authController.protect , updateUserData );



module.exports = router;