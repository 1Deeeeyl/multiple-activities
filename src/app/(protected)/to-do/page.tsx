'use client';

import Container from '@/components/container/Container';
import Hero from '@/components/hero/Hero';
import TodoForm from '@/components/todoForm/ToDoForm';
import TodoList from '@/components/todoList/ToDoList';
import { TodoProvider } from '@/context/TodoContext';

export default function ToDoPage() {
  return (
    <Container>
      <Hero h1="To-Do" description="A simple To-Do page" />
      <div className="sm:w-md flex flex-col bg-white p-10 gap-5 rounded-xl h-fit w-sm mx-auto">
        <TodoProvider>
          <TodoForm />
          <TodoList />
        </TodoProvider>
      </div>
    </Container>
  );
}
