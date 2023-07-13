// Get the canvas element and its context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the canvas background color to white
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Initialize the drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Set the stroke style and brush size
const brushSize = 2; // Adjust the brush size as needed
const brushColor = 'rgba(0, 0, 0, 0.8)'; // Adjust the brush color as needed
ctx.lineWidth = brushSize;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = brushColor;

// Calculate the scaling factor for mouse coordinates
const scaleFactorX = canvas.width / canvas.offsetWidth;
const scaleFactorY = canvas.height / canvas.offsetHeight;

// Add event listeners to handle mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Function to start drawing
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX * scaleFactorX, e.offsetY * scaleFactorY];
}

// Function to draw
function draw(e) {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX * scaleFactorX, e.offsetY * scaleFactorY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX * scaleFactorX, e.offsetY * scaleFactorY];
}

// Function to stop drawing
function stopDrawing() {
    isDrawing = false;
}

// Function to preprocess the image
function preprocessImage(canvas) {
    // Convert the canvas image to a base64-encoded PNG string
    const imageData = canvas.toDataURL('image/png');

    // Remove the data URL prefix
    const base64Image = imageData.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    return base64Image;
}

// Function to make a prediction
function predict() {
    console.log('Predict function called.');
    // Preprocess the image data
    const base64Image = preprocessImage(canvas);

    // Send the base64-encoded image data to your server for prediction using AJAX or fetch
    // Replace the URL with your server endpoint for prediction
    fetch('http://127.0.0.1:5001/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: base64Image
        })
    })
    .then(response => response.json())
    .then(data => {
        // Render the predicted LaTeX expression
        renderLaTeX(data.predicted_class);
    })
    .catch(error => {
        console.error('Prediction error:', error);
    });
}

/// Function to render LaTeX expression
function renderLaTeX(expression) {
    const output = document.getElementById('prediction');

    // Remove the extra dollar signs if present
    expression = expression.replace(/^\$\$|\$\$$/g, '');

    // Wrap the LaTeX expression with $$ if it's not already wrapped
    if (!expression.startsWith('$$') && !expression.endsWith('$$')) {
        expression = '$$' + expression + '$$';
    }

    // Set the content of the output element
    output.innerHTML = expression;

    // Render LaTeX using MathJax
    MathJax.typesetPromise([output])
        .catch((err) => console.error('MathJax rendering error:', err));
}

// Function to copy LaTeX expression to clipboard
function copyLaTeX() {
    const output = document.getElementById('prediction');
    const expression = output.innerText;

    // Create a temporary textarea element and set its value to the LaTeX expression
    const textarea = document.createElement('textarea');
    textarea.value = expression;

    // Append the textarea to the body and select its content
    document.body.appendChild(textarea);
    textarea.select();

    // Copy the selected content to the clipboard
    document.execCommand('copy');

    // Remove the temporary textarea
    document.body.removeChild(textarea);

    // Alert the user that the LaTeX expression has been copied
    alert('LaTeX expression copied to clipboard');
}
