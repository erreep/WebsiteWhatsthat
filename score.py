import json
import numpy as np
import os
from PIL import Image
from tensorflow.keras.models import load_model

# Function to preprocess images
def preprocess_image(image):
    """
    Preprocess an image for input into a CNN.
    """
    # Convert the image to grayscale
    image = image.convert("L")

    # Convert the image to a numpy array and normalize to the range [0, 1]
    image_np = np.array(image) / 255.0

    # Reshape image to the expected input shape for a CNN
    image_np = image_np.reshape(1, 32, 32, 1)

    return image_np

def init():
    global model
    # Update the path to your model, if necessary
    model_path = os.path.join(os.getenv('AZUREML_MODEL_DIR'), 'my_model.h5')
    model = load_model(model_path)

def run(raw_data):
    try:
        # Load the image
        image = Image.open(raw_data)

        # Preprocess the image
        data = preprocess_image(image)

        # make prediction
        y_hat = model.predict(data)
        return y_hat.tolist()
    except Exception as e:
        error = str(e)
        return error
