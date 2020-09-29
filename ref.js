
const puppeteer = require('puppeteer');
const fs = require('fs');
const logger = require('npmlog');

const getData = async function(configData) {
  try {
    logger.info('message: ', 'scrapping started');
    // General conf
    const browser = await puppeteer.launch({ headless: false });
    
    // search in agoda by country
    const page = await browser.newPage();
    page.setCacheEnabled(false);
    const baseUrl = 'https://www.facebook.com/';
    await page.goto(baseUrl, { timeout: 0 });
    await page.waitForSelector('input[data-testid="royal_email"]');
    const LOGIN_EMAIL = 'input[data-testid="royal_email"]';
    const LOGIN_PASS = 'input[data-testid="royal_pass"]';
    await page.evaluate(
      params => {
        document.querySelector(params.LOGIN_EMAIL).value =
          params.configData.userName;
        document.querySelector(params.LOGIN_PASS).value =
          params.configData.password;
      },
      { LOGIN_EMAIL, LOGIN_PASS, configData }
    );
    const LOGIN_BTN = 'input[data-testid="royal_login_button"]';
    await page.click(LOGIN_BTN);
    await page.waitForNavigation({ timeout: 0, waitUntil: 'domcontentloaded' });
    const url = await page.url();
  
  
    
    logger.info('message: ', `navigated to ${baseUrl + 'groups/' + configData.groupID}`);
    await page.goto(baseUrl + 'groups/' + configData.groupID, { timeout: 60000});
    
    logger.info('message: ', 'started scrolling an scrapping');
    const data = await page.evaluate(async function (){
      // return new Promise(async (resolve) => {

      class Post {
        constructor(document) {
            this.document = document;
            this.post = document.querySelector('div[role="article"]');
        }
    
        get PostLength() {
            try {
              return this.document.querySelectorAll('div[role="article"] div.userContentWrapper').length;
            } catch (error) {
              console.log('PostLength error ===> ', error);
            }
        }
    
        PressSeeMore() {
            try {
              return new Promise((resolve, reject) => {
                if(this.post && this.post.innerText.includes('See More')) {
                    this.post.querySelector('span[class=see_more_link_inner]').click();
                }
                setTimeout(() => {
                    return resolve();
                }, 1000);
              })               
            } catch (error) {
              console.log('post PressSeeMore error ===> ', error);
            }
        }
    
        scrap() {
            try {
              return new Promise((resolve) => {
                setTimeout(() => {
                  return resolve(this.post.querySelector('div[data-testid="post_message"').innerText.trim());
                }, 1000);
              });
            } catch (error) {
              console.log('scrap post error ===> ', error);
            }
        }
    
        delete() {
            this.post.remove();
        }
      }

      class Comment {
        constructor(post) {
            this.comment = post.post.querySelector('div[data-testid="UFI2CommentsList/root_depth_0"]');
            this.post = post.post;
        }
        
        get commentLength() {
            try {
              return this.post.querySelectorAll('div[aria-label="Comment"] div[data-testid="UFI2Comment/body"]').length;
            } catch (error) {
              console.log('commentLength error ===>', error);
            }
        }
        
        PressSeeMoreComments() {
            try {
              return new Promise((resolve, reject) => {
                if(this.comment.innerText.includes('View')) {
                    this.comment.querySelector('span').click();
                }
                setTimeout(() => {
                    return resolve();
                }, 1000);
              });                
            } catch (error) {
              console.log('PressSeeMoreComments error ==> ', error);
            }
        }
        
        pressMoreReplies() {
            try {
              return new Promise((resolve, reject) => {
                [...this.comment.querySelectorAll('span')]
                  .forEach(span => {
                      if(span.innerText.includes('replies')) {
                      span.click();
                      }
                  });
                  setTimeout(() => {
                      return resolve();
                  }, 1000);
              })                
            } catch (error) {
              console.log('pressMoreReplies error ==> ', error);
            }
        }
        
        pressSeeMoreForAllComments() {
            try {
              return new Promise((resolve, reject) => {
                [...this.comment.querySelectorAll('span')]
                  .forEach(i => {
                    // console.log('element to press see more on all comments ', i)
                    // console.log('element text to press see more on all comments ', i.innerText)
                    // console.log('is element to press see more on all comments? ', i.innerText.includes('See more'))
                      if(i.innerText.includes('See more')) {
                        // console.log('i.querySelector(\'a\')', i.querySelector('a'));
                        i.click();
                      }
                  })
                  setTimeout(() => {
                      return resolve();
                  }, 1000);
              })
            } catch (error) {
              console.log('pressSeeMoreForAllComments error ==>', error);
            }
        }
        
        scrap() {
            try {
              return new Promise( resolve => {
                setTimeout(() => {
                  return resolve([...this.comment.querySelectorAll('span[dir="ltr"]'), ...this.comment.querySelectorAll('span[dir="rtl"]')]
                  .map(item => item.innerText));
                }, 1000);
              })
            } catch (error) {
              console.log('scrap comments error ===> ', error);
            }
        }
        
        delete() {
            this.comment.remove();
        }
      }

      const postList = [];
      async function scrapData() {
        try {
          const postListLength = document.querySelectorAll('div[role="article"] div.userContentWrapper').length;
          console.log('postListLength ', postListLength);
          const post = new Post(document);
          if(post.post) {
            await post.PressSeeMore();
            comment = new Comment(post);
            await comment.PressSeeMoreComments();      
            await comment.pressMoreReplies();
            await comment.pressSeeMoreForAllComments();
            // console.log('posts = ', post.scrap());
            // console.log('comments = ',  comment.scrap());
            postList.push({ post: await post.scrap(), commentList: await comment.scrap() });
            console.log('Data now ====> ', postList);
            post.delete();
            // console.log('Current Array ===> ', postList);
            setTimeout(() => window.scrollBy(0, 100), 1000);
            if(postListLength*1) await scrapData();
            else return postList;
          } else {
            console.log('postList if no post found ==> ', postList);
            return postList;
          };
        } catch (error) {
          console.error('error from scrapDataFunction ==>', error);
          debugger;
        }
      }
      
      await scrapData();
      return await Promise.all(postList);
      // });
    });
    
    logger.info('message: ', 'close the browser');
    await browser.close();

    logger.info('message: ', 'store scrapped data');
    await storeDataToFile('./fb.json', data);
  } catch (error) {
    console.log('Catched error message', error.message);
    console.log('Catched error stack', error.stack);
    console.log('Catched error ', error);
  }
};

const storeDataToFile = async function(file, data) {
  console.log(data);
  return fs.writeFileSync(file, JSON.stringify(data), err => {
    if (err) {
      logger.error('error: ', JSON.stringify(err, null, 2));
      return err;
    }
    return;
  });
};

const configDataOptions = {
  userName: "sara123@mail-desk.net",
  password: "sara123",
  groupID: "ezzayaroh",
  scrollTimerSec: 100,
  // Post,
  // Comment,
  // scrapData,
};
getData(configDataOptions);
