const mongoose = require('mongoose')
const Schema = mongoose.Schema;
module.exports= function(connection){

  var userSchema = new Schema({
    name: { type : String , "default" : "" },
    email: { type : String , "default" : "" },
    phone : { type : String , "default" : "" },
    timestamp: { type: Date, default: new Date() }
  },{collection: 'user'});

  userSchema.pre('save', function(next){
        var currentDate = new Date();
        this.timestamp = currentDate;
        if (!this.timestamp) {
            this.timestamp = currentDate;
        }
        next();
  });

  const user = connection.model('user', userSchema);
  return user;
}