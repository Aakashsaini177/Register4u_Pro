const dns = require('dns');
const hostname = 'register4u.9tq1tu3.mongodb.net';
const srvRecord = `_mongodb._tcp.${hostname}`;

console.log(`🔍 Attempting to resolve SRV record for: ${srvRecord}`);

dns.resolveSrv(srvRecord, (err, addresses) => {
    if (err) {
        console.error("❌ DNS SRV Lookup Failed!");
        console.error("Error code:", err.code);
        console.error("Message:", err.message);
        console.log("\n💡 Potential causes:");
        console.log("1. Strict Firewall blocking DNS SRV queries.");
        console.log("2. DNS Server issues (try using Google DNS 8.8.8.8).");
        console.log("3. Incorrect hostname in Connection String.");
    } else {
        console.log("✅ SRV Records found successfully:");
        console.log(addresses);
        console.log("\n🔌 DNS connectivity looks good. The issue might be IP Whitelisting or Authentication.");
    }
});
