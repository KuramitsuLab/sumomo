import * as $ from 'jquery';
import * as marked from 'marked';
import * as auth from './auth';
import { listenerCount } from 'cluster';

const path = location.pathname;

window.addEventListener('load', (e) => {
  if (localStorage.getItem('problem_list') == null ||
  localStorage.getItem('problem_list') === '0') {
    localStorage.setItem('problem_list', '0');
  } else {
    let listHTML = '<ul>';
    const plist = localStorage.getItem('problem_list').split(',');
    for (let i = plist.length - 1; i > 0; i -= 1) {
      const element = plist[i];
      const baseURL = localStorage.getItem(`prg${element}`);
      listHTML += `<li><a href="${baseURL}">${baseURL}</a></li>`;
    }
    listHTML += '</ul>';
    document.getElementById('p_select').innerHTML = listHTML;
  }
});

document.getElementById('btn').addEventListener('click', () => {
  const uname = $('#userName').val();
  const rname = $('#repositoryName').val();
  const bname = $('#branchName').val();
  const pname = $('#problemName').val();
  const baseURL = `/problem/${uname}/${rname}/${bname}/${pname}/`;
  const plist = localStorage.getItem('problem_list').split(',');
  const newIndex = Number(plist[plist.length - 1]) + 1;
  plist.push(`${newIndex}`);
  localStorage.setItem(`prg${newIndex}`, baseURL);
  localStorage.setItem('problem_list', plist.join(','));
});

document.getElementById('clear').addEventListener('click', () => {
  localStorage.clear();
  location.reload(true);
});
