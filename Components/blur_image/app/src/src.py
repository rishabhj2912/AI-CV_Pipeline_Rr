import cv2 

def solve(image): 
   filtered_image = cv2.medianBlur(image, 11)
   return filtered_image