from dataclasses import asdict

from flask import Flask, request, jsonify

from flask_cors import CORS

from User import (

    get_user_by_id,

    update_user,

    seed_mock_db,

    User

)



app = Flask(__name__)

CORS(app) # Enable CORS for all routes



# Initialize Mock Database with Seed Data

seed_mock_db()



@app.route('/api/user/<int:user_id>', methods=['GET'])

def api_get_user(user_id):

    """

    Retrieves a specific user by ID.

    """

    user = get_user_by_id(user_id)

    if user:

        return jsonify(asdict(user)), 200

    else:

        return jsonify({'error': 'User not found.'}), 404



@app.route('/api/user/<int:user_id>', methods=['PUT'])

def api_update_user(user_id):

    """

    Updates an existing user's details.

    """

    data = request.get_json()

    if data is  None:

        return jsonify({'error': 'No data provided for update.'}), 400



    try:

        user = update_user(user_id, data)

        return jsonify(asdict(user)), 200

    except ValueError as e:

        return jsonify({'error': str(e)}), 404



# Run the Flask app

if __name__ == '__main__':

    app.run(debug=True)