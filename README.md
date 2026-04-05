# Vibe Picnic

터미널에 계절이 내리는 CLI 애니메이션.
`cmatrix`, `pipes.sh` 같은 터미널 아트 도구입니다.

```
🌸 봄 - 벚꽃    🌧️ 여름 - 비    🍂 가을 - 낙엽    ❄️ 겨울 - 눈
```

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

## 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--season <name>` | 계절: `spring`, `summer`, `autumn`, `winter`, `auto` | `auto` |
| `--density <n>` | 파티클 밀도 (1-50) | 15 |
| `--speed <n>` | 속도 배율 (0.1-5.0) | 1.0 |
| `--wind <n>` | 바람 세기 (-5.0~5.0) | 0.5 |
| `--ascii` | ASCII 문자만 사용 | off |
| `--no-color` | 색상 비활성화 | off |
| `--no-ground` | 바닥 쌓임 비활성화 | off |

## 조작

| 키 | 동작 |
|----|------|
| `←` `→` | 바람 방향/세기 조절 |
| `↑` `↓` | 파티클 밀도 조절 |
| `1` `2` `3` `4` | 계절 전환 (봄/여름/가을/겨울) |
| `r` | 바닥 리셋 |
| `q` / `ESC` | 종료 |

## 예시

```bash
vibe-picnic                             # 현재 월 기준 자동 계절
vibe-picnic --season spring             # 봄 벚꽃
vibe-picnic --season summer --wind 2    # 비바람
vibe-picnic --season autumn             # 가을 낙엽
vibe-picnic --season winter --wind 0    # 고요한 겨울 눈
vibe-picnic --density 40 --speed 2      # 빠르고 화려하게
vibe-picnic --ascii --no-color          # 최소 환경용
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
