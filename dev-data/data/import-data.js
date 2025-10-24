const fs = require('fs')
const dotenv = require('dotenv');
const  Tour = require('./../../modules/tourmodule');
const User = require('./../../modules/usermodule');
const Review = require('./../../modules/reviewmodule');
dotenv.config({path: './config.env'});
const mongoose = require('mongoose');
console.log(process.env);

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
       useNewUrlParser: true,
      //  useCreateIndex: true,
      //   useFindAndModify: false
    
   
  })
  .then(() => {
      console.log('DB connection successful!');
        // Reading JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json` , 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json` , 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json` , 'utf-8'));

// Importing data into database
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data successfully loaded');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}   

// Deleting all data from collection
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted');
    } catch (err) {
        console.log(err);
    }
  process.exit();
}

if (process.argv[2] === '--import') {
    importData();
}else if (process.argv[2] === '--delete') {
    deleteData();
}


  });


