const http = require("http");

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.headers["Content-Length"] = Buffer.byteLength(
        JSON.stringify(data),
      );
    }

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, body: JSON.parse(body || "{}") });
      });
    });

    req.on("error", (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("--- Testing POST /tickets (Invalid Data) ---");
  // Content too short
  const postRes = await request("POST", "/tickets", {
    content: "Short",
    customerEmail: "valid@test.com",
  });
  console.log("POST Status (Expected 400):", postRes.statusCode);
  console.log("Error Body:", JSON.stringify(postRes.body, null, 2));

  // Invalid Email
  const postRes2 = await request("POST", "/tickets", {
    content: "This is a valid long content message.",
    customerEmail: "invalid-email",
  });
  console.log(
    "\nPOST Status (Email Invalid, Expected 400):",
    postRes2.statusCode,
  );
  console.log("Error Body:", JSON.stringify(postRes2.body, null, 2));

  console.log("\n--- Testing PATCH /tickets/:id (Invalid Status) ---");
  // Need a valid ID, relying on previous tests or just assuming one exists or creating one first.
  // Let's create a valid one first.
  const validRes = await request("POST", "/tickets", {
    content: "Valid content for patch test.",
    customerEmail: "patch@test.com",
  });
  const ticketId = validRes.body.id;

  if (ticketId) {
    const patchRes = await request("PATCH", `/tickets/${ticketId}`, {
      status: "INVALID_STATUS",
    });
    console.log("PATCH Status (Expected 400):", patchRes.statusCode);
    console.log("Error Body:", JSON.stringify(patchRes.body, null, 2));
  }
}

runTests().catch(console.error);
