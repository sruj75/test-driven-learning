'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoadmap } from '../services/ai';
import { useRoadmap } from '../contexts/RoadmapContext';
import { Button } from './ui/Button';
import { LoadingDots } from './ui/LoadingDots';

type MessageRole = 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
}

// We'll remove the fixed MIN_MESSAGES constant and make the experience more dynamic
// const MIN_MESSAGES_FOR_ROADMAP = 4; 

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {role: 'assistant', content: 'Hey there! What are you interested in learning these days?'}
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // Rename this to better reflect its purpose - showing the roadmap button, not claiming readiness
  const [showRoadmapOption, setShowRoadmapOption] = useState(false);
  const { setRoadmap } = useRoadmap();
  const router = useRouter();

  // Simply show roadmap option after minimal conversation
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    
    // Show the option after the first user message
    if (userMessages.length >= 1 && !showRoadmapOption) {
      setShowRoadmapOption(true);
    }
  }, [messages, showRoadmapOption]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const newMessages: Message[] = [...messages, {role: 'user', content: input}];
    setMessages(newMessages);
    setInput('');
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
    <div className="flex flex-col space-y-4">
      <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto p-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[80%] p-4 rounded-lg
                ${message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
                }
              `}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4">
              <LoadingDots />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Type your message..."
            className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isGenerating}
          />
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={isGenerating || !input.trim()}
          variant="default"
        >
          Send
        </Button>
        {showRoadmapOption && (
          <Button
            onClick={handleGenerateRoadmap}
            disabled={isGenerating}
            variant="secondary"
            className="whitespace-nowrap"
          >
            Create Learning Path
          </Button>
        )}
      </div>
      
      {showRoadmapOption && (
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          The more you tell me about your goals and experience, the more personalized your learning path will be.
        </div>
      )}
    </div>
  );
} 