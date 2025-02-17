import { useState, ChangeEvent, FormEvent } from 'react';
import { NewspaperIcon, ArrowRightIcon, AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSummary('');
    
    if (!url || !isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL || 'https://polyester-polar-throat.glitch.me/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      setSummary(data.summary);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to generate summary. Please try again.';
    setError(errorMessage);
    console.error('Error:', error);
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <NewspaperIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Article Summarizer
          </h1>
          <p className="text-lg text-gray-600">
            Transform lengthy articles into clear, concise summaries
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Article URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Summarize
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 flex items-start p-4 rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <p className="ml-3 text-sm text-red-600">{error}</p>
            </div>
          )}

          {summary && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
              </div>
            </div>
          )}

          {/* How It Works Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How it works</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "1. Input URL",
                  content: "Paste the URL of any English news article"
                },
                {
                  title: "2. Process",
                  content: "AI analyzes content and extracts key points"
                },
                {
                  title: "3. Summary",
                  content: "Receive a concise summary in seconds"
                }
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-lg bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;