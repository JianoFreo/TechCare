backend variables
```js
PORT=3000
DATABASE_URL=api key ng postgresql sa neon
NODE_ENV=development pero sa production dapat production
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key ==> temporary kasi dapat sa frontend to
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
