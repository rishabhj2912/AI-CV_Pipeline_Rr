import sys
from minio import Minio
from minio.error import S3Error
import os
from dotenv import load_dotenv

load_dotenv()   


def preprocess():
    from src.src import solve, cv2
    image = cv2.imread("ip.jpg")
    img = solve(image)
    cv2.imwrite("op.jpg", img) 
    
if __name__ == '__main__':
    endpoint = "10.8.0.31:9000"
    client = Minio(
        # "play.min.io",
        "10.8.0.31:9000",
        secure=False,
        access_key = "MzsWV9nrzt0a4jDjdORY",
        secret_key = "aRKv3GgGROmV7eU65JUNsrXxktZwAtEUOzGdn21W"
    )

    image_url = sys.argv[1]
    print(image_url)
    flag = False
    while not flag:
        try:
            client.fget_object(
                "datadrive-dev", image_url, "ip.jpg",
            )
            flag = True
        except:
            flag = False
    print(flag)
    print("Object Fetched sucessfully")
    new_img=sys.argv[2]
    print(new_img)
    preprocess()
    print("preprocessed")
    flag = False
    while not flag:
        try:
            client.fput_object(
            "datadrive-dev", new_img, "op.jpg",
        )
            flag = True
        except:
            flag = False
    print(flag)
    print("Image Uploaded sucessfully")
