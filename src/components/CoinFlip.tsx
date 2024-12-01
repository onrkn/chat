import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import toast from 'react-hot-toast';

interface CoinFlipProps {
  playGame: (bet: number) => Promise<{ won: boolean; newBalance: number }>;
}

export default function CoinFlip({ playGame }: CoinFlipProps) {
  const [bet, setBet] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlip = async () => {
    if (isFlipping) return;
    
    try {
      setIsFlipping(true);
      const { won, newBalance } = await playGame(bet);
      
      toast.success(
        won 
          ? `You won ${bet} coins! New balance: ${newBalance}`
          : `You lost ${bet} coins. New balance: ${newBalance}`
      );
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsFlipping(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Coin Flip Game</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <input
          type="number"
          min="1"
          max="10"
          value={bet}
          onChange={(e) => setBet(Math.min(10, Math.max(1, Number(e.target.value))))}
          className="w-20 p-2 border rounded"
        />
        
        <button
          onClick={handleFlip}
          disabled={isFlipping}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            isFlipping
              ? 'bg-gray-300'
              : 'bg-yellow-500 hover:bg-yellow-600'
          } text-white`}
        >
          <Coins className="w-5 h-5" />
          {isFlipping ? 'Flipping...' : 'Flip!'}
        </button>
      </div>
      
      <p className="text-sm text-gray-600">
        Bet 1-10 coins. Win double your bet!
      </p>
    </div>
  );
}