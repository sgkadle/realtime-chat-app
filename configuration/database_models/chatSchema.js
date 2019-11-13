const mongoose = require('mongoose')
const Schema = mongoose.Schema;
module.exports= function(connection){

  var ChatSchema = new Schema({
    message: { type : String , "default" : "" },
    sender: { type : String , "default" : "" },
    receiver : { type : String , "default" : "" },
    timestamp: { type: Date, default: new Date() }
  },{collection: 'chat'});

  ChatSchema.pre('save', function(next){
        var currentDate = new Date();
        this.timestamp = currentDate;
        if (!this.timestamp) {
            this.timestamp = currentDate;
        }
        next();
  });

  const chat = connection.model('chat', ChatSchema);
  return chat;
}