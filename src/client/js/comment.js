import "regenerator-runtime";
const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const videoComments = document.querySelector(".video__comments ul");
const deleteBtn = videoComments.querySelectorAll("button");

const addComment = (text, newCommentId) => {
  const newComment = document.createElement("li");
  const icon = document.createElement("i");
  const span = document.createElement("span");
  const button = document.createElement("button");

  icon.className = "fas fa-comment";
  span.innerText = text;
  button.innerText = "❌";

  newComment.dataset.id = newCommentId;
  newComment.className = "video__comment";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(button);

  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;

  if (!text) {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

const handleDelete = async (event) => {
  const commentId = event.target.parentElement.dataset.comment;
  event.target.parentElement.remove();

  await fetch(`/api/videos/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId }),
  });
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
if (deleteBtn) {
  deleteBtn.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", handleDelete);
  });
}
