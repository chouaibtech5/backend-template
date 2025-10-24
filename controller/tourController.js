
// const fs = require('fs');
const multer = require('multer') ; 
const sharp = require('sharp') ;
const Tour = require('../modules/tourmodule');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multerStorage = multer.memoryStorage(); // Store files in memory as Buffer objects
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true); // Accept the file
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false); // Reject the file
    }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter }); // Set up multer for file uploads
exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);
upload.array('images' , 3 ) ; // req.files


exports.resizeTourImages = catchAsync( async (req , res , next ) => {
    if (!req.files.imageCover || !req.files.images) return next() ;
    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg` ;
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000 , 1333)
    .toFormat('jpeg')
    .jpeg({ quality : 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
    
    // 2) Images
    req.body.images = [] ;
    await Promise.all(
        req.files.images.map( async (file , i ) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg` ;
            await sharp(file.buffer)
            .resize(2000 , 1333)
            .toFormat('jpeg')
            .jpeg({ quality : 90 })
            .toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename) ;
        })
    ) ;
    next() ;
}) ;
// exports.checkID = (req, res, next, val) => {
//     //  if (req.params.id * 1 > tours.length) {
//     //     return res.status(404).json({
//     //         status: 'fail',
//     //         message: 'Invalid ID'
//     //     });
//     // }
//     next();

// }

// exports.checkbody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Missing name or price'
//         });
//     }
//     next();
// }

exports.aliasTopTours =  (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = factory.getAll(Tour) ;
// exports.getAllTours = catchAsync(async (req, res) => {

//     // console.log(req.headers);
//     // Execute query
//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter().sort().limitFields().paginate();
//     // const tours = await features.query.explain();
//     const tours = await features.query.lean() ;
    
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours: tours
//         }
//     });
    // try {
        // 1. Filtering
        // const queryObj = {...req.query};
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // excludedFields.forEach(el => delete queryObj[el]);
        
        // 2. Advanced Filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // const queryObjFinal = JSON.parse(queryStr);
        
        // // 3. Build the query
        // let query = Tour.find(queryObjFinal);
        
        // 4. Sorting
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy);
        // } else {
        //     query = query.sort('-createdAt'); // Default sort
        // }
        
        // 5. Field Limiting
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // } else {
        //     query = query.select('-__v'); // Exclude __v by default
        // }
        
        // 6. Pagination
            // const page = req.query.page * 1 || 1;
            // const limit = req.query.limit * 1 || 100;
            // const skip = (page - 1) * limit;
            
            // query = query.skip(skip).limit(limit);
            
            // if (req.query.page) {
            //     const numTours = await Tour.countDocuments();
            //     if (skip >= numTours) throw new Error('This page does not exist');
            // }
    // } catch (err) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err
    //     });
    // }
// exports.getAllTours = async (req, res) => {
//     try {

//       // 1. Filtering
//        const queryObj = {...req.query};
//          const excludedFields = ['page', 'sort', 'limit', 'fields'];
//          excludedFields.forEach(el => delete queryObj[el]);
//        // 2. Advanced Filtering
//          let queryStr = JSON.stringify(queryObj);
//          queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//         // console.log(JSON.parse(queryStr));
//            const queryObjFinal = JSON.parse(queryStr);
//         // 3. Sorting
//         if (req.query.sort) {
//             const sortBy = req.query.sort(req.query.sort);
//              queryObjFinal = queryObjFinal.sort(sortBy);
//         }







//            const  query = Tour.find(queryObjFinal) ;
//         // const tours = await Tour.find(queryObj);
// //         const tours = await Tour.find(req.query) ;
// //         const tours = await Tour.find()
// // .where('duration').equals(5)
// // .where('difficulty').equals('easy') ;
// const tours = await query ;
//     res.status(200).json({
//         status: 'success',
//     results : tours.length,
//     data :{
//        tours : tours

//     }
// });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         });
//     }
// };

 exports.getTour = factory.getOne(Tour , { path : 'reviews' }) ;
// exports.getTour =  catchAsync( async (req, res, next) => {
// // console.log(req.params);
// //     const id = req.params.id * 1;
// //     // const tour  = tours.find(el => el.id === parseInt(req.params.id));
//     // try{
//            const tour = await Tour.findById(req.params.id).populate('reviews')  ; 
//            if (!tour) {
//             return next(new AppError('No tour found with that ID', 404));
//         }
//            // tour.findOne({_id : req.params.id})
//            res.status(200).json({
//            status: 'success', 
//             data : {
//                  tour : tour
//             }
//         });
//     // }catch(err){
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: err
//     //     });
//     // }
   
// })

exports.addTour = factory.createOne(Tour) ;
// exports.addTour = catchAsync( async (req, res) => {
//     // try {
//         // console.log(req.body);
    
//     // const newId = tours[tours.length - 1].id + 1;
//     // const newTour = Object.assign({id : newId}, req.body);
//     // tours.push(newTour);
//     // const newTour = new Tour({});
//     //     newTour.save()
//        const newTour = await Tour.create(req.body)  ;

//         res.status(201).json({
//             status: 'success',
//             data :{
//                tour : newTour
                   
//             }
//         });
//     // } catch (err) {
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: err
//     //     });
//     // }

// })

  exports.updateTour = factory.updateOne(Tour) ;
// exports.updateTour = catchAsync(async (req, res) => {
//     //  try {
//         const updatedTour = await Tour.findByIdAndUpdate(req.params.id , req.body , {
//             new : true ,
//             runValidators : true
//          }) ;
//          res.status(200).json({
//              status: 'success',
//              data :{
//                 tour : updatedTour
//              }
//          });




    //  }catch (err) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err
    //     });
    //  }


    // const id = req.params.id * 1;
    // const tour = tours.find(el => el.id === id);
    
    // const updatedTour = Object.assign(tour, req.body);
    // fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    // });
// });

exports.deleteTour = factory.deleteOne(Tour) ;
// exports.deleteTour = catchAsync(async (req, res , next ) => {

//       const tour =  await Tour.findByIdAndDelete(req.params.id) ;
//         if (!tour) {
//             return next(new AppError('No tour found with that ID', 404));
//         }
//         res.status(200).json({
//             status: 'success',
//             data : null
//         });
//     // } catch (err) {
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: err
//     //     });
//     // }
//     // const id = req.params.id * 1;
//     // const tour = tours.find(el => el.id === id);
  
//     // const index = tours.indexOf(tour);
//     // tours.splice(index, 1);
//     // fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//     //     res.status(204).json({
//     //         status: 'success',
//     //         data : null
//     //     });
//     // });
// }
// )
exports.getTourStats = catchAsync(async (req, res) => {
    // try {
        const stats = await Tour.aggregate([
            {
                $match : { ratingsAverage : { $gte : 4.5 } }
            } ,
            {
                $group : {
                    _id : { $toUpper:'$difficulty' } ,
                    num : { $sum : 1 } ,
                    numRatings : { $sum : '$ratingsQuantity' } ,
                    avgRating : { $avg : '$ratingsAverage' } ,
                    avgPrice : { $avg : '$price' } ,
                    minPrice : { $min : '$price' } ,
                    maxPrice : { $max : '$price' } ,
                }
            } ,
            {
                $sort : { avgPrice : 1 }
            }
            // , {
            //     $match : { _id : { $ne : 'EASY' } }
            // }
        ]) ;         
        res.status(200).json({
            status: 'success',
            data : {
                stats : stats
            }
        });
    // }catch(err) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err
    //     });
    // }
})

exports.getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1 ; // 2021


        const plan = await Tour.aggregate([
            {
                $unwind : '$startDates' 
            } , 
            {
                $match : { 
                    startDates : {
                        $gte : new Date(`${year}-01-01`),
                        $lte : new Date(`${year}-12-31`)
                    }
                } ,
            } ,
            {
                $group : {
                    _id : { $month : '$startDates' } ,
                    numTourStarts : { $sum : 1 } ,
                    tours : { $push : '$name' }
                }
            } ,
            {
                $addFields : { month : '$_id' }
            } , 
            { $project : { _id : 0 } 
            } ,
            {
                $sort : { numTourStarts : -1 }
            } , {
                $limit : 12
            }
        ]) ;
        res.status(200).json({
            status: 'success',
            results: plan.length,
            data : {
                plan : plan
            }
        });

    // }catch(err) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err.message
    //     });
    // }
})
exports.getToursWithin = catchAsync(async (req, res, next) => { 
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }
    // console.log(distance, lat, lng, unit);
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => { 
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});