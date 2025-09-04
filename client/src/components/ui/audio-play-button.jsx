import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { generateAudioPlaybackUrl } from '../../store/slices/feedbackSlice';
import { useDispatch } from 'react-redux';

const AudioPlayButton = ({ feedbackId, className = "" }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState(null);
    const [audio, setAudio] = useState(null);
    const dispatch = useDispatch();

    const fetchAudioUrl = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await dispatch(generateAudioPlaybackUrl(feedbackId));

            if (!generateAudioPlaybackUrl.fulfilled.match(response)) {
                throw new Error('Failed to fetch audio URL');
            }

            const data = await response.data;
            setAudioUrl(data.signedUrl);

            // Create audio element
            const newAudio = new Audio(data.signedUrl);
            newAudio.addEventListener('ended', () => setIsPlaying(false));
            newAudio.addEventListener('error', () => {
                setError('Failed to load audio');
                setIsPlaying(false);
            });
            setAudio(newAudio);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching audio URL:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlayPause = async () => {
        if (!audioUrl && !error) {
            await fetchAudioUrl();
            return;
        }

        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            try {
                await audio.play();
                setIsPlaying(true);
            } catch (err) {
                setError('Failed to play audio');
                console.error('Error playing audio:', err);
            }
        }
    };

    if (error) {
        return (
            <button
                className={`p-2 text-red-500 hover:text-red-600 disabled:opacity-50 ${className}`}
                disabled
                title="Audio unavailable"
            >
                <Volume2 className="w-4 h-4" />
            </button>
        );
    }

    return (
        <button
            onClick={togglePlayPause}
            className={`p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50 ${className}`}
            disabled={isLoading}
            title={isPlaying ? "Pause audio" : "Play audio"}
        >
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            ) : isPlaying ? (
                <Pause className="w-4 h-4" />
            ) : (
                <Play className="w-4 h-4" />
            )}
        </button>
    );
};

export default AudioPlayButton;
