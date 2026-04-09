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
