describe('ToDo Application', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should allow a user to log in, create, edit, and delete a todo', () => {
    // Login Check
    cy.get('[data-testid="username"]').type('testuser');
    cy.get('[data-testid="password"]').type('testpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="create-todo-button"]').should('be.visible').click();

    // Check if new todo can be added
    cy.get('[data-testid="new-todo-input"]').type('Test Todo');
    cy.get('[data-testid="add-todo-button"]').click();

    // Check if new todo is visible
    cy.contains('Test Todo').should('be.visible');

    cy.contains('Test Todo').parents('[data-testid^="todo-item-"]').then($todo => {
      const todoId = $todo.attr('data-testid').split('-').pop(); // Extrahiere die ID

      // check if update button exists and works
      cy.get(`[data-testid="update-todo-button-${todoId}"]`).should('be.visible').click();

      // check if update function returns the correct data
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns('Geändert');
      });

      cy.get(`[data-testid="update-todo-button-${todoId}"]`).should('be.visible').click();

      // check if update function returns the correct data
      cy.contains('Geändert').should('be.visible');

      // check if checkbox exists and works
      cy.get(`[data-testid="todo-checkbox-${todoId}"]`).should('be.visible').check();

      // check if the to-do is marked as completed
      cy.get(`[data-testid="todo-checkbox-${todoId}"]`).should('be.checked');

      // check if deleted button exists and click it
      cy.get(`[data-testid="delete-todo-button-${todoId}"]`).should('be.visible').click();

      // check if delete button worked
      cy.contains('Geändert').should('not.exist');

      // Logout
      cy.get('[data-testid="logout-button"]').should('be.visible').click();

      // Check if login form is visible again after logout
      cy.get('[data-testid="username"]').should('be.visible');
      cy.get('[data-testid="password"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');

      // Login again as admin
      cy.get('[data-testid="username"]').type('chef');
      cy.get('[data-testid="password"]').type('chef');
      cy.get('[data-testid="login-button"]').click();

      // Check if Name of another to-do-creater is visible
      cy.contains('testuser').should('be.visible');

    });
  });
});