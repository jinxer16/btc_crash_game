
const mongoose = require("mongoose");
const userBet = new mongoose.Schema({
cycleId:{
    type:String,
    required: true
},
userAddress:{
    type:String,
    required:true
},
betAmount:{
    type:String,
    required:true
},
userBlastLimit:{
    type:String,
    required:true
},
isClaim:{
    type:String,
    required:true
},
gameBlastLimit:{
    type:String,
},
hash:{
    type:String
}
});

module.exports = mongoose.model("User_Bet_Info", userBet);
