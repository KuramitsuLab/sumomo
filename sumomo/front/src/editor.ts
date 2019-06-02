import * as $ from 'jquery';
import * as ace from '../node_modules/ace-builds/src-min-noconflict/ace.js';
import * as solarized_light from '../node_modules/ace-builds/src-min-noconflict/theme-solarized_light.js';
import * as python_mode from '../node_modules/ace-builds/src-min-noconflict/mode-python.js';
import * as marked from 'marked';
import * as auth from './auth';
import web3 from 'web3';

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

window.addEventListener('load', (e) => {
  const pURL = document.getElementById('p_path').innerHTML;
  const iURL = document.getElementById('i_path').innerHTML;
  $.ajax({
    url: pURL,
    type: 'GET',
  }).done((data) => {
    document.getElementById('canvas').innerHTML = marked(data);
  }).fail((data) => {
    console.log(data);
  }).always((data) => {
  });
  $.ajax({
    url: iURL,
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

document.getElementById('reload').addEventListener('click', () => {
  location.reload(true);
});

// web3.js test code
document.getElementById('check').addEventListener('click', () => {
  w3.eth.accounts.signTransaction({
    to: address_getset,
    value: '0',
    gas: '2000000',
    data: contract_getset.methods.setNum(12).encodeABI(),
  },                              me_key).then((signed_tx) => {
    const post_data = {
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [signed_tx['rawTransaction']],
      id: 3,
    };
    $.ajax({
      url: 'https://ropsten.infura.io/v3/d1c2ca461bac473fab373d30b3ab432e',
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

document.getElementById('zoom-in').addEventListener('click', () => {
  editor.setFontSize(editor.getFontSize() + 2);
  terminal.setFontSize(editor.getFontSize() + 2);
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
