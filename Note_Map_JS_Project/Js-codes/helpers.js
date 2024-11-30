import { goToIcon, homeIcon, parkIcon } from "./constant.js";

// Function to determine the status
export const getStatus = (status) => {
  switch (status) {
    case "goto":
      return "Visit";
    case "home":
      return "Home";
    case "park":
      return "Park";
    case "job":
      return "Job";
    default:
      return "Other";
  }
};

// Function to determine the icon based on the status value
export const getIcon = (status) => {
  switch (status) {
    case "goto":
      return goToIcon;
    case "home":
      return homeIcon;
    case "park":
      return parkIcon;
    case "job":
      return jobIcon;
    default:
      return null;
  }
}; // Define a custom icon for a job or workplace

export const jobIcon = L.icon({
  iconUrl: "../images/briefcase.png",
  iconSize: [50, 50], // Specify the icon size
});
