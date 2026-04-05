#!/usr/bin/env python3
"""
BeforeSunrise - 터미널에 벚꽃이 내리는 CLI 애니메이션
Usage: python3 sakura.py [--density N] [--speed N] [--no-color] [--wind N]
"""

import curses
import random
import time
import argparse
import signal
import sys

# 벚꽃 꽃잎 문자들 (유니코드 + ASCII fallback)
PETALS_UNICODE = ["🌸", "✿", "❀", "✾", "❁", "⚘", "✻", "·", ".", ","]
PETALS_ASCII = ["*", "o", ".", ",", "'", "`", "+", "~", "x", ";"]

# 바닥에 쌓이는 꽃잎
GROUND_CHARS = ["_", ".", ",", "~", "-"]


class Petal:
    """하나의 벚꽃 꽃잎"""

    def __init__(self, x, y, max_x, max_y, wind):
        self.x = x
        self.y = y
        self.max_x = max_x
        self.max_y = max_y
        self.wind = wind
        self.speed = random.uniform(0.3, 1.0)
        self.drift = random.uniform(-0.5, 0.5) + wind * 0.3
        self.char_idx = random.randint(0, 5)  # 꽃잎 모양 인덱스
        self.phase = random.uniform(0, 6.28)  # 흔들림 위상
        self.amplitude = random.uniform(0.3, 1.5)  # 흔들림 크기
        self.color = random.choice([1, 2, 3, 4])  # 색상
        self.age = 0

    def update(self, tick):
        """꽃잎 위치 업데이트"""
        import math

        self.y += self.speed
        self.x += self.drift + math.sin(self.phase + tick * 0.05) * self.amplitude * 0.3
        self.age += 1

        # 화면 밖으로 나가면 반대쪽에서 나타남 (좌우)
        if self.x < 0:
            self.x = self.max_x - 1
        elif self.x >= self.max_x:
            self.x = 0

        return self.y < self.max_y


class Ground:
    """바닥에 쌓이는 꽃잎"""

    def __init__(self, width):
        self.width = width
        self.layers = {}  # {x: height}

    def add(self, x):
        col = int(x)
        if 0 <= col < self.width:
            self.layers[col] = self.layers.get(col, 0) + 1

    def get_height(self, x):
        return self.layers.get(x, 0)


def parse_args():
    parser = argparse.ArgumentParser(
        description="🌸 BeforeSunrise - 터미널 벚꽃 애니메이션",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 sakura.py                  기본 벚꽃
  python3 sakura.py --density 30     꽃잎 많이
  python3 sakura.py --speed 2        빠르게
  python3 sakura.py --wind 3         바람 강하게
  python3 sakura.py --ascii          ASCII 모드
        """,
    )
    parser.add_argument(
        "--density",
        type=int,
        default=15,
        help="꽃잎 밀도 (1-50, 기본: 15)",
    )
    parser.add_argument(
        "--speed",
        type=float,
        default=1.0,
        help="낙하 속도 배율 (0.1-5.0, 기본: 1.0)",
    )
    parser.add_argument(
        "--wind",
        type=float,
        default=0.5,
        help="바람 세기 (-5.0~5.0, 기본: 0.5)",
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        help="색상 비활성화",
    )
    parser.add_argument(
        "--ascii",
        action="store_true",
        help="ASCII 문자만 사용",
    )
    parser.add_argument(
        "--no-ground",
        action="store_true",
        help="바닥 쌓임 비활성화",
    )
    return parser.parse_args()


def init_colors():
    """벚꽃 색상 팔레트 초기화"""
    curses.start_color()
    curses.use_default_colors()

    # 1: 연한 분홍 (메인 꽃잎)
    curses.init_pair(1, 218 if curses.COLORS >= 256 else curses.COLOR_MAGENTA, -1)
    # 2: 진한 분홍
    curses.init_pair(2, 213 if curses.COLORS >= 256 else curses.COLOR_RED, -1)
    # 3: 흰색 (꽃잎)
    curses.init_pair(3, 255 if curses.COLORS >= 256 else curses.COLOR_WHITE, -1)
    # 4: 연한 자주
    curses.init_pair(4, 176 if curses.COLORS >= 256 else curses.COLOR_MAGENTA, -1)
    # 5: 바닥 색상 (갈색/분홍)
    curses.init_pair(5, 181 if curses.COLORS >= 256 else curses.COLOR_YELLOW, -1)
    # 6: 제목/UI
    curses.init_pair(6, 225 if curses.COLORS >= 256 else curses.COLOR_WHITE, -1)


def draw_title(stdscr, width, use_color):
    """상단 제목 표시"""
    title = " 🌸 BeforeSunrise "
    if width > len(title) + 4:
        x = (width - len(title)) // 2
        attr = curses.color_pair(6) | curses.A_BOLD if use_color else curses.A_BOLD
        try:
            stdscr.addstr(0, x, title, attr)
        except curses.error:
            pass


def draw_info(stdscr, height, width, petal_count, wind, use_color):
    """하단 정보 표시"""
    info = f" petals: {petal_count} | wind: {wind:+.1f} | q: quit | ←→: wind | ↑↓: density "
    if width > len(info):
        x = (width - len(info)) // 2
        attr = curses.color_pair(6) | curses.A_DIM if use_color else curses.A_DIM
        try:
            stdscr.addstr(height - 1, x, info, attr)
        except curses.error:
            pass


def main(stdscr):
    args = parse_args()

    # curses 설정
    curses.curs_set(0)  # 커서 숨김
    stdscr.nodelay(True)  # non-blocking input
    stdscr.timeout(40)  # ~25fps

    use_color = not args.no_color
    if use_color:
        try:
            init_colors()
        except curses.error:
            use_color = False

    use_unicode = not args.ascii
    petals_chars = PETALS_UNICODE if use_unicode else PETALS_ASCII

    height, width = stdscr.getmaxyx()
    petals = []
    ground = Ground(width)
    tick = 0
    density = args.density
    wind = args.wind
    speed_mult = args.speed
    show_ground = not args.no_ground

    # 초기 꽃잎 배치
    for _ in range(density):
        x = random.uniform(0, width - 1)
        y = random.uniform(0, height - 1)
        petals.append(Petal(x, y, width, height, wind))

    while True:
        # 입력 처리
        try:
            key = stdscr.getch()
        except curses.error:
            key = -1

        if key == ord("q") or key == ord("Q") or key == 27:  # q, Q, ESC
            break
        elif key == curses.KEY_LEFT:
            wind = max(-5.0, wind - 0.3)
        elif key == curses.KEY_RIGHT:
            wind = min(5.0, wind + 0.3)
        elif key == curses.KEY_UP:
            density = min(50, density + 2)
        elif key == curses.KEY_DOWN:
            density = max(1, density - 2)
        elif key == ord("r") or key == ord("R"):
            ground = Ground(width)  # 바닥 리셋

        # 터미널 크기 변경 감지
        new_height, new_width = stdscr.getmaxyx()
        if new_height != height or new_width != width:
            height, width = new_height, new_width
            ground = Ground(width)

        stdscr.erase()

        # 새 꽃잎 생성
        if len(petals) < density * 3:
            for _ in range(random.randint(0, 2)):
                x = random.uniform(0, width - 1)
                petals.append(Petal(x, -1, width, height, wind))

        # 꽃잎 업데이트 & 렌더링
        alive_petals = []
        for petal in petals:
            petal.wind = wind
            petal.speed = petal.speed * speed_mult / max(speed_mult, 1.0) + (
                speed_mult - 1.0
            ) * 0.1

            if petal.update(tick):
                px, py = int(petal.x), int(petal.y)
                if 0 <= px < width and 0 < py < height - 1:
                    char = petals_chars[petal.char_idx % len(petals_chars)]
                    attr = curses.color_pair(petal.color) if use_color else 0

                    # 큰 꽃잎은 밝게, 작은 건 흐리게
                    if petal.char_idx <= 2:
                        attr |= curses.A_BOLD
                    elif petal.char_idx >= 7:
                        attr |= curses.A_DIM

                    try:
                        if use_unicode:
                            stdscr.addstr(py, min(px, width - 2), char, attr)
                        else:
                            stdscr.addch(py, px, ord(char), attr)
                    except curses.error:
                        pass

                alive_petals.append(petal)
            else:
                # 바닥에 도달 - 쌓임
                if show_ground:
                    ground.add(petal.x)
        petals = alive_petals

        # 바닥 렌더링
        if show_ground:
            ground_attr = curses.color_pair(5) if use_color else curses.A_DIM
            for x in range(width):
                h = ground.get_height(x)
                if h > 0:
                    display_h = min(h // 3, height // 4)  # 최대 높이 제한
                    for dy in range(display_h):
                        gy = height - 2 - dy
                        if 0 < gy < height - 1:
                            char = random.choice(GROUND_CHARS) if dy == display_h - 1 else "."
                            try:
                                stdscr.addch(gy, x, ord(char), ground_attr)
                            except curses.error:
                                pass

        # UI
        draw_title(stdscr, width, use_color)
        draw_info(stdscr, height, width, len(petals), wind, use_color)

        stdscr.refresh()
        tick += 1


def run():
    try:
        curses.wrapper(main)
    except KeyboardInterrupt:
        pass
    finally:
        print("\n🌸 안녕히 가세요! - BeforeSunrise\n")


if __name__ == "__main__":
    run()
