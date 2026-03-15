
import React, { useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Play, Pause, Code } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onPause: () => void;
  isRunning: boolean;
  disabled: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRun,
  onPause,
  isRunning,
  disabled
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code size={18} />
          <h3 className="font-semibold">JavaScript Code</h3>
        </div>
        <div className="flex space-x-2">
          {isRunning ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPause}
              disabled={disabled}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRun}
            >
              <Play className="h-4 w-4 mr-1" />
              Run
            </Button>
          )}
        </div>
      </div>
      <Textarea
        value={code}
        onChange={handleChange}
        placeholder="Enter your JavaScript code here..."
        className="font-mono min-h-[300px] bg-codeBackground border-gray-300"
        disabled={isRunning}
      />
      <div className="text-xs text-muted-foreground">
        Note: Some JavaScript features may not be supported in the visualizer
      </div>
    </div>
  );
};

export default CodeEditor;