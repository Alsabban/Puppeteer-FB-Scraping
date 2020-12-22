//Imports
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

//GLOBAL VARIABLES
const WAIT_FOR_PAGE = 1000;
const DELAY_INPUT = 1;

//Main Function
(async () => {
  try {
    //starting Chrome
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH,
      headless: false,
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
    //await page.click('button[data-testid="royal_login_button"]');
    //await delay(5*WAIT_FOR_PAGE);

    //Opening the Facebook Group
    await page.goto(process.env.FB_PAGE);
    await delay(WAIT_FOR_PAGE);

    //scraping function
    const posts = await page.evaluate(async () => {
      let posts = [],
        postcounter = 0,
        NUMBER_OF_POSTS = 50;
      class Post {
        constructor(document) {
          //this.document = document;
          this.postdata = document.querySelector(
            'div[data-ad-preview="message"]'
          ); //getting post
        }
        getpostfeatures() {
          try {
            return new Promise((resolve) => {
              //gettin the features we are intrested in from the post
              setTimeout(() => {
                if (this.postdata.querySelector("span") === null) {
                  return resolve("");
                } else {
                  return resolve(
                    this.postdata.querySelector("span").innerText.trim()
                  );
                }
              }, 0);
            });
          } catch (error) {
            console.log("scrap post error ===> ", error);
          }
        }
        //to remove the post
        removepost() {
          this.postdata.remove();
        }
      } //end of post class
      
      try {
        setTimeout(() => window.scrollBy(0, 2000), 500);
        for (postcounter; postcounter < NUMBER_OF_POSTS; postcounter++) {
          const post = new Post(document);
          if (post.postdata) {
            let mydata = await post.getpostfeatures();
            posts.push({
              post_id: postcounter,
              post: mydata,
            });
            console.log(mydata);
            post.removepost();
            setTimeout(() => window.scrollBy(0, 2000), 100);
          } /*else {
            console.log("no new posts found");
            return posts;
          }*/
        }
      } catch (error) {
        console.error("error while getting newspage!!", error);
      }
      return posts;
    });
    //storing the posts we scraped in a json file
    storeDataInJSON("./EducationNews.json", posts);

    //closing the browser
    await browser.close();
  } catch (error) {
    console.log("Catched error message", error.message);
    console.log("Catched error stack", error.stack);
    console.log("Catched error ", error);
  }
})();

//Storig data into json file
const storeDataInJSON = async function (file, data) {
  console.log(data);
  return fs.writeFileSync(file, JSON.stringify(data), (err) => {
    if (err) {
      return err;
    }
    return;
  });
};

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
