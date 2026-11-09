import { useState, useEffect } from 'react';
import { CheckIcon } from './components/CheckIcon';
import { CrossIcon } from './components/CrossIcon';
import { StreakBadge } from './components/StreakBadge';
import { createPortal } from 'react-dom';
import type { Todo } from './types/index';

function App() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [allTodos, setAllTodos] = useState<Record<string, Todo[]>>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : {};
  });
  const todos = allTodos[currentDate] || [];

  const [text, setText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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
    localStorage.setItem('todos', JSON.stringify(allTodos));
  }, [allTodos]);

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

  const updateTodosForDay = (newTodos: Todo[]) => {
    setAllTodos(prev => ({
      ...prev,
      [currentDate]: newTodos
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '') return;
    const newTodo = {
      id: Date.now().toString(),
      text: text,
      done: false,
    };
    updateTodosForDay([newTodo, ...todos]);
    setText('');
    updateStreak();
  };

  const toggleTodo = (id: string) => {
    updateTodosForDay(
      todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    );
    updateStreak();
  };

  const deleteTodo = (id: string) => {
    updateTodosForDay(todos.filter((todo) => todo.id !== id));
    updateStreak();
  };

  const handleEditSave = (id: string) => {
    updateTodosForDay(
      todos.map(todo => todo.id === id ? { ...todo, text: editText } : todo)
    );
    setEditId(null);
  };

  const clearAll = () => {
    updateTodosForDay([]);
    setIsModalOpen(false);
  };

  const changeDate = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const doneCount = todos.filter((todo) => todo.done).length;
  const undoneCount = todos.length - doneCount;
  const progress = todos.length > 0 ? (doneCount / todos.length) * 100 : 0;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Дисциплина</h1>

        <button className="clear-btn" onClick={() => setIsModalOpen(true)}>
          Очистить
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="nav-btn" onClick={() => changeDate(-1)}>
            ← Вчера
          </button>

          <div className="date-display" style={{ cursor: 'pointer' }} onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])} title="Вернуться к сегодня">
            {new Date(currentDate + 'T00:00:00').toLocaleDateString('en-EN', { day: 'numeric', month: 'long' })}
          </div>

          <button className="nav-btn" onClick={() => changeDate(1)}>
            Завтра →
          </button>
        </div>
      </header>

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
            {editId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 1, marginRight: '10px' }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSave(todo.id);
                  }}
                  style={{ marginRight: '5px' }}
                >
                  Сохранить
                </button>
              </>
            ) : (
              <>
                <span>
                  {todo.done && <CheckIcon size={18} />}
                  {todo.text}
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditId(todo.id);
                      setEditText(todo.text);
                    }}
                  >
                    Ред.
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTodo(todo.id);
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
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

      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Удалить всё?</h2>
            <p>Это действие сотрет все твои задачи на этот день.</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Отмена</button>
              <button className="btn-danger" onClick={clearAll}>Удалить</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default App;