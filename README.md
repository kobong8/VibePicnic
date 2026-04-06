# Vibe Picnic

터미널에 계절이 내리는 CLI 애니메이션.
`cmatrix`, `pipes.sh` 같은 터미널 아트 도구입니다.

```
🌸 봄 - 벚꽃    🌧️ 여름 - 비    🍂 가을 - 낙엽    ❄️ 겨울 - 눈
🌕 호숫가 달빛   🔥 벽난로
```

## 설치 & 실행

### 방법 1: 로컬에서 바로 실행

```bash
git clone https://github.com/kobong8/VibePicnic.git
cd VibePicnic
npm install
npm run build
npm start

# 옵션 지정
node dist/bin/vibe-picnic.js --season fireplace
```

### 방법 2: 글로벌 링크 (어디서든 `vibe-picnic` 명령어 사용)

```bash
cd VibePicnic
npm install
npm run build
npm link

# 이후 어디서든 실행 가능
vibe-picnic
vibe-picnic --season moonlake
vp --season fireplace    # 단축 명령어
```

> **링크 해제 / 삭제 방법:**
> ```bash
> # 글로벌 링크 해제
> cd VibePicnic
> npm unlink
>
> # 또는 글로벌에서 직접 제거
> npm uninstall -g vibe-picnic
>
> # 링크가 남아있을 경우 강제 제거
> npm rm -g vibe-picnic
> ```

## 테마

### 계절 테마 (파티클 기반)

| 테마 | 키 | 설명 |
|------|-----|------|
| `spring` | `1` | 🌸 벚꽃이 흩날림 |
| `summer` | `2` | 🌧️ 비가 내림 + 물방울 튀김 |
| `autumn` | `3` | 🍂 낙엽이 떨어짐 |
| `winter` | `4` | ❄️ 눈이 내림 |

### 장면 테마 (배경 렌더링)

| 테마 | 키 | 설명 |
|------|-----|------|
| `moonlake` | `5` | 🌕 호숫가 위 큰 달, 수면 반사, 반짝이는 별 |
| `fireplace` | `6` | 🔥 벽돌 벽난로, 장작 위 불꽃 애니메이션, 불씨 |

## 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--season <name>` | 테마 선택: `spring`, `summer`, `autumn`, `winter`, `moonlake`, `fireplace`, `auto` | `auto` |
| `--density <n>` | 파티클 밀도 (1-50) | 15 |
| `--speed <n>` | 속도 배율 (0.1-5.0) | 1.0 |
| `--wind <n>` | 바람 세기 (-5.0~5.0) | 0.5 |
| `--splash` | 스플래시 모드 (아무 키 → 종료) | off |
| `--message <text>` | 스플래시에 커스텀 메시지 표시 | - |
| `--ascii` | ASCII 문자만 사용 | off |
| `--no-color` | 색상 비활성화 | off |
| `--no-ground` | 바닥 쌓임 비활성화 | off |

## 조작

| 키 | 동작 |
|----|------|
| `←` `→` | 바람 방향/세기 조절 |
| `↑` `↓` | 파티클 밀도 조절 |
| `1`~`6` | 테마 전환 |
| `r` | 바닥 리셋 |
| `q` / `ESC` | 종료 |

## 예시

```bash
vibe-picnic                                         # 현재 월 기준 자동 계절
vibe-picnic --splash                                # 터미널 시작 스플래시
vibe-picnic --splash --message "Hello, World!"      # 커스텀 메시지
vibe-picnic --season spring                         # 봄 벚꽃
vibe-picnic --season summer --wind 2                # 비바람
vibe-picnic --season autumn                         # 가을 낙엽
vibe-picnic --season winter --wind 0                # 고요한 겨울 눈
vibe-picnic --season moonlake                       # 호숫가 달빛
vibe-picnic --season fireplace                      # 벽난로
vibe-picnic --density 40 --speed 2                  # 빠르고 화려하게
vibe-picnic --ascii --no-color                      # 최소 환경용
```

## 터미널 시작 스플래시 설정

터미널을 열 때 자동으로 계절 애니메이션이 나타나고, 아무 키나 누르면 쉘이 시작됩니다.

```bash
# Bash (~/.bashrc) 또는 Zsh (~/.zshrc)
vibe-picnic --splash

# Fish (~/.config/fish/config.fish)
vibe-picnic --splash

# PowerShell ($PROFILE)
vibe-picnic --splash
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
