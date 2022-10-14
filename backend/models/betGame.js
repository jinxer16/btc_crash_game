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
},
hash:{
    type:String
}
});

module.exports = mongoose.model("Bet_Game", betGame);
