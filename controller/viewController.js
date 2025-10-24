const tour = require('../modules/tourmodule');
const User = require('../modules/usermodule');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../modules/bookingmodule');
exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await tour.find();
    // 2) Build template
    // 3) Render that template using tour data from 1)
    res.status(200).render('overview' ,
    { title : 'All Tours' ,
    tours
    });
});
exports.getTour = catchAsync(async (req, res, next) => {
   // 1) Get the data for the requested tour (including reviews and guides)
   const tourData = await tour.findOne({ slug: req.params.slug }).populate({
       path: 'reviews',
       fields: 'review rating user'
   });


    // 2) Build template
    // if(!tourData){
    //     return next(new AppError('There is no tour with that name', 404));
    // }
    // 3) Render template using data from 1)
       
    res.status(200).render('tour' ,
    { title : tourData.name ,
    tour: tourData,
    user : 'Chouaib'
    });
});


exports.getLoginForm = (req, res) => {
    res.status(200).render('login' ,
    { title : 'Log into your account' 
    });
};
exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await tour.find({ _id: { $in: tourIDs } });
    // 3) Render template
    res.status(200).render('overview' ,
    { title : 'My Tours' ,
    tours
    });
});
exports.getAccount = (req, res) => {
    res.status(200).render('account' ,
    { title : 'Your account' 
    });
};
exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account' ,
    { user: updatedUser,
     title : 'Your account' 
    });
});