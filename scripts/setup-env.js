const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const copyEnv = (src, dest) => {
  const srcPath = path.resolve(projectRoot, src);
  const destPath = path.resolve(projectRoot, dest);

  if (fs.existsSync(destPath)) {
    console.log(`Skipping ${dest}: already exists.`);
    return;
  }

  if (!fs.existsSync(srcPath)) {
    console.error(`Error: Source file ${src} not found.`);
    return;
  }

  fs.copyFileSync(srcPath, destPath);
  console.log(`Created ${dest} from ${src}`);
};

console.log("Setting up environment variables...");

// Root .env (for Docker Compose)
copyEnv(".env.example", ".env");

// Backend .env
copyEnv("backend/.env.example", "backend/.env");

// Frontend .env.local
copyEnv("frontend/.env.example", "frontend/.env.local");

console.log("\nEnvironment setup complete!");
console.log(
  "Please update the .env files with your specific configuration (e.g., GEMINI_API_KEY).",
);
