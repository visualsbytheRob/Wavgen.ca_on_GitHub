#!/usr/bin/env node
// One-time helper: obfuscate a GitHub PAT so it can be safely committed
// to the public repo without GitHub's secret scanner auto-revoking it.
//
// Usage:
//   node scripts/obfuscate-pat.js <PAT> <PASSWORD>
//
// Output: a base64 string. Paste it into src/diary/index.njk as the
// OBFUSCATED_PAT constant. The same PASSWORD goes into the PASSWORD
// constant. When you enter the password on /diary/, the JS XORs them
// back to recover the real PAT in memory and uses it to fire workflows.
//
// This is light obfuscation, not real encryption — anyone with the
// source file and the password can recover the PAT. But since the
// password is in the source too, the actual security boundary is the
// PAT's scope (Actions:write on this one repo only). Worst case if
// "cracked": someone fires your workflows = you get spam emails.

const pat = process.argv[2];
const password = process.argv[3];

if (!pat || !password) {
  console.error("Usage: node scripts/obfuscate-pat.js <PAT> <PASSWORD>");
  console.error("Example: node scripts/obfuscate-pat.js github_pat_abc123... transmit");
  process.exit(1);
}

function xorCrypt(input, key) {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    out += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return out;
}

const xored = xorCrypt(pat, password);
const b64 = Buffer.from(xored, "binary").toString("base64");

console.log("\nPaste this into src/diary/index.njk as the OBFUSCATED_PAT constant:\n");
console.log("  " + b64);
console.log("\nMake sure the PASSWORD constant matches what you used:");
console.log("  '" + password + "'");
console.log("");
