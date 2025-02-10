from dataclasses import dataclass, asdict

@dataclass
class User:
    id: int
    name: str
    email: str
    bio: str

    def update(self, data):
        self.name = data.get('name', self.name)
        self.email = data.get('email', self.email)
        self.bio = data.get('bio', self.bio)

# Mock database represented as a dictionary
users_db = dict()

# CRUD Functions

def create_user(id, name, email, bio):
    """
    Creates a new user and adds it to the mock database.

    Args:
        id (int): Unique identifier for the user.
        name (str): Name of the user.
        email (str): Email address of the user.
        bio (str): Bio of the user.

    Returns:
        User: The created User instance.

    Raises:
        ValueError: If a user with the given ID already exists.
    """
    if id in users_db:
        raise ValueError(f"User with ID {id} already exists.")

    user = User(id, name, email, bio)
    users_db[id] = user
    return user

def get_user_by_id(user_id):
    """
    Retrieves a user by their ID.

    Args:
        user_id (int): The ID of the user to retrieve.

    Returns:
        User or None: The User instance if found, else None.
    """
    return users_db.get(user_id)

def update_user(user_id, data):
    """
    Updates an existing user's details.

    Args:
        user_id (int): The ID of the user to update.
        data (dict): A dictionary containing the fields to update.

    Returns:
        User: The updated User instance.

    Raises:
        ValueError: If the user does not exist.
    """
    user = get_user_by_id(user_id)

    user.update(data)
    return user

def list_users():
    """
    Lists all users in the mock database.

    Returns:
        list: A list of User instances.
    """
    return list(users_db.values())

# Utility Functions

def seed_mock_db():
    """
    Seeds the mock database with initial users.
    """
    create_user(0, "Alice Smith", "alice@example.com", "Software Developer from NY.")
    create_user(1, "Bob Johnson", "bob@example.com", "Graphic Designer from CA.")
    create_user(2, "Charlie Lee", "charlie@example.com", "Data Scientist from TX.")
