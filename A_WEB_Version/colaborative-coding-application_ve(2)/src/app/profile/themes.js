import { extendTheme } from "@chakra-ui/react";

const themes = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});
export default themes;
