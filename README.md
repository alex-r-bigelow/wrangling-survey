# wrangling-survey

### On reusing the form submission stuff in other projects
Steps:
1. Create a google form; label each question like a variable name (e.g. `formLabel`), and make ALL questions of the type "Short answer"
1. Put its public URL in `scrapeGoogleForm.js`
2. `npm run scrape` at least once, as well as after any time you change the form
3. To submit an entry into the form's spreadsheet from javascript:
```js
window.controller.submitForm({
  'formLabel': 'desiredValue',
  ...
});
```
