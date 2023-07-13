from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from PIL import Image
import io
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
import re

app = Flask(__name__)
CORS(app)

# Load the model without optimizer state
model = load_model('my_model_no_optimizer.h5')
symbols_df = pd.read_csv('symbols.csv')

@app.route('/predict', methods=['POST'])
def predict():
    # Retrieve the image data from the request
    data = request.get_json()
    base64_image = data['image']

    # Decode the base64-encoded image string
    image_data = base64.b64decode(base64_image)

    # Load the image from the decoded data
    image = Image.open(io.BytesIO(image_data)).convert("L")
    image = image.resize((32, 32))  # Resize the image to (32, 32)
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)

    # Save the image as PNG
    image_pil = Image.fromarray((image[0] * 255).astype(np.uint8))
    image_pil.save('/Users/sebas/Desktop/Projects/whatsthat/Website/received_image.png')

    # Make a prediction
    prediction = model.predict(image)

    # Find the index of the class with the highest probability
    predicted_class = np.argmax(prediction)

    # Function to map symbol_id to latex
    def map_symbol_id_to_latex(symbol_id):
        row = symbols_df[symbols_df['symbol_id'] == symbol_id]
        if not row.empty:
            latex = row['latex'].values[0]
            return latex
        else:
            return 'Unknown Symbol'

    # Map predicted_class to LaTeX
    predicted_latex = map_symbol_id_to_latex(predicted_class)

    # Return the prediction result as a JSON response
    return jsonify({'predicted_class': predicted_latex})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
