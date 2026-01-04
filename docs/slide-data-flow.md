# Slide 데이터 흐름

## 1. 전체 아키텍처

```mermaid
graph TB
    subgraph Pages
        SP[SlidePage]
    end

    subgraph Store
        ZS[(Zustand Store<br/>slideStore)]
    end

    subgraph Components
        SL[SlideList]
        SW[SlideWorkspace]
        SV[SlideViewer]
        SB[ScriptBox]
        SBH[ScriptBoxHeader]
        SBC[ScriptBoxContent]
        STT[SlideTitle]
        SBE[ScriptBoxEmoji]
        SH[ScriptHistory]
        OP[Opinion]
    end

    SP -->|slides| SL
    SP -->|slide| SW
    SW -->|initSlide| ZS

    ZS -.->|title, content| SV
    ZS -.->|script| SBC
    ZS -.->|title| STT
    ZS -.->|emojiReactions| SBE
    ZS -.->|script, history| SH
    ZS -.->|opinions| OP

    SW --> SV
    SW --> SB
    SB --> SBH
    SB --> SBC
    SBH --> STT
    SBH --> SBE
    SBH --> SH
    SBH --> OP
```

## 2. 컴포넌트 계층 구조

```mermaid
graph TD
    subgraph SlidePage
        URL[URL Params]
        MOCK[MOCK_SLIDES]
    end

    subgraph SlideList[SlideList - Props]
        ST1[SlideThumbnail]
        ST2[SlideThumbnail]
        ST3[...]
    end

    subgraph SlideWorkspace[SlideWorkspace - Store 초기화]
        direction TB
        INIT[useEffect → initSlide]

        subgraph SlideViewer[SlideViewer]
            SV_SEL[selector: title, content]
        end

        subgraph ScriptBox[ScriptBox]
            subgraph ScriptBoxHeader[ScriptBoxHeader]
                subgraph SlideTitle[SlideTitle]
                    STT_SEL[selector: title]
                end
                subgraph ScriptBoxEmoji[ScriptBoxEmoji]
                    SBE_SEL[selector: emojiReactions]
                end
                subgraph ScriptHistory[ScriptHistory]
                    SH_SEL[selector: script, history]
                end
                subgraph Opinion[Opinion]
                    OP_SEL[selector: opinions]
                end
            end
            subgraph ScriptBoxContent[ScriptBoxContent]
                SBC_SEL[selector: script]
            end
        end
    end

    URL --> SlideWorkspace
    MOCK --> SlideWorkspace
    MOCK --> SlideList
```

## 3. Selector 기반 구독 (리렌더링 최적화)

```mermaid
flowchart LR
    subgraph Store[Zustand Store]
        SLIDE[(slide)]
    end

    subgraph Selectors[각 컴포넌트의 Selector]
        SEL1["(s) => s.slide?.title"]
        SEL2["(s) => s.slide?.content"]
        SEL3["(s) => s.slide?.script"]
        SEL4["(s) => s.slide?.emojiReactions"]
        SEL5["(s) => s.slide?.history"]
        SEL6["(s) => s.slide?.opinions"]
    end

    subgraph Components[컴포넌트]
        SV[SlideViewer]
        SBC[ScriptBoxContent]
        STT[SlideTitle]
        SBE[ScriptBoxEmoji]
        SH[ScriptHistory]
        OP[Opinion]
    end

    SLIDE --> SEL1 --> SV
    SLIDE --> SEL2 --> SV
    SLIDE --> SEL3 --> SBC
    SLIDE --> SEL3 --> SH
    SLIDE --> SEL1 --> STT
    SLIDE --> SEL4 --> SBE
    SLIDE --> SEL5 --> SH
    SLIDE --> SEL6 --> OP
```

## 4. 쓰기 흐름 (Actions)

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

    subgraph Store Actions
        U1[updateSlide]
        U2[updateScript]
        U3[saveToHistory]
        U4[restoreFromHistory]
        U5[deleteOpinion]
        U6[addReply]
    end

    subgraph State
        S1[slide.title]
        S2[slide.script]
        S3[slide.history]
        S4[slide.opinions]
    end

    subgraph 리렌더링
        R1[SlideViewer, SlideTitle]
        R2[ScriptBoxContent]
        R3[ScriptHistory]
        R4[Opinion]
    end

    A1 --> U1 --> S1 --> R1
    A2 --> U2 --> S2 --> R2
    A3 --> U3 --> S3 --> R3
    A4 --> U4 --> S2 --> R2
    A5 --> U5 --> S4 --> R4
    A6 --> U6 --> S4 --> R4
```

## 5. 슬라이드 전환 흐름

```mermaid
sequenceDiagram
    participant User
    participant SlideList
    participant Router
    participant SlidePage
    participant SlideWorkspace
    participant Store as Zustand Store
    participant Components

    User->>SlideList: 다른 슬라이드 클릭
    SlideList->>Router: navigate(/project/1/slide/3)
    Router->>SlidePage: URL params 변경
    SlidePage->>SlidePage: currentSlide 재계산
    SlidePage->>SlideWorkspace: slide prop 전달

    Note over SlideWorkspace: useEffect 감지

    SlideWorkspace->>Store: initSlide(newSlide)
    Store->>Store: slide 상태 교체
    Store->>Components: selector 구독 컴포넌트만 리렌더링
    Components->>User: UI 업데이트
```

## 6. Store 구조

```mermaid
classDiagram
    class SlideStore {
        +Slide slide
        +initSlide(slide)
        +updateSlide(updates)
        +updateScript(script)
        +saveToHistory()
        +restoreFromHistory(item)
        +deleteOpinion(id)
        +addReply(parentId, content)
    }

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

    SlideStore --> Slide
    Slide --> "*" OpinionItem
    Slide --> "*" HistoryItem
    Slide --> "*" EmojiReaction
```

## 7. Context vs Zustand 비교

```mermaid
flowchart TB
    subgraph Before[Before: Context]
        direction TB
        CTX[SlideContext]
        CTX --> C1[SlideViewer]
        CTX --> C2[ScriptBoxContent]
        CTX --> C3[SlideTitle]
        CTX --> C4[ScriptBoxEmoji]
        CTX --> C5[ScriptHistory]
        CTX --> C6[Opinion]

        CHANGE1[script 변경] --> CTX
        CTX --> RERENDER1[6개 모두 리렌더링]
    end

    subgraph After[After: Zustand + Selector]
        direction TB
        ZS[Zustand Store]
        ZS -.->|title| Z1[SlideViewer]
        ZS -.->|script| Z2[ScriptBoxContent]
        ZS -.->|title| Z3[SlideTitle]
        ZS -.->|emojiReactions| Z4[ScriptBoxEmoji]
        ZS -.->|history| Z5[ScriptHistory]
        ZS -.->|opinions| Z6[Opinion]

        CHANGE2[script 변경] --> ZS
        ZS --> RERENDER2[ScriptBoxContent만 리렌더링]
    end
```

## 8. 컴포넌트별 Store 사용

| 컴포넌트         | 구독 데이터         | 사용 액션                       |
| ---------------- | ------------------- | ------------------------------- |
| SlideViewer      | `title`, `content`  | -                               |
| ScriptBoxContent | `script`            | `updateScript`, `saveToHistory` |
| SlideTitle       | `title`             | `updateSlide`                   |
| ScriptBoxEmoji   | `emojiReactions`    | -                               |
| ScriptHistory    | `script`, `history` | `restoreFromHistory`            |
| Opinion          | `opinions`          | `deleteOpinion`, `addReply`     |

## 요약

| 항목          | Before (Context)     | After (Zustand)         |
| ------------- | -------------------- | ----------------------- |
| 상태 관리     | SlideProvider        | slideStore              |
| 데이터 전달   | useSlide() 전체 구독 | selector로 필요한 것만  |
| 리렌더링      | 모든 Consumer        | 관련 컴포넌트만         |
| 슬라이드 전환 | key prop으로 재생성  | initSlide()로 상태 교체 |
| 디버깅        | React DevTools       | Zustand DevTools        |
