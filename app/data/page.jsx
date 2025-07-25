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
  const [rows, setRows] = useState([{ id: Date.now(), risks: '', definition: '', category: 'operational', likelihood: '3', impact: '4', riskScore: 12, existingControl: '', control: 50, residualRisk: 5, mitigationPlan: '', riskOwner: '', currentStatus: "Draft", submitted: false, editable: true, lastEditedBy: 'Not Edited Yet' }]);
  const [sendButton, setSendButton] = useState("Send To Owner")
  const [editButton, setEditButton] = useState('Save Changes')
  const [loading, setLoading] = useState(false)
  const [displayLoadingScreen, setDisplayLoadingScreen] = useState(true)
  const [logoutScreen, setLogoutScreen] = useState(false)

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
        }
      } else {
        router.push("/bia-data")
      }
    }
  }, []);



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
          lastEditedBy: item.lastEditedBy || '',
        }));



        const newData = [...formattedData, {
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
          editable: true,
          lastEditedBy: 'Not Edited Yet'
        }];



        setBaseRows(newData);
        setRows(newData);
      }

    } catch (err) {
      console.error("Failed to fetch risk data:", err);
    }
    setDisplayLoadingScreen(false)
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
        control: 50,
        residualRisk: 5,
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
          if (field === 'likelihood' || field === 'impact') {
            const likelihood = field === 'likelihood' ? parseInt(value) : parseInt(row.likelihood || 0);
            const impact = field === 'impact' ? parseInt(value) : parseInt(row.impact || 0);
            updatedRow.riskScore = likelihood * impact;
          }
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
      control: Number(row.control),
      residualRisk: row.residualRisk,
      mitigationPlan: row.mitigationPlan,
      riskOwner: row.riskOwner,
      approvedBy: "",
      finalApprovedBy: "",
      currentStatus: "Pending for Owner Approval",
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






  return (
    <div className={styles.dataPage}>
      <div className={styles.dataPageTop}>
        <div className={styles.dataPageTopLeft}>
          <h3>{requiredData.company} : {requiredData.department}</h3>
          <h4>Logged In As : {requiredData.role}</h4>
        </div>
        <div className={styles.dataPageTopRight}>
          <h4>{requiredData.email}</h4>
          <button className="btn-a" onClick={displayLogoutScreen}>Logout</button>
        </div>
      </div>

      <div className={styles.dataPageBottom}>
        <div className={styles.featureRow}>
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
                {/* <li onClick={() => handleFilter("Newest First")}>Newest First</li>
                <li onClick={() => handleFilter("Oldest First")}>Oldest First</li> */}
                <li onClick={() => handleFilter("Pending for Owner Approval")}>Pending For Owner Approval</li>
                <li onClick={() => handleFilter("Approved By Owner")}>Approved By Owner</li>
                <li onClick={() => handleFilter("Rejected By Owner")}>Rejected By Owner</li>
                <li onClick={() => handleFilter("Approved By Admin")}>Approved By Admin</li>
                <li onClick={() => handleFilter("Rejected By Admin")}>Rejected By Admin</li>
              </ul>
            </div>
          </div>
        </div>
        {displayLoadingScreen && <div className={styles.loadingScreen}>
          <h3>Loading Data...</h3>
        </div>}
        <table>
          <thead>
            <tr>
              <th>#S.No</th>
              <th>Risks</th>
              <th>Definition/Potential Cause</th>
              <th>Category</th>
              <th>Likelihood</th>
              <th>Impact</th>
              <th>Risk Score</th>
              <th>Existing Control</th>
              <th>Control %</th>
              <th>Residual Risk</th>
              <th>Mitigation Plan</th>
              <th>Risk Owner</th>
              <th>Actions</th>
              <th>Status</th>
              <th>Last Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={getRowStatusClass(row.currentStatus)}>
                <td>{String(index + 1).padStart(3, '0')}</td>

                {/* Risks */}
                <td>
                  <textarea name="risks" className="input-field"
                    value={row.risks}
                    onChange={(e) => handleInputChange(row.id, "risks", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
                </td>

                {/* Definition */}
                <td>
                  <textarea name="definition" className="input-field"
                    value={row.definition}
                    onChange={(e) => handleInputChange(row.id, "definition", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
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
                <td style={{ backgroundColor: colorMap[row.likelihood] || "transparent" }}>
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
                <td style={{ backgroundColor: colorMap[row.impact] || "transparent" }}>
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
                <td style={{backgroundColor:row.riskScore >= 1 && row.riskScore <= 2? "#59bd59ff": row.riskScore >= 3 && row.riskScore <= 9? "#FFFF00": "#FF0000"}}>
                  <input
                    type="number"
                    className="input-field"
                    value={row.riskScore} disabled />
                </td>

                {/* Existing Control */}
                <td>
                  <textarea name="existingControl" className="input-field"
                    value={row.existingControl}
                    onChange={(e) => handleInputChange(row.id, "existingControl", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
                </td>


                {/* Control */}
                <td style={{backgroundColor:row.control >= 0 && row.control <= 24? "#FF0000": row.control >= 25 && row.control <= 49? "#ffae00ff": row.control >= 50 && row.control <= 74? "#FFFF00" :"#59bd59ff"}}>
                  <input
                    type="number"
                    className="input-field"
                    value={row.control}
                    onChange={(e) => handleInputChange(row.id, "control", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}
                  />
                </td>

                {/* Residual Risk */}
                <td>
                  <input
                    type="number"
                    className="input-field"
                    value={row.residualRisk}
                    onChange={(e) => handleInputChange(row.id, "residualRisk", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}
                  />
                </td>

                {/* Mitigation Plan */}
                <td>
                  <textarea name="mitigationPlan" className="input-field"
                    value={row.mitigationPlan}
                    onChange={(e) => handleInputChange(row.id, "mitigationPlan", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
                </td>

                {/* Risk Owner */}
                <td>
                  <textarea name="riskOwner" className="input-field"
                    value={row.riskOwner}
                    onChange={(e) => handleInputChange(row.id, "riskOwner", e.target.value)}
                    disabled={requiredData.role === "admin" || row.submitted && !row.editable}></textarea>
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
                    requiredData.role !== 'admin' && (
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



      </div >
    </div >
  );
}
