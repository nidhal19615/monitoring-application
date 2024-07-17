cy.visit(Cypress.env("host")); // Our own site
  cy.get(".button").click(); // A login button that starts the process
  cy.get("#username") // The username field on the keycloak login page
    .type(Cypress.env("username"))
    .get("#password")
    .type(Cypress.env("password"));
  cy.get("#kc-login").click();
  cy.wait(300);