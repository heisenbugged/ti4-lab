import fs from "fs";
import puppeteer from "puppeteer";

export const loader = async ({ params }: { params: { draftId: string } }) => {
  const draftId = params.draftId;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath:
      process.env.NODE_ENV === "production"
        ? "/opt/google/chrome/google-chrome"
        : undefined,
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:3000/map-image/draft/${draftId}`);
  await page.emulateMediaFeatures([
    {
      name: "prefers-color-scheme",
      value: "dark",
    },
  ]);
  await page.setViewport({
    width: 900 + 120,
    height: 1030,
  });
  // annoying, but sleep for 250ms to allow the right 'dark' mode to be set.
  // and content to properly load.
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.screenshot({
    path: `./generated/${draftId}.png`,
  });
  await browser.close();

  const image = fs.readFileSync(`./generated/${draftId}.png`);
  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
      // we do not cache in case a draft image is generated prematurely before it is done.
      "Cache-Control": "no-cache",
      "Content-Disposition": `attachment; filename="${draftId}.png"`,
    },
  });
};
