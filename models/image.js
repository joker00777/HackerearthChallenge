const mongoose=require("mongoose");

const imageSchema=new mongoose.Schema({
    url:String,
    name:String,
    details:String
})


module.exports=new mongoose.model('Images',imageSchema);