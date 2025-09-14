export interface Theme {
  name: string;
  global: {
    text: string;
    radius: string;
    imageRadius: string;
    bgColor: string;
    carouselButtons: string;
    forms: {
      heading: string;
      description: string;
    };
  };
  markerStyle: string;
  nav: {
    container: string;
    displayName: string;
    designation: string;
    menuItem: string;
    menu: string;
    buttonVariant: string;
    buttonStyle: string;
    contactButtonVariant: string;
    contactButtonStyle: string;
    signInButtonStyle: string;
  };
  // Add more properties as needed for the reproduction
}