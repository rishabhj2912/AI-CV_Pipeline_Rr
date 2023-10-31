import cv2 

def blurring_image(image): 
   filtered_image = cv2.medianBlur(image, 11)
   # images = [image , edges_detected]
   # location = [121, 122] 
   # for loc, edge_image in zip(location, images): 
   #    plt.subplot(loc) 
   #    plt.imshow(edge_image, cmap='gray')
   return filtered_image