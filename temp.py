import cv2

def detect_and_highlight_signs(image_path, output_path, cascade_path='stop_data.xml'):
    # Opening image
    img = cv2.imread(image_path)

    if img is None:
        print(f"Error loading image from {image_path}.")
        return

    # Convert the image to grayscale
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Load the Haar Cascade classifier for stop signs
    stop_data = cv2.CascadeClassifier(cascade_path)

    if stop_data.empty():
        print("Error loading cascade classifier.")
        return

    # Detect stop signs in the image
    found = stop_data.detectMultiScale(img_gray, minSize=(20, 20))

    # Draw rectangles around detected stop signs
    for (x, y, width, height) in found:
        cv2.rectangle(img, (x, y), (x + width, y + height), (0, 255, 0), 5)

    # Save the image with highlighted stop signs
    cv2.imwrite(output_path, img)

# Example usage:
input_image_path = '/home/civic/dfs/AI/Straw-Hats-main/image28.jpg'
output_image_path = 'output_image_with_stop_signs.jpg'
detect_and_highlight_signs(input_image_path, output_image_path)
