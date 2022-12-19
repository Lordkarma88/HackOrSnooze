"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-pwd").val();

  if ((username === "") | (password === "")) return;

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.login(username, password);
  } catch (error) {
    $("#login-err-msg").css("opacity", 100);
    return;
  }

  $loginForm.trigger("reset");
  hideLogin();

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  if ((name === "") | (username === "") | (password === "")) return;

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  try {
    currentUser = await User.signup(username, password, name);
  } catch (error) {
    showErrorAt("#signup-username");
    return;
  }

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $("#signup-modal").modal("hide");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/** Handle click of Delete User button */
$("#user-del-btn").on("click", async () => {
  await currentUser.delete();
  logout();
});

/** Handle click of user edit button */
$("#edit-user-form").on("submit", async () => {
  const currPass = $("#current-password").val();
  const newName = $("#new-name").val();
  const newPass1 = $("#new-pass-1").val();
  const newPass2 = $("#new-pass-2").val();

  if (
    // Exit if:
    !currPass | // no currPass OR
    (!newName & !newPass1 & !newPass2) // all others empty
  )
    return;

  // If all others full
  if (!!newName & !!newPass1 & !!newPass2) {
    showErrorAt("#new-name");
    $("#new-name").val("");
    return;
  }

  // If newPass1 & 2 don't match
  if (newPass1 !== newPass2) {
    showErrorAt("#new-pass-2");
    return;
  }

  // If pass is invalid
  try {
    await User.login(currentUser.username, currPass);
  } catch (error) {
    showErrorAt("#current-password");
    return;
  }

  // If newPass same as currPass
  if (currPass === newPass1) {
    showErrorAt("#new-pass-1");
    return;
  }

  const type = newName ? "name" : "password";
  // Edit user api
  if (newName) currentUser = await currentUser.edit(type, newName);
  else currentUser = await currentUser.edit(type, newPass1);

  // Add message at bottom of modal
  $("#edit-user-success .alert").text(`Your ${type} was successfully changed.`);
  $("#edit-user-success").collapse("show");
  setTimeout(() => {
    $("#edit-user-success").collapse("hide");
  }, 5000);
  // Empty forms
  $("#edit-user-form").trigger("reset");
});

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
  if (!currentUser) localStorage.clear();
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 */
function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  // Update all stories to show favs and fill other two lists
  putStoriesOn($allStoriesList, storyList.stories);
  putStoriesOn($favStoriesList, currentUser.favorites);
  putStoriesOn($userStoriesList, currentUser.ownStories);

  // Hide login and show everything else
  $(".nav-link").toggleClass("d-none");
  $navUser.text(`${currentUser.username}`);
}
