const mobileMenu = document.querySelector("#mobileMenu");
function showMenu() {
  mobileMenu.classList.remove("hidden");
}
function closeSB() {
  mobileMenu.classList.add("hidden");
}

// document.addEventListener('click', function(e) {
//     if (!mobileMenu.contains(e.target)) {
//         closeSB();
//     }
// });

let selectedDate = null;
let selectedTime = null;
let selectedDateKey = null;
const bookedSlotsByDate = {};

async function fetchBookedSlots(dateKey) {
  const res = await fetch(
    `/api/booked-slots?date=${encodeURIComponent(dateKey)}&doctorId=${doctorId}`
  );
  const booked = await res.json();
  bookedSlotsByDate[dateKey] = booked;
  generateTimeSlots(dateKey);
}

// Generate dates for the next 14 days
function generateDates() {
  const dateGrid = document.getElementById("dateGrid");
  const today = new Date();

  for (let i = 0; i < 21; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateButton = document.createElement("button");
    dateButton.className =
      "p-3 text-center border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200";
    dateButton.innerHTML = `
                    <div class="text-xs text-gray-500 uppercase">${date.toLocaleDateString(
                      "en-US",
                      { weekday: "short" }
                    )}</div>
                    <div class="text-lg font-semibold text-gray-800">${date.getDate()}</div>
                    <div class="text-xs text-gray-500">${date.toLocaleDateString(
                      "en-US",
                      { month: "short" }
                    )}</div>
                `;

    dateButton.addEventListener("click", () => selectDate(date, dateButton));
    dateGrid.appendChild(dateButton);
  }
}

// Convert time string to minutes for comparison
function timeToMinutes(timeStr) {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

// Generate time slots based on selected date
function generateTimeSlots(dateKey = null) {
  const timeSlots = document.getElementById("timeSlots");
  timeSlots.innerHTML = ""; // Clear existing slots

  const slots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
  ];

  // Get booked slots for the selected date
  const bookedSlots = dateKey ? bookedSlotsByDate[dateKey] || [] : [];

  // Check if selected date is today
  const today = new Date();
  const isToday = dateKey === today.toDateString();

  // Get current time in minutes + 30 minutes buffer
  const now = new Date();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const minimumBookingTime = currentTimeInMinutes + 30;

  slots.forEach((slot) => {
    const timeButton = document.createElement("button");
    const isBooked = bookedSlots.includes(slot);

    // Check if slot is in the past or too close to current time (only for today)
    const slotTimeInMinutes = timeToMinutes(slot);
    const isPastOrTooClose = isToday && slotTimeInMinutes < minimumBookingTime;

    const isUnavailable = isBooked || isPastOrTooClose;

    timeButton.className = `time-slot p-3 text-center border border-gray-200 rounded-lg font-medium ${
      isUnavailable ? "booked" : "hover:bg-blue-50 hover:border-blue-300"
    }`;
    timeButton.textContent = slot;
    timeButton.disabled = isUnavailable;

    if (isBooked) {
      timeButton.innerHTML = slot + '<div class="text-xs mt-1">Booked</div>';
    } else if (isPastOrTooClose) {
      timeButton.innerHTML =
        slot + '<div class="text-xs mt-1">Unavailable</div>';
    }

    if (!isUnavailable) {
      timeButton.addEventListener("click", () => selectTime(slot, timeButton));
    }

    timeSlots.appendChild(timeButton);
  });
}

function selectDate(date, button) {
  // Remove previous selection
  document.querySelectorAll("#dateGrid button").forEach((btn) => {
    btn.classList.remove("bg-gray-800", "text-white", "border-gray-800");
    btn.classList.add("bg-white", "text-gray-800", "border-gray-200");
    // Reset text colors for individual elements
    const dayElements = btn.querySelectorAll("div");
    dayElements.forEach((el) => {
      el.classList.remove("text-white", "text-gray-200");
      if (el.classList.contains("text-lg")) {
        el.classList.add("text-gray-800");
      } else {
        el.classList.add("text-gray-500");
      }
    });
  });

  // Add selection to clicked button with inverted colors
  button.classList.remove("bg-white", "text-gray-800", "border-gray-200");
  button.classList.add("bg-gray-800", "text-white", "border-gray-800");

  // Invert text colors for selected button
  const dayElements = button.querySelectorAll("div");
  dayElements.forEach((el) => {
    el.classList.remove("text-gray-500", "text-gray-800");
    if (el.classList.contains("text-lg")) {
      el.classList.add("text-white");
    } else {
      el.classList.add("text-gray-200");
    }
  });

  selectedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  selectedDateKey = date.toDateString();
  selectedTime = null; // Reset time selection when date changes

  // Regenerate time slots for the selected date
  fetchBookedSlots(selectedDateKey);

  updateSummary();
}

function selectTime(time, button) {
  // Remove previous selection
  document.querySelectorAll(".time-slot").forEach((btn) => {
    btn.classList.remove("selected");
  });

  // Add selection to clicked button
  button.classList.add("selected");
  selectedTime = time;

  updateSummary();
}

function updateSummary() {
  const summary = document.getElementById("appointmentSummary");
  const bookButton = document.getElementById("bookButton");

  if (selectedDate && selectedTime) {
    document.getElementById("selectedDate").textContent = selectedDate;
    document.getElementById("selectedTime").textContent = selectedTime;
    summary.classList.remove("hidden");
    bookButton.disabled = false;
  } else {
    summary.classList.add("hidden");
    bookButton.disabled = true;
  }
}

// Book appointment
document
  .getElementById("bookButton")
  .addEventListener("click", async function () {
    if (selectedDate && selectedTime && selectedDateKey) {
      try {
        // Send POST request to backend to save slot
        const response = await fetch("/api/book-slot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedDateKey,
            time: selectedTime,
            doctorId,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to book slot");
        }

        // Fetch updated slots from DB
        await fetchBookedSlots(selectedDateKey);

        // Show success
        const successMessage = document.getElementById("successMessage");
        successMessage.classList.remove("hidden");
        document.getElementById("appointmentSummary").classList.add("hidden");
        document.getElementById("bookButton").disabled = true;
        selectedTime = null;

        successMessage.scrollIntoView({ behavior: "smooth" });

        setTimeout(() => {
          successMessage.classList.add("hidden");
        }, 5000);
      } catch (err) {
        alert("Booking failed. Try again.");
        console.error(err);
      }
    }
  });

generateDates();

// Profile dropdown functionality
const profileDropdown = document.getElementById("profileDropdown");
const profileMenu = document.getElementById("profileMenu");

function toggleProfileMenu() {
  profileMenu.classList.toggle("hidden");
}

function closeProfileMenu() {
  profileMenu.classList.add("hidden");
}

// Event listeners
profileDropdown.addEventListener("click", function (e) {
  e.stopPropagation();
  toggleProfileMenu();
});

// Close dropdown when clicking outside
document.addEventListener("click", function (e) {
  if (!profileDropdown.contains(e.target) && !profileMenu.contains(e.target)) {
    closeProfileMenu();
  }
});
