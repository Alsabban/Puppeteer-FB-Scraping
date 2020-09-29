const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();
const WAIT_FOR_PAGE = 5000;
const DELAY_USER_INPUT = 2000;
const DELAY_PW_INPUT = 1000;


(async () => {
  const browser = await puppeteer.launch({headless: false});
  const context = browser.defaultBrowserContext();
  await context.overridePermissions(process.env.LEVAK_POLICIJE, ['notifications']);
  const page = await browser.newPage();
  await page.goto(process.env.LEVAK_POLICIJE);
//   await page.type('#email', process.env.FB_USER, {delay: DELAY_USER_INPUT});
//   await page.type('#pass', process.env.FB_PW, {delay: DELAY_PW_INPUT});
//   await page.click('#loginbutton');

    

  if (await page.$('div[role="dialog"]') !== null){
    await page.waitForSelector('div[role="dialog"]');  
    await page.click('div[role="button"]') ;
  }
     
  await page.waitForSelector('input[name="email"]');

  
  await page.type('input[name="email"]', process.env.FB_USER, {delay: DELAY_USER_INPUT});
  await page.type('input[name="pass"]', process.env.FB_PW, {delay: DELAY_PW_INPUT});
  await page.click('div[aria-label="Accessible login button"]');
  await page.waitForNavigation(".userContentWrapper");

  await delay(WAIT_FOR_PAGE);

  const elems = await page.evaluate(() => {
    const infos = Array.from(document.querySelectorAll(".userContentWrapper"));
    
    return infos.map(info => { 
     const array =  info.innerText.split('\n');
     return array.slice(3,4); 
    });

  });

  console.log(elems);

})();

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}