const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    googleId: String, 
    isAdmin: Boolean
})

userSchema.plugin(passportLocalMongoose);

userSchema.statics.findOrCreate = function (condition, callback) {
  const self = this;
  return self.findOne(condition)
    .then((result) => {
      if (!result) {
        return self.create(condition);
      } else {
        return result;
      }
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    });
};


module.exports = mongoose.model('User', userSchema);