import type { SlideDetail } from './slide';

/**
 * 녹화용 슬라이드 데이터
 *
 * SlideListItem 타입에서 녹화에 필요한 필드만 추출
 */
export interface RecordingSlide {
  id: string;
  page: number;
  imageUrl: string;
  script: string;
  title: string;
}

/**
 * 녹화 프로젝트 데이터
 *
 * 영상 녹화에 필요한 프로젝트 정보와 슬라이드 목록
 */
export interface RecordingProject {
  projectId: string;
  title: string;
  slides: RecordingSlide[];
}

/**
 * SlideListItem 배열을 RecordingSlide 배열로 변환
 */
export function convertToRecordingSlides(
  slides: SlideDetail[],
  projectId: string,
): RecordingSlide[] {
  return slides.map((slide, index) => ({
    id: slide.slideId,
    page: index + 1,
    imageUrl: slide.imageUrl || `/thumbnails/${projectId}/${index}.webp`,
    script: slide.script || '',
    title: slide.title,
  }));
}

/**
 * SlideListItem 배열로부터 RecordingProject 생성
 */
export function createRecordingProject(
  projectId: string,
  projectTitle: string,
  slides: SlideDetail[],
): RecordingProject {
  return {
    projectId,
    title: projectTitle,
    slides: convertToRecordingSlides(slides, projectId),
  };
}
