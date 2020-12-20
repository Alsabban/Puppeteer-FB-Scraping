const puppeteer = require("puppeteer");


//Main Function
(async () => {
    try {
      //Running Chrome
      const browser = await puppeteer.launch({ headless: false });
     // const context = browser.defaultBrowserContext();
    }
    catch(error){
        console.log(error)
    }
})();      