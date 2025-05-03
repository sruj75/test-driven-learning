import Image from 'next/image';
import logo from './hyper mind project.png';
import ChatInterface from './components/ChatInterface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      {/* Logo at top */}
      <div className="mb-6 flex justify-center">
        <Image src={logo} alt="Hyper Mind Project Logo" width={150} height={150} />
      </div>
      <h1 className="text-3xl font-bold mb-6">HYPER-MIND PROJECT</h1>
      <ChatInterface />
    </main>
  );
}
