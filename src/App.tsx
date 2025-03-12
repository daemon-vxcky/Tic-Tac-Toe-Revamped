import React, { useState, useEffect } from 'react';
import { X, Circle, RefreshCw, Trophy, Cpu, User } from 'lucide-react';

type Player = 'X' | 'O';
type Board = (Player | null)[];
type GameMode = 'pvp' | 'ai';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [modeSelected, setModeSelected] = useState(false);

  const rules = [
    "Welcome to Tactical Tic-Tac-toe, soldier.",
    "Your objective: Create a line of three identical symbols - horizontally, vertically, or diagonally.",
    "X moves first, followed by O. Choose your positions strategically.",
    "You can challenge another operator or face our advanced AI system.",
    "Remember: Victory comes to those who think ahead. Good luck, operator."
  ];

  useEffect(() => {
    if (showIntro && introStep < rules.length) {
      const timer = setTimeout(() => {
        setIntroStep(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showIntro, introStep]);

  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(makeAIMove, 750);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode]);

  const checkWinner = (boardState: Board): void => {
    for (const combo of WINNING_COMBINATIONS) {
      if (
        boardState[combo[0]] &&
        boardState[combo[0]] === boardState[combo[1]] &&
        boardState[combo[0]] === boardState[combo[2]]
      ) {
        setWinner(boardState[combo[0]] as Player);
        setWinningLine(combo);
        return;
      }
    }
    if (!boardState.includes(null)) {
      setWinner('DRAW');
    }
  };

  const makeAIMove = () => {
    const availableMoves = board.reduce((acc: number[], cell, index) => {
      if (cell === null) acc.push(index);
      return acc;
    }, []);

    if (availableMoves.length === 0) return;

    // Check for winning move
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = 'O';
      if (checkWinningMove(testBoard, 'O')) {
        handleMove(move);
        return;
      }
    }

    // Block player's winning move
    for (const move of availableMoves) {
      const testBoard = [...board];
      testBoard[move] = 'X';
      if (checkWinningMove(testBoard, 'X')) {
        handleMove(move);
        return;
      }
    }

    // Take center if available
    if (board[4] === null) {
      handleMove(4);
      return;
    }

    // Take a random corner or side
    const corners = [0, 2, 6, 8].filter(i => availableMoves.includes(i));
    if (corners.length > 0) {
      handleMove(corners[Math.floor(Math.random() * corners.length)]);
      return;
    }

    // Take any available move
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    handleMove(randomMove);
  };

  const checkWinningMove = (boardState: Board, player: Player): boolean => {
    return WINNING_COMBINATIONS.some(combo => 
      boardState[combo[0]] === player &&
      boardState[combo[1]] === player &&
      boardState[combo[2]] === player
    );
  };

  const handleMove = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    checkWinner(newBoard);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine(null);
  };

  if (showIntro && introStep < rules.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full flex gap-8 items-center">
          <img 
            src="https://i.pinimg.com/564x/61/6e/6a/616e6a730fcabc5a195af55f894fb7ce.jpg"
            alt="Simon Ghost Riley"
            className="w-48 h-48 object-cover rounded-lg border-2 border-green-500 animate-fadeIn"
          />
          <div className="text-green-500 font-mono flex-1 p-8 border-2 border-green-500 rounded-lg animate-pulse">
            <p className="typing-effect">{rules[introStep]}</p>
          </div>
        </div>
      </div>
    );
  }

  if (showIntro && introStep >= rules.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-green-500 text-2xl mb-8">Choose Your Operation Mode</h2>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setGameMode('pvp');
                setModeSelected(true);
                setShowIntro(false);
              }}
              className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <User className="w-5 h-5" />
              PvP Combat
            </button>
            <button
              onClick={() => {
                setGameMode('ai');
                setModeSelected(true);
                setShowIntro(false);
              }}
              className="flex items-center gap-2 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
            >
              <Cpu className="w-5 h-5" />
              Challenge AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-green-500 mb-4">Tactical Tic-Tac-toe</h1>
        {!winner && (
          <p className="text-green-400">
            Current Operator: {currentPlayer === 'X' ? 'You (X)' : gameMode === 'ai' ? 'AI (O)' : 'Player O'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleMove(index)}
            className={`w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 
              ${!cell && !winner && (gameMode === 'pvp' || currentPlayer === 'X') ? 'hover:bg-gray-700' : ''} 
              ${winningLine?.includes(index) ? 'bg-green-900' : ''}`}
            disabled={!!winner || !!cell || (gameMode === 'ai' && currentPlayer === 'O')}
          >
            {cell === 'X' && <X className="w-12 h-12 text-blue-400 animate-appear" />}
            {cell === 'O' && <Circle className="w-12 h-12 text-red-400 animate-appear" />}
          </button>
        ))}
      </div>

      {winner && (
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex items-center justify-center gap-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-green-500">
              {winner === 'DRAW' 
                ? 'Mission Stalemate' 
                : gameMode === 'ai' 
                  ? `${winner === 'X' ? 'Mission Accomplished' : 'AI Victorious'}`
                  : `Operator ${winner} Victorious`}
            </h2>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
        >
          <RefreshCw className="w-5 h-5" />
          New Mission
        </button>
        <button
          onClick={() => {
            setShowIntro(true);
            setIntroStep(rules.length);
            resetGame();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
        >
          Change Mode
        </button>
      </div>
    </div>
  );
}

export default App;