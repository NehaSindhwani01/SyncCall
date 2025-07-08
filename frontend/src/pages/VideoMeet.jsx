import React, { useRef, useState , useEffect} from 'react';
import io from 'socket.io-client';
import {
    Badge,
    IconButton,
    TextField,
    Button,
} from '@mui/material';
import {
    Videocam as VideocamIcon,
    VideocamOff as VideocamOffIcon,
    CallEnd as CallEndIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    ScreenShare as ScreenShareIcon,
    StopScreenShare as StopScreenShareIcon,
    Chat as ChatIcon,
} from '@mui/icons-material';
import styles from '../styles/videoComponent.module.css';
import server from '../environment';
import RemoteVideo from '../components/RemoteVideo';
import axios from 'axios';
import saveToHistory from '../utils/history';


const server_url = server;

let connections = {};

const peerConfigConnections = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export default function VideoMeet() {
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoref = useRef();
    const usernamesRef = useRef({});

    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [showModal, setModal] = useState(true);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState('');
    const [videos, setVideos] = useState([]);
    const [focusedVideo, setFocusedVideo] = useState(null);


    
    useEffect(() => {
        if (askForUsername) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    window.localStream = stream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = stream;
                        localVideoref.current.play().catch((err) => console.error("Play error:", err));
                    }
                })
                .catch((err) => {
                    console.error("Camera access denied in lobby:", err);
                });

            return () => {
                try {
                    const tracks = localVideoref.current?.srcObject?.getTracks();
                    tracks?.forEach((track) => track.stop());
                    if (localVideoref.current) localVideoref.current.srcObject = null;
                    window.localStream = null;
                } catch (err) {
                    console.error("Cleanup error in lobby:", err);
                }
            };
        }
    }, [askForUsername]);
    
    const connect = () => {
        if (!username.trim()) return;
        setAskForUsername(false);

        socketRef.current = io.connect(server_url);

        socketRef.current.on('connect', () => {
        socketIdRef.current = socketRef.current.id;
        usernamesRef.current[socketRef.current.id] = username;

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
            window.localStream = stream;
            if (localVideoref.current) {
                localVideoref.current.srcObject = stream;
                localVideoref.current.play().catch((err) => console.error("Play error:", err));
            }

            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

            setVideos([
                {
                socketId: socketRef.current.id,
                stream,
                username,
                },
            ]);

            const meetingCode = window.location.pathname.split('/').pop();
            socketRef.current.emit('join-call', { path: window.location.href, username });
            saveToHistory(meetingCode)
            })
            .catch((err) => {
            console.error('Media access error:', err);
            alert('Please allow camera and microphone access to join the call.');
            });

        setupSocketListeners();
        });
    };

    const setupSocketListeners = () => {
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('chat-message', addMessage);

        socketRef.current.on('user-left', (id) => {
        setVideos((prev) => prev.filter((v) => v.socketId !== id));
        });

        socketRef.current.on('user-joined', (id, clients, userInfo) => {
        usernamesRef.current = { ...usernamesRef.current, ...userInfo };

        clients.forEach((clientId) => {
            if (!connections[clientId]) {
            connections[clientId] = new RTCPeerConnection(peerConfigConnections);

            connections[clientId].onicecandidate = (e) => {
                if (e.candidate) {
                socketRef.current.emit('signal', clientId, JSON.stringify({ ice: e.candidate }));
                }
            };

            connections[clientId].onaddstream = (e) => {
                const name = usernamesRef.current[clientId] || 'Guest';
                setVideos((prev) => {
                const exists = prev.some((v) => v.socketId === clientId);
                if (!exists) {
                    return [...prev, { socketId: clientId, stream: e.stream, username: name }];
                }
                return prev;
                });
            };

            if (window.localStream) {
                connections[clientId].addStream(window.localStream);
            }
            }
        });

        if (id === socketIdRef.current) {
            for (let otherId in connections) {
            if (otherId === socketIdRef.current) continue;
            connections[otherId].createOffer().then((desc) => {
                connections[otherId].setLocalDescription(desc).then(() => {
                socketRef.current.emit('signal', otherId, JSON.stringify({ sdp: desc }));
                });
            });
            }
        }
        });
    };

    const gotMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
        if (signal.sdp) {
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
            if (signal.sdp.type === 'offer') {
                connections[fromId].createAnswer().then((desc) => {
                connections[fromId].setLocalDescription(desc).then(() => {
                    socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: desc }));
                });
                });
            }
            });
        }
        if (signal.ice) {
            connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice));
        }
        }
    };

    const handleVideo = () => {
        setVideo((prev) => {
        const newVal = !prev;
        const videoTrack = window.localStream?.getVideoTracks()[0];
        if (videoTrack) videoTrack.enabled = newVal;
        return newVal;
        });
    };

    const handleAudio = () => {
        setAudio((prev) => {
        const newVal = !prev;
        const audioTrack = window.localStream?.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = newVal;
        return newVal;
        });
    };

    const handleEndCall = () => {
        try {
        const tracks = localVideoref.current?.srcObject?.getTracks();
        tracks?.forEach((track) => track.stop());

        if (localVideoref.current) localVideoref.current.srcObject = null;
        window.localStream = null;
        } catch (e) {
        console.error('Cleanup error:', e);
        }

        Object.values(connections).forEach((conn) => conn.close());
        connections = {};
        window.location.href = '/';
    };

    const addMessage = (data, sender, senderId) => {
        setMessages((prev) => [...prev, { sender, data }]);
        if (senderId !== socketIdRef.current) setNewMessages((n) => n + 1);
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        socketRef.current.emit('chat-message', message, username, socketRef.current.id);
        setMessage('');
    };

    const startScreenShare = () => {
        navigator.mediaDevices.getDisplayMedia({ video: true }).then((screenStream) => {
            const screenTrack = screenStream.getVideoTracks()[0];

            Object.keys(connections).forEach((id) => {
                const sender = connections[id].getSenders().find((s) => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(screenTrack);
            });

            // Combine screen video with original audio tracks
            const newStream = new MediaStream([
                screenTrack,
                ...window.localStream.getAudioTracks(),
            ]);

            if (localVideoref.current) localVideoref.current.srcObject = newStream;

            screenTrack.onended = () => {
                stopScreenShare();
            };

            window.localStream = newStream;
            setScreen(true);
        }).catch((err) => {
            console.error("Screen sharing permission denied or failed:", err);
            setScreen(false); // Revert state if cancelled
        });
    };

    const stopScreenShare = () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((cameraStream) => {
            const videoTrack = cameraStream.getVideoTracks()[0];

            Object.keys(connections).forEach((id) => {
                const sender = connections[id].getSenders().find((s) => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            });

            if (localVideoref.current) localVideoref.current.srcObject = cameraStream;

            window.localStream = cameraStream;
            setScreen(false);
        }).catch((err) => {
            console.error("Error reverting back to camera after screen sharing:", err);
        });
    };

    const handleScreen = () => {
        if (!screen) {
            startScreenShare();
        } else {
            stopScreenShare();
        }
    };


    return (
        <div className={styles.meetVideoContainer}>
        {askForUsername ? (
            <div className={styles.lobbyContainer}>
            <h2>Enter into Lobby</h2>
            <TextField
                className={styles.lobbyInput}
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                InputProps={{
                style: {
                    backgroundColor: '#fff',
                    borderRadius: 8,
                },
                }}
            />
            <Button className={styles.lobbyButton} variant="contained" onClick={connect}>
                Connect
            </Button>
            <video className={styles.lobbyVideo} ref={localVideoref} autoPlay muted />
            </div>
        ) : (
            <>
            {showModal && (
                <div className={styles.chatRoom}>
                <div className={styles.chatContainer}>
                    <h1>Chat</h1>
                    <div className={styles.chattingDisplay}>
                    {messages.length > 0 ? (
                        messages.map((item, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <p style={{ fontWeight: 'bold' }}>{item.sender}</p>
                            <p>{item.data}</p>
                        </div>
                        ))
                    ) : (
                        <p>No Messages Yet</p>
                    )}
                    </div>
                    <div className={styles.chattingArea}>
                    <TextField
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        label="Enter Your chat"
                        variant="outlined"
                    />
                    <Button variant="contained" onClick={sendMessage}>
                        Send
                    </Button>
                    </div>
                </div>
                </div>
            )}

            <div className={styles.buttonContainers}>
                <IconButton onClick={handleVideo} className={styles.controlButton}>
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>
                <IconButton onClick={handleEndCall} className={`${styles.controlButton} ${styles.endCall}`}>
                <CallEndIcon />
                </IconButton>
                <IconButton onClick={handleAudio} className={styles.controlButton}>
                {audio ? <MicIcon /> : <MicOffIcon />}
                </IconButton>
                {screenAvailable && (
                <IconButton onClick={handleScreen} className={styles.controlButton}>
                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
                )}
                <Badge badgeContent={newMessages} max={999} color="error">
                <IconButton onClick={() => setModal(!showModal)} className={styles.controlButton}>
                    <ChatIcon />
                </IconButton>
                </Badge>
            </div>

            
                <div className={styles.conferenceView}>
                {focusedVideo ? (
                    <div className={styles.focusedVideo} onClick={() => setFocusedVideo(null)}>
                    <RemoteVideo stream={focusedVideo.stream} />
                    <p className={styles.videoUsername}>
                        {focusedVideo.username} {focusedVideo.socketId === socketIdRef.current && '(You)'}
                    </p>
                    </div>
                ) : (
                    videos.map((video) => (
                    <div
                        key={video.socketId}
                        className={styles.remoteVideoBox}
                        onClick={() => setFocusedVideo(video)}
                    >
                        {video.stream ? (
                        <RemoteVideo stream={video.stream} />
                        ) : (
                        <div className={styles.cameraOffBanner}>
                            <p>{video.username} turned off camera</p>
                        </div>
                        )}
                        <p className={styles.videoUsername}>
                        {video.username} {video.socketId === socketIdRef.current && '(You)'}
                        </p>
                    </div>
                    ))
                )}
                </div>

            </>
        )}
        </div>
    );
}
