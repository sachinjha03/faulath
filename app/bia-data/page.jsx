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





export default function Page() {
  const router = useRouter()
  const [requiredData, setRequiredData] = useState({});
  const [successScreen, setSuccessScreen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rows, setRows] = useState([]);
  const [approveScreen, setApproveScreen] = useState(false)
  const [rowToApprove, setRowToApprove] = useState(null);
  const [rejectScreen, setRejectScreen] = useState(false);
  const [rowToReject, setRowToReject] = useState(null);
  const [adminApproveScreen, setAdminApproveScreen] = useState(false);
  const [adminRejectScreen, setAdminRejectScreen] = useState(false);
  const [rowForAdminAction, setRowForAdminAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sendButton, setSendButton] = useState("Send To Owner")
  const [editButton, setEditButton] = useState("Save Changes")
  const [displayLoadingScreen, setDisplayLoadingScreen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [logoutScreen , setLogoutScreen] = useState(false)

  const MyContextApi = useContext(MyContext)





  //METHODS TO FETCH REQUIRED DATA FROM AUTHENTICATION TOKEN
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      const decoded_token = jwtDecode(token);
      if (decoded_token.department == "BIA") {
        setRequiredData(decoded_token || {});
      } else {
        router.push("/data")
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



  // FETCHING EXISTING DATA OF BUSINESS IMPACT ANALYSIS , WHEN THE PAGE IS LOADED
  const fetchData = async (requiredData) => {
    const authToken = localStorage.getItem("auth-token");
    try {
      const response = await fetch(`${MyContextApi.backendURL}/api/read-business-impact-analysis-data/${requiredData.userId}`, {
        method: 'GET',
        headers: {
          'authorization': `Bearer ${authToken}`,
          'content-type': 'application/json'
        }
      });
      const json = await response.json();
      if (!json.success) {
        console.error("Failed to fetch:", json.message);
        return;
      }
      const fields = formStructure[requiredData.company?.toLowerCase()]?.[requiredData.module] || [];
      const formattedRows = json.data.map((entry) => {
        const dynamicRow = {
          id: Date.now() + Math.random(),
          submitted: true,
          editable: false,
          dataId: entry._id,
          currentStatus: entry.currentStatus || "Draft",
          createdBy: entry.createdBy,
          userId: entry.userId,
        };
        if (entry.formData && typeof entry.formData === 'object') {
          Object.entries(entry.formData).forEach(([key, value]) => {
            const matchedField = fields.find(f =>
              key === f.name.replace(/[^a-zA-Z0-9]/g, "_")
            );
            if (matchedField) {
              dynamicRow[matchedField.name] = value;
            }
          });
        }
        return dynamicRow;
      });
      setRows([...formattedRows, createEmptyRow()]);
    } catch (err) {
      console.error("Error fetching BIA data:", err);
    }
    setDisplayLoadingScreen(false)
  };





  const getFields = () => {
    const company = requiredData.company?.toLowerCase();
    const module = requiredData.module;
    return formStructure[company]?.[module] || [];
  };


  // ADDING NEW EMPTY ROWS FOR DATA ENTRY
  const createEmptyRow = () => {
    const fields = getFields();
    const newRow = { id: Date.now(), submitted: false, editable: true };
    fields.forEach(field => newRow[field.name] = '');
    newRow.currentStatus = 'Draft';
    return newRow;
  };



  // ENABLING EDIT WINDOW
  const enableEdit = (id) => {
    setRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, editable: true } : row
      )
    );
  };



  //HANDELING INPUT CHANGE WHENEVER USER ENTER VALUES IN THE FIELD
  const handleChange = (id, name, value) => {
    setRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, [name]: value } : row
      )
    );
  };



  //HANDLING BUSINESS IMPACT ANALYSIS DATA SUBMISSION TO ADD/UPDATE DATA ON THE SERVER
  const handleSubmit = async (row) => {
    const fields = getFields();
    const isEmpty = fields.some(f => !row[f.name]?.trim());
    if (isEmpty) return alert("Please fill all fields before submitting.");
    const token = localStorage.getItem("auth-token");
    const formData = {};
    fields.forEach(f => {
      const sanitizedKey = f.name.replace(/[^a-zA-Z0-9]/g, "_");
      formData[sanitizedKey] = row[f.name];
    });
    const payload = {
      company: requiredData.company,
      department: requiredData.department,
      module: requiredData.module,
      formData,
      createdBy: requiredData.email,
      userId: requiredData.userId,
      lastEditedBy: requiredData.email
    };
    try {
      setLoading(true)
      setEditButton("Saving...")
      if (row.dataId) {
        const res = await fetch(`${MyContextApi.backendURL}/api/update-business-impact-analysis-data/${row.dataId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...payload,
            currentStatus: "Pending for Owner Approval",
            lastEditedBy: requiredData.email
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
        setLoading(true)
        setSendButton("Sending...")
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
            r.id === row.id ? {
              ...r,
              submitted: true,
              editable: false,
              currentStatus: "Pending for Owner Approval",
              _id: json.data._id,
              dataId: json.data._id
            } : r
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
    }
    setSendButton("Send To Owner")
    setEditButton("Save Changes")
    setLoading(false)
  };




  // ALL METHODS THAT ARE INCLUDED IN THE PROCESS OF DATA DELETION FROM THE SERVER
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




  // ALL METHODS THAT ARE INCLUDED IN THE PROCESS OF OWNER APPROVAL/REJECTION 
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




  // ALL METHODS THAT ARE INCLUDED IN THE PROCESS OF ADMIN APPROVAL/REJECTION 
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



  // CHANGE THE BACKGROUND COLOR OR ROWS BASED UPON CURRENT STATUS OF DATA
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





  return (
    <div className={styles.dataPage}>
      <div className="under-construction">
        <img src="/underConstruction.png" alt="" />
        <p>CURRENTLY THIS WEBSITE CAN BE ONLY ACCESSED FROM LAPTOPS AND DESKTOPS. </p>
        <h5>THANKS FOR VISITING US</h5>
      </div>
      <div className={styles.dataPageTop}>
        <div className={styles.dataPageTopLeft}>
          <h3>{requiredData.company} : {requiredData.department} ({requiredData.module})</h3>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.filter}>
            <button className={`btn-a flex-btn ${styles.filterBtn}`}>
              <FilterAltIcon />
              <p>Filter Data</p>
            </button>
            <div className={styles.filterMenu}>
              <ul>
                <li onClick={() => setFilterStatus('')}>Remove Filter</li>
                <li onClick={() => setFilterStatus('Newest First')}>Newest First</li>
                <li onClick={() => setFilterStatus('Oldest First')}>Oldest First</li>
                <li onClick={() => setFilterStatus('Pending for Owner Approval')}>Pending For Owner Approval</li>
                <li onClick={() => setFilterStatus('Approved By Owner')}>Approved By Owner</li>
                <li onClick={() => setFilterStatus('Rejected By Owner')}>Rejected By Owner</li>
                <li onClick={() => setFilterStatus('Final Approved By Admin')}>Approved By Admin</li>
                <li onClick={() => setFilterStatus('Rejected By Admin')}>Rejected By Admin</li>
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
              <th>S.No</th>
              {getFields().map(field => <th key={field.name}>{field.label}</th>)}
              <th>Actions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter(row => {
                const values = getFields().map(f => row[f.name]?.toString().toLowerCase()).join(' ');
                return values.includes(searchQuery.toLowerCase());
              })
              .filter(row => {
                if (!filterStatus || filterStatus === 'Newest First' || filterStatus === 'Oldest First') return true;
                return row.currentStatus?.toLowerCase().includes(filterStatus.toLowerCase());
              })
              .sort((a, b) => {
                if (filterStatus === 'Newest First') return b.id - a.id;
                if (filterStatus === 'Oldest First') return a.id - b.id;
                return 0;
              })
              .map((row, index) => (

                <tr key={row.id} className={getRowStatusClass(row.currentStatus)}>
                  <td>{index + 1}</td>
                  {/* {getFields().map(field => (
                    <td key={field.name}>
                      <input
                        type={field.type}
                        value={row[field.name] || ''}
                        onChange={(e) => handleChange(row.id, field.name, e.target.value)}
                        disabled={requiredData.role === 'admin' || (row.submitted && !row.editable)}
                        className="input-field"
                      />
                    </td>
                  ))} */}
                  {getFields().map(field => (
                    <td key={field.name}>
                      {(field.type != "text") ?
                        <input
                          type={field.type}
                          value={row[field.name] || ''}
                          onChange={(e) => handleChange(row.id, field.name, e.target.value)}
                          disabled={requiredData.role === 'admin' || (row.submitted && !row.editable)}
                          className="input-field"
                        />
                        :
                        <textarea className="input-field"
                          value={row[field.name] || ''}
                          onChange={(e) => handleChange(row.id, field.name, e.target.value)}
                          disabled={requiredData.role === 'admin' || (row.submitted && !row.editable)}></textarea>
                      }
                    </td>
                  ))}
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
                  <td style={{ fontSize: "12px" }}>{row.currentStatus}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {successScreen && (
          <div className="success-screen">
            <div className="success-box">
              <WarningIcon className={styles.deleteIcon} style={{ fontSize: 50 }} />
              <h3>Do You Really Want To Delete This Data?</h3>
              <p>This operation is irreversible. Deleting will remove the data permanently.</p>
              <div className="success-box-button-row">
                <button className="btn-a" onClick={deleteRow}>Yes, Delete It</button>
                <button className="btn-a" onClick={hideSuccessScreen}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {approveScreen && (
          <div className="success-screen approve-screen">
            <div className="success-box approve-box">
              <CheckCircleIcon className={styles.successIcon} style={{ fontSize: 50 }} />
              <h3>Do You Really Want To APPROVE This Data?</h3>
              <p>This data will be sent to admin for final approval.</p>
              <h5><span>NO EDIT</span> Can be performed once approved</h5>
              <div className="success-box-button-row">
                <button
                  className={`btn-a ${styles.successBtn}`}
                  onClick={() => {
                    handleOwnerDecision(rowToApprove, 'approve');
                    setApproveScreen(false);
                    setRowToApprove(null);
                  }}
                >
                  Yes, Approve
                </button>
                <button
                  className="btn-a"
                  onClick={() => {
                    setApproveScreen(false);
                    setRowToApprove(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {rejectScreen && (
          <div className="success-screen approve-screen">
            <div className="success-box approve-box">
              <WarningIcon className={styles.deleteIcon} style={{ fontSize: 50 }} />
              <h3>Do You Really Want To REJECT This Data?</h3>
              <p>This action is irreversible. No Further actions can be taken</p>
              <div className="success-box-button-row">
                <button
                  className={`btn-a ${styles.failBtn}`}
                  onClick={() => {
                    handleOwnerDecision(rowToReject, 'reject');
                    setRejectScreen(false);
                    setRowToReject(null);
                  }}
                >
                  Yes, Reject
                </button>
                <button
                  className="btn-a"
                  onClick={() => {
                    setRejectScreen(false);
                    setRowToReject(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {adminApproveScreen && (
          <div className="success-screen approve-screen">
            <div className="success-box approve-box">
              <CheckCircleIcon className={styles.successIcon} style={{ fontSize: 50 }} />
              <h3>Confirm Final Approval?</h3>
              <p>This is the final approval. This step is irreversible.</p>
              <div className="success-box-button-row">
                <button
                  className={`btn-a ${styles.successBtn}`}
                  onClick={() => {
                    handleAdminDecision(rowForAdminAction, 'approve');
                    setAdminApproveScreen(false);
                    setRowForAdminAction(null);
                  }}
                >
                  Yes, Approve
                </button>
                <button
                  className="btn-a"
                  onClick={() => {
                    setAdminApproveScreen(false);
                    setRowForAdminAction(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {adminRejectScreen && (
          <div className="success-screen approve-screen">
            <div className="success-box approve-box">
              <WarningIcon className={styles.deleteIcon} style={{ fontSize: 50 }} />
              <h3>Are You Sure You Want To Reject?</h3>
              <p>This is irreversible step. Please recheck before rejecting</p>
              <div className="success-box-button-row">
                <button
                  className={`btn-a ${styles.failBtn}`}
                  onClick={() => {
                    handleAdminDecision(rowForAdminAction, 'reject');
                    setAdminRejectScreen(false);
                    setRowForAdminAction(null);
                  }}
                >
                  Yes, Reject
                </button>
                <button
                  className="btn-a"
                  onClick={() => {
                    setAdminRejectScreen(false);
                    setRowForAdminAction(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {logoutScreen && <div className="success-screen logout-screen">
            <div className="success-box logout-box">
              <ExitToAppIcon className={styles.deleteIcon} style={{ fontSize: 50 }} />
              <h3>Do You Want To LOGOUT ?</h3>
              <p>You can simply login again with your credentials</p>
              <h5>Thank You</h5>
              <div className="success-box-button-row">
                <button
                  className={`btn-a ${styles.failBtn}`}
                  onClick={handleLogout}
                >
                  Yes, Logout
                </button>
                <button
                  className="btn-a"
                  onClick={hideLogoutScreen}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>}
      </div>
    </div>
  );
}
