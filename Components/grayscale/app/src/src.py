import cv2 

def solve( image ): 
   gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
   return gray_image