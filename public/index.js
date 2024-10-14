$(document).ready(function () {
  $(".dropdown-toggle").on("click", function () {
    const gearIcon = $(this).find(".bi-gear");
    gearIcon.toggleClass("spin-on-click");
    setTimeout(function () {
      gearIcon.removeClass("spin-on-click");
    }, 500); // Adjust the delay (in milliseconds) based on your transition duration
  });

  $(".like-button").click(function () {
    var postId = $(this).data("postid");
    var liked = $(this).data("liked");
    var button = $(this);

    $.ajax({
      type: "PUT",
      url: "/post/" + postId + "/like",
      data: { liked: liked },
      success: function (data) {
        button.html(
          data.liked
            ? `${data.post.likes.length} <i class="bi bi-heart-fill"></i>`
            : `${data.post.likes.length} <i class="bi bi-heart"></i>`
        );
        button.data("liked", data.liked);
      },
      error: function (error) {
        console.log(error);
      },
    });
  });
});

function confirmaAndCallFunction(Postid) {
  Swal.fire({
    title: "Are you sure you want to delete your post?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "/deletepost/" + Postid;
    } else {
      window.location.href = "/index";
    }
  });
}

async function openCommentPost(postId) {
  console.log(`Fetching post with ID: ${postId}`);
  try {
    const response = await fetch(`/post/${postId}`);

    // Log the response status
    console.log("Post fetch status:", response.status);

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      const errorText = await response.text(); // Get the response text for more details
      console.error(`Error fetching post: ${response.status} - ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Log the content type to ensure it's JSON
    const contentType = response.headers.get("content-type");
    console.log("Content-Type:", contentType);

    if (contentType && contentType.includes("application/json")) {
      const postData = await response.json(); // Attempt to parse JSON
      console.log("Parsed JSON for post data:", postData);

      if (!postData) {
        Swal.fire("Error", "Could not fetch post and comments.", "error");
        return;
      }
      const postHtml = `
  <div class="post-container">
    <div class="left-column">
      <img src="${postData.post.image}" alt="Post Image" class="post-image">
    </div>
    <div class="right-column">
      <div class="comments-section" id="comments-section">
        <form id="comment-form">
        <input type="text" id="comment-text" placeholder="Type your comment here...">
        <button type="submit">Submit</button>
      </form>
      </div>
      
    </div>
  </div>
`;

      Swal.fire({
        html: postHtml,
        showConfirmButton: false,
        costumClass: {
          popup: "swal-big-popup",
        },
      });
      try {
        if (postData.post.comments.length > 0) {
          for (const comment of postData.post.comments) {
            const userId = comment._user._id;
            const response = await fetch(`/users/${userId}/get`);
            const user = await response.json();
            document.getElementById(
              "comments-section"
            ).innerHTML += `<p><strong>${user.user.name}</strong>: ${comment.comment}</p>`;
          }
        } else {
          document.getElementById("comments-section").innerHTML =
            "<strong>No Comments yet</strong>";
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Swal.fire(
          "Error",
          "There was an issue fetching the user data. Please try again.",
          "error"
        );
      }
    } else {
      console.error("Received non-JSON response for the post.");
      throw new Error("Received non-JSON response");
    }
  } catch (error) {
    console.error("Error fetching post or user data:", error);
    Swal.fire(
      "Error",
      "There was an issue fetching the post or user data. Please try again.",
      "error"
    );
  }

  document
    .getElementById("comment-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const commentText = document.getElementById("comment-text").value;
      try {
        const userResponse = await fetch("/user");
        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error(
            `Error fetching user data: ${userResponse.status} - ${errorText}`
          );
          throw new Error(`HTTP error! Status: ${userResponse.status}`);
        }

        const user = await userResponse.json();
        const newCommentHtml = `<p><strong>${user.name}</strong>: ${commentText}</p>`;
        const commentsSection = document.getElementById("comments-section");

        if (commentsSection.innerText.trim() === "No Comments yet") {
          commentsSection.innerHTML = newCommentHtml;
        } else {
          commentsSection.innerHTML += newCommentHtml;
        }

        document.getElementById("comment-text").value = "";

        await fetch(`/post/${postId}/comment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: commentText }),
        });
      } catch (error) {
        console.error("Error posting comment:", error);
        Swal.fire(
          "Error",
          "There was an issue posting your comment. Please try again.",
          "error"
        );
      }
    });
}
