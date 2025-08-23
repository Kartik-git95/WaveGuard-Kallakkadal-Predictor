# app.py (Modified)

from flask import Flask, request, jsonify
from flask_cors import CORS
from prediction import predict_wave_type # Import your new function

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# The predictor.py now handles loading the models when it's imported.

@app.route('/predict', methods=['POST'])
def handle_prediction():
    if not request.json:
        return jsonify({"error": "Missing JSON in request"}), 400
    
    input_data = request.json
    
    try:
        # Get the prediction using the new stateless function
        result = predict_wave_type(input_data)
        return jsonify(result)
    except Exception as e:
        # This will catch errors if the model isn't loaded or input data is bad
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, port=5000)