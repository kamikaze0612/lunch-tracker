# Lunch Tracker API Documentation

## Overview

This API helps colleagues track lunch expenses and manage group balances. The system supports multiple groups, flexible participation, and automatic balance calculations.

## Base URL

```
http://localhost:3000
```

## API Endpoints

### Users

#### Create User

```http
POST /users
Content-Type: application/json

{
  "name": "Max Johnson",
  "email": "max@company.com",
  "avatar": "https://example.com/avatar.jpg" // optional
}
```

#### Get All Users

```http
GET /users
```

#### Get User by ID

```http
GET /users/1
```

#### Update User

```http
PATCH /users/1
Content-Type: application/json

{
  "name": "Max Johnson Updated",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### Delete User

```http
DELETE /users/1
```

### Groups

#### Create Group

```http
POST /groups?createdBy=1
Content-Type: application/json

{
  "name": "Office Lunch Group",
  "description": "Daily lunch expenses for the team"
}
```

#### Get All Groups

```http
GET /groups
```

#### Get User's Groups

```http
GET /groups/user/1
```

#### Get Group with Members

```http
GET /groups/1/members
```

#### Add Users to Group

```http
POST /groups/1/members
Content-Type: application/json

{
  "userIds": [2, 3, 4]
}
```

#### Remove User from Group

```http
DELETE /groups/1/members/2
```

### Transactions

#### Create Transaction (Custom Split)

```http
POST /transactions
Content-Type: application/json

{
  "groupId": 1,
  "paidBy": 1,
  "totalAmount": "40.00",
  "description": "Lunch at Italian Restaurant",
  "transactionDate": "2024-01-15",
  "participants": [
    {
      "userId": 1,
      "shareAmount": "10.00"
    },
    {
      "userId": 2,
      "shareAmount": "15.00"
    },
    {
      "userId": 3,
      "shareAmount": "15.00"
    }
  ]
}
```

#### Create Quick Split (Equal Split)

```http
POST /transactions/quick-split
Content-Type: application/json

{
  "groupId": 1,
  "paidBy": 1,
  "totalAmount": "40.00",
  "description": "Lunch at Italian Restaurant",
  "transactionDate": "2024-01-15",
  "participantIds": [1, 2, 3, 4]
}
```

#### Get Transaction by ID

```http
GET /transactions/1
```

#### Get Group Transactions

```http
GET /transactions/group/1?limit=20&offset=0
```

#### Get Group Balance Sheet

```http
GET /transactions/group/1/balance-sheet
```

Response:

```json
{
  "groupId": 1,
  "groupName": "Office Lunch Group",
  "members": [
    {
      "userId": 1,
      "userName": "Max",
      "balance": "26.67" // positive = should receive money
    },
    {
      "userId": 2,
      "userName": "David",
      "balance": "-13.33" // negative = owes money
    },
    {
      "userId": 3,
      "userName": "Anna",
      "balance": "-13.34"
    }
  ],
  "totalTransactions": 5,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### Settle Balances

```http
POST /transactions/group/1/settle?settledBy=1
Content-Type: application/json

{
  "groupId": 1,
  "description": "Monthly settlement - January 2024"
}
```

#### Get Group Settlements History

```http
GET /transactions/group/1/settlements
```

## Example Usage Flow

### 1. Setup Users and Group

```bash
# Create users
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Max", "email": "max@company.com"}'

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "David", "email": "david@company.com"}'

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Anna", "email": "anna@company.com"}'

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Christina", "email": "christina@company.com"}'

# Create group
curl -X POST "http://localhost:3000/groups?createdBy=1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Office Lunch Group", "description": "Daily lunch expenses"}'

# Add users to group
curl -X POST http://localhost:3000/groups/1/members \
  -H "Content-Type: application/json" \
  -d '{"userIds": [2, 3, 4]}'
```

### 2. Record Lunch Expenses

```bash
# Max pays $40 for 4 people (equal split)
curl -X POST http://localhost:3000/transactions/quick-split \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": 1,
    "paidBy": 1,
    "totalAmount": "40.00",
    "description": "Italian Restaurant",
    "transactionDate": "2024-01-15",
    "participantIds": [1, 2, 3, 4]
  }'

# David pays $30 for 3 people
curl -X POST http://localhost:3000/transactions/quick-split \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": 1,
    "paidBy": 2,
    "totalAmount": "30.00",
    "description": "Sushi Place",
    "transactionDate": "2024-01-16",
    "participantIds": [1, 2, 3]
  }'
```

### 3. Check Balance Sheet

```bash
curl http://localhost:3000/transactions/group/1/balance-sheet
```

### 4. Settle Balances

```bash
curl -X POST "http://localhost:3000/transactions/group/1/settle?settledBy=1" \
  -H "Content-Type: application/json" \
  -d '{"groupId": 1, "description": "End of month settlement"}'
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

Error response format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```
