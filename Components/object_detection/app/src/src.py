import cv2

def detect_and_highlight_signs(image_path, output_path, cascade_path='stop_data.xml'):
    img = cv2.imread(image_path)

    if img is None:
        print(f"Error loading image from {image_path}.")
        return

    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    stop_data = cv2.CascadeClassifier(cascade_path)

    if stop_data.empty():
        print("Error loading cascade classifier.")
        return

    found = stop_data.detectMultiScale(img_gray, minSize=(20, 20))

    for (x, y, width, height) in found:
        cv2.rectangle(img, (x, y), (x + width, y + height), (0, 255, 0), 5)

    return img