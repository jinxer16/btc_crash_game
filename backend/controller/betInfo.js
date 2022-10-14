const Bet_Game  = require('../models/betGame');


exports.betInfo = async(req, res)=>{

    try{
        let data = await Bet_Game.find().limit(1).sort({$natural:-1});
        
        res.status(200).send({
            cycleId:data[0]?.cycleId
        })
    }catch(e){
        console.log("error while bet info", e)
    }
}