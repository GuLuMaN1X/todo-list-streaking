import { useState, useEffect } from 'react';
import { CheckIcon } from './components/CheckIcon';
import { CrossIcon } from './components/CrossIcon';
import { StreakBadge } from './components/StreakBadge';
import type { Todo } from './types/index';

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState('');

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('streak');
    if (!saved) return 0;
    const data = JSON.parse(saved);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (data.lastActiveDate === today) return data.streak;
    if (data.lastActiveDate === yesterday) return data.streak;
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const saved = localStorage.getItem('streak');
    const data = saved ? JSON.parse(saved) : { lastActiveDate: '', streak: 0 };
    if (data.lastActiveDate === today) return;
    let newStreak;
    if (data.lastActiveDate === yesterday) {
      newStreak = data.streak + 1;
    } else {
      newStreak = 1;
    }
    localStorage.setItem('streak', JSON.stringify({
      lastActiveDate: today,
      streak: newStreak,
    }));
    setStreak(newStreak);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '') return;
    const newTodo = {
      id: Date.now().toString(),
      text: text,
      done: false,
    };
    setTodos([newTodo, ...todos]);
    setText('');
    updateStreak();
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
    updateStreak();
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    updateStreak();
  };

  const doneCount = todos.filter((todo) => todo.done).length;
  const undoneCount = todos.length - doneCount;
  const progress = todos.length > 0 ? (doneCount / todos.length) * 100 : 0;

  return (
    <div>
      <h1>Todo List</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          placeholder="Новая задача..."
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Добавить</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className={todo.done ? 'done' : ''}
          >
            <span>
              {todo.done && <CheckIcon size={18} />}
              {todo.text}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
              }}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Всего</span>
          <span className="stat-value">{todos.length}</span>
        </div>
        <div className="stat stat-done">
          <CheckIcon size={16} />
          <span className="stat-label">Выполнено</span>
          <span className="stat-value">{doneCount}</span>
        </div>
        <div className="stat stat-undone">
          <CrossIcon size={16} />
          <span className="stat-label">Осталось</span>
          <span className="stat-value">{undoneCount}</span>
        </div>
      </div>

      <StreakBadge streak={streak} />

      <div className="progress-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

export default App;