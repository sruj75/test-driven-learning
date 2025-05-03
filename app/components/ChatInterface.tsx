'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoadmap } from '../services/ai';
import { useRoadmap } from '../contexts/RoadmapContext';

type MessageRole = 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {role: 'assistant', content: 'what do you want to learn?'}
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { setRoadmap } = useRoadmap();
  const router = useRouter();

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessages: Message[] = [...messages, {role: 'user' as MessageRole, content: input}];
    setMessages(newMessages);
    setInput('');
    
    // Show loader
    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        console.error('Chat API error:', data.error || res.status);
      }
    } catch (err) {
      console.error('Error during chat:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (messages.length === 0) return;
    setIsGenerating(true);
    try {
      // Only include user messages for the roadmap initial goal
      const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => m.content);
      const roadmapData = await generateRoadmap(userMessages);
      setRoadmap(roadmapData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-[600px] border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`${message.role === 'user' ? 'ml-auto bg-blue-100' : 'mr-auto bg-gray-100'} rounded-lg p-3 max-w-[80%]`}>
            {message.content}
          </div>
        ))}
        {isGenerating && (
          <div className="mr-auto bg-gray-100 rounded-lg p-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t p-4 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          disabled={isGenerating}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          Send
        </button>
        <button
          onClick={handleGenerateRoadmap}
          disabled={isGenerating || messages.length === 0}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Generate Roadmap
        </button>
      </div>
    </div>
  );
} 