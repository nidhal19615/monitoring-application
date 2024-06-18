import Keycloak from "keycloak-js";

const kcConfig = {
  url: "http://98.66.206.49/auth/", // /Replace with your actual base URL
  realm: "cost-dashbord", // Replace with your actual realm name
  clientId: "react-app",
};

const keycloak = new Keycloak(kcConfig);

export default keycloak;
