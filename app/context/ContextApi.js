'use client'
import React, { createContext } from "react";

export const MyContext = createContext();

export const MainContext = ({children}) => {
    const backendURL = "https://bcm-backend.onrender.com"
    // const backendURL = "https://localhost:8000"
    return (
        <MyContext.Provider value={{backendURL}}>
            {children}
        </MyContext.Provider>
    )
}