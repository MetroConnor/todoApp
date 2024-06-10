import React, { useState, useEffect } from "react";
import axios from 'axios';
import './App.css';

function App() {
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const response = await axios.get('http://localhost:3001/todos');
                setTodos(response.data);
            } catch (error) {
                console.error('Error fetching todos:', error);
            }
        };

        fetchTodos();
    }, []);

    const addTodo = async () => {
        try {
            const response = await axios.post('http://localhost:3001/todos', { text: 'Todo eintragen' });
            setTodos([...todos, response.data]);
            console.log('Todo added:', response.data);
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const toggleTodo = async (id, checked) => {
        try {
            await axios.put(`http://localhost:3001/todos/${id}`, { completed: !checked }); // Umkehrung des aktuellen Status
            setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !checked } : todo));
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };


    const changeTodo = async (id) => {
        const newText = prompt('Text eingeben: ');
        try {
            const response = await axios.put(`http://localhost:3001/todos/${id}`, { text: newText });
            setTodos(todos.map(todo => todo.id === id ? response.data : todo));
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/todos/${id}`);
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
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
                        <input
                            type="checkbox"
                            className="todo-checkbox"
                            checked={!!todo.completed} // sicherstellen, dass es ein Boolescher Wert ist
                            onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                        />
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
