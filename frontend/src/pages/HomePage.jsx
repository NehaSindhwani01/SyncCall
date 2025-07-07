import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    IconButton,
    TextField,
    Box,
    Grid,
    Typography,
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/AuthContext';
import '@fontsource/poppins';

function HomePage() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState('');
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            alert("Please enter a valid meeting code");
            return;
        }

        try {
            await addToUserHistory(meetingCode.trim());
            navigate(`/${meetingCode.trim()}`);
        } catch (e) {
            const errMsg = e.response?.data?.message || e.message;
            console.error("Failed to join meeting:", errMsg);
            alert("Failed to join meeting: " + errMsg);
        }

    };


    return (
        <Grid
            container
            sx={{
                height: '100vh',
                width: '100vw',
                fontFamily: 'Poppins, sans-serif',
                overflow: 'hidden',
                flexDirection: { xs: 'column', md: 'row' },
            }}
        >
            {/* Left Panel */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    backgroundColor: '#0f172a',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    px: { xs: 4, sm: 8 },
                    py: { xs: 6, md: 0 },
                    height: { xs: '50vh', md: '100vh' },
                    textAlign: { xs: 'center', md: 'left' },
                }}
            >
                <Box sx={{ width: '100%' }}>
                    <Typography variant="h3" fontWeight={600} gutterBottom>
                        Sync<span style={{ color: '#FF9839' }}>Call</span>
                    </Typography>

                    <Typography variant="h5" sx={{ mb: 4, fontWeight: 400 }}>
                        Providing Quality Video Call Just Like Quality Education.
                    </Typography>

                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        gap={2}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        <TextField
                            label="Enter Meeting Code"
                            variant="outlined"
                            fullWidth
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                            sx={{
                                input: { backgroundColor: 'white', borderRadius: 1 },
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleJoinVideoCall}
                            sx={{
                                px: 4,
                                bgcolor: '#FF9839',
                                color: 'white',
                                fontWeight: 600,
                                width: { xs: '100%', sm: 'auto' },
                                '&:hover': {
                                    bgcolor: '#fb923c',
                                },
                            }}
                        >
                            Join
                        </Button>
                    </Box>
                </Box>
            </Grid>

            {/* Right Panel */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    position: 'relative',
                    backgroundColor: '#f1f5f9',
                    height: { xs: '50vh', md: '100vh' },
                    overflow: 'hidden',
                }}
            >
                {/* Background Image Box */}
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 4,
                    }}
                >
                    <Box
                        component="img"
                        src="/logo3.png"
                        alt="SyncCall Visual"
                        sx={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                {/* Top Right Navigation */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: 30,
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        zIndex: 2,
                        backgroundColor: 'rgba(241,245,249,0.9)',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: 1,
                        maxWidth: { xs: '90%', sm: 'auto' },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                            onClick={() => navigate('/history')}
                            sx={{ color: '#0f172a', p: 0.5 }}
                        >
                            <RestoreIcon />
                        </IconButton>
                        <Typography variant="body1" fontWeight={500}>
                            History
                        </Typography>
                    </Box>
                    <Button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/auth');
                        }}
                        startIcon={<LogoutIcon />}
                        sx={{
                            bgcolor: '#ef4444',
                            color: 'white',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            '&:hover': {
                                bgcolor: '#dc2626',
                            },
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Grid>
        </Grid>
    );
}

export default withAuth(HomePage);
