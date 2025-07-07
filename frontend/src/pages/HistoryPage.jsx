import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    Grid,
    Tooltip,
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';

export default function HistoryPage() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();

    useEffect(() => {
        setMeetings([]);
        const fetchHistory = async () => {
        try {
            const history = await getHistoryOfUser();
            setMeetings(history);
        } catch (err) {
            console.error("Failed to fetch history", err);
            // Optional: add a snackbar or alert
        }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' , width:'100vw'}}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Tooltip title="Go to Home">
            <IconButton
                onClick={() => routeTo('/home')}
                sx={{
                backgroundColor: '#ffffff',
                boxShadow: 2,
                '&:hover': { backgroundColor: '#e0e0e0' },
                mr: 2,
                }}
            >
                <HomeIcon />
            </IconButton>
            </Tooltip>
            <Typography variant="h5" fontWeight="600">
            Meeting History
            </Typography>
        </Box>

        {meetings.length > 0 ? (
            <Grid container spacing={3}>
            {meetings.map((meeting, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                <Card
                    variant="outlined"
                    sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: 6,
                    },
                    backgroundColor: '#ffffff',
                    }}
                >
                    <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HistoryIcon sx={{ mr: 1, color: '#1976d2' }} />
                        <Typography variant="subtitle1" fontWeight="500">
                        Code: {meeting.meetingCode}
                        </Typography>
                    </Box>
                    <Typography color="text.secondary">
                        Date: {formatDate(meeting.date)}
                    </Typography>
                    </CardContent>
                </Card>
                </Grid>
            ))}
            </Grid>
        ) : (
            <Typography variant="h6" color="text.secondary" textAlign="center" mt={6}>
            No meeting history found.
            </Typography>
        )}
        </Box>
    );
}
