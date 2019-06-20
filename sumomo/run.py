from flask import Flask, render_template, send_file, request, Response, jsonify
from pathlib import Path
import requests
# import os
from eth_account import Account
# import web3
from web3 import Web3
import subprocess


def rootPath():
    return Path(__file__).parent.absolute() / 'data'


def ext():
    return 'py'


def uid():
    return 'kkuramitsu'


app = Flask(__name__, template_folder='front/static', static_folder='data')
app.config.from_pyfile(Path(__file__).parent / 'eth_params.cfg')


@app.route('/')
def index():
    return render_template(f'/index.html')


@app.route('/problem_list', methods=['GET'])
def problem_list():
    ps = ['/'.join(str(p).split('/')[8:-1]) for p in rootPath().glob('**/problem.md')]
    # ps is ['Default/ITPP/001', 'Default/ITPP/002', ...]
    return jsonify({'data': ps})


@app.route('/introduction', methods=['GET'])
def intro():
    return send_file('./intro.md')


@app.route('/test')
def test():
    acct = Account.create()
    addr = acct.address
    key = (acct.privateKey).hex()
    print(f'address is {addr}\nkey is {key}')
    return render_template('/test.html')


@app.route('/test/get')
def test_get():
    w3 = Web3(Web3.HTTPProvider(app.config['INFURA_ENDPOINT']))
    GetSet = w3.eth.contract(abi=app.config['CONTRACT_ABI'])
    getset = GetSet(address=app.config['CONTRACT_ADDRESS'])
    res = getset.functions.getNum().call()
    return f'{res}'


@app.route('/test/set')
def test_set():
    w3 = Web3(Web3.HTTPProvider(app.config['INFURA_ENDPOINT']))
    GetSet = w3.eth.contract(abi=app.config['CONTRACT_ABI'])
    getset = GetSet(address=app.config['CONTRACT_ADDRESS'])
    me = app.config['TEST_ADDRESS']
    key = app.config['TEST_KEY']
    setNum_tx = getset.functions.setNum(334).buildTransaction({
        'gas': 2000000,
        'gasPrice': w3.toHex(w3.toWei('6','gwei')),
        'nonce': w3.eth.getTransactionCount(me),
    })
    signed_tx = (w3.eth.account.signTransaction(setNum_tx, private_key=key))
    hash = w3.eth.sendRawTransaction(signed_tx.rawTransaction)
    try:
        receipt = w3.eth.waitForTransactionReceipt(hash, timeout=120)
        return 'True'
    except:
        return 'False'
    return 'False'


@app.route('/problem_add', methods=['POST'])
def problem_add():
    d = request.json
    if(save(d['powner'], d['pcourse'], d['pid'])):
        return jsonify({'msg': '問題の追加に成功', 'success': True})
    else:
        return jsonify({'msg': '問題の追加に失敗', 'success': False})


def save(owner, course, id):
    try:
        dir = rootPath() / 'p' / owner / course / id
        base_url = f'https://raw.githubusercontent.com/{owner}/{course}/master/{id}'
        p_md = requests.get(f'{base_url}/problem.md').text
        if p_md.startswith('404: Not Found'):
            raise Exception
        c_py = requests.get(f'{base_url}/hint.py').text
        if '404: Not Found' in c_py:
            c_py = ''
        p_path = dir / 'problem.md'
        c_path = dir / 'hint.py'
        dir.mkdir(parents=True)
        with open(p_path, mode='x') as f:
            f.write(p_md)
        with open(c_path, mode='x') as f:
            f.write(c_py)
    except:
        return False
    return True


@app.route('/img/<path:d>')
def post_img_to_marked(d):
    path = rootPath() / 'p' / d
    return send_file(f'{path}')


@app.route('/<path:d>')
def dist(d):
    path = rootPath() / 'p' / d
    return send_file(f'front/static/{d}')


# def send_static_file(path1, path2):
#     return send_file(f'front/static/{path1}/{path2}')


@app.route('/init/<path:d>', methods=['GET'])
def dist_problem_init(d):
    p_path = rootPath() / 'p' / d / ('problem.md')
    c_path = rootPath() / 'p' / d / ('hint.py')
    (pmd, cpy) = ('', '')
    try:
        with open(p_path, mode='r') as f:
            pmd = f.read()
        with open(c_path, mode='r') as f:
            cpy = f.read()
    except Exception as e:
        print(e)
    return jsonify({'problem': pmd, 'code': cpy})
    # return send_file(str(path))


# fetch(problem)+fetch(code)だと挙動が怪しい
# @app.route('/code/<path:d>', methods=['GET'])
# def dist_code(course, id):
#     # file = rootPath() / 'u' / uid() / (d.replace('/', '-') + '.py')
#     # if file.exists():
#     #     return send_file(str(file))
#     path = rootPath() / 'p' / d / ('hint.py')
#     return send_file(str(path))


# @app.route('/submit/<path:d>', methods=['POST'])
# def submit(d):
#     inputText = request.form['source']
#     file = rootPath() / 'u' / uid() / (d.replace('/', '-') + '.py')
#     f = file.open('w')
#     f.write(inputText)
#     f.close()
#     return Response(inputText)


@app.route('/post', methods=['POST'])
def post():
    CODE = request.form['code'].strip()
    (exe_result, exe_err) = code_exe(CODE)
    tx = {
        'publisher': request.form['publisher'],
        'judge': "JUDGE",
        'result': exe_result+'\n'+exe_err,
    }
    return jsonify(tx)


def code_exe(src_code):
    with open("./temp.py", "w", encoding="utf8") as f:
        f.write(src_code)
    proc = subprocess.Popen(["python3", "./temp.py"], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    res = proc.communicate()
    # os.remove("./temp.py") # This needs "import os"
    return (res[0].decode("utf8").strip(), res[1].decode("utf8"))


def main():
    app.run(host='0.0.0.0', port=8080, debug=True)


if __name__ == '__main__':
    main()




