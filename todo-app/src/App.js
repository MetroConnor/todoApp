import React, { useState, useEffect } from "react";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
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
            const response = await axios.post('http://localhost:3001/todos', { text: 'New Todo' });
            const newTodo = response.data;

            // Prompt for new text and update the new Todo's text
            const newText = prompt('Neuen Text eingeben: ', 'New Todo');
            if (newText) {
                const updatedResponse = await axios.put(`http://localhost:3001/todos/${newTodo.id}`, { text: newText, completed: false });
                setTodos([...todos, updatedResponse.data]);
            } else {
                setTodos([...todos, newTodo]);
            }
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const toggleTodo = async (id, completed) => {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) {
            console.error('Todo not found');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/todos/${id}`, { text: todo.text, completed: !completed });
            setTodos(todos.map(todo => todo.id === id ? response.data : todo));
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const changeTodo = async (id) => {
        const newText = prompt('Neuen Text eingeben: ');
        if (!newText) return;
        try {
            const response = await axios.put(`http://localhost:3001/todos/${id}`, { text: newText });
            setTodos(todos.map(todo => todo.id === id ? response.data : todo));
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Todos:', error);
        }
        console.log('ID des Todos:', id);
        console.log('Neuer Text:', newText);
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
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h1 className="h4 m-0">My ToDo List</h1>
                    <button className="btn btn-light btn-sm ms-auto me-2" onClick={addTodo}>Create</button>
                </div>
                <div className="card-body">
                    <div className="list-group">
                        {todos.map(todo => (
                            <div key={todo.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span className="todo-text">{todo.text}</span>
                                <div className="d-flex align-items-center">
                                    <input
                                        type="checkbox"
                                        className="form-check-input me-3"
                                        checked={todo.completed}
                                        onChange={() => toggleTodo(todo.id, todo.completed)}
                                    />
                                    <button className="btn btn-warning btn-sm me-2 custom-change-btn" onClick={() => changeTodo(todo.id)}>Change</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => deleteTodo(todo.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
