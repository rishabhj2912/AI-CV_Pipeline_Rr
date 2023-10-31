from PIL import Image
from glob import glob
import torchvision
import torchvision.transforms as transforms
import torch
import numpy as np
import yaml
import matplotlib.pyplot as plt
from tqdm import tqdm
import cv2
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor

with open("config.yaml","r") as f:
    config=yaml.load(f,Loader=yaml.FullLoader)


def get_bounding_box(images):
    model = torchvision.models.detection.maskrcnn_resnet50_fpn(pretrained=True)
    model.eval()
    boxes=np.zeros((len(images),4))
    for i in range(len(images)):
        output = model((transforms.ToTensor()(images[i])).unsqueeze(0))
        box = output[0]['boxes'].detach().cpu().numpy()
        boxes[i] = box[0]
    return boxes


image_path =glob(config["segmentation"]["input"]+"/*")
def  DLV3(image_path):
    images = [Image.open(i).convert('RGB') for i in image_path]
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    transform_dlv3 = transforms.Compose([
            transforms.Resize((config["segmentation"]["h"], config["segmentation"]["w"])),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    input_tensor_dlv3=torch.stack(([transform_dlv3(i) for i in images]),dim=0)
    # Load the pre-trained model from PyTorch Hub
    model = torchvision.models.segmentation.deeplabv3_resnet101(pretrained=True)
    with torch.no_grad():
        output = model(input_tensor_dlv3)['out']
        
    mask = output.argmax(1).byte().cpu().numpy()
    final_mask=np.zeros(input_tensor_dlv3.shape)

    boxes=get_bounding_box(images)
    print(boxes.shape)
    for i in range(mask.shape[0]):
        original_tensor = input_tensor_dlv3[i].cpu().numpy()
        original_tensor = original_tensor*std.reshape([3,1,1])+mean.reshape([3,1,1])
        # print(original_tensor.shape,mask.shape,final_mask.shape)
        final_mask[i]=np.where(mask[i]==15,original_tensor,0)
        plt.imsave("./SegmentedImages/DLV3/"+image_path[i].split("/")[-1],(np.transpose(final_mask[i],(1,2,0))*255).astype(np.uint8))


    fig,axes=plt.subplots(len(images), 2, figsize=(20, 100))
    for i  in range(len(images)):
        axes[i,0].imshow(images[i])
        axes[i,0].plot([boxes[i][0], boxes[i][2]], [boxes[i][1], boxes[i][1]], color='r', linewidth=2)
        axes[i,0].plot([boxes[i][0], boxes[i][0]], [boxes[i][1], boxes[i][3]], color='r', linewidth=2)
        axes[i,0].plot([boxes[i][0], boxes[i][2]], [boxes[i][3], boxes[i][3]], color='r', linewidth=2) 
        axes[i,0].plot([boxes[i][2], boxes[i][2]], [boxes[i][1], boxes[i][3]], color='r', linewidth=2)
        axes[i,0].axis('off')
        axes[i,1].imshow((np.transpose(final_mask[i],(1,2,0))*255).astype(np.uint8),cmap='gray')
        axes[i,1].axis('off')
    plt.savefig("./SegmentedImages/DLV3/SegmentationResults_DLV.png")

def SAM(image_path):
    images = [cv2.cvtColor((cv2.imread(i)),cv2.COLOR_BGR2RGB) for i in image_path]
    sam_checkpoint = "./models/sam_vit_h_4b8939.pth"
    model_type = "vit_h"
    device = "cuda"

    sam = sam_model_registry[model_type](checkpoint=sam_checkpoint)
    sam.to(device)
    predictor = SamPredictor(sam)
    boxes=get_bounding_box(images)
    final_masks=[]
    
    for i, img in (enumerate(images)):
        predictor.set_image(img)
        masks, _, _ = predictor.predict(
            point_coords=np.array([[(boxes[i][0]+boxes[i][2])/2, (boxes[i][1]+boxes[i][3])/2]]),
            point_labels=np.array([1]),
            box=boxes[i][None, :],
            multimask_output=False,
        )
        mask=masks[0]
        temp= mask.reshape((mask.shape[0],mask.shape[1],1))*img
        # temp= np.zeros((3,img.shape[0],img.shape[1]))
        # print(mask.shape,img.shape,temp.shape)
        # temp = np.where(mask[i]==True,img.transpose(2,0,1),0)
        # print(mask.shape,img.shape,temp.shape,temp.transpose(1,2,0).shape)
        final_masks.append(temp)
        plt.imsave("./SegmentedImages/SAM/"+image_path[i].split("/")[-1],(final_masks[i]))


    fig,axes=plt.subplots(10, 2, figsize=(20, 100))
    for i  in range(len(images[0:10])):
        axes[i,0].imshow(images[i])
        axes[i,0].plot([boxes[i][0], boxes[i][2]], [boxes[i][1], boxes[i][1]], color='r', linewidth=2)
        axes[i,0].plot([boxes[i][0], boxes[i][0]], [boxes[i][1], boxes[i][3]], color='r', linewidth=2)
        axes[i,0].plot([boxes[i][0], boxes[i][2]], [boxes[i][3], boxes[i][3]], color='r', linewidth=2) 
        axes[i,0].plot([boxes[i][2], boxes[i][2]], [boxes[i][1], boxes[i][3]], color='r', linewidth=2)
        axes[i,0].axis('off')
        axes[i,1].imshow(final_masks[i],cmap='gray')
        axes[i,1].axis('off')
    plt.savefig("./SegmentedImages/SAM/SegmentationResults_SAM.png")
    
SAM(image_path)