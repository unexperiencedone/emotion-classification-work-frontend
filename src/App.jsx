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
      const response = await fetch("https://unexperiencedone-emotion-classifier-host.hf.space/predict", {
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

  const getStyleForWeight = (weight) => {
    if (weight === 0) return {};

    // Positive weight (green)
    if (weight > 0) {
      // Use RGBA to control opacity based on weight
      // Clamp opacity between 0.1 and 1
      const opacity = Math.max(0.1, Math.min(1, weight * 5)); // Increased multiplier
      return {
        backgroundColor: `rgba(0, 200, 0, ${opacity})`,
        color: opacity > 0.6 ? "white" : "black", // Text contrast
      };
    }

    // Negative weight (red)
    if (weight < 0) {
      const opacity = Math.max(0.1, Math.min(1, Math.abs(weight) * 5)); // Increased multiplier
      return {
        backgroundColor: `rgba(255, 0, 0, ${opacity})`,
        color: opacity > 0.6 ? "white" : "black",
      };
    }
  };

  const renderHighlightedText = () => {
    if (!result || !result.explanation) return null;

    // 1. Create a lookup map for word weights
    // We normalize to lowercase for easier matching
    const weightsMap = new Map();
    result.explanation.forEach(([word, weight]) => {
      weightsMap.set(word.toLowerCase(), weight);
    });

    // 2. Split the original text and map over it
    // Using a regex to split on spaces/punctuation and keep them
    const words = result.text.split(/(\s+|[.,!?"'();:])/);

    return words.map((word, index) => {
      // Don't style whitespace or empty strings
      if (!word.trim()) {
        return <span key={index}>{word}</span>;
      }

      const weight = weightsMap.get(word.toLowerCase()) || 0;

      // 3. Get style based on weight
      const style = getStyleForWeight(weight);

      return (
        <span key={index} style={style} className="explanation-word">
          {word}
        </span>
      );
    });
  };

  const getFidelityMessage = (score) => {
    if (score > 0.75) return `High (${(score * 100).toFixed(0)}%)`;
    if (score > 0.5) return `Medium (${(score * 100).toFixed(0)}%)`;
    return `Low (${(score * 100).toFixed(0)}%) - May not be fully accurate.`;
  };

  return (
    <div className=" bg-gray-50 min-h-dvh pt-9 overflow-hidden">
      <div className="flex items-center justify-center ">
        <h1 className="text-4xl font-bold ">Emotion Classification</h1>
      </div>
      <div className="flex flex-row gap-20 items-center justify-center min-h-screen overflow-hidden">
        <div>
          <p className="text-gray-600 mb-6 text-center max-w-lg">
            Welcome! Enter any statement or text below, and our AI will analyze
            its emotional context. Discover the underlying emotions in your
            words - whether it's joy, sadness, anger, fear, surprise, or love.
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
        </div>

        <div>
          {error && (
            <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-white rounded-lg shadow-lg max-w-lg w-full">
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

              {/* <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Explanation</h3>
                <p className="text-sm text-gray-600 mb-3">
                  These words contributed most to the decision.
                  <span className="explanation-key positive">
                    Green words
                  </span>{" "}
                  promoted this emotion, while{" "}
                  <span className="explanation-key negative">red words</span>{" "}
                  went against it.
                </p>
                <div className="highlighted-text">
                  {renderHighlightedText()}
                </div>
              </div> */}

              {result.fidelity_score && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-lg">
                    <span className="font-semibold">
                      Explanation Trust Score (Fidelity):
                    </span>{" "}
                    <span className="text-blue-600">
                      {getFidelityMessage(result.fidelity_score)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
