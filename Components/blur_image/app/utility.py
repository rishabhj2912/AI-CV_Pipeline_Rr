import sys
from minio import Minio
from minio.error import S3Error
import os
from dotenv import load_dotenv

load_dotenv()

def preprocess():
    from src.src import blurring_image, cv2
    image = cv2.imread("ip.jpg")
    img = blurring_image(image)
    cv2.imwrite("op.jpg", img) 
    
if __name__ == '__main__':
    # print(os.environ.get('MinIO_endpoint') + ":" + os.environ.get('MinIO_port'))
    endpoint = os.environ.get('MinIO_endpoint') + ":" + os.environ.get('MinIO_port')
    client = Minio(
        # "play.min.io",
        "127.0.0.1:9000",
        secure=False,
        access_key = os.environ.get("MinIO_accesskey"),
        secret_key = os.environ.get("MinIO_secretkey")
    )

    image_url = sys.argv[1]
    print(image_url)
    flag = False
    while not flag:
        try:
            client.fget_object(
                os.environ.get("MinIO_img_Bucket"), image_url, "ip.jpg",
            )
            flag = True
        except:
            flag = False
    print("Object Fetched sucessfully")
    new_img=sys.argv[2]
    print(new_img)
    preprocess()
    print("preprocessed")
    client.fput_object(
        os.environ.get("MinIO_img_Bucket"), new_img, "op.jpg",
    )
    print("Image Uploaded sucessfully")
