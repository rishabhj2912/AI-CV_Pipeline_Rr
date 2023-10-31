import torch
import torchvision
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt

model = torchvision.models.detection.maskrcnn_resnet50_fpn(pretrained=True)
model.eval()

image = Image.open("image.jpg")  
image = image.convert("RGB")

# Preprocess the image
transform = transforms.Compose([
    transforms.ToTensor(),
])
image = transform(image)
image = image.unsqueeze(0)  

with torch.no_grad():
    output = model(image)

boxes = output[0]['boxes'].detach().cpu().numpy()
labels = output[0]['labels'].detach().cpu().numpy()

img = np.array(image[0].permute(1, 2, 0)) 
plt.imshow(img)
for box, label in zip(boxes, labels):
    x, y, x_max, y_max = box
    plt.rectangle((x, y), (x_max, y_max), edgecolor='r', facecolor='none')
    plt.text(x, y, f'Label: {label}', color='r')
plt.show()
