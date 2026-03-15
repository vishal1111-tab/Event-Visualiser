
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
  id: number;
  name: string;
  type: "micro" | "macro";
  source?: string;
}

interface TaskQueueProps {
  tasks: Task[];
  title: string;
  type: "micro" | "macro";
  active: boolean;
}

const TaskQueue: React.FC<TaskQueueProps> = ({ tasks, title, type, active }) => {
  const bgColor = type === "micro" ? "bg-microtask" : "bg-macrotask";
  const borderColor = type === "micro" ? "border-microtask" : "border-macrotask";
  
  return (
    <Card className={`border ${active ? borderColor + ' animate-pulse-light' : 'border-gray-200'}`}>
      <CardHeader className={`bg-opacity-10 py-2 ${bgColor} `}>
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-normal">{tasks.length} tasks</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[200px] overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Queue is empty
            </div>
          ) : (
            <div className="flex flex-col">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-2 border-b last:border-b-0"
                >
                  <div className="font-mono text-sm font-semibold">{task.name}</div>
                  {task.source && (
                    <div className="text-xs mt-1 font-mono text-muted-foreground">
                      {task.source}
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

export default TaskQueue;