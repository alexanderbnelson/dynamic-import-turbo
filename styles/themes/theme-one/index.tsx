import type { Theme } from "@/types/theme";
import "./theme-one.css";

const themeOne: Theme = {
  name: "one",
  global: {
    text: "text-primary font-text font-light",
    radius: "rounded-3xl",
    imageRadius: "",
    bgColor: "bg-background",
    carouselButtons: "bg-primary text-primary-foreground hover:bg-primary/80",
    forms: {
      heading: "",
      description: "",
    },
  },
  markerStyle: "#000",
  nav: {
    container: "flex w-full flex-col text-lg leading-5",
    displayName: "font-display",
    designation: "w-full text-primary/70",
    menuItem: "",
    menu: "no-scrollbar xs:justify-center mb-3 flex items-center",
    buttonVariant: "outline",
    buttonStyle: "w-full justify-between gap-2 border-none bg-muted",
    contactButtonVariant: "default",
    contactButtonStyle: "w-fit justify-between gap-2 pb-1.5",
    signInButtonStyle: "pb-1.5 font-display-secondary text-base",
  },
};

export default themeOne;