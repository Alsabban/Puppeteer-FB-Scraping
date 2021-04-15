//Imports
const puppeteer = require("puppeteer");

const AuthorScrapper = async permalink => {
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
      let owner = {};

      // let verified = document.querySelector('i[aria-label="Verified Account"]');
      let verified = document.querySelector("a._56_f._5dzy._5d-1._3twv._33v-");
      console.log(verified);
      if (verified) owner["verified"] = true;
      else owner["verified"] = false;

      let followers = document.querySelector(
        "#PagesProfileHomeSecondaryColumnPagelet > div > div:nth-child(1) > div > div._4-u2._6590._3xaf._4-u8 > div:nth-child(3) > div > div._4bl9 > div"
      );

      if(followers){
        followers = followers.innerText.split(" ")[0];
      }else{
        followers = document.querySelector(
          "#PagesProfileHomeSecondaryColumnPagelet > div > div:nth-child(2) > div > div._4-u2._6590._3xaf._4-u8 > div:nth-child(3) > div > div._4bl9 > div"
        ).innerText.split(" ")[0];
      }

      owner["followers"] = followers;

      return owner;
    });

    //closing the browser
    await browser.close();

    return postfeatures;
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

module.exports = AuthorScrapper;
