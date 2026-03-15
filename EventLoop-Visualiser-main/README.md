
# JavaScript Event Loop Visualizer

This web application provides an interactive visualization of JavaScript's event loop, helping developers understand how asynchronous JavaScript code executes.


## Project Overview

The JavaScript Event Loop Visualizer is a React-based web application that allows users to write JavaScript code and see how it executes through the event loop in real-time. It provides visual representations of:

- Call Stack execution
- Microtask Queue (Promise callbacks)
- Macrotask Queue (setTimeout, setInterval callbacks)
- Console output

## How It Works

### Execution Flow

1. **User Input**: Users write or edit JavaScript code in the CodeEditor component
2. **Code Execution**: When the user clicks "Run", the code is passed to the EventLoopSimulator
3. **Sandboxed Environment**: The code runs in a controlled environment that intercepts built-in functions
4. **Visualization Process**:
   - Functions are pushed to and popped from the call stack
   - Asynchronous operations are added to the appropriate queues
   - The event loop processes these operations according to JavaScript's rules
   - Console output is captured and displayed
5. **UI Updates**: The visualization updates with each step of execution

### Technical Implementation

The EventLoopSimulator creates a sandboxed environment using JavaScript's `Function` constructor:

```javascript
new Function(sandboxCode)();
```

Within this environment:
- Console methods are intercepted to display in the UI
- Promise and timer functions are instrumented to show microtask/macrotask behavior
- Call stack operations are tracked and visualized

## Project Structure

- **`/src/components/`**: UI components
  - `EventLoopVisualizer.tsx`: Main orchestration component
  - `CallStack.tsx`: Renders the call stack view
  - `TaskQueue.tsx`: Displays microtask and macrotask queues
  - `CodeEditor.tsx`: Code editing interface
  
- **`/src/lib/`**: Core functionality
  - `eventLoopService.ts`: Powers the simulation engine
  
- **`/src/pages/`**: Application pages
  - `Index.tsx`: Main application page with tabs for visualizer and information

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: UI component library
- **JavaScript Execution**: Custom sandbox environment

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open in your browser at the indicated URL

## How to Use

1. Enter or modify JavaScript code in the editor panel
2. Click "Run" to start the visualization
3. Watch as the code executes through the call stack and task queues
4. Observe how asynchronous operations like Promises and timers behave

## Limitations

For security reasons, the code execution environment has certain limitations:
- DOM manipulation is restricted
- Network requests are not supported
- Some built-in JavaScript APIs may be unavailable

## License

This project is open source and available under the [MIT License](LICENSE).