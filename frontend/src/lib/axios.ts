// import axios from "axios";

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "https://techcare-hui6.onrender.com",
//   withCredentials: true,
// });

import axios from "axios";
import { ENV } from "./env.config";

const api = axios.create({
  baseURL: ENV.VITE_IS_DEVELOPMENT ? "http://localhost:5000" : ENV.VITE_API_BASE_URL, // on monolithic its undefined without beacsue  it has /api on VITE_API_BASE_URL so it redirects to the webs domain and adds /api on its. thats not the same on our static
    //   1. Local monolithic (npm run build && npm start, one server on :5000)

    // No VITE_API_BASE_URL set → baseURL = ""
    // Browser loads page from http://localhost:5000, axios requests go to http://localhost:5000/api/... (relative → same origin)
    // ✅ Works

    // 2. Prod monolithic (deployed, one service)

    // No VITE_API_BASE_URL set at build → baseURL = ""
    // Browser loads page from https://techcare-hui6.onrender.com, axios requests go there too
    // ✅ Works (this was the broken one before — it used to literally try localhost:5000 on a stranger's browser)

    // 3. Local distributed (two terminals, backend on :5000, frontend dev server on :5173)

    // You set VITE_API_BASE_URL=http://localhost:5000 in frontend/.env.local
    // baseURL = "http://localhost:5000" (env var wins, fallback never used)
    // ✅ Works exactly like before

    // 4. Prod distributed (separate static frontend + separate backend)

    // You set VITE_API_BASE_URL=https://your-backend.onrender.com at build time on the static host
    // baseURL = "https://your-backend.onrender.com" (env var wins)
    // ✅ Works exactly like before
});



// ┌─────────┬──────────────────┬─────────────────────────────────────┬──────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┬───────────────────┐
// │ (index) │ deployment       │ baseURL                             │ axiosBehavior                                │ finalURL                                                    │ status            │
// ├─────────┼──────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────┼────────────────────────────────────────———————————————┬———————————————┤
// │ 0       │ 'Monolithic'     │ 'undefined'                         │ 'Falls back to the page's own origin'        │ 'https://techcare-hui6.onrender.com/api/admin/services'     │ '✅ Correct'      │
// │ 1       │ 'Static (broken)'│ 'undefined or wrong'                │ 'Falls back to the page's own origin'        │ 'https://your-static-site.onrender.com/api/admin/services'  │ '❌ Wrong server' │
// │ 2       │ 'Static (fixed)' │ 'https://techcare-hui6.onrender.com'│ 'Uses that explicitly'                       │ 'https://techcare-hui6.onrender.com/api/admin/services'     │ '✅ Correct'      │
// └─────────┴──────────────────┴─────────────────────────────────────┴──────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────┘

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
// There are two kinds of interceptors:

// Request interceptor (before sending)
// api.interceptors.request.use((config) => {
//   config.headers.Authorization = "Bearer token";
//   config.baseURL = "https://example.com";
//   config.timeout = 10000;

//   return config;
// });

//===========================================================================================
// interceptors is a property on the Axios instance.

// api.interceptors

// It contains tools for intercepting requests and responses.

// Conceptually:

// api = {
//     interceptors: {
//         request: { ... },
//         response: { ... }
//     }
// }
//===========================================================================================
// Response interceptor (after receiving)
// api.interceptors.response.use((response) => {
//   console.log(response.data);

//   return response;
// });

// Here, you can modify the response before the rest of your application sees it.