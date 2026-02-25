#!/usr/bin/env node
/**
 * PDF generáló script – markdown → PDF, mermaid render + syntax highlight.
 * Futtatás: node wms-integration/generate-pdfs.js
 */
const globalModules = require("child_process")
    .execSync("npm root -g", { encoding: "utf-8" }).trim();
const { mdToPdf } = require(require("path").join(globalModules, "md-to-pdf"));
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const MERMAID_PATH = require("path").join(__dirname, "..", "node_modules", "mermaid", "dist", "mermaid.min.js");

const FILES = [
    "SCAN-CONFIRM-INTEGRATION-GUIDE.md",
    "SCAN-CONFIRM-INTEGRATION-GUIDE-TLDR.md",
    "SCAN-CONFIRM-USAGE-GUIDE.md",
    "SCAN-CONFIRM-USAGE-GUIDE-TLDR.md"
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
                    highlight_style: "github",
                    body_class: "markdown-body",
                    // Mermaid render: lokális csomag + inicializálás
                    script: [
                        { path: MERMAID_PATH },
                        { content: "mermaid.initialize({ startOnLoad: true, theme: 'default' });" }
                    ],
                    pdf_options: {
                        format: "A4",
                        margin: { top: "20mm", bottom: "25mm", left: "20mm", right: "20mm" },
                        printBackground: true,
                        displayHeaderFooter: true,
                        headerTemplate: "<span></span>",
                        footerTemplate: `
                            <div style="width:100%;font-size:9px;color:#999;padding:0 20mm;display:flex;justify-content:space-between;">
                                <span>${file.replace(/\.md$/, "")}</span>
                                <span>NTT WMS</span>
                                <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
                            </div>
                        `
                    },
                    css: `
                        body      { font-family: Segoe UI, sans-serif; font-size: 13px; line-height: 1.6; color: #1f2328; }
                        h1        { border-bottom: 2px solid #0070f3; padding-bottom: 8px; margin-bottom: 1em; }
                        h2        { margin-top: 1.8em; border-bottom: 1px solid #d1d9e0; padding-bottom: 4px; }
                        h3        { margin-top: 1.2em; }
                        code      { font-family: Cascadia Code, Consolas, monospace; font-size: 12px;
                                    background: #f6f8fa; color: #0550ae; padding: 2px 5px; border-radius: 4px;
                                    border: 1px solid #d1d9e0; }
                        pre       { background: #f6f8fa; padding: 16px; border-radius: 6px;
                                    border: 1px solid #d1d9e0; overflow-x: auto; }
                        pre code  { background: transparent; border: none; padding: 0;
                                    color: #1f2328; font-size: 12px; }
                        table     { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12px; }
                        th, td    { border: 1px solid #d1d9e0; padding: 7px 10px; text-align: left; }
                        th        { background: #f6f8fa; font-weight: 600; }
                        tr:nth-child(even) td { background: #fafbfc; }
                        blockquote { border-left: 4px solid #d1d9e0; margin: 0; padding: 0 1em; color: #636c76; }
                        hr        { border: none; border-top: 1px solid #d1d9e0; margin: 1.5em 0; }
                        .mermaid  { text-align: center; margin: 1.2em 0; }
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
