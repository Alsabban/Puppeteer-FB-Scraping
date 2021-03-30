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
      let posts = [];
      var postcounter = 0;
      let NUMBER_OF_POSTS = 50;
        //Scraping Data Function
      window.scrollBy(0, window.innerHeight*10);
      function delay(time) {
        return new Promise(function (resolve) {
          setTimeout(resolve, time);
        });
      }      
      await delay(1000);
      async function scrapData() {
        try {
          window.scrollBy(0, window.innerHeight*10);
      function delay(time) {
        return new Promise(function (resolve) {
          setTimeout(resolve, time);
        });
      }      
      await delay(2000);
           // Detecting the number of the posts loaded on the browser
           const postListLength = document.querySelectorAll(
           'div[data-ad-preview="message"]'
          //  '#mount_0_0 > div > div:nth-child(1) > div.rq0escxv.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.l9j0dhe7.dp1hu0rb.cbu4d94t.j83agx80 > div.bp9cbjyn.j83agx80.cbu4d94t.d2edcug0 > div.rq0escxv.d2edcug0.ecyo15nh.hv4rvrfc.dati1w0a.cxgpxx05 > div > div.rq0escxv.l9j0dhe7.du4w35lb.qmfd67dx.hpfvmrgz.gile2uim.buofh1pr.g5gj957u.aov4n071.oi9244e8.bi6gxh9e.h676nmdw.aghb5jc5 > div > div > div > div'
          ).length;
          console.log("postListLength ", postListLength);
          class Post {
            constructor(document) {
              console.log("post initiallized");
              this.document = document;
              this.postdata = document.querySelector(
                'div[data-ad-preview="message"]'
                // '#mount_0_0 > div > div:nth-child(1) > div.rq0escxv.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.l9j0dhe7.dp1hu0rb.cbu4d94t.j83agx80 > div.bp9cbjyn.j83agx80.cbu4d94t.d2edcug0 > div.rq0escxv.d2edcug0.ecyo15nh.hv4rvrfc.dati1w0a.cxgpxx05 > div > div.rq0escxv.l9j0dhe7.du4w35lb.qmfd67dx.hpfvmrgz.gile2uim.buofh1pr.g5gj957u.aov4n071.oi9244e8.bi6gxh9e.h676nmdw.aghb5jc5 > div > div > div > div'
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
          
            const post = new Post(document);
              if (post.postdata) {
                postcounter++;
                let mydata = await post.getpostfeatures();
                posts.push({
                  post_id: postcounter,
                  post: mydata,
                });
                console.log(mydata);
                post.removepost();
                if(posts.length<2) await scrapData();
              else {
                return {
                  posts: posts
                };
              }
              } 
              else {
                console.log("postList if no post found ==> ", posts);
                return {
                  posts: posts
                };
              }
              
        }
        catch (error) {
          console.error("error from scrapDataFunction ==>", error);
          debugger;
        }
      }
        
      await scrapData();
      return {
        posts: posts
      };
    });
    //storing the posts we scraped in a json file
    storeDataInJSON("./EducationTestNews.json", posts["posts"]);

    //closing the browser
    //await browser.close();
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


