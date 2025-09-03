'use client';
import React, { useEffect, useState, useContext } from 'react';
import styles from "../data/page.module.css";
import { jwtDecode } from 'jwt-decode';
import formStructure from './formConfig';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useRouter } from 'next/navigation';
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
import DownloadBIAData from '../components/DownloadBIAData';

export default function Page() {
  const router = useRouter();
  const [requiredData, setRequiredData] = useState({});
  const [successScreen, setSuccessScreen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rows, setRows] = useState([]);
  const [baseRows, setBaseRows] = useState([]);
  const [approveScreen, setApproveScreen] = useState(false);
  const [rowToApprove, setRowToApprove] = useState(null);
  const [rejectScreen, setRejectScreen] = useState(false);
  const [rowToReject, setRowToReject] = useState(null);
  const [adminApproveScreen, setAdminApproveScreen] = useState(false);
  const [adminRejectScreen, setAdminRejectScreen] = useState(false);
  const [rowForAdminAction, setRowForAdminAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sendButton, setSendButton] = useState("Send To Owner");
  const [editButton, setEditButton] = useState("Save Changes");
  const [displayLoadingScreen, setDisplayLoadingScreen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [logoutScreen, setLogoutScreen] = useState(false);
  const [notificationScreen, setNotificationScreen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const MyContextApi = useContext(MyContext);
  const [commentPopup, setCommentPopup] = useState({ open: false, rowId: null, field: null });
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});
  const [rawData , setRawData] = useState([])

  const sanitize = (name) => name.replace(/[^a-zA-Z0-9]/g, "_");

  // METHODS TO FETCH REQUIRED DATA FROM AUTHENTICATION TOKEN
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      const decoded_token = jwtDecode(token);
      if (decoded_token.department == "BIA") {
        setRequiredData(decoded_token || {});
        fetchNotifications();
      } else {
        router.push("/data");
      }
    }
  }, []);

  useEffect(() => {
    if (requiredData.company && rows.length === 0) {
      setRows([createEmptyRow()]);
    }
  }, [requiredData]);

  useEffect(() => {
    if (requiredData?.userId && requiredData.company && requiredData.module) {
      fetchData(requiredData);
    }
  }, [requiredData]);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;
    try {
      const res = await fetch(`${MyContextApi.backendURL}/api/read-all-notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

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

  // HANDLE LOGOUT
  const displayLogoutScreen = () => {
    setLogoutScreen(true);
  };
  const hideLogoutScreen = () => {
    setLogoutScreen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    router.push('/');
  };

  // FETCHING EXISTING DATA OF BUSINESS IMPACT ANALYSIS
  const fetchData = async (requiredData) => {
    const authToken = localStorage.getItem("auth-token");
    try {
      const response = await fetch(`${MyContextApi.backendURL}/api/read-business-impact-analysis-data/${requiredData.userId}`, {
        method: 'GET',
        headers: { 'authorization': `Bearer ${authToken}`, 'content-type': 'application/json' }
      });
      const json = await response.json();
      if (!json.success) return console.error(json.message);
      setRawData(json.data)
      const fields = formStructure[requiredData.company?.toLowerCase()]?.[requiredData.module] || [];
      const formattedRows = json.data.map(entry => {
        const dynamicRow = {
          id: Date.now() + Math.random(),
          submitted: true,
          editable: false,
          dataId: entry._id,
          currentStatus: entry.currentStatus || "Draft",
          createdBy: entry.createdBy,
          userId: entry.userId,
          lastEditedBy: entry.lastEditedBy || null
        };

        if (entry.formData && typeof entry.formData === 'object') {
          Object.entries(entry.formData).forEach(([key, value]) => {
            const matchedField = fields.find(f => key === sanitize(f.name));
            if (matchedField) {
              dynamicRow[matchedField.name] = {
                value: value?.value || "",
                comments: Array.isArray(value?.comments) ? value.comments : []
              };
            }
          });
        }

        // Ensure all fields exist even if missing in formData
        fields.forEach(f => {
          if (!dynamicRow[f.name]) dynamicRow[f.name] = { value: "", comments: [] };
        });

        return dynamicRow;
      });

      setBaseRows(formattedRows);
      setRows([...formattedRows, createEmptyRow()]);
    } catch (err) {
      console.error("Error fetching BIA data:", err);
    }
    setDisplayLoadingScreen(false);
  };



const exportToExcel = async () => {
  if (!baseRows || baseRows.length === 0) return;

  const fields = getFields(); // dynamic fields from formConfig.js

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("BIA Data");

  // Build headers dynamically
  const columns = [
    { header: "S.No", key: "sno", width: 6 },
    ...fields.flatMap(field => [
      { header: field.label, key: field.name, width: Math.max(field.label.length, 20) },
      { header: `${field.label} Comments`, key: `${field.name}Comments`, width: 40 }
    ]),
    { header: "Status", key: "status", width: 25 },
    { header: "Last Edit", key: "lastEdit", width: 40 }
  ];

  worksheet.columns = columns;

  // Format comments array
  const formatComments = (arr) =>
    (arr || [])
      .map(
        (c) =>
          `[${new Date(c.date).toLocaleDateString("en-GB")} ${new Date(
            c.date
          ).toLocaleTimeString()}] ${c.text}${c.author ? ` (by ${c.author})` : ""}`
      )
      .join("\n");

  // Add data rows
  baseRows.forEach((row, index) => {
    const rowData = { sno: index + 1 };

    fields.forEach(field => {
      const fieldValue = row[field.name];
      if (typeof fieldValue === "object" && fieldValue !== null) {
        rowData[field.name] = fieldValue.value || "";
        rowData[`${field.name}Comments`] = formatComments(fieldValue.comments);
      } else {
        rowData[field.name] = fieldValue || "";
        rowData[`${field.name}Comments`] = "";
      }
    });

    rowData.status = row.currentStatus;
    rowData.lastEdit = row.lastEditedBy
      ? `${row.lastEditedBy.email}, ${row.lastEditedBy.date}, ${row.lastEditedBy.time}`
      : "Not Edited Yet";

    worksheet.addRow(rowData);
  });

  // Apply wrapping style to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: "top" };
    });
  });

  // Generate file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "BIAData.xlsx");
};



  const getFields = () => {
    const company = requiredData.company?.toLowerCase();
    const module = requiredData.module;
    return formStructure[company]?.[module] || [];
  };

  

  const createEmptyRow = () => {
    const fields = getFields();
    const newRow = { id: Date.now(), submitted: false, editable: true };
    fields.forEach(field => {
      newRow[field.name] = { value: "", comments: [] };
    });
    newRow.currentStatus = 'Draft';
    return newRow;
  };

  const enableEdit = (id) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, editable: true } : row
      )
    );
  };

  const handleChange = (rowId, fieldName, newValue) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === rowId
          ? {
            ...row,
            [fieldName]: {
              value: typeof newValue === "object" ? JSON.stringify(newValue) : newValue,
              comments: row[fieldName]?.comments || []
            }
          }
          : row
      )
    );
  };


  const handleSubmit = async (row) => {
    const fields = getFields();
    const isEmpty = fields.some(f => !String(row[f.name]?.value || "").trim());
    if (isEmpty) return alert("Please fill all fields before submitting.");

    const token = localStorage.getItem("auth-token");

    // Flatten all values just before sending to backend
    const formData = {};
    fields.forEach(f => {
      const fieldData = row[f.name] || {};
      let value = fieldData.value;

      // If somehow value is nested, flatten it
      if (value && typeof value === "object" && "value" in value) {
        value = value.value;
      }

      formData[sanitize(f.name)] = {
        value: value || "",
        comments: fieldData.comments || []
      };
    });

    const payload = {
      company: requiredData.company,
      department: requiredData.department,
      module: requiredData.module,
      createdBy: requiredData.email,
      userId: requiredData.userId,
      formData
    };

    try {
      setLoading(true);
      if (row.dataId) {
        setEditButton("Saving...");
        const res = await fetch(`${MyContextApi.backendURL}/api/update-business-impact-analysis-data/${row.dataId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...payload,
            currentStatus: "Pending for Owner Approval",
            lastEditedBy: { email: requiredData.email }
          })
        });
        const json = await res.json();
        if (json.success) {
          alert("Changes Saved Successfully!");
          setRows(prev =>
            prev.map(r =>
              r.id === row.id
                ? {
                  ...r,
                  editable: false,
                  currentStatus: "Pending for Owner Approval",
                  dataId: json.data._id
                }
                : r
            )
          );
        } else {
          alert("Update failed.");
        }
      } else {
        setSendButton("Sending...");
        const res = await fetch(`${MyContextApi.backendURL}/api/add-business-impact-analysis-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          alert("Data sent to owner successfully!");
          const updatedRows = rows.map(r =>
            r.id === row.id
              ? {
                ...r,
                submitted: true,
                editable: false,
                currentStatus: "Pending for Owner Approval",
                _id: json.data._id,
                dataId: json.data._id
              }
              : r
          );
          updatedRows.push(createEmptyRow());
          setRows(updatedRows);
        } else {
          alert("Submission failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("An error occurred while submitting the data.");
    } finally {
      setSendButton("Send To Owner");
      setEditButton("Save Changes");
      setLoading(false);
    }
  };



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
        const response = await fetch(`${MyContextApi.backendURL}/api/delete-business-impact-analysis-data/${row.dataId}`, {
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
      const response = await fetch(`${MyContextApi.backendURL}/api/update-business-impact-analysis-data/${row.dataId}`, {
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
      const response = await fetch(`${MyContextApi.backendURL}/api/update-business-impact-analysis-data/${row.dataId}`, {
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

  const getRowStatusClass = (status = "") => {
    const normalized = status.toLowerCase();
    if (normalized === "draft") return styles.rowDraft;
    if (normalized === "pending for owner approval") return styles.rowPending;
    if (normalized.startsWith("approved by owner")) return styles.rowApprovedOwner;
    if (normalized === "final approved by admin") return styles.rowFinalApproved;
    if (normalized.startsWith("rejected by owner")) return styles.rowRejectedOwner;
    if (normalized.startsWith("rejected by admin")) return styles.rowRejectedAdmin;
    return "";
  };

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
  const saveComment = async () => {
    if (!commentPopup.rowId || !commentPopup.field) return;

    const row = rows.find(r => String(r.id) === String(commentPopup.rowId));
    if (!row) {
      console.error("No matching row/dataId for comment");
      return;
    }

    const trimmed = commentText.trim();
    const newCommentObj = {
      text: trimmed,
      date: formatDateTime(),
    };

    // Update local rows state (for instant UI feedback)
    setRows(prev =>
      prev.map(r =>
        String(r.id) === String(commentPopup.rowId)
          ? {
            ...r,
            [commentPopup.field]: {
              ...r[commentPopup.field],
              comments: trimmed === ""
                ? (r[commentPopup.field]?.comments || [])
                : [...(r[commentPopup.field]?.comments || []), newCommentObj]
            }
          }
          : r
      )
    );

    // Persist only if there's a real comment and the row is saved (has dataId)
    if (trimmed !== "" && row.dataId) {
      try {
        const token = localStorage.getItem("auth-token");
        await fetch(
          `${MyContextApi.backendURL}/api/update-business-impact-analysis-data/${row.dataId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fieldName: sanitize(commentPopup.field),
              newComment: trimmed,
            })
          }
        );
      } catch (err) {
        console.error("Failed to save comment:", err);
        // optional: rollback UI if you want
      }
    }

    closeCommentPopup();
  };




  return (
    <div className={styles.dataPage}>
      <img src="Line.png" alt="" className={styles.topLine} />
      {/* <img src="Line.png" alt="" className={styles.bottomLine} /> */}
      {notificationScreen && (
        <div className={styles.notificationScreen}>
          <div className={styles.notificationBox}>
            <CloseIcon className={styles.notificationScreenCloseIcon} onClick={() => setNotificationScreen(false)} />
            {notifications.length !== 0 ? (
              notifications.map((elem) => (
                <div
                  key={elem._id}
                  className={`${styles.myNotification} ${deletingId === elem._id ? styles.fadeOutNotification : ''}`}
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
                  <p className={styles.notificationMessage}>{elem.message}</p>
                  <DeleteIcon
                    className={styles.notificationCloseIcon}
                    onClick={() => deleteNotification(elem._id)}
                  />
                </div>
              ))
            ) : (
              <div className={styles.noNotificationBox}>
                <h3>No New Notifications...</h3>
              </div>
            )}
          </div>
        </div>
      )}
      <div className={styles.notificationCircle} onClick={() => setNotificationScreen(true)}>
        <NotificationImportantIcon className={styles.notificationIcon} />
        {notifications.length > 0 && <div className={styles.notificationAlert}></div>}
      </div>
      <div className={styles.dataPageTop}>
        <div className={styles.dataPageTopLeft}>
          <h3>{requiredData.company} : {requiredData.department} {requiredData.department == "RA" ? "(Risk Assessment)" : "(Business Impact Analysis)"} </h3>
          <h3>({requiredData.module})</h3>
          <h4>Logged In As : {requiredData.role}</h4>
        </div>
        <div className={styles.dataPageTopRight}>
          <div className={styles.myProfile}>
            <AccountCircleIcon className={styles.profileIcon} />
            <div className={styles.myProfileDetails}>
              <h4>{requiredData.email}</h4>
              <button className={`btn-a ${styles.filterBtn}`}>Ledger</button>
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
        {displayLoadingScreen && (
          <div className={styles.loadingScreen}>
            <h3>Loading Data...</h3>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              {getFields().map(field => <th key={field.name}>{field.label}</th>)}
              <th>Actions</th>
              <th>Status</th>
              <th>Last Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={getRowStatusClass(row.currentStatus)}>
                <td>{index + 1}</td>
                {getFields().map(field => (
                  <td key={field.name} className={styles.cellWithIcon}>
                    {field.type !== "text" ? (
                      <div style={{ position: "relative" }}>
                        <input
                          type={field.type}
                          value={typeof row[field.name] === 'object' ? row[field.name]?.value || '' : row[field.name] || ''}
                          onChange={(e) => handleChange(row.id, field.name, e.target.value)}
                          disabled={requiredData.role === 'admin' || (row.submitted && !row.editable)}
                          className="input-field"
                        />
                        <AddCommentIcon
                          style={{ position: "absolute", top: 10, right: 10, cursor: "pointer", color: "#1976d2" }}
                          onClick={() => openCommentPopup(row.id, field.name, "add")}
                          titleAccess="Add Comment"
                        />
                        <VisibilityIcon
                          style={{ position: "absolute", top: 30, right: 10, cursor: "pointer", color: "#1976d2" }}
                          onClick={() => openCommentPopup(row.id, field.name, "view")}
                          titleAccess="View Comments"
                        />
                      </div>
                    ) : (
                      <div style={{ position: "relative" }}>
                        <textarea
                          className="input-field"
                          value={typeof row[field.name] === 'object' ? row[field.name]?.value || '' : row[field.name] || ''}
                          onChange={(e) => handleChange(row.id, field.name, e.target.value)}
                          disabled={requiredData.role === 'admin' || (row.submitted && !row.editable)}
                        />
                        <AddCommentIcon
                          style={{ position: "absolute", top: 10, right: 10, cursor: "pointer", color: "#1976d2" }}
                          onClick={() => openCommentPopup(row.id, field.name, "add")}
                          titleAccess="Add Comment"
                        />
                        <VisibilityIcon
                          style={{ position: "absolute", top: 30, right: 10, cursor: "pointer", color: "#1976d2" }}
                          onClick={() => openCommentPopup(row.id, field.name, "view")}
                          titleAccess="View Comments"
                        />
                      </div>
                    )}
                  </td>

                ))}
                <td>
                  {!row.submitted && row.editable && requiredData.role === 'champion' && (
                    <>
                      <button className={`btn-a ${styles.successBtn}`} onClick={() => handleSubmit(row)} disabled={loading}>{sendButton}</button>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}
                  {row.submitted && row.editable &&
                    (requiredData.role === 'champion' || requiredData.role === 'owner') &&
                    !row.currentStatus?.startsWith("Approved By Owner") &&
                    !row.currentStatus?.startsWith("Rejected By Owner") && (
                      <>
                        <button className={`btn-a ${styles.successBtn}`} onClick={() => handleSubmit(row)} disabled={loading}>{editButton}</button>
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                      </>
                    )}
                  {row.submitted && !row.editable &&
                    (requiredData.role === 'champion' || requiredData.role === 'owner') &&
                    row.currentStatus === 'Pending for Owner Approval' && (
                      <button className={`btn-a ${styles.editBtn}`} onClick={() => enableEdit(row.id)}>Edit</button>
                    )}
                  {requiredData.role === 'owner' &&
                    !row.editable &&
                    row.currentStatus === 'Pending for Owner Approval' && (
                      <>
                        <button className={`btn-a ${styles.successBtn}`} onClick={() => displayApprovalScreen(row)}>Approve</button>
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displayRejectScreen(row)}>Reject</button>
                      </>
                    )}
                  {requiredData.role === 'admin' &&
                    !row.editable &&
                    row.currentStatus?.startsWith("Approved By Owner") && (
                      <>
                        <button className={`btn-a ${styles.successBtn}`} onClick={() => displayAdminApproveScreen(row)}>Final Approve</button>
                        <button className={`btn-a ${styles.failBtn}`} onClick={() => displayAdminRejectScreen(row)}>Reject</button>
                      </>
                    )}
                  {(row.currentStatus?.startsWith("Approved By Owner") || row.currentStatus?.startsWith("Final Approved")) &&
                    (requiredData.role !== 'admin' && requiredData.role !== "super admin") && (
                      <button className={`btn-a ${styles.disabledBtn}`} disabled>Locked</button>
                    )}
                  {(row.currentStatus?.startsWith("Rejected By") && requiredData.role === 'champion') &&
                    requiredData.role !== 'admin' && (
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    )}
                  {requiredData.role === 'super admin' && row.editable ? (
                    <button className={`btn-a ${styles.successBtn}`} onClick={() => handleSubmit(row)} disabled={loading}>
                      {editButton}
                    </button>
                  ) : requiredData.role === 'super admin' && !row.editable ? (
                    <button className={`btn-a ${styles.editBtn}`} onClick={() => enableEdit(row.id)}>
                      Edit
                    </button>
                  ) : null}
                  {(row.currentStatus?.startsWith("Rejected By") && requiredData.role === 'super admin') && (
                    <>
                      <button className={`btn-a ${styles.successBtn}`} onClick={() => displayApprovalScreen(row)}>Approve</button>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}
                  {(row.currentStatus?.startsWith("Approved By Owner")) && (requiredData.role === 'super admin') && (
                    <>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displayAdminRejectScreen(row)}>Reject</button>
                      <button className={`btn-a ${styles.successBtn}`} onClick={() => displayAdminApproveScreen(row)}>Final Approve</button>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}
                  {(row.currentStatus?.startsWith("Final Approved")) && (requiredData.role === 'super admin') && (
                    <>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displayAdminRejectScreen(row)}>Reject</button>
                      <button className={`btn-a ${styles.failBtn}`} onClick={() => displaySuccessScreen(row.id)}>Delete</button>
                    </>
                  )}
                  {requiredData.role === 'super admin' &&
                    row.currentStatus === 'Pending for Owner Approval' && (
                      <>
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
                </td>
                <td className={styles.currentStatusTD}>
                  <div style={{ minWidth: '200px' }}>
                    {row.currentStatus}
                  </div>
                </td>
                <td>
                  <div className={styles.lastEditedByBox}>
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
        {successScreen && (
          <SuccessScreen
            icon={<WarningIcon style={{ fontSize: 50, color: "orangered" }} />}
            heading={"Do You Really Want To Delete This Data?"}
            headingColor={"orangered"}
            message={"This operation is irreversible. Deleting will remove the data permanently."}
            successButtonColor={"orangered"}
            successButtonText={"Yes, Delete It"}
            cancelText={"Cancel"}
            onConfirm={deleteRow}
            onCancel={hideSuccessScreen}
          />
        )}
        {approveScreen && (
          <SuccessScreen
            icon={<CheckCircleIcon style={{ fontSize: 50, color: "green" }} />}
            heading={"Do You Really Want To APPROVE This Data?"}
            headingColor={"green"}
            message={"This data will be sent to admin for final approval."}
            secondaryMessage={"NO EDIT can be performed after approval"}
            successButtonColor={"green"}
            successButtonText={"Yes, Approve"}
            cancelText={"Cancel"}
            onConfirm={() => {
              handleOwnerDecision(rowToApprove, 'approve');
              setApproveScreen(false);
              setRowToApprove(null);
            }}
            onCancel={() => {
              setApproveScreen(false);
              setRowToApprove(null);
            }}
          />
        )}
        {rejectScreen && (
          <SuccessScreen
            icon={<WarningIcon style={{ fontSize: 50, color: "orangered" }} />}
            heading={"Do You Really Want To REJECT This Data?"}
            headingColor={"orangered"}
            message={"This action is irreversible. No Further actions can be taken"}
            successButtonColor={"orangered"}
            successButtonText={"Yes, Reject"}
            cancelText={"Cancel"}
            onConfirm={() => {
              handleOwnerDecision(rowToReject, 'reject');
              setRejectScreen(false);
              setRowToReject(null);
            }}
            onCancel={() => {
              setRejectScreen(false);
              setRowToReject(null);
            }}
          />
        )}
        {adminApproveScreen && (
          <SuccessScreen
            icon={<CheckCircleIcon style={{ fontSize: 50, color: "green" }} />}
            heading={"Confirm Final Approval"}
            headingColor={"green"}
            message={"This is the final approval. This step is irreversible."}
            successButtonColor={"green"}
            successButtonText={"Yes, Approve"}
            cancelText={"Cancel"}
            onConfirm={() => {
              handleAdminDecision(rowForAdminAction, 'approve');
              setAdminApproveScreen(false);
              setRowForAdminAction(null);
            }}
            onCancel={() => {
              setAdminApproveScreen(false);
              setRowForAdminAction(null);
            }}
          />
        )}
        {adminRejectScreen && (
          <SuccessScreen
            icon={<WarningIcon style={{ fontSize: 50, color: "orangered" }} />}
            heading={"Are You Sure You Want To Reject?"}
            headingColor={"orangered"}
            message={"This is irreversible step. Please recheck before rejecting"}
            successButtonText={"Yes, Reject"}
            cancelText={"Cancel"}
            onConfirm={() => {
              handleAdminDecision(rowForAdminAction, 'reject');
              setAdminRejectScreen(false);
              setRowForAdminAction(null);
            }}
            onCancel={() => {
              setAdminRejectScreen(false);
              setRowForAdminAction(null);
            }}
          />
        )}
        {logoutScreen && (
          <SuccessScreen
            icon={<ExitToAppIcon style={{ fontSize: 50, color: "orangered" }} />}
            heading={"Do You Want To LOGOUT ?"}
            headingColor={"orangered"}
            message={"You can simply login again with your credentials"}
            secondaryMessage={"Thank You"}
            successButtonText={"Yes, Logout"}
            cancelText={"Cancel"}
            onConfirm={handleLogout}
            onCancel={hideLogoutScreen}
          />
        )}

        <Dialog open={commentPopup.open} onClose={closeCommentPopup} fullWidth maxWidth="sm">
          <DialogTitle>
            {commentPopup.mode === "view" ? "View Comments" : "Add Comment"}
          </DialogTitle>

          <DialogContent>
            {commentPopup.mode === "view" ? (
              (() => {
                const currentRow = rows.find(r => String(r.id) === String(commentPopup.rowId));
                const existing = currentRow?.[commentPopup.field]?.comments || [];
                return existing.length > 0 ? (
                  existing.map((c, i) => (
                    <p key={i}><strong>{c.date}:</strong> {c.text}</p>
                  ))
                ) : (
                  <p>No comments yet.</p>
                );
              })()
            ) : (
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

      <DownloadBIAData/>
    </div>
  );
}