import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { initAutoUpdater } from './auto-updater'
import log from 'electron-log'

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn()
  },
  app: {
    isPackaged: true,
    getVersion: vi.fn(() => '1.0.0')
  }
}))

vi.mock('electron-updater', () => ({
  autoUpdater: {
    downloadUpdate: vi.fn(),
    on: vi.fn(),
    setFeedURL: vi.fn(),
    logger: null
  }
}))

vi.mock('electron-log', () => ({
  default: {
    transports: {
      file: { level: '' }
    },
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('auto-updater update:download IPC handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when download succeeds', async () => {
    let downloadHandler: any;
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      if (channel === 'update:download') {
        downloadHandler = handler;
      }
    });

    await initAutoUpdater(() => null);

    expect(downloadHandler).toBeDefined();

    vi.mocked(autoUpdater.downloadUpdate).mockResolvedValue(['some-path'] as any);

    const result = await downloadHandler();

    expect(autoUpdater.downloadUpdate).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it('should return false and log error when download fails', async () => {
    let downloadHandler: any;
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      if (channel === 'update:download') {
        downloadHandler = handler;
      }
    });

    await initAutoUpdater(() => null);

    expect(downloadHandler).toBeDefined();

    const error = new Error('Download failed');
    vi.mocked(autoUpdater.downloadUpdate).mockRejectedValue(error);

    const result = await downloadHandler();

    expect(autoUpdater.downloadUpdate).toHaveBeenCalledOnce();
    expect(log.error).toHaveBeenCalledWith('[AutoUpdater] Download failed:', error);
    expect(result).toBe(false);
  });
});
