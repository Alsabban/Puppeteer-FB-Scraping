//Imports
const puppeteer = require("puppeteer");


(async () => {
  const calculateDate = require("./DateFormatter")
  args = process.argv;
  //console.log(args);
  let permalink = args[2];
  console.log("permalink: " + permalink);
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
    
    await page.goto(permalink);
    await delay(2000);

    const postfeatures = await page.evaluate(() => {
      // post = {};
      //features we are interested in
      container = document.querySelector("#page");
      // author = container.querySelector(
      //   "#MPhotoContent > div._2vj7._2phz.voice.acw > div > div._4g34 > div > div > div.msg > a > strong"
      // ).innerText;
      // console.log(author);
      // text = container.querySelector(
      //   "#MPhotoContent > div._2vj7._2phz.voice.acw > div > div._4g34 > div > div > div.msg > div"
      // );
      // if(text){
      //   text = text.innerText;
      //   console.log(text);
      // }else{
      //   text = "";
      // }
      // likes = container.querySelector('div[class="like_def _55wr likes _1-uw"]')
      //   .innerText;
      // likes = likes.match(/(\d+)/);
      // console.log(likes[0]);
      // shares = container.querySelector('div[class="_43lx _55wr"]')
      //   .innerText;
      // shares = shares.replace(/[a-z]/g, '').trim();
      // console.log(shares);
      date = document.querySelector('abbr')
        .innerText;
      date = date;
      console.log(date);
      
      // post["author"] = author;
      // post["text"] = text;
      // post["likes"] = likes[0];
      // post["shares"] = shares;
      // post["date"] = date;
      return date;
    });
    console.log(postfeatures)
    var date = await calculateDate(postfeatures);
    console.log(date);

    // permalink=permalink.replace('m.','www.');
    // console.log(permalink);
    
    // await page.goto(permalink);
    // await delay(2000);
    

    //closing the browser
    await browser.close();
  } catch (error) {
    console.log("Catched error message", error.message);
    console.log("Catched error stack", error.stack);
    console.log("Catched error ", error);
  }
})();

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
