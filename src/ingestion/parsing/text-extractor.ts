export type ExtractedMaterialContent = {
  text: string;
  note: string | null;
};

const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
]);

function sanitizeText(value: string): string {
  return value.replace(/\u0000/g, "").replace(/\r\n?/g, "\n").trim();
}

function decodePdfStringLiteral(value: string): string {
  return value
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\f/g, "")
    .replace(/\\b/g, "")
    .replace(/\\\\/g, "\\");
}

function decodePdfHexString(hex: string): string {
  const normalized = hex.length % 2 === 0 ? hex : `${hex}0`;
  let output = "";

  for (let index = 0; index < normalized.length; index += 2) {
    const pair = normalized.slice(index, index + 2);
    const code = Number.parseInt(pair, 16);
    if (!Number.isNaN(code)) {
      output += String.fromCharCode(code);
    }
  }

  return output;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const MAX_PARSE_BYTES = 2 * 1024 * 1024;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const parseBytes =
    bytes.byteLength > MAX_PARSE_BYTES ? bytes.slice(0, MAX_PARSE_BYTES) : bytes;
  const raw = new TextDecoder("latin1").decode(parseBytes);

  const literalMatches = Array.from(raw.matchAll(/\(([^()]*)\)\s*Tj/g)).map(
    (match) => decodePdfStringLiteral(match[1]),
  );
  const hexMatches = Array.from(raw.matchAll(/<([0-9A-Fa-f\s]+)>\s*Tj/g)).map(
    (match) => decodePdfHexString(match[1].replace(/\s+/g, "")),
  );
  const lines = [...literalMatches, ...hexMatches]
    .map((line) => sanitizeText(line))
    .filter((line) => line.length > 0);

  return sanitizeText(lines.join("\n"));
}

function summarizeUnsupportedType(mimeType: string, fileName: string): string {
  if (mimeType === "application/pdf") {
    return "File " + fileName + " is a PDF. PDF extraction is queued for advanced parser support in this MVP, so this file currently contributes metadata signals only.";
  }

  if (mimeType.startsWith("image/")) {
    return "File " + fileName + " is an image. OCR is not enabled in this MVP, so this file currently contributes metadata signals only.";
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return "File " + fileName + " is a Word document. DOCX parsing is not enabled in this MVP, so this file currently contributes metadata signals only.";
  }

  return "File " + fileName + " has unsupported extraction type (" + (mimeType || "unknown") + "). Metadata was saved successfully.";
}

export async function extractMaterialText(input: {
  file: File;
}): Promise<ExtractedMaterialContent> {
  const { file } = input;

  if (file.type === "application/pdf") {
    if (file.size > 10 * 1024 * 1024) {
      return {
        text: "",
        note: "PDF extraction skipped for large file size in MVP mode. File metadata and upload are saved successfully.",
      };
    }

    const text = await extractTextFromPdf(file);
    if (text.length >= 20) {
      return {
        text,
        note: "PDF text extracted with MVP parser. Complex layouts may be partially parsed.",
      };
    }

    return {
      text: "",
      note: summarizeUnsupportedType(file.type, file.name),
    };
  }

  if (TEXT_MIME_TYPES.has(file.type) || file.type.startsWith("text/")) {
    const raw = await file.text();
    return {
      text: sanitizeText(raw),
      note: null,
    };
  }

  return {
    text: "",
    note: summarizeUnsupportedType(file.type, file.name),
  };
}
