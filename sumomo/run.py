
#
#
#

# comment out
# from pegpy.origami.arare import compile

from flask import Flask, render_template, send_file, request, Response, jsonify
from pathlib import Path
import json
from subprocess import STDOUT, check_output


def rootPath(subdir='data'):
    return Path(__file__).parent.absolute() / subdir


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


# subprocess
# copied from judge.py


def getInputFile(problem='ITPP/01A', testCase=1):
    path = rootPath(f'data/p/{problem}/{testCase}in.txt')
    return str(path) if path.exists() else None


def getOutputFile(problem='ITPP/01A', testCase=1):
    path = rootPath(f'data/p/{problem}/{testCase}out.txt')
    return str(path) if path.exists() else None


testFile = '''
n = int(input())
print(n**3)
'''

# プログラムを実行して 実行結果をえる


def run_sumomo(submitted, problem='ITPP/01A', testCase=1):
    # submitted されたソースコードを保存する
    with open("./temp.py", "w", encoding="utf8") as f:
        f.write(submitted)
    #output = check_output(["python3", "./temp.py"], stderr=STDOUT, timeout=10)
    infile = getInputFile(problem, testCase)
    output = check_output(f'python3 ./temp.py < {infile}',
                          shell=True, stderr=STDOUT, timeout=10)
    return output.decode("utf8")

# 実行結果とサンプルデータを比較する


def judge(output, problem='ITPP/01A', testCase=1):
    with open(getOutputFile(problem, testCase), "r", encoding="utf8") as f:
        exampled = f.read().split('\n')
    tested = [line for line in output.split('\n') if not line.startswith('@')]
    res = 'AC'
    for t in zip(exampled, tested):
        if t[0] != t[1]:
            print('YOU', t[0])
            print('ME ', t[1])
            res = 'WA'
    return res


##

@app.route('/submit', methods=['POST'])
def submit():
    data = request.data
    posted_json = request.json
    source = posted_json['source']
    problem = posted_json['problem']
    output = run_sumomo(source, problem)
    with open("output.txt", "w", encoding="utf8") as f:
        f.write('#' + problem + '\n')
        f.write('```\n')
        f.write(output)
        f.write('\n```\n')
    return send_file("output.txt")


def main():
    app.run(host='0.0.0.0', port=8080, debug=True)


if __name__ == '__main__':
    main()
