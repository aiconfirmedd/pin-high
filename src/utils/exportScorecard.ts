import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

function getElement(elementId: string): HTMLElement {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);
  return el;
}

export async function exportScorecardPng(elementId: string): Promise<void> {
  const el = getElement(elementId);
  const dataUrl = await toPng(el, { backgroundColor: "#1A1A1A" });
  const link = document.createElement("a");
  link.download = "scorecard.png";
  link.href = dataUrl;
  link.click();
}

export async function exportScorecardPdf(elementId: string, filename: string): Promise<void> {
  const el = getElement(elementId);
  const dataUrl = await toPng(el, { backgroundColor: "#1A1A1A" });
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve) => { img.onload = () => resolve(); });

  const pdf = new jsPDF({
    orientation: img.width > img.height ? "landscape" : "portrait",
    unit: "px",
    format: [img.width, img.height],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
  pdf.save(filename);
}

export async function exportInsightPng(elementId: string): Promise<void> {
  const el = getElement(elementId);
  const dataUrl = await toPng(el, { backgroundColor: "#1A1A1A" });
  const link = document.createElement("a");
  link.download = "round-insight.png";
  link.href = dataUrl;
  link.click();
}

export async function exportInsightPdf(elementId: string): Promise<void> {
  await exportScorecardPdf(elementId, "round-insight.pdf");
}
