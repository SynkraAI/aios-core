/**
 * Tests for aios context commands
 * @jest-environment node
 */

const { updateTerminalTitle, clearTerminalTitle } = require('../../../bin/utils/terminal-title');

describe('aios context commands', () => {
  describe('terminal title helper', () => {
    test('builds correct title from session', () => {
      const mockWrite = jest.spyOn(process.stdout, 'write');

      updateTerminalTitle({
        project: { emoji: '🏗️', name: 'test' },
        status: { progress: '2/5', emoji: '⚡', phase: 'dev' }
      });

      expect(mockWrite).toHaveBeenCalled();
      const call = mockWrite.mock.calls[0][0];
      expect(call).toContain('🏗️ test [2/5] ⚡ · dev');

      mockWrite.mockRestore();
    });

    test('clears terminal title', () => {
      const mockWrite = jest.spyOn(process.stdout, 'write');

      clearTerminalTitle();

      expect(mockWrite).toHaveBeenCalled();
      const call = mockWrite.mock.calls[0][0];
      expect(call).toMatch(/\x1b\]0;.*\x07/);

      mockWrite.mockRestore();
    });

    test('handles empty session gracefully', () => {
      const mockWrite = jest.spyOn(process.stdout, 'write');

      updateTerminalTitle(null);
      expect(mockWrite).not.toHaveBeenCalled();

      updateTerminalTitle({});
      expect(mockWrite).not.toHaveBeenCalled();

      mockWrite.mockRestore();
    });

    test('builds partial title when fields missing', () => {
      const mockWrite = jest.spyOn(process.stdout, 'write');

      updateTerminalTitle({
        project: { name: 'test' },
        status: {}
      });

      expect(mockWrite).toHaveBeenCalled();
      const call = mockWrite.mock.calls[0][0];
      expect(call).toContain('test');

      mockWrite.mockRestore();
    });
  });
});
