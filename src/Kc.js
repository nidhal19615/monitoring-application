import Keycloak from "keycloak-js";

const Kc = new Keycloak({
  /// url: "http://10.224.0.29:8080/auth",
  // url: "http://10.224.0.29:8443/auth",
  url: "https://my-keycloak-http:8443/auth",
  realm: "cost-dashbord",
  clientId: "react-app",
});

export default Kc;
