import ChatInterface from './components/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            lets create your personalized learning path
          </CardTitle>

        </CardHeader>
        <CardContent>
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}
