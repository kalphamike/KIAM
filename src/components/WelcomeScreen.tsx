import { useState } from "react";
import { MessageCircle } from "lucide-react";

interface WelcomeScreenProps {
  onEnter: (name: string) => void;
}

const WelcomeScreen = ({ onEnter }: WelcomeScreenProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onEnter(name.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary">
      <div className="fade-in mx-4 w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/20">
            <MessageCircle className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-primary-foreground">
          Hi — welcome to my portfolio
        </h1>
        <p className="mb-8 text-lg text-primary-foreground/80">
          Enter your name to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            aria-label="Your name"
            className="w-full rounded-lg border-0 bg-primary-foreground/20 px-4 py-3 text-lg text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full rounded-lg bg-primary-foreground px-6 py-3 text-lg font-semibold text-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Start Chatting
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;
