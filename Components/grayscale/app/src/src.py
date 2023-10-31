import cv2 

def grayscale_image( image ): 
   gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
   return gray_image