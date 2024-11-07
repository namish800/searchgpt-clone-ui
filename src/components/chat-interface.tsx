// Your existing imports
"use client";

import { useState, useEffect, useRef } from "react";
import { Send, PaperclipIcon, ChevronUp, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/sidebar/sidebar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [isQuestionSubmitted, setIsQuestionSubmitted] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [showThoughts, setShowThoughts] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("")

  const eventSourceRef = useRef<EventSource | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsQuestionSubmitted(true);
    setMessages((prevMessages) => [...prevMessages, { role: "user", content: question }]);

    setLoading(true);

    const queryParam = encodeURIComponent(question);
    const url = `http://localhost:8080/stream?query=${queryParam}&session_id=${sessionId}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener("end", (e) => {
      const data = JSON.parse(e.data);
      console.log(data.message);
      eventSource.close();
      setLoading(false);
    });

    eventSource.addEventListener("thoughts", (e) => {
      const data = JSON.parse(e.data);
      console.log("New thought:", data.message);
      setThoughts((prevThoughts) => [...prevThoughts, data.message]);
      setSessionId(data.session_id)
    });

    eventSource.addEventListener("assistant_msg_start", (e) => {
      console.log("New assistant message start");
    
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "" }, // Start with an empty content
      ]);
    });

    eventSource.addEventListener("assistant", (e) => {
      const data = JSON.parse(e.data);
      console.log("Data", data);
      console.log("New assistant message:", data.search_result);
    
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastIndex = updatedMessages.length - 1;
    
        // Check if there's at least one message
        if (lastIndex >= 0) {
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content: updatedMessages[lastIndex].content + data.search_result,
          };
        }
        return updatedMessages;
      });
    });

    eventSource.onerror = (e) => {
      console.error("EventSource failed:", e);
      eventSource.close();
      setLoading(false);
    };

    eventSourceRef.current = eventSource;
    setQuestion("");
  }

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="grid h-screen grid-cols-[240px_1fr] bg-background text-foreground dark">
      <Sidebar />
      <div className="flex flex-col bg-zinc-900 relative overflow-hidden">
        <div className="bg-[radial-gradient(circle_at_30%_30%,_#17171A_0%,_transparent_70%),radial-gradient(circle_at_70%_70%,_#17171A_0%,_transparent_70%)] opacity-50"></div>
        
        <main className="flex-1 overflow-y-auto relative z-10 flex flex-col items-center justify-start p-4">
          {/* Thoughts Section */}
          {thoughts.length > 0 && (
            <div className="w-full max-w-3xl mt-4 mb-4 p-4 bg-gray-800 rounded-lg text-white shadow-lg sticky top-0">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowThoughts(!showThoughts)}
              >
                <span className="font-semibold">Thinking...</span>
                {showThoughts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
              {showThoughts && (
                <div className="mt-2 border-l-4 border-gray-600 pl-4 text-sm text-gray-300">
                  {thoughts.map((msg, index) => (
                    <div key={index}>{msg}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Messages */}
          {isQuestionSubmitted && (
            <div className="w-full max-w-3xl mt-4 flex-1">
              {messages.map((msg, index) => (
                <div key={index} className={`my-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-2 rounded-lg ${msg.role === "user" ? "bg-blue-600 text-white" : "w-full text-white"}`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown rehypePlugins={[rehypeHighlight]} className="prose prose-invert">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="my-2 text-left">
                  <div className="inline-block p-2 rounded-lg bg-gray-700 text-white">Typing...</div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Conditional Form and Message Rendering */}
        {!isQuestionSubmitted ? (
          // Centered layout with title and input form when question is not submitted
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground text-center">
              What would you like to know?
            </h1>
            <form className="w-full flex justify-center z-20" onSubmit={handleSubmit}>
              <div className="flex gap-2 justify-center items-center">
                <Input
                  className="w-[500px] bg-zinc-800 text-foreground px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ask Anything..."
                  value={question}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                />
                <Button type="submit" size="icon" variant="ghost" className="hover:bg-zinc-700">
                  <Send className="h-4 w-4 text-gray-300" />
                </Button>
                <Button size="icon" variant="ghost" className="hover:bg-zinc-700">
                  <PaperclipIcon className="h-4 w-4 text-gray-300" />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Sticky input form at the bottom when question is submitted
          <form
            className="sticky bottom-0 w-full flex justify-center bg-zinc-900 py-2 transition-all duration-300 z-20"
            onSubmit={handleSubmit}
          >
            <div className="flex gap-2 justify-center items-center">
              <Input
                className="w-[500px] bg-zinc-800 text-foreground px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ask a Follow-up question"
                value={question}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
              />
              <Button type="submit" size="icon" variant="ghost" className="hover:bg-zinc-700">
                <Send className="h-4 w-4 text-gray-300" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:bg-zinc-700">
                <PaperclipIcon className="h-4 w-4 text-gray-300" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>

  );
}
