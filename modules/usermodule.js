const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
// name , email , photo , password , passwordConfirm
const bcrypt = require('bcryptjs');
const userschema = new mongoose.Schema({
    name : {
        type : String ,
        required : [true , 'A user must have a name'] ,
        trim : true ,
        maxlength : [40 , 'A user name must have less or equal than 40 characters'] ,
        minlength : [3 , 'A user name must have more or equal than 3 characters'] , 
    } ,
    email : {
        type : String ,
        required : [true , 'A user must have an email'] ,
        unique : true ,
        lowercase : true , 

        validate : {
            validator : function(val){
                return validator.isEmail(val);
            } ,
            message : 'Please provide a valid email'
        }
    } ,
    photo :{  
        type : String ,
        default : 'default.jpg'
     },
     role : {
        type : String ,
        enum : ['user' , 'guide' , 'lead-guide' , 'admin'] ,
        default : 'user'
     } ,
    password : {
        type : String ,
        required : [true , 'A user must have a password'] ,
        minlength : [8 , 'A user password must have more or equal than 8 characters'] ,
        select : false ,
    } ,
    passwordConfirm : {
        type : String ,
        required : [true , 'A user must confirm his password'] ,
        validate : {
            // This only works on CREATE and SAVE !!!
            validator : function(el){
                return el === this.password ;
            } ,
            message : 'Passwords are not the same!'
        }
    } ,
    passwordChangedAt : Date ,
    passwordResetToken : String ,
    passwordResetExpires : Date ,
    active : {
        type : Boolean ,
        default : true ,
        select : false 
    }
});

userschema.pre('save' , async function(next){
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password , 12);
    // Delete passwordConfirm field
    this.passwordConfirm = undefined ;
    next();
});

userschema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userschema.methods.correctPassword = async function(candidatePassword , userPassword){
    return await bcrypt.compare(candidatePassword , userPassword);
}; 

userschema.methods.changedPasswordAfter = function(JWTTimestamp){
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};
userschema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});



userschema.methods.createPasswordResetToken = function(){
const resetToken = crypto.randomBytes(32).toString('hex');

this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

return resetToken;
};


const User = mongoose.model('User' , userschema);
module.exports = User ;