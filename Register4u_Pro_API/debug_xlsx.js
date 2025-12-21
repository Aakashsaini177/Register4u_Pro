console.log("Starting...");
try {
  const XLSX = require("xlsx");
  console.log("XLSX imported");
  const ws = XLSX.utils.json_to_sheet([{ Test: 123 }]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  console.log("Buffer size:", buffer.length);
} catch (e) {
  console.error("Error:", e);
}
console.log("Done");
