import React, { useState } from "react";
import './App.css';

function App() {
    const [todos, setTodos] = useState([
        { id: 1, text: 'Test 1' },
        { id: 2, text: 'Test 2' }
    ]);

    const addTodo = () => {
        const newTodo = { id: Date.now(), text: 'Todo eintragen' };
        setTodos([...todos, newTodo]);
    };

    const changeTodo = (id) => {
        const newText = prompt('Text eingeben: ');
        setTodos(todos.map(todo => todo.id === id ? { ...todo, text: newText } : todo));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
        <div className="App">
            <div className="navbar">
                <h1>My ToDo List!</h1>
                <button onClick={addTodo}>Create</button>
            </div>
            <div className="todo-list">
                {todos.map(todo => (
                    <div key={todo.id} className="todo-item">
                        <span className="todo-text">{todo.text}</span>
                        <input type="checkbox" className="todo-checkbox" />
                        <div className="todo-buttons">
                            <button onClick={() => changeTodo(todo.id)}>Change</button>
                            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
