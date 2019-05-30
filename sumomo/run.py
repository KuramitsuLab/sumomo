from flask import Flask, render_template, send_file, request, Response, jsonify
from pathlib import Path

import subprocess
from subprocess import Popen

def rootPath():
    return Path(__file__).parent.absolute() / 'data'


def ext():
    return 'py'


def uid():
    return 'kkuramitsu'


app = Flask(__name__, template_folder='front/static')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/<path:d>')
def dist(d):
    path = rootPath() / 'p' / d / ('problem.md')
    if path.exists():
        return render_template('index.html', message=d)
    return send_file(f'front/static/{d}')


'''
def send_static_file(path1, path2):
    return send_file(f'front/static/{path1}/{path2}')
'''


@app.route('/problem/<path:d>')
def dist_problem(d):
    path = rootPath() / 'p' / d / ('problem.md')
    return send_file(str(path))


@app.route('/code/<path:d>')
def dist_code(d):
    file = rootPath() / 'u' / uid() / (d.replace('/', '-') + '.py')
    if file.exists():
        return send_file(str(file))
    path = rootPath() / 'p' / d / ('hint.' + ext())
    return send_file(str(path))


@app.route('/submit/<path:d>', methods=['POST'])
def submit(d):
    inputText = request.form['source']
    file = rootPath() / 'u' / uid() / (d.replace('/', '-') + '.py')
    f = file.open('w')
    f.write(inputText)
    f.close()
    return Response(inputText)


@app.route('/post', methods=['POST'])
def post():
    CODE = request.form['code']
    (exe_result, exe_err) = code_exe(CODE)
    tx = {
        'publisher': request.form['publisher'],
        'judge': "JUDGE",
        'result': exe_result+'\n'+exe_err,
    }
    # txをブロックチェーンサイドに渡す
    return jsonify(tx)


def code_exe(src_code):
    with open("./temp.py", "w", encoding="utf8") as f:
        f.write(src_code)
    proc = subprocess.Popen(["python3", "./temp.py"], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    res = proc.communicate()
    return (res[0].decode("utf8"), res[1].decode("utf8"))


def main():
    app.run(host='0.0.0.0', port=8080, debug=True)


if __name__ == '__main__':
    main()
