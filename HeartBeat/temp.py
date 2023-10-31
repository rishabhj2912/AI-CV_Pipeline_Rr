import requests
import time

def healthCheck(url,port):
    temp=0
    try:
        response = requests.get(url)
    except:
        temp=1
        print("An exception occurred")
        
    if temp==0 and response.status_code == 200: 
        print('Request was successful')
        
    else:
        r = requests.get("http://127.0.0.1:8085/redeploy/:"+port)
        print(r.content)
        return



while(True):
    healthCheck('http://127.0.0.1:3000/health',"3000")
    healthCheck('http://127.0.0.1:8085/health',"8085")
    healthCheck('http://127.0.0.1:8000/health',"8000")
    time.sleep(3)