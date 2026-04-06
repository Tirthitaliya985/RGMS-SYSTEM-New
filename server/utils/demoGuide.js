import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.resolve(__dirname, "..", "..", "docs", "demo-guide.html");
const OUTPUT_DIR = path.resolve(__dirname, "..", "..", "uploads", "demo-guides");

const safeText = (value) => (value ? String(value) : "-");

export const renderDemoGuideHtml = ({
  demoSocietyName,
  demoEmail,
  password,
  liveDemoUrl,
}) => {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

  return template
    .replace(/\{\{DEMO_SOCIETY\}\}/g, safeText(demoSocietyName))
    .replace(/\{\{DEMO_EMAIL\}\}/g, safeText(demoEmail))
    .replace(/\{\{DEMO_PASSWORD\}\}/g, safeText(password))
    .replace(/\{\{DEMO_LIVE_URL\}\}/g, safeText(liveDemoUrl));
};

export const generateDemoGuidePdf = async ({
  visitorId,
  demoSocietyName,
  demoEmail,
  password,
  liveDemoUrl,
}) => {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const html = renderDemoGuideHtml({
    demoSocietyName,
    demoEmail,
    password,
    liveDemoUrl,
  });

  const htmlPath = path.resolve(OUTPUT_DIR, `demo-guide-${visitorId}.html`);
  const pdfPath = path.resolve(OUTPUT_DIR, `demo-guide-${visitorId}.pdf`);

  await fs.promises.writeFile(htmlPath, html, "utf8");

  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
  } finally {
    await browser.close();
  }

  return pdfPath;
};
