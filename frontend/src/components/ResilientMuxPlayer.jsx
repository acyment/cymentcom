import React, { useState, useRef, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';

const MAX_RETRIES = 3;

function ResilientMuxPlayer({ playbackId, ...props }) {
  // retryCount is used both for tracking the number of retries and to force a remount of the player via the key prop.
  const [retryCount, setRetryCount] = useState(0);
  const playerRef = useRef(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleError = (event) => {
      console.error('ResilientMuxPlayer encountered an error:', event);

      // Check if we still have retries left
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);

        // If the mux-player supports the load() method, we can use it to trigger a reload.
        if (typeof player.load === 'function') {
          console.log('Retrying by calling player.load()...');
          player.load();
        } else {
          // If not, forcing a remount via key change can help reset the player's state.
          console.log('Forcing component remount to retry mux-player...');
        }
      } else {
        console.error(
          'Maximum retries reached. No further attempts will be made.',
        );
        // Optionally, you can add user notifications or other fallback actions here.
      }
    };

    // Listen for error events on the mux-player element
    player.addEventListener('error', handleError);
    return () => player.removeEventListener('error', handleError);
  }, [retryCount]);

  return (
    // Changing the key based on retryCount forces a remount of the mux-player on error.
    <MuxPlayer
      key={retryCount}
      ref={playerRef}
      playbackId={playbackId}
      crossorigin
      {...(process.env.NODE_ENV === 'development'
        ? { 'disable-tracking': '' }
        : {})}
      controls
      {...props}
    />
  );
}

export default ResilientMuxPlayer;
