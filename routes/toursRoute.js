
const express = require('express');
const authController = require('../controller/authController');
const reviewController = require('../controller/reviewController');
const { protect } = require('../controller/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();
const { getAllTours, getTour, addTour, updateTour, deleteTour , aliasTopTours , getTourStats, getMonthlyPlan , getToursWithin , getDistances , uploadTourImages , resizeTourImages} = require('../controller/tourController');
 
// router.param('id', checkID);
router.use('/:tourId/reviews', reviewRouter);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(getToursWithin);
router.route('/distances/center/:latlng/unit/:unit')
.get(getDistances);
router.route('/')
.get(getAllTours)
.post(protect, authController.restrictTo('admin', 'lead-guide'), uploadTourImages, resizeTourImages, addTour);

router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), deleteTour);

      router.route('/:tourId/reviews')
    .post(protect, authController.restrictTo('user'), reviewController.createReview);

module.exports = router;