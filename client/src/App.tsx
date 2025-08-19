import { HabitTracker } from "./components/HabitTracker";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HabitTracker />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
