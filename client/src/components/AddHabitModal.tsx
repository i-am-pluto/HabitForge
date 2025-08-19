import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHabitSchema, InsertHabit } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: InsertHabit) => void;
}

export function AddHabitModal({ isOpen, onClose, onAdd }: AddHabitModalProps) {
  const form = useForm<InsertHabit>({
    resolver: zodResolver(insertHabitSchema),
    defaultValues: {
      name: "",
      category: "Health & Fitness"
    }
  });

  const onSubmit = (data: InsertHabit) => {
    onAdd(data);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="add-habit-modal">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Read for 30 minutes" 
                      {...field}
                      data-testid="input-habit-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-habit-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                      <SelectItem value="Creative">Creative</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mt-0.5">
                  <i className="fas fa-lightbulb text-primary text-xs"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">How it works</p>
                  <p className="text-sm text-muted mt-1">
                    Your habit will be tracked using the sigmoid formula H(d) = 1/(1+e^(-0.19(d-25))). Build consecutive days (d) to increase habit strength. Tipping point at 0.5 (50%).
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1" 
                onClick={handleClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                data-testid="button-create-habit"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Habit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
