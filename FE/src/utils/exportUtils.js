/**
 * Real file export utilities (CSV with UTF-8 BOM for Excel & HTML/JSON reports)
 */

function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportToCsv(filename, headers, rows) {
  const escapeCell = (val) => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];

  // \uFEFF BOM ensures Microsoft Excel opens Vietnamese UTF-8 characters properly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBrowserDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportToJson(filename, data) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  triggerBrowserDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

export function exportToHtmlReport(filename, title, summaryItems = [], headers = [], rows = []) {
  const generatedAt = new Date().toLocaleString('vi-VN');
  const summaryHtml = summaryItems
    .map(
      (s) =>
        `<div style="padding:12px 16px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;">
          <div style="font-size:12px;color:#6b7280;text-transform:uppercase;">${s.label}</div>
          <div style="font-size:20px;font-weight:700;color:#065f46;margin-top:4px;">${s.value}</div>
        </div>`
    )
    .join('');

  const thHtml = headers
    .map((h) => `<th style="padding:10px 12px;border-bottom:2px solid #065f46;text-align:left;font-size:13px;">${h}</th>`)
    .join('');

  const trHtml = rows
    .map(
      (r) =>
        `<tr>${r
          .map((cell) => `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${cell ?? ''}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
</head>
<body style="font-family:Segoe UI,Roboto,sans-serif;padding:32px;color:#111827;max-width:1100px;margin:0 auto;">
  <h1 style="color:#065f46;margin-bottom:4px;">${title}</h1>
  <p style="color:#6b7280;font-size:13px;margin-top:0;">Xuất từ hệ thống VeggieAI lúc: ${generatedAt}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:20px 0;">
    ${summaryHtml}
  </div>
  <table style="width:100%;border-collapse:collapse;margin-top:16px;">
    <thead><tr>${thHtml}</tr></thead>
    <tbody>${trHtml}</tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  triggerBrowserDownload(blob, filename.endsWith('.html') ? filename : `${filename}.html`);
}
