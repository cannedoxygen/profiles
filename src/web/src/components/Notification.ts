import "./Notification.less";

// Define notification types
export type NotificationType = "success" | "error" | "info" | "warning";

// Interface for notification object
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
  actionLabel?: string;
  actionCallback?: () => void;
}

// Global notification counter for unique IDs
let notificationCounter = 0;

/**
 * Show a notification of a specific type
 * @param type The notification type: "success", "error", "info", or "warning"
 * @param message The message to display
 * @param duration How long to show the notification in ms (default: 5000, 0 = indefinite)
 * @param actionLabel Optional label for the action button
 * @param actionCallback Optional callback function for the action button
 */
export function notify(
  type: NotificationType,
  message: string,
  duration = 5000,
  actionLabel?: string,
  actionCallback?: () => void
): void {
  // Create a unique ID for this notification
  const id = `tardinator-notification-${Date.now()}-${notificationCounter++}`;
  
  // Create the notification element
  const notification = document.createElement("div");
  notification.classList.add("notification", `notification-${type}`);
  notification.setAttribute("role", "alert");
  notification.id = id;
  
  // Create the content container
  const contentContainer = document.createElement("div");
  contentContainer.classList.add("notification-content");
  
  // Create icon based on type
  const iconContainer = document.createElement("div");
  iconContainer.classList.add("notification-icon");
  iconContainer.innerHTML = getIconForType(type);
  contentContainer.appendChild(iconContainer);
  
  // Add message
  const messageElement = document.createElement("div");
  messageElement.classList.add("notification-message");
  messageElement.textContent = message;
  contentContainer.appendChild(messageElement);
  
  notification.appendChild(contentContainer);
  
  // Create actions container
  const actionsContainer = document.createElement("div");
  actionsContainer.classList.add("notification-actions");
  
  // Add action button if provided
  if (actionLabel && actionCallback) {
    const actionButton = document.createElement("button");
    actionButton.classList.add("notification-action");
    actionButton.textContent = actionLabel;
    actionButton.addEventListener("click", () => {
      actionCallback();
    });
    actionsContainer.appendChild(actionButton);
  }
  
  // Add dismiss button
  const dismissButton = document.createElement("button");
  dismissButton.classList.add("notification-dismiss");
  dismissButton.setAttribute("aria-label", "Dismiss");
  dismissButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18.3 5.7c-.4-.4-1-.4-1.4 0L12 10.6 7.1 5.7c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l4.9 4.9-4.9 4.9c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3L12 13.4l4.9 4.9c.2.2.4.3.7.3.3 0 .5-.1.7-.3.4-.4.4-1 0-1.4L13.4 12l4.9-4.9c.4-.4.4-1 0-1.4z"/></svg>';
  dismissButton.addEventListener("click", () => {
    removeNotification(notification);
  });
  actionsContainer.appendChild(dismissButton);
  
  notification.appendChild(actionsContainer);
  
  // If duration is specified and greater than 0, set a timer to remove the notification
  if (duration > 0) {
    // Add progress bar
    const progressBar = document.createElement("div");
    progressBar.classList.add("notification-progress");
    progressBar.style.animationDuration = `${duration}ms`;
    notification.appendChild(progressBar);
    
    // Set timeout to remove notification
    setTimeout(() => {
      removeNotification(notification);
    }, duration);
  }
  
  // Get or create the notification container
  let container = document.querySelector(".notification-container");
  if (!container) {
    container = document.createElement("div");
    container.classList.add("notification-container");
    document.body.appendChild(container);
  }
  
  // Add the notification to the container
  container.appendChild(notification);
  
  // Trigger enter animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);
}

/**
 * Remove a notification element with animation
 */
function removeNotification(notification: HTMLElement): void {
  notification.classList.remove("show");
  notification.classList.add("hide");
  
  // Remove the element after animation completes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
      
      // Check if container is empty, if so remove it
      const container = document.querySelector(".notification-container");
      if (container && container.children.length === 0) {
        container.parentNode?.removeChild(container);
      }
    }
  }, 300); // Match animation duration in CSS
}

/**
 * Get the appropriate icon SVG for a notification type
 */
function getIconForType(type: NotificationType): string {
  switch (type) {
    case "success":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/></svg>';
    case "error":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>';
    case "warning":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>';
    case "info":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/></svg>';
  }
}

/**
 * Display a success notification
 */
export function notifySuccess(message: string, duration?: number, actionLabel?: string, actionCallback?: () => void): void {
  notify("success", message, duration, actionLabel, actionCallback);
}

/**
 * Display an error notification
 */
export function notifyError(message: string, duration?: number, actionLabel?: string, actionCallback?: () => void): void {
  notify("error", message, duration, actionLabel, actionCallback);
}

/**
 * Display an info notification
 */
export function notifyInfo(message: string, duration?: number, actionLabel?: string, actionCallback?: () => void): void {
  notify("info", message, duration, actionLabel, actionCallback);
}

/**
 * Display a warning notification
 */
export function notifyWarning(message: string, duration?: number, actionLabel?: string, actionCallback?: () => void): void {
  notify("warning", message, duration, actionLabel, actionCallback);
}

/**
 * Clear all notifications immediately
 */
export function clearAllNotifications(): void {
  const container = document.querySelector(".notification-container");
  if (container) {
    container.parentNode?.removeChild(container);
  }
}

// For backward compatibility with the existing codebase
export function notifyOkay(message: string): void {
  notifySuccess(message);
}