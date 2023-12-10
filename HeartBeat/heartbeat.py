import os
import sys
import requests
import threading
import time
from dotenv import load_dotenv
load_dotenv()

url_to_service = {
    sys.argv[1] : "../UI_manager",
    sys.argv[2] : "../Scheduler"
}

for i in range(3, len(sys.argv),2):
    print(type(sys.argv[i]),sys.argv[i])
    url_to_service[sys.argv[i].rsplit('/',1)[0] + '/heart'] = sys.argv[i+1]


def healthCheck(url, path):
    # temp=0
    sendData = {
        "path" : path
    }
    print()
    try:
        response = requests.post(url, sendData)
        # print(response.status_code)
        if response.status_code != 200:
            print(url,"not working")
            requests.post(os.environ.get('Node_manager_url'),sendData)
        else: 
            # print('Request was successful')
            print(url,"working")
    except:
        print(url,"not working")

print(url_to_service)

while True:
    # time.sleep(2)
    for k,v in url_to_service.items():
        # t = threading.Timer(5,healthCheck,[k,v])
        # t.start()
        # print(k,v)
        # threading.Event().wait(5)
        healthCheck(k,v)
        # waitfor5s()
        # healthCheck(k,v)
    # time.sleep(10)
    # time.sleep(2)

# print("asdassadas")