import { personIcon } from "./constant.js";
import { getIcon, getStatus } from "./helpers.js";
import { ui } from "./ui.js";

/*
We will request permission to access the user's location information.
If permission is granted, we will access this location information and set the related location as the starting point.
If not, a default location will be set.
*/

// Global Variables
var map;
let clickedCords;
let layer;
// ! Parse data from localStorage into a JavaScript object, but if localStorage is empty, render an empty array
let notes = JSON.parse(localStorage.getItem("notes")) || [];

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude], "Current Location");
  },
  (e) => {
    loadMap([43.27696128808375, 5.367081288629515], "Default Location");
  }
);

function loadMap(currentPosition, msg) {
  // Map Setup
  map = L.map("map", {
    zoomControl: false,
  }).setView(currentPosition, 8);

  // Renders the map to the screen
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Create a layer to list markers that will be displayed on the screen( "let" is used in globals before=> check upperside)
  layer = L.layerGroup().addTo(map);

  // Move the zoom buttons to the bottom-right corner of the screen
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);

  // Add a cursor
  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg);

  // Trigger when the map is clicked
  map.on("click", onMapClick);

  // Render notes on the map
  renderMakers();
  renderNotes();
}

// ! Listen for map click events and access the coordinates of the clicked point
function onMapClick(e) {
  // Click event
  clickedCords = [e.latlng.lat, e.latlng.lng];

  ui.aside.classList.add("add");
}

// Function to revert the aside panel when the cancel button is clicked
ui.cancelBtn.addEventListener("click", () => {
  // Remove the 'add' class from the aside
  ui.aside.classList.remove("add");
});

// ! watch the form submission event and trigger a function
ui.form.addEventListener("submit", (e) => {
  // Prevent page refresh
  e.preventDefault();
  // Access the data in the form
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // Create a note object
  const newNote = {
    // Get the value of time passed since 1970 in milliseconds
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCords,
  };

  // Add the new note to the notes array
  notes.unshift(newNote);
  // Update localStorage
  localStorage.setItem("notes", JSON.stringify(notes));

  // Revert the aside panel
  ui.aside.classList.remove("add");

  // Clear the form content
  e.target.reset();

  // Render notes
  renderNotes();
  renderMakers();
});

function renderMakers() {
  // Clear markers on the map
  layer.clearLayers();
  // Add a marker for each item in the notes array
  notes.map((note) => {
    const icon = getIcon(note.status);
    // Create a marker for each note
    L.marker(note.coords, { icon }).addTo(layer).bindPopup(note.title);
  });
}

// ! Function to render notes
function renderNotes() {
  const noteCards = notes
    .map((note) => {
      // Format the date as desired
      const date = new Date(note.date).toLocaleString("en", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const status = getStatus(note.status);

      return `<li>
          <div>
            <p>${note.title}</p>
            <p>${date}</p>
          
            <p>${status}</p>
          </div>
          <div class="icons">
            <i data-id="${note.id}" class="bi bi-airplane-fill" id="fly"></i>
            <i data-id="${note.id}" class="bi bi-trash-fill" id="delete"></i>
          </div>
        </li>`;
    })
    .join("");

  // Add the created card elements to the HTML section
  ui.ul.innerHTML = noteCards;

  // Perform "delete" operation when delete icons are clicked
  document.querySelectorAll("li #delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      deleteNote(id);
    });
  });

  // Focus on the note when fly icons are clicked
  document.querySelectorAll("li #fly").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      flyToLocation(id);
    });
  });
}
// ! Function to delete a note
function deleteNote(id) {
  // Confirm deletion with the user
  const res = confirm("Do you confirm the deletion of the note?");

  if (res) {
    // Remove the element with the known `id` from the notes array
    notes = notes.filter((note) => note.id !== parseInt(id));

    // Update localStorage
    localStorage.setItem("notes", JSON.stringify(notes));

    // Render notes
    renderNotes();

    // Render markers
    renderMakers();
  }
}
// ! Function to move to the corresponding note on the map
function flyToLocation(id) {
  // Find the element with the known id in the notes array
  const note = notes.find((note) => note.id === parseInt(id));

  console.log(note);

  // Fly to the coordinates of the found note
  map.flyTo(note.coords, 12);
}

// ! Function that runs when the arrow icon is clicked
ui.arrow.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});
