
import { useEffect } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

function SSEProtocols() {
  const controller = new AbortController();

  async function connectSSE() {
    await fetchEventSource("http://localhost:3000/test/sse", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      signal: controller.signal,

      onmessage(event) {
        console.log("Received message:", event.data);
      }
    });
  }

  useEffect(() => {

    connectSSE();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div>SSEProtocols</div>
  );
}

export default SSEProtocols;
