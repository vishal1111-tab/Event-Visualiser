
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventLoopVisualizer from "../components/EventLoopVisualizer";
import { Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">JavaScript Event Loop Visualizer</h1>
          <p className="text-gray-600 mt-2">
            Visualize how JavaScript's event loop processes code execution, call stack, and task queues
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="visualizer" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
            <TabsTrigger value="about">How It Works</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualizer" className="mt-0">
            <EventLoopVisualizer />
          </TabsContent>
          
          <TabsContent value="about" className="mt-0">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">JavaScript's Event Loop Explained</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Call Stack</h3>
                  <p>The call stack is where JavaScript keeps track of function calls. It follows the Last In, First Out (LIFO) principle. When a function is executed, it's added to the stack. When a function returns, it's removed from the stack.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Microtask Queue</h3>
                  <p>Microtasks are usually created by promises (Promise.then, Promise.catch, Promise.finally) and process.nextTick. They are executed after the current task completes and before the next task in the macrotask queue.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Macrotask Queue</h3>
                  <p>Macrotasks include setTimeout, setInterval, setImmediate, requestAnimationFrame, and I/O operations. These are processed one at a time from the queue after all microtasks are completed.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Event Loop Process</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Execute all tasks in the call stack</li>
                    <li>Once the call stack is empty, execute all microtasks</li>
                    <li>Render any pending UI updates</li>
                    <li>If there are macrotasks, pick the oldest and go to step 1</li>
                    <li>Wait for new tasks</li>
                  </ol>
                </div>
                
                <div className="bg-gray-50 p-4 rounded border mt-6">
                  <h3 className="text-lg font-semibold mb-2">Technology Stack</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">React</h4>
                      <p className="text-sm">Powers the user interface and component architecture of the application.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">TypeScript</h4>
                      <p className="text-sm">Provides static typing to ensure code robustness and better developer experience.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Tailwind CSS</h4>
                      <p className="text-sm">Handles styling with utility-first CSS framework for rapid UI development.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Shadcn UI</h4>
                      <p className="text-sm">Offers accessible, customizable UI components like cards, tabs, and buttons.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">JavaScript Execution Engine</h4>
                      <p className="text-sm">Safe JavaScript execution environment that instruments code to visualize event loop mechanics.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded border mt-4">
                  <h3 className="text-md font-semibold mb-2">Component Architecture</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">EventLoopVisualizer:</span> Main component coordinating the simulation of the JavaScript event loop.</p>
                    <p><span className="font-semibold">CodeEditor:</span> Allows users to input and edit JavaScript code examples.</p>
                    <p><span className="font-semibold">CallStack:</span> Visualizes the current execution context and function calls.</p>
                    <p><span className="font-semibold">TaskQueue:</span> Displays pending microtasks and macrotasks waiting to be processed.</p>
                    <p><span className="font-semibold">EventLoopSimulator:</span> Service that executes JavaScript code and tracks event loop operations.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded border mt-4">
                  <h3 className="text-md font-semibold mb-2">How Code Execution Works</h3>
                  <p className="text-sm">This visualizer executes JavaScript code in a controlled environment that intercepts and monitors call stack operations, Promise chains, and timer functions. It safely runs your code while capturing how the JavaScript event loop processes execution contexts, microtasks, and macrotasks in real-time.</p>
                  <div className="mt-2 text-sm text-amber-600">
                    Note: For security reasons, some JavaScript features like DOM manipulation and certain built-in methods are restricted.
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-2 gap-1 text-sm text-muted-foreground">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-destructive" />
          <span>By Vishal Kumar</span>
        </div>
          <p className="text-center text-gray-600 text-sm">
            JavaScript Event Loop Visualizer - A tool for understanding JavaScript's execution model
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;