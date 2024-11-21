export function showMessage(message, isError = true) {
  const messageContainer = document.getElementById("messageContainer");

  // Set the message content and make the container visible
  messageContainer.textContent = message;
  messageContainer.style.display = "block";

  // Apply styles based on whether it's an error or success message
  messageContainer.style.color = isError ? "red" : "green";
  messageContainer.style.borderColor = isError ? "red" : "green";
  messageContainer.style.backgroundColor = isError ? "#f8d7da" : "#d4edda";

  // Automatically hide the message after 5 seconds
  setTimeout(() => {
    messageContainer.style.display = "none";
  }, 5000);
}
