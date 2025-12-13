"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

const TodoList = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const todos = [
    { id: "item1", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: true },
    { id: "item2", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: true },
    { id: "item3", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: false },
    { id: "item4", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: false },
    { id: "item5", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: false },
    { id: "item6", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: false },
    { id: "item7", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: false },
    { id: "item8", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: false },
    { id: "item9", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: true },
    { id: "item10", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: true },
    { id: "item11", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: true },
    { id: "item12", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: true },
    { id: "item13", text: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.", checked: true },
  ];

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Todo List</h1>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full">
            <CalendarIcon />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {/* LIST */}
      <ScrollArea className="max-h-[400px] mt-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {todos.map((todo) => (
            <Card key={todo.id} className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox id={todo.id} defaultChecked={todo.checked} />
                <label htmlFor={todo.id} className="text-sm text-muted-foreground cursor-pointer">
                  {todo.text}
                </label>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TodoList;
