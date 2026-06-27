import { useState } from "react"
import axios from "axios"
type Props = {
    onClose: () => void;
    loadUsers: () => void
};

function AddUserModal({ onClose, loadUsers }: Props) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [contactNumber, setContactNumber] = useState("")
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("")
    const [hiddenPassword, setHiddenPassword] = useState(true)
    const registerUser = async () => {
        if (!username || !password || !confirmPassword || !fullName || !contactNumber || !email || !role) {
            alert("please fill out all of the credentials")
        } else if (password !== confirmPassword) {
            alert("your passswords do no match ")
        } else {
            const response = await axios.post("/api/auth/sign-up", {
                username,
                password,
                role,
                email,
                contact_number: contactNumber,
                full_name: fullName,
            })
            alert(response.data.message)
            onClose()
            loadUsers()
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md -lg bg-white p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 flex justify-between">
                    Add User
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border "
                    >
                        X
                    </button>
                </h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full border p-2"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <div className="flex border">
                        <input
                            type={hiddenPassword ? "password" : "text"}
                            placeholder="Password"
                            className="w-full p-2 outline-none"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="text-1 p-2" onClick={() => setHiddenPassword(!hiddenPassword)}> showpassword</button>
                    </div>
                    <input
                        type="password"
                        placeholder="Repeat Password"
                        className="w-full border  p-2"
                        onChange={(e) => setConfirmPassword(e.target.value)}

                    />
                    <input
                        type="text"
                        placeholder="Full name"
                        className="w-full border p-2"
                        onChange={(e) => setFullName(e.target.value)}


                    />
                    <input
                        type="text"
                        placeholder="Contact Number"
                        className="w-full border p-2"
                        onChange={(e) => setContactNumber(e.target.value)}

                    />
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full border p-2"
                        onChange={(e) => setEmail(e.target.value)}

                    />

                    <select className="w-full border  p-2"
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option >Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="laboratory-staff">Laboratory Staff</option>
                        <option value="frontdesk-staff">Front Desk Staff</option>
                        <option value="patient">Patient</option>
                    </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">


                    <button className="px-4 py-2 bg-gray-200 hover:cursor-pointer hover:bg-gray-400"
                        onClick={registerUser}>
                        Add User
                    </button>
                </div>
            </div>
        </div>
    );
}
export default AddUserModal