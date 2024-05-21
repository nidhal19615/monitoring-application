import Keycloak from "keycloak-js";

const Kc = new Keycloak({
  url: "http://localhost:8890",
  realm: "cost-dashbord",
  clientId: "react-app",
  
});

export default Kc;
