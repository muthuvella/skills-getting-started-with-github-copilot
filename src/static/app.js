document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select before repopulating to avoid duplicate options
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Helper function to escape HTML special characters
      function escapeHTML(str) {
        return str.replace(/[&<>"'`=\/]/g, function (s) {
          return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#96;',
            '=': '&#61;',
            '/': '&#47;'
          })[s];
        });
      }

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          // Render each participant with a delete icon/button
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list no-bullets">
                ${details.participants
                  .map(
                    (email) =>
                      `<li class="participant-item"><span class="participant-email">${escapeHTML(email)}</span> <button class="unregister-btn" data-activity="${encodeURIComponent(
                        name
                      )}" data-email="${encodeURIComponent(email)}" title="Unregister">✖</button></li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section no-participants">
              <em>No participants yet.</em>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    
      // (unregister click handler is registered once outside fetchActivities)
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the newly-registered participant appears
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
    const activity = decodeURIComponent(btn.dataset.activity);
    const email = decodeURIComponent(btn.dataset.email);

    // Basic sanitization to prevent XSS in confirm dialog
    function sanitize(str) {
      return String(str).replace(/[<>&"'`]/g, c => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
      }[c]));
    }

    const safeActivity = sanitize(activity);
    const safeEmail = sanitize(email);

    if (!confirm(`Unregister ${safeEmail} from ${safeActivity}?`)) return;
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Register a single event delegation handler for unregister buttons
  activitiesList.addEventListener("click", async (e) => {
    const btn = e.target.closest(".unregister-btn");
    if (!btn) return;

    const activity = decodeURIComponent(btn.dataset.activity);
    const email = decodeURIComponent(btn.dataset.email);

    if (!confirm(`Unregister ${email} from ${activity}?`)) return;

    try {
      const resp = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const result = await resp.json();
      if (resp.ok) {
        // refresh activities to update UI
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Failed to unregister";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
        setTimeout(() => messageDiv.classList.add("hidden"), 5000);
      }
    } catch (err) {
      console.error("Error unregistering:", err);
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      setTimeout(() => messageDiv.classList.add("hidden"), 5000);
    }
  });

  // Initialize app
  fetchActivities();
});
