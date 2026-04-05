# 🌸 BeforeSunrise

터미널에서 벚꽃이 내리는 CLI 애니메이션.  
`cmatrix`, `pipes.sh` 같은 터미널 아트 도구입니다.

![Python 3.6+](https://img.shields.io/badge/python-3.6+-pink.svg)

## 실행

```bash
python3 sakura.py
```

## 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--density N` | 꽃잎 밀도 (1-50) | 15 |
| `--speed N` | 낙하 속도 배율 (0.1-5.0) | 1.0 |
| `--wind N` | 바람 세기 (-5.0~5.0) | 0.5 |
| `--ascii` | ASCII 문자만 사용 | off |
| `--no-color` | 색상 비활성화 | off |
| `--no-ground` | 바닥 쌓임 비활성화 | off |

## 조작

| 키 | 동작 |
|----|------|
| `←` `→` | 바람 방향/세기 조절 |
| `↑` `↓` | 꽃잎 밀도 조절 |
| `r` | 바닥 리셋 |
| `q` / `ESC` | 종료 |

## 예시

```bash
# 꽃잎 많이, 바람 강하게
python3 sakura.py --density 30 --wind 3

# ASCII 모드 (유니코드 미지원 터미널)
python3 sakura.py --ascii

# 느리게, 바람 없이
python3 sakura.py --speed 0.3 --wind 0
```

## 요구사항

- Python 3.6+
- curses (Linux/macOS 기본 포함, Windows는 `windows-curses` 필요)
