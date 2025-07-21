'use client'
import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';


export const RiskAssessmentContext = createContext();


export const RiskAssessmentContextProvider = ({ children }) => {
    const [requiredData, setRequiredData] = useState({});
    const [tokenValue, setTokenValue] = useState(null);
    const [rows, setRows] = useState([{ id: Date.now(), risks: '', definition: '', category: 'operational', likelihood: '3', impact: '4', riskScore: 12, existingControl: '', control: 50, residualRisk: 5, mitigationPlan: '', riskOwner: '', currentStatus: "Draft", submitted: false, editable: true }]);


    //WORKING --- RETRIEVING JWT TOKEN IMPORTANT INFORMATIONS
    useEffect(() => {
        const token = localStorage.getItem("auth-token");
        if (token) {
            setTokenValue(token)
            const decoded_token = jwtDecode(token);
            setRequiredData(decoded_token || {});
        } else {
            setRequiredData({ "message": "User Not Logged In" })
        }
    }, []);


    //HALF WORKING --- FUNCTION TO FETCH EXISTING RISK ASSESSMENT DATA FROM THE SERVER AND STORE THEM IN THE ARRAY "REQUIREDDATA"
    useEffect(() => {
        const fetchRiskAssessmentExistingData = async () => {
            if (!requiredData.userId || !tokenValue) return;
            try {
                const response = await fetch(`http://localhost:8000/api/read-risk-assessment-data/${requiredData.userId}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${tokenValue}`
                    }
                });

                const json = await response.json();
                if (json.success && Array.isArray(json.data)) {
                    const formattedData = json.data.map((item) => ({
                        id: Date.now() + Math.random(),
                        dataId: item._id,
                        risks: item.risks,
                        definition: item.definition,
                        category: item.category,
                        likelihood: String(item.likelihood),
                        impact: String(item.impact),
                        riskScore: item.riskScore,
                        existingControl: item.existingControl,
                        control: item.control,
                        residualRisk: item.residualRisk,
                        mitigationPlan: item.mitigationPlan,
                        riskOwner: item.riskOwner,
                        currentStatus: item.currentStatus,
                        submitted: true,
                        editable: false,
                    }));
                    setRows([...formattedData, {
                        id: Date.now(),
                        risks: '',
                        definition: '',
                        category: 'operational',
                        likelihood: '3',
                        impact: '4',
                        riskScore: 12,
                        existingControl: '',
                        control: 50,
                        residualRisk: 5,
                        mitigationPlan: '',
                        riskOwner: '',
                        currentStatus: 'Draft',
                        submitted: false,
                        editable: true
                    }]);
                }
            } catch (error) {
                console.error("Error fetching Risk Assessment Data:", error);
            }
        };

        fetchRiskAssessmentExistingData();

    }, [requiredData.userId, tokenValue]);


    // WORKING -- FUNCTION TO DELETE RISK ASSESSMENT DATA FROM THE SERVER
    const deleteRiskAssessmentData = async (dataId) => {
        const response = await fetch(`http://localhost:8000/api/delete-risk-assessment-data/${dataId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${tokenValue}`,
                'content-type': 'application/json'
            }
        })
        const json = await response.json();
        if (!json.success) {
            alert("Failed to delete data from server")
            return;
        }
    }


    // FUNCTION TO ADD RISK ASSESSMENT DATA TO THE SERVER
    const addRiskAssessmentData = async (dataId, payload) => {
        const response = await fetch("http://localhost:8000/api/add-risk-assessment-data", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenValue}`
            },
            body: JSON.stringify(payload)
        })
        const json = await response.json()
        if (json.success) {
            alert(row.dataId ? "Changes Saved Successfully" : "Data Sent for Approval Successfully");
            const newId = json.data?._id || row.dataId;
            setRows(prev =>
                prev.map(r =>
                    r.id === row.id
                        ? {
                            ...r,
                            submitted: true,
                            editable: false,
                            dataId: newId,
                            createdBy: payload.createdBy,
                            currentStatus: payload.currentStatus
                        }
                        : r
                )
            );
        }
    }


    return (
        <RiskAssessmentContext.Provider value={{ requiredData, rows, deleteRiskAssessmentData }}>
            {children}
        </RiskAssessmentContext.Provider>
    )
}