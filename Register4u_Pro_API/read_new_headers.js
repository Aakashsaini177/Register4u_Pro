const XLSX = require("xlsx");
const fs = require("fs");
try {
  const wb = XLSX.readFile(
    "d:/Register4u_Pro/Guest Management Details File.xlsx"
  );
  const headers = {};
  wb.SheetNames.forEach((name) => {
    const sheet = wb.Sheets[name];
    // Get first row as header
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (json && json.length > 0) {
      headers[name] = json[0];
    }
  });
  fs.writeFileSync("headers_output.json", JSON.stringify(headers, null, 2));
  console.log("Headers Written");
} catch (error) {
  fs.writeFileSync("headers_error.txt", error.toString());
  console.error(error);
}
