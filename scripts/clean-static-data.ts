import * as fs from "fs";
import * as path from "path";

const spotsFilePath = path.join(__dirname, "../src/data/spots.ts");

let content = fs.readFileSync(spotsFilePath, "utf-8");

// Replace all upvotes: <number> with upvotes: 0
content = content.replace(/upvotes:\s*\d+/g, "upvotes: 0");

// Remove all upvoters arrays - match upvoters: [...] including multiline
content = content.replace(/upvoters:\s*\[[\s\S]*?\],?\n/g, "");

// Remove all reviews arrays - match reviews: [...] including multiline
content = content.replace(/reviews:\s*\[[\s\S]*?\],?\n/g, "");

fs.writeFileSync(spotsFilePath, content);

console.log("Cleaned static spots data:");
console.log("- Set all upvotes to 0");
console.log("- Removed all upvoters arrays");
console.log("- Removed all reviews arrays");
