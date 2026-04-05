# Vibe Picnic

터미널에 계절이 내리는 CLI 애니메이션.
`cmatrix`, `pipes.sh` 같은 터미널 아트 도구입니다.

```
🌸 봄 - 벚꽃    🌧️ 여름 - 비    🍂 가을 - 낙엽    ❄️ 겨울 - 눈
```

## 변경 이력

### 최근 업데이트

- **렌더러 안정화**: wide emoji(🌸🍂 등) 문자가 포함된 줄에서 상태바가 화면 중간에 나타나는 현상 수정. `\n` 기반 줄 이동 대신 절대 커서 위치(`ESC[row;1H`) 방식으로 변경
- **바닥 쌓임 기능 확장**: 기존 여름(빗물 웅덩이)에만 있던 지면 쌓임을 봄·가을·겨울에도 추가
  - 봄: 꽃잎(`✿ ❀ ✾ ❁`) 더미, 밝은 핑크 계열
  - 가을: 낙엽(`❧ ♣ ✦`) 더미, 황금·갈색 계열, 최대 5칸
  - 겨울: 눈 결정(`❄ ❅ ❆`) 더미, 흰색·하늘색 계열
- **지면 표현 개선**: 매 프레임 랜덤 문자 선택으로 인한 깜빡임 제거. 위치 기반 해시로 문자를 결정해 형태 고정
- **물리 개선**: 파티클이 쌓인 지면의 높이를 인식하고, 지면 상단에서 착지 처리. 기존에는 지면을 뚫고 바닥까지 낙하하던 문제 수정

## 설치 & 실행

```bash
# npx로 바로 실행 (설치 불필요)
npx vibe-picnic

# 또는 전역 설치
npm install -g vibe-picnic
vibe-picnic

# 또는 단축 명령어
vp
```

## 터미널 시작 스플래시 설정

터미널을 열 때 자동으로 계절 애니메이션이 나타나고, 아무 키나 누르면 쉘이 시작됩니다.

### Bash

`~/.bashrc` 맨 아래에 추가:
```bash
vibe-picnic --splash
```

### Zsh

`~/.zshrc` 맨 아래에 추가:
```bash
vibe-picnic --splash
```

### PowerShell

`$PROFILE` 파일에 추가 (경로 확인: `echo $PROFILE`):
```powershell
vibe-picnic --splash
```

### Fish

`~/.config/fish/config.fish`에 추가:
```fish
vibe-picnic --splash
```

### Windows Terminal + Oh My Posh 사용자

Oh My Posh와 함께 사용할 때, `$PROFILE`에서 Oh My Posh 초기화 **위에** 추가하세요:
```powershell
# 1. 스플래시 (아무 키 → 쉘 시작)
vibe-picnic --splash

# 2. Oh My Posh 프롬프트 테마
oh-my-posh init pwsh --config 'your-theme.omp.json' | Invoke-Expression
```

### 커스텀 메시지

```bash
vibe-picnic --splash --message "Welcome back, Developer!"
```

## 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--season <name>` | 계절: `spring`, `summer`, `autumn`, `winter`, `auto` | `auto` |
| `--density <n>` | 파티클 밀도 (1-50) | 15 |
| `--speed <n>` | 속도 배율 (0.1-5.0) | 1.0 |
| `--wind <n>` | 바람 세기 (-5.0~5.0) | 0.5 |
| `--splash` | 스플래시 모드 (아무 키 → 종료) | off |
| `--message <text>` | 스플래시에 커스텀 메시지 표시 | - |
| `--ascii` | ASCII 문자만 사용 | off |
| `--no-color` | 색상 비활성화 | off |
| `--no-ground` | 바닥 쌓임 비활성화 | off |

## 조작

### 일반 모드

| 키 | 동작 |
|----|------|
| `←` `→` | 바람 방향/세기 조절 |
| `↑` `↓` | 파티클 밀도 조절 |
| `1` `2` `3` `4` | 계절 전환 (봄/여름/가을/겨울) |
| `r` | 바닥 리셋 |
| `q` / `ESC` | 종료 |

### 스플래시 모드

| 키 | 동작 |
|----|------|
| 아무 키 | 종료 → 터미널 시작 |

## 예시

```bash
vibe-picnic                                         # 현재 월 기준 자동 계절
vibe-picnic --splash                                # 터미널 시작 스플래시
vibe-picnic --splash --message "Hello, World!"      # 커스텀 메시지
vibe-picnic --season spring                         # 봄 벚꽃
vibe-picnic --season summer --wind 2                # 비바람
vibe-picnic --season autumn                         # 가을 낙엽
vibe-picnic --season winter --wind 0                # 고요한 겨울 눈
vibe-picnic --density 40 --speed 2                  # 빠르고 화려하게
vibe-picnic --ascii --no-color                      # 최소 환경용
```

## 자동 계절 감지

`--season auto` (기본값)를 사용하면 현재 월에 맞는 계절을 자동으로 선택합니다.

| 월 | 계절 |
|----|------|
| 3-5월 | 봄 (벚꽃) |
| 6-8월 | 여름 (비) |
| 9-11월 | 가을 (낙엽) |
| 12-2월 | 겨울 (눈) |

## 요구사항

- Node.js >= 14.0.0
- 외부 의존성 없음 (zero dependencies)

## License

MIT
