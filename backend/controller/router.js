const express = require('express');
const bodyParser = require("body-parser");
const {betInfo} = require('./betInfo');
const {createUserBet, getUserBetInfo, updateUserInfo, deleteUserBetInfo, manualUpdateUserInfo, getCurrentUserInfo} = require('./userBetController');
const {getSignature} = require("./signature")
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/betinfo", betInfo);
router.post("/createBet", createUserBet);
router.get("/getUserInfo", getUserBetInfo);
router.put("/updateUserInfo", updateUserInfo);
router.put("/manualUpdateUserInfo", manualUpdateUserInfo);
router.delete("/deleteUserBetInfo", deleteUserBetInfo);
router.get("/getCurrentUserInfo", getCurrentUserInfo)
router.get("/getSignature", getSignature);

module.exports = router;
