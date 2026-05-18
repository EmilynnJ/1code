// Desktop notifications hook for desktop app

export function useDesktopNotifications() {
  return {
    showNotification: (title: string, body: string) => {
      if (typeof window !== "undefined" && window.desktopApi) {
        window.desktopApi.showNotification({ title, body })
      } else if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title, { body })
        }
      }
    },
    notifyAgentComplete: (chatName: string) => {
      const title = "Agent Complete"
      const body = chatName ? `Task completed in ${chatName}` : "Agent completed task"

      if (typeof window !== "undefined" && window.desktopApi) {
        window.desktopApi.showNotification({ title, body })
      } else if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title, { body })
        }
      }
    },
    requestPermission: async () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        return Notification.requestPermission()
      }
      return Promise.resolve("default" as NotificationPermission)
    },
  }
}
