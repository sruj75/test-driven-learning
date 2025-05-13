import ChatInterface from './components/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Welcome to Test-Driven Learning
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Tell me what you want to learn, and I&apos;ll create a personalized learning path for you.
          </p>
        </CardHeader>
        <CardContent>
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}
