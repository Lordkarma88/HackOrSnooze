"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOn($allStoriesList, storyList.stories);
  if (currentUser) {
    putStoriesOn($favStoriesList, currentUser.favorites);
    putStoriesOn($userStoriesList, currentUser.ownStories);
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story. */
function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  let favMkup,
    delMkup = "";
  if (currentUser) {
    // Get if fav or not
    const isFav = currentUser.favorites.some(
      (st) => st.storyId === story.storyId
    );
    favMkup = isFav ? "-solid fav fa-" : "-regular fa-";

    const isUsr = currentUser.ownStories.some(
      (st) => st.storyId === story.storyId
    );
    delMkup = isUsr ? "fa-regular fa-trash-can" : "display-none";
  }

  const hostName = story.getHostName();
  return $(`
      <li data-id="${story.storyId}">
        <i class="fa${favMkup}star"></i>
        <i class="${delMkup}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Takes element location and list of stories, generates their HTML,
 *  and puts on selected element. */
function putStoriesOn($element, stories) {
  console.debug("putStoriesOn", $element);

  $element.empty();

  // Show placeholder message if empty
  if (stories.length === 0) {
    $element.append("No stories yet!");
  }

  // loop through all of our stories and generate HTML for them
  for (let story of stories) {
    const $story = generateStoryMarkup(story);
    $element.append($story);
  }

  $element.show();
}

// Submit story handling
$("#submit-story").on("click", async () => {
  console.debug("submitting story");
  // Get values from form
  const author = $("#submit-author").val();
  const title = $("#submit-title").val();
  const url = $("#submit-url").val();

  // Do nothing if form is empty
  if ((author === "") | (title === "")) return;
  // Check if url is valid
  try {
    new URL(url);
  } catch (error) {
    // If invalid, show popover for 5 sec (defined in index.html)
    $("#submit-url").popover("show");
    setTimeout(() => {
      $("#submit-url").popover("hide");
    }, 5000);
    return;
  }

  // Post story to API
  const story = await StoryList.addStory(currentUser, { title, author, url });
  // Add story to global var
  storyList.stories.unshift(story);
  currentUser.ownStories.push(story);
  putStoriesOn($allStoriesList, storyList.stories);
  putStoriesOn($userStoriesList, currentUser.ownStories);

  // Dismiss and empty modal
  $("#submit-modal").modal("hide");
  $("#submit-form").trigger("reset");
});

// Removes story from a list by filtering out by id
function rmStoryFrom(list, id) {
  return list.filter(({ storyId }) => storyId !== id);
}

async function toggleFav(evt) {
  const $icon = $(evt.target);
  const id = $icon.parent().data("id");

  const action = $icon.hasClass("fav") ? "rm" : "add";

  // Toggle solid and fav classes in all lists
  $(`[data-id|="${id}"] i.fa-star`).toggleClass("fav fa-solid fa-regular");

  // Add or remove story from user api favs
  await currentUser.favStory(action, id);

  if (action === "add") {
    // Add story to favs
    const story = storyList.stories.find((st) => st.storyId === id);
    currentUser.favorites.push(story);
  } else {
    // Remove story from favs
    currentUser.favorites = rmStoryFrom(currentUser.favorites, id);
  }

  // Modify favorites modal list
  putStoriesOn($favStoriesList, currentUser.favorites);
}

async function rmStory(evt) {
  const $icon = $(evt.target);
  const id = $icon.parent().data("id");

  // Delete all li elements with data-id=<id>
  $(`[data-id|="${id}"]`).remove();

  // Remove story from api
  await currentUser.delStory(id);

  // Remove story from all story lists
  currentUser.favorites = rmStoryFrom(currentUser.favorites, id);
  currentUser.ownStories = rmStoryFrom(currentUser.ownStories, id);
  storyList.stories = rmStoryFrom(storyList.stories, id);
}

// Event listeners for clicking on stars or trash
$(".stories-list").on("click", ".fa-star", toggleFav);
$(".stories-list").on("click", ".fa-trash-can", rmStory);
