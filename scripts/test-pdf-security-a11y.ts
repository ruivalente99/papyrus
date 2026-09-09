import {
  encryptPdf,
  auditPdfAccessibility,
  computePermissions,
} from "../src/lib/pdfSecurity";
import { generatePdfUaXmp, enrichPdfWithUaCompliance } from "../src/lib/pdfUa";
import { loadCV } from "../src/lib/cv-helper";
import type { CVDocument } from "../src/types/cv";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

console.log("=== RUNNING PDF SECURITY & PDF/UA ACCESSIBILITY TEST SUITE ===");

// -------------------------------------------------------------
// Test 1: Permissions computation
// -------------------------------------------------------------
console.log("\n[Test 1] Standard PDF Permissions bitmask computation...");
const fullPerms = computePermissions({ printing: true, copying: true, modifying: true });
const readOnlyPerms = computePermissions({ printing: false, copying: false, modifying: false });
const printOnlyPerms = computePermissions({ printing: true, copying: false, modifying: false });

assert(typeof fullPerms === "number", "Permissions must be a signed 32-bit integer");
assert(fullPerms !== readOnlyPerms, "Full permissions and read-only permissions must differ");
assert(printOnlyPerms !== readOnlyPerms, "Print-only permissions must differ from read-only");
console.log("✓ Permissions computation passed (Full: " + fullPerms + ", ReadOnly: " + readOnlyPerms + ")");

// -------------------------------------------------------------
// Test 2: Minimal PDF generation, PDF/UA enrichment, and 128-bit encryption
// -------------------------------------------------------------
console.log("\n[Test 2] Minimal PDF creation & PDF/UA Enrichment...");
const minimalPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000201 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
295
%%EOF`;

const rawBytes = new TextEncoder().encode(minimalPdf);
const dummyCv: CVDocument = {
  ...loadCV("classic"),
  personalInfo: {
    ...loadCV("classic").personalInfo,
    fullName: "Ada Lovelace",
    email: "ada@example.com",
  },
};

const enrichedBytes = enrichPdfWithUaCompliance(rawBytes, dummyCv, "en");
const enrichedText = new TextDecoder("latin1").decode(enrichedBytes);

assert(enrichedText.includes("/ViewerPreferences"), "Catalog must contain /ViewerPreferences");
assert(enrichedText.includes("/DisplayDocTitle true"), "Must contain /DisplayDocTitle true");
assert(enrichedText.includes("/MarkInfo"), "Catalog must contain /MarkInfo");
assert(enrichedText.includes("/Marked true"), "MarkInfo must contain /Marked true");
assert(enrichedText.includes("/Lang (en-US)"), "Catalog must contain /Lang (en-US)");
assert(enrichedText.includes("/Metadata"), "Catalog must reference /Metadata stream");
assert(enrichedText.includes("pdfuaid:part"), "Metadata stream must contain PDF/UA identifier");
assert(enrichedText.includes("Ada Lovelace"), "Metadata must contain document creator / title");
console.log("✓ PDF/UA Catalog & XMP tagging passed");

// -------------------------------------------------------------
// Test 3: PDF Standard 128-bit Encryption
// -------------------------------------------------------------
console.log("\n[Test 3] PDF Standard 128-bit Encryption (ISO 32000-1)...");
const encryptedBytes = encryptPdf(enrichedBytes, {
  userPassword: "secretPassword123",
  ownerPassword: "ownerMasterKey!",
  permissions: {
    printing: true,
    copying: false,
    modifying: false,
  },
});

const encryptedText = new TextDecoder("latin1").decode(encryptedBytes);

assert(encryptedText.includes("/Filter /Standard"), "Must contain standard filter");
assert(encryptedText.includes("/V 2"), "Must use Algorithm 2 (128-bit)");
assert(encryptedText.includes("/R 3"), "Must use Revision 3");
assert(encryptedText.includes("/Length 128"), "Must specify 128-bit key length");
assert(encryptedText.includes("/P "), "Must include permissions dictionary entry");
assert(encryptedText.includes("/O <"), "Must include owner value (/O)");
assert(encryptedText.includes("/U <"), "Must include user value (/U)");
assert(encryptedText.includes("/Encrypt"), "Trailer must reference Encrypt object");
assert(encryptedText.includes("/ID ["), "Trailer must include file ID");

// Confirm stream content was encrypted (no longer contains plaintext "(Hello World)")
assert(!encryptedText.includes("(Hello World)"), "Stream content must be encrypted and not contain plaintext");
console.log("✓ Standard 128-bit encryption passed");

// -------------------------------------------------------------
// Test 4: PDF/UA Accessibility Auditor
// -------------------------------------------------------------
console.log("\n[Test 4] PDF/UA & WCAG 2.1 AA Accessibility Auditor...");

// 4.1: Audit a complete valid preset (Lateralis)
const lateralisCV = loadCV("lateralis");
const lateralisAudit = auditPdfAccessibility(lateralisCV, "en");

assert(lateralisAudit.overallScore >= 85, "Lateralis should achieve >= 85% compliance score (got: " + lateralisAudit.overallScore + "%)");
assert(lateralisAudit.status === "compliant", "Lateralis status should be 'compliant'");
assert(lateralisAudit.totalCount >= 7, "Audit must evaluate at least 7 accessibility rules");
assert(lateralisAudit.items.some((i) => i.id === "ua-doc-title" && i.status === "pass"), "Document title check should pass");
assert(lateralisAudit.items.some((i) => i.id === "ua-primary-language" && i.status === "pass"), "Primary language check should pass");
assert(lateralisAudit.items.some((i) => i.id === "ua-heading-structure" && i.status === "pass"), "Heading structure check should pass");
console.log(`✓ Valid preset audit passed (Score: ${lateralisAudit.overallScore}%, Status: ${lateralisAudit.status})`);

// 4.2: Audit with missing title/name
const brokenCV: CVDocument = {
  ...lateralisCV,
  personalInfo: {
    ...lateralisCV.personalInfo,
    fullName: "",
  },
};
const brokenAudit = auditPdfAccessibility(brokenCV, "en");
assert(brokenAudit.items.some((i) => i.id === "ua-doc-title" && i.status === "fail"), "Missing full name must fail document title check");
assert(brokenAudit.overallScore < lateralisAudit.overallScore, "Score with missing name must be lower");
console.log(`✓ Broken CV audit correctly detected failure (Score: ${brokenAudit.overallScore}%)`);

// 4.3: Audit with Portuguese language
const ptAudit = auditPdfAccessibility(lateralisCV, "pt");
assert(ptAudit.items.some((i) => i.id === "ua-primary-language" && i.details.includes("PT")), "Language check should detect PT");
console.log("✓ Portuguese language audit passed");

// -------------------------------------------------------------
// Test 5: XMP Generation validation
// -------------------------------------------------------------
console.log("\n[Test 5] Direct XMP ISO 14289-1 XML Generation...");
const xmp = generatePdfUaXmp(dummyCv, "pt");
assert(xmp.startsWith('<?xpacket begin=""'), "XMP must start with standard packet header");
assert(xmp.includes("<pdfuaid:part>1</pdfuaid:part>"), "XMP must identify PDF/UA-1");
assert(xmp.includes("<dc:language>"), "XMP must declare Dublin Core language");
assert(xmp.includes("pt-PT"), "Portuguese language tag should be pt-PT");
assert(xmp.includes("Ada Lovelace"), "Creator should match CV document");
assert(xmp.endsWith('<?xpacket end="w"?>'), "XMP must close with standard packet trailer");
console.log("✓ XMP metadata generation passed");

console.log("\n🎉 ALL PDF SECURITY & PDF/UA ACCESSIBILITY TESTS PASSED!\n");
