process.env.DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/triage_hub";
const { execSync } = require("child_process");

const path = require("path");

console.log("Starting migration with DATABASE_URL:", process.env.DATABASE_URL);

try {
  execSync("npx prisma migrate dev --name init", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });
  console.log("Migration successful");
} catch (e) {
  console.error("Migration failed");
  process.exit(1);
}
