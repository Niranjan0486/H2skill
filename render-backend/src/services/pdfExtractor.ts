/**
 * PDF Text Extraction Service (Node.js Backend)
 * 
 * Uses pdf-parse (built on Mozilla PDF.js) for proper PDF text extraction.
 * This is the REAL implementation that actually extracts readable text.
 */

import fs from "fs";

// pdf-parse v2.4.5+ uses class-based API
async function parsePDFBuffer(buffer: Buffer): Promise<{ text: string; numpages: number; info?: any }> {
  // @ts-ignore - pdf-parse doesn't ship TS types
  const { PDFParse } = await import("pdf-parse");
  
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    await parser.destroy();
    
    return {
      text: result.text || "",
      numpages: result.total || 0,
      info: result.info,
    };
  } catch (error) {
    await parser.destroy().catch(() => {});
    throw error;
  }
}

export interface PDFExtractionResult {
  text: string;
  numPages: number;
  info?: any;
}

/**
 * Deterministic PDF text extraction (NO AI).
 *
 * Requirement: Extract raw readable text from PDF files before doing anything else.
 * Uses pdf-parse.
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await parsePDFBuffer(buffer);

  const text = data.text?.trim() || "";
  console.log("[PDF] Extracted text preview:", text.slice(0, 500));

  if (text.length < 50) {
    throw new Error("PDF text extraction failed or returned empty text");
  }

  return text;
}

/**
 * Extract text (and metadata) from an in-memory PDF buffer.
 * Used by upload endpoints (no disk writes).
 */
export async function extractTextFromPDFBuffer(
  buffer: Buffer,
): Promise<PDFExtractionResult> {
  console.log("[PDF] Starting PDF text extraction (backend)");
  console.log("[PDF] Buffer size:", buffer.length, "bytes");

  try {
    const data = await parsePDFBuffer(buffer);

    const extractedText = (data.text || "").trim();
    console.log("[PDF] Extracted text preview:", extractedText.slice(0, 500));
    console.log("[PDF] Extracted text length:", extractedText.length);
    console.log("[PDF] Number of pages:", data.numpages);

    if (!extractedText || extractedText.length < 50) {
      console.error(
        "[PDF] ERROR: PDF text extraction returned empty or too short text",
      );
      console.error("[PDF] Extracted content:", JSON.stringify(extractedText));
      
      const errorMsg = extractedText.length > 0
        ? `PDF text extraction returned insufficient text (${extractedText.length} characters). The PDF might be image-based (scanned document) or contain very little text. Please ensure the PDF contains selectable text, or provide coordinates (latitude, longitude) in the document.`
        : "PDF text extraction failed or returned empty text. The PDF might be image-based (scanned document) or encrypted. Please ensure the PDF contains selectable text, or provide coordinates (latitude, longitude) in the document.";
      
      throw new Error(errorMsg);
    }

    return {
      text: extractedText,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error("[PDF] ERROR: PDF parsing failed:", error);
    console.error("[PDF] ERROR: Error type:", typeof error);
    console.error(
      "[PDF] ERROR: Error details:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    if (error instanceof Error) {
      throw new Error(`PDF text extraction failed: ${error.message}`);
    }
    // Handle non-Error objects
    const errorMessage =
      error && typeof error === "object" && "message" in error
      ? String(error.message)
      : String(error);
    throw new Error(`PDF text extraction failed: ${errorMessage}`);
  }
}
