"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Hide dropdown when button is clicked inside */
$("#login-dropdown #sign-up-btn").on("click", hideLogin);

/** Hide login dropdown and reset errors */
function hideLogin() {
  $("#login-dropdown").dropdown("toggle");
  // Prevents dropdown from going away on any click
  $("#login-dropdown").unbind("click");
  // Hide error message
  $("#login-err-msg").css("opacity", 0);
}

/** Shows error popovers for 5 seconds */
function showErrorAt(element) {
  $(element).popover("enable");
  $(element).popover("show");
  setTimeout(() => {
    $(element).popover("disable");
    $(element).popover("hide");
  }, 5000);
}

// Reset modal when closed
$("#signup-modal").on("hidden.bs.modal", () => {
  $signupForm.trigger("reset");
});

// Show user edit modal after other one closes
$("#user-edit-open").on("click", () => {
  setTimeout(() => {
    $("#user-edit-modal").modal("show");
  }, 310);
});
