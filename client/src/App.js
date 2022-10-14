import React, { useEffect, useState, useRef } from "react";
import "./css/App.css";

import Axios from "axios";
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid';
// import papi from './images/lit.png'
import ModalShow from "./components/modal/Modal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from 'react-toastify';
import SomeChart from "./components/SomeChart";
import { useDispatch, useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import LotteryPigCrash from "../src/images/Lottery-Pig-Crash.png";
import logomiddle from "../src/images/logo.png";
import winningHistory from "../src/images/Match History.png"
import logomiddle1 from "../src/images/logo_middle.png";

//
import { betContractAbi, betContractAddress } from './utils/betContract'
import btc from "../src/images/binance-bnb-crypto-currency-gold-coin-icondigital-currency-financial_268461-134-removebg-preview.png"
// slices 
import { connectWeb3 } from './store/slices/web3';
import { getBetInfo } from './store/slices/betInfo';
import { getUserInfoData } from './store/slices/userInfo';
import Pagination from "./components/Pagination";
import { Table } from 'react-bootstrap';
import {signature} from './utils/signature';
import Web3 from "web3";

const rpcWeb3 = new Web3(new Web3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545/'))
function App() {
  // http://localhost:3001/api/user
  const API_BASE = "https://crash-casino-game.herokuapp.com/api/user";
  const SOCKET_URL = "https://crash-casino-game.herokuapp.com"
  // const SOCKET_URL ="http://localhost:4001"
  // const API_BASE = "http://localhost:4001/api/user";

  // reducer
  const dispatch = useDispatch()
  const { acc } = useSelector(state => state.web3Address);
  const { cycleId } = useSelector(state => state.betInfo);
  const { userInfoData } = useSelector(state => state.userInfo);
  const [betAmount, setBetAmount] = useState("0.01")
  const [autoPayoutMultiplier, setAutoPayoutMultiplier] = useState("100")
  const [liveMultiplier, setLiveMultiplier] = useState('CONNECTING...')
  const [isGame, setIsGame]=useState(false)
  const [liveMultiplierSwitch, setLiveMultiplierSwitch] = useState(false)
  const [globalSocket, setGlobalSocket] = useState(null)
  const [betActive, setBetActive] = useState(false)
  const [bBettingPhase, setbBettingPhase] = useState(false)
  const [bettingPhaseTime, setBettingPhaseTime] = useState(-1)
  const [bBetForNextRound, setbBetForNextRound] = useState(false)
  const [claimBtn, setClaimBtn] = useState('Claim')
  const [globalTimeNow, setGlobalTimeNow] = useState(0)
  const [isChangeMultiAmount, setIsChangeMultiAmount] = useState(false);
  const [chartData, setChartData] = useState({ datasets: [], });
  const [chartOptions, setChartOptions] = useState({});
  const [chartSwitch, setChartSwitch] = useState(false)
  const [gamePhaseTimeElapsed, setGamePhaseTimeElapsed] = useState()
  const [isReady, setIsReady] = useState(false)
  const [liveCash, setLiveCash] = useState(false);
  const [modalShow, setModalShow] = useState(true);
  // const [gameIsStart, setGameIsStart]=useState(false);
  let remaningTime = useRef(0);
  let gameIsStart = useRef(false)
  let gameMultiplier = useRef(0)
  const multiplierCount = useRef([])
  const timeCount_xaxis = useRef([])
  const realCounter_yaxis = useRef(5)
  // const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(5);

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
     const currentRecords = userInfoData.slice(indexOfFirstRecord, indexOfLastRecord);
    const nPages = Math.ceil(userInfoData.length / recordsPerPage)
  // Socket.io setup
  let contractBal = useRef(0)
  // contract balance
  useEffect(()=>{
    // const getContractBal 
    (async()=>{
        try {
        let bal = await rpcWeb3.eth.getBalance(betContractAddress);
        bal = rpcWeb3.utils.fromWei(bal);
        bal = parseFloat(bal).toFixed(2)
        contractBal.current = bal;
        } catch (error) {
          console.error("error while get balance", error);
        }
      // }
    })();
  },[isGame])
  const getUserInfo = () => {
    if (acc != "No Wallet" && acc != "Wrong Network" && acc != "Connect Wallet") {
      localStorage.removeItem("address")
      localStorage.setItem("address", acc)
      dispatch(getUserInfoData(acc))
    }
  }
  
  const userNextCurrentBet = async () =>{
    try {
      let userAddress = localStorage.getItem("address");
      let cycle = localStorage.getItem("cycleId")
    if(userAddress !=null){
        let currentRes = await Axios.get(`${API_BASE}/getCurrentUserInfo?userAddress=${userAddress}&cycleId=${parseInt(cycle)}`)
        if(currentRes.data.success){
          setIsReady(true)
          setIsGame(true)
          setIsChangeMultiAmount(true)
          setBetActive(true);
          setLiveCash(true)
          // setbBetForNextRound(true)
        }else{
          setIsReady(false)
          setLiveCash(false)
          setIsChangeMultiAmount(false)
          setbBetForNextRound(false)
          setBetActive(false);
        }
      }
    } catch (error) {
      console.error("error while user next current bet", error);
    }
  }
  const chekForNextBet = async () =>{
    try {
      let userAddress = localStorage.getItem("address");
      let cycle = localStorage.getItem("cycleId")
      if(userAddress !=null){
        let currentRes = await Axios.get(`${API_BASE}/getCurrentUserInfo?userAddress=${userAddress}&cycleId=${parseInt(cycle)+1}`)
        if(currentRes.data.success){
          setIsReady(true)
          setIsGame(true);
          setBetActive(true);
          setbBetForNextRound(true)
        }
      }
    } catch (error) {
      console.error("error while user next current bet", error);
    }
  }
  const checkUserNextBet = async()=>{
    try {
      let userAddress = localStorage.getItem("address");
      let cycle = localStorage.getItem("cycleId")
      if(userAddress !=null){
        let currentRes = await Axios.get(`${API_BASE}/getCurrentUserInfo?userAddress=${userAddress}&cycleId=${parseInt(cycle)+1}`)
        if(currentRes.data.success){
          setIsGame(true);
          setIsReady(true)
          setBetActive(true);
          setbBetForNextRound(true)
        }else{
          setIsChangeMultiAmount(false)
          setIsGame(false);
          setbBetForNextRound(false)
          setBetActive(false);
          const socket = io.connect(SOCKET_URL)
          socket.emit("updateUserInfo", localStorage.getItem("address"))
          await delay(3000);
          let add = localStorage.getItem("address");
          if(add != null){
          socket.emit("updateUserInfo", localStorage.getItem("address"))
            dispatch(getUserInfoData(add))
            await delay(3000);
            socket.emit("updateUserInfo", localStorage.getItem("address"))
            dispatch(getUserInfoData(add))
          }
        }
      }
    } catch (error) {
      console.error("error while user next current bet", error);
    }
  }
  const delay = (ms) =>
  new Promise((res) => {
      setTimeout(() => {
          res();
      }, ms);
  });
  useEffect(() => {
    const socket = io.connect(SOCKET_URL)
    setGlobalSocket(socket)
    // start game
    socket.on("start_multiplier_count",async function (data) {
      userNextCurrentBet()
      dispatch(getBetInfo())
      remaningTime.current = 0;
      gameIsStart.current=true;
      setGlobalTimeNow(Date.now())
      setLiveMultiplierSwitch(true);
      await delay(1000);
      chekForNextBet();
      // setLiveCash(false)
    
    })
   
    // stop game

    socket.on("stop_multiplier_count",async function (data) {
      setLiveMultiplierSwitch(false)
      console.log("stop_multiplier_count", data);
      gameIsStart.current = false;
      dispatch(getBetInfo())
      setLiveMultiplier(data)
      setBetActive(false);
      checkUserNextBet();

    })

    // start bet phase
    socket.on("start_betting_phase", async function (data) {
      dispatch(getBetInfo())
      setGlobalTimeNow(Date.now())
          // await delay(500)
          checkUserNextBet();

      setLiveMultiplier("Starting...")
      setbBettingPhase(true)

      multiplierCount.current = []
      timeCount_xaxis.current = []
    })
    return () => {
      socket.disconnect();
    }
  }, []);


  useEffect(() => {

  }, [liveMultiplier])

  useEffect(() => {
    let gameCounter = null
    if (liveMultiplierSwitch) {
      setLiveMultiplier('1.00')

      gameCounter = setInterval(() => {
        let time_elapsed = (Date.now() - globalTimeNow) / 1000.0
        setGamePhaseTimeElapsed(time_elapsed)
        setLiveMultiplier((1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2))
        gameMultiplier.current = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)
        // console.log("livemultplier", (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2));
        if (multiplierCount.current.length < 1) {
          multiplierCount.current = multiplierCount.current.concat([1])
          timeCount_xaxis.current = timeCount_xaxis.current.concat([0])
        }
        if (realCounter_yaxis.current % 5 == 0) {
          multiplierCount.current = multiplierCount.current.concat([(1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2)])
          timeCount_xaxis.current = timeCount_xaxis.current.concat([time_elapsed])
        }
        realCounter_yaxis.current += 1
      }, 10)
    }
    return () => {

      clearInterval(gameCounter)

    }
  }, [liveMultiplierSwitch]);

  useEffect(() => {
    let bettingInterval = null

    if (bBettingPhase) {
      bettingInterval = setInterval(() => {

        let time_elapsed = ((Date.now() - globalTimeNow) / 1000.0)
        let time_remaining = (59 - time_elapsed).toFixed(2);
        remaningTime.current = time_elapsed;
        // console.log("time_remaining", time_remaining);
        setBettingPhaseTime(time_remaining)
        if (time_remaining < 0) {
          setbBettingPhase(false)
        }
      }, 10)
    }
    return () => {

      clearInterval(bettingInterval)
      setBettingPhaseTime("Starting...")

    }
  }, [bBettingPhase]);


  

  useEffect(() => {
    setChartSwitch(true)
    return () => {

    };
  }, [])




  useEffect(() => {
    const temp_interval = setInterval(() => {
      setChartSwitch(false)
      sendToChart()
    }, 10)

    return () => {
      clearInterval(temp_interval)
      setChartSwitch(true)
    }
  }, [chartSwitch])

  // Chart Data
  const sendToChart = () => {
    setChartData({
      labels: timeCount_xaxis.current,

      datasets: [
        {
          data: multiplierCount.current,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)",
          color: "rgba(255, 255, 255,1)",

          pointRadius: 0,
          borderDash: [35, 5],
          lineTension: 0.1,
        },
      ],
    });
    setChartOptions({
      events: [],
      maintainAspectRatio: false,
      elements: {
        line: {
          tension: 0.1
        }
      },
      scales: {
        yAxes: {
          type: 'linear',

          title: {
            display: false,
            text: 'value'
          },
          min: 1,
          max: (liveMultiplier > 2 ? (liveMultiplier) : (2)),
          ticks: {
            color: "rgba(255, 255, 255,1)",
            maxTicksLimit: 5,
            callback: function (value, index, values) {
              if (value % 0.5 == 0) return (parseFloat(value)).toFixed(2)
            }
          },
          grid: {
            display: true,
            color: 'white'
          },
        },
        xAxes: {
          type: 'linear',
          title: {
            display: false,
            text: 'value'
          },
          max: (gamePhaseTimeElapsed > 2 ? (gamePhaseTimeElapsed) : (2)),
          ticks: {
            color: "rgba(255, 255, 255,1)",

            maxTicksLimit: 5,
            callback: function (value, index, values) {
              if (gamePhaseTimeElapsed < 10) {
                if (value % 1 == 0) return value
              } else {
                if (value % 10 == 0) return value
              }
            }
          },
          grid: {
            display: true,
            color: 'white'
          },
        },
      },
      plugins: {
        legend: { display: false },
      },
      animation: {
        x: {
          type: 'number',
          easing: 'linear',
          duration: 0,
          from: 5,
          delay: 0
        },
        y: {
          type: 'number',
          easing: 'linear',
          duration: 0,
          from: 5,
          delay: 0
        },
        loop: true,
      },
    }
    );
  }

  // connect wllet

  useEffect(() => {
    dispatch(getBetInfo())
    getUserInfo()
  //  const interval =  setInterval(() => {
  //     dispatch(getBetInfo())
  //   }, 3000);
    // return () => {
    //   clearInterval(interval)
    // }
  }, [acc])
  const connectWallet = () => {
    dispatch(connectWeb3());
  }
  useEffect(() => {
    localStorage.setItem("local_storage_betAmount", betAmount);
    localStorage.setItem("local_storage_multiplier", autoPayoutMultiplier);
  }, [betAmount, autoPayoutMultiplier])

  useEffect(()=>{
    const delayDebounceFn =   setTimeout(() => {
      localStorage.setItem("local_storage_multiplier", autoPayoutMultiplier);
      if(betActive && isChangeMultiAmount){
        set_cashout_early()
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn)

  }, [autoPayoutMultiplier])
  /// change cash out
  const set_cashout_early = async () => {
    let data = {
      userAddress: localStorage.getItem("address"),
      cycleId: cycleId,
      userBlastLimit: localStorage.getItem("local_storage_multiplier")
    }
    const socket = io.connect(SOCKET_URL)
    socket.emit("userChangeCashOut",data)
    await delay(1000)
    dispatch(getUserInfoData(localStorage.getItem("address")))
    // let res = await Axios.put(`${API_BASE}/manualUpdateUserInfo`, data);
    // dispatch(getUserInfoData(acc))
  }

  // cash out early
  const manual_cashout_early = async (live) => {
    setBetActive(false)
    let data = {
      userAddress: localStorage.getItem("address"),
      cycleId: cycleId,
      userBlastLimit: live
    }
    const socket = io.connect(SOCKET_URL)
    socket.emit("userCashOutEarly",data)
    // let res = await Axios.put(`${API_BASE}/updateUserInfo`, data);
    // dispatch(getUserInfoData(acc))
    setIsGame(false);
    setbBetForNextRound(false)
    setBetActive(false);
  }

    const checkBetInRound = async (data) => {
      try {
        const gameCycleId = localStorage.getItem("cycleId")
        let {cycleId, userBlastLimit} = data;
        
        if(gameCycleId == cycleId && gameIsStart.current == false){
          // user in bet state
          const socket = io.connect(SOCKET_URL)
            socket.emit("createBet",{...data, rejected:false})
            toast.success("Bet placed successfully")
            setIsReady(true)
            setIsGame(true);
            setBetActive(true);
            setbBetForNextRound(true)
            setIsChangeMultiAmount(true)
            await delay(1000);
            dispatch(getUserInfoData(acc))
        }else if(gameCycleId == cycleId && gameIsStart.current && userBlastLimit >= gameMultiplier.current){
            // user in game state and accept
          const socket = io.connect(SOCKET_URL)
          socket.emit("createBet",{...data, rejected:false})
          toast.success("Bet placed successfully")
          setIsReady(true)
          setIsGame(true);
          setBetActive(true);
          setbBetForNextRound(true)
          setIsChangeMultiAmount(true)
          await delay(1000);
          dispatch(getUserInfoData(acc))
        }else if(gameCycleId == cycleId && gameMultiplier.current > userBlastLimit && gameIsStart.current){
          ///("user in reject state")
          const socket = io.connect(SOCKET_URL)
          socket.emit("createBet",{...data, rejected:true})
          toast.success("Bet is rejected try next")
          setIsReady(false)
          setIsGame(true);
          setBetActive(false);
          setbBetForNextRound(false)
          setIsChangeMultiAmount(false)
          await delay(1000);
          dispatch(getUserInfoData(acc))
        }else if(gameCycleId != cycleId){
          // ("user in reject state")
          const socket = io.connect(SOCKET_URL)
          setIsReady(false)
          socket.emit("createBet",{...data, rejected:true})
          toast.success("Bet is rejected try next")
          setIsGame(true);
          setBetActive(false);
          setbBetForNextRound(false)
          setIsChangeMultiAmount(false)
          await delay(1000);
          dispatch(getUserInfoData(acc))
        }
      } catch (error) {
        console.error("error while check bet in round", error)
      }
    }
    const checkBetForNextRound = async (data) =>{
      let gameCycleId = localStorage.getItem("cycleId")
          gameCycleId = parseInt(gameCycleId);
      let {cycleId, userBlastLimit} = data;
      if(gameIsStart.current && (gameCycleId+1) == cycleId){
        //console.log("user bet in next round")
        const socket = io.connect(SOCKET_URL)
            socket.emit("createBet",{...data, rejected:false})
                  setIsGame(false);
                  setBetActive(true);
                  setbBetForNextRound(true)
                  setIsReady(true)
                  toast.success("Bet placed successfully in next round")
                  await delay(1000);
                  dispatch(getUserInfoData(acc))
      }else if(gameIsStart.current == false && gameCycleId == cycleId){
        //console.log("user bet in next round")
        const socket = io.connect(SOCKET_URL)
        socket.emit("createBet",{...data, rejected:false})
              setIsGame(false);
              setIsReady(true)
              setBetActive(true);
              setbBetForNextRound(true)
              toast.success("Bet placed successfully in next round")
              await delay(1000);
              dispatch(getUserInfoData(acc))
      }else{
        //console.log("user bet is rejected")
        const socket = io.connect(SOCKET_URL)
        socket.emit("createBet",{...data, rejected:true})
              setIsGame(true);
              setBetActive(false);
              setbBetForNextRound(false)
              setIsReady(false)
              toast.success("Bet rejected try in next round")
              await delay(1000);
              dispatch(getUserInfoData(acc))
      } 
    }
  const bet_next_round = async () => {
    try {
      if (acc == "No Wallet") {
        toast.info("Not Connected");
      } else if (acc == "Wrong Network") {
        toast.info("Not Connected");
      } else if (acc == "Connect Wallet") {
        toast.info("Not Connected");
      }else{
            setIsGame(false);
          setBetActive(true);
          setbBetForNextRound(true)
          setIsReady(true)
        // betAmount
        if(betAmount == undefined || betAmount == "" || betAmount == null
        || autoPayoutMultiplier == undefined || autoPayoutMultiplier == "" || autoPayoutMultiplier == null
        ){
          toast.info("All fields are mandatory")
        }else if(betAmount <= 0){
          toast.info("Bet amount should be grater than zero")
        }else if(autoPayoutMultiplier <= 1.01){
          toast.info("Bet Multiplier should be grater than 1.01")
        }else{
          const web3 = window.web3;
          let bal =await web3.eth.getBalance(localStorage.getItem("address"));
          bal = web3.utils.fromWei(bal);
          if(bal > 0){
            setBetActive(true);
            setbBetForNextRound(true)
            setLiveCash(false)
          const contract = new web3.eth.Contract(betContractAbi, betContractAddress);
          let amount = web3.utils.toWei(betAmount)
          await contract.methods.Place_Bet(parseInt(cycleId)+1).send({
            value:amount,
            from:acc
          }).on("receipt",async(receipt)=>{

            let data = {
              userAddress: acc,
              cycleId:parseInt(cycleId)+1,
              betAmount: betAmount,
              userBlastLimit: autoPayoutMultiplier
            }
            checkBetForNextRound(data)
            
          })
      
        }else{
          setIsReady(false)
          toast.info("Insufficent balance")
        }
        }
      }
    } catch (error) {
      setIsReady(false)
      setBetActive(false);
      setbBetForNextRound(false)

      toast.error("something went wrong")
      console.error("error while create bet", error);
    }
  }

  const createBet = async () => {
    try {
      if (acc == "No Wallet") {
        toast.info("Not Connected");
      } else if (acc == "Wrong Network") {
        toast.info("Not Connected");
      } else if (acc == "Connect Wallet") {
        toast.info("Not Connected");
      }else{
        if(betAmount == undefined || betAmount == "" || betAmount == null
        || autoPayoutMultiplier == undefined || autoPayoutMultiplier == "" || autoPayoutMultiplier == null
        ){
          toast.info("All fields are mandatory")
        }else if(betAmount <= 0){
          toast.info("Bet amount should be grater than zero")
        }else if(autoPayoutMultiplier <= 1.01){
          toast.info("Bet Multiplier should be grater than 1.01")
        }else{
          const web3 = window.web3;
          let bal =await web3.eth.getBalance(localStorage.getItem("address"));
          bal = web3.utils.fromWei(bal);
          if(bal > 0){
              let inCycleId = cycleId;
              if(remaningTime.current >= 40){
                // inCycleId = cycleId+1;
                bet_next_round();
                return;
              }
              setIsGame(false);
              setIsReady(true)
              setBetActive(true);
              setbBetForNextRound(true)
        
          const contract = new web3.eth.Contract(betContractAbi, betContractAddress);
          let amount = web3.utils.toWei(betAmount);
          await contract.methods.Place_Bet(inCycleId).send({
            value:amount,
            from:acc
          }).on("receipt",async(receipt)=>{
            let data = {
              userAddress: acc,
              cycleId:inCycleId,
              betAmount: betAmount,
              userBlastLimit: autoPayoutMultiplier
            }
            checkBetInRound(data)
          })
        }else{
          setIsReady(false)
          toast.info("Insufficent balance")
        }
      }
        }

    } catch (error) {
      setIsReady(false)
      setBetActive(false);
      setbBetForNextRound(false)
      toast.error("something went wrong")
      console.error("error while create bet", error);
    }
  }

  let [isClaimDis, setIsClaimDis] = useState(false)
  const claimReward = async (claimData) => {
    setClaimBtn("Claiming...")
    setIsClaimDis(true)
    try {
      let {_id, betAmount, userBlastLimit} = claimData;
  
      if (acc == "No Wallet") {
        toast.info("Not Connected");
        setClaimBtn("Claim")
        setIsClaimDis(false)
      } else if (acc == "Wrong Network") {
        toast.info("Not Connected");
        setClaimBtn("Claim")
        setIsClaimDis(false)
      } else if (acc == "Connect Wallet") {
        toast.info("Not Connected");
        setClaimBtn("Claim")
        setIsClaimDis(false)
      }else{
        let amount =betAmount * userBlastLimit
        // amount = amount.toFixed(6);
          let signt =await signature(amount, localStorage.getItem("address"));
        const web3 = window.web3;
        let {sign, nonce}=signt;
         amount = web3.utils.toWei(amount.toString())
        // amount = amount * 1000000000000000000

        const contract = new web3.eth.Contract(betContractAbi, betContractAddress);
        
        await contract.methods.ClaimAble(claimData.cycleId, amount, nonce, sign).send({
          from:acc
        }).on("receipt",async(receipt)=>{
          let data = {
            id:_id
          }
          const socket = io.connect(SOCKET_URL)
        socket.emit("claimedReward",data)
        await delay(1500);
        socket.emit("updateUserInfo", acc)
        dispatch(getUserInfoData(acc))
        setIsClaimDis(false)
        setClaimBtn("Claim")
        })
      }
    } catch (error) {
      setIsClaimDis(false)
      setIsClaimDis(false)
      setClaimBtn("Claim")
      toast.error("something went wrong")
      console.error("error while claim reward", error);
    }
  }
  const returnAmount = async (claimData) => {
    setClaimBtn("Returning...")
    setIsClaimDis(true)
    try {
      let {_id, betAmount, userBlastLimit} = claimData;
  
      if (acc == "No Wallet") {
        toast.info("Not Connected");
        setClaimBtn("Claim")
        setIsClaimDis(false)
      } else if (acc == "Wrong Network") {
        toast.info("Not Connected");
        setClaimBtn("Claim")
        setIsClaimDis(false)
      } else if (acc == "Connect Wallet") {
        toast.info("Not Connected");
        setClaimBtn("Claim")
        setIsClaimDis(false)
      }else{
        let amount =betAmount 
        // amount = amount.toFixed(6);
        let signt =await signature(amount, localStorage.getItem("address"));
        const web3 = window.web3;
        console.log("signt", signt);
        let {sign, nonce}=signt;
        amount = web3.utils.toWei(amount.toString())
        // amount = amount * 1000000000000000000

        const contract = new web3.eth.Contract(betContractAbi, betContractAddress);
        
        await contract.methods.Return(claimData.cycleId, amount, nonce, sign).send({
          from:acc
        }).on("receipt",async(receipt)=>{
          let data = {
            id:_id
          }
        //   const socket = io.connect(SOCKET_URL)
        // socket.emit("claimedReward",data)
        await Axios.delete(`${API_BASE}/deleteUserBetInfo?id=${_id}`)
        await delay(1000);
        // socket.emit("updateUserInfo", acc)
        dispatch(getUserInfoData(acc))
        setIsClaimDis(false)
        setClaimBtn("Claim")
        })
      }
    } catch (error) {
      setIsClaimDis(false)
      setIsClaimDis(false)
      setClaimBtn("Claim")
      toast.error("something went wrong")
      console.error("error while claim reward", error);
    }
  }
  //JSX

  return (

    <div className="App  img-fluid">
      <ToastContainer />

    <ModalShow modalShow={modalShow} setModalShow={setModalShow} />
      <nav className="navbar">
        <div className="container">
          <div className="logo d-flex">
            <img src={logomiddle} className="navImage1 img-fluid" width=""/>
            <img src={LotteryPigCrash} className="navImage12 img-fluid" width=""/></div>
          
        </div>
      </nav>

      <div className="grid-container-main mt-3">

        <div className="grid-elements container" >
          <div className="row" >
            <div className="col-xl-6 " >
                <h3 style={{fontFamily: "'Luckiest Guy', cursive"}}>Contract Balance &nbsp;:&nbsp;{(contractBal.current)}</h3>
              {<div className=" effects-box" >
                <div className="basically-the-graph" style={{ height: '100%', width: '90%', position: "absolute", top: '12%', fontFamily: "'Luckiest Guy', cursive" }}>
                  {chartData ? (<SomeChart chartData={chartData} chartOptions={chartOptions} />) : ('')}
                </div>
                <div style={{ position: "absolute", zIndex: 12, top: '40%',fontFamily: "'Luckiest Guy', cursive" }}>
                  {(() => {
                    if (bBettingPhase) {
                      return <>
                      <h3 style={{fontFamily: "'Luckiest Guy', cursive"}}>NEXT ROUND IN</h3>
                      <h1  style={{fontFamily: "'Luckiest Guy', cursive"}}>{bettingPhaseTime}</h1>
                      </>
                    } else {

                      return <h1 style={{fontFamily: "'Luckiest Guy', cursive"}} className={` ${!liveMultiplierSwitch && liveMultiplier !== 'Starting...' && liveMultiplier !== 'CONNECTING...' ? ("multipler_crash_value_message") : ("")}`}>{liveMultiplier !== "Starting..." ? (liveMultiplier + 'x') : ('Starting...')}</h1>
                    }
                  })()}
                </div>
              </div>}
              <div className="row mt-3 justify-content-center">
                <div className="col-lg-6">
                  <div className="input-group mb-3">
                    <span className="mySpanClass  input-group-text" id="basic-addon1"><img src={btc} width="18px" /> &nbsp;Bet</span>
                    <input type="text" className="form-control" placeholder="Type Your Bet Amount" aria-label="Username" aria-describedby="basic-addon1" style={{ color: '#868484', fontFamily: "'Luckiest Guy', cursive", backgroundColor: 'hsla(0,0%,100%,.5)' }} onChange={(e) => setBetAmount(e.target.value)}
                      value={betAmount}
                      disabled={betActive ? 'disabled' : null} />
                  </div>
                </div>
                {
                  isGame? 
                  <div className="col-lg-6">
                  <div className="input-group mb-3">
                    <span className="mySpanClass  input-group-text" id="basic-addon1">Cashout</span>
                    <input type="text" className="form-control" placeholder="Payout Multiplier" aria-label="Username" aria-describedby="basic-addon1" style={{ color: '#868484', fontFamily: "'Luckiest Guy', cursive", backgroundColor: 'hsla(0,0%,100%,.5)'  }} onChange={(e) => setAutoPayoutMultiplier(e.target.value)}
                      value={autoPayoutMultiplier}
                       />
                  </div>
                </div>
                :<div className="col-lg-6">
                <div className="input-group mb-3">
                  <span className="mySpanClass  input-group-text" id="basic-addon1">Cashout</span>
                  <input type="text" className="form-control" placeholder="Payout Multiplier" aria-label="Username" aria-describedby="basic-addon1" style={{ color: '#868484', fontFamily: "'Luckiest Guy', cursive", backgroundColor: 'hsla(0,0%,100%,.5)'  }} onChange={(e) => setAutoPayoutMultiplier(e.target.value)}
                    value={autoPayoutMultiplier}
                     />
                </div>
              </div>
                
                 
                }
                {
                  !isGame ? 
                  <div className="col-lg-8 col-12 justify-content-center mb-3">
                  {
                    acc === "No Wallet"
                    ? <button className="css-button css-button-3d css-button-3d--grey" onClick={() => { connectWallet() }}>Connect Wallet</button>
                    : acc === "Connect Wallet"
                    ? <button className="css-button css-button-3d css-button-3d--grey" onClick={() => { connectWallet() }}>Connect Wallet</button>
                    : acc === "Wrong Network"
                    ? <button className="css-button css-button-3d css-button-3d--grey" onClick={() => { connectWallet() }}>{acc}</button>
                    :
                    bBettingPhase && !betActive ? (<button className="css-button css-button-3d css-button-3d--grey" onClick={createBet}>Send Bet</button>)
                    :
                    <button className={`css-button css-button-3d css-button-3d--grey ${bBetForNextRound ? ('bet_for_next_round_active') : ('')}` } onClick={bet_next_round} disabled={bBetForNextRound ? true : false}>{bBetForNextRound ? ("Ready to Play") : ("Bet Next round")} </button>
                          }
                </div>
                :
                <div className="col-lg-8 col-12 justify-content-center mb-3">
              
                  
                  {betActive && liveCash? (<div>
                      <button className="css-button css-button-3d css-button-3d--grey" onClick={() => manual_cashout_early(liveMultiplier)} disabled={liveMultiplier > autoPayoutMultiplier ? true : false}> {(betActive && liveMultiplier > 1) ? (<span>Cashout at {(liveMultiplier * betAmount).toFixed(2)}</span>) : ("Starting...")}</button>
                      </div>) : (<div>
                      <button className={`css-button css-button-3d css-button-3d--grey ${bBetForNextRound ? ('bet_for_next_round_active') : ('')}` } onClick={bet_next_round} disabled={bBetForNextRound ? true : false}>{bBetForNextRound ? ("Ready to Play") : ("Bet Next round")} </button>
                      </div>)}
                  
                </div>
                }
                
              </div>
            </div>
            <div className="col-xl-6"  >
              <img src={winningHistory} width="280px"/>
              <div className="tableresponsive">
              <Table className="table  tablecolor text-center" responsive style={{fontFamily: "'Luckiest Guy', cursive"}}>
                <thead>
                  <tr style={{ color: 'white', fontFamily: "'Luckiest Guy', cursive"}}>
                    <td style={{fontFamily: "'Luckiest Guy', cursive"}}>Hash</td>
                    <td style={{fontFamily: "'Luckiest Guy', cursive"}}>Amount</td>
                    <td style={{fontFamily: "'Luckiest Guy', cursive"}}>Multiplier</td>
                    <td style={{fontFamily: "'Luckiest Guy', cursive"}}>Bust</td>
                    <td style={{fontFamily: "'Luckiest Guy', cursive"}}>Reward</td>
                    <td style={{fontFamily: "'Luckiest Guy', cursive"}}>
                      Staus
                    </td>
                  </tr>
                </thead>
                {currentRecords.length ? 
                <tbody className="align-items-center mt-2">
                {
                  currentRecords?.map((data, index) => {
                    return (
                      
                        <tr key={index} style={{ color: 'white', fontFamily: "'Luckiest Guy', cursive"}} className="align-items-center ">
                          {/* {data.hash.substring(0,6)+"..."+data.hash.substring(data.hash.length - 6)} */}
                          <td className="align-items-center mt-2" style={{fontFamily: "'Luckiest Guy', cursive"}}><input style={{width:"100px"}} value={data.hash} disabled /></td>
                          <td style={{fontFamily: "'Luckiest Guy', cursive"}}>{data.betAmount}</td>
                          <td style={{fontFamily: "'Luckiest Guy', cursive"}}>{data.userBlastLimit}</td>
                          <td style={{fontFamily: "'Luckiest Guy', cursive"}}>{data.gameBlastLimit}</td>
                          {data.isClaim ==  "Success"  && <td style={{fontFamily: "'Luckiest Guy', cursive"}}>{  (data.betAmount * data.userBlastLimit).toFixed(5) }</td>}
                          {data.isClaim ==  'Claimed' && <td style={{fontFamily: "'Luckiest Guy', cursive"}}>{  (data.betAmount * data.userBlastLimit).toFixed(5) }</td>}
                          
                          {data.isClaim == 'Pending' && <td style={{fontFamily: "'Luckiest Guy', cursive"}}></td>}
                          {data.isClaim == 'Fail' && <td style={{fontFamily: "'Luckiest Guy', cursive"}} className="text-danger">0</td>}
                          {data.isClaim == 'Rejected' && <td style={{fontFamily: "'Luckiest Guy', cursive"}} className="text-danger">Rejected</td>}
                          <td >
                          {data.isClaim == 'Fail' && (<span className="text-danger" style={{fontFamily: "'Luckiest Guy', cursive"}}>Loss</span>)}
                          {data.isClaim == 'Success' && (<button className=" css-button-3d--grey-table" onClick={() => { claimReward(data) }} disabled={isClaimDis}>{claimBtn}</button>)}
                          {data.isClaim == 'Pending' && <span className="text-info" style={{fontFamily: "'Luckiest Guy', cursive"}}>Pending...</span>}
                          {data.isClaim == 'Claimed' && <span className="text-success" style={{fontFamily: "'Luckiest Guy', cursive"}}>Claimed</span>}
                          {data.isClaim == 'Rejected' && <button className=" css-button-3d--grey-table text-danger" onClick={() => { returnAmount(data) }} disabled={isClaimDis}>Return</button>}
                            </td>
                        </tr>
                      
                    )
                  })
                }
                
              </tbody> : <></>
              }
                
              </Table>
              </div>
              <Pagination 
              nPages={nPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              />

              <img src={logomiddle1} width="140px"/>
            </div>
          </div>
        </div>
        
        <br />
        <div>

        </div>

      </div>
    </div >
  );
}

export default App;

