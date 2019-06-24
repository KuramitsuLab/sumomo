import sys
import os
from subprocess import STDOUT, check_output
from pathlib import Path


def rootPath(dir='data'):
    return Path(__file__).parent.absolute() / dir


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


def run(submitted, problem='ITPP/01A', testCase=1):
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


def main(argv):
    global testFile
    problem = argv[0] if len(argv) > 0 else 'ITPP/01A'
    testCase = int(argv[1]) if len(argv) > 1 else 1
    if len(argv) > 2:
        with open(argv[2], "r", encoding="utf8") as f:
            testFile = f.read()
    output = run(testFile, problem, testCase)
    res = judge(output, problem, testCase)


if __name__ == '__main__':
    main(sys.argv[1:])
