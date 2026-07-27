// import axios from "axios";

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "https://techcare-hui6.onrender.com",
//   withCredentials: true,
// });



import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // on monolithic its undefined without beacsue  it has /api on VITE_API_BASE_URL so it redirects to the webs domain and adds /api on its. thats not the same on our static
});
// ┌─────────┬──────────────────┬─────────────────────────────────────┬──────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┬───────────────────┐
// │ (index) │ deployment       │ baseURL                             │ axiosBehavior                                │ finalURL                                                    │ status            │
// ├─────────┼──────────────────┼─────────────────────────────────────┼──────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┼───────────────────┤
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