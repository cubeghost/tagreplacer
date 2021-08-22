# tag replacer

![fj1czb5](https://user-images.githubusercontent.com/1895116/46588062-f7a29300-ca63-11e8-9dd8-5c4fccf12651.png)

##### development
```
npm install
cp sample.env .env
npm start
```

### 2.1 changes
- gulp → webpack
- added redux
- rewrote internal API
- rewrote find/replace logic (now supports append and delete)
- react-selectize → react-select

### todo
- [x] add advanced options (incl. "replace queued posts" option)
  - [ ] make these options persist in localstorage
  - [x] make them less ugly
- [x] add case insensitive option (or vice versa)
- [x] add "append" option ([details](https://tagreplacer.tumblr.com/post/170355934973/hi-i-was-wondering-if-you-have-any-suggestions))
- [x] support deleting tags by replacing them with an empty tag
- [x] add help page or at least link to a markdown file or s/t
  - [ ] add more to help page
- [x] add react-router to facilitate the above
- [x] explore using react-select instead of customized react-selectize
- [ ] allow for collapsing of found posts/drafts/queue lists
- [x] add copyright/contact info
- [x] add sentry
- [ ] improve error and "no results" handling in the ui
- [ ] add confirmation on replace/delete 
- [x] fix checkbox styles
