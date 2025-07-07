import axios from 'axios';
import server from '../environment';

const saveToHistory = async (meetingCode) => {
    try {
        const token = localStorage.getItem('token');
        if (!token || !meetingCode) return;

        await axios.post(
            `${server}/add_to_activity`, // use the correct endpoint
            {
                meetingCode, // or meeting_id depending on backend schema
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            }
        );

        console.log("✅ Meeting saved to history");
    } catch (error) {
        console.error("❌ Error saving history:", error?.response?.data || error.message);
    }
};

export default saveToHistory;
