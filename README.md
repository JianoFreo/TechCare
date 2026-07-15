backend variables
```js
DATABASE_URL=neondb
NODE_ENV=development
PORT=5000
JWT_REFRESH_TOKEN=refresh_token
JWT_SECRET=secret_token 
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=secret_refresh_token
CLOUDINARY_CLOUD_NAME=yourcloudname
CLOUDINARY_API_KEY=123445678
CLOUDINARY_API_SECRET=APISECRET
```

to test ---> write to terminal
```bash
npm run build
```
then
```bash
npm run dev
```

then open postman and test the endpoint
```
get http://localhost:3000/
```
and 
```
get http://localhost:3000/api/admin
```
---

temporary deployment ng api sa render

    https://techcare-hui6.onrender.com

you can test it on the provided endpoints
