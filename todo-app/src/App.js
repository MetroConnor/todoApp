import React from 'react';
import './App.css';

function App() {
  React.useEffect(() => {
      createNavigationBar();
  }, []);

  return (
    <div className="App" id="navbar">
      <h1>My ToDo List!</h1>
    </div>
  );
}

function createNavigationBar(){
    const navbar = document.getElementById('navbar');
    const buttonCreate = document.createElement('button');
    buttonCreate.textContent = 'Create';
    const buttonChange = document.createElement('button');
    buttonChange.textContent = 'Change';
    const buttonDelete = document.createElement('button');
    buttonDelete.textContent = 'Delete';

    navbar.appendChild(buttonCreate);
    navbar.appendChild(buttonChange);
    navbar.appendChild(buttonDelete);
}
export default App;
