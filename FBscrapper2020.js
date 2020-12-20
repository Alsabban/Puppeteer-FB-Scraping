//Imports
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

//GLOBAL VARIABLES
const WAIT_FOR_PAGE = 3000;
const DELAY_USER_INPUT = 0;
const DELAY_PW_INPUT = 0;



//Main Function
(async () => {
    try {
        //Running Chrome
    const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless:false });
    const context = browser.defaultBrowserContext();
    //Opening the Facebook Login
    await context.overridePermissions(process.env.FB_LOGIN, ["notifications"]);
    const page = await browser.newPage({ viewport: null });
    
    //await page.setViewport(null);
    await page.goto(process.env.FB_LOGIN);
    await delay(WAIT_FOR_PAGE);
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', process.env.FB_USER, {
     delay: DELAY_USER_INPUT
    });
    await page.type('input[name="pass"]', process.env.FB_PW, {
     delay: DELAY_PW_INPUT
    });
    await page.click('button[data-testid="royal_login_button"]');
   await delay(WAIT_FOR_PAGE);
    //Opening the Facebook Group
     await page.goto(process.env.FB_PAGE);
     await page.waitForNavigation({ waitUntil: 'networkidle0' });
    




} catch (error) {
  console.log("Catched error message", error.message);
  console.log("Catched error stack", error.stack);
  console.log("Catched error ", error);
}
})();


//Storig data into json file
const storeDataInJSON = async function(file, data) {
    console.log(data);
    return fs.writeFileSync(file, JSON.stringify(data), err => {
      if (err) {
        return err;
      }
      return;
    });
  };

  function delay(time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time);
    });
  }
  