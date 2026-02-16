import { beforeEach, describe, expect, it } from 'vitest';

import { useShareStore } from './shareStore';

const { getState } = useShareStore;

function resetStore() {
  useShareStore.setState({
    isShareModalOpen: false,
    step: 'form',
    shareType: 'slide_script',
    selectedVideoId: null,
    shareUrl: '',
  });
}

describe('useShareStore', () => {
  beforeEach(resetStore);

  describe('openShareModal', () => {
    it('opens modal and resets step/url', () => {
      getState().setStep('result');
      getState().setShareUrl('https://old-url');

      getState().openShareModal();

      expect(getState().isShareModalOpen).toBe(true);
      expect(getState().step).toBe('form');
      expect(getState().shareUrl).toBe('');
    });
  });

  describe('closeShareModal', () => {
    it('closes modal', () => {
      getState().openShareModal();
      getState().closeShareModal();
      expect(getState().isShareModalOpen).toBe(false);
    });
  });

  describe('setShareType', () => {
    it('clears videoId when switching to slide_script', () => {
      getState().setSelectedVideoId('v1');
      getState().setShareType('slide_script');
      expect(getState().shareType).toBe('slide_script');
      expect(getState().selectedVideoId).toBeNull();
    });

    it('preserves videoId when switching to slide_script_video', () => {
      getState().setSelectedVideoId('v1');
      getState().setShareType('slide_script_video');
      expect(getState().shareType).toBe('slide_script_video');
      expect(getState().selectedVideoId).toBe('v1');
    });
  });

  describe('workflow', () => {
    it('form → result step transition', () => {
      expect(getState().step).toBe('form');
      getState().setStep('result');
      expect(getState().step).toBe('result');
    });

    it('setShareUrl updates the URL', () => {
      getState().setShareUrl('https://share.url');
      expect(getState().shareUrl).toBe('https://share.url');
    });
  });

  describe('resetForm', () => {
    it('resets all form state', () => {
      getState().setStep('result');
      getState().setShareType('slide_script_video');
      getState().setSelectedVideoId('v1');
      getState().setShareUrl('url');

      getState().resetForm();

      expect(getState().step).toBe('form');
      expect(getState().shareType).toBe('slide_script');
      expect(getState().selectedVideoId).toBeNull();
      expect(getState().shareUrl).toBe('');
    });
  });
});
