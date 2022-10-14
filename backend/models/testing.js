const mongoose = require("mongoose");
const betGame = new mongoose.Schema({
cycleId:{
    type:Number,
    required: true,
    default:0
},
blastLimit:{
    type:Number,
    required:true
}
});

module.exports = mongoose.model("TEST", betGame);
