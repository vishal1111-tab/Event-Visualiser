
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CodeEditor from "./CodeEditor";
import CallStack from "./CallStack";
import TaskQueue from "./TaskQueue";
import { EventLoopSimulator } from "@/lib/eventLoopService";
import type {ExecutionState} from "@/lib/eventLoopService";

const DEFAULT_CODE = `// Try this example or write your own code
console.log('Start');

setTimeout(() => {
  console.log('Timeout');
}, 1000);

new Promise((resolve) => {
  resolve('Done');
}).then(() => {
  console.log('Promise');
});

console.log('End');`;

const EventLoopVisualizer: React.FC = () => {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [state, setState] = useState<ExecutionState>({
    callStack: [],
    callStackHistory: [], // Initialize call stack history
    microTaskQueue: [],
    macroTaskQueue: [],
    currentLine: 0,
    isRunning: false,
    isFinished: false,
    activeTask: null,
    consoleOutput: []
  });
  
  const [simulator] = useState<EventLoopSimulator>(new EventLoopSimulator());
  const [execInterval, setExecInterval] = useState<number | null>(null);
  
  const { toast } = useToast();

  // Handle automatic stepping when running
  useEffect(() => {
    if (state.isRunning && !execInterval) {
      const interval = window.setInterval(() => {
        stepExecution();
      }, 4000); // Increased delay to 4 seconds between steps
      setExecInterval(interval);
    } else if (!state.isRunning && execInterval) {
      window.clearInterval(execInterval);
      setExecInterval(null);
    }
    
    return () => {
      if (execInterval) {
        window.clearInterval(execInterval);
      }
    };
  }, [state.isRunning, execInterval]);

  // Handle finished execution
  useEffect(() => {
    if (state.isFinished) {
      // Add a delay before showing completion message
      setTimeout(() => {
        toast({
          title: "Execution completed",
          description: "All tasks processed"
        });
        
        // Clean up any timeouts or intervals
        simulator.cleanup();
        
        // Allow the user to run the code again without disabled button
        setState(prevState => ({
          ...prevState,
          isRunning: false,
          // Don't set isFinished to false so the UI still shows completion state
        }));
      }, 4000); // Add 4s delay at the end of execution
    }
  }, [state.isFinished]);

  // Component cleanup
  useEffect(() => {
    return () => {
      simulator.cleanup();
    };
  }, []);

  const runCode = () => {
    try {
      // Reset state
      setState({
        callStack: [],
        callStackHistory: [], // Reset call stack history as well
        microTaskQueue: [],
        macroTaskQueue: [],
        currentLine: 0,
        isRunning: true,
        isFinished: false,
        activeTask: null,
        consoleOutput: []
      });
      
      setTimeout(() => {
        simulator.initialize(code);
        simulator.start();
        setState(prevState => ({
          ...simulator.getCurrentState(),
          isRunning: true,
          isFinished: false
        }));
      }, 500); // Small delay before starting execution
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize code simulation",
        variant: "destructive"
      });
    }
  };

  const pauseExecution = () => {
    simulator.pause();
    setState(prevState => ({
      ...prevState,
      isRunning: false
    }));
  };

  const stepExecution = () => {
    try {
      const newState = simulator.step();
      setState(newState);
      
      if (newState.isFinished && execInterval) {
        window.clearInterval(execInterval);
        setExecInterval(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error during execution simulation",
        variant: "destructive"
      });
      pauseExecution();
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CodeEditor
          code={code}
          onChange={setCode}
          onRun={runCode}
          onPause={pauseExecution}
          isRunning={state.isRunning}
          disabled={false} // Never disable the run button
        />
        
        <div className="flex flex-col space-y-4">
          <CallStack 
            frames={state.callStack} 
            historyFrames={state.callStackHistory}
            active={state.activeTask === 'callStack'}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TaskQueue 
              tasks={state.microTaskQueue} 
              title="Microtask Queue" 
              type="micro"
              active={state.activeTask === 'microTask'}
            />
            <TaskQueue 
              tasks={state.macroTaskQueue} 
              title="Macrotask Queue" 
              type="macro"
              active={state.activeTask === 'macroTask'}
            />
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm">
                <div className="font-semibold mb-2">Current execution:</div>
                <div className="font-mono">
                  {state.currentLine > 0
                    ? `Current Operation` 
                    : state.isFinished 
                      ? "Execution completed"
                      : "Not running"}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Console Output */}
          <Card>
            <CardContent className="p-4 max-h-[200px] overflow-y-auto bg-black text-white font-mono">
              <div className="text-sm mb-2 text-gray-400">Console Output:</div>
              <div className="space-y-1">
                {state.consoleOutput && state.consoleOutput.length > 0 ? (
                  state.consoleOutput.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap break-words">&gt; {log}</div>
                  ))
                ) : (
                  <div className="text-gray-500">No output</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventLoopVisualizer;