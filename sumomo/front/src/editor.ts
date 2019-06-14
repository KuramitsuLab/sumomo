import * as $ from 'jquery';
import * as ace from '../node_modules/ace-builds/src-min-noconflict/ace.js';
import * as solarized_light from '../node_modules/ace-builds/src-min-noconflict/theme-solarized_light.js';
import * as python_mode from '../node_modules/ace-builds/src-min-noconflict/mode-python.js';
import * as marked from 'marked';
import * as auth from './auth';
/* editor */

const path = location.pathname;
const editor = ace.edit('editor');
// editor.setTheme(solarized_light);
editor.getSession().setMode(new python_mode.Mode());
editor.getSession().setUseWrapMode(true); /* 折り返しあり */
editor.setFontSize(18);

window.addEventListener('load', (e) => {
  $.ajax({
    url: `/problem${path}`,
    type: 'GET',
  }).done((data) => {
    document.getElementById('canvas').innerHTML = marked(data);
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
  { x <= 100; x *= 1.2;  document.getElementById('editor').style.fontSize = x + '%';
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

const a = document.createElement('a');
a.href = 'data:text/plain,' + encodeURIComponent('test text\n');
a.download = 'test.txt';

a.style.display = 'none';
document.body.appendChild(a); // ※ DOM が構築されてからでないとエラーになる
a.click();
document.body.removeChild(a);

import splitJs from 'split.js';

Split(['.two-vertical-split .top', '.two-vertical-split .bottom'], {
  direction: 'vertical',
  minSize: [50, 50],
});
