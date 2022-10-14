import {
    createSlice
} from '@reduxjs/toolkit';

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL

let initialState = {
    sucess:false,
    isLoading:false,
    cycleId:null,
    blastLimit:null
};

const slice = createSlice({
    name:"betInfo",
    initialState,
    reducers:{
        setLoading(state, action) {
            state.isLoading = true;
        },
        setBetInfoData(state, action) {
            state.isLoading = false;
            state.sucess=true;
            state.cycleId = action.payload;
        },
        hasError(state, action) {
            state.isLoading = false;
            state.sucess=false;
        }
    }
})

export default slice.reducer;

export const getBetInfo = ()=> {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.setLoading());
            let {data} = await axios.get(`${API_BASE}/betinfo`);
            dispatch(slice.actions.setBetInfoData(data.cycleId));
            console.log("cycleId", data.cycleId)
            localStorage.setItem("cycleId", data.cycleId)
        } catch (error) {
            console.log("error", error);
            dispatch(slice.actions.hasError())
        }

    }
}