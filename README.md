# GLASS_Server API 문서

### 게시물 불러오기 (Home)

```
GET /
```

### 회원가입 (Join)

```
POST /join
```

### 로그인 (Login)

```
POST /login
```

### 사용자 이름 검색 (Search)

```
GET /search
```

---

### 게시물 조회 (Watch)

```
GET /writings/:id
```

### 편집할 게시물 불러오기 (get Edit)

```
GET /writings/:id/edit
```

### 게시물 편집 (post Edit)

```
POST /writings/:id/edit
```

### 게시물 삭제 (Delete Posting)

```
DELETE /writings/:id/delete
```

### 게시물 좋아요 (Like)

```
GET /writings/:id/like
```

### 게시물에 첨부할 사진 업로드 (Upload images)

```
POST /writings/upload/imgs
```

### 게시물 업로드 (Upload Posting)

```
POST /writings/upload
```

---

### 유저 이메일 인증 코드 전송 (get Email)

```
GET /users/email-auth
```

### 유저 이메일 인증 코드 확인 (post Email)

```
POST /users/email-auth
```

### 유저 로그아웃 (Log out)

```
GET /users/logout
```

### 유저 정보 수정 (edit)

```
POST /users/edit
```

### 유저 비밀번호 변경 (Change password)

```
POST /users/change-password
```

### 유저 정보 조회 (See user's profile)

```
GET /users/:id
```
