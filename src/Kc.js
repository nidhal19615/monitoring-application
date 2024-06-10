import Keycloak from "keycloak-js";

const Kc = new Keycloak({
  ///  url: "http://localhost:8890",
  url: "http://10.0.195.148:31503",
  realm: "cost-dashbord",
  clientId: "react-app",
});

export default Kc;
