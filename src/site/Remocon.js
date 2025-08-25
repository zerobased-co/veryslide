import React, { useState, useRef, useEffect } from 'react';
import { withFirebase } from './Firebase';
import './Remocon.scss';

const RemoconPage = ({ firebase }) => {
  const [pinCode, setPinCode] = useState('');
  const [connected, setConnected] = useState(false);
  const [presentationState, setPresentationState] = useState(null);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const presentationRef = useRef(null);

  const connectToPresentation = async () => {
    console.log('Attempting to connect with PIN:', pinCode);

    if (pinCode.length !== 6) {
      console.log('PIN code validation failed - length:', pinCode.length);
      setError('PIN code must be 6 digits');
      return;
    }

    try {
      setError('');
      console.log('Firebase object:', firebase);
      console.log('Starting Firebase listener for PIN:', pinCode);

      // Firebase에서 해당 PIN 코드의 프레젠테이션 상태 확인
      presentationRef.current = firebase.listenToPresentationState(
        pinCode,
        (snapshot) => {
          console.log('Firebase snapshot received:', snapshot);
          const data = snapshot.val();
          console.log('Snapshot data:', data);

          if (data) {
            console.log('Valid presentation data found:', data);
            setPresentationState(data);
            setConnected(true);
            setStartTime(Date.now());
            setError('');
          } else {
            console.log('No presentation data found for PIN:', pinCode);
            setError('Invalid PIN code or presentation not found');
            setConnected(false);
          }
        }
      );
      console.log('Listener setup complete, ref:', presentationRef.current);

      // 5초 후에도 데이터가 없으면 타임아웃 에러
      setTimeout(() => {
        if (!connected && !error) {
          console.log('Connection timeout - no data received');
          setError('Connection timeout. Please check if presentation is active.');
        }
      }, 5000);
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect. Please try again.');
    }
  };

  const disconnect = () => {
    if (presentationRef.current) {
      firebase.stopListening(presentationRef.current);
      presentationRef.current = null;
    }
    setConnected(false);
    setPresentationState(null);
    setPinCode('');
    setStartTime(null);
    setElapsedTime('00:00');
    setError('');
  };

  const sendCommand = async (command) => {
    console.log('Attempting to send command:', command, 'PIN:', pinCode, 'Connected:', connected);

    if (!connected || !pinCode) {
      console.log('Cannot send command - not connected or no PIN');
      return;
    }

    try {
      console.log('Sending command to Firebase:', command);
      await firebase.sendRemoteCommand(pinCode, command);
      console.log('Command sent successfully');
    } catch (err) {
      console.error('Failed to send command:', err);
      setError('Failed to send command');
    }
  };

  const handlePinInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPinCode(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && pinCode.length === 6) {
      connectToPresentation();
    }
  };

  // 타이머 업데이트
  useEffect(() => {
    if (!connected || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setElapsedTime(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [connected, startTime]);

  if (!connected) {
    return (
      <div className="remocon-container">
        <div className="remocon-connect">
          <h1>🎯 VerySlide Remote</h1>
          <p>Enter the 6-digit PIN code displayed on the presentation screen</p>

          <div className="pin-input-container">
            <input
              type="text"
              value={pinCode}
              onChange={handlePinInput}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              className="pin-input"
              maxLength="6"
              autoFocus
            />
            <button
              onClick={connectToPresentation}
              disabled={pinCode.length !== 6}
              className="connect-button"
            >
              Connect
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="remocon-container">
      <div className="remocon-connected">
        {/* 상단 타이머 */}
        <div className="timer-section">
          <div className="timer-display">{elapsedTime}</div>
          <button onClick={disconnect} className="disconnect-button">
            Disconnect
          </button>
        </div>

        {/* 페이지 정보 */}
        {presentationState && (
          <div className="page-info">
            {presentationState.currentPage + 1} / {presentationState.totalPages}
          </div>
        )}

        {/* 하단 컨트롤 버튼 */}
        <div className="control-section">
          <button
            onClick={() => sendCommand('prev')}
            className="control-button prev-button"
            disabled={presentationState?.currentPage === 0}
          >
            ←
          </button>

          <button
            onClick={() => sendCommand('next')}
            className="control-button next-button"
            disabled={presentationState?.currentPage >= presentationState?.totalPages - 1}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default withFirebase(RemoconPage);