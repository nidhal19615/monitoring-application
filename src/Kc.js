import Keycloak from "keycloak-js";

const kcConfig = {
  url: "http://98.66.206.49:80/realms/your-realm/protocol/openid-connect/auth?client_id=react-app&response_type=code&scope=openid&redirect_uri=http%3A%2F%2Fmy-redirect-url.com%2Fcallback&state=randomState123",
  realm: "cost-dashbord", // Replace with your actual realm name
  clientId: "react-app",
};

const keycloak = new Keycloak(kcConfig);

export default keycloak;
