//Imports
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const fs = require("fs");
const DateScrapper = require("./DateScrapper");
const AuthorScrapper = require("./AuthorScrapper");
dotenv.config();

//GLOBAL VARIABLES
const WAIT_FOR_PAGE = 1000;
const DELAY_INPUT = 1;

//Main Function
(async () => {
  args = process.argv;
  let permalink = args[2];

  console.log("permalink: " + permalink);
  try {
    //starting Chrome
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH,
      headless: false
    });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(process.env.FB_LOGIN, ["notifications"]);

    //Opening the Facebook Login
    const page = await browser.newPage({ viewport: null });
    await page.goto(process.env.FB_LOGIN);
    await delay(WAIT_FOR_PAGE);

    //logging in
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', process.env.FB_USER, {
      delay: DELAY_INPUT
    });
    await page.type('input[name="pass"]', process.env.FB_PW, {
      delay: DELAY_INPUT
    });
    await Promise.all([
      await page.click('button[data-testid="royal_login_button"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);

    //Going to pst
    await page.goto(permalink);
    await delay(WAIT_FOR_PAGE);

    const postfeatures = await page.evaluate(() => {
      post = {};
      container = document.querySelector('div[data-pagelet="root"]');
      console.log(container);
      author = document.querySelector(
        "a.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.oo9gr5id.gpro0wi8.lrazzd5p"
      ).innerText;

      text = container.querySelector("div.a8nywdso.j7796vcc.rz4wbd8a.l29c1vbm");
      if (text) {
        text = text.innerText;
        console.log(text);
      } else {
        text = "";
      }

      likes = container.querySelector(
        "span.bzsjyuwj.ni8dbmo4.stjgntxs.ltmttdrg.gjzvkazv"
      );

      if (likes) {
        likes = likes.innerText;
      } else {
        likes = "0";
      }

      commsAndShares = container.querySelector(
        "div.bp9cbjyn.j83agx80.pfnyh3mw.p1ueia1e"
      );

      if (commsAndShares.innerText !== "") {
        commsAndShares = commsAndShares.innerText;
        if(commsAndShares.includes("\n")){
          commsAndShares = commsAndShares.split("\n");
          comments = commsAndShares[0].split(" c")[0];
          shares = commsAndShares[1].split(" s")[0];
        }

        else if(commsAndShares.includes("comm")){
          comments = commsAndShares[0].split(" c")[0];
          shares = "0";
        }
        else {
          comments = "0";
          shares = commsAndShares[0].split(" s")[0];
        }
        
      } else {
        comments = "0";
        shares = "0";
      }

      post["author"] = author;
      post["text"] = text;
      post["likes"] = likes;
      post["shares"] = shares;
      post["comments"] = comments;

      return post;
    });


    const post = postfeatures;

    authorLink = await permalink.replace("https://", "");

    authorLink = await authorLink.split("/");

    authorLink = (await "https://") + authorLink[0] + "/" + authorLink[1] + "/";

    console.log(authorLink);

    const owner = await AuthorScrapper(authorLink);

    post["verified"] = owner["verified"];
    post["followers"] = owner["followers"];

    permalink = permalink.replace("www.", "m.");
    const date = await DateScrapper(permalink);
    post["date"] = date;

    console.log(post);

    storeDataInJSON("./postScrapped.json", post);

    //closing the browser
    //await browser.close();
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
