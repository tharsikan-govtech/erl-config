// Builds certify/erl-credential-config.json (the body for POST /credential-configurations)
// from certify/erl-vc-template.vm. Run: node scripts/build-credential-config.js
const fs = require("fs");
const path = require("path");

const PAGES = "https://tharsikan-govtech.github.io/erl-config";
const root = path.join(__dirname, "..");
const template = fs.readFileSync(path.join(root, "certify", "erl-vc-template.vm"), "utf8");

// Certify only accepts pre-authorized claims that are listed here, so this must match the
// fields erl-sample-api sends (src/certify.js CLAIM_FIELDS).
const claimLabels = {
  licenceNumber: "Licence Number", receiptNumber: "Receipt Number", issuingAuthority: "Issuing Authority",
  issueDate: "Issue Date", expiryDate: "Expiry Date", feePaidLkr: "Fee Paid (LKR)",
  vehicleNumber: "Vehicle Number", chassisNumber: "Chassis Number", engineNumber: "Engine Number",
  vehicleClass: "Vehicle Class", make: "Make", model: "Model", yearOfManufacture: "Year of Manufacture",
  fuelType: "Fuel Type", engineCapacityCc: "Engine Capacity (cc)", colour: "Colour", province: "Province",
};
const claims = Object.fromEntries(
  Object.entries(claimLabels).map(([k, name]) => [k, { display: [{ name, locale: "en" }] }])
);

const config = {
  credentialConfigKeyId: "ErlCredential",
  vcTemplate: Buffer.from(template, "utf8").toString("base64"),
  keyManagerAppId: "CERTIFY_VC_SIGN_ED25519",
  keyManagerRefId: "ED25519_SIGN",
  signatureAlgo: "EdDSA",
  signatureCryptoSuite: "Ed25519Signature2020",
  contextURLs: ["https://www.w3.org/2018/credentials/v1", `${PAGES}/contexts/erl.json`],
  credentialTypes: ["VerifiableCredential", "RevenueLicenceCredential"],
  credentialFormat: "ldp_vc",
  didUrl: "did:web:tharsikan-govtech.github.io:erl-config:did",
  metaDataDisplay: [{ name: "Revenue Licence", locale: "en", background_color: "#0b6b3a", text_color: "#FFFFFF" }],
  displayOrder: [
    "vehicleNumber", "licenceNumber", "issueDate", "expiryDate", "vehicleClass", "make", "model",
    "yearOfManufacture", "fuelType", "engineCapacityCc", "colour", "province", "chassisNumber",
    "engineNumber", "feePaidLkr", "receiptNumber", "issuingAuthority",
  ],
  scope: "erl_vc_ldp",
  claims,
};

const out = path.join(root, "certify", "erl-credential-config.json");
fs.writeFileSync(out, JSON.stringify(config, null, 2) + "\n");
console.log("wrote", out);
