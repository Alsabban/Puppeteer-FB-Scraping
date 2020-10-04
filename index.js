//imports
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const fs = require("fs");
const { Parser } = require("json2csv");
dotenv.config();

//GLOBAL VARIABLES
const WAIT_FOR_PAGE = 5000;
const DELAY_USER_INPUT = 500;
const DELAY_PW_INPUT = 500;

//Main Function
(async () => {
  try {
    //Running Chrome
    const browser = await puppeteer.launch({ headless: false });
    const context = browser.defaultBrowserContext();
    //Opening the Facebook Group
    await context.overridePermissions(process.env.FB_PAGE, ["notifications"]);
    const page = await browser.newPage();
    await page.goto(process.env.FB_PAGE);
    await delay(WAIT_FOR_PAGE);
    //Closing popup Dialog
    if ((await page.$('div[role="dialog"]')) !== null) {
      await page.waitForSelector('div[role="dialog"]');
      await page.click('div[role="button"]');
    }
    //Login by entering email and password
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', process.env.FB_USER, {
      delay: DELAY_USER_INPUT
    });
    await page.type('input[name="pass"]', process.env.FB_PW, {
      delay: DELAY_PW_INPUT
    });
    await page.click('div[aria-label="Accessible login button"]');
    //Wait for redirect to the group after login
    await page.waitForNavigation(".userContentWrapper");
    await delay(WAIT_FOR_PAGE);

    //The Process of Retrieving Data
    const data = await page.evaluate(async function() {
      var postList = []; //Empty List of Posts
      var commentList = [];
      var commentCounter = 0;
      var postCounter = 0;

      //Scraping Data Function
      async function scrapData() {
        try {
          // Detecting the number of the posts loaded on the browser
          const postListLength = document.querySelectorAll(
            ".userContentWrapper"
          ).length;
          console.log("postListLength ", postListLength);

          //Post Class
          class Post {
            //Post Constructor
            constructor(document) {
              console.log("post initiallized");
              this.document = document;
              this.post = document.querySelector(".userContentWrapper");
            }

            //Click See More to get the full post text
            PressSeeMore() {
              try {
                return new Promise((resolve, reject) => {
                  if (
                    this.post &&
                    this.post.innerText.includes("See More") &&
                    this.post.querySelector(
                      "span[class=see_more_link_inner]"
                    ) !== null
                  ) {
                    this.post
                      .querySelector("span[class=see_more_link_inner]")
                      .click();
                  }
                  setTimeout(() => {
                    return resolve();
                  }, 1000);
                });
              } catch (error) {
                console.log("post PressSeeMore error ===> ", error);
              }
            }

            //get Post's Author
            getAuthor() {
              try {
                return new Promise(resolve => {
                  setTimeout(() => {
                    return resolve(
                      this.post.querySelector("h5").innerText.trim()
                    );
                  }, 1000);
                });
              } catch (error) {
                console.log("scrap author error ===> ", error);
              }
            }

            //Retrieve the text from the post
            scrap() {
              try {
                return new Promise(resolve => {
                  setTimeout(() => {
                    if( this.post
                      .querySelector('div[data-testid="post_message"') === null){
                        return resolve("");
                      }
                    else{
                      return resolve(
                        this.post
                          .querySelector('div[data-testid="post_message"')
                          .innerText.trim()
                      );
                    }
                  }, 1000);
                });
              } catch (error) {
                console.log("scrap post error ===> ", error);
              }
            }

            //to delete the post
            delete() {
              this.post.remove();
            }
          }

          class Comment {
            //Comment Constructor
            constructor(post) {
              this.comment = post.post.querySelector(
                "div > form > div > div > div > div > a"
              );
              this.post = post.post;
              var i;
              //Loading all previous comments amd see more comments
              for (i = 0; i < 100; i++) {
                if (this.comment !== null) this.comment.click();
                else {
                  i = 0;
                  break;
                }
              }
            }

            //function for detecting elements by innertext
            contains(selector, text) {
              var elements = document.querySelectorAll(selector);
              return Array.prototype.filter.call(elements, function(element) {
                return RegExp(text).test(element.textContent);
              });
            }

            //translating from arabic to english
            translate() {
              try {
                var translateButtons = this.contains("a", "See Translation");
                return new Promise(resolve => {
                  setTimeout(() => {
                    return resolve(translateButtons.map(item => item.click()));
                  }, 1000);
                });
              } catch (error) {
                console.log("scrap comments translation error ===> ", error);
              }
            }

            //Returning List of Comments of the post
            scrap(language) {
              try {
                return new Promise(resolve => {
                  setTimeout(() => {
                    return resolve(
                      [...this.post.querySelectorAll(`span[dir=${language}]`)]
                        ? [
                            ...this.post.querySelectorAll(
                              `span[dir=${language}]`
                            )
                          ].map(item => {
                            commentCounter++;
                            return {
                              comment_id: commentCounter,
                              comment: item.innerText,
                              post_id: postCounter
                            };
                          })
                        : []
                    );
                  }, 1000);
                });
              } catch (error) {
                console.log("scrap comments error ===> ", error);
              }
            }

            delete() {
              this.comment.remove();
            }
          }

          //Initiallizing Post
          const post = new Post(document);
          if (post.post) {
            postCounter++;
            //Click Seemore to get full text of post
            await post.PressSeeMore();
            //Initiallizing Comment
            comment = new Comment(post);
            //Pushing the post, author and the comments list
            var comments = "";
            const ARABIC = true;
            if (ARABIC) comments = await comment.scrap("rtl");
            else {
              comment.translate();
              comments = await comment.scrap("ltr");
            }

            postList.push({
              post_id: postCounter,
              post: await post.scrap(),
              author: await post.getAuthor()
            });

            if (comments.length > 0) commentList.push(comments);

            console.log("Data now ====> ", {
              posts: postList,
              comments: commentList
            });
            post.delete();
            setTimeout(() => window.scrollBy(0, 100), 1000);
            //Detertmine the number of posts you need (10)
            if (postList.length < 200) await scrapData();
            //if(postListLength*1) -> this will continue till end
            else {
              return {
                posts: postList,
                comments: commentList
              };
            }
          } else {
            console.log("postList if no post found ==> ", postList);
            return {
              posts: postList,
              comments: commentList
            };
          }
        } catch (error) {
          console.error("error from scrapDataFunction ==>", error);
          debugger;
        }
      }
      await scrapData();
      return {
        posts: postList,
        comments: commentList
      };
      //return "hello";
    });

    //Choosing which file to store data in
    const ARABIC = true;
    if (ARABIC) {
      await storeDataInJSON("./postsArabic.json", data["posts"]);
      await storeDataInJSON("./commentsArabic.json", data["comments"]);
    } else {
      await storeDataInJSON("./postsEnglish.json", data["posts"]);
      await storeDataInJSON("./commentsEnglish.json", data["comments"]);
    }
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

const storeDataInCSV = (myData, postsWorkbook, commentsWorkbook) => {
  const fields = ["field1", "field2", "field3"];
  const opts = { fields };
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(myData);
    console.log(csv);
    return fs.writeFileSync(file, JSON.stringify(data), err => {
      if (err) {
        return err;
      }
      return;
    });
  } catch (err) {
    console.error(err);
  }
};

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}
