const XLSX = require("xlsx");
const filePath = "d:/Register4u_Pro/Guest Management Details File.xlsx";
try {
  const workbook = XLSX.readFile(filePath);
  const data = {};
  workbook.SheetNames.forEach((name) => {
    data[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name]).slice(0, 30);
  });
  console.log(JSON.stringify(data, null, 2));
} catch (error) {
  console.error("Error reading file:", error);
}
