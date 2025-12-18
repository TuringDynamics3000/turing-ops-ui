import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-zinc-950 relative">
          {/* Background Texture Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
            style={{ 
              backgroundImage: `url('/images/orange-geometric-bg.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
