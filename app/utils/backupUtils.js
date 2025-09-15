import ExcelJS from "exceljs";
// import { MyContext } from '../context/ContextApi';
// import { useContext } from "react";



// Helper: Get formatted date for filename
function getFormattedDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yy = String(today.getFullYear()).slice(-2);
    return { display: `${dd}/${mm}/${yy}`, file: `${dd}-${mm}-${yy}` };
}



// Generate Excel file
export async function createExcelFile(rawData) {
    // const MyContextApi = useContext(MyContext)
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Risk Data");

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

  const formatComments = (arr = []) =>
    arr.map(
      (c) =>
        `[${new Date(c.date).toLocaleDateString("en-GB")} ${new Date(
          c.date
        ).toLocaleTimeString()}] ${c.text}`
    ).join("\n");

  rawData.forEach((elem, index) => {
  worksheet.addRow({
    sno: index + 1,
    risks: elem.risks?.value || '',
    risksComments: formatComments(elem.risks?.comments),
    definition: elem.definition?.value || '',
    definitionComments: formatComments(elem.definition?.comments),
    category: elem.category?.value || '',
    likelihood: elem.likelihood?.value || '',
    impact: elem.impact?.value || '',
    riskScore: elem.riskScore?.value || '',
    existingControl: elem.existingControl?.value || '',
    existingControlComments: formatComments(elem.existingControl?.comments),
    controlEffectiveness: elem.controlEffectiveness?.value || '',
    controlEffectivenessComments: formatComments(elem.controlEffectiveness?.comments),
    control: elem.control?.value || '',
    residualRisk: elem.residualRisk?.value || '',
    treatmentOption: elem.treatmentOption?.value || '',
    treatmentOptionComments: formatComments(elem.treatmentOption?.comments),
    mitigationPlan: elem.mitigationPlan?.value || '',
    mitigationPlanComments: formatComments(elem.mitigationPlan?.comments),
    riskOwner: elem.riskOwner?.value || '',
    riskOwnerComments: formatComments(elem.riskOwner?.comments),
    status: elem.currentStatus || '',
    lastEdit: elem.lastEditedBy
      ? `${elem.lastEditedBy.email}, ${elem.lastEditedBy.date}, ${elem.lastEditedBy.time}`
      : "Not Edited Yet",
  });
});


  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { wrapText: true, vertical: "top" };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const { file: dateForFile } = getFormattedDate();
  const fileName = `RA CompanyName ${dateForFile} Backup File.xlsx`;

  return { buffer, fileName };
}

// Upload to backend
export async function uploadBackup(buffer, fileName, backendURL) {
  const formData = new FormData();
  formData.append("file", new Blob([buffer]), fileName);

  const response = await fetch(`${backendURL}/api/upload-backup`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Upload Failed");

  return await response.json();
}


// Export formatted date utility too
export { getFormattedDate };
