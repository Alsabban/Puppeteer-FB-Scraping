//Imports
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const fs = require("fs");
const DateScrapper = require("./DateScrapper");
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
       delay: DELAY_INPUT,
     });
     await page.type('input[name="pass"]', process.env.FB_PW, {
       delay: DELAY_INPUT,
     });
     await Promise.all([
       await page.click('button[data-testid="royal_login_button"]'),
       page.waitForNavigation({ waitUntil: "networkidle0" }),
     ]);

    //Going to pst
    await page.goto(permalink);
    await delay(WAIT_FOR_PAGE);

    const postfeatures = await page.evaluate(() => {
        post = {};

        container = document.querySelector('div[data-pagelet="root"]');
        author = document.querySelector(
          "a.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.oo9gr5id.gpro0wi8.lrazzd5p"
        ).innerText;

        text = container.querySelector(
          "#MPhotoContent > div._2vj7._2phz.voice.acw > div > div._4g34 > div > div > div.msg > div"
        );
        if(text){
          text = text.innerText;
          console.log(text);
        }else{
          text = "";
        }
        // likes = container.querySelector('div[class="like_def _55wr likes _1-uw"]')
        //   .innerText;
        // likes = likes.match(/(\d+)/);
        // console.log(likes[0]);
        // shares = container.querySelector('div[class="_43lx _55wr"]')
        //   .innerText;
        // shares = shares.replace(/[a-z]/g, '').trim();
        // console.log(shares);
  
        post["author"] = author;
        // post["text"] = text;
        // post["likes"] = likes[0];
        // post["shares"] = shares;
        // post["date"] = date;
        return post;
      });
      //var date = await calculateDate(postfeatures);
      console.log(postfeatures);
  
      // permalink=permalink.replace('m.','www.');
      // console.log(permalink);
  
      // await page.goto(permalink);
      // await delay(2000);
  
  
      //closing the browser
     // await browser.close();
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
