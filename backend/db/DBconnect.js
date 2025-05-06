const mongoose = require('mongoose');
require("dotenv").config();
const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log("Connected");
    }catch(err){
        console.log("Not connected", err)
    }
}
module.exports = connectDB;