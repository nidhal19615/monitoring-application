import Keycloak from "keycloak-js";

const Kc = new Keycloak({
  url: "http://98.66.206.49/auth", // Note: Use /auth at the end of the URL for Keycloak server
  realm: "cost-dashbord",
  clientId: "react-app",
});

export default Kc;
