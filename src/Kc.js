import Keycloak from "keycloak-js";

const kcConfig = {
  url: "https://10.0.141.223:8443/auth", // /Replace with your actual base URL
  realm: "cost-dashbord", // Replace with your actual realm name
  clientId: "react-app",
};

const keycloak = new Keycloak(kcConfig);

export default keycloak;
