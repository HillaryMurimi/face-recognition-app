import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FaceData {
    id: string;
    age: number;
    gender: string;
    emotion: string;
    box: { x: number; y: number; width: number; height: number }
}

interface FaceState {
    faces: FaceData[];
}

const initialState: FaceState = {
    faces: []
}

const FaceSlice = createSlice({
    name: 'face',
    initialState,
    reducers:{
        setFaces: (state, action: PayloadAction<FaceData[]>) =>{
            state.faces = []
        },
        clearFaces: (state) => {
            state.faces = []
        }
    }
})

export const { setFaces, clearFaces } = FaceSlice.actions
export default FaceSlice.reducer