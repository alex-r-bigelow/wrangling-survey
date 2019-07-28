const fs = require('fs');
const d3 = require('d3');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

(async () => {
  const dom = await JSDOM.fromURL('https://docs.google.com/forms/d/e/1FAIpQLSe00qJEakeDlbgr0SfcY4iKErjXRDvqQyeFuHlX7bhSBmPLqw/viewform');
  const document = dom.window.document;
  const form = d3.select(document).select('form');
  const googleForm = {
    action: form.attr('action'),
    inputs: {}
  };
  // Look up and store the mapping between form labels and input names
  form.selectAll('input[type="text"]').each(function () {
    const element = d3.select(this);
    googleForm.inputs[element.attr('aria-label')] = element.attr('name');
  });
  fs.writeFile('googleForm.json', JSON.stringify(googleForm, null, 2), err => {
    if (err) {
      return console.log(err);
    } else {
      console.log('googleForm.json updated successfully');
    }
  });
})();
