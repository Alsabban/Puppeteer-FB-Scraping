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

        // let followers = document.querySelector('span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.lr9zc1uh.a8c37x1j.keod5gw0.nxhoafnm.aigsh9s9.d3f4x2em.fe6kdd0r.mau55g9w.c8b282yb.iv3no6db.jq4qci2q.a3bd9o3v.knj5qynh.oo9gr5id.hzawbc8m  > span.d2edcug0.hpfvmrgz.qv66sw1b.c1et5uql.lr9zc1uh.jq4qci2q.a3bd9o3v.knj5qynh.oo9gr5id').innerText.split(" ")[0];

      let followers = document.querySelector(
          "#PagesProfileHomeSecondaryColumnPagelet > div > div:nth-child(1) > div > div._4-u2._6590._3xaf._4-u8 > div:nth-child(3) > div > div._4bl9 > div"
        ).innerText.split(" ")[0];

        // let followers = document.querySelector(
        //   "#mount_0_0_u+ > div > div:nth-child(1) > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.l9j0dhe7.dp1hu0rb.cbu4d94t.j83agx80 > div.bp9cbjyn.j83agx80.cbu4d94t.d2edcug0 > div.rq0escxv.d2edcug0.ecyo15nh.hv4rvrfc.dati1w0a.cxgpxx05 > div > div.rq0escxv.l9j0dhe7.du4w35lb.qmfd67dx.hpfvmrgz.o387gat7.buofh1pr.g5gj957u.aov4n071.oi9244e8.bi6gxh9e.h676nmdw.aghb5jc5.rek2kq2y > div.lpgh02oy > div:nth-child(1) > div > div > div > div.cbu4d94t.j83agx80.cwj9ozl2 > div:nth-child(5) > div > div > div > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.o8rfisnq.p8fzw8mz.pcp91wgn.iuny7tx3.ipjc6fyt > div > div > span > span"
        // ).innerText.split(" ")[0];

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
