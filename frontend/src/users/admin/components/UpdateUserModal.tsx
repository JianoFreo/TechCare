import { useState } from "react"
import api from "../../../lib/axios";   
type User = {
    user_id: number;
    full_name: string
    username: string;
    role: string;
    contact_number: string;
    email: string;
};

type Props = {
    onClose: () => void;
    loadData: () => void;
    selectedUser: User;
};

function UpdateUserModal({ selectedUser, onClose, loadData }: Props) {
    const [username, setUsername] = useState(selectedUser.username)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [fullName, setFullName] = useState(selectedUser.full_name)
    const [contactNumber, setContactNumber] = useState(selectedUser.contact_number)
    const [email, setEmail] = useState(selectedUser.email)
    const [role, setRole] = useState(selectedUser.role)
    const [hiddenPassword, setHiddenPassword] = useState(true)
    const editUser = async () => {
        const data: Record<string, string> = {};
        if (username.trim()) data.username = username;
        if (password.trim()) data.password = password;
        if (role.trim()) data.role = role;
        if (email.trim()) data.email = email;
        if (contactNumber.trim()) data.contact_number = contactNumber;
        if (fullName.trim()) data.full_name = fullName;

        if (password && password !== confirmPassword) {
            alert("your passswords do no match ")
        } else {
            const response = await api.patch(`/api/admin/users/${selectedUser.user_id}`, data)
            alert(response.data.message)
            onClose()
            loadData()
        }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md -lg bg-white p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 flex justify-between">
                    Update User
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
                        value={username}
                    />
                    <div className="flex border">
                        <input
                            type={hiddenPassword ? "password" : "text"}
                            placeholder="Password"
                            className="w-full p-2 outline-none"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="text-1 p-2" onClick={() => setHiddenPassword(!hiddenPassword)}> {hiddenPassword ? "Show" : "Hide"}</button>
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
                        value={fullName}


                    />
                    <input
                        type="text"
                        placeholder="Contact Number"
                        className="w-full border p-2"
                        onChange={(e) => setContactNumber(e.target.value)}
                        value={contactNumber}

                    />
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full border p-2"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}

                    />

                    <select className="w-full border  p-2"
                        onChange={(e) => setRole(e.target.value)}
                        value={role}
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
                        onClick={editUser}>
                        Edit User
                    </button>
                </div>
            </div>
        </div>
    );
}
export default UpdateUserModal