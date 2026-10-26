
import api from "#lib/axios";
import { useState, type FormEvent } from "react";

function SSESend() {
    const [message, setMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!message.trim()) return;

        try {
            const response = await api.post("http://localhost:5000/api/sse/send", { message });
            alert(response.data.message)
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Enter a message"
                />

                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default SSESend;
