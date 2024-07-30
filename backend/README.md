### Prerequisites
Before running the application, make sure to create a `.env` file in the project root directory and add the following line:
SECRET_KEY="yourkey"


### 1. `GET /users/`
**Description:** Get a list of all users.
**Method:** GET
**Returns:** JSON response containing a list of users or an authentication error message.

**Example Response:**
```json
[
    {
        "id": 1,
        "username": "user1",
        "email": "user1@example.com"
    },
    {
        "id": 2,
        "username": "user2",
        "email": "user2@example.com"
    }
]
```

### 2. `POST /users/create`
**Description:** Create a new user.
**Method:** POST
**Returns:** JSON response indicating success or failure of the creation.

**Example Request:**
```json
{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123"
}
```

**Example Response:**
```json
{
    "message": "User created successfully!"
}
```

### 3. `GET /users/<str:username>`
**Description:** Get details of a specific user by username.
**Method:** GET
**Returns:** JSON response with user details or an error message if the user is not found.

**Example Response:**
```json
{
    "id": 1,
    "username": "user1",
    "email": "user1@example.com"
}
```

### 4. `POST /auth/login`
**Description:** Login a user.
**Method:** POST
**Returns:** JSON response with a token or an error message on failure.

**Example Request:**
```json
{
    "username": "user1",
    "password": "password123"
}
```

**Example Response:**
```json
{
    "token": "some.jwt.token"
}
```

### 5. `POST /auth/logout`
**Description:** Logout a user.
**Method:** POST
**Returns:** JSON response indicating the user has been logged out.

**Example Response:**
```json
{
    "message": "Logged out successfully!"
}
```

### 6. `POST /auth/toogle_twofa`
**Description:** Toggle two-factor authentication for a user.
**Method:** POST
**Returns:** JSON response indicating the new status of two-factor authentication.

**Example Response:**
```json
{
    "message": "Two-factor authentication enabled!"
}
```

### 7. `POST /auth/verify_twofa`
**Description:** Verify the two-factor authentication code.
**Method:** POST
**Returns:** JSON response indicating success or failure of verification.

**Example Request:**
```json
{
    "code": "123456"
}
```

**Example Response:**
```json
{
    "message": "Two-factor authentication verified!"
}
```

### 8. `GET /events/`
**Description:** Get all events for a user.
**Method:** GET
**Returns:** JSON response with a list of events for the authenticated user.

**Example Response:**
```json
[
    {
        "id": 1,
        "name": "Event 1",
        "date": "2023-05-24"
    },
    {
        "id": 2,
        "name": "Event 2",
        "date": "2023-06-15"
    }
]
```

### 9. `POST /events/create`
**Description:** Create a new event.
**Method:** POST
**Returns:** JSON response indicating success or failure of the event creation.

**Example Request:**
```json
{
    "name": "New Event",
    "date": "2023-07-20"
}
```

**Example Response:**
```json
{
    "message": "Event created successfully!"
}
```

### 10. `GET /event/<int:id>`
**Description:** Get details of a specific event by ID.
**Method:** GET
**Returns:** JSON response with event details or an error message if the event is not found.

**Example Response:**
```json
{
    "id": 1,
    "name": "Event 1",
    "date": "2023-05-24"
}
```

### 11. `DELETE /event/remove/<int:id>`
**Description:** Remove a specific event by ID.
**Method:** DELETE
**Returns:** JSON response indicating success or failure of the event removal.

**Example Response:**
```json
{
    "message": "Event removed successfully!"
}
```

### 12. `POST /event/join/<int:id>`
**Description:** Join a specific event by ID.
**Method:** POST
**Returns:** JSON response indicating success or failure of joining the event.

**Example Response:**
```json
{
    "message": "Successfully joined the event!"
}
```

### 13. `POST /event/<int:id>/validate`
**Description:** Validate a ticket (billet) for a specific event by ID.
**Method:** POST
**Returns:** JSON response indicating success or failure of ticket validation.

**Example Request:**
```json
{
    "ticket_code": "XYZ123"
}
```

**Example Response:**
```json
{
    "message": "Ticket validated successfully!"
}
```

### 14. `GET /event/<int:id>/qr_code`
**Description:** Get the QR code for a specific event by ID for the user.
**Method:** GET
**Returns:** JSON response containing the QR code.

**Example Response:**
```json
{
    "qr_code": "base64encodedstring"
}
```

### 15. `POST /event/add/<str:username>`
**Description:** Add a user to a specific event by username.
**Method:** POST
**Returns:** JSON response indicating success or failure of adding the user to the event.

**Example Response:**
```json
{
    "message": "User added to event!"
}
```

### 16. `DELETE /billet/delete/<int:id>`
**Description:** Delete a ticket (billet) by ID.
**Method:** DELETE
**Returns:** JSON response indicating success or failure of deleting the ticket.

**Example Response:**
```json
{
    "message": "Billet deleted!"
}
```

### 17. `GET /users/me`
**Description:** Get current user information with the Authorization token
**Method:** GET
**Returns:** JSON response with all user info

---

