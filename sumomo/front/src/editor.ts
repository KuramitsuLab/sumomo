import * as $ from 'jquery';
import * as ace from '../node_modules/ace-builds/src-min-noconflict/ace.js';
import * as solarized_light from '../node_modules/ace-builds/src-min-noconflict/theme-solarized_light.js';
import * as python_mode from '../node_modules/ace-builds/src-min-noconflict/mode-python.js';
import * as marked from 'marked';
import * as auth from './auth';
import web3 from 'web3';
import 'bootstrap';
import { strict } from 'assert';

const path = location.pathname;
const editor = ace.edit('editor');
new python_mode.Mode();
editor.setOptions({
  fontSize: 18,
  wrap: true,
  mode: 'ace/mode/python',
  // theme: 'solarized_light',
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

const me = '0xfB0FD0CC0Db58095a331c23C14305689d6A22119';
const me_key = '0x8076A20DF3A0C75DA5E66559A8EBFD95986A28CB57F2CFA1106C9BC8F7E903C2';
const w3 = new web3(new web3.providers.HttpProvider('https://ropsten.infura.io/v3/d1c2ca461bac473fab373d30b3ab432e'));
const address_getset = '0x9ea80b0A4e112944d0E46e945A4361cB23B3B906';
const abi_getset = '[{"inputs":[{"name":"_n","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[],"name":"getNum","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_n","type":"uint256"}],"name":"setNum","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]';
const contract_getset = new w3.eth.Contract(JSON.parse(abi_getset), address_getset);

window.addEventListener('load', () => {
  fetch('/introduction', {
    method: 'GET',
  }).then((res) => {
    return res.text();
  }).then((data) => {
    document.getElementById('canvas').innerHTML = marked(data);
  }).catch((err) => {
    console.log(err);
  });
  fetch('/problem_list', {
    method: 'GET',
  }).then((res) => {
    return res.json();
  }).then((json) => {
    const problems = json['data'];
    // problems is ['Default/ITPP/001', 'Default/ITPP/002', ...]
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

document.getElementById('p-add-button').addEventListener('click', () => {
  const ghpath = {
    powner: $('#p-owner-text').val(),
    pcourse: $('#p-course-text').val(),
    pid: $('#p-id-text').val(),
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
  const a = 0;
});

const git_handler = new auth.GithubHandler();
document.getElementById('github').addEventListener('click', () => {
  git_handler.singin();
});

document.getElementById('reload').addEventListener('click', () => {
  location.reload(true);
});

// web3.js test code
document.getElementById('check').addEventListener('click', () => {
  w3.eth.accounts.signTransaction({
    to: address_getset,
    value: '0',
    gas: '2000000',
    data: contract_getset.methods.setNum(19).encodeABI(),
  },                              me_key).then((signed_tx) => {
    const post_data = {
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [signed_tx['rawTransaction']],
      id: 3,
    };
    $.ajax({
      // url: 'https://ropsten.infura.io/v3/d1c2ca461bac473fab373d30b3ab432e',
      url: '/test/set',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(post_data),
    }).done((receipt) => {
      console.log('receipt is', receipt);
    }).fail((data) => {
      console.log('POST Faile:', data);
      // Error handling is necessary
    }).always((data) => {
    });
  });
});

document.getElementById('upload').addEventListener('click', () => {
  contract_getset.methods.getNum().call().then((data) => {
    console.log(data.toNumber());
  });
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

// document.getElementById('zoom-in').addEventListener('click', () => {
//   editor.setFontSize(editor.getFontSize() + 2);
//   terminal.setFontSize(editor.getFontSize() + 2);
// });
document.getElementById('zoom-in').addEventListener('click', () => {
  console.log(w3.version);
  console.log(w3.eth.accounts.create('hogehoge'));
});

document.getElementById('zoom-out').addEventListener('click', () => {
  editor.setFontSize(editor.getFontSize() - 2);
  terminal.setFontSize(editor.getFontSize() - 2);
});

// document.getElementById('zoom-out').addEventListener('click', () => {
//   contract_getset.methods.getNum().call().then((data) => {
//     console.log(data.toNumber());
//   });
// });
