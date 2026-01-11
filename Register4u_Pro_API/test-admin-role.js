const axios = require("axios");

async function testAdminRole() {
  try {
    console.log("🧪 Testing admin role access...");
    
    // Login as admin
    const loginResponse = await axios.post("http://localhost:4002/api/v1/login", {
      username: "admin",
      password: "admin123"
    });
    
    if (!loginResponse.data.success) {
      console.log("❌ Login failed");
      return;
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log("✅ Login successful");
    console.log("User data:", JSON.stringify(user, null, 2));
    
    // Test accessing a protected admin route (get all places)
    console.log("\n🔍 Testing admin route access...");
    
    try {
      const placesResponse = await axios.get("http://localhost:4002/api/v1/places", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("✅ Admin route access successful");
      console.log("Places response:", JSON.stringify(placesResponse.data, null, 2));
      
    } catch (routeError) {
      console.log("❌ Admin route access failed:", routeError.response?.data || routeError.message);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testAdminRole();