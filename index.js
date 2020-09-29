const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();
const WAIT_FOR_PAGE = 5000;
const DELAY_USER_INPUT = 500;
const DELAY_PW_INPUT = 500;

(async () => {
    try{
        const browser = await puppeteer.launch({headless: false});
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(process.env.FB_PAGE, ['notifications']);
        const page = await browser.newPage();
        await page.goto(process.env.FB_PAGE);
        await delay(WAIT_FOR_PAGE);  
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
        const data = await page.evaluate(async function (){
            var postList = [];
            async function scrapData() {
            try{
              const postListLength = document.querySelectorAll('.userContentWrapper').length;
              console.log('postListLength ', postListLength);
              class Post {
                constructor(document) {
                   console.log("post initiallized");
                    this.document = document;
                    this.post = document.querySelector('.userContentWrapper');
                }
            
                get PostLength() {
                    try {
                      return this.document.querySelectorAll('.userContentWrapper').length;
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
            
              const post = new Post(document);
              if(post.post) {
                await post.PressSeeMore();
                //comment = new Comment(post);
                //await comment.PressSeeMoreComments();      
                //await comment.pressMoreReplies();
                //await comment.pressSeeMoreForAllComments();
                // console.log('posts = ', post.scrap());
                // console.log('comments = ',  comment.scrap());
                postList.push({ post: await post.scrap()});
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
                }catch (error) {
                    console.error('error from scrapDataFunction ==>', error);
                    debugger;
                  }
            }
            await scrapData();
            return await Promise.all(postList);
        });
        
        await storeDataToFile('./fb.json', data);
    }catch (error) {
        console.log('Catched error message', error.message);
        console.log('Catched error stack', error.stack);
        console.log('Catched error ', error);
      }
})();

const storeDataToFile = async function(file, data) {
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
        setTimeout(resolve, time)
    });
  }



