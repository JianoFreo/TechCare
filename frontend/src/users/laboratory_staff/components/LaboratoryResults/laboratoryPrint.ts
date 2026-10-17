export const REPORT_WIDTH = 794; // A4 at 96 dpi; browser printing uses physical mm.
export const REPORT_MIN_HEIGHT = 1123;


export const REPORT_FRAME_HTML = /* HTML */ `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Laboratory Result</title>
      <style>
        :root {
          color-scheme: light;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background: white;
          color: #243956;
          font:
            12px/1.5 Arial,
            Helvetica,
            sans-serif;
          padding: 53px;
          width: 794px;
          min-height: 1123px;
        }
        h1,
        h2,
        h3,
        p,
        dl,
        dd {
          margin: 0;
        }
        img {
          max-width: 100%;
        }
        .report-header {
          display: flex;
          gap: 16px;
          align-items: center;
          border-bottom: 2px solid #36b3e9;
          padding-bottom: 20px;
          margin-bottom: 18px;
          break-inside: avoid;
        }
        .logo {
          width: 58px;
          height: 58px;
          object-fit: contain;
        }
        .clinic {
          font-size: 17px;
          line-height: 1.3;
          color: #203757;
        }
        .muted {
          color: #6d7e94;
        }
        .small {
          font-size: 10px;
        }
        .report-type {
          font-size: 10px;
          letter-spacing: 1px;
          margin-top: 5px;
          color: #1686b4;
        }
        .report-state {
          margin: 0 0 18px;
          padding: 9px 12px;
          border: 1px solid #b8c9da;
          background: #f3f7fb;
          font-size: 11px;
          break-inside: avoid;
        }
        .draft {
          border-color: #d9ab4c;
          background: #fff9ec;
          color: #875c12;
        }
        .patient {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px 18px;
          border: 1px solid #d9e6ef;
          background: #f4f9fd;
          padding: 14px;
          margin-bottom: 24px;
          break-inside: avoid;
        }
        .patient dt {
          font-size: 9px;
          color: #72859d;
          margin-bottom: 3px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .patient dd {
          font-size: 11px;
          overflow-wrap: anywhere;
        }
        .patient-name {
          font-weight: bold;
        }
        .report-title {
          font-size: 18px;
          text-align: center;
          margin: 0 0 3px;
          color: #203757;
        }
        .report-category {
          text-align: center;
          margin-bottom: 20px;
          color: #72859d;
          font-size: 10px;
        }
        .section-heading {
          font-size: 12px;
          font-weight: bold;
          color: #233f62;
          border-bottom: 1px solid #dce7f0;
          padding: 12px 0 6px;
          margin: 8px 0;
          break-after: avoid;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          margin: 0 0 16px;
          font-size: 11px;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        tr {
          break-inside: avoid;
        }
        th,
        td {
          padding: 8px;
          vertical-align: top;
          border-bottom: 1px solid #e4ebf2;
          text-align: inherit;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }
        th {
          font-size: 10px;
          color: #647e9e;
          background: #edf6fc;
          font-weight: normal;
        }
        th:first-child {
          width: 32%;
        }
        .result-value {
          font-weight: bold;
          color: #203757;
        }
        .flag {
          font-size: 9px;
          font-weight: bold;
        }
        .abnormal {
          color: #a14426;
        }
        .field {
          display: inline-block;
          vertical-align: top;
          padding: 6px 10px 12px 0;
          break-inside: avoid;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }
        .field-label {
          font-size: 10px;
          color: #72859d;
        }
        .field-value {
          font-weight: bold;
          margin-top: 3px;
        }
        .static-text,
        .notes p {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .static-text {
          margin: 8px 0 14px;
        }
        .report-image {
          display: block;
          max-height: 250px;
          object-fit: contain;
          margin: 12px 0;
        }
        .divider {
          border: 0;
          border-top: 1px solid #bed1e2;
          margin: 14px 0;
        }
        .notes {
          margin: 10px 0 24px;
        }
        .notes h3 {
          font-size: 12px;
          margin-bottom: 8px;
          break-after: avoid;
        }
        .notes p {
          font-size: 11px;
        }
        .report-footer {
          margin-top: 28px;
          border-top: 1px solid #dbe6ef;
          padding-top: 12px;
          font-size: 10px;
          line-height: 1.7;
          break-inside: avoid;
          overflow-wrap: anywhere;
        }
        @page {
          size: A4 portrait;
          margin: 14mm;
        }
        @media print {
          html,
          body {
            width: auto;
            min-height: 0;
            margin: 0;
            padding: 0;
            background: white;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .report-header {
            padding-bottom: 14px;
          }
          .report-title {
            break-after: avoid;
          }
          a {
            color: inherit;
            text-decoration: none;
          }
        }
      </style>
    </head>
    <body></body>
  </html>`;

export function reportText(value: unknown): string {
  if (value == null || value === "") {
    return "—";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length ? value.map(reportText).join(", ") : "—";
  }

  return "—";
}

export function safeReportImage(source?: string) {
  return source &&
    (/^https?:\/\//i.test(source) ||
      /^\/(?!\/)/.test(source) ||
      /^data:image\/(png|jpeg|webp|gif);base64,/i.test(source))
    ? source
    : undefined;
}

/** Wait for the actual report assets, including admin-supplied images, before printing. */
export async function waitForReportAssets(document: Document) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      Promise.all([
        document.fonts?.ready,
        ...Array.from(document.images).map(async (image) => {
          await image.decode();

          if (!image.naturalWidth) {
            throw new Error("A report image could not be loaded.");
          }
        }),
      ]),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                "Report images are taking too long to load. Please retry the preview.",
              ),
            ),
          15000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
