import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StackFrame {
  id: number;
  name: string;
  line: number;
  args?: string[];
  active?: boolean; // Indicates if the frame is currently active or historical
  codeSnippet?: string; // Code snippet field
}

interface CallStackProps {
  frames: StackFrame[];
  historyFrames?: StackFrame[]; // History frames prop
  active: boolean;
}

const CallStack: React.FC<CallStackProps> = ({ frames, historyFrames = [], active }) => {
  // Combine active and history frames for display
  const allFrames = [...frames, ...historyFrames];

  return (
    <Card className={`border ${active ? 'border-callstack animate-pulse-light' : 'border-gray-200'}`}>
      <CardHeader className="bg-callstack bg-opacity-10 py-2 bg-opacity-10 bg-callstack">
        <CardTitle className="text-sm font-semibold">
          <span>Call Stack</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {allFrames.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Stack is empty
            </div>
          ) : (
            <div className="flex flex-col-reverse"> {/* Stack grows from bottom to top */}
              {allFrames.map((frame) => (
                <div 
                  key={frame.id} 
                  className={`p-2 border-b last:border-b-0 ${
                    frame.active 
                      ? 'bg-callstack bg-opacity-20' 
                      : 'bg-gray-100 bg-opacity-50 text-gray-500'
                  }`}
                >
                  <div className="font-mono text-sm flex justify-between">
                    <div className={`${frame.active ? 'font-semibold' : ''} flex-1 overflow-hidden`}>
                      {/* Display code snippet instead of just the name */}
                      {frame.codeSnippet || frame.name}
                      {!frame.active && <span className="text-xs ml-2">(completed)</span>}
                    </div>
                  </div>
                  {frame.args && frame.args.length > 0 && (
                    <div className="text-xs mt-1 font-mono text-muted-foreground">
                      Args: {frame.args.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CallStack;
