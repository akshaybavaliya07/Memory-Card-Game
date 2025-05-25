import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState([]);

  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const [won, setWon] = useState(false);

  const [time, setTime] = useState(0);
  const timerRef = useRef(null); // store interval ID

  const handleGridSizeChange = (e) => {
    setGridSize(parseInt(e.target.value));
  };

  const initializeGame = () => {
    const totalCards = gridSize * gridSize;
    const pairCount = Math.floor(totalCards / 2);
    const numbers = [...Array(pairCount).keys()].map((num) => num + 1);
    const shuffledCards = [...numbers, ...numbers]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((number, index) => ({ id: index, number }));

    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setTime(0);
    setWon(false);

    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const checkMatch = (secondId) => {
    const [firstId] = flipped;
    if (cards[firstId].number === cards[secondId].number) {
      setSolved([...solved, firstId, secondId]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  };

  const handleCardClick = (id) => {
    if (disabled || won) return;

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    if (flipped.length === 0) {
      setFlipped([id]);
    }

    if (flipped.length === 1) {
      setDisabled(true);
      if (id !== flipped[0]) {
        setFlipped([...flipped, id]);
        checkMatch(id);
      } else {
        setFlipped([]);
        setDisabled(false);
      }
    }
  };

  const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
  const isSolved = (id) => solved.includes(id);

  useEffect(() => {
    initializeGame();
    return () => {
      clearInterval(timerRef.current);
    };
  }, [gridSize]);

  useEffect(() => {
    if (solved.length === cards.length && cards.length > 0) {
      setWon(true);
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [solved]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-5">Memory Match Game</h1>

      {/* Grid size input */}
      <div className="mb-5">
        <label htmlFor="gridsize" className="mr-2">
          Grid Size
        </label>
        <select
          name="gridsize"
          id="gridsize"
          value={gridSize}
          onChange={handleGridSizeChange}
          className="px-2 py-1 rounded border"
        >
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="6">6</option>
          <option value="8">8</option>
          <option value="10">10</option>
        </select>
      </div>
      
      {/* Timer */}
      <h3 className="mb-5 text-xl text-gray-600 font-medium">
        Time: <span className="font-semibold text-blue-600">{formatTime(time)}</span>
      </h3>

      {/* Game Board */}
      <div
        className="grid gap-2 mb-5"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: `min(100%, ${gridSize * 5.5}rem)`,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square flex items-center justify-center text-xl font-bold rounded-lg 
              cursor-pointer transition-all duration-300 
              ${
                isFlipped(card.id)
                  ? isSolved(card.id)
                    ? "text-white bg-green-500"
                    : "text-white bg-blue-500"
                  : "bg-gray-300 text-gray-500"
              }`}
          >
            {isFlipped(card.id) ? card.number : ""}
          </div>
        ))}
      </div>

      {/* Result */}
      {won && (
        <div className="text-4xl font-bold text-green-600 animate-bounce mt-5">
          You Won! 🎉
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={initializeGame}
        className="px-4 py-2 mt-5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        {won ? "Play Again" : "Reset"}
      </button>
    </div>
  );
}

export default App;