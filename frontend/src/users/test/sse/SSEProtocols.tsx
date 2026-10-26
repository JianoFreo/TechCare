
import { useEffect, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

function SSEProtocols() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function connectSSE() {
      try {
        await fetchEventSource("http://localhost:3000/api/sse/stream-sse", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          signal: controller.signal,

          onmessage(event) {
            try {
              const data = JSON.parse(event.data);

              setMessages((prevMessages) => [
                data.messages,
                ...prevMessages,
              ]);
            } catch (error) {
              console.error("Failed to parse SSE message:", error);
            }
          },
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("SSE connection failed:", error);
        }
      }
    }

    connectSSE();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <>
      {messages.map((message, index) => (
        <div key={index}>
          {message}
        </div>
      ))}
    </>
  );
}

export default SSEProtocols;


// import { useEffect, useState } from "react";
// import { fetchEventSource } from "@microsoft/fetch-event-source";

// function SSEProtocols() {
//   const [messages, setMessages] = useState<string[]>([]);
//   const controller = new AbortController();

//   async function connectSSE() {
//     await fetchEventSource("http://localhost:3000/test/sse", {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`
//       },
//       signal: controller.signal,

//       onmessage(event) {
//         const data = JSON.parse(event.data)
//         console.log("Received message:", event.data);
//         setMessages(() =>[data.messages, ...messages])
//       }
//     });
//   }

//   useEffect(() => {

//     connectSSE();

//     return () => {
//       controller.abort();
//     };
//   });

//   return (
//     <>
//       {messages.map((message) => 
//       {
//         <div>
//           {message}
//         </div>
//       }
//       )};
//     </>
//   )
// }

// export default SSEProtocols;
