import React, { useRef, useEffect } from 'react';
import styles from '../styles/videoComponent.module.css';

export default function RemoteVideo({ stream }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.remoteVideo}
        />
    );
}
