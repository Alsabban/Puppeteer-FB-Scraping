# Puppeteer Facebook Scraping
This is an open source project that you can use to scrap posts and comments from facebook groups in both english and arabic languages

### Installation
Clone the project <br />
npm install <br />
create .env file and enter your data <br />
```
FB_PAGE="The URL of the FB Group you want to scrap"
FB_USER="The Facebook account e-mail"
FB_PW="The Facebook account password"
```
To Choose the data language: <br />

1. Change the boolean variable(ARABIC) to (True or False) in index.js at lines (218,269)

2. Go to Facebook Settings
```
    a. Click on (Language and Region) Settings
    b. Go to (Posts from friends and Pages)
    c. Go to (Languages you don't want to be offered translations for)  Add/Remove Arabic
    d. Go to (Languages you don't want automatically translated)  Add/Remove Arabic
```

now you're all set. <br />

node FullScrapper.js <br />

## Outputs:
### commentsArabic.json 
For Arabic Language <br />
contains: comment_id, comment, post_id <br />


### postsArabic.json
For Arabic Language <br />
contains: post_id, post, author <br />

### commentsEnglish.json
For English Language <br />
contains: comment_id, comment, post_id <br />

### postsEnglish.json
For English Language <br />
contains: post_id, post, author <br />


You can then convert these json files to csv files by any online converter<br />

Enjoy Your Scraping Journey :)<br />

