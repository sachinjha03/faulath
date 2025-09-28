'use client'
import React, { createContext } from "react";

export const MyContext = createContext();

export const MainContext = ({children}) => {
    // const backendURL = "https://bcm-backend.onrender.com"
    const backendURL = "http://localhost:8000"
    // const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL
    return (
        <MyContext.Provider value={{backendURL}}>
            {children}
        </MyContext.Provider>
    )
}