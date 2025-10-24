const User = require('../modules/usermodule');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users'); // Set the destination for uploaded files
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1]; // Get the file extension
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); // Create a unique filename
//     }
// }) ; 
const multerStorage = multer.memoryStorage(); // Store files in memory as Buffer objects
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true); // Accept the file
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false); // Reject the file
    }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter }); // Set up multer for file uploads

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = async (req , res , next ) => {
    if (!req.file) return next() ;  
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg` ;
    await sharp(req.file.buffer)
    .resize(500 , 500)
    .toFormat('jpeg')
    .jpeg({ quality : 90 })
    .toFile(`public/img/users/${req.file.filename}`);
    next() ;
}
 const filterObj = (obj , ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}
// exports.getAllUsers = catchAsync(async (req, res , next ) => {
    //       const users = await User.find() ;
    
    //     res.status(200).json({
        //         status: 'success',
        //         results: users.length,
        //         data: {
            //             users: users
            //         }
            //     });
            // });
            
            exports.getUser = (req, res) => {
                res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};
exports.updateMe = async (req, res , next ) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));    
    }
    // 3) Filtered out unwanted fields names that are not allowed to be updated
const filterBody = filterObj(req.body , 'name' , 'email');
if(req.file) filterBody.photo = req.file.filename ;
// 3) Update user document
const updatedUser = await User.findByIdAndUpdate(req.user.id , filterBody , {
    new : true ,
        runValidators : true 
    });
res.status(200).json({
    status: 'success',
    message: 'User updated successfully' 
    ,
    data: {
        user : updatedUser
    }   
});
}
exports.deleteMe = catchAsync(async (req, res , next ) => {
    await User.findByIdAndUpdate(req.user.id , { active : false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});
exports.addUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use /signup instead'
    });
};
// Do not update passwords with this!
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
