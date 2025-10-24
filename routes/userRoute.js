const express = require('express');
const multer = require('multer');
const {signup , login, logout, forgotPassword, resetPassword , protect , updatePassword} = require('../controller/authController');
const { getAllUsers, getUser, addUser, updateUser, deleteUser , updateMe , deleteMe , getMe , uploadUserPhoto  } = require('../controller/userController');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');
const router = express.Router();

    router.post('/signup', signup);
    router.post('/login', login);
    router.get('/logout', logout);
    router.post('/forgetPassword', forgotPassword);
    router.patch('/resetPassword/:token', resetPassword);
    // Protect all routes after this middleware
    router.use(protect);
    router.patch('/updateMyPassword', updatePassword);
    router.get('/me', getMe, getUser);
    router.patch('/updateMe',uploadUserPhoto , updateMe);
    router.delete('/deleteMe', deleteMe);
    router.use(authController.restrictTo('admin'));
    router.route('/')
    .get(getAllUsers)
    .post(addUser);
    
    router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);
  
module.exports = router;