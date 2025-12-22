const axios = require("axios");

const API_BASE = "http://localhost:4002/api/v1";

async function testScanFix() {
  console.log("🧪 Testing Visitor Scan Fix...\n");

  let token = "";

  // 1. Login
  console.log("1️⃣ Logging in as Admin...");
  try {
    const loginRes = await axios.post(`${API_BASE}/login`, {
      username: "admin",
      password: "admin123",
    });
    token = loginRes.data.token || loginRes.data.data.token;
    console.log("✅ Login successful. Token obtained.");
  } catch (error) {
    console.error(
      "❌ Login failed:",
      error.response?.data?.message || error.message
    );
    return;
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // 2. Test Scan with Missing ID (Should be 400, NOT 500)
  console.log("\n2️⃣ Testing Scan with Missing Visitor ID...");
  try {
    await axios.post(`${API_BASE}/visitors/scan`, {}, config);
    console.log("❌ Failed: Should have returned 400");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Success: Returned 400 Bad Request as expected.");
      console.log("   Message:", error.response.data.message);
    } else if (error.response?.status === 500) {
      console.log("❌ Failed: Still returning 500 Internal Server Error!");
    } else {
      console.log(`⚠️ Unexpected Status: ${error.response?.status}`);
    }
  }

  // 3. Test Scan with Non-existent ID (Should be 404, NOT 500)
  console.log("\n3️⃣ Testing Scan with Non-existent ID (RANDOM123)...");
  try {
    await axios.post(
      `${API_BASE}/visitors/scan`,
      { visitorId: "RANDOM123" },
      config
    );
    console.log("❌ Failed: Should have returned 404");
  } catch (error) {
    if (error.response?.status === 404) {
      console.log("✅ Success: Returned 404 Not Found as expected.");
    } else if (error.response?.status === 500) {
      console.log("❌ Failed: Still returning 500 Internal Server Error!");
    } else {
      console.log(`⚠️ Unexpected Status: ${error.response?.status}`);
    }
  }
}

testScanFix();
