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

splitJs(['.two-vertical-split .top', '.two-vertical-split .bottom'], {
  direction: 'vertical',
  sizes: [50, 50],
  // minSize: [50, 50],
});

const editor = ace.edit('editor');
// editor.setTheme(solarized_light);
editor.getSession().setMode(new python_mode.Mode());
editor.getSession().setUseWrapMode(false); /* 折り返しなし, splitで横幅自由のため */
editor.setFontSize(18);

window.addEventListener('load', () => {
  fetch('/problem_list_default', {
    method: 'GET',
  }).then((res) => {
    return res.json();
  }).then((json) => {
    const lis = json['data'];
    for (let i = 0; i < lis.length; i += 1) {
      document.getElementById('p-init').insertAdjacentHTML('beforeend', lis[i]);
    }
  });
  fetch('/problem_list_downloads', {
    method: 'GET',
  }).then((res) => {
    return res.json();
  }).then((json) => {
    const lis = json['data'];
    for (let i = 0; i < lis.length; i += 1) {
      document.getElementById('p-downloads').insertAdjacentHTML('beforeend', lis[i]);
    }
  });
});

window.addEventListener('hashchange', (e) => {
  $.ajax({
    url: `/problem/${location.hash.slice(1)}`,
    type: 'GET',
  }).done((data) => {
    document.getElementById('canvas').innerHTML = marked(data);
  }).fail((data) => {
    console.log(data);
  }).always((data) => {
  });
  $.ajax({
    url: `/code/${location.hash.slice(1)}`,
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

document.getElementById('p-add-button').addEventListener('click', () => {
  const ghpath = {
    powner: document.getElementById('p-owner-text')['value'],
    pcourse: document.getElementById('p-course-text')['value'],
  };
  fetch('/problem_add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ghpath),
  }).then((res) => {
    return res.text();
  }).then((data) => {
    location.reload(false);
  }).catch((err) => {
    console.log(err);
  });
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

document.getElementById('play').addEventListener('click', () => {
  const code_data = {
    publisher: 'Me',
    source: editor.getValue(),
  };
  fetch('/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(code_data),
  }).then((res) => {
    return res.json();
  }).then((data) => {
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
});

// const a = document.createElement('a');
// a.href = 'data:text/plain,' + encodeURIComponent('test text\n');
// a.download = 'test.txt';

// a.style.display = 'none';
// document.body.appendChild(a); // ※ DOM が構築されてからでないとエラーになる
// a.click();
// document.body.removeChild(a);
