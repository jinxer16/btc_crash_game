const User_Bet_Info = require("../models/userbetModal");
const Bet_Game = require("../models/betGame");
const enums = require('../enum')
exports.createUserBet = async (req, res) => {
    try {
        let {
            userAddress,
            betAmount,
            userBlastLimit,
            cycleId,
        } = req.body;

        if (
            cycleId == "" || cycleId == undefined || cycleId == null|| 
            userAddress == undefined || userAddress == "" || userAddress == null ||
            betAmount == undefined || betAmount == "" || betAmount == null ||
            userBlastLimit == undefined || userBlastLimit == "" || userBlastLimit == null
        ) {
            return res.status(403).send({
                success: false,
                msg: "Paramets missing"
            })
        }

        let currentCycle = await Bet_Game.find().limit(1).sort({
            $natural: -1
        })
        let userInfoData = {
            ...req.body,
            isClaim:false
        }
        let userBetInfo = new User_Bet_Info(userInfoData)
        let data = await userBetInfo.save();
        res.status(200).send({
            success: true,
            msg: "data inset successfully",
            data
        });

    } catch (e) {
        res.status(500).send({
            success: false,
            msg: "internal server error",
            e
        })
    }
}

exports.getCurrentUserInfo = async (req, res) =>{
    try {
        let {userAddress, cycleId} = req.query;
        if (
            userAddress == undefined || userAddress == "" || userAddress == null ||
            cycleId == undefined || cycleId == "" || cycleId == null
        ) {
            return res.status(403).send({
                success: false,
                msg: "Paramets missing"
            })
        }
        let filter = {userAddress, cycleId}
        let data = await User_Bet_Info.find(filter);
        if(!data.length){
            res.status(200).send({
                success: false,
                msg: "User not found",
                data:data
            }) 
        }else{
            if(data[0].isClaim == enums.rejected){
                data[0].isClaim;
                res.status(200).send({
                    success: false,
                    msg: "User found",
                    data:data
                })
            }else{
                data[0].isClaim;
                res.status(200).send({
                    success: true,
                    msg: "User found",
                    data:data
                })
            }
            
        }
        
    } catch (error) {
        console.error("error while get current user info", error);
    }
}
exports.getUserBetInfo = async (req, res) => {
    try {
        let {
            userAddress
        } = req.query;
        if (userAddress == undefined || userAddress == "" || userAddress == null) {
            return res.status(403).send({
                success: false,
                msg: "paramets missing",
            })
        }
        // let data = await User_Bet_Info.find({
        //     userAddress
        // });
        // // console.log("data", data)
        // let filterData = data.map(async(item)=>{
        //     let {cycleId, isClaim, userBlastLimit} = item;
        //     let cycleIdData = await Bet_Game.find({cycleId});
        //     if(cycleIdData.length){
        //     let mainBlasLimit = cycleIdData[0]?.blastLimit;
            
        //     if(isClaim == enums.pending){
        //         let update;
        //         if(item.userBlastLimit <= mainBlasLimit){
        //             update = {
        //                 isClaim:enums.success
        //             }
        //         }else{
        //             update = {
        //                 isClaim:enums.fail
        //             }
        //         }
        //         let filter={
        //             cycleId
        //         }
        //         await User_Bet_Info.findOneAndUpdate(filter, update)
        //         return item;
        //     }else {
        //         return item;
        //     }
        // }else{
        //     return item;
        // }
        // })
    let againData = await User_Bet_Info.find({
        userAddress
    }).sort({
        $natural: -1
    });

        res.status(200).send({
            success: true,
            msg: "data get successfully",
            data:againData
        });

    } catch (e) {
        console.error("error while get user info", e)
    }
}


exports.manualUpdateUserInfo = async(req, res)=> {
try{
    let {userAddress,userBlastLimit,cycleId } = req.body;
    console.log("user info", req.body)
    if (
        userAddress == undefined || userAddress == "" || userAddress == null ||
        cycleId == undefined || cycleId == "" || cycleId == null ||
        userBlastLimit == undefined || userBlastLimit == "" || userBlastLimit == null
    ) {
        return res.status(403).send({
            success: false,
            msg: "Paramets missing"
        })
    }
    let filter = {
        cycleId,
        userAddress
    };
    let update = {
        userBlastLimit:userBlastLimit,
        isClaim:false
    }
    let data = await User_Bet_Info.findOneAndUpdate(filter, update)
    res.status(200).send({
        success:true,
        msg:"data updated successfully",
        data
    })

}catch(e){
    console.error("error while update user info", e)
}
}

exports.updateUserInfo = async(req, res)=> {
    try{
        let {userAddress,userBlastLimit,cycleId } = req.body;
        console.log("user info", req.body)
        if (
            userAddress == undefined || userAddress == "" || userAddress == null ||
            cycleId == undefined || cycleId == "" || cycleId == null ||
            userBlastLimit == undefined || userBlastLimit == "" || userBlastLimit == null
        ) {
            return res.status(403).send({
                success: false,
                msg: "Paramets missing"
            })
        }
        let filter = {
            cycleId,
            userAddress
        };
        let update = {
            userBlastLimit:userBlastLimit,
            isClaim:true
        }
        let data = await User_Bet_Info.findOneAndUpdate(filter, update)
        res.status(200).send({
            success:true,
            msg:"data updated successfully",
            data
        })
    
    }catch(e){
        console.error("error while update user info", e)
    }
    }

exports.deleteUserBetInfo = async (req, res) => {
    try{
        console.log("body....", req.query)
        let {id} = req.query;

        if (
            id == undefined || id == "" || id == null 
        ) {
            return res.status(403).send({
                success: false,
                msg: "Paramets missing"
            })
        }
        await User_Bet_Info.findByIdAndDelete({_id:id})
        res.status(200).send({
            success:true,
            msg:"data deleted successfully",
        })
    }catch(e){
        console.error("error while delete user bet info", e)
    }
}