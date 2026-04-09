import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export function TokenGate({ children }) {
  const { token, setToken } = useStore();
  const [input, setInput] = useState('');
  const [showGate, setShowGate] = useState(!token);

  const handleConnect = () => {
    setToken(input);
    setShowGate(false);
  };

  const handlePublic = () => {
    setToken(''); // Use empty token for public access
    setShowGate(false);
  };

  if (!showGate) return children;

  return (
    <div className="token-gate">
      <div className="gate-card">
        <div className="gate-icon">🔐</div>
        <h1>Connect to Repository</h1>
        <p>Please enter your GitHub Personal Access Token (PAT) for higher rate limits and private access.</p>
        
        <input 
          type="password" 
          placeholder="ghp_xxxxxxxxxxxx" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="gate-input"
        />

        <div className="gate-actions">
          <button onClick={handleConnect} className="btn-primary">Connect</button>
          <button onClick={handlePublic} className="btn-secondary">View Publicly</button>
        </div>
        
        <div className="gate-footer">
          <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
            Create a token here
          </a>
        </div>
      </div>
    </div>
  );
}