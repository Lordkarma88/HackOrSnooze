"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
// function navAllStories(evt) {
//   console.debug("navAllStories", evt);
//   hidePageComponents();
//   putStoriesOn($allStoriesList, storyList.stories);
// }

// $body.on("click", "#nav-all", navAllStories);

// /** When a user first logins in, update the navbar to reflect that. */
// function updateNavOnLogin() {
//   console.debug("updateNavOnLogin");
// }

/** Hide dropdown when button is clicked inside */
$("#login-dropdown #sign-up-btn").on("click", hideLogin);

function hideLogin() {
  $("#login-dropdown").dropdown("toggle");
  // Prevents dropdown from going away on any click
  $("#login-dropdown").unbind("click");
  // Hide error message
  $("#login-err-msg").css("opacity", 0);
}

// Reset modal when closed
$("#signup-modal").on("hidden.bs.modal", () => {
  $("#signup-err-msg").css("opacity", 0);
  $signupForm.trigger("reset");
});
