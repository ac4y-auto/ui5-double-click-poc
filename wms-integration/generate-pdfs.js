#!/usr/bin/env node
/**
 * PDF generáló script – markdown → PDF mermaid + syntax highlight-tal.
 * Futtatás: node wms-integration/generate-pdfs.js
 */
const globalModules = require("child_process")
    .execSync("npm root -g", { encoding: "utf-8" }).trim();
const { mdToPdf } = require(require("path").join(globalModules, "md-to-pdf"));
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const FILES = [
    "INTEGRATION-GUIDE.md",
    "INTEGRATION-GUIDE-TLDR.md",
    "USAGE-GUIDE.md",
    "USAGE-GUIDE-TLDR.md"
];

async function main() {
    const dir = __dirname;

    for (const file of FILES) {
        const inputPath = path.join(dir, file);
        const outputPath = inputPath.replace(/\.md$/, ".pdf");

        console.log(`Generálás: ${file} → ${path.basename(outputPath)}`);

        try {
            const pdf = await mdToPdf(
                { path: inputPath },
                {
                    launch_options: {
                        executablePath: CHROME_PATH,
                        args: ["--no-sandbox", "--disable-setuid-sandbox"]
                    },
                    highlight_style: "github-dark",
                    body_class: "markdown-body",
                    pdf_options: {
                        format: "A4",
                        margin: { top: "20mm", bottom: "25mm", left: "20mm", right: "20mm" },
                        printBackground: true,
                        displayHeaderFooter: true,
                        headerTemplate: '<span></span>',
                        footerTemplate: `
                            <div style="width: 100%; font-size: 9px; color: #999; padding: 0 20mm; display: flex; justify-content: space-between;">
                                <span>${file.replace(/\.md$/, "")}</span>
                                <span>NTT WMS</span>
                                <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
                            </div>
                        `
                    },
                    css: `
                        body { font-family: Segoe UI, sans-serif; font-size: 14px; line-height: 1.6; }
                        code { font-family: Cascadia Code, Consolas, Courier New, monospace; background: #1e1e1e; color: #79c0ff; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
                        pre { background: #0d1117 !important; padding: 16px; border-radius: 6px; overflow-x: auto; border: 1px solid #30363d; }
                        pre code { color: #d4d4d4; background: transparent; padding: 0; }
                        table { border-collapse: collapse; width: 100%; margin: 12px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #f0f0f0; font-weight: 600; }
                        h1 { border-bottom: 2px solid #0070f3; padding-bottom: 8px; }
                        h2 { margin-top: 1.5em; }
                        hr { margin: 2em 0; }
                    `
                }
            );

            if (pdf) {
                require("fs").writeFileSync(outputPath, pdf.content);
                console.log(`  ✓ ${path.basename(outputPath)} kész`);
            }
        } catch (err) {
            console.error(`  ✗ Hiba: ${err.message}`);
        }
    }

    console.log("\nKész!");
}

main();
