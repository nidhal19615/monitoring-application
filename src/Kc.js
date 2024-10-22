import Keycloak from "keycloak-js";

const Kc = new Keycloak({
  /// url: "http://10.224.0.29:8080/auth",
  // url: "http://10.224.0.29:8443/auth",

 // url: "http://localhost:8890/",
  url: "http://98.66.206.49/auth", 

  realm: "cost-dashbord",
  clientId: "react-app",
});

export default Kc;
