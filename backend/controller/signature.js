const ethers = require('ethers');
const Web3 = require('web3');
const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");
const User_Bet_Info = require("../models/userbetModal");
const Bet_Game = require("../models/betGame");

exports.getSignature = async (req, res) =>{

    try{
        let { cycleId, userAddress} = req.query;
        if(userAddress == undefined || userAddress == "" || userAddress == null 
        ||cycleId == undefined || cycleId == "" || cycleId == null ){
            return res.status(403).send({
                success: false,
                msg: "Paramets missing"
            })
        }
        let userData = await User_Bet_Info.findOne({cycleId, userAddress});
        console.log("userData", userData)
        let {betAmount, userBlastLimit} = userData;
        let userMulitplier = betAmount * userBlastLimit;
        let sign =await signature(userMulitplier, userAddress)
        res.status(200).send(sign)
        


    }catch(e){
        console.error("error while get signature",e)
    }
}


const signature = async(amount,user) =>{
    try {
        let  contract = process.env.CONTRACT; //withdrawcontract
        console.log("contract", contract)
        let aAmount = web3.utils.toWei(amount.toString())
        const RPC = "https://data-seed-prebsc-1-s1.binance.org:8545";
        const provider = new ethers.providers.JsonRpcProvider(RPC)
        const blockNumber = await provider.getBlockNumber(); 
    
        const nonce = (await provider.getBlock(blockNumber)).timestamp;
        console.log("nonce-timestamp:", nonce)
    
        let hash = ethers.utils.solidityKeccak256(["string", "string", "uint256", "uint256"], [contract.toLowerCase(), user.toLowerCase(), aAmount, nonce]);
        console.log("hash:", hash)
    
        let privateKey = process.env.PRIVATE_KEY;
         //signer_pk
        // 0xef464C463D76902b1a92C2d45bcc3F142b5d18E3 - signer address
    console.log("privateKey",privateKey);
        const signingKey = new ethers.utils.SigningKey(privateKey);
        let deployTx = signingKey.signDigest(hash);
    
        const signature = ethers.utils.joinSignature(deployTx);
        console.log("Signature:", signature);
        return({
            sucess:true,
            message:"sign genrate successfully",
            sign:signature,
            nonce:nonce
        })
    } catch (error) {
        return({
            sucess:false,
            message:"something went worng",
        })
        console.error("error while genrate signature", error);
    }
}