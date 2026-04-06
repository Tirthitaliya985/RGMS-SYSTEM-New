import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.resolve(__dirname, "..", "docs", "demo-guide.html");
const outputPath = path.resolve(__dirname, "..", "docs", "Society-Management-Demo-Guide.pdf");

const demoSocietyName = process.env.DEMO_SOCIETY_NAME || "Demo Society";
const demoEmail = process.env.DEMO_EMAIL || "demo.visitor@example.com";
const demoPassword = process.env.DEMO_PASSWORD || "Demo@1234";
const liveDemoUrl = process.env.LIVE_DEMO_URL || process.env.DEMO_LIVE_URL || "https://example.com";

const template = await fs.promises.readFile(htmlPath, "utf8");
const html = template
  .replace(/\{\{DEMO_SOCIETY\}\}/g, demoSocietyName)
  .replace(/\{\{DEMO_EMAIL\}\}/g, demoEmail)
  .replace(/\{\{DEMO_PASSWORD\}\}/g, demoPassword)
  .replace(/\{\{DEMO_LIVE_URL\}\}/g, liveDemoUrl);

const browser = await puppeteer.launch({ headless: "new" });
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  });
  console.log(`PDF generated: ${outputPath}`);
} finally {
  await browser.close();
}
