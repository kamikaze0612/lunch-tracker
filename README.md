# Өдрийн хоолны зардал бүртгэлийн API баримт бичиг

## Тойм

Энэ API нь ажилчдад өдрийн хоолны зардлыг бүртгэж, бүлгийн дансны үлдэгдлийг удирдахад тусалдаг. Систем нь олон бүлэг, уян хатан оролцоо, дансны тооцоог хөтөлдөг.

## Үндсэн URL

```
http://localhost:8000
```

## API endpoints

### Хэрэглэгчид

#### Хэрэглэгч үүсгэх

```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@company.com",
  "avatar": "https://example.com/avatar.jpg" // заавал биш
}
```

#### Бүх хэрэглэгчийг авах

```http
GET /users
```

#### ID-аар хэрэглэгч авах

```http
GET /users/1
```

#### Хэрэглэгч шинэчлэх

```http
PATCH /users/1
Content-Type: application/json

{
  "name": "Max Johnson Updated",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### Хэрэглэгч устгах

```http
DELETE /users/1
```

### Бүлгүүд

#### Бүлэг үүсгэх

```http
POST /groups?createdBy=1
Content-Type: application/json

{
  "name": "Оффисын өдрийн хоолны бүлэг",
  "description": "Багийн өдөр тутмын хоолны зардал"
}
```

#### Бүх бүлгийг авах

```http
GET /groups
```

#### Хэрэглэгчийн бүлгүүдийг авах

```http
GET /groups/user/1
```

#### Гишүүдтэй бүлгийг авах

```http
GET /groups/1/members
```

#### Бүлэгт хэрэглэгч нэмэх

```http
POST /groups/1/members
Content-Type: application/json

{
  "userIds": [2, 3, 4]
}
```

#### Бүлэгээс хэрэглэгч хасах

```http
DELETE /groups/1/members/2
```

### Гүйлгээнүүд

#### Гүйлгээ үүсгэх

```http
POST /transactions
Content-Type: application/json

{
  "groupId": 1,
  "paidBy": 1,
  "totalAmount": "40.00",
  "description": "Итали ресторанд хоол",
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

#### Хурдан гүйлгээ үүсгэх (тэнцүү хуваалт)

```http
POST /transactions/quick-split
Content-Type: application/json

{
  "groupId": 1,
  "paidBy": 1,
  "totalAmount": "40.00",
  "description": "Итали ресторанд хоол",
  "transactionDate": "2024-01-15",
  "participantIds": [1, 2, 3, 4]
}
```

#### ID-аар гүйлгээ авах

```http
GET /transactions/1
```

#### Бүлгийн гүйлгээнүүдийг авах

```http
GET /transactions/group/1?limit=20&offset=0
```

#### Бүлгийн дансны тооцооны хуудас авах

```http
GET /transactions/group/1/balance-sheet
```

Хариу:

```json
{
  "groupId": 1,
  "groupName": "Оффисын өдрийн хоолны бүлэг",
  "members": [
    {
      "userId": 1,
      "userName": "Max",
      "balance": "26.67" // эерэг = мөнгө авах ёстой
    },
    {
      "userId": 2,
      "userName": "David",
      "balance": "-13.33" // сөрөг = мөнгө төлөх ёстой
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

#### Дансаа нийлүүлэх

```http
POST /transactions/group/1/settle?settledBy=1
Content-Type: application/json

{
  "groupId": 1,
  "description": "Сарын тооцоо - 2024 оны 1-р сар"
}
```

#### Бүлгийн тооцооны түүхийг авах

```http
GET /transactions/group/1/settlements
```

## Ашиглалтын жишээ

### 1. Хэрэглэгч болон бүлэг тохируулах

```bash
# Хэрэглэгчид үүсгэх
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

# Бүлэг үүсгэх
curl -X POST "http://localhost:3000/groups?createdBy=1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Оффисын өдрийн хоолны бүлэг", "description": "Өдөр тутмын хоолны зардал"}'

# Бүлэгт хэрэглэгчид нэмэх
curl -X POST http://localhost:3000/groups/1/members \
  -H "Content-Type: application/json" \
  -d '{"userIds": [2, 3, 4]}'
```

### 2. Өдрийн хоолны зардал бүртгэх

```bash
# Max $40 төлнө. Хүн бүр $10 ийн хоол идсэн (тэнцүү хуваагдал)
curl -X POST http://localhost:3000/transactions/quick-split \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": 1,
    "paidBy": 1,
    "totalAmount": "40.00",
    "description": "Итали ресторан",
    "transactionDate": "2024-01-15",
    "participantIds": [1, 2, 3, 4]
  }'

# David $30 төлнө. Хүн бүр $10 ийн хоол идсэн (тэнцүү хуваагдал)
curl -X POST http://localhost:3000/transactions/quick-split \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": 1,
    "paidBy": 2,
    "totalAmount": "30.00",
    "description": "Суши газар",
    "transactionDate": "2024-01-16",
    "participantIds": [1, 2, 3]
  }'
```

### 3. Дансны тооцоо шалгах

```bash
curl http://localhost:3000/transactions/group/1/balance-sheet
```

### 4. Дансны үлдэгдэл тооцоо хийх

```bash
curl -X POST "http://localhost:3000/transactions/group/1/settle?settledBy=1" \
  -H "Content-Type: application/json" \
  -d '{"groupId": 1, "description": "Сарын төгсгөлийн тооцоо"}'
```

## Серверээс ирэх хариунууд

Бүх endpoint-с зохих HTTP статус кодуудыг буцаана:

- `200` - Амжилттай
- `201` - Үүсгэгдсэн
- `400` - Буруу хүсэлт
- `404` - Олдсонгүй
- `409` - Зөрчил (жишээ нь давхцсан имэйл)
- `500` - Серверийн дотоод алдаа

Алдааны хариуны формат:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```
