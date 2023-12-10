import subprocess
import os
import threading

def run(path):
    # os.system("cd " + path + "|"+ "npm install"+"|" + "ls" )
    # subprocess.call(["cd .. | ls"], shell=True)
    subprocess.check_call("npm install", cwd=path, shell=True)
    subprocess.check_call("npm start", cwd=path, shell=True)
    # os.system("npm install")
    # os.system("ls")
    # os.system("npm start")

t1 = threading.Thread(target=run, args=("../UI_manager",))
t3 = threading.Thread(target=run, args=("../Node_Manager",))

t1.start()
t3.start()

