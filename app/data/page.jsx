'use client';
import React, { useContext, useEffect, useState } from 'react';
import styles from "./page.module.css";
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { MyContext } from '../context/ContextApi';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SuccessScreen from '../components/SuccessScreen';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCommentIcon from "@mui/icons-material/AddComment";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DownloadRAData from '../components/DownloadRAData';
import { createExcelFile, uploadBackup, getFormattedDate } from '../utils/backupUtils';




export default function Page() {
  const router = useRouter();
  const [requiredData, setRequiredData] = useState({});
  const [rowToDelete, setRowToDelete] = useState(null);
  const [successScreen, setSuccessScreen] = useState(false);
  const [approveScreen, setApproveScreen] = useState(false)
  const [rowToApprove, setRowToApprove] = useState(null);
  const [rejectScreen, setRejectScreen] = useState(false);
  const [rowToReject, setRowToReject] = useState(null);
  const [adminApproveScreen, setAdminApproveScreen] = useState(false);
  const [adminRejectScreen, setAdminRejectScreen] = useState(false);
  const [rowForAdminAction, setRowForAdminAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [baseRows, setBaseRows] = useState([]);
  const [rows, setRows] = useState([{ id: Date.now(), risks: '', definition: '', category: 'operational', likelihood: '3', impact: '4', riskScore: 12, existingControl: '', controlEffectiveness: "Strong", control: 75, residualRisk: 3, treatmentOption: "Treat", mitigationPlan: '', riskOwner: '', currentStatus: "Draft", submitted: false, editable: true, lastEditedBy: 'Not Edited Yet' }]);
  const [sendButton, setSendButton] = useState("Send To Owner")
  const [editButton, setEditButton] = useState('Save Changes')
  const [loading, setLoading] = useState(false)
  const [displayLoadingScreen, setDisplayLoadingScreen] = useState(true)
  const [logoutScreen, setLogoutScreen] = useState(false)
  const [notificationScreen, setNotificationScreen] = useState(false)
  const [notifications, setNotifications] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [commentPopup, setCommentPopup] = useState({ open: false, rowId: null, field: null });
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});
  const [rawData, setRawData] = useState([])
  const [likelihoodFilter, setLikelihoodFilter] = useState("");
  const [impactFilter, setImpactFilter] = useState("");
  const [controlEffectivenessFilter, setControlEffectivenessFilter] = useState("");







  const colorMap = {
    1: "#59cc59ff",
    2: "#FFFF00",
    3: "#ffae00ff",
    4: "#990000",
    5: "#FF0000"
  };


  const MyContextApi = useContext(MyContext)






  // RETRIEVE IMPORTANT INFO FROM AUTHENTICATION TOKEN
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      const decoded_token = jwtDecode(token);
      if (decoded_token.department == "RA") {
        setRequiredData(decoded_token || {});
        if (decoded_token?.userId) {
          fetchRiskData(decoded_token.userId);
          fetchNotifications();
        }
      } else {
        router.push("/bia-data")
      }
    }
  }, []);


  // FETCH NOTIFICATIONS
  // const decoded = jwtDecode(token);
  // const userRole = decoded?.role;
  const fetchNotifications = async () => {
    const token = localStorage.getItem("auth-token");

    if (!token) return;

    try {

      const res = await fetch(`${MyContextApi.backendURL}/api/read-all-notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const json = await res.json();
      // console.log(json);

      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      // setLoadingNotifications(false);
    }
  };

  // console.log(notifications)


  // const markAsRead = async (id) => {
  //   const token = localStorage.getItem("auth-token");
  //   try {
  //     await fetch(`${MyContextApi.backendURL}/api/notifications/${id}/read`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     });
  //     fetchNotifications(); 
  //   } catch (err) {
  //     console.error("Error marking as read", err);
  //   }
  // };

  const deleteNotification = async (id) => {
    const token = localStorage.getItem("auth-token");
    try {
      setDeletingId(id);
      await fetch(`${MyContextApi.backendURL}/api/delete-notification/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Error clearing notifications", err);
    }
  };




  // FETCH EXISTING RISK ASSESSMENT DATA FROM THE SERVER
  const fetchRiskData = async (userId) => {
    try {
      const token = localStorage.getItem("auth-token");
      const res = await fetch(`${MyContextApi.backendURL}/api/read-risk-assessment-data/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRawData(json.data)
        const formattedData = json.data.map((item) => ({
          id: Date.now() + Math.random(),
          dataId: item._id,

          // unwrap values
          risks: item.risks?.value || "",
          definition: item.definition?.value || "",
          category: item.category?.value || "operational",
          likelihood: String(item.likelihood?.value || 3),
          impact: String(item.impact?.value || 4),
          riskScore: item.riskScore?.value || 12,
          existingControl: item.existingControl?.value || "",
          controlEffectiveness: item.controlEffectiveness?.value || "Strong",
          control: item.control?.value || 75,
          residualRisk: item.residualRisk?.value || 5,
          treatmentOption: item.treatmentOption?.value || "Treat",
          mitigationPlan: item.mitigationPlan?.value || "",
          riskOwner: item.riskOwner?.value || "",

          currentStatus: item.currentStatus || "Draft",
          submitted: true,
          editable: false,
          lastEditedBy: item.lastEditedBy || "Not Edited Yet",

          // keep raw comments for this row
          _comments: {
            risks: item.risks?.comments || [],
            definition: item.definition?.comments || [],
            category: item.category?.comments || [],
            likelihood: item.likelihood?.comments || [],
            impact: item.impact?.comments || [],
            riskScore: item.riskScore?.comments || [],
            existingControl: item.existingControl?.comments || [],
            controlEffectiveness: item.controlEffectiveness?.comments || [],
            control: item.control?.comments || [],
            residualRisk: item.residualRisk?.comments || [],
            treatmentOption: item.treatmentOption?.comments || [],
            mitigationPlan: item.mitigationPlan?.comments || [],
            riskOwner: item.riskOwner?.comments || [],
          }
        }));

        // ➕ Always add a blank row for new entry
        const newData = [
          ...formattedData,
          {
            id: Date.now(),
            risks: '',
            definition: '',
            category: 'operational',
            likelihood: '3',
            impact: '4',
            riskScore: 12,
            existingControl: '',
            controlEffectiveness: "Strong",
            control: 75,
            residualRisk: 3,
            treatmentOption: "Treat",
            mitigationPlan: '',
            riskOwner: '',
            currentStatus: 'Draft',
            submitted: false,
            editable: true,
            lastEditedBy: 'Not Edited Yet',
            _comments: {
              risks: [],
              definition: [],
              category: [],
              likelihood: [],
              impact: [],
              riskScore: [],
              existingControl: [],
              control: [],
              residualRisk: [],
              mitigationPlan: [],
              riskOwner: []
            }
          }
        ];

        setBaseRows(newData);
        setRows(newData);

        // ✅ Build comments state from fetched rows
        const commentsMap = {};
        newData.forEach(row => {
          commentsMap[row.id] = row._comments;
        });
        setComments(commentsMap);
      }
    } catch (err) {
      console.error("Failed to fetch risk data:", err);
    }
    setDisplayLoadingScreen(false);
  };

  // console.log(rawData);

  const formatComments = (comments = []) =>
    comments.map(c => `${c.date}: ${c.text}`).join(" | ");

  // Map rows to a format suitable for Excel
  // .filter(row => row.risks && row.risks.trim() !== "")
  // const exportToExcel = () => {
  //   if (!rows || rows.length === 0) return;
  //   const exportData = rawData
  //     .map((elem, index) => ({
  //       "S.No": index + 1,
  //       "Risks": elem.risks.value,
  //       "Risks Comment" : formatComments(elem.risks.comments),
  //       "Definition/Potential Cause": elem.definition.value,
  //       "Definition Comment" : elem.definition.comments,
  //       "Category": elem.category.value,
  //       "Likelihood": elem.likelihood.value,
  //       "Impact": elem.impact.value,
  //       "Risk Score": elem.riskScore.value,
  //       "Existing Control": elem.existingControl.value,
  //       "Existing Control Comment" : elem.existingControl.comments,
  //       "Control %": elem.control.value,
  //       "Residual Risk": elem.residualRisk.value,
  //       "Mitigation Plan": elem.mitigationPlan.value,
  //       "Mitigation Plan Comment" : elem.mitigationPlan.comments,
  //       "Risk Owner": elem.riskOwner.value,
  //       "Risk Owner Comment" : elem.riskOwner.comments,
  //       "Status": elem.currentStatus,
  //       "Last Edit": elem.lastEditedBy
  //         ? `${elem.lastEditedBy.email}, ${elem.lastEditedBy.date}, ${elem.lastEditedBy.time}`
  //         : "Not Edited Yet"
  //     }));

  //     // console.log(exportData);



  //   // Create a worksheet
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Risk Data");

  //   // --- Column Widths ---
  //   worksheet['!cols'] = [
  //     { wch: 6 },   // S.No
  //     { wch: 40 },  // Risks
  //     { wch: 40 },  // Risks Comment
  //     { wch: 40 },  // Definition
  //     { wch: 40 },  // Definition Comment
  //     { wch: 15 },  // Category
  //     { wch: 12 },  // Likelihood
  //     { wch: 12 },  // Impact
  //     { wch: 12 },  // Risk Score
  //     { wch: 40 },  // Existing Control
  //     { wch: 40 },  // Existing Control Comment
  //     { wch: 12 },  // Control %
  //     { wch: 15 },  // Residual Risk
  //     { wch: 40 },  // Mitigation Plan
  //     { wch: 40 },  // Mitigation Plan Comment
  //     { wch: 40 },  // Risk Owner
  //     { wch: 40 },  // Risk Owner Comment
  //     { wch: 35 },  // Status
  //     { wch: 40 }   // Last Edit
  //   ];

  //   Object.keys(worksheet).forEach((cell) => {
  //   if (cell[0] === "!") return; // skip meta keys
  //   if (!worksheet[cell].s) worksheet[cell].s = {};
  //   worksheet[cell].s.alignment = { wrapText: true, vertical: "top" };
  // });

  //   // Write workbook and save
  //   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  //   const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  //   saveAs(data, "RiskData.xlsx");
  // };


  const exportToExcel = async () => {
    if (!rows || rows.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Risk Data");

    // Define headers
    worksheet.columns = [
      { header: "S.No", key: "sno", width: 6 },
      { header: "Risks", key: "risks", width: 40 },
      { header: "Risks Comment", key: "risksComments", width: 40 },
      { header: "Definition/Potential Cause", key: "definition", width: 40 },
      { header: "Definition Comment", key: "definitionComments", width: 40 },
      { header: "Category", key: "category", width: 15 },
      { header: "Likelihood", key: "likelihood", width: 12 },
      { header: "Impact", key: "impact", width: 12 },
      { header: "Risk Score", key: "riskScore", width: 12 },
      { header: "Existing Control", key: "existingControl", width: 40 },
      { header: "Existing Control Comment", key: "existingControlComments", width: 40 },
      { header: "Control Effectiveness", key: "controlEffectiveness", width: 15 },
      { header: "Control %", key: "control", width: 12 },
      { header: "Residual Risk", key: "residualRisk", width: 15 },
      { header: "Treatment Option", key: "treatmentOption", width: 15 },
      { header: "Mitigation Plan", key: "mitigationPlan", width: 40 },
      { header: "Mitigation Plan Comment", key: "mitigationPlanComments", width: 40 },
      { header: "Risk Owner", key: "riskOwner", width: 40 },
      { header: "Risk Owner Comment", key: "riskOwnerComments", width: 40 },
      { header: "Status", key: "status", width: 35 },
      { header: "Last Edit", key: "lastEdit", width: 40 },
    ];

    // Function to format comments array
    const formatComments = (arr) =>
      (arr || [])
        .map(
          (c) =>
            `[${new Date(c.date).toLocaleDateString("en-GB")} ${new Date(
              c.date
            ).toLocaleTimeString()}] ${c.text}`
        )
        .join("\n");

    // Add rows
    rawData.forEach((elem, index) => {
      worksheet.addRow({
        sno: index + 1,
        risks: elem.risks.value,
        risksComments: formatComments(elem.risks.comments),
        definition: elem.definition.value,
        definitionComments: formatComments(elem.definition.comments),
        category: elem.category.value,
        likelihood: elem.likelihood.value,
        impact: elem.impact.value,
        riskScore: elem.riskScore.value,
        existingControl: elem.existingControl.value,
        existingControlComments: formatComments(elem.existingControl.comments),
        controlEffectiveness: elem.controlEffectiveness.value,
        controlEffectivenessComments: formatComments(elem.controlEffectiveness.comments),
        control: elem.control.value,
        residualRisk: elem.residualRisk.value,
        treatmentOption: elem.treatmentOption.value,
        treatmentOption: formatComments(elem.treatmentOption.comments),
        mitigationPlan: elem.mitigationPlan.value,
        mitigationPlanComments: formatComments(elem.mitigationPlan.comments),
        riskOwner: elem.riskOwner.value,
        riskOwnerComments: formatComments(elem.riskOwner.comments),
        status: elem.currentStatus,
        lastEdit: elem.lastEditedBy
          ? `${elem.lastEditedBy.email}, ${elem.lastEditedBy.date}, ${elem.lastEditedBy.time}`
          : "Not Edited Yet",
      });
    });

    // Apply wrapping style to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: "top" };
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "RiskData.xlsx");
  };




  // CHANGE THE COLOR OR ROW BASED UPON THEIR CURRENT STATUS
  const getRowStatusClass = (status = "") => {
    const normalized = status.toLowerCase();
    if (normalized === "draft") return styles.rowDraft;
    if (normalized === "pending for owner approval") return styles.rowPending;
    if (normalized.startsWith("approved by owner")) return styles.rowApprovedOwner;
    if (normalized === "final approved by admin") return styles.rowFinalApproved;
    if (normalized.startsWith("rejected by owner")) return styles.rowRejectedOwner;
    if (normalized.startsWith("rejected by admin")) return styles.rowRejectedAdmin;
    // if (normalized === "data created by super admin") return styles.rowCreatedBySuperAdmin;
    return "";
  };




  // FUNCTION TO ADD NEW ROW
  const addRow = () => {
    setRows(prev => [
      ...prev,
      {
        id: Date.now(),
        risks: '',
        definition: '',
        category: 'operational',
        likelihood: '3',
        impact: '4',
        riskScore: 12,
        existingControl: '',
        controlEffectiveness: 'Strong',
        control: 75,
        residualRisk: 3,
        mitigationPlan: '',
        riskOwner: '',
        currentStatus: 'Draft',
        submitted: false,
        editable: true,
        lastEditedBy: 'Not Edited Yet'
      }
    ]);
  };



  // HANDLE LOGOUT
  const displayLogoutScreen = () => {
    setLogoutScreen(true)
  }
  const hideLogoutScreen = () => {
    setLogoutScreen(false)
  }
  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    router.push('/');
  };



  // ALL METHODS INCLUDING IN THE PROCESS TO DELETE RISK ASSSESSMENT DATA FROM THE SERVER
  const displaySuccessScreen = (id) => {
    setRowToDelete(id);
    setSuccessScreen(true);
  };

  const hideSuccessScreen = () => {
    setRowToDelete(null);
    setSuccessScreen(false);
  };
  const deleteRow = async () => {
    if (!rowToDelete) return;
    const row = rows.find(r => r.id === rowToDelete);
    try {
      if (row?.dataId) {
        const token = localStorage.getItem("auth-token");
        const response = await fetch(`${MyContextApi.backendURL}/api/delete-risk-assessment-data/${row.dataId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await response.json();
        if (!json.success) {
          alert("Failed to delete data from server");
          return;
        }

      }
      setRows(prev => prev.filter(r => r.id !== rowToDelete));
      setRowToDelete(null);
      setSuccessScreen(false);
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error while deleting data");
    }
  };




  // HANDLE INPUT CHANGE WHENEVER USER ENTER VALUES IN THE FIELD
  const handleInputChange = (id, field, value) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // Parse existing values safely
          const likelihood = parseInt(field === 'likelihood' ? value : row.likelihood || 0);
          const impact = parseInt(field === 'impact' ? value : row.impact || 0);
          const control = parseInt(field === 'control' ? value : row.control || 0);

          // Calculate riskScore
          updatedRow.riskScore = likelihood * impact;

          // Calculate residualRisk using the formula
          updatedRow.residualRisk = (likelihood * impact) * (1 - (control / 100));

          return updatedRow;
        }
        return row;
      })
    );
  };



  // HANDLE DATA SUBMISSION AND DATA UPDATE TO ADD/UPDATE RISK ASSESSMENT DATA TO THE SERVER
  const handleSubmit = async (row) => {
    const hasEmptyField = Object.entries(row)
      .filter(([key]) => !['id', 'submitted', 'editable', 'riskScore', 'dataId', 'lastEditedBy'].includes(key))
      .some(([_, val]) => {
        if (typeof val === 'string') return val.trim() === '';
        return val === null || val === undefined;
      });
    if (hasEmptyField) {
      alert("Please fill all fields properly in this row (spaces are not valid)");
      return;
    }
    const payload = {
      risks: row.risks,
      definition: row.definition,
      category: row.category,
      likelihood: Number(row.likelihood),
      impact: Number(row.impact),
      riskScore: row.riskScore,
      existingControl: row.existingControl,
      controlEffectiveness: row.controlEffectiveness,
      control: Number(row.control),
      residualRisk: row.residualRisk,
      treatmentOption: row.treatmentOption,
      mitigationPlan: row.mitigationPlan,
      riskOwner: row.riskOwner,
      approvedBy: "",
      finalApprovedBy: "",
      currentStatus: requiredData.role === "super admin"
        ? "Data Created By Super Admin"   // 👈 Directly approved
        : "Pending for Owner Approval",      // 👈 Default flow for others
      company: requiredData.company,
      ...(row.dataId
        ? {
          lastEditedBy: { email: requiredData.email },
          userId: row.userId,
          createdBy: row.createdBy
        }
        : {
          createdBy: requiredData.email,
          userId: requiredData.userId,
          lastEditedBy: null
        })
    };


    setLoading(true)
    try {
      let response;
      const token = localStorage.getItem("auth-token");
      if (row.dataId) {
        setEditButton("Saving...")
        response = await fetch(`${MyContextApi.backendURL}/api/update-risk-assessment-data/${row.dataId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        setSendButton("Sending...")
        response = await fetch(`${MyContextApi.backendURL}/api/add-risk-assessment-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }
      const json = await response.json();
      // console.log(json);

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
        if (!row.dataId) addRow();
      } else {
        alert("Failed to save data");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("An error occurred while submitting data");
    }
    setEditButton("Save Changes")
    setSendButton("Send To Owner")
    setLoading(false)
  };




  // ENABLE EDIT OPTION TO THE USER
  const enableEdit = (id) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, editable: true } : row
      )
    );
  };




  // ALL METHODS THAT ARE USED FOR OWNER APPROVAL/REJECTION OF DATA
  const displayApprovalScreen = (row) => {
    setRowToApprove(row);
    setApproveScreen(true);
  };
  const displayRejectScreen = (row) => {
    setRowToReject(row);
    setRejectScreen(true);
  };
  const handleOwnerDecision = async (row, decision) => {
    const token = localStorage.getItem("auth-token");

    const updatedStatus = decision === 'approve'
      ? "Approved By Owner , Waiting for final approval"
      : "Rejected By Owner";
    const payload = {
      currentStatus: updatedStatus,
      lastEditedBy: requiredData.email
    };
    if (decision === 'approve') {
      payload.approvedBy = requiredData.email;
    }
    try {
      const response = await fetch(`${MyContextApi.backendURL}/api/update-risk-assessment-data/${row.dataId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (json.success) {
        setRows(prev =>
          prev.map(r =>
            r.id === row.id
              ? { ...r, currentStatus: updatedStatus }
              : r
          )
        );
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      alert("Error occurred while updating status.");
    }
  };




  // ALL METHODS THAT ARE USED FOR DATA APPROVAL/REJECTION BY ADMIN
  const displayAdminApproveScreen = (row) => {
    setRowForAdminAction(row);
    setAdminApproveScreen(true);
  };

  const displayAdminRejectScreen = (row) => {
    setRowForAdminAction(row);
    setAdminRejectScreen(true);
  };

  const handleAdminDecision = async (row, decision) => {
    const token = localStorage.getItem("auth-token");
    const updatedStatus = decision === 'approve'
      ? "Final Approved By Admin"
      : "Rejected By Admin";
    const payload = {
      currentStatus: updatedStatus,
      lastEditedBy: requiredData.email
    };
    if (decision === 'approve') {
      payload.finalApprovedBy = requiredData.email;
    }
    try {
      const response = await fetch(`${MyContextApi.backendURL}/api/update-risk-assessment-data/${row.dataId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (json.success) {
        setRows(prev =>
          prev.map(r =>
            r.id === row.id
              ? { ...r, currentStatus: updatedStatus }
              : r
          )
        );
      } else {
        alert("Failed to update final approval status.");
      }
    } catch (err) {
      alert("Error occurred during final approval.");
    }
  };



  //FUNTION TO SEARCH DATA BASED UPON ENTERED VALUE
  const handleSearch = (term) => {
    setSearchTerm(term);
    let filtered = [...baseRows];

    if (term.trim() !== "") {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          typeof value === "string" && value.toLowerCase().includes(term.toLowerCase())
        )
      );
    }

    if (filterStatus && filterStatus !== "") {
      filtered = applyFilterLogic(filtered, filterStatus);
    }

    setRows(filtered);
  };




  //FUNCTION TO FILTER THE DATA
  const handleFilter = (filter) => {
    setFilterStatus(filter);
    let filtered = [...baseRows];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filter && filter !== "") {
      filtered = applyFilterLogic(filtered, filter);
    }

    setRows(filtered);
  };


  const applyFilterLogic = (rows, filter) => {
    if (!filter) return rows;

    const statusFilters = [
      "Pending for Owner Approval",
      "Approved By Owner",
      "Rejected By Owner",
      "Pending for Admin Approval",
      "Approved By Admin",
      "Rejected By Admin"
    ];

    if (statusFilters.includes(filter)) {
      return rows.filter(row =>
        row.currentStatus?.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (filter === "Newest First") {
      return rows.sort((a, b) => b.id - a.id);
    }

    if (filter === "Oldest First") {
      return rows.sort((a, b) => a.id - b.id);
    }

    return rows;
  };


  const openCommentPopup = (rowId, field, mode) => {
    setCommentPopup({ open: true, rowId, field, mode }); // mode: "add" or "view"
    setCommentText("");
  };


  const closeCommentPopup = () => {
    setCommentPopup({ open: false, rowId: null, field: null });
  };
  const formatDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2); // last 2 digits
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  // function getFormattedDate() {
  //   const today = new Date();
  //   const dd = String(today.getDate()).padStart(2, "0");
  //   const mm = String(today.getMonth() + 1).padStart(2, "0");
  //   const yy = String(today.getFullYear()).slice(-2);

  //   return `${dd}/${mm}/${yy}`;
  // }

  const saveComment = async () => {
    if (!commentPopup.rowId || !commentPopup.field) return;

    const row = rows.find(r => String(r.id) === String(commentPopup.rowId));
    // if (!row || !row.rowId) {
    //   console.error("No matching row/dataId for comment");
    //   return;
    // }

    const newCommentObj = {
      text: commentText.trim(),
      date: formatDateTime()
    };

    // Update local state
    setComments(prev => {
      const existing = prev[commentPopup.rowId]?.[commentPopup.field] || [];
      return {
        ...prev,
        [commentPopup.rowId]: {
          ...prev[commentPopup.rowId],
          [commentPopup.field]:
            commentText.trim() === "" ? existing : [...existing, newCommentObj],
        },
      };
    });

    // Send to backend if not empty
    if (commentText.trim() !== "") {
      try {
        const token = localStorage.getItem("auth-token");
        await fetch(`${MyContextApi.backendURL}/api/update-risk-assessment-data/${row.dataId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fieldName: commentPopup.field,   // must be lowercase
            newComment: commentText.trim(),
          }),
        });
      } catch (err) {
        console.error("Failed to save comment:", err);
      }
    }

    closeCommentPopup();
  };



  // console.log(rows);

  const filteredRows = rows.filter(row => {
    const likelihoodMatch =
      likelihoodFilter === "" ||
      Number(row.likelihood) === Number(likelihoodFilter);

    const impactMatch =
      impactFilter === "" ||
      Number(row.impact) === Number(impactFilter);

    const controlEffectivenessMatch =
      controlEffectivenessFilter === "" ||
      row.controlEffectiveness === controlEffectivenessFilter;

    return likelihoodMatch && impactMatch && controlEffectivenessMatch;
  });


   const { backendURL } = useContext(MyContext);

  const handleBackupButtonClick = async () => {
    try {
      const { buffer, fileName } = await createExcelFile(rawData);
      await uploadBackup(buffer, fileName , backendURL);
      alert("Backup uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Backup failed: " + error.message);
    }
  };






  return (
    <div className={styles.dataPage}>
      <img src="Line.png" alt="" className={styles.topLine} />
      {/* <img src="Line.png" alt="" className={styles.bottomLine} /> */}
      {notificationScreen && <div className={styles.notificationScreen}>
        <div className={styles.notificationBox}>
          <CloseIcon className={styles.notificationScreenCloseIcon} onClick={() => { setNotificationScreen(false) }} />
          {notifications.length != 0 ? (
            notifications.map((elem) => (
              <div
                key={elem._id} className={`${styles.myNotification} ${deletingId === elem._id ? styles.fadeOutNotification : ''}`}
                onAnimationEnd={() => {
                  if (deletingId === elem._id) {
                    setNotifications(prev => prev.filter(n => n._id !== elem._id));
                    setDeletingId(null);
                  }
                }}
              >
                <div className={styles.myNotificationCircle}>
                  <NotificationImportantIcon className={styles.notificationIcon} />
                </div>
                <p className={styles.notificationMessage}>{elem.message} [{elem.createdAtFormatted}]</p>
                <DeleteIcon
                  className={styles.notificationCloseIcon}
                  onClick={() => deleteNotification(elem._id)}
                />
              </div>
            ))
          ) :
            <div className={styles.noNotificationBox}>
              <h3>No New Notifications...</h3>
            </div>
          }

        </div>
      </div>}
      <div className={styles.notificationCircle} onClick={() => { setNotificationScreen(true) }}>
        <NotificationImportantIcon className={styles.notificationIcon} />
        {(notifications.length > 0) && <div className={styles.notificationAlert}></div>}
      </div>
      <div className={styles.dataPageTop}>
        <div className={styles.dataPageTopLeft}>
          <h3>{requiredData.company} : {requiredData.department} {requiredData.department == "RA" ? "(Risk Assessment)" : "(Business Impact Analysis)"}</h3>
          <h4>Logged In As : {requiredData.role}</h4>
        </div>
        <div className={styles.dataPageTopRight}>
          <div className={styles.myProfile}>
            <AccountCircleIcon className={styles.profileIcon} />
            <div className={styles.myProfileDetails}>
              <h4>{requiredData.email}</h4>
              {/* <button className={`btn-a flex-btn ${styles.filterBtn}`}onClick={handleBackupButtonClick}>Backup Till {getFormattedDate().display}</button> */}

              <button className="btn-a" onClick={displayLogoutScreen}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.featureRow}>
        <div className={styles.featureRowLeft}>
          <input
            type="text"
            className={`input-field ${styles.searchField}`}
            placeholder="Search Data"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className={styles.filter}>
            <button className={`btn-a flex-btn ${styles.filterBtn}`}>
              <FilterAltIcon />
              <p>Filter Data</p>
            </button>
            <div className={styles.filterMenu}>
              <ul>
                <li onClick={() => handleFilter("")}>Remove Filter</li>
                <li onClick={() => handleFilter("Pending for Owner Approval")}>Pending For Owner Approval</li>
                <li onClick={() => handleFilter("Approved By Owner")}>Approved By Owner</li>
                <li onClick={() => handleFilter("Rejected By Owner")}>Rejected By Owner</li>
                <li onClick={() => handleFilter("Approved By Admin")}>Approved By Admin</li>
                <li onClick={() => handleFilter("Rejected By Admin")}>Rejected By Admin</li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.featureRowRight}>
          <button className={`btn-a flex-btn ${styles.exportBtn}`} onClick={exportToExcel}>
            <SystemUpdateAltIcon />
            <p>Export Data</p>
          </button>
        </div>
      </div>
      <div className={styles.dataPageBottom}>
        {displayLoadingScreen && <div className={styles.loadingScreen}>
          <h3>Loading Data...</h3>
        </div>}
        <table>
          <thead>
            <tr>
              <th colSpan={4} style={{ backgroundColor: "#37d92bff" }}>Risk Identification</th>
              <th colSpan={6} style={{ backgroundColor: "#FFFF00" }}>Risk Analysis</th>
              <th style={{ backgroundColor: "#3c9decff" }}>Risk Evaluation</th>
              <th colSpan={2} style={{ backgroundColor: "#e819b1ff" }}>Risk Treatment</th>
              <th colSpan={1} style={{ backgroundColor: "#56c4f4ff" }}>Risk Owner</th>
              <th colSpan={3} style={{ backgroundColor: "#ff8c00ff" }}>Data Status</th>
            </tr>
            <tr>
              <th>#S.No</th>
              <th>Risks</th>
              <th>Definition/Potential Cause</th>
              <th>Category</th>
              <th>
                Likelihood<br />
                <select
                  value={likelihoodFilter}
                  onChange={(e) => setLikelihoodFilter(e.target.value)}
                  className="filter-dropdown"
                >
                  <option value="">All</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </th>
              <th>
                Impact<br />
                <select
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value)}
                  className="filter-dropdown"
                >
                  <option value="">All</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </th>
              <th>Risk Score</th>
              <th>Existing Control</th>
              <th>
                Control Effectiveness<br />
                <select
                  value={controlEffectivenessFilter}
                  onChange={(e) => setControlEffectivenessFilter(e.target.value)}
                  className="filter-dropdown"
                >
                  <option value="">All</option>
                  <option value="Strong">Strong</option>
                  <option value="Adequate">Adequate</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Not Effective">Not Effective</option>
                </select>
              </th>

              <th>Control %</th>
              <th>Residual Risk</th>
              <th>Treatment Option</th>
              <th>Mitigation Plan</th>
              <th>Risk Owner</th>
              <th>Actions</th>
              <th>Status</th>
              <th>Last Edit</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={row.id} className={getRowStatusClass(row.currentStatus)}>
                <td>{String(index + 1).padStart(3, '0')}</td>

                {/* Risks */}
                <td className={styles.cellWithIcon}>
                  <div style={{ position: "relative" }}>
                    <textarea
                      name="risks"
                      className="input-field"
                      value={row.risks}
                      onChange={(e) => handleInputChange(row.id, "risks", e.target.value)}
                      disabled={requiredData.role === "admin" || (row.submitted && !row.editable)}
                    ></textarea>

                    {/* Add Comment Button */}
                    <AddCommentIcon
                      style={{ position: "absolute", top: 10, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "risks", "add")}
                      titleAccess="Add Comment"
                    />

                    {/* View Comment Button */}
                    <VisibilityIcon
                      style={{ position: "absolute", top: 30, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "risks", "view")}
                      titleAccess="View Comments"
                    />
                  </div>
                </td>


                {/* Definition */}
                <td className={styles.cellWithIcon}>
                  <div style={{ position: "relative" }}>
                    <textarea name="definition" className="input-field"
                      value={row.definition}
                      onChange={(e) => handleInputChange(row.id, "definition", e.target.value)}
                      disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
                    <AddCommentIcon
                      style={{ position: "absolute", top: 10, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "definition", "add")}
                      titleAccess="Add Comment"
                    />
                    <VisibilityIcon
                      style={{ position: "absolute", top: 30, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "definition", "view")}
                      titleAccess="View Comments"
                    />
                  </div>
                </td>

                {/* Category */}
                <td>
                  <select
                    className="input-field"
                    value={row.category}
                    onChange={(e) => handleInputChange(row.id, "category", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}
                  >
                    <option value="operational">Operational</option>
                    <option value="financial">Financial</option>
                    <option value="reputational">Reputational</option>
                    <option value="environmental">Environmental</option>
                    <option value="business">Business</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="technological">Technological</option>
                    <option value="hsse">HSSE</option>
                    <option value="hse">HSE</option>
                    <option value="other">Other</option>
                  </select>
                </td>

                {/* Likelihood */}
                <td style={{ backgroundColor: colorMap[row.likelihood] || "transparent", position: "relative" }} className={styles.dropDownOption} >
                  <select
                    className="input-field"
                    value={row.likelihood}
                    onChange={(e) => handleInputChange(row.id, "likelihood", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </td>

                {/* Impact */}
                <td style={{ backgroundColor: colorMap[row.impact] || "transparent", position: "relative" }} className={styles.dropDownOption}>
                  <select
                    className="input-field"
                    value={row.impact}
                    onChange={(e) => handleInputChange(row.id, "impact", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </td>

                {/* Risk Score */}
                <td style={{ backgroundColor: row.riskScore >= 1 && row.riskScore <= 2 ? "#59bd59ff" : row.riskScore >= 3 && row.riskScore <= 9 ? "#FFFF00" : "#FF0000", position: "relative" }} className={styles.dropDownOption}>
                  <input
                    type="number"
                    className="input-field"
                    value={row.riskScore} disabled />
                </td>

                {/* Existing Control */}
                <td className={styles.cellWithIcon}>
                  <div style={{ position: "relative" }}>
                    <textarea name="existingControl" className="input-field"
                      value={row.existingControl}
                      onChange={(e) => handleInputChange(row.id, "existingControl", e.target.value)}
                      disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
                    <AddCommentIcon
                      style={{ position: "absolute", top: 10, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "existingControl", "add")}
                      titleAccess="Add Comment"
                    />
                    <VisibilityIcon
                      style={{ position: "absolute", top: 30, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "existingControl", "view")}
                      titleAccess="View Comments"
                    />
                  </div>
                </td>

                {/* Control Effectiveness */}
                <td>
                  <select
                    className="input-field"
                    value={row.controlEffectiveness}
                    onChange={(e) => {
                      const selectedEffectiveness = e.target.value;
                      let controlValue = 25;  // Default fallback

                      if (selectedEffectiveness === "Strong") controlValue = 75;
                      else if (selectedEffectiveness === "Adequate") controlValue = 50;
                      else if (selectedEffectiveness === "Needs Improvement") controlValue = 25;
                      else if (selectedEffectiveness === "Not Effective") controlValue = 0;

                      handleInputChange(row.id, "controlEffectiveness", selectedEffectiveness);
                      handleInputChange(row.id, "control", controlValue);
                    }}
                    disabled={requiredData.role === "admin" || (row.submitted && !row.editable)}
                  >
                    <option value="Strong">Strong</option>
                    <option value="Adequate">Adequate</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                    <option value="Not Effective">Not Effective</option>
                  </select>
                </td>

                {/* Control */}
                <td style={{
                  backgroundColor:
                    row.control >= 0 && row.control <= 24 ? "#FF0000" :
                      row.control >= 25 && row.control <= 49 ? "#ffae00ff" :
                        row.control >= 50 && row.control <= 74 ? "#FFFF00" :
                          "#59bd59ff",
                  position: "relative"
                }}>
                  <input
                    type="number"
                    className="input-field"
                    value={row.control}
                    onChange={(e) => handleInputChange(row.id, "control", e.target.value)}
                    // disabled={requiredData.role === "admin" || row.submitted && !row.editable}
                    disabled
                  />
                </td>


                {/* Residual Risk */}
                <td>
                  <input
                    type="number"
                    className="input-field"
                    value={row.residualRisk}
                    onChange={(e) => handleInputChange(row.id, "residualRisk", e.target.value)}
                    // disabled={requiredData.role === "admin" || row.submitted && !row.editable}
                    disabled
                  />
                </td>

                {/* Treatment option */}
                <td>
                  <select
                    className="input-field"
                    value={row.treatmentOption}
                    onChange={(e) => handleInputChange(row.id, "treatmentOption", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}
                  >
                    <option value="Treat">Treat</option>
                    <option value="Tolerate">Tolerate</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Terminate">Terminate</option>
                  </select>
                </td>

                {/* Mitigation Plan */}
                <td className={styles.cellWithIcon}>
                  <div style={{ position: "relative" }}>
                    <textarea name="mitigationPlan" className="input-field"
                      value={row.mitigationPlan}
                      onChange={(e) => handleInputChange(row.id, "mitigationPlan", e.target.value)}
                      disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
                    <AddCommentIcon
                      style={{ position: "absolute", top: 10, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "mitigationPlan", "add")}
                      titleAccess="Add Comment"
                    />
                    <VisibilityIcon
                      style={{ position: "absolute", top: 30, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "mitigationPlan", "view")}
                      titleAccess="View Comments"
                    />
                  </div>
                </td>

                {/* Risk Owner */}
                <td className={styles.cellWithIcon}>
                  <div style={{ position: "relative" }}>
                    <textarea name="riskOwner" className="input-field"
                      value={row.riskOwner}
                      onChange={(e) => handleInputChange(row.id, "riskOwner", e.target.value)}
                      disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
                    <AddCommentIcon
                      style={{ position: "absolute", top: 10, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "riskOwner", "add")}
                      titleAccess="Add Comment"
                    />
                    <VisibilityIcon
                      style={{ position: "absolute", top: 30, right: 10, cursor: "pointer", color: "#1976d2" }}
                      onClick={() => openCommentPopup(row.id, "riskOwner", "view")}
                      titleAccess="View Comments"
                    />
                  </div>
                </td>

                {/* Actions */}
                <td>
                  {/* CONDITION 1: Champion creating new draft */}
                  {!row.submitted && row.editable && requiredData.role === 'champion' && (
                    <>
                      <button className={`btn-a ${styles.successBtn}`} onClick={() => handleSubmit(row)} disabled={loading}>{sendButton}</button>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}

                  {/* CONDITION 2: Editable & submitted, and not yet approved/rejected by owner */}
                  {row.submitted && row.editable &&
                    (requiredData.role === 'champion' || requiredData.role === 'owner') &&
                    !row.currentStatus?.startsWith("Approved By Owner") &&
                    !row.currentStatus?.startsWith("Rejected By Owner") && (
                      <>
                        <button className={`btn-a ${styles.successBtn}`} onClick={() => handleSubmit(row)} disabled={loading}>{editButton}</button>
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                      </>
                    )}

                  {/* CONDITION 3: Can edit before approval */}
                  {row.submitted && !row.editable &&
                    (requiredData.role === 'champion' || requiredData.role === 'owner') &&
                    row.currentStatus === 'Pending for Owner Approval' && (
                      <button className={`btn-a ${styles.editBtn}`} onClick={() => enableEdit(row.id)}>Edit</button>
                    )}

                  {/* CONDITION 4: Owner can approve/reject */}
                  {requiredData.role === 'owner' &&
                    !row.editable &&
                    row.currentStatus === 'Pending for Owner Approval' && (
                      <>
                        <button className={`btn-a ${styles.successBtn}`} onClick={() => displayApprovalScreen(row)}>Approve</button>
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displayRejectScreen(row)}>Reject</button>
                      </>
                    )}

                  {/* CONDITION 5: Admin final approval only if Approved By Owner */}
                  {requiredData.role === 'admin' &&
                    !row.editable &&
                    row.currentStatus?.startsWith("Approved By Owner") && (
                      <>
                        <button className={`btn-a ${styles.successBtn}`} onClick={() => displayAdminApproveScreen(row)}>Final Approve</button>
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displayAdminRejectScreen(row)}>Reject</button>
                      </>
                    )}

                  {/* CONDITION 6: Show disabled button to others if locked; never to admin */}
                  {(row.currentStatus?.startsWith("Approved By Owner") || row.currentStatus?.startsWith("Final Approved")) &&
                    (requiredData.role !== 'admin' && requiredData.role !== "super admin") && (
                      <>
                        <button className={`btn-a ${styles.disabledBtn}`} disabled>Locked</button>
                      </>
                    )}
                  {(row.currentStatus?.startsWith("Rejected By") && requiredData.role == 'champion') &&
                    requiredData.role !== 'admin' && (
                      <>
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                      </>
                    )}



                  {/* CONDITION 0: Super Admin conditions do everything regardless of state */}
                  {requiredData.role === 'super admin' && row.editable ? (
                    <button className={`btn-a ${styles.successBtn}`} onClick={() => handleSubmit(row)} disabled={loading}>
                      {editButton[row.id] || "Save Changes"}
                    </button>
                  ) : requiredData.role === 'super admin' && !row.editable ? (
                    <button className={`btn-a ${styles.editBtn}`} onClick={() => enableEdit(row.id)}>
                      {editButton[row.id] || "Edit"}
                    </button>
                  ) : null}
                  {(row.currentStatus?.startsWith("Rejected By") && requiredData.role == 'super admin') && (
                    <>
                      {/* <button className={`btn-a ${styles.editBtn}`} onClick={() => enableEdit(row.id)}>Edit</button> */}
                      <button className={`btn-a ${styles.successBtn}`} onClick={() => displayApprovalScreen(row)}>Approve</button>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}
                  {(row.currentStatus?.startsWith("Approved By Owner")) && (requiredData.role == 'super admin') && (
                    <>
                      {/* <button className={`btn-a ${styles.editBtn}`} onClick={() => enableEdit(row.id)}>Edit</button> */}
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displayAdminRejectScreen(row)}>Reject</button>
                      <button className={`btn-a ${styles.successBtn}`} onClick={() => displayAdminApproveScreen(row)}>Final Approve</button>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}
                  {(row.currentStatus?.startsWith("Final Approved")) && (requiredData.role == 'super admin') && (
                    <>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displayAdminRejectScreen(row)}>Reject</button>
                      {/* <button className={`btn-a ${styles.editBtn}`} onClick={() => enableEdit(row.id)}>Edit</button> */}
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}
                  {requiredData.role === 'super admin' &&
                    row.currentStatus === 'Pending for Owner Approval' && (
                      <>
                        {/* <button className={`btn-a ${styles.editBtn}`} onClick={() => enableEdit(row.id)}>Edit</button> */}
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displayAdminRejectScreen(row)}>Reject</button>
                        <button className={`btn-a ${styles.successBtn}`} onClick={() => displayApprovalScreen(row)}>Approve</button>
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                      </>
                    )}
                  {!row.submitted && row.editable && requiredData.role === 'super admin' && (
                    <>
                      <button className={`btn-a ${styles.successBtn}`} onClick={() => handleSubmit(row)} disabled={loading}>{sendButton}</button>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}
                  {/* If created by Super Admin → only Edit + Delete */}
                  {requiredData.role === "super admin" &&
                    row.currentStatus === "Data Created By Super Admin" && (
                      <>
                        {/* <button
                          className={`btn-a ${styles.editBtn}`}
                          onClick={() => enableEdit(row.id)}
                        >
                          {editButton[row.id] || "Edit"}
                        </button> */}
                        <button
                          className={`btn-a ${styles.failBtn}`}
                          onClick={() => displaySuccessScreen(row.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}

                </td>

                {/* <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button> */}
                {/* <button className={`btn-a ${styles.disabledBtn}`} disabled>Locked</button> */}

                {/* Current Status */}
                <td className={styles.currentStatusTD}>
                  <div style={{ minWidth: '200px' }}>
                    {row.currentStatus}
                  </div>
                </td>

                <td>
                  <div className={styles.lastEditedByBox} style={{}}>
                    {row.lastEditedBy &&
                      row.lastEditedBy.email &&
                      row.lastEditedBy.date &&
                      row.lastEditedBy.time ? (
                      <div>
                        <p>Email: {row.lastEditedBy.email}</p>
                        <p>Date: {row.lastEditedBy.date}</p>
                        <p>Time: {row.lastEditedBy.time}</p>
                      </div>
                    ) : (
                      <p>Not Edited Yet</p>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>




        {successScreen && <SuccessScreen icon={<WarningIcon style={{ fontSize: 50, color: "orangered" }} />} heading={"Do You Really Want To Delete This Data?"} headingColor={"orangered"} message={"This operation is irreversible. Deleting will remove the data permanently."} successButtonColor={"orangered"} successButtonText={"Yes, Delete It"} cancelText={"Cancel"} onConfirm={deleteRow} onCancel={hideSuccessScreen} />}


        {approveScreen && <SuccessScreen icon={<CheckCircleIcon style={{ fontSize: 50, color: "green" }} />} heading={"Do You Really Want To APPROVE This Data?"} headingColor={"green"} message={"This data will be sent to admin for final approval."} secondaryMessage={"NO EDIT can be perfored after approval"} successButtonColor={"green"} successButtonText={"Yes, Approve"} cancelText={"Cancel"} onConfirm={() => { handleOwnerDecision(rowToApprove, 'approve'); setApproveScreen(false); setRowToApprove(null); }} onCancel={() => { setApproveScreen(false); setRowToApprove(null); }} />}


        {rejectScreen && <SuccessScreen icon={<WarningIcon style={{ fontSize: 50, color: "orangered" }} />} heading={"Do You Really Want To REJECT This Data?"} headingColor={"orangered"} message={"This action is irreversible. No Further actions can be taken"} successButtonColor={"orangered"} successButtonText={"Yes, Reject"} cancelText={"Cancel"} onConfirm={() => { handleOwnerDecision(rowToReject, 'reject'); setRejectScreen(false); setRowToReject(null); }} onCancel={() => { setRejectScreen(false); setRowToReject(null); }} />}


        {adminApproveScreen && <SuccessScreen icon={<CheckCircleIcon style={{ fontSize: 50, color: "green" }} />} heading={"Confirm Final Approval"} headingColor={"green"} message={"This is the final approval. This step is irreversible."} successButtonColor={"green"} successButtonText={"Yes, Approve"} cancelText={"Cancel"} onConfirm={() => { handleAdminDecision(rowForAdminAction, 'approve'); setAdminApproveScreen(false); setRowForAdminAction(null); }} onCancel={() => { setAdminApproveScreen(false); setRowForAdminAction(null); }} />}


        {adminRejectScreen && <SuccessScreen icon={<WarningIcon style={{ fontSize: 50, color: "orangered" }} />} heading={"Are You Sure You Want To Reject?"} headingColor={"orangered"} message={"This is irreversible step. Please recheck before rejecting"} successButtonText={"Yes, Reject"} cancelText={"Cancel"} onConfirm={() => { handleAdminDecision(rowForAdminAction, 'reject'); setAdminRejectScreen(false); setRowForAdminAction(null); }} onCancel={() => { setAdminRejectScreen(false); setRowForAdminAction(null); }} />}


        {logoutScreen && <SuccessScreen icon={<ExitToAppIcon style={{ fontSize: 50, color: "orangered" }} />} heading={"Do You Want To LOGOUT ?"} headingColor={"orangered"} message={"You can simply login again with your credentials"} secondaryMessage={"Thank You"} successButtonText={"Yes, Logout"} cancelText={"Cancel"} onConfirm={handleLogout} onCancel={hideLogoutScreen} />}

        <Dialog open={commentPopup.open} onClose={closeCommentPopup} fullWidth maxWidth="sm">
          <DialogTitle>
            {commentPopup.mode === "view" ? "View Comments" : "Add Comment"}
          </DialogTitle>

          <DialogContent>
            {commentPopup.mode === "view" ? (
              // SHOW COMMENTS ONLY IN VIEW MODE
              comments[commentPopup.rowId]?.[commentPopup.field]?.length > 0 ? (
                comments[commentPopup.rowId][commentPopup.field].map((c, i) => (
                  <p key={i}><strong>{c.date}:</strong> {c.text}</p>
                ))
              ) : (
                <p>No comments yet.</p>
              )
            ) : (
              // SHOW INPUT ONLY IN ADD MODE
              <TextField
                fullWidth
                label="Add Comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                multiline
                rows={3}
                margin="normal"
              />
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={closeCommentPopup}>Close</Button>
            {commentPopup.mode === "add" && (
              <Button onClick={saveComment} variant="contained">Save</Button>
            )}
          </DialogActions>
        </Dialog>




      </div>
      {requiredData?.role === "super admin" && <DownloadRAData />}

    </div>
  );
}

{/* <div className={styles.ledger}>
                    <div className={styles.ledgerInfo}>
                      <div className={styles.ledgerColor} style={{ backgroundColor: "blue" }}></div>
                      <p className={styles.ledgerDetail}>Detail About Ledger</p>
                    </div>
                    <div className={styles.ledgerInfo}>
                      <div className={styles.ledgerColor} style={{ backgroundColor: "gray" }}></div>
                      <p className={styles.ledgerDetail}>Detail About Ledger</p>
                    </div>
                    <div className={styles.ledgerInfo}>
                      <div className={styles.ledgerColor} style={{ backgroundColor: "pink" }}></div>
                      <p className={styles.ledgerDetail}>Detail About Ledger</p>
                    </div>
                    <div className={styles.ledgerInfo}>
                      <div className={styles.ledgerColor} style={{ backgroundColor: "yellowGreen" }}></div>
                      <p className={styles.ledgerDetail}>Detail About Ledger</p>
                    </div>
                  </div> */}