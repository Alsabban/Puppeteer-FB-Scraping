//Imports
const puppeteer = require("puppeteer");

const DateScrapper = async permalink => {
  const calculateDate = require("./DateFormatter");

  try {
    //starting Chrome
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH,
      headless: true
    });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(process.env.FB_LOGIN, ["notifications"]);
    //Opening the Facebook Login
    const page = await browser.newPage({ viewport: null });

    await page.goto(permalink);
    await delay(2000);

    const postfeatures = await page.evaluate(() => {
      date = document.querySelector("abbr").innerText;
      return date;
    });
    var date = await calculateDate(postfeatures);

    //closing the browser
    await browser.close();

    return date;
  } catch (error) {
    console.log("Catched error message", error.message);
    console.log("Catched error stack", error.stack);
    console.log("Catched error ", error);
  }
};

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}

module.exports = DateScrapper;
