import express  from "express";
const router = express.Router();



  
  //SIGNIN USER
  
  router.post("/login", async (req, res) => {
    
    //CHECKING IF USER EMAIL EXISTS
  
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Incorrect Email- ID");
  
    //CHECKING IF USER PASSWORD MATCHES
  
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    
    if (!validPassword){
      return res.status(400).send({ message: "Incorrect Password" });
  
    }
    
    try {
      //VALIDATION OF USER INPUTS
      
      const { error } = await loginSchema.validateAsync(req.body);
      if (error)
        return res.status(400).send({ message: error.details[0].message });
      else {
        
        if (user.type === "admin") {
          const token = jwt.sign(
            { _id: user._id },
            process.env.ADMIN_TOKEN_SECRET
          );
          res.status(200).header("auth-token", token).send(token);
        } else {
          res.status(200).json({ message: "Seems like you are not a admin" });
        }
      }
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Change Password functionality
  router.put("/changePassword", async (req, res) => {
    try{
      let data = await (await User.findOne({ email: req.body.email }));
      
      let salt = await bcrypt.genSalt(8);
      if (data) {
        let tempData = {data};
        tempData.data.randomString = salt;
        
        data.set(tempData.data);
        await data.save();
        
        let resetURL = process.env.baseURL + '/admin/passwordreset';
        resetURL = resetURL+"?id="+data._id+"&rs="+salt
            try {
              const sendMail = require('../services/mailService');
              
              sendMail({
                from: process.env.EMAIL,
                to: req.body.email,
                subject: 'CRM Reset Password',
                text: `${resetURL}`,
                html: `${resetURL}`,
              })
              .then(() => {
                console.log("sukriti sent email");
                return res.json({success: true});
              })
              .catch(err => {
                console.log("sukriti sneding email:" + err);
                return res.status(500).json({error: 'Error in email sending.'});
              });
            } 
            catch(err) {
              return res.status(500).send({ error: 'Something went wrong.'});
            }
        }
        else {
          res.status(400).json({
            message: "User is not registered"
          });
        }
    }
    catch(error){
      console.log("error is:" + error);
      res.status(500).json({
          message: "Internal Server Error"
      })
  }
  });
  
  
  
  
  // Change Password functionality
  router.put("/changePassword", async (req, res) => {
    try{
      let data = await User.findOne({ email: req.body.email });
      
      let salt = await bcrypt.genSalt(8);
      if (data) {
        
        let tempData = {data};
        tempData.data.randomString = salt;
        
        data.set(tempData.data);
        await data.save();
        
        let resetURL = process.env.resetURL
        resetURL = resetURL+"?id="+data._id+"&rs="+salt
            try {
              const sendMail = require('../services/mailService');
              
              sendMail({
                from: process.env.EMAIL,
                to: req.body.email,
                subject: 'CRM Reset Password',
                text: `${resetURL}`,
                html: `${resetURL}`,
              })
              .then(() => {
                return res.json({success: true});
              })
              .catch(err => {
                console.log("sukriti sneding email:" + err);
                return res.status(500).json({error: 'Error in email sending.'});
              });
          } 
          catch(err) {
            return res.status(500).send({ error: 'Something went wrong.'});
          }
        }
        else {
          res.status(400).json({
            message: "User is not registered"
          });
        }
    }
    catch(error){
      console.log("error is:" + error);
      res.status(500).json({
          message: "Internal Server Error"
      })
  }
  });
  
  
  // Update Password functionality
  router.post("/verifyPasswordChange", async (req, res) => {
    try {
      
      let data = await User.findOne({ _id: objectId(req.body.objectId) });
      if (data.randomString === req.body.randomString) {
        res.status(200).json({ message: "Verification success" });
      } 
      else {
        res.status(401).json({
          message: "You are not authorized",
        });
      }
    } catch (error) {
      console.log("error is: " + error);
      res.status(500).json({
          message: "Internal Server Error"
      });
    }    
  });
  
  
  // updateDBWithPassword
  router.put("/updatePassword", async (req, res) => {
    try{
      let salt = await bcrypt.genSalt(10); 
      
      let hash = await bcrypt.hash(req.body.password, salt);
      req.body.password = hash;
      let data = await User.findOne({ _id: objectId(req.body.objectId) });
      
      data.password = hash;
      
      const result = await data.save();
      data1 = await User.findOne({ _id: objectId(req.body.objectId) });
      
      res.status(200).json({
          message : "Password Changed Successfully"
      })
    }
    catch(error){
      res.status(500).json({
          message: "Error while changing the password"
      })
    }
  });
  
  
  //DELETE USER
  
  router.delete("/deleteuser",async (req, res) => {
    try {
      const users = await User.deleteOne({ email: req.body.email });
      res.status(200).send("deleted suuccesfully");
    } 
    catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  });
  export const loginRouter = router;