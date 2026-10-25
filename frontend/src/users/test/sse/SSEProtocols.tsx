
import { useEffect, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

function SSEProtocols() {
  const [messages, setMessages] = useState<string[]>([]);
  const controller = new AbortController();

  async function connectSSE() {
    await fetchEventSource("http://localhost:3000/test/sse", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      signal: controller.signal,

      onmessage(event) {
        const data = JSON.parse(event.data)
        console.log("Received message:", event.data);
        setMessages(() =>[data.messages, ...messages])
      }
    });
  }

  useEffect(() => {

    connectSSE();

    return () => {
      controller.abort();
    };
  });

  return (
    <>
      {messages.map((message) => 
      {
        <div>
          {message}
        </div>
      }
      )};
    </>
  )
}

export default SSEProtocols;
