import React, { useState, useEffect } from "react";
import axios from 'axios';
import './App.css';

function App() {
    const [todos, setTodos] = useState([]);

    //lädt To-Do Daten vom lokalen Server und setzt den State
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
        const todo = todos.find(todo => todo.id === id);
        if (!todo) {
            console.error('Todo not found');
            return;
        }

        try {
            console.log(`Toggling todo: ${id}, current completed: ${checked}`);
            const response = await axios.put(`http://localhost:3001/todos/${id}`, { text: todo.text, completed: !checked });
            console.log('Toggle response:', response.data);

            setTodos(todos.map(todo => todo.id === id ? response.data : todo));
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };




    const changeTodo = async (id) => {
        const newText = prompt('Neuen Text eingeben: ');
        if (!newText) return; // Abbrechen, wenn kein Text eingegeben wurde
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
                            checked={todo.completed} // kein Typumwandlung erforderlich, da `completed` bereits ein Boolescher Wert sein sollte
                            onChange={(e) => toggleTodo(todo.id, todo.completed)} // Übergebe den aktuellen Status
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
