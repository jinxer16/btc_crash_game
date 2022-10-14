import {betContractAddress} from './betContract'
const ethers = require('ethers');
const Web3 = require('web3');
const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545");
const  privateKey = process.env.REACT_APP_PRIVATE_KEY;
const contract = process.env.REACT_APP_CONTRACT
export const signature = async(amount,user) =>{
    try {
        let aAmount = web3.utils.toWei(amount.toString())
        const RPC = "https://data-seed-prebsc-1-s1.binance.org:8545";
        const provider = new ethers.providers.JsonRpcProvider(RPC)
        const blockNumber = await provider.getBlockNumber(); 
    
        const nonce = (await provider.getBlock(blockNumber)).timestamp;
    
        let hash = ethers.utils.solidityKeccak256(["string", "string", "uint256", "uint256"], [betContractAddress.toLowerCase(), user.toLowerCase(), aAmount, nonce]);

        const signingKey = new ethers.utils.SigningKey(privateKey);
        let deployTx = signingKey.signDigest(hash);
    
        const signature = ethers.utils.joinSignature(deployTx);
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