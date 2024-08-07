import React, { useState, useEffect } from "react";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';

// Main App component
function App() {
    const [todos, setTodos] = useState([]);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [showInput, setShowInput] = useState(false);
    const [newTodoText, setNewTodoText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Run fetchTodos() when token changes
    useEffect(() => {
        if (token) {
            fetchTodos();
        }
    }, [token]);

    // Fetch todos from the server
    const fetchTodos = async () => {
        try {
            const response = await axios.get('http://localhost:3001/todos', {
                headers: { Authorization: token }
            });
            setTodos(response.data);
        } catch (error) {
            handleRequestError(error);
        }
    };

    // add a new todo
    const addTodo = async () => {
        try {
            const response = await axios.post('http://localhost:3001/todos', { text: newTodoText }, {
                headers: { Authorization: token }
            });
            const newTodo = response.data;
            setTodos([...todos, newTodo]);
            setNewTodoText('');
        } catch (error) {
            handleRequestError(error);
        }
    };

    // toggle the status of todos (completed/not completed)
    const toggleTodo = async (id, completed) => {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) {
            console.error('Todo not found');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:3001/todos/${id}`, { text: todo.text, completed: !completed }, {
                headers: { Authorization: token }
            });
            setTodos(todos.map(todo => todo.id === id ? response.data : todo));
        } catch (error) {
            handleRequestError(error);
        }
    };

    // change text of a todo
    const changeTodo = async (id) => {
        const newText = prompt('Enter new text:');
        if (!newText) return;

        try {
            const response = await axios.put(`http://localhost:3001/todos/${id}`, { text: newText, completed: false }, {
                headers: { Authorization: token }
            });
            setTodos(todos.map(todo => todo.id === id ? response.data : todo));
        } catch (error) {
            handleRequestError(error);
        }
    };

    // delete a todo
    const deleteTodo = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/todos/${id}`, {
                headers: { Authorization: token }
            });
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (error) {
            handleRequestError(error);
        }
    };

    // check login credentials and login
    const handleLogin = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:3001/login', { username, password });
            const token = `Bearer ${response.data.token}`;
            setToken(token);
            localStorage.setItem('token', token);
            setUser({ username, role: response.data.role });
            await fetchTodos();
        } catch (error) {
            console.error('Error logging in:', error);
            if (error.response && error.response.status === 401) {
                setErrorMessage('Username oder Passwort ungültig');
            } else {
                setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        }
    };

    // register new user
    const handleRegister = async (username, password, role) => {
        try {
            await axios.post('http://localhost:3001/register', { username, password, role });
            await handleLogin(username, password);
        } catch (error) {
            console.error('Error registering:', error);
        }
    };

    // removes login credentials so user is going to get logged out
    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('token');
        setUser(null);
        setTodos([]);
    };

    const handleRequestError = (error) => {
        console.error('Request error:', error);
        if (error.response) {
            if (error.response.status === 401) {
                console.error('Token authentication failed:', error.response.data.error);
            } else if (error.response.status === 500) {
                console.error('Internal Server Error:', error.response.data.error);
            } else {
                console.error('Server responded with:', error.response.data);
            }
        } else if (error.request) {
            console.error('Request was made but no response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
    };

    return (
        <div className="container mt-5">
            {!user ? (
                <div>
                    <h2>Login</h2>
                    <Login onLogin={handleLogin} errorMessage={errorMessage}/>
                    <h2>Register</h2>
                    <Register onRegister={handleRegister} />
                </div>
            ) : (
                <div>
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h1 className="h4 m-0">My ToDo List</h1>
                            <div>
                                <button className="btn btn-light btn-sm ms-auto me-2" data-testid={`create-todo-button`} onClick={() => setShowInput(true)}>Create</button>
                                <button className="btn btn-danger btn-sm" data-testid={`logout-button`} onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                        <div className="card-body">
                            {showInput && (
                                <div className="mb-3">
                                    <label className="form-label">New Todo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter new todo"
                                        value={newTodoText}
                                        onChange={(e) => setNewTodoText(e.target.value)}
                                        data-testid={`new-todo-input`}
                                    />
                                    <button className="btn btn-primary mt-2" data-testid={`add-todo-button`} onClick={addTodo}>Add Todo</button>
                                </div>
                            )}
                            <div className="list-group">
                                {todos.map(todo => (
                                    <div key={todo.id}
                                         className="list-group-item d-flex justify-content-between align-items-center"
                                         data-testid={`todo-item-${todo.id}`}>
                                        <div className="d-flex flex-column">
                                            <span className="todo-text">{todo.text}</span>
                                            {user && user.role !== 'user' && (
                                                <small className="text-muted">User: {todo.username}</small>
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <input
                                                type="checkbox"
                                                className="form-check-input me-3"
                                                checked={todo.completed}
                                                onChange={() => toggleTodo(todo.id, todo.completed)}
                                                data-testid={`todo-checkbox-${todo.id}`}
                                            />
                                            <button className="btn btn-warning btn-sm me-2 custom-change-btn"
                                                    data-testid={`update-todo-button-${todo.id}`}
                                                    onClick={() => changeTodo(todo.id)}>Update
                                            </button>
                                            <button className="btn btn-danger btn-sm"
                                                    data-testid={`delete-todo-button-${todo.id}`}
                                                    onClick={() => deleteTodo(todo.id)}>Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
