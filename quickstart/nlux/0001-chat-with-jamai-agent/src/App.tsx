import React, { useEffect, useState, createContext } from 'react';
import { AiChat } from '@nlux/react';
import '@nlux/themes/nova.css';
import { createStreamAdapter } from './adapter'
import { user, assistantAvatar } from './personas';
import { v4 as uuid4v } from 'uuid';
import JamAI from 'jamaibase'; // Assuming JamAI is imported from a library

const baseURL = "https://api.jamaibase.com";
const apiKey = "";
const projectId = "";
const agentId = "first-chatbot";

export const App = () => {
  const [jamaiInstance, setJamaiInstance] = useState(null);
  const [newTableId, setNewTableId] = useState('');
  const [apiKeyInstance, setApiKey] = useState('');
  const [baseURLInstance, setBaseURL] = useState('');
  const [projectIdInstance, setProjectId] = useState('');

  useEffect(() => {
    const initializeJamai = async () => {
      const jamai = new JamAI({
        baseURL: baseURL,
        apiKey: apiKey,
        projectId: projectId,
        dangerouslyAllowBrowser: true
      });

      const new_table_id = `${agentId}-conv-${uuid4v()}`;

      await jamai.duplicateTable({
        table_id_src: agentId,
        table_type: "chat",
        table_id_dst: new_table_id,
        include_data: false,
        deploy: true
      });

      setJamaiInstance(jamai);
      setApiKey(apiKey);
      setBaseURL(baseURL);
      setProjectId(projectId);
      setNewTableId(new_table_id);
    };

    initializeJamai();
  }, []);
  
  const streamAdapter = createStreamAdapter(jamaiInstance, newTableId, baseURLInstance, apiKeyInstance, projectIdInstance);

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