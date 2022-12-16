"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story. */
function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$("#submitStory").on("click", async () => {
  // Get values from form
  const author = $("#submitAuthor").val();
  const title = $("#submitTitle").val();
  const url = $("#submitUrl").val();

  // Do nothing if form is empty
  if ((author === "") | (title === "")) return;
  // Check if url is valid
  try {
    new URL(url);
  } catch (error) {
    // If invalid, show popover for 5 sec (defined in index.html)
    $("#submitUrl").popover("show");
    setTimeout(() => {
      $("#submitUrl").popover("hide");
    }, 5000);
    return;
  }

  // Post story to API
  const story = await StoryList.addStory(currentUser, { title, author, url });
  // Add story to global var
  storyList.stories.unshift(story);
  putStoriesOnPage();

  // Dismiss and empty modal
  $("#submitModal").modal("hide");
  $("#submitAuthor").val("");
  $("#submitTitle").val("");
  $("#submitUrl").val("");
});
