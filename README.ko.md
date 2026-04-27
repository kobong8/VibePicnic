🇰🇷 한국어 | 🇺🇸 [English](./README.md)

# 🔥 Vibe Picnic

터미널에 개발자 감성을 담은 CLI 애니메이션 도구입니다. 터미널 분위기를 전환해주는 아트 도구로, 설정에 따라서 아스키 아트 효과와 특별한 장면들을 제공합니다.

```text
🌸 봄 - 벚꽃    🌧️ 여름 - 비    🍂 가을 - 낙엽    ❄️ 겨울 - 눈
🌕 호숫가 달빛   🔥 모닥불   🎆 폭죽놀이
```

![campfire](images/campfire.gif)

---

## 📚 목차

- [환경 설정](#️-환경-설정)
- [설치 및 실행](#-설치-및-실행)
- [삭제 방법](#️-삭제-방법)
- [실행화면](#-실행화면)
- [테마 및 장면](#-테마-및-장면)
- [옵션 및 조작](#️-옵션-및-조작)
- [설정 관리](#️-설정-관리)
- [자동 계절 감지](#-자동-계절-감지)
- [랜덤 테마](#-랜덤-테마)
- [요구사항 및 라이선스](#-요구사항-및-라이선스)
- [감사글](#-감사글)

## ⚙️ 환경 설정

- 권장 터미널 배경: 검정색
- 권장 폰트: MesloLGL Nerd Font

## 🚀 설치 및 실행

### npm으로 설치 (권장)

npm에 패키지가 배포된 이후에는, 아래 명령어 한 줄로 전역 설치할 수 있습니다.

```bash
npm install -g vibe-picnic

# 이후 어디서든 실행 가능
vibe-picnic
vibe-picnic --theme moonlake
vp --theme campfire    # 단축 명령어
vp --theme fireworks   # 현실적인 야간 폭죽 장면
```

### 로컬 빌드 및 실행
```bash
git clone https://github.com/kobong8/VibePicnic.git
cd VibePicnic
npm install
npm run dev
```

### 로컬 빌드 시 명령어로 등록
```bash
npm run build
npm link

# 이후 어디서든 실행 가능
vibe-picnic
vibe-picnic --theme moonlake
vp --theme campfire    # 단축 명령어
vp --theme fireworks   # 현실적인 야간 폭죽 장면
```

> 💡 위에 나오는 설정값(테마, 밀도, 바람 등)은 두 가지 방식으로 바꿀 수 있어요:
> 1. **인앱 설정 패널** — 애니메이션 도중 `i` 키를 눌러 실시간으로 값 조정 (추천).
> 2. **CLI 플래그** — 위 예시처럼 명령행에서 직접 전달. 일회성 실행이나 쉘 시작 스크립트에 유용.
>
> 두 방법 모두 같은 옵션을 제어합니다. 자세한 사용법은 아래 [실행 예시](#실행-예시) 섹션을 참고하세요.

### ✨ 터미널 시작 스플래시 설정

터미널을 열 때마다 자동으로 감성적인 애니메이션을 감상할 수 있습니다. 아무 키나 누르면 즉시 쉘이 시작됩니다.

설정 파일 맨 아래에 `vibe-picnic --splash`를 추가하세요.

- **Bash:** `~/.bashrc`
- **Zsh:** `~/.zshrc`
- **Fish:** `~/.config/fish/config.fish`
- **PowerShell:** `$PROFILE` (`echo $PROFILE`로 경로 확인)

> **Oh My Posh 사용자 (PowerShell):**
> `$PROFILE`에서 Oh My Posh 초기화 코드 위쪽에 추가하여 사용하시면 됩니다.
> ```powershell
> vibe-picnic --splash
> oh-my-posh init pwsh --config 'your-theme.omp.json' | Invoke-Expression
> ```

---

## 🗑️ 삭제 방법

### 1. 글로벌 패키지 제거

먼저 등록된 패키지명을 확인합니다.
```bash
npm ls -g --depth=0
```

확인한 패키지명으로 제거합니다. (`npm install -g`로 설치했든 `npm link`로 등록했든 동일하게 동작합니다.)
```bash
npm uninstall -g vibe-picnic
```

> `npm link`로 등록한 경우 프로젝트 폴더에서 `npm unlink`를 실행해도 됩니다.
> ```bash
> cd VibePicnic
> npm unlink vibe-picnic
> ```

### 2. 터미널 시작 설정 제거

shell 설정 파일에서 `vibe-picnic` 관련 줄을 삭제합니다.

- **Bash:** `~/.bashrc`
- **Zsh:** `~/.zshrc`
- **Fish:** `~/.config/fish/config.fish`
- **PowerShell:** `$PROFILE` (`echo $PROFILE`로 경로 확인)

```bash
# 아래 줄을 찾아서 삭제
vibe-picnic --splash
```

변경 사항을 즉시 반영하려면 설정 파일을 다시 불러옵니다.
```bash
source ~/.zshrc   # Bash는 source ~/.bashrc
```

### 3. 설정 파일 제거 (선택)
```bash
rm ~/.vibe-picnic.json           # 설정
```

---

## 💡 실행화면

(실행화면은 예시로 보시는 것보다 예쁩니다. 특히 모닥불은 색이 다 안담겼어요 ㅠ)

#### 🌸 봄 (spring)

![spring](images/spring.gif)

#### 🌧️ 여름 (summer)

![summer](images/summer.gif)

#### 🍂 가을 (autumn)

![autumn](images/autumn.gif)

#### ❄️ 겨울 (winter)

![winter](images/winter.gif)

#### 🌕 달빛 호숫가 (moonlake)

![moonlake](images/moonlake.gif)

#### 🔥 모닥불 (campfire)

![campfire](images/campfire.gif)

#### 🎆 폭죽놀이 (fireworks)

![fireworks](images/fireworks.gif)

---

## 🎨 테마 및 장면

`vibe-picnic`은 현재 월(Month)에 맞춰 계절을 자동으로 감지하거나, 사용자가 직접 테마를 선택할 수 있습니다.

### 계절 파티클 테마
| 키 | 테마명 | 설명 |
|:---:|:---:|---|
| `1` | `spring` | 🌸 벚꽃이 흩날리는 따뜻한 봄 |
| `2` | `summer` | 🌧️ 시원한 빗줄기와 물방울이 튀는 여름 |
| `3` | `autumn` | 🍂 낙엽이 고요하게 떨어지는 가을 |
| `4` | `winter` | ❄️ 하얀 눈이 소복이 쌓이는 겨울 |

### 특정 장면 테마
| 키 | 테마명 | 설명 |
|:---:|:---:|---|
| `5` | `moonlake` | 🌕 호숫가 위 큰 달과 수면에 비치는 달빛, 반짝이는 별 |
| `6` | `campfire` | 🔥 타오르는 장작과 불꽃 애니메이션, 따뜻한 모닥불 |
| `7` | `fireworks` | 🎆 별밤에 펼쳐지는 아름다운 불꽃놀이 |

---

## 🛠️ 옵션 및 조작

Vibe Picnic을 가장 쉽게 조정하는 방법은 **설정 패널**입니다. 애니메이션 실행 중 `i` 키만 누르면 모든 값을 실시간으로 바꿀 수 있어요. 아래의 CLI 옵션과 단축키는 같은 기능을 자동화·스크립팅하고 싶을 때 쓰는 보조 수단입니다.

### 설정 패널 (`i`) · 추천
애니메이션 도중 언제든 `i` 키를 누르면 우측 상단에 인터랙티브 설정 패널이 열립니다. 패널이 떠 있는 동안에도 애니메이션은 뒤에서 계속 재생되며, 값 변경은 **실시간**으로 적용되어 저장 전에 효과를 미리 확인할 수 있습니다.

```text
─ Settings ──────────────
 ▶ Theme:    autumn
   Density:  15
   Wind:     +0.5
   Speed:    1.0
   ASCII:    off
   Ground:   on

   Particles: 76
 ↑↓ move  ←→ change
 s save  r reset  q close
─────────────────────────
```

| 키 | 동작 설명 |
|:---:|---|
| `↑` `↓` | 항목 사이로 커서 이동 |
| `←` `→` | 선택된 항목의 값 변경 |
| `s` | 현재 값을 `~/.vibe-picnic.json`에 저장 후 닫기 |
| `r` | 모든 설정을 기본값으로 초기화 |
| `q` / `i` / `ESC` | 저장 없이 패널 닫기 |

조정 가능한 항목: `Theme`, `Density`, `Wind`, `Speed`, `ASCII`, `Ground`. `Theme` 항목을 ←→로 순회할 때 **`random`** 값도 포함되어 있어, random에 도달할 때마다 즉석에서 새 랜덤 테마가 선택됩니다. 이 상태에서 `s`로 저장하면 `theme: random`으로 기록되어 다음 실행부터 매번 다른 테마로 시작합니다. 현재 파티클 개수는 패널 하단에 읽기 전용으로 표시됩니다.

### 실행 예시
```bash
# 그냥 실행 — 현재 계절을 자동 감지하고, i 키로 세팅
vibe-picnic

# 특정 테마로 바로 진입
vibe-picnic --theme moonlake
vibe-picnic --theme campfire
vp --theme fireworks                 # 단축 명령어

# 실행과 동시에 시각 설정 (모두 패널에서도 동일하게 가능)
vibe-picnic --theme autumn --density 30 --wind -1.5
vibe-picnic --theme winter --speed 0.6 --no-ground

# 스플래시 모드 — 한 화면 표시 후 아무 키나 누르면 종료
vibe-picnic --splash
vibe-picnic --splash --message "Welcome back!"

# ASCII 전용 모드 (이모지 없음, 구형 터미널 호환)
vibe-picnic --ascii --no-color
```

### CLI 옵션
| 옵션 | 설명 | 기본값 |
|---|---|:---:|
| `--theme <name>` | 테마 선택 (`spring`, `summer`, `autumn`, `winter`, `moonlake`, `campfire`, `fireworks`, `auto`, `random`) | `auto` |
| `--density <n>` | 파티클 밀도 (1-50) | `15` |
| `--speed <n>` | 애니메이션 속도 배율 (0.1-5.0) | `1.0` |
| `--wind <n>` | 바람의 세기와 방향 (-5.0 ~ 5.0) | `0.5` |
| `--splash` | 스플래시 모드 (아무 키나 누르면 종료) | `off` |
| `--message <text>` | 스플래시 화면에 표시할 커스텀 메시지 | - |
| `--ascii` | ASCII 문자만 사용하여 렌더링 | `off` |
| `--no-color` | 색상 효과 비활성화 | `off` |
| `--no-ground` | 바닥에 파티클이 쌓이는 효과 비활성화 | `off` |

### 실시간 조작 키
| 키 | 동작 설명 |
|:---:|---|
| `i` | **설정 패널 토글 (추천)** |
| `1` ~ `7` | 즉시 테마 전환 |
| `↑` `↓` | 파티클 밀도 조절 |
| `←` `→` | 바람의 방향 및 세기 조절 |
| `r` | 쌓인 바닥 리셋 |
| `q` / `ESC` | 프로그램 종료 |

### 미니멀 HUD
애니메이션은 화면 가득 풀스크린으로 재생되며, 화면에 상시 표시되는 텍스트는 없습니다. 실행 직후 5초간 우측 하단에 흐릿한 `i:settings  q:quit` 힌트가 떴다가, 이후 5초 동안 깜빡이며 점점 사라지고 10초가 지나면 완전히 사라집니다 — 단축키를 익힌 뒤에는 깨끗한 화면을 즐길 수 있어요. 언제든 `i` 키를 눌러 패널을 다시 불러올 수 있습니다.

---

## ⚙️ 설정 관리

매번 옵션을 입력하지 않아도 되도록 기본 설정을 영구적으로 저장할 수 있습니다. 설정은 사용자 홈 디렉토리의 `.vibe-picnic.json` 파일에 저장됩니다.

```bash
# 현재 설정 확인 (✏️ 표시가 직접 설정한 값)
vibe-picnic config show

# 예시 : 기본 테마를 모닥불로 변경
vibe-picnic config set theme campfire

# 파티클 밀도 변경
vibe-picnic config set density 30

# 더 풍성한 폭죽 설정 예시
vibe-picnic config set density 24
vibe-picnic config set speed 1.2

# ASCII 모드 활성화 (이모지 대신 문자 사용)
vibe-picnic config set ascii true

# 설정 초기화 (기본값으로 복구)
vibe-picnic config reset

# 설정 파일 위치 확인
vibe-picnic config path    # 예: ~/.vibe-picnic.json
```

---

## 📅 자동 계절 감지

`--theme auto` (기본값) 사용 시, 시스템 월(Month) 정보를 바탕으로 테마가 선택됩니다.

| 월 | 선택 테마 |
|:---:|:---:|
| 3월 - 5월 | 봄 (spring) |
| 6월 - 8월 | 여름 (summer) |
| 9월 - 11월 | 가을 (autumn) |
| 12월 - 2월 | 겨울 (winter) |

---

## 🎲 랜덤 테마

`theme = random` 으로 설정하면 실행할 때마다 7가지 테마 중 하나가 무작위로 선택됩니다. 다음 세 가지 방법 모두 동일하게 동작합니다.

```bash
# 1. CLI 플래그로 한 번만 랜덤
vibe-picnic --theme random

# 2. 설정 파일에 기본값으로 저장
vibe-picnic config set theme random

# 3. 애니메이션 실행 중에 i로 설정 패널을 열고,
#    Theme 항목을 ←→로 순회해서 "random" 상태로 둔 뒤 s로 저장.
```

터미널 시작 스플래시와 함께 사용하면 터미널을 열 때마다 다른 테마가 재생됩니다.

```bash
# ~/.zshrc 또는 ~/.bashrc 에 추가
vibe-picnic --splash --theme random
```

---

## 📋 요구사항 및 라이선스

- **Node.js:** >= 14.0.0
- **Dependencies:** 외부 의존성 없음 (Zero-dependency)
- **License:** MIT

---

## 🙏 감사글

- 김민우님과 엘가님, 개발 과정에서 큰 도움을 주셔서 감사합니다.
- 마지막으로, 코딩이라는 취미를 항상 응원해준 아내에게 감사드립니다.
