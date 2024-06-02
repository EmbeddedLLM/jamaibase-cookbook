import React, { useEffect, useState, createContext } from 'react';
import { AiChat } from '@nlux/react';
import '@nlux/themes/nova.css';
import { createStreamAdapter } from './adapter'
import { user, assistantAvatar } from './personas';

export const App = () => {
  const [newTableId, setNewTableId] = useState('');

  useEffect(() => {
    const initializeJamai = async () => {

      const response = await fetch('http://localhost:8080/new-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: "",
      });

      if (!response.body) {
        return;
      }
      const response_json = await response.json();
      const new_table_id = response_json['table_id'];
      
      console.log(new_table_id);

      setNewTableId(new_table_id);
    };

    initializeJamai();
  }, []);
  
  const streamAdapter = createStreamAdapter(newTableId);

  return (
    <AiChat
      adapter={streamAdapter}
      personaOptions={{
        assistant: {
          name: 'JamJam',
          tagline: 'Your Friendly AI Assistant',
          avatar: assistantAvatar
        },
        user
      }}
      composerOptions={{ placeholder: 'How can I help you?' }}
      displayOptions={{ height: 350, maxWidth: 430, colorScheme: '${colorScheme}' }}
    />
  );
};

export default App;