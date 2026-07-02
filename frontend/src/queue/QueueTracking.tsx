import {useState} from 'react';
import api from '../lib/axios';

function QueueTracking() {
    const [sex, setSex] = useState('');
    const [age, setAge] = useState('');
    const [reason, setReason] = useState('');


    return (
        <div>
    <form>

        <select value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
        </select>
        <input type="text" placeholder="Enter your contact number" />
        <input type="text" placeholder="Enter your contact number" />
        <input type="text" placeholder="Enter your contact number" />
        <button type="submit">Join Queue</button>

    </form>
        </div>
    );
}
export default QueueTracking;