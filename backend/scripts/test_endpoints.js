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
  console.log("--- Testing POST /tickets ---");
  const postRes = await request("POST", "/tickets", {
    content: "Testing API endpoint",
    customerEmail: "api@test.com",
  });
  console.log("POST Status:", postRes.statusCode);
  const ticketId = postRes.body.id;
  console.log("Ticket ID:", ticketId);

  console.log("\n--- Testing GET /tickets ---");
  const getRes = await request("GET", "/tickets");
  console.log("GET Status:", getRes.statusCode);
  console.log("Ticket count:", getRes.body.length);

  if (ticketId) {
    console.log(`\n--- Testing PATCH /tickets/${ticketId} ---`);
    const patchRes = await request("PATCH", `/tickets/${ticketId}`, {
      status: "RESOLVED",
      aiDraft: "This is a manual draft.",
    });
    console.log("PATCH Status:", patchRes.statusCode);
    console.log("Updated Status:", patchRes.body.status);
    console.log("Updated Draft:", patchRes.body.aiDraft);
  }
}

runTests().catch(console.error);
