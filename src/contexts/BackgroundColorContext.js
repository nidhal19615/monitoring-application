import { createContext } from "react";

export const backgroundColors = {
  primary: "info",
  //  blue: "blue",
  green: "green",
};

export const BackgroundColorContext = createContext({
  color: backgroundColors.primary,
  changeColor: (color) => {},
});
