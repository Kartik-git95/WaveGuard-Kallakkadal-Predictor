# app.py (Modified)

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit # New imports

from prediction import predict_wave_type # Your existing import

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# The predictor.py now handles loading the models when it's imported.

# === NEW: Initialize SocketIO for real-time communication ===
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    print('Client connected!')

@socketio.on('authorities_message')
def handle_authorities_message(data):
    # This event is triggered when the Authorities page sends a message
    message = data['message']
    print(f'Received message from Authorities: {message}')
    
    # Broadcast the message to all connected clients (including the Locals page)
    socketio.emit('locals_message', {'message': message})
# === END NEW SOCKETIO CODE ===

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
    # === NEW: Use socketio.run instead of app.run ===
    socketio.run(app, debug=True, port=5000)
    # === END NEW RUN COMMAND ===