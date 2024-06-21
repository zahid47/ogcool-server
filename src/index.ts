import { serve } from "@hono/node-server";
import { Hono } from "hono";
import puppeteer from "puppeteer";

const app = new Hono();

async function generateScreenShot(url: string) {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 630 });

  await page.goto(url, { waitUntil: "networkidle2" });

  const imageBuffer = await page.screenshot();

  await page.close();
  await browser.close();

  return imageBuffer;
}

app.get("/", async (c) => {
  let url = c.req.query("url");

  if (!url)
    return new Response(
      "No url provided. Please add an ?url=https://example.com/ parameter",
      { status: 400 }
    );

  // check if url has a protocol, if not add https
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  // check if url is valid
  try {
    new URL(url);
  } catch (err) {
    return new Response("Invalid URL", { status: 400 });
  }

  // generate screenshot from url
  try {
    const imageBuffer = await generateScreenShot(url);

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/jpg",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Error generating screenshot", { status: 500 });
  }
});

const port = parseInt(process.env.PORT || "3000");
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
