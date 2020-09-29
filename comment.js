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

  module.exports = Comment;