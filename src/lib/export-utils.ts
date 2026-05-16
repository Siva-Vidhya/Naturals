/**
 * Export utilities — CSV, PDF, and Excel generation.
 * All run client-side with zero external dependencies.
 */

/** Download a string as a file */
function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export data as CSV */
export function exportCSV(headers: string[], rows: string[][], filename: string) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ].join("\n");
  downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

/** Export data as Excel-compatible XML (.xlsx-like) */
export function exportExcel(headers: string[], rows: string[][], filename: string) {
  const xmlRows = rows.map(
    (r) => `<Row>${r.map((c) => `<Cell><Data ss:Type="String">${c}</Data></Cell>`).join("")}</Row>`
  );
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Report">
<Table>
<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join("")}</Row>
${xmlRows.join("\n")}
</Table>
</Worksheet>
</Workbook>`;
  downloadBlob(xml, `${filename}.xls`, "application/vnd.ms-excel");
}

/** Export data as a styled PDF report (uses browser print) */
export function exportPDF(title: string, sections: { heading: string; content: string }[]) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1F1A17; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .subtitle { color: #888; font-size: 12px; margin-bottom: 32px; }
  h2 { font-size: 16px; color: #6b4fa0; margin: 24px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  p, li { font-size: 13px; line-height: 1.7; color: #444; }
  ul { padding-left: 20px; }
  .footer { margin-top: 40px; font-size: 10px; color: #aaa; text-align: center; }
</style></head><body>
<h1>${title}</h1>
<p class="subtitle">Generated on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at ${new Date().toLocaleTimeString()}</p>
${sections.map((s) => `<h2>${s.heading}</h2><div>${s.content}</div>`).join("")}
<div class="footer">NeuroStrom Intelligence Platform · Confidential</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  }
}
