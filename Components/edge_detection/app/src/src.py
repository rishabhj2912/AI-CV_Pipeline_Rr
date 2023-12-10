import cv2 
import numpy as np 
# import matplotlib.pyplot as plt

def simple_edge_detection(image): 
   edges_detected = cv2.Canny(image , 100, 200) 
   # images = [image , edges_detected]
   # location = [121, 122] 
   # for loc, edge_image in zip(location, images): 
   #    plt.subplot(loc) 
   #    plt.imshow(edge_image, cmap='gray')
   return edges_detected
