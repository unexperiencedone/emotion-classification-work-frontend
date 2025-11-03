import { useState } from "react";

function App() {
  const emotionEmojis = {
    joy: "😊",
    sadness: "😢",
    anger: "😠",
    fear: "😨",
    surprise: "😲",
    love: "🥰",
  };

  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function postText() {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setText("");
    }
  }

  return (
    <div className=" bg-gray-50 min-h-screen pt-9">
      <div className="flex items-center justify-center ">
        <h1 className="text-4xl font-bold ">Emotion Classification</h1>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-600 mb-6 text-center max-w-lg">
          Welcome! Enter any statement or text below, and our AI will analyze
          its emotional context. Discover the underlying emotions in your words
          - whether it's joy, sadness, anger, fear, surprise, or love.
        </p>
        <textarea
          className="
          w-full max-w-lg p-4 border border-gray-300 rounded-lg shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          resize-none
        "
          onChange={(e) => {
            setText(e.target.value);
          }}
          value={text}
          rows="6"
          placeholder="Enter text for emotion analysis..."
        ></textarea>
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 disabled:bg-blue-300"
          onClick={postText}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit"}
        </button>

        {error && (
          <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Analysis Result</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-gray-700 italic">"{result.text}"</p>
            </div>
            <p className="mb-2 text-2xl">
              <span className="font-semibold">Detected Emotion:</span>{" "}
              <span className="text-blue-600">
                {result.emotion} {emotionEmojis[result.emotion]}
              </span>
            </p>
            <p>
              <span className="font-semibold">Confidence:</span>{" "}
              <span className="text-blue-600">
                {(result.confidence * 100).toFixed(2)}%
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
