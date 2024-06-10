import Keycloak from "keycloak-js";

const Kc = new Keycloak({
    url: "http://localhost:8890",
  // url: "http://10.0.141.223:31503",
 // url: "http://98.66.206.49:80/",
  realm: "cost-dashbord",
  clientId: "react-app",
});

export default Kc;
