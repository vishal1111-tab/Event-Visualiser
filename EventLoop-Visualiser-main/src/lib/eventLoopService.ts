
// This service handles JavaScript code execution and event loop simulation

export interface StackFrame {
    id: number;
    name: string;
    line: number;
    args?: string[];
    active?: boolean; // Indicates if the frame is currently active or historical
    codeSnippet?: string; // Add code snippet field
  }
  
  export interface Task {
    id: number;
    name: string;
    type: "micro" | "macro";
    source?: string;
  }
  
  export interface ExecutionState {
    callStack: StackFrame[];
    callStackHistory: StackFrame[]; // Track call stack history
    microTaskQueue: Task[];
    macroTaskQueue: Task[];
    currentLine: number;
    isRunning: boolean;
    isFinished: boolean;
    activeTask: "callStack" | "microTask" | "macroTask" | null;
    consoleOutput?: string[];
  }
  
  class InstrumentedConsole {
    logs: string[] = [];
    
    log(...args: any[]) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      this.logs.push(message);
      console.log(...args); // Still log to the actual console
    }
    
    error(...args: any[]) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      this.logs.push(`Error: ${message}`);
      console.error(...args);
    }
    
    warn(...args: any[]) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      this.logs.push(`Warning: ${message}`);
      console.warn(...args);
    }
    
    info(...args: any[]) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      this.logs.push(`Info: ${message}`);
      console.info(...args);
    }
  }
  
  export class EventLoopSimulator {
    private state: ExecutionState;
    private code: string;
    private instrumentedConsole: InstrumentedConsole;
    private nextId: number;
    private executionQueue: Array<() => void>;
    private timeoutIds: number[] = [];
    private originalSetTimeout: typeof setTimeout;
    private originalClearTimeout: typeof clearTimeout;
    private originalSetInterval: typeof setInterval;
    private originalClearInterval: typeof clearInterval;
    private originalPromise: typeof Promise;
  
    constructor() {
      this.state = {
        callStack: [],
        callStackHistory: [], // Initialize call stack history
        microTaskQueue: [],
        macroTaskQueue: [],
        currentLine: 0,
        isRunning: false,
        isFinished: false,
        activeTask: null,
        consoleOutput: []
      };
      this.code = "";
      this.instrumentedConsole = new InstrumentedConsole();
      this.nextId = 1;
      this.executionQueue = [];
      
      // Store original timing functions
      this.originalSetTimeout = window.setTimeout;
      this.originalClearTimeout = window.clearTimeout;
      this.originalSetInterval = window.setInterval;
      this.originalClearInterval = window.clearInterval;
      this.originalPromise = Promise;
    }
  
    public initialize(code: string): void {
      this.code = code;
      this.nextId = 1;
      this.executionQueue = [];
      this.timeoutIds = [];
      this.instrumentedConsole = new InstrumentedConsole();
      
      this.state = {
        callStack: [],
        callStackHistory: [], // Reset call stack history
        microTaskQueue: [],
        macroTaskQueue: [],
        currentLine: 0,
        isRunning: false,
        isFinished: false,
        activeTask: null,
        consoleOutput: []
      };
      
      this.setupEnvironment();
    }
  
    private setupEnvironment(): void {
      const self = this;
      
      // Override setTimeout
      (window as any).instrumentedSetTimeout = function(...args: any[]) {
        const callback = args[0];
        const delay = args[1] || 0;
        const callbackCode = callback.toString().replace(/^function\s*\(\)\s*\{\s*([\s\S]*)\s*\}$/, '$1').trim();
        
        // Add to macro task queue
        self.state.macroTaskQueue.push({
          id: self.nextId++,
          name: `setTimeout (${delay}ms)`,
          type: "macro",
          source: `setTimeout(${callbackCode}, ${delay})`
        });
        
        // Schedule actual execution
        const timeoutId : any = self.originalSetTimeout.call(window, () => {
          self.executionQueue.push(() => {
            self.state.activeTask = "macroTask";
            self.pushCallStack("setTimeout callback", undefined, `${callbackCode}`);
            
            try {
              callback();
            } catch (error) {
              console.error("Error in setTimeout callback:", error);
            }
            
            self.popCallStack();
            
            // Remove from macro task queue
            const index = self.state.macroTaskQueue.findIndex(task => task.name.includes("setTimeout"));
            if (index >= 0) {
              self.state.macroTaskQueue.splice(index, 1);
            }
          });
        }, delay);
        
        self.timeoutIds.push(timeoutId);
        return timeoutId;
      };
      
      // Override clearTimeout
      (window as any).instrumentedClearTimeout = function(id: number) {
        self.originalClearTimeout.call(window, id);
        const index = self.timeoutIds.indexOf(id);
        if (index >= 0) {
          self.timeoutIds.splice(index, 1);
        }
        
        // Also remove from macro task queue
        const taskIndex = self.state.macroTaskQueue.findIndex(task => task.name.includes("setTimeout"));
        if (taskIndex >= 0) {
          self.state.macroTaskQueue.splice(taskIndex, 1);
        }
      };
      
      // Override Promise
      (window as any).InstrumentedPromise = class extends Promise<any> {
        constructor(executor: (resolve: any, reject: any) => void) {
          const wrappedResolve = (value: any) => {
            self.state.activeTask = "microTask";
            return value;
          };
          
          const wrappedReject = (reason: any) => {
            self.state.activeTask = "microTask";
            return reason;
          };
          
          super((resolve, reject) => {
            const executorStr = executor.toString();
            self.pushCallStack("Promise constructor", undefined, `new Promise(${executorStr.slice(0, 30)}...)`);
            executor(
              (val: any) => {
                self.pushCallStack("Promise resolve", undefined, `resolve(${JSON.stringify(val)})`);
                resolve(val);
                self.popCallStack();
              },
              (reason: any) => {
                self.pushCallStack("Promise reject", undefined, `reject(${JSON.stringify(reason)})`);
                reject(reason);
                self.popCallStack();
              }
            );
            self.popCallStack();
          });
        }
        
        then(onFulfilled?: any, onRejected?: any) {
          // Get code snippet for the handler
          const fulfilledStr = onFulfilled ? onFulfilled.toString().slice(0, 30) + '...' : 'undefined';
          
          // Add to micro task queue
          self.state.microTaskQueue.push({
            id: self.nextId++,
            name: "Promise.then",
            type: "micro",
            source: `.then(${fulfilledStr})`
          });
          
          return super.then(
            (value) => {
              self.executionQueue.push(() => {
                self.state.activeTask = "microTask";
                const handlerStr = onFulfilled ? onFulfilled.toString().slice(0, 40) : 'undefined';
                self.pushCallStack("Promise.then handler", undefined, `.then(${handlerStr}...)`);
                
                let result;
                try {
                  result = onFulfilled ? onFulfilled(value) : value;
                } catch (error) {
                  self.popCallStack();
                  throw error;
                }
                
                self.popCallStack();
                
                // Remove from micro task queue
                const index = self.state.microTaskQueue.findIndex(task => task.name === "Promise.then");
                if (index >= 0) {
                  self.state.microTaskQueue.splice(index, 1);
                }
                
                return result;
              });
              
              return value;
            },
            (reason) => {
              self.executionQueue.push(() => {
                self.state.activeTask = "microTask";
                const handlerStr = onRejected ? onRejected.toString().slice(0, 40) : 'undefined';
                self.pushCallStack("Promise.catch handler", undefined, `.catch(${handlerStr}...)`);
                
                let result;
                try {
                  result = onRejected ? onRejected(reason) : reason;
                } catch (error) {
                  self.popCallStack();
                  throw error;
                }
                
                self.popCallStack();
                
                // Remove from micro task queue
                const index = self.state.microTaskQueue.findIndex(task => task.name === "Promise.then");
                if (index >= 0) {
                  self.state.microTaskQueue.splice(index, 1);
                }
                
                return result;
              });
              
              return reason;
            }
          );
        }
        
        catch(onRejected?: any) {
          return this.then(undefined, onRejected);
        }
        
        finally(onFinally?: any) {
          return this.then(
            (value:any) => {
              onFinally?.();
              return value;
            },
            (reason:any) => {
              onFinally?.();
              throw reason;
            }
          );
        }
      };
    }
  
    public getCurrentState(): ExecutionState {
      return { 
        ...this.state,
        consoleOutput: [...this.instrumentedConsole.logs]
      };
    }
  
    public start(): void {
      this.state.isRunning = true;
      this.executeCode();
    }
  
    public pause(): void {
      this.state.isRunning = false;
    }
  
    public step(): ExecutionState {
      if (this.state.isFinished) {
        return { ...this.state };
      }
      
      // Execute the next task in queue if available
      if (this.executionQueue.length > 0) {
        const nextTask = this.executionQueue.shift();
        if (nextTask) {
          nextTask();
        }
      }
      
      // Check if we're finished
      if (this.executionQueue.length === 0 && 
          this.state.macroTaskQueue.length === 0 && 
          this.state.microTaskQueue.length === 0 &&
          this.state.callStack.length === 0) {
        this.state.isFinished = true;
        this.state.isRunning = false;
      }
      
      return { 
        ...this.state,
        consoleOutput: [...this.instrumentedConsole.logs]
      };
    }
  
    private executeCode(): void {
      try {
        // Reset state between runs
        this.state.callStack = [];
        this.state.currentLine = 1;
        this.state.activeTask = "callStack";
        
        // Push global execution context to call stack
        this.pushCallStack("global execution context", undefined, "Global Context");
        
        // Create a safe execution environment
        const sandboxCode = `
          const console = {
            log: (...args) => {
              const argsStr = args.map(arg => JSON.stringify(arg)).join(', ');
              // Add console.log to call stack so it appears explicitly
              window.addToCallStack("console.log", \`console.log(\${argsStr})\`);
              window.instrumentedConsole.log(...args);
              const result = argsStr;
              window.popFromCallStack();
              return result;
            },
            warn: (...args) => {
              window.addToCallStack("console.warn", \`console.warn(...)\`);
              const result = window.instrumentedConsole.warn(...args);
              window.popFromCallStack();
              return result;
            },
            error: (...args) => {
              window.addToCallStack("console.error", \`console.error(...)\`);
              const result = window.instrumentedConsole.error(...args);
              window.popFromCallStack();
              return result;
            },
            info: (...args) => {
              window.addToCallStack("console.info", \`console.info(...)\`);
              const result = window.instrumentedConsole.info(...args);
              window.popFromCallStack();
              return result;
            }
          };
          const setTimeout = (callback, delay) => {
            const callbackStr = callback.toString();
            return window.instrumentedSetTimeout(callback, delay);
          };
          const clearTimeout = window.instrumentedClearTimeout;
          const Promise = window.InstrumentedPromise;
          
          ${this.code}
        `;
        
        // Expose instrumented console and call stack methods
        (window as any).instrumentedConsole = this.instrumentedConsole;
        (window as any).addToCallStack = (name: string, snippet: string) => {
          this.pushCallStack(name, undefined, snippet);
        };
        (window as any).popFromCallStack = () => {
          this.popCallStack();
        };
        
        // Execute the code
        new Function(sandboxCode)();
        
        // Pop global execution context from call stack when immediate execution is done
        this.popCallStack();
      } catch (error) {
        console.error("Error executing code:", error);
        this.instrumentedConsole.error(`Execution error: ${error instanceof Error ? error.message : String(error)}`);
        this.state.isFinished = true;
        this.state.isRunning = false;
      }
    }
  
    private pushCallStack(name: string, line?: number, codeSnippet?: string): void {
      const newFrame = {
        id: this.nextId++,
        name,
        line: line || this.state.currentLine,
        active: true, // This is an active frame
        codeSnippet: codeSnippet || name // If no code snippet provided, use name
      };
      
      this.state.callStack.push(newFrame);
      this.state.activeTask = "callStack";
    }
  
    private popCallStack(): void {
      const poppedFrame = this.state.callStack.pop();
      
      // Add the popped frame to history, marking it as inactive
      if (poppedFrame) {
        const historyFrame = {
          ...poppedFrame,
          active: false // Mark as historical/inactive
        };
        this.state.callStackHistory.push(historyFrame);
      }
      
      this.state.activeTask = "callStack";
      
      if (this.state.callStack.length > 0) {
        this.state.currentLine = this.state.callStack[this.state.callStack.length - 1].line;
      } else {
        this.state.currentLine = 0;
      }
    }
  
    public cleanup(): void {
      // Clean up any remaining timeouts
      this.timeoutIds.forEach(id => {
        this.originalClearTimeout.call(window, id);
      });
      this.timeoutIds = [];
    }
  }
  