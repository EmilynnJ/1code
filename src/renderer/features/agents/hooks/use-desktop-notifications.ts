// Desktop notifications hook for desktop app

export function useDesktopNotifications() {
  return {
    showNotification: (title: string, body: string) => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, { body })
      }
    },
    notifyAgentComplete: (chatName: string) => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Agent finished', { body: `${chatName} completed the task` })
      }
    },
    requestPermission: () => {
      if (typeof Notification !== 'undefined') {
        return Notification.requestPermission()
      }
      return Promise.resolve('granted' as NotificationPermission)
    },
  }
}
