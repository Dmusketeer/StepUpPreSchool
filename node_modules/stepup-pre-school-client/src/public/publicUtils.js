function normalizePhoneNumber(phone = "") {
  return phone.replace(/\D/g, "");
}

export function createWhatsAppLink(phone, message) {
  return `https://wa.me/${normalizePhoneNumber(phone)}?text=${encodeURIComponent(message)}`;
}

function createBrochureText({ brochure, contact, fees }) {
  const feeLines = (fees?.items ?? []).map((item) => `- ${item.title}: ${item.amount} (${item.description})`);
  const rules = [
    "Students should arrive on time and be collected only by authorised guardians.",
    "Parents should inform the school before leave, late arrival, or early pickup.",
    "Children must wear clean, comfortable clothing and carry labelled belongings.",
    "Healthy snacks and a water bottle should be sent every day.",
    "Toys, jewellery, sharp items, and valuable belongings should not be brought to school.",
    "Sick children should rest at home until fully recovered.",
    "Parents should keep emergency contact numbers updated with the school office.",
    "School notices, event instructions, and fee dates should be followed on time.",
    "Respectful behaviour is expected from children, parents, staff, and visitors.",
    "Photo and video sharing from school events should respect other children's privacy."
  ];

  return [
    brochure?.title || "StepUp Pre School Brochure",
    "",
    brochure?.description || "A quick parent handout for admissions and school details.",
    "",
    "Programs: Playgroup, Nursery, Lower KG, Upper KG",
    `Timings: ${contact.hours}`,
    "",
    "Fees:",
    ...feeLines,
    "",
    fees?.note || "Please contact the school for the latest fee confirmation.",
    "",
    "Rules and Regulations:",
    ...rules.map((rule) => `- ${rule}`),
    "",
    `Phone: ${contact.phone}`,
    `Email: ${contact.email}`,
    `Address: ${contact.address}`
  ].join("\n");
}

function sanitizePdfText(value) {
  return String(value).replace(/[^\x20-\x7E]/g, " ");
}

function escapePdfText(value) {
  return sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapPdfLine(line, maxLength = 82) {
  if (!line) {
    return [""];
  }

  return line.split(" ").reduce((lines, word) => {
    const currentLine = lines[lines.length - 1];
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length <= maxLength) {
      lines[lines.length - 1] = nextLine;
      return lines;
    }

    lines.push(word);
    return lines;
  }, [""]);
}

function createPdfDataUri(lines) {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 54;
  const lineHeight = 17;
  const maxLinesPerPage = 38;
  const pageLines = [];

  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pageLines.push(lines.slice(index, index + maxLinesPerPage));
  }

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  ];
  const pageObjectNumbers = [];

  pageLines.forEach((linesForPage, pageIndex) => {
    const pageObjectNumber = objects.length + 1;
    const contentObjectNumber = pageObjectNumber + 1;
    const commands = ["BT"];
    let y = pageHeight - margin;

    linesForPage.forEach((line, lineIndex) => {
      const isTitle = pageIndex === 0 && lineIndex === 0;
      const isHeading = line.endsWith(":") || isTitle;
      commands.push(isHeading ? "/F2 18 Tf" : "/F1 11 Tf");

      if (line) {
        commands.push(`1 0 0 1 ${margin} ${y} Tm`);
        commands.push(`(${escapePdfText(line)}) Tj`);
      }

      y -= isTitle ? 28 : lineHeight;
    });

    commands.push("ET");
    const content = commands.join("\n");

    pageObjectNumbers.push(pageObjectNumber);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
    );
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return `data:application/pdf;base64,${btoa(pdf)}`;
}

export function createBrochureDownloadHref(details) {
  const lines = createBrochureText(details).split("\n").flatMap((line) => wrapPdfLine(line));
  return createPdfDataUri(lines);
}

export function formatCount(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}