// cypress/integration/ram_chart.spec.js

describe("Ram Chart Component", () => {
  beforeEach(() => {
    cy.visit("http://98.66.240.17/admin/RamChart"); // Adjust the path to where your component is rendered
  });

  it("should render the RAM Chart component", () => {
    cy.contains("RAM Usage Chart", { timeout: 10000 }).should("exist");
  });

  it("should display filter options", () => {
    cy.get("#filter-type-select").should("exist");
    cy.get("#filter-type-select").click();
    cy.get("ul > li").contains("Year").should("exist");
    cy.get("ul > li").contains("Month").should("exist");
    cy.get("ul > li").contains("Week").should("exist");
    cy.get("ul > li").contains("Custom").should("exist");
  });

  it("should change filter type to Year and display year options", () => {
    cy.get("#filter-type-select").click(); // Open the dropdown
    cy.get("ul > li").contains("Year").click(); // Select 'Year'
    cy.get("#year-select").should("exist");
    cy.get("#year-select").click(); // Open the year dropdown
    cy.get('[role="option"]').should("have.length", 10); // Assuming 10 years are displayed
  });

  it("should change filter type to Month and display month options", () => {
    cy.get("#filter-type-select").click(); // Open the dropdown
    cy.get("ul > li").contains("Month").click(); // Select 'Month'
    cy.get("#month-select").should("exist");
    cy.get("#month-select").click(); // Open the month dropdown
    cy.get('[role="option"]').should("have.length", 12); // 12 months in a year
  });

  it("should change filter type to Week and display week options", () => {
    cy.get("#filter-type-select").click(); // Open the dropdown
    cy.get("ul > li").contains("Week").click(); // Select 'Week'
    cy.get("#month-select").should("exist");
    cy.get("#week-select").should("exist");
    cy.get("#week-select").click(); // Open the week dropdown
    cy.get('[role="option"]').should("have.length", 5); // 4 weeks in a month
  });

  it("should change filter type to Custom and display date pickers", () => {
    cy.get("#filter-type-select").click(); // Open the dropdown
    cy.get('[role="option"]').contains("Custom").click(); // Select 'Custom'

    // Interact with the DateTimePicker component
    cy.contains("label", "Start Date and Time").parent().find("input").click();
    cy.contains("label", "End Date and Time").parent().find("input").click();
    
  });
 

  it("should display loading spinner when fetching data", () => {
    cy.intercept("GET", "http://98.66.205.79/api/v1/query_range", {
      delay: 1000, ///Simulate network delay
      fixture: "ram_data.json", // Use fixture data for testing
    }).as("fetchRamData");

    cy.get("#filter-type-select").click(); // Open the dropdown
    cy.get("ul > li").contains("Year").click(); // Select 'Year'
    cy.get("#year-select").click(); // Open the year dropdown
    cy.get("ul > li").contains("2023").click(); // Select the year 2023
   /// cy.get("button").contains("Fetch Data").click(); // Assuming there's a button to fetch data

    cy.get(".MuiCircularProgress-root").should("exist"); // Check for loading spinner
  
  });

  it("should display error message on fetch failure", () => {
    cy.intercept("GET", "http://98.66.205.79/api/v1/query_range*", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("fetchRamDataError");

    cy.get("#filter-type-select").click(); // Open the dropdown
    cy.get("ul > li").contains("Year").click(); // Select 'Year'
    cy.get("#year-select").click(); // Open the year dropdown
    cy.get('[role="option"]').contains("2023").click(); // Select the year 2023
   

    cy.wait("@fetchRamDataError");
    cy.get("p")
      .contains("Failed to fetch data. Please try again later.")
      .should("exist");
  });
});
