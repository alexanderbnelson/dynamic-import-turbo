import type { Theme } from "@/types/theme";

const themeTwo: Theme = {
  name: "two",
  global: {
    text: "text-primary font-text font-light",
    radius: "rounded-xl",
    imageRadius: "",
    bgColor: "bg-background",
    carouselButtons: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    forms: {
      heading: "",
      description: "",
    },
  },
  markerStyle: "#ff0000",
  nav: {
    container: "flex w-full flex-col text-lg leading-5",
    displayName: "font-display",
    designation: "w-full text-primary/70",
    menuItem: "",
    menu: "no-scrollbar xs:justify-center mb-3 flex items-center",
    buttonVariant: "default",
    buttonStyle: "w-full justify-between gap-2 border-none bg-muted",
    contactButtonVariant: "outline",
    contactButtonStyle: "w-fit justify-between gap-2 pb-1.5",
    signInButtonStyle: "pb-1.5 font-display-secondary text-base",
  },
};

export default themeTwo;