# Slide 데이터 흐름 (레거시)

## 1. 컴포넌트 구조

```mermaid
graph TD
    subgraph SlidePage
        URL[URL Params<br/>projectId, slideId]
        MOCK[MOCK_SLIDES]
        URL --> |find| CURRENT[currentSlide]
        MOCK --> CURRENT
    end

    subgraph SlideList
        SL[SlideList]
        ST1[SlideThumbnail]
        ST2[SlideThumbnail]
        ST3[...]
        SL --> ST1
        SL --> ST2
        SL --> ST3
    end

    subgraph SlideWorkspace
        SP[SlideProvider<br/>key=slide.id]

        subgraph Context[SlideContext]
            STATE[(slide state)]
            ACTIONS[updateSlide<br/>updateScript<br/>saveToHistory<br/>restoreFromHistory<br/>deleteOpinion<br/>addReply]
        end

        SV[SlideViewer]
        SB[ScriptBox]

        SP --> Context
        Context --> SV
        Context --> SB
    end

    CURRENT --> SL
    CURRENT --> SP

    subgraph ScriptBox
        SBH[ScriptBoxHeader]
        SBC[ScriptBoxContent]

        SBH --> STT[SlideTitle]
        SBH --> SBE[ScriptBoxEmoji]
        SBH --> SH[ScriptHistory]
        SBH --> OP[CommentPopover]
    end

    SB --> SBH
    SB --> SBC
```

## 2. 읽기 흐름 (Read Flow)

```mermaid
flowchart LR
    subgraph SlideContext
        SLIDE[(slide)]
    end

    subgraph Components
        SV[SlideViewer]
        SBC[ScriptBoxContent]
        STT[SlideTitle]
        SBE[ScriptBoxEmoji]
        SH[ScriptHistory]
        OP[CommentPopover]
    end

    SLIDE -->|title, content| SV
    SLIDE -->|script| SBC
    SLIDE -->|title| STT
    SLIDE -->|emojiReactions| SBE
    SLIDE -->|script, history| SH
    SLIDE -->|opinions| OP
```

## 3. 쓰기 흐름 (Write Flow)

```mermaid
flowchart TD
    subgraph 사용자 액션
        A1[제목 수정 후 저장]
        A2[대본 입력]
        A3[대본 영역 blur]
        A4[변경 기록에서 복원]
        A5[의견 삭제]
        A6[답글 등록]
    end

    subgraph Context Actions
        U1[updateSlide]
        U2[updateScript]
        U3[saveToHistory]
        U4[restoreFromHistory]
        U5[deleteOpinion]
        U6[addReply]
    end

    subgraph State Changes
        S1[slide.title 갱신]
        S2[slide.script 갱신]
        S3[slide.history에 추가]
        S4[slide.script 덮어쓰기]
        S5[slide.opinions에서 제거]
        S6[slide.opinions에 추가]
    end

    A1 --> U1 --> S1
    A2 --> U2 --> S2
    A3 --> U3 --> S3
    A4 --> U4 --> S4
    A5 --> U5 --> S5
    A6 --> U6 --> S6
```

## 4. 슬라이드 전환 흐름

```mermaid
sequenceDiagram
    participant User
    participant SlideList
    participant Router
    participant SlidePage
    participant SlideProvider
    participant Components

    User->>SlideList: 다른 슬라이드 클릭
    SlideList->>Router: navigate(/project/1/slide/3)
    Router->>SlidePage: URL params 변경
    SlidePage->>SlidePage: currentSlide 재계산
    SlidePage->>SlideProvider: slide prop 전달 (새 slide.id)

    Note over SlideProvider: key={slide.id} 변경 감지

    SlideProvider->>SlideProvider: 기존 Provider 언마운트
    SlideProvider->>SlideProvider: 새 Provider 마운트
    SlideProvider->>Components: 새 slide 데이터로 초기화
    Components->>User: UI 업데이트
```

## 5. Context 내부 상태 관리

```mermaid
stateDiagram-v2
    [*] --> Initialized: SlideProvider 마운트<br/>initialSlide로 초기화

    Initialized --> ScriptEditing: updateScript(text)
    ScriptEditing --> ScriptEditing: 계속 입력
    ScriptEditing --> HistorySaved: saveToHistory()<br/>(blur 시)

    HistorySaved --> ScriptEditing: 다시 편집
    HistorySaved --> Restored: restoreFromHistory(item)

    Restored --> ScriptEditing: 복원된 내용 편집

    Initialized --> TitleEditing: updateSlide({title})
    TitleEditing --> Initialized: 저장 완료

    Initialized --> OpinionUpdated: deleteOpinion() / addReply()
    OpinionUpdated --> Initialized

    Initialized --> [*]: 다른 슬라이드로 전환<br/>(Provider 언마운트)
```

## 6. 데이터 구조

```mermaid
classDiagram
    class Slide {
        +string id
        +string title
        +string thumb
        +string content
        +string script
        +OpinionItem[] opinions
        +HistoryItem[] history
        +EmojiReaction[] emojiReactions
    }

    class OpinionItem {
        +number id
        +string author
        +string content
        +string timestamp
        +boolean isMine
        +boolean isReply
        +number parentId
    }

    class HistoryItem {
        +string id
        +string timestamp
        +string content
    }

    class EmojiReaction {
        +string emoji
        +number count
    }

    Slide "1" --> "*" OpinionItem
    Slide "1" --> "*" HistoryItem
    Slide "1" --> "*" EmojiReaction
```

## 7. 컴포넌트별 Context 사용

```mermaid
graph TB
    subgraph useSlide Hook 사용
        SV[SlideViewer<br/>slide.title, content]
        SBC[ScriptBoxContent<br/>slide.script<br/>updateScript, saveToHistory]
        STT[SlideTitle<br/>slide.title<br/>updateSlide]
        SBE[ScriptBoxEmoji<br/>slide.emojiReactions]
        SH[ScriptHistory<br/>slide.script, history<br/>restoreFromHistory]
        OP[CommentPopover<br/>slide.opinions<br/>deleteOpinion, addReply]
    end

    subgraph Props만 사용
        SBH[ScriptBoxHeader<br/>isCollapsed, onToggleCollapse]
        SB[ScriptBox<br/>onCollapsedChange]
    end

    subgraph Provider
        SW[SlideWorkspace<br/>slide prop → Provider]
    end

    SW --> SV
    SW --> SB
    SB --> SBH
    SB --> SBC
    SBH --> STT
    SBH --> SBE
    SBH --> SH
    SBH --> OP
```

## 요약

| 구간                       | 방식     | 설명                            |
| -------------------------- | -------- | ------------------------------- |
| SlidePage → SlideWorkspace | Props    | 선택된 slide 객체 전달          |
| SlideWorkspace 내부        | Context  | useSlide() 훅으로 접근          |
| 슬라이드 전환              | key prop | Provider 재생성으로 상태 초기화 |
