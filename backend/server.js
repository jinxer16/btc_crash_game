const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const app = express();
const User_Bet_Info = require("./models/userbetModal");
const Bet_Game = require("./models/betGame");
const enums = require("./enum")
require('dotenv').config()
const router = require("./controller/router")
const http = require('http')
const Stopwatch = require('statman-stopwatch');
const sw = new Stopwatch(true);
app.use(cors());
// Start Socket.io Server
app.use("/api/user", router)
const port = process.env.PORT || 4001;
const server = app.listen(port, function() {
  console.log('server listening at', server.address())
})
// app.listen(port, function() {
//   console.log('server listening at')
// })
const { Server } = require('socket.io')
// const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
})

io.on("connection", (socket) => {
  // create bet 
  socket.on("createBet", async(data) => {
    console.log("data user", data);
    let {rejected} = data;
    let userInfoData = {
      ...data,
      isClaim:rejected ? enums.rejected : enums.pending,
      hash:"..."
  }

    let test = new User_Bet_Info(userInfoData);
    await test.save()
  })
  // user change cash out 
  socket.on("userChangeCashOut", async(data) => {
    try{
     
      let {userAddress,userBlastLimit,cycleId } = data
     
      let filter = {
          cycleId,
          userAddress
      };
      let update = {
          userBlastLimit:userBlastLimit,
          isClaim:enums.pending
      }
       await User_Bet_Info.findOneAndUpdate(filter, update)
  
  }catch(e){
      console.error("error while update user info", e)
  }
  })
  // user cash out early
  socket.on("userCashOutEarly", async(data) => {
    try{
      let {userAddress,userBlastLimit,cycleId } = data;
    
      let filter = {
          cycleId,
          userAddress
      };
      let update = {
          userBlastLimit:userBlastLimit,
          isClaim:enums.pending
      }
       await User_Bet_Info.findOneAndUpdate(filter, update)
  
  }catch(e){
      console.error("error while update user info", e)
  }
  })
  //claimed bet//
  socket.on("claimedReward", async(data)=>{
    try{
      let {id} = data;
      let filter = {
        _id:id
    };
    let update = {
        isClaim:enums.claimed
    }
     await User_Bet_Info.findByIdAndUpdate(filter, update)
    }catch(e){
      console.error('error while claimde reward', e)
    }
  })
  socket.on("updateUserInfo", async(userAddress)=>{
  if (userAddress != undefined || userAddress != "" || userAddress != null) {
    
  
  let userData = await User_Bet_Info.find({
      userAddress
  });
   userData.forEach(async(item)=>{
      let {cycleId, isClaim, userBlastLimit} = item;
      if(isClaim == enums.pending){
        console.log("isClaim", isClaim+ cycleId)
      let cycleIdData = await Bet_Game.find({cycleId});
      let mainBlasLimit = cycleIdData[0]?.blastLimit;
      let gameHash = cycleIdData[0]?.hash
      if( mainBlasLimit > 0){
          let update;
          if(userBlastLimit <= mainBlasLimit){
              update = {
                  isClaim:enums.success,
                  gameBlastLimit:mainBlasLimit,
                  hash:gameHash
              }
          }else{
              update = {
                  isClaim:enums.fail,
                  gameBlastLimit:mainBlasLimit,
                  hash:gameHash

              }
          }
          let filter={
              cycleId
          }
          await User_Bet_Info.findOneAndUpdate(filter, update)
      }
    }
  })
}
  })

})

mongoose.connect(
  process.env.MONGOOSE_DB_LINK,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

// Backend Setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// genrate random string
function randomString( length )
    {
        var chars = '0123456789abcdefghiklmnopqrstuvwxyz'.split('');
        var str = '';
        for (var i = 0; i < length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }


// create sha256 hash
const createHash = () => {
  try{
    const secret = "This is a company secret 🤫";
    const resetToken = crypto.randomBytes(20).toString('hex');
    // create a sha-256 hasher
    const sha256Hasher = crypto.createHmac("sha256", secret);
    
    // hash the string
    // and set the output format
    const gameHash = sha256Hasher.update(resetToken).digest("hex");
    
    // A unique sha256 hash 😃
  return gameHash;
  }catch(e)
{
  console.error("error while create hash", e)
}}

  // verify sha256 hash
  const verifyHash = (gameHash) => {
    const salt = "00000000000000" + randomString(50);
    let calc = gameHash+salt;
            // let hash = sha256(calc);
            let h = parseInt(calc.slice(0, 13), 16);
            let e = Math.pow(2, 52);
    
            let result = Math.floor((98 * e) / (e - h));
            if (result < 100) {
              result = 100;
          }
          if (result > 10000000) {
              result = 10000000
          }
          const max = (result / 100).toFixed(2);
          return max;
  }



// Run Game Loop
let phase_start_time = Date.now()
const pat = setInterval(async () => {
  await loopUpdate()
}, 1000)


let betting_phase = false
let game_phase = false
let cashout_phase = true
let game_crash_value = -69
let sent_cashout = true

// game loop with sha256 hash
const loopUpdate = async () => {
  let time_elapsed = (Date.now() - phase_start_time) / 1000.0
  // console.log("time_elapsed", time_elapsed)
  if (betting_phase) {
    if (time_elapsed > 61) {
      sent_cashout = false
      betting_phase = false
      game_phase = true
      io.emit('start_multiplier_count')
      phase_start_time = Date.now()
    }
  } else if (game_phase) {
    current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)
    // console.log("current_multiplier", current_multiplier)
    if (parseFloat(current_multiplier) > parseFloat(game_crash_value)) {
      console.log("game_crash_value 162", game_crash_value)
      io.emit('stop_multiplier_count', game_crash_value)
      let betData = await Bet_Game.find().limit(1).sort({
        $natural: -1
      });
      let filter = {
        cycleId:betData[0].cycleId
      }
      let update = {
        blastLimit:game_crash_value
      }
      await Bet_Game.findOneAndUpdate(filter, update)
      // io.emit('stop_multiplier_count', 2.83)

      game_phase = false
      cashout_phase = true
      phase_start_time = Date.now()
    }
  } else if (cashout_phase) {


    if (time_elapsed > 3) {
      cashout_phase = false
      betting_phase = true
      let gameHash = createHash();
      console.log("gameHash", gameHash)
      game_crash_value = verifyHash(gameHash);
      // game_crash_value= 50.20
       console.log("game_crash_value", game_crash_value);
       let betData = await Bet_Game.find().limit(1).sort({$natural: -1});
       let bet_game = new Bet_Game();
        if(betData.length){
          console.log("cycleId",(betData[0].cycleId) + 1);
          bet_game.cycleId = (betData[0].cycleId) + 1;
        }else{
          bet_game.cycleId = 1;
          bet_game.hash = gameHash;
        }
        bet_game.blastLimit = 0;
        bet_game.hash = gameHash;
        await bet_game.save()
      io.emit('start_betting_phase')
      phase_start_time = Date.now()
    }
  }
}

// Game Loop
// const loopUpdate = async () => {
//   let time_elapsed = (Date.now() - phase_start_time) / 1000.0
//   console.log("time_elapsed", time_elapsed)
//   if (betting_phase) {
//     if (time_elapsed > 61) {
//       sent_cashout = false
//       betting_phase = false
//       game_phase = true
//       io.emit('start_multiplier_count')
//       phase_start_time = Date.now()
//     }
//   } else if (game_phase) {
//     current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)
//     console.log("current_multiplier", current_multiplier)
//     if (current_multiplier > game_crash_value) {
//       console.log("game_crash_value 162", game_crash_value.toFixed(2))
//       io.emit('stop_multiplier_count', game_crash_value.toFixed(2))
//       let betData = await Bet_Game.find().limit(1).sort({
//         $natural: -1
//       });
//       let filter = {
//         cycleId:betData[0].cycleId
//       }
//       let update = {
//         blastLimit:game_crash_value.toFixed(2)
//       }
//       await Bet_Game.findOneAndUpdate(filter, update)
//       // io.emit('stop_multiplier_count', 2.83)

//       game_phase = false
//       cashout_phase = true
//       phase_start_time = Date.now()
//     }
//   } else if (cashout_phase) {


//     if (time_elapsed > 3) {
//       cashout_phase = false
//       betting_phase = true
//       let randomInt = Math.floor(Math.random() * (9999999999 - 0 + 1) + 0)
//       if (randomInt % 33 == 0) {
//         console.log("in random int 33")
//         game_crash_value = 1
//         let betData = await Bet_Game.find().limit(1).sort({
//           $natural: -1
//       });
//       console.log("game_crash_value in random", game_crash_value);
//         let bet_game = new Bet_Game();
//         if(betData.length){
//           console.log("cycleId in random",(betData[0].cycleId) + 1);
//           bet_game.cycleId = (betData[0].cycleId) + 1;
//         }else{
//           bet_game.cycleId = 1;
//         }
//         bet_game.blastLimit = 0;
//         await bet_game.save()
//       } else {
//         let random_int_0_to_1 = Math.random();
//         while (random_int_0_to_1 == 0) {
//           console.log("in random loop")
//           random_int_0_to_1 = Math.random()
//         }
//         game_crash_value = 0.01 + (0.99 / random_int_0_to_1)
//         game_crash_value = Math.round(game_crash_value * 100) / 100
//         let betData = await Bet_Game.find().limit(1).sort({
//           $natural: -1
//         });
//         console.log("game_crash_value 204", game_crash_value);
        
//         let bet_game = new Bet_Game();
//         if(betData.length){
//           console.log("cycleId",(betData[0].cycleId) + 1);
//           bet_game.cycleId = (betData[0].cycleId) + 1;
//         }else{
//           bet_game.cycleId = 1;
//         }
//         bet_game.blastLimit = 0;
//         await bet_game.save()
//       }
//       io.emit('start_betting_phase')
//       live_bettors_table = []
//       phase_start_time = Date.now()
//     }
//   }
// }
