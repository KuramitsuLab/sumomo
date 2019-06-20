import * as $ from 'jquery';
import * as ace from '../node_modules/ace-builds/src-min-noconflict/ace.js';
import * as solarized_light from '../node_modules/ace-builds/src-min-noconflict/theme-solarized_light.js';
import * as python_mode from '../node_modules/ace-builds/src-min-noconflict/mode-python.js';
import * as marked from 'marked';
import * as auth from './auth';
import web3 from 'web3';
import 'bootstrap';
import { strict } from 'assert';
import splitJs from 'split.js';

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
new python_mode.Mode();
editor.setOptions({
  fontSize: 18,
  wrap: true,
  mode: 'ace/mode/python',
});

const terminal = ace.edit('terminal');
terminal.setOptions({
  fontSize: 18,
  wrap: true,
  readOnly: true,
  showLineNumbers: false,
  showGutter: false,
});
terminal.setValue('');

const tabs = document.getElementsByClassName('tab_item');
const panels = document.getElementsByClassName('panel_item');
for (let i = 0; i < tabs.length; i += 1) {
  tabs[i].addEventListener('click', () => {
    document.getElementsByClassName('tab_item active')[0].classList.remove('active');
    document.getElementsByClassName('panel_item active')[0].classList.remove('active');
    tabs[i].classList.add('active');
    panels[i].classList.add('active');
  });
}

const me = '0xfB0FD0CC0Db58095a331c23C14305689d6A22119';
const me_key = '0x8076A20DF3A0C75DA5E66559A8EBFD95986A28CB57F2CFA1106C9BC8F7E903C2';
const w3 = new web3(new web3.providers.HttpProvider('https://ropsten.infura.io/v3/d1c2ca461bac473fab373d30b3ab432e'));
const address_getset = '0x9ea80b0A4e112944d0E46e945A4361cB23B3B906';
const abi_getset = '[{"inputs":[{"name":"_n","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[],"name":"getNum","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_n","type":"uint256"}],"name":"setNum","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
const contract_getset = new w3.eth.Contract(JSON.parse(abi_getset), address_getset);

// ページ読み込み時に起動する処理
// TODO: MVCの分離
window.addEventListener('load', () => {
  fetch('/problem_list', {
    method: 'GET',
  }).then((res) => {
    return res.json();
  }).then((json) => {
    // ['Default/ITPP/001', 'Default/ITPP/002', ...]みたいな配列が返される
    const problems = json['data'];
    for (let i = 0; i < problems.length; i += 1) {
      const li = `<li><button id="p-link${i}" type="button">${problems[i]}</button></li>`;
      document.getElementById('p-list').insertAdjacentHTML('afterbegin', li);
      document.getElementById(`p-link${i}`).addEventListener('click', () => {
        fetch(`/init/${problems[i]}`, {
          method: 'GET',
        }).then((res) => {
          return res.json();
        }).then((data) => {
          document.getElementById('canvas').innerHTML = marked(data['problem']);
          editor.setValue(data['code']);
        }).catch((err) => {
          console.log(err);
        });
        // 問題とコードを別々にfetchしようとしたらなぜかできなかった
        // fetch(`/code/${problems[i]}`, {
        //   method: 'GET',
        // }).then((res) => {
        //   return res.text();
        // }).then((data) => {
        //   editor.setValue(data);
        // }).catch((err) => {
        //   console.log(err);
        // });
      });
    }
  }).catch((err) => {
    console.log(err);
  });
});

// 問題追加ボタンのクリックイベント
document.getElementById('p-add-button').addEventListener('click', () => {
  const ghpath = {
    powner: document.getElementById('p-owner-text')['value'],
    pcourse: document.getElementById('p-course-text')['value'],
    pid: document.getElementById('p-id-text')['value'],
  };
  console.log('ghpath is', ghpath);
  fetch('/problem_add', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ghpath),
  }).then((res) => {
    return res.json();
  }).then((data) => {
    console.log('msg is', data['msg']);
    if (!data['success']) {
      alert(data['msg']);
    } else {
      location.reload(false);
    }
  }).catch((err) => {
    console.log(err);
  });
});

document.getElementById('menu').addEventListener('click', () => {
});

const git_handler = new auth.GithubHandler();
document.getElementById('github').addEventListener('click', () => {
  git_handler.singin();
});

document.getElementById('reload').addEventListener('click', () => {
  location.reload(true);
});

document.getElementById('check').addEventListener('click', () => {
});

document.getElementById('upload').addEventListener('click', () => {
});

document.getElementById('play').addEventListener('click', () => {
  const code_data = {
    publisher: 'Me',
    code: editor.getValue(),
  };
  $.ajax({
    url: '/post',
    type: 'POST',
    dataType: 'json',
    data: code_data,
    timeout: 10000,
  }).done((data) => {
    // console.log(data);
    terminal.setValue(data['result']);
  }).fail((data) => {
    console.log('POST Faile');
    // Error handling is necessary
  }).always((data) => {
  });
});


let x = 100;
document.getElementById('zoom-in').addEventListener('click', () => {
  x *= 1.2;
  document.getElementById('editor').style.fontSize = x + '%';
});

document.getElementById('zoom-out').addEventListener('click', () => {
  x /= 1.2;
  document.getElementById('editor').style.fontSize = x + '%';
});


// const a = document.createElement('a');
// a.href = 'data:text/plain,' + encodeURIComponent('test text\n');
// a.download = 'test.txt';

// a.style.display = 'none';
// document.body.appendChild(a); // ※ DOM が構築されてからでないとエラーになる
// a.click();
// document.body.removeChild(a);
