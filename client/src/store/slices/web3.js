import {
    createSlice
} from '@reduxjs/toolkit';

import { loadWeb3 } from '../../web3';

let initialState = {
    acc :"Connect Wallet",
    isLoading:false
};


const slice = createSlice({
    name:"web3Address",
    initialState,
    reducers:{
        setLoading(state, action) {
            state.isLoading = true;
        },
        setAccounAddress(state, action) {
            state.isLoading = false;
            state.acc = action.payload;
        },
        hasError(state, action) {
            state.isLoading = false;
        }
    }
})

export default slice.reducer;

export const connectWeb3 = ()=>{
    return async (dispatch)=> {
        try {
            localStorage.removeItem(null)
            dispatch(slice.actions.setLoading());
            let acc = await loadWeb3()
            if (acc == "No Wallet") {
                localStorage.removeItem(null)
              } else if (acc == "Wrong Network") {
                localStorage.removeItem(null)
              } else if (acc == "Connect Wallet") {
                localStorage.removeItem(null)
              }else{

              }
            dispatch(slice.actions.setAccounAddress(acc))
            localStorage.removeItem("address")
            localStorage.setItem("address", acc)
        } catch (error) {
            dispatch(slice.actions.hasError)
        }
    }
}

