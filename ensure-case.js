import fs from "fs";
import path from "path";

console.log("🔍 Checking project structure and file casing for Linux build server...");

// 1. Check if "src" directory exists with different casing (e.g., Src, SRC)
const rootFiles = fs.readdirSync(".");
let srcDir = rootFiles.find(f => f.toLowerCase() === "src");

if (srcDir && srcDir !== "src") {
  console.log(`🔧 Case mismatch detected: Renaming directory "${srcDir}" to "src"...`);
  fs.renameSync(srcDir, "src_temp_casing");
  fs.renameSync("src_temp_casing", "src");
  srcDir = "src";
} else if (!srcDir) {
  console.log("⚠️ No src directory found at root!");
} else {
  console.log("📁 'src' directory name is correctly cased.");
}

// 2. Check and fix filenames in src/
if (fs.existsSync("src")) {
  const srcFiles = fs.readdirSync("src");
  console.log("📂 Files under 'src' directory in workspace:", srcFiles);

  const mainFile = srcFiles.find(f => f.toLowerCase() === "main.tsx");
  if (mainFile && mainFile !== "main.tsx") {
    console.log(`🔧 Case mismatch detected: Renaming "src/${mainFile}" to "src/main.tsx"...`);
    fs.renameSync(path.join("src", mainFile), path.join("src", "main.tsx"));
  } else {
    console.log("📄 'src/main.tsx' filename is correctly cased.");
  }

  const appFile = srcFiles.find(f => f.toLowerCase() === "app.tsx");
  if (appFile && appFile !== "App.tsx") {
    console.log(`🔧 Case mismatch detected: Renaming "src/${appFile}" to "src/App.tsx"...`);
    fs.renameSync(path.join("src", appFile), path.join("src", "App.tsx"));
  } else {
    console.log("📄 'src/App.tsx' filename is correctly cased.");
  }

  const cssFile = srcFiles.find(f => f.toLowerCase() === "index.css");
  if (cssFile && cssFile !== "index.css") {
    console.log(`🔧 Case mismatch detected: Renaming "src/${cssFile}" to "src/index.css"...`);
    fs.renameSync(path.join("src", cssFile), path.join("src", "index.css"));
  } else {
    console.log("📄 'src/index.css' filename is correctly cased.");
  }
}

console.log("✅ Case validation completed!");
