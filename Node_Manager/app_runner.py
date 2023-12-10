import subprocess
import os
import sys
import threading

def run(path):
    # print(path)
    subprocess.check_call("npm install", cwd=path, shell=True)
    # print(path, "npm install")
    subprocess.check_call("node index.js", cwd=path, shell=True)
    # print(path, "npm start")

print(sys.argv[0], len(sys.argv))

for i in range(1,len(sys.argv)):
    temp = threading.Thread(target=run, args=(sys.argv[i],))
    temp.start()

