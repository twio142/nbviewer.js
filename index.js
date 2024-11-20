#!/usr/bin/env node
'use strict';

/* Generate HTML from Jupyter Notebook */
// https://github.com/tuxu/ipynb-quicklook/

const fs = require("fs");
const {resolve} = require("path");

function previewLocal(nbFile, htmlFile) {
  const marked = require("marked");
  const katex = require("katex");
  const prism = require("prismjs");
  const { JSDOM } = require("jsdom");
  // const { exception } = require("console");
  const document = (new JSDOM("")).window.document;
  const nbv = require("./nbv").nbv_constructor(document, {marked, prism, katex});
  const target = document.createElement("div");
  const nb = JSON.parse(fs.readFileSync(nbFile));
  nbv.render(nb, target);
  fs.writeFileSync(htmlFile, target.innerHTML);
  return htmlFile;
}

function previewOnline(nbFile, htmlFile) {
  const nb = JSON.parse(fs.readFileSync(nbFile));
  const nbv = fs.readFileSync(resolve(__dirname, "nbv.js")).toString();
  const tmpl = fs.readFileSync(resolve(__dirname, "template.html")).toString();
  const uglify = require("uglify-js");
  let html = tmpl
    .replace("%nbv%", uglify.minify(nbv).code)
    .replace("%nb-json%", JSON.stringify(nb));
  fs.writeFileSync(htmlFile, html);
  return htmlFile;
}

((nbFile, htmlFile) => {
  htmlFile = htmlFile || nbFile.replace(/\.ipynb$/, ".html");
  (process.env.USE_LOCAL ? previewLocal : previewOnline)(nbFile, htmlFile);
})(process.argv[2], process.argv[3]);
