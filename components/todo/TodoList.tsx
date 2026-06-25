"use client";

import type { TripTodo } from "@/types/todo";

export function TodoList({ todos }: { todos: TripTodo[] }) {
  return (
    <section className="card card-pad">
      <h2 className="section-title">일정 / 할 일</h2>
      <ul className="list">
        {todos.map((todo) => (
          <li className="list-item" key={todo.id}>
            <strong>
              {todo.time ? `${todo.time} · ` : ""}
              {todo.title}
            </strong>
            {todo.location?.name && <span className="muted">{todo.location.name}</span>}
            {todo.memo && <span className="muted">{todo.memo}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
