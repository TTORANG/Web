import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateShareLink, useShareableVideos } from '@/hooks/queries/useShares';
import { useShareStore } from '@/stores/shareStore';

import { ShareModal } from './ShareModal';

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr'),
  },
}));

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({ projectId: 'p1' })),
}));

vi.mock('@/hooks/queries/useShares', () => ({
  useCreateShareLink: vi.fn(),
  useShareableVideos: vi.fn(),
}));

const mockedUseCreateShareLink = vi.mocked(useCreateShareLink);
const mockedUseShareableVideos = vi.mocked(useShareableVideos);

const shareableVideosFixture = [
  {
    id: 'v1',
    title: '영상 1',
    thumbnailUrl: null,
    createdAt: '2026-02-20T00:00:00.000Z',
  },
  {
    id: 'v2',
    title: '영상 2',
    thumbnailUrl: null,
    createdAt: '2026-02-21T00:00:00.000Z',
  },
];

function mockShareableVideos(videos = shareableVideosFixture) {
  mockedUseShareableVideos.mockReturnValue({
    data: {
      pages: [
        {
          resultType: 'SUCCESS',
          error: null,
          success: {
            videos,
            pagination: {
              currentPage: 1,
              hasNext: false,
              totalCount: videos.length,
            },
          },
        },
      ],
    },
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  } as never);
}

function mockCreateLinkSuccess(url: string) {
  return {
    resultType: 'SUCCESS',
    error: null,
    success: {
      shareUrl: url,
    },
  } as never;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('ShareModal', () => {
  beforeEach(() => {
    useShareStore.setState({
      isShareModalOpen: true,
      shareType: 'slide_script',
      selectedVideoId: null,
      shareUrl: '',
    });
    mockShareableVideos();
  });

  it('모달 오픈 시 기본 공유 타입 링크를 자동 생성한다', async () => {
    const mutateAsync = vi
      .fn()
      .mockResolvedValue(mockCreateLinkSuccess('https://ttorang.app/share/a'));
    mockedUseCreateShareLink.mockReturnValue({ mutateAsync } as never);

    render(<ShareModal />);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
    });
    expect(mutateAsync).toHaveBeenCalledWith({
      projectId: 'p1',
      data: {
        scope: 'slides_script',
        videoId: undefined,
      },
    });
  });

  it('유형을 영상 포함으로 바꾸면 선택 영상으로 자동 생성한다', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi
      .fn()
      .mockResolvedValue(mockCreateLinkSuccess('https://ttorang.app/share/a'));
    mockedUseCreateShareLink.mockReturnValue({ mutateAsync } as never);

    render(<ShareModal />);

    await user.click(screen.getByRole('button', { name: '리허설 영상' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        projectId: 'p1',
        data: {
          scope: 'slides_script_video',
          videoId: 'v1',
        },
      });
    });
  });

  it('영상 변경 시 최신 요청 결과만 링크에 반영한다', async () => {
    const user = userEvent.setup();
    const v1Deferred = deferred<never>();
    const v2Deferred = deferred<never>();
    const mutateAsync = vi.fn(({ data }: { data: { videoId?: string } }) => {
      if (data.videoId === 'v1') return v1Deferred.promise;
      if (data.videoId === 'v2') return v2Deferred.promise;
      return Promise.resolve(mockCreateLinkSuccess('https://ttorang.app/share/slide'));
    });
    mockedUseCreateShareLink.mockReturnValue({ mutateAsync } as never);
    useShareStore.setState({
      isShareModalOpen: true,
      shareType: 'slide_script_video',
      selectedVideoId: 'v1',
      shareUrl: '',
    });

    render(<ShareModal />);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        projectId: 'p1',
        data: {
          scope: 'slides_script_video',
          videoId: 'v1',
        },
      });
    });

    await user.click(screen.getByRole('button', { name: /영상 2/ }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        projectId: 'p1',
        data: {
          scope: 'slides_script_video',
          videoId: 'v2',
        },
      });
    });

    v2Deferred.resolve(mockCreateLinkSuccess('https://ttorang.app/share/v2'));
    await waitFor(() => {
      expect(screen.getByDisplayValue('https://ttorang.app/share/v2')).toBeInTheDocument();
    });

    v1Deferred.resolve(mockCreateLinkSuccess('https://ttorang.app/share/v1'));
    await waitFor(() => {
      expect(screen.getByDisplayValue('https://ttorang.app/share/v2')).toBeInTheDocument();
    });
  });

  it('링크 생성 중에는 복사/SNS 버튼이 비활성화된다', async () => {
    const mutateAsync = vi.fn(() => new Promise(() => {}));
    mockedUseCreateShareLink.mockReturnValue({ mutateAsync } as never);

    render(<ShareModal />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '링크 복사' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '카카오톡으로 공유' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '인스타그램으로 공유' })).toBeDisabled();
    });
  });

  it('QR 버튼을 누르면 QR 다이얼로그가 열린다', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi
      .fn()
      .mockResolvedValue(mockCreateLinkSuccess('https://ttorang.app/share/qr'));
    mockedUseCreateShareLink.mockReturnValue({ mutateAsync } as never);

    render(<ShareModal />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('https://ttorang.app/share/qr')).toBeInTheDocument();
    });

    const qrOpenButton = screen.getByRole('button', { name: 'QR 코드 보기' });
    await user.click(qrOpenButton);
    await waitFor(() => {
      expect(screen.getByAltText('공유 링크 QR 코드')).toBeInTheDocument();
    });
    expect(screen.getByText('공유 QR 코드')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    // 닫힘 애니메이션 동안 QR 이미지는 유지되어야 한다.
    expect(screen.getByAltText('공유 링크 QR 코드')).toBeInTheDocument();

    const qrDialog = screen.getByText('공유 QR 코드').closest('[role="dialog"]');
    expect(qrDialog).not.toBeNull();
    const qrBackdrop = qrDialog?.parentElement;
    expect(qrBackdrop).not.toBeNull();

    if (qrBackdrop) {
      fireEvent.animationEnd(qrBackdrop, { target: qrBackdrop });
    }

    await waitFor(() => {
      expect(screen.queryByText('공유 QR 코드')).not.toBeInTheDocument();
      expect(screen.queryByAltText('공유 링크 QR 코드')).not.toBeInTheDocument();
    });
  });

  it('생성 실패 시 에러를 표시하고 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi
      .fn()
      .mockResolvedValueOnce({
        resultType: 'FAILURE',
        success: null,
        error: {
          errorCode: 'SH001',
          reason: '링크 생성 실패',
        },
      })
      .mockResolvedValueOnce(mockCreateLinkSuccess('https://ttorang.app/share/retry'));
    mockedUseCreateShareLink.mockReturnValue({ mutateAsync } as never);

    render(<ShareModal />);

    await waitFor(() => {
      expect(screen.getByText('링크 생성 실패')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(2);
      expect(screen.getByDisplayValue('https://ttorang.app/share/retry')).toBeInTheDocument();
    });
    expect(screen.queryByText('링크 생성 실패')).not.toBeInTheDocument();
  });
});
