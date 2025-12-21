const XLSX = require("xlsx");
const fs = require("fs");
const filePath = "d:/Register4u_Pro/Guest Management Details File.xlsx";
try {
  const workbook = XLSX.readFile(filePath);
  const data = {};
  workbook.SheetNames.forEach((name) => {
    // Get first 20 rows
    data[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name]).slice(0, 20);
  });
  fs.writeFileSync("excel_output.json", JSON.stringify(data, null, 2));
  console.log("Done");
} catch (error) {
  fs.writeFileSync(
    "excel_output.json",
    JSON.stringify({ error: error.toString() })
  );
  console.error(error);
}
