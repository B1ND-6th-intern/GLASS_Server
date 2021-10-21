# GLASS_Server API 문서

DGSW B1ND 6기 인턴 프로젝트 GLASS 서버 API 문서입니다.
<br/>
<br/>

---
<br/>

### 게시물들 불러오기 (Home)

```
GET /
```

<br/>

### 회원가입 (Join)

```
POST /join
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|email|string|body||
|password|string|body||
|password2|string|body|password confirmation|
|name|string|body|user's name|
|permission|integer|body|0=student, 1=Parent, 2=Teacher|

if permission is 0, add this

|Name|Type|In|Description|
|------|---|---|---|
|grade|integer|body||
|classNumber|integer|body||
|stuNumber|integer|body||

<br/>

### 로그인 (Login)

```
POST /login
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|email|string|body||
|password|string|body||

<br/>

### 사용자 이름 검색 (Search)

```
GET /search
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|keyword|string|query|put in URL|

<br/>

---

<br/>

### 특정 게시물 조회 (Watch)

```
GET /writings/:id
```

<br/>

### 인기 게시물들 불러오기 (get Popular postings)

<br/>

### 편집할 게시물 불러오기 (get Edit)

```
GET /writings/:id/edit
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 게시물 편집 (post Edit)

```
POST /writings/:id/edit
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 게시물 삭제 (Delete Posting)

```
DELETE /writings/:id/delete
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 게시물 좋아요 (Like)

```
GET /writings/like/:id
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 게시물에 첨부할 사진 업로드 (Upload images)

```
POST /writings/upload/imgs
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 게시물 업로드 (Upload Posting)

```
POST /writings/upload
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

---

<br/>

### 유저 이메일 인증 코드 전송 (get Email)

```
GET /users/email-auth
```

<br/>

### 유저 이메일 인증 코드 확인 (post Email)

```
POST /users/email-auth
```

<br/>

### 유저 정보 수정 (edit)

```
POST /users/edit
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 유저 아바타 업로드/수정 (edit avatar)

```
POST /users/edit/avatar
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 유저 비밀번호 변경 (Change password)

```
POST /users/change-password
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 유저 정보 조회 (See user's profile)

```
GET /users/:id
```

<br/>

### 유저(자신) 아이디 조회

```
GET /users/user-id
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

---

<br/>

### 댓글 업로드 (Upload comment)

```
POST /comments/upload
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 수정할 댓글 받아오기 (get comment)

```
GET /comments/:id/edit
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 댓글 수정하기 (post comment)

```
POST /comments/:id/edit
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>

### 댓글 삭제하기 (Delete comment)

```
DELETE /comments/:id
```

Parameters
|Name|Type|In|Description|
|------|---|---|---|
|token|string|headers||

<br/>
