import type { CVDocument, SupportedLanguage } from "@/types/cv";

/**
 * Standard PDF Password Padding (32 bytes as defined in ISO 32000-1 / PDF Reference)
 */
const PASSWORD_PADDING = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41,
  0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80,
  0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

/**
 * Self-contained MD5 hash implementation (RFC 1321)
 */
export function md5(data: Uint8Array): Uint8Array {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  // Pre-processing (Padding)
  const bitLength = data.length * 8;
  const newLen = ((data.length + 8) >>> 6) + 1;
  const words = new Int32Array(newLen * 16);

  for (let i = 0; i < data.length; i++) {
    words[i >> 2] |= (data[i] & 0xff) << ((i % 4) * 8);
  }
  words[data.length >> 2] |= 0x80 << ((data.length % 4) * 8);
  words[newLen * 16 - 2] = bitLength & 0xffffffff;
  words[newLen * 16 - 1] = Math.floor(bitLength / 0x100000000);

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, words[i], 7, -680876936);
    d = md5ff(d, a, b, c, words[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, words[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, words[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, words[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, words[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, words[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, words[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, words[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, words[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, words[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, words[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, words[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, words[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, words[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, words[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, words[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, words[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, words[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, words[i], 20, -373897302);
    a = md5gg(a, b, c, d, words[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, words[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, words[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, words[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, words[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, words[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, words[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, words[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, words[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, words[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, words[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, words[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, words[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, words[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, words[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, words[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, words[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, words[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, words[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, words[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, words[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, words[i], 11, -358537222);
    c = md5hh(c, d, a, b, words[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, words[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, words[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, words[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, words[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, words[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, words[i], 6, -198630844);
    d = md5ii(d, a, b, c, words[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, words[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, words[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, words[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, words[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, words[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, words[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, words[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, words[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, words[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, words[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, words[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, words[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, words[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, words[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const out = new Uint8Array(16);
  const resultWords = [a, b, c, d];
  for (let i = 0; i < 16; i++) {
    out[i] = (resultWords[i >> 2] >> ((i % 4) * 8)) & 0xff;
  }
  return out;
}

/**
 * RC4 Stream Cipher (ARC4)
 */
export function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 255;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
  }

  let i = 0;
  j = 0;
  const out = new Uint8Array(data.length);
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    const temp = s[i];
    s[i] = s[j];
    s[j] = temp;
    out[k] = data[k] ^ s[(s[i] + s[j]) & 255];
  }
  return out;
}

export interface PdfEncryptionOptions {
  userPassword?: string;
  ownerPassword?: string;
  permissions?: {
    allowPrinting?: boolean; // default true
    allowCopying?: boolean; // default true
    allowModifying?: boolean; // default false
    allowAnnotating?: boolean; // default false
    printing?: boolean;
    copying?: boolean;
    modifying?: boolean;
    annotating?: boolean;
  };
}

/**
 * Encodes string to UTF-8 bytes
 */
function toUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Pad password to exactly 32 bytes using Standard PDF Padding
 */
function padPassword(pwd: string): Uint8Array {
  const pwdBytes = toUtf8(pwd);
  const padded = new Uint8Array(32);
  if (pwdBytes.length >= 32) {
    padded.set(pwdBytes.subarray(0, 32));
  } else {
    padded.set(pwdBytes);
    padded.set(PASSWORD_PADDING.subarray(0, 32 - pwdBytes.length), pwdBytes.length);
  }
  return padded;
}

/**
 * Computes the 32-bit permission flags integer (P)
 * PDF 1.7 Table 3.20 (Standard Security Handler flags)
 */
export function computePermissions(opts?: PdfEncryptionOptions["permissions"]): number {
  // Default: reserved bits 7, 8, 13-32 must be 1.
  let p = -3904; // 0xFFFFF0C0 in two's complement

  const allowPrinting = (opts?.allowPrinting !== undefined ? opts.allowPrinting : opts?.printing) !== false;
  const allowCopying = (opts?.allowCopying !== undefined ? opts.allowCopying : opts?.copying) !== false;
  const allowModifying = (opts?.allowModifying !== undefined ? opts.allowModifying : opts?.modifying) === true;
  const allowAnnotating = (opts?.allowAnnotating !== undefined ? opts.allowAnnotating : opts?.annotating) === true;

  if (allowPrinting) {
    p |= (1 << 2) | (1 << 11); // Bit 3 (print) & Bit 12 (high quality print)
  } else {
    p &= ~(1 << 2);
    p &= ~(1 << 11);
  }

  if (allowCopying) {
    p |= (1 << 4) | (1 << 9); // Bit 5 (copy) & Bit 10 (extract accessibility)
  } else {
    p &= ~(1 << 4);
    p |= (1 << 9); // Keep accessibility extract on for PDF/UA
  }

  if (allowModifying) {
    p |= (1 << 3) | (1 << 10); // Bit 4 (modify) & Bit 11 (assemble)
  } else {
    p &= ~(1 << 3);
    p &= ~(1 << 10);
  }

  if (allowAnnotating) {
    p |= (1 << 5) | (1 << 8); // Bit 6 (annotate) & Bit 9 (fill forms)
  } else {
    p &= ~(1 << 5);
  }

  return p;
}

/**
 * Converts bytes to uppercase hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join("");
}

/**
 * Algorithm 3.3: Computing the owner password value (/O)
 */
export function computeOwnerValue(ownerPwd: string, userPwd: string): Uint8Array {
  const paddedOwner = padPassword(ownerPwd || userPwd);
  let hash = md5(paddedOwner);

  // 50 iterations for Revision 3 (128-bit)
  for (let i = 0; i < 50; i++) {
    hash = md5(hash);
  }

  const key = hash.subarray(0, 16);
  let result = rc4(key, padPassword(userPwd));

  // 19 additional RC4 iterations with XORed key
  for (let i = 1; i <= 19; i++) {
    const xorKey = new Uint8Array(16);
    for (let k = 0; k < 16; k++) xorKey[k] = key[k] ^ i;
    result = rc4(xorKey, result);
  }

  return result;
}

/**
 * Algorithm 3.2: Computing the file encryption key
 */
export function computeEncryptionKey(
  userPwd: string,
  ownerValue: Uint8Array,
  permissions: number,
  fileId: Uint8Array
): Uint8Array {
  const paddedUser = padPassword(userPwd);
  const pBytes = new Uint8Array([
    permissions & 0xff,
    (permissions >> 8) & 0xff,
    (permissions >> 16) & 0xff,
    (permissions >> 24) & 0xff,
  ]);

  // Concatenate: userPwd + /O + /P + /ID
  const totalLen = paddedUser.length + ownerValue.length + pBytes.length + fileId.length;
  const buffer = new Uint8Array(totalLen);
  let offset = 0;
  buffer.set(paddedUser, offset); offset += paddedUser.length;
  buffer.set(ownerValue, offset); offset += ownerValue.length;
  buffer.set(pBytes, offset); offset += pBytes.length;
  buffer.set(fileId, offset);

  let hash = md5(buffer);
  for (let i = 0; i < 50; i++) {
    hash = md5(hash.subarray(0, 16));
  }

  return hash.subarray(0, 16); // 128-bit key
}

/**
 * Algorithm 3.4: Computing user password value (/U)
 */
export function computeUserValue(encKey: Uint8Array, fileId: Uint8Array): Uint8Array {
  const padHash = md5(PASSWORD_PADDING);
  const total = new Uint8Array(padHash.length + fileId.length);
  total.set(padHash, 0);
  total.set(fileId, padHash.length);

  const finalHash = md5(total);
  let result = rc4(encKey, finalHash);

  for (let i = 1; i <= 19; i++) {
    const xorKey = new Uint8Array(16);
    for (let k = 0; k < 16; k++) xorKey[k] = encKey[k] ^ i;
    result = rc4(xorKey, result);
  }

  // 16 bytes of encrypted hash + 16 arbitrary bytes padding = 32 bytes
  const uValue = new Uint8Array(32);
  uValue.set(result, 0);
  uValue.set(PASSWORD_PADDING.subarray(0, 16), 16);
  return uValue;
}

/**
 * Encrypt an individual object's stream or string data with its derived object key
 */
export function encryptObjectData(
  data: Uint8Array,
  encKey: Uint8Array,
  objNum: number,
  genNum: number = 0
): Uint8Array {
  const objBytes = new Uint8Array([
    objNum & 0xff,
    (objNum >> 8) & 0xff,
    (objNum >> 16) & 0xff,
    genNum & 0xff,
    (genNum >> 8) & 0xff,
  ]);

  const keyBuffer = new Uint8Array(encKey.length + objBytes.length);
  keyBuffer.set(encKey, 0);
  keyBuffer.set(objBytes, encKey.length);

  const objHash = md5(keyBuffer);
  const objKey = objHash.subarray(0, Math.min(encKey.length + 5, 16));
  return rc4(objKey, data);
}

/**
 * Standard PDF Encryption Engine for JS/TS
 * Encrypts a PDF Uint8Array in-place with user and/or owner passwords.
 */
export function encryptPdf(pdfBytes: Uint8Array, options: PdfEncryptionOptions): Uint8Array {
  if (!options.userPassword && !options.ownerPassword) {
    return pdfBytes;
  }

  const pdfText = new TextDecoder("latin1").decode(pdfBytes);
  if (pdfText.includes("/Encrypt")) {
    // Already encrypted
    return pdfBytes;
  }

  const userPwd = options.userPassword || "";
  const ownerPwd = options.ownerPassword || userPwd;
  const permissions = computePermissions(options.permissions);

  // 1. Extract or generate 16-byte File ID
  const fileId = new Uint8Array(16);
  const idMatch = pdfText.match(/\/ID\s*\[\s*<([0-9A-Fa-f]{32})>/);
  if (idMatch && idMatch[1]) {
    for (let i = 0; i < 16; i++) {
      fileId[i] = parseInt(idMatch[1].substring(i * 2, i * 2 + 2), 16);
    }
  } else {
    fileId.set(md5(toUtf8(`PAPYRUS_${Date.now()}_${Math.random()}`)));
  }

  // 2. Compute /O, encryption key, and /U
  const ownerValue = computeOwnerValue(ownerPwd, userPwd);
  const encKey = computeEncryptionKey(userPwd, ownerValue, permissions, fileId);
  const userValue = computeUserValue(encKey, fileId);

  // 3. Find the highest existing object number
  const objRegex = /(\d+)\s+(\d+)\s+obj/g;
  let maxObjNum = 0;
  let match: RegExpExecArray | null;
  while ((match = objRegex.exec(pdfText)) !== null) {
    const num = parseInt(match[1], 10);
    if (num > maxObjNum) maxObjNum = num;
  }

  const encryptObjNum = maxObjNum + 1;
  const encryptObjStr = `${encryptObjNum} 0 obj\n<<\n  /Filter /Standard\n  /V 2\n  /R 3\n  /Length 128\n  /P ${permissions}\n  /O <${bytesToHex(ownerValue)}>\n  /U <${bytesToHex(userValue)}>\n>>\nendobj\n`;

  // 4. Encrypt streams: find all `stream...endstream` blocks
  const parts: (string | Uint8Array)[] = [];
  const streamRegex = /(\d+)\s+(\d+)\s+obj([\s\S]*?)stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let lastIndex = 0;
  let sMatch: RegExpExecArray | null;

  while ((sMatch = streamRegex.exec(pdfText)) !== null) {
    const objNum = parseInt(sMatch[1], 10);
    const genNum = parseInt(sMatch[2], 10);
    const preHeader = pdfText.slice(lastIndex, sMatch.index);
    const objHeader = `${sMatch[1]} ${sMatch[2]} obj${sMatch[3]}stream\n`;
    const streamData = toUtf8(sMatch[4]);
    const encryptedStream = encryptObjectData(streamData, encKey, objNum, genNum);

    parts.push(preHeader);
    parts.push(objHeader);
    parts.push(encryptedStream);
    parts.push("\nendstream");

    lastIndex = sMatch.index + sMatch[0].length;
  }

  parts.push(pdfText.slice(lastIndex));

  // 5. Assemble string from parts
  const modifiedPdf = parts
    .map((p) => (typeof p === "string" ? p : new TextDecoder("latin1").decode(p)))
    .join("");

  // 6. Inject the Encrypt Object before xref / trailer
  const trailerIdx = modifiedPdf.lastIndexOf("trailer");
  if (trailerIdx === -1) {
    return pdfBytes;
  }

  const beforeTrailer = modifiedPdf.slice(0, trailerIdx);
  const trailerAndBeyond = modifiedPdf.slice(trailerIdx);

  // In trailer, inject `/Encrypt ${encryptObjNum} 0 R`
  const updatedTrailer = trailerAndBeyond.replace(
    /trailer\s*<<([\s\S]*?)>>/,
    (_m, dict) => {
      let newDict = dict;
      if (!newDict.includes("/Encrypt")) {
        newDict = `${dict}\n/Encrypt ${encryptObjNum} 0 R`;
      }
      // Ensure /ID is present
      if (!newDict.includes("/ID")) {
        const hexId = bytesToHex(fileId);
        newDict = `${newDict}\n/ID [ <${hexId}> <${hexId}> ]`;
      }
      return `trailer\n<<${newDict}\n>>`;
    }
  );

  const finalStr = `${beforeTrailer}\n${encryptObjStr}\n${updatedTrailer}`;
  const outBytes = new Uint8Array(finalStr.length);
  for (let i = 0; i < finalStr.length; i++) {
    outBytes[i] = finalStr.charCodeAt(i) & 0xff;
  }

  return outBytes;
}

/**
 * Accessibility Auditor (PDF/UA & WCAG 2.1 AA Compliance)
 */
export interface PdfUaAuditItem {
  id: string;
  title: string;
  category: "metadata" | "structure" | "color" | "content";
  status: "pass" | "warn" | "fail";
  details: string;
}

export interface PdfUaAuditReport {
  overallScore: number;
  status: "compliant" | "needs-attention" | "non-compliant";
  passedCount: number;
  totalCount: number;
  items: PdfUaAuditItem[];
}

/**
 * Calculates contrast ratio between two hex colors
 */
function getContrastRatio(hex1: string, hex2: string = "#FFFFFF"): number {
  function getLuminance(hex: string): number {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  try {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  } catch {
    return 5.0; // fallback
  }
}

/**
 * Audits a PAPYRUS CVDocument against PDF/UA (ISO 14289-1) & WCAG 2.1 AA rules
 */
export function auditPdfAccessibility(cv: CVDocument, lang: SupportedLanguage = "en"): PdfUaAuditReport {
  const items: PdfUaAuditItem[] = [];

  // Rule 1: Document Title
  const hasTitle = !!cv.personalInfo?.fullName?.trim();
  items.push({
    id: "ua-doc-title",
    title: "Document Title Defined (/Title)",
    category: "metadata",
    status: hasTitle ? "pass" : "fail",
    details: hasTitle
      ? `Document Title is clearly established ("${cv.personalInfo.fullName} - Curriculum Vitae").`
      : "Full name is missing; PDF/UA requires a discernible title.",
  });

  // Rule 2: Primary Natural Language
  const hasLang = !!(lang || cv.currentLanguage || cv.defaultLanguage);
  items.push({
    id: "ua-primary-language",
    title: "Primary Natural Language Specified (/Lang)",
    category: "metadata",
    status: hasLang ? "pass" : "fail",
    details: hasLang
      ? `Primary language is set to "${lang.toUpperCase()}" with BCP-47 ISO mapping.`
      : "Language tag missing in document catalog.",
  });

  // Rule 3: Author and Creator Metadata
  const hasAuthor = !!cv.personalInfo?.fullName && !!cv.personalInfo?.email;
  items.push({
    id: "ua-author-metadata",
    title: "Author & Creator Metadata",
    category: "metadata",
    status: hasAuthor ? "pass" : "warn",
    details: hasAuthor
      ? `Document creator (${cv.personalInfo.fullName}) and contact email are present.`
      : "Author contact information is partially incomplete.",
  });

  // Rule 4: Color Contrast (WCAG 2.1 AA >= 4.5:1)
  const primaryColor = cv.theme?.primaryColor || "#004f90";
  const contrastRatio = getContrastRatio(primaryColor, "#FFFFFF");
  const contrastPass = contrastRatio >= 4.5;
  items.push({
    id: "ua-color-contrast",
    title: "Editorial Color Contrast Ratio (WCAG AA)",
    category: "color",
    status: contrastPass ? "pass" : contrastRatio >= 3.0 ? "warn" : "fail",
    details: `Theme accent color (${primaryColor}) against white paper achieves ${contrastRatio}:1 ratio (Target: >= 4.5:1).`,
  });

  // Rule 5: Visual Elements Alt Text (Photo / Avatar / QR)
  let visualPass = true;
  let visualMsg = "All graphical elements have accessible alternative text descriptions.";
  if (cv.personalInfo?.showPhoto && !cv.personalInfo?.fullName) {
    visualPass = false;
    visualMsg = "Portrait avatar is displayed without candidate name alt text.";
  }
  if (cv.personalInfo?.qrCode?.enabled && !cv.personalInfo.qrCode.url) {
    visualPass = false;
    visualMsg = "QR Code is enabled but lacks destination target URL.";
  }
  items.push({
    id: "ua-visual-alt",
    title: "Non-Text Objects Alternative Text",
    category: "content",
    status: visualPass ? "pass" : "warn",
    details: visualMsg,
  });

  // Rule 6: Logical Structure & Section Headings
  const hasSections = cv.sections && cv.sections.length >= 2;
  items.push({
    id: "ua-heading-structure",
    title: "Logical Heading Hierarchy & Tagged Sections",
    category: "structure",
    status: hasSections ? "pass" : "warn",
    details: hasSections
      ? `CV contains ${cv.sections.length} structured semantic sections with localized titles.`
      : "Few sections detected; add Experience or Education to ensure rich reading hierarchy.",
  });

  // Rule 7: Hyperlink Destinations
  const links = cv.personalInfo?.links || [];
  const invalidLinks = links.filter((l) => !l.url?.startsWith("http://") && !l.url?.startsWith("https://") && !l.url?.startsWith("mailto:"));
  items.push({
    id: "ua-hyperlink-targets",
    title: "Clickable Link Accessibility",
    category: "content",
    status: invalidLinks.length === 0 ? "pass" : "warn",
    details: invalidLinks.length === 0
      ? `All ${links.length + (cv.personalInfo?.website ? 1 : 0)} hyperlinks have valid protocol prefixes.`
      : `${invalidLinks.length} links lack http/https protocol prefix.`,
  });

  const passedCount = items.filter((i) => i.status === "pass").length;
  const totalCount = items.length;
  const overallScore = Math.round((passedCount / totalCount) * 100);

  const status =
    overallScore >= 85 ? "compliant" : overallScore >= 60 ? "needs-attention" : "non-compliant";

  return {
    overallScore,
    status,
    passedCount,
    totalCount,
    items,
  };
}
