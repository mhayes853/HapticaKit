const fs = require("fs");
require("dotenv").config();

const filePath = "dist/index.js";

try {
  let content = fs.readFileSync(filePath, "utf8");
  content = content.replace(/exports\..*;/gm, "");
  content = content.replace(
    'Object.defineProperty(exports, "__esModule", { value: true });',
    "",
  );
  fs.writeFileSync(
    process.env.JS_CORIFY_PATH ?? "dist/js-corified.js",
    content,
  );
  console.log("Successfully removed exports.value statements");
} catch (err) {
  console.error("Error processing file:", err);
}
