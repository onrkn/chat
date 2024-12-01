import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../lib/socket';
import { useSocket } from '../hooks/useSocket';
import { Message, User } from '../types';
import { Send, Coins } from 'lucide-react';
import CoinFlip from './CoinFlip';
import toast from 'react-hot-toast';

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (!userId || !username || !roomId) {
    navigate('/');
    return null;
  }

  const { sendMessage, playGame } = useSocket(roomId, userId, username);

  useEffect(() => {
    socket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('users_update', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    socket.on('user_left', (leftUserId: string) => {
      setUsers(prev => prev.filter(user => user.id !== leftUserId));
    });

    return () => {
      socket.off('message');
      socket.off('users_update');
      socket.off('user_left');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold">Chat Room: {roomId}</h1>
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1 p-4 overflow-auto flex flex-col space-y-4">
          <div className="flex-1 overflow-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.userId === userId
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.userId === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  <p className="text-sm font-semibold">{message.username}</p>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
        
        <div className="w-80 bg-gray-50 p-4 border-l">
          <CoinFlip playGame={playGame} />
          <div className="mt-4">
            <h3 className="font-bold mb-2">Users in Room</h3>
            {users.map((user) => (
              <div key={user.id} className="flex justify-between items-center py-2">
                <span>{user.username}</span>
                <span className="flex items-center">
                  <Coins className="w-4 h-4 mr-1" />
                  {user.balance}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}