import React, { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!userId || !username || !roomId) {
      navigate('/');
      return;
    }
  }, [userId, username, roomId, navigate]);

  const { sendMessage, playGame } = useSocket(roomId!, userId!, username!);

  useEffect(() => {
    const handleMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUsersUpdate = (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    };

    const handleUserLeft = (leftUserId: string) => {
      setUsers(prev => prev.filter(user => user.id !== leftUserId));
      toast.info('A user has left the room');
    };

    socket.on('message', handleMessage);
    socket.on('users_update', handleUsersUpdate);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.off('message', handleMessage);
      socket.off('users_update', handleUsersUpdate);
      socket.off('user_left', handleUserLeft);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };

  if (!userId || !username || !roomId) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold">Chat Room: {roomId}</h1>
        <p className="text-sm text-gray-600">Connected users: {users.length}</p>
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                  className={`inline-block p-2 rounded-lg max-w-[80%] ${
                    message.userId === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  <p className="text-sm font-semibold">{message.username}</p>
                  <p className="break-words">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
        
        <div className="w-80 bg-gray-50 p-4 border-l">
          <CoinFlip playGame={playGame} />
          <div className="mt-4">
            <h3 className="font-bold mb-2">Users in Room</h3>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                  <span className="font-medium">{user.username}</span>
                  <span className="flex items-center text-yellow-600">
                    <Coins className="w-4 h-4 mr-1" />
                    {user.balance}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}