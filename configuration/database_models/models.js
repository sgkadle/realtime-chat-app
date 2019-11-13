module.exports = function(connection) {
    const chatSchema = require('./chatSchema')(connection);
    const userSchema = require('./userSchema')(connection);

    return {
        chatSchema: chatSchema,
        userSchema: userSchema
    }
}