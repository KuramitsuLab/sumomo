
#
#
#

# comment out
# from pegpy.origami.arare import compile

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


@app.route('/submit', methods=['POST'])
def submit():
    posted_json = request.json
    # file = rootPath() / 'u' / uid() / (d.replace('/', '-') + '.py')
    file = './temp.py'
    with open(file, mode='w') as f:
        f.write(posted_json['source'])
    res = execute(file)
    json = {
        'stdout': res[0].decode("utf8"),
        'stderr': res[1].decode("utf8"),
    }
    return jsonify(json)


def execute(fp):
    proc = subprocess.Popen(["python3", f'{fp}'], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    res = proc.communicate()
    return res


def main():
    app.run(host='0.0.0.0', port=8080, debug=True)


if __name__ == '__main__':
    main()
