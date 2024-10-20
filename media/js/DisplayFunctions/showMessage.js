// showMessage.js

export function showMessage(message, isError = true) {
  const messageContainer = document.getElementById("messageContainer");
  messageContainer.textContent = message;
  messageContainer.style.display = "block";

  // Optional: Change color or styling based on message type
  messageContainer.style.color = isError ? "red" : "green";
  messageContainer.style.borderColor = isError ? "red" : "green";
  messageContainer.style.backgroundColor = isError ? "#f8d7da" : "#d4edda";

  // Automatically hide the message after 5 seconds
  setTimeout(() => {
    messageContainer.style.display = "none";
  }, 5000);
}
