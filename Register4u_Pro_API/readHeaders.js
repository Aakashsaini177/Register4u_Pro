const XLSX = require("xlsx");
try {
  const wb = XLSX.readFile("d:/Register4u_Pro/Register4u_Pro_API/Details.xlsx");
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
  console.log(JSON.stringify(headers));
} catch (error) {
  console.error(error);
}
