// Simple test script to check auth endpoints
const testAuth = async () => {
  try {
    console.log("Testing health endpoint...");
    const healthRes = await fetch("http://localhost:5001/api/health");
    const healthData = await healthRes.json();
    console.log("Health check:", healthData);

    console.log("\nTesting debug auth endpoint...");
    const authRes = await fetch("http://localhost:5001/api/debug/auth");
    const authData = await authRes.json();
    console.log("Auth debug:", authData);

    console.log("\nTesting login endpoint...");
    const loginRes = await fetch("http://localhost:5001/api/debug/test-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: "test@example.com",
        password: "testpass",
      }),
    });
    const loginData = await loginRes.json();
    console.log("Test login:", loginData);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
};

// For browser testing
if (typeof window !== "undefined") {
  testAuth();
}
