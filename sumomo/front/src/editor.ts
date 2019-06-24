import * as $ from 'jquery';
import * as ace from '../node_modules/ace-builds/src-min-noconflict/ace.js';
// import * as solarized_light from '../node_modules/ace-builds/src-min-noconflict/theme-solarized_light.js';
import * as python_mode from '../node_modules/ace-builds/src-min-noconflict/mode-python.js';
import * as marked from 'marked';
import * as auth from './auth';
import splitJs from 'split.js';
import 'bootstrap';

/* editor */

const path = location.pathname;

splitJs(['.two-horizontal-split .left', '.two-horizontal-split .right'], {
  sizes: [50, 50],
  minSize: [200, 200],
});

// splitJs(['.two-vertical-split .top', '.two-vertical-split .bottom'], {
//   direction: 'vertical',
//   sizes: [85, 15],
//   // minSize: [50, 50],
// });

const editor = ace.edit('editor');
// editor.setTheme(solarized_light);
editor.getSession().setMode(new python_mode.Mode());
editor.getSession().setUseWrapMode(false); /* 折り返しなし, splitで横幅自由のため */
editor.setFontSize(18);

window.addEventListener('load', (e) => {
  $.ajax({
    url: `/problem${path}`,
    type: 'GET',
  }).done((data) => {
    const doc = document.getElementById('canvas');
    doc.innerHTML = marked(data);
    // MathJax.Hub.Queue(["Typeset", MathJax.Hub, doc]);
  }).fail((data) => {
    console.log(data);
  }).always((data) => {
  });
  $.ajax({
    url: `/code${path}`,
    type: 'GET',
  }).done((data) => {
    editor.setValue(data);
  }).fail((data) => {
    console.log(data);
  }).always((data) => {
  });
});

const git_handler = new auth.GithubHandler();
document.getElementById('github').addEventListener('click', () => {
  git_handler.singin();
});
let x = 100;

document.getElementById('zoom-in').addEventListener('click', () => {
  {
    x <= 100; x *= 1.2; document.getElementById('editor').style.fontSize = x + '%';
  }
});

document.getElementById('zoom-out').addEventListener('click', () => {
  { x >= 2000; x /= 1.2; document.getElementById('editor').style.fontSize = x + '%'; }
});

$('.tab_label').on('click', function () {
  const $th = $(this).index();
  $('.tab_label').removeClass('active');
  $('.tab_panel').removeClass('active');
  $(this).addClass('active');
  $('.tab_panel').eq($th).addClass('active');
});

document.getElementById('play').addEventListener('click', () => {
  const doc = document.getElementById('canvas');
  // const problem doc.innerHTML += marked(data.responseText);

  $.ajax({
    url: '/submit',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({
      problem: path,
      source: editor.getValue(),
    }),
  }).done((data) => {
    doc.innerHTML = marked(data);
    console.log(data.responseText);
    // MathJax.Hub.Queue(["Typeset", MathJax.Hub, doc]);
  }).fail((data) => {
    console.log(data);
  }).always((data) => {
    doc.innerHTML += marked(data.responseText);
    console.log(doc.scrollTop);
    console.log(doc.scrollHeight);
    doc.scrollTop = doc.scrollHeight;
  });
});

// const a = document.createElement('a');
// a.href = 'data:text/plain,' + encodeURIComponent('test text\n');
// a.download = 'test.txt';

// a.style.display = 'none';
// document.body.appendChild(a); // ※ DOM が構築されてからでないとエラーになる
// a.click();
// document.body.removeChild(a);
