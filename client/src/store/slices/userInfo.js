import {
    createSlice
} from '@reduxjs/toolkit';

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL

let initialState = {
    sucess:false,
    isLoading:false,
    userInfoData:[]
};

const slice = createSlice({
    name:"userInfo",
    initialState,
    reducers:{
        setLoading(state, action) {
            state.isLoading = true;
        },
        setUserInfoData(state, action) {
            state.isLoading = false;
            state.sucess=true;
            state.userInfoData = action.payload;

        },
        hasError(state, action) {
            state.isLoading = false;
            state.sucess=false;
        }
    }
})

export default slice.reducer;

export const getUserInfoData = (acc)=> {
    return async (dispatch) => {
        try {
            dispatch(slice.actions.setLoading());
            let {data} = await axios.get(`${API_BASE}/getUserInfo?userAddress=${acc}`);
            dispatch(slice.actions.setUserInfoData(data.data));
        } catch (error) {
            console.log("error get user info", error);
            dispatch(slice.actions.hasError())
        }

    }
}