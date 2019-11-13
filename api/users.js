module.exports = function (app, models) {

  const getUser = async (name, email) =>{

    const document = models.userSchema;
    return new Promise((resolve, reject) => {
        document.findOne({"email" : email}, function(err, user) {
            try{
              if(err) {
                reject({ status: 'failure', statusCode : 00, message: "Error while finding user"});
              }else {
                if(user){
                  resolve({ status:'success', statusCode : 01, response: user, message: "Existing User"});
                }else{
                  resolve({ status: 'success', statusCode : 02, message: "No User found"});
                }
              }
            }catch(e){
              reject({ status: 'failure', statusCode : 00, message: "Error while finding user"});
            }
          });
      });
  }


  const saveUser = async (newUser) =>{
    return new Promise((resolve, reject) => {
      newUser.save(async function(err){
        try {
          if (err) {
            reject({ status: 'failure', statusCode : 00, message: "Error while creating user"})
          } else {
            resolve({status:'success', code : 01, response: newUser, message: "New User Created"})
          }
        }catch (err) {
            reject({ status: 'failure', statusCode : 00, message: "Error while creating user"})
        }
      });
    });

  }



  return {
    newUser : async function(req,res){
            if(!req.body.name){
              console.log("ERROR :: ", new Date());
              res.send({status: 'failure', message: 'User name Required'});
              return;
            }

            if(!req.body.email){
              console.log("ERROR :: ", new Date());
              res.send({status: 'failure', message: 'User email Required'});
              return;
            }

            getUser(req.body.name, req.body.email).then((response)=>{
              if(response && response.statusCode === 01){
                res.json(response)
              }else{
                const document = models.userSchema;
                const newUser = new models.userSchema();
                newUser.name      = req.body.name;
                newUser.email   = req.body.email;

                saveUser(newUser).then((response)=>{
                  res.json(response)
                }).catch((error)=>{
                  res.json(error)
                })
              }
            }).catch((error)=>{
              res.json(error)
            })
      }
  }

}