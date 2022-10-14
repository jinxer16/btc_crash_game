import {configureStore} from "@reduxjs/toolkit";
import web3Address from './slices/web3'
import betInfo from './slices/betInfo';
import userInfo from './slices/userInfo'
const store = configureStore({
    reducer: {
        web3Address,
        betInfo,
        userInfo
        
    }
});

export default store;


