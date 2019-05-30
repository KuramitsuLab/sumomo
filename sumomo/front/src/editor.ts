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

const terminal = ace.edit('terminal');
terminal.setOptions({
  fontSize: 18,
  wrap: true,
  mode: 'ace/mode/python',
  readOnly: true,
  // highlightActiveLine: false,
  showLineNumbers: false,
  showGutter: false,
  // highlightSelectedWord: false,
});
terminal.setValue('');

window.addEventListener('load', (e) => {
  $.ajax({
    // url: `/problem${path}`,
    url: 'https://raw.githubusercontent.com/Caterpie-poke/TestProblem/master/problem.md',
    type: 'GET',
  }).done((data) => {
    document.getElementById('canvas').innerHTML = marked(data);
  }).fail((data) => {
    console.log(data);
  }).always((data) => {
  });
  $.ajax({
    // url: `/code${path}`,
    url: 'https://raw.githubusercontent.com/Caterpie-poke/TestProblem/master/initial_code.py',
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

document.getElementById('play').addEventListener('click', () => {
  const code_data = {
    publisher: 'Me',
    code: editor.getValue(),
  };
  post_code(code_data);
});

function post_code(code_data) {
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
  }).always((data) => {
  });
}
