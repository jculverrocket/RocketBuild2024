import React, { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [isEditing, setIsEditing] = useState(null)
  const [editingText, setEditingText] = useState("");

  // Function to handle adding new ToDo
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { text: newTodo, isCompleted: false }]);
      setNewTodo("");  // Reset input field
    }
  };

  // Function to handle toggling task completion
  const toggleTodo = (index) => {
    const updatedTodos = todos.map((todo, i) =>
      i === index ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    setTodos(updatedTodos);
  };

  // Function to handle deleting a task
  const deleteTodo = (index) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
  };

    // Function to handle enabling edit mode
    const enableEdit = (index, currentText) => {
      setIsEditing(index); // Set the editing state to the index of the item being edited
      setEditingText(currentText); // Set the editing text to the current text of the ToDo
    };
  
    // Function to handle saving edited text
    const saveEdit = (index) => {
      const updatedTodos = todos.map((todo, i) =>
        i === index ? { ...todo, text: editingText } : todo
      );
      setTodos(updatedTodos);
      setIsEditing(null); // Exit edit mode
    };

  return (
    <div className="App">
      <h1>ToDo List</h1>

      <div className="todo-input">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo, index) => (
          <li key={index} className={todo.isCompleted ? "completed" : ""}>
            {isEditing === index ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button onClick={() => saveEdit(index)}>Save</button>
              </>
            ) : (
              <>
                <span onClick={() => toggleTodo(index)}>{todo.text}</span>
                <button onClick={() => enableEdit(index, todo.text)}>Edit</button>
                <button onClick={() => deleteTodo(index)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;