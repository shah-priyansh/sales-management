import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { generateAudioPlaybackUrl } from '../../store/slices/feedbackSlice';
import { useDispatch } from 'react-redux';
import audioManager from '../../utils/audioManager';

const AudioPlayButton = ({ feedbackId, className = "" }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState(null);
    const [audio, setAudio] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAudioState = () => {
            const isCurrentlyPlaying = audioManager.isPlaying(feedbackId);
            setIsPlaying(isCurrentlyPlaying);
        };

        const interval = setInterval(checkAudioState, 100);

        checkAudioState();

        return () => clearInterval(interval);
    }, [feedbackId]);

    const fetchAudioUrl = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await dispatch(generateAudioPlaybackUrl(feedbackId));

            if (!generateAudioPlaybackUrl.fulfilled.match(response)) {
                throw new Error('Failed to fetch audio URL');
            }

            const data = response.payload;

            const url = new URL(data.signedUrl);
            const amzDate = url.searchParams.get('X-Amz-Date');
            const expires = url.searchParams.get('X-Amz-Expires');

            if (amzDate && expires) {
                const urlDate = new Date(amzDate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z'));
                const expirationTime = new Date(urlDate.getTime() + parseInt(expires) * 1000);
                const now = new Date();


                if (now > expirationTime) {
                    setError('Audio URL has expired - please try again');
                    return;
                }
            }

            setAudioUrl(data.signedUrl);

            const newAudio = new Audio();
            newAudio.crossOrigin = 'anonymous';
            newAudio.preload = 'metadata';

            newAudio.addEventListener('loadstart', () => {
                setIsLoading(true);
            });

            newAudio.addEventListener('loadedmetadata', () => {
                setIsLoading(false);
            });

            newAudio.addEventListener('loadeddata', () => {
                setIsLoading(false);
            });

            newAudio.addEventListener('canplay', () => {
                setIsLoading(false);
            });

            newAudio.addEventListener('canplaythrough', () => {
                setIsLoading(false);
            });

            newAudio.addEventListener('play', () => {
                setIsLoading(false);
                setIsPlaying(true);
            });

            newAudio.addEventListener('pause', () => {
                setIsLoading(false);
                setIsPlaying(false);
            });

            newAudio.addEventListener('ended', () => {
                setIsLoading(false);
                setIsPlaying(false);
            });

            newAudio.addEventListener('waiting', () => {
                setIsLoading(true);
            });

            newAudio.addEventListener('playing', () => {
                setIsLoading(false);
                setIsPlaying(true);
            });

            newAudio.addEventListener('error', (e) => {

                setIsLoading(false);

                let errorMessage = 'Failed to load audio';
                if (newAudio.error?.code === 4) {
                    errorMessage = 'Audio format not supported';
                } else if (newAudio.error?.code === 3) {
                    errorMessage = 'Audio decode error';
                } else if (newAudio.error?.code === 2) {
                    errorMessage = 'Network error - audio URL may have expired';
                }

                setError(errorMessage);
                setIsPlaying(false);
            });

            newAudio.addEventListener('stalled', () => {
            });

            newAudio.addEventListener('suspend', () => {
            });

            newAudio.src = data.signedUrl;
            setAudio(newAudio);

            audioManager.setCurrentAudio(newAudio, feedbackId);

            newAudio.load();

            setTimeout(() => {
            }, 100);

            const autoPlayWhenReady = () => {
                audioManager.stopCurrentAudio();
                newAudio.play().then(() => {
                    setIsPlaying(true);
                    audioManager.setCurrentAudio(newAudio, feedbackId);
                }).catch(err => {
                    setIsPlaying(false);
                });
            };

            newAudio.addEventListener('canplay', autoPlayWhenReady, { once: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlayPause = async () => {

        if (!audioUrl && !error) {
            await fetchAudioUrl();
            return;
        }

        if (error && error.includes('expired')) {
            await fetchAudioUrl();
            return;
        }

        if (!audio) {
            return;
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audioManager.stopCurrentAudio();
            try {

                if (audio.readyState >= 2) {

                    if (audio.ended) {
                        audio.currentTime = 0;
                    }

                    await audio.play();
                    setIsPlaying(true);
                    audioManager.setCurrentAudio(audio, feedbackId);
                } else {

                    const playWhenReady = () => {
                        audio.play().then(() => {
                        }).catch(playErr => {
                            setError('Failed to play audio: ' + playErr.message);
                        });
                    };

                    audio.addEventListener('canplay', playWhenReady, { once: true });

                    if (audio.networkState === 0) {
                        audio.load();
                    }
                }
            } catch (err) {
                setError('Failed to play audio: ' + err.message);
                setIsPlaying(false);
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
