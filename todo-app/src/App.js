import React, { useState, useEffect } from "react";
// Für HTTP Requests
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    const [todos, setTodos] = useState([]);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [showInput, setShowInput] = useState(false);
    const [newTodoText, setNewTodoText] = useState('');

    // Überprüft den Token und lädt die To-Dos vom Server
    useEffect(() => {
        if (token) {
            (async () => await fetchTodos())();
        }
    }, [token]);

    // Ruft To-Dos vom Server ab und speichert Sie im State todos
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

    // POST-Anfrage an Server um todos hinzuzufügen
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

    // Setzt den "completed" Status eines todos fest (benötigt für die Checkboxen)
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

    // Ermöglicht die Änderung des Textes eines todos
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

    // Löscht die jeweiligen todos und aktualisiert den State
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

    // Loggt den User ein und speichert den Token im localStorage und im State
    const handleLogin = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:3001/login', { username, password });
            const token = `Bearer ${response.data.token}`;
            setToken(token);
            localStorage.setItem('token', token);
            setUser({ username });
            await fetchTodos();
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    // Ermöglicht Registrierung und loggt Benutzer direkt ein
    const handleRegister = async (username, password, role) => {
        try {
            await axios.post('http://localhost:3001/register', { username, password, role });
            await handleLogin(username, password);
        } catch (error) {
            console.error('Error registering:', error);
        }
    };

    // Loogt den Benutzer aus indem der State zurückgesetzt wird
    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('token');
        setUser(null);
        setTodos([]);
    };

    // Dient der Fehlerbehandlung bzw. der entsprechenden Ausgabe
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

    // Wenn User nicht eingeloogt ist, zeige Login und Registrierung, ansonsten "To-Do" UI
    return (
        <div className="container mt-5">
            {!user ? (
                <div>
                    <h2>Login</h2>
                    <Login onLogin={handleLogin} />
                    <h2>Register</h2>
                    <Register onRegister={handleRegister} />
                </div>
            ) : (
                <div>
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h1 className="h4 m-0">My ToDo List</h1>
                            <div>
                                <button className="btn btn-light btn-sm ms-auto me-2" onClick={() => setShowInput(true)}>Create</button>
                                <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
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
                                    />
                                    <button className="btn btn-primary mt-2" onClick={addTodo}>Add Todo</button>
                                </div>
                            )}
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
                                        <button className="btn btn-warning btn-sm me-2 custom-change-btn" onClick={() => changeTodo(todo.id)}>Update</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => deleteTodo(todo.id)}>Delete</button>
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

// Zeigt das Login Formular und ruft onLogin auf, wenn das Formular abgeschickt wird
function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
        </form>
    );
}

// Zeigt Registrierungsformular und ruft onRegister auf, wenn das Formular abgeschickt wird
function Register({ onRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(username, password, role);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="user">User</option>
                </select>
            </div>
            <button type="submit" className="btn btn-primary">Register</button>
        </form>
    );
}

export default App;
