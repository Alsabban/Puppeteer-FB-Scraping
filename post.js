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
              // const infos = Array.from(document.querySelectorAll(".userContentWrapper"));
              // return infos.map(info => { 
    // const array =  info.innerText.split('\n');
    // return array.slice(3,4); 
    //});

              //return resolve(this.post.querySelector('div[data-testid="post_message"').innerText.trim());

              return resolve(infos.map(info => { 
                const array =  info.innerText.split('\n');
                return array.slice(3,4); 
                }));
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

  module.exports = Post;
