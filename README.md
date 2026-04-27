🇰🇷 [한국어](./README.ko.md) | 🇺🇸 English

# 🔥 Vibe Picnic

A CLI animation tool with developer aesthetics for your terminal. It transforms the mood of your terminal with ASCII art effects and special scenes based on your configuration.

```text
🌸 Spring - Cherry Blossoms    🌧️ Summer - Rain    🍂 Autumn - Falling Leaves    ❄️ Winter - Snow
🌕 Moonlit Lake                🔥 Campfire                🎆 Fireworks
```

![campfire](images/campfire.gif)

---

## 📚 Table of Contents

- [Environment Setup](#️-environment-setup)
- [Installation & Usage](#-installation--usage-1)
- [Uninstallation](#️-uninstallation)
- [Preview](#-preview)
- [Themes & Scenes](#-themes--scenes)
- [Options & Controls](#️-options--controls)
- [Persistent Configuration](#️-persistent-configuration)
- [Auto Season Detection](#-auto-season-detection)
- [Random Theme Mode](#-random-theme-mode)
- [Requirements & License](#-requirements--license)
- [Special Thanks](#-special-thanks)

## ⚙️ Environment Setup

- Recommended terminal background: black
- Recommended font: MesloLGL Nerd Font

## 🚀 Installation & Usage

### Install via npm (Recommended)

Once the package is published to npm, you can install it globally with a single command:

```bash
npm install -g vibe-picnic

# Then run from anywhere
vibe-picnic
vibe-picnic --theme moonlake
vp --theme campfire    # shorthand command
vp --theme fireworks   # realistic night fireworks
```

### Local Build & Run
```bash
git clone https://github.com/kobong8/VibePicnic.git
cd VibePicnic
npm install
npm run dev
```

### Register as a Command for Local Builds
```bash
npm run build
npm link

# Then run from anywhere
vibe-picnic
vibe-picnic --theme moonlake
vp --theme campfire    # shorthand command
vp --theme fireworks   # realistic night fireworks
```

> 💡 The settings shown above (theme, density, wind, etc.) can be changed in two ways:
> 1. **In-app Settings Panel** — press `i` while the animation is running and edit values live (recommended).
> 2. **CLI flags** — pass them on the command line as shown, handy for one-off launches or shell startup scripts.
>
> Both paths control the same options. See the [Run Examples](#run-examples) section below for more.

### ✨ Terminal Splash on Startup

You can automatically enjoy a atmospheric animation every time you open your terminal. Press any key to immediately start your shell.

Add `vibe-picnic --splash` to the bottom of your shell config file:

- **Bash:** `~/.bashrc`
- **Zsh:** `~/.zshrc`
- **Fish:** `~/.config/fish/config.fish`
- **PowerShell:** `$PROFILE` (run `echo $PROFILE` to find the path)

> **Oh My Posh users (PowerShell):**
> Add it above the Oh My Posh initialization line in your `$PROFILE`:
> ```powershell
> vibe-picnic --splash
> oh-my-posh init pwsh --config 'your-theme.omp.json' | Invoke-Expression
> ```

---

## 🗑️ Uninstallation

### 1. Remove the Global Package

First, check the registered package name:
```bash
npm ls -g --depth=0
```

Then uninstall it (works for both `npm install -g` and `npm link` installations):
```bash
npm uninstall -g vibe-picnic
```

> If you registered it with `npm link`, you can also run `npm unlink` from the project folder:
> ```bash
> cd VibePicnic
> npm unlink vibe-picnic
> ```

### 2. Remove the Terminal Startup Config

Delete the `vibe-picnic` line from your shell config file:

- **Bash:** `~/.bashrc`
- **Zsh:** `~/.zshrc`
- **Fish:** `~/.config/fish/config.fish`
- **PowerShell:** `$PROFILE` (run `echo $PROFILE` to find the path)

```bash
# Find and delete this line
vibe-picnic --splash
```

To apply the changes immediately, reload your config file:
```bash
source ~/.zshrc   # For Bash: source ~/.bashrc
```

### 3. Remove the Config Files (Optional)
```bash
rm ~/.vibe-picnic.json           # settings
```

---

## 💡 Preview

*(The actual output looks much better than these examples. The campfire in particular doesn't capture all its colors here. 😢)*

#### 🌸 Spring

![spring](images/spring.gif)

#### 🌧️ Summer

![summer](images/summer.gif)

#### 🍂 Autumn

![autumn](images/autumn.gif)

#### ❄️ Winter

![winter](images/winter.gif)

#### 🌕 Moonlit Lake

![moonlake](images/moonlake.gif)

#### 🔥 Campfire

![campfire](images/campfire.gif)

#### 🎆 Fireworks

![fireworks](images/fireworks.gif)

---

## 🎨 Themes & Scenes

`vibe-picnic` automatically detects the current season based on the system month, or you can manually select a theme.

### Seasonal Particle Themes
| Key | Theme Name | Description |
|:---:|:---:|---|
| `1` | `spring` | 🌸 A warm spring with drifting cherry blossoms |
| `2` | `summer` | 🌧️ A refreshing summer with rain and splashing droplets |
| `3` | `autumn` | 🍂 A quiet autumn with gently falling leaves |
| `4` | `winter` | ❄️ A white winter with softly accumulating snow |

### Special Scene Themes
| Key | Theme Name | Description |
|:---:|:---:|---|
| `5` | `moonlake` | 🌕 A large moon over a lakeside with shimmering reflections and twinkling stars |
| `6` | `campfire` | 🔥 A warm campfire with animated burning logs and dancing flames |
| `7` | `fireworks` | 🎆 A beautiful fireworks display in the starry night |

---

## 🛠️ Options & Controls

The fastest way to configure Vibe Picnic is the **Settings Panel** — open it with `i` while the animation is running and tweak everything live. CLI options and keyboard shortcuts below cover the same controls for power users and scripting.

### Settings Panel (`i`) · Recommended
Press `i` at any time to open an interactive settings panel in the top-right corner. The animation keeps running underneath and value changes are applied **live** so you can preview the effect before saving.

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

| Key | Action |
|:---:|---|
| `↑` `↓` | Move the cursor between rows |
| `←` `→` | Change the highlighted value |
| `s` | Save current values to `~/.vibe-picnic.json` and close |
| `r` | Reset all settings to defaults |
| `q` / `i` / `ESC` | Close the panel without saving |

Editable rows: `Theme`, `Density`, `Wind`, `Speed`, `ASCII`, `Ground`. Cycling through the `Theme` row also includes **`random`** as a value — landing on it picks a fresh random theme each time you cycle to it, and saving with `s` stores `theme: random` so every future launch starts on a new theme. The live particle count is shown read-only at the bottom of the panel.

### Run Examples
```bash
# Just run it — current season auto-detected, then press i to configure
vibe-picnic

# Jump straight into a specific theme
vibe-picnic --theme moonlake
vibe-picnic --theme campfire
vp --theme fireworks                 # shorthand command

# Tune visuals on launch (everything below also works in the panel)
vibe-picnic --theme autumn --density 30 --wind -1.5
vibe-picnic --theme winter --speed 0.6 --no-ground

# Splash mode — show one frame, exit on any key
vibe-picnic --splash
vibe-picnic --splash --message "Welcome back!"

# ASCII-only fallback (no emoji), great for legacy terminals
vibe-picnic --ascii --no-color
```

### CLI Options
| Option | Description | Default |
|---|---|:---:|
| `--theme <name>` | Select a theme (`spring`, `summer`, `autumn`, `winter`, `moonlake`, `campfire`, `fireworks`, `auto`, `random`) | `auto` |
| `--density <n>` | Particle density (1–50) | `15` |
| `--speed <n>` | Animation speed multiplier (0.1–5.0) | `1.0` |
| `--wind <n>` | Wind strength and direction (-5.0 to 5.0) | `0.5` |
| `--splash` | Splash mode (press any key to exit) | `off` |
| `--message <text>` | Custom message to display on the splash screen | - |
| `--ascii` | Render using ASCII characters only | `off` |
| `--no-color` | Disable color effects | `off` |
| `--no-ground` | Disable particle accumulation on the ground | `off` |

### Real-Time Keyboard Controls
| Key | Action |
|:---:|---|
| `i` | **Toggle the settings panel (recommended)** |
| `1` ~ `7` | Instantly switch themes |
| `↑` `↓` | Adjust particle density |
| `←` `→` | Adjust wind direction and strength |
| `r` | Reset accumulated ground particles |
| `q` / `ESC` | Quit the program |

### Minimal HUD
The animation runs full-screen with no persistent on-screen text. A subtle `i:settings  q:quit` hint appears at the bottom-right for the first 5 seconds, then blinks while fading out over the next 5 seconds and disappears entirely after 10 seconds — so once you know the shortcuts, the screen is clean. Press `i` any time to bring back the panel.

---

## ⚙️ Persistent Configuration

Save your default settings permanently so you don't have to type options every time. Settings are stored in `.vibe-picnic.json` in your home directory.

```bash
# Show current settings (✏️ marks values you've set manually)
vibe-picnic config show

# Set the default theme to campfire
vibe-picnic config set theme campfire

# Change particle density
vibe-picnic config set density 30

# A brighter fireworks setup
vibe-picnic config set density 24
vibe-picnic config set speed 1.2

# Enable ASCII mode (use characters instead of emoji)
vibe-picnic config set ascii true

# Reset all settings to defaults
vibe-picnic config reset

# Show the config file location
vibe-picnic config path    # e.g. ~/.vibe-picnic.json
```

---

## 📅 Auto Season Detection

When using `--theme auto` (the default), a theme is selected based on the system's current month:

| Month | Selected Theme |
|:---:|:---:|
| March – May | Spring |
| June – August | Summer |
| September – November | Autumn |
| December – February | Winter |

---

## 🎲 Random Theme Mode

With `theme = random`, one of the 7 themes is chosen at random every time the program starts. Three ways to enable it, all equivalent:

```bash
# 1. CLI flag for a single run
vibe-picnic --theme random

# 2. Persist as the default in the config file
vibe-picnic config set theme random

# 3. Inside the running animation: press i to open the Settings Panel,
#    cycle the Theme row with ←→ until it shows "random", then press s to save.
```

Combined with the terminal splash, your terminal opens with a different theme each time:

```bash
# Add to ~/.zshrc or ~/.bashrc
vibe-picnic --splash --theme random
```

---

## 📋 Requirements & License

- **Node.js:** >= 14.0.0
- **Dependencies:** None (Zero-dependency)
- **License:** MIT

---

## 🙏 Special Thanks

- I would like to thank Minwoo Kim and Elgar for their great help throughout the development process.
- Lastly, I would like to thank my wife for always supporting my hobby of coding.
