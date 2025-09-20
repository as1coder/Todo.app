"use client";
import { useEffect, useState } from "react";
import LogoutButton from "./components/LogoutButton";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [todo, settodo] = useState('');
  const [todos, settodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setFetching(true); // start loading
      const token = localStorage.getItem('token');
      const res = await fetch('/api/todos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        const todosData = await res.json();
        settodos(todosData);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setFetching(false); // stop loading
    }
  };

  const addTodo = async () => {
    if (todo.trim() === '') return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: todo, completed: false }),
      });

      if (res.ok) {
        const newTodo = await res.json();
        settodos([...todos, newTodo]);
        settodo('');
      } else if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    } finally {
      setLoading(false);
    }
  };

const deleteTodo = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const deletedTodo = todos.find(t => t._id === id);

    // ✅ Pehle UI se remove karo (optimistic update)
    settodos(todos.filter(t => t._id !== id));

    const res = await fetch(`/api/todos?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      // ✅ Agar delete fail hua toh wapas add karo
      settodos([...todos, deletedTodo]);
      toast.error('Failed to delete task');
      return;
    }

    // ✅ Success pe hi undo option dikhao
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Task deleted</span>
        <button
          onClick={async () => {
            // ✅ Undo logic
            const restoreRes = await fetch('/api/todos', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                text: deletedTodo.text, 
                completed: deletedTodo.completed 
              }),
            });
            
            if (restoreRes.ok) {
              const restoredTodo = await restoreRes.json();
              // ✅ Direct UI update (optimistic)
              settodos(prev => [...prev, restoredTodo]);
            }
            toast.dismiss(t.id);
          }}
          className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
        >
          Undo
        </button>
      </div>
    ), { duration: 2000 });

  } catch (error) {
    // ✅ Error mein wapas add karo
    settodos([...todos, deleteTodo]);
    toast.error('Delete failed');
  }
};

const confirmDelete = (id) => {
  toast((t) => (
    <div className="flex flex-col gap-3 p-2">
      <span className="font-medium">Delete this task?</span>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="bg-gray-300 text-black px-3 py-1 rounded text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            deleteTodo(id);
          }}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  ), { 
    duration: 2000,
    style: {
      background: '#fff',
      padding: '16px',
      borderRadius: '8px'
    }
  });
};

  const updateTodo = async (id, updates) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!res.ok && res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return null;
      }
      return await res.json();
    } catch (error) {
      console.error('Error updating todo:', error);
      return null;
    }
  };

  const toggleComplete = async (id, completed) => {
    const updatedTodo = await updateTodo(id, { completed: !completed });
    if (updatedTodo) {
      settodos(todos.map(t => t._id === id ? updatedTodo : t));
    }
  };

  const editTodo = (id) => {
    settodos(todos.map(t => t._id === id ? { ...t, editing: true } : t));
  };

  const saveTodo = async (id, newText) => {
    const updatedTodo = await updateTodo(id, { text: newText, editing: false });
    if (updatedTodo) {
      settodos(todos.map(t => t._id === id ? updatedTodo : t));
    }
  };

  const handleChange = (id, value) => {
    settodos(todos.map(t => t._id === id ? { ...t, text: value } : t));
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-blue-50 p-4">
    <Toaster
  position="bottom-right "
  toastOptions={{
    duration: 2000,
    style: {
      background: '#fff',
      color: '#333',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '50px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: '14px'
    },
    success: {
      duration: 2000,
      iconTheme: {
        primary: '#10B981',
        secondary: '#fff',
      },
    },
    error: {
      duration: 2000,
      iconTheme: {
        primary: '#EF4444',
        secondary: '#fff',
      },
    }
  }}
/>

      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Todo App</h1>
        <LogoutButton />
      </div>

      <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 mt-6 mb-4">
        <input
          type="text"
          value={todo}
          onChange={(e) => settodo(e.target.value)}
          placeholder="Add a new task"
          className="flex-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-400"
          disabled={loading}
        />
        <button
          onClick={addTodo}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </div>

      {fetching ? (
        <div className="flex flex-col justify-center items-center h-40">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <div className="mt-3 text-blue-600 font-medium">Loading tasks...</div>
        </div>
      ) : (
        todos.length === 0 ? (
          <div className="text-gray-500 text-lg mt-4">No tasks added yet!</div>
        ) : (
          <div className="mt-4 shadow-lg border border-blue-100 rounded-xl p-3 max-w-2xl w-full h-[470px] overflow-y-scroll scrollbar-hide mx-auto bg-white">
            {todos.map((todo) => (
              <div key={todo._id} className="shadow-md mt-8 p-2 rounded-xl w-full flex flex-col sm:flex-wrap items-center justify-between relative bg-gray-50">
                <div className="flex items-center w-full">
                  {todo.editing ? (
                    <textarea
                      className="flex-1 p-2 border rounded"
                      value={todo.text}
                      onChange={(e) => handleChange(todo._id, e.target.value)}
                    />
                  ) : (
                    <span className={`flex-1 p-2 text-gray-800 ${todo.completed ? "line-through" : ""}`}>
                      {todo.text}
                    </span>
                  )}
                </div>

                <div className="flex gap-4 mt-2 sm:mt-0">
                  <span className="text-lg border-gray-100 w-40 border rounded px-2 flex items-center bg-white">
                    <input
                      type="checkbox"
                      className="scale-125 mr-2"
                      checked={todo.completed}
                      onChange={async () => {
                        await toggleComplete(todo._id, todo.completed);
                      }}
                    />
                    {todo.completed ? "Completed" : "Not Complete"}
                  </span>

                  {todo.editing ? (
                    <button
                      onClick={() => saveTodo(todo._id, todo.text)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 shadow"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => editTodo(todo._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 shadow"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => confirmDelete(todo._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 shadow"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
      