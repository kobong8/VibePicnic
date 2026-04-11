🇰🇷 [한국어](./README.ko.md) | 🇺🇸 English

# 🌕 Vibe Picnic

A CLI animation tool with developer aesthetics for your terminal. It transforms the mood of your terminal with ASCII art effects and special scenes based on your configuration.

```text
🌸 Spring - Cherry Blossoms    🌧️ Summer - Rain    🍂 Autumn - Falling Leaves    ❄️ Winter - Snow
🌕 Moonlit Lake                🔥 Campfire                🎆 Fireworks
```

![moonlake](images/moonlake.gif)

---

## 🚀 Installation & Usage

### Local Build & Run
```bash
git clone https://github.com/kobong8/VibePicnic.git
cd VibePicnic
npm install
npm run build
npm start
# or
npm run dev
```

### Register as a Global Command (use `vibe-picnic` anywhere)
```bash
npm run build
npm link

# Then run from anywhere
vibe-picnic
vibe-picnic --season moonlake
vp --season campfire    # shorthand command
vp --season fireworks   # realistic night fireworks
```

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

#### ⏰ Splash Schedule

You can control how often the splash screen appears:

| Mode | Description |
|:---:|---|
| `always` | Show every time a terminal opens **(default)** |
| `daily` | Show only once per day (skips if already shown today) |
| `boot` | Show only once after each system boot |

```bash
# Once per day
vibe-picnic config set schedule daily

# Once per system boot
vibe-picnic config set schedule boot

# Every terminal open (default)
vibe-picnic config set schedule always
```

The last run time is tracked in `~/.vibe-picnic-schedule.json`. When the schedule condition is not met, the splash is silently skipped and your shell starts immediately.

---

## 🗑️ Uninstallation

### 1. Remove the Global Package

First, check the registered package name:
```bash
npm ls -g --depth=0
```

Then uninstall it:
```bash
npm uninstall -g vibe-picnic
```

> If you registered it with `npm link`, you can also run `npm unlink` from the project folder:
> ```bash
> cd VibePicnic
> npm unlink
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
rm ~/.vibe-picnic-schedule.json  # splash schedule tracking
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

The `fireworks` theme is a beautiful fireworks display in the starry night.

Examples will be added soon.

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

### CLI Options
| Option | Description | Default |
|---|---|:---:|
| `--season <name>` | Select a theme (`spring`, `summer`, `autumn`, `winter`, `moonlake`, `campfire`, `fireworks`, `auto`, `random`) | `auto` |
| `--density <n>` | Particle density (1–50) | `15` |
| `--speed <n>` | Animation speed multiplier (0.1–5.0) | `1.0` |
| `--wind <n>` | Wind strength and direction (-5.0 to 5.0) | `0.5` |
| `--splash` | Splash mode (press any key to exit) | `off` |
| `--schedule <mode>` | Splash frequency: `always` / `daily` / `boot` | `always` |
| `--message <text>` | Custom message to display on the splash screen | - |
| `--ascii` | Render using ASCII characters only | `off` |
| `--no-color` | Disable color effects | `off` |
| `--no-ground` | Disable particle accumulation on the ground | `off` |

### Real-Time Keyboard Controls
| Key | Action |
|:---:|---|
| `1` ~ `7` | Instantly switch themes |
| `↑` `↓` | Adjust particle density |
| `←` `→` | Adjust wind direction and strength |
| `r` | Reset accumulated ground particles |
| `q` / `ESC` | Quit the program |

---

## ⚙️ Persistent Configuration

Save your default settings permanently so you don't have to type options every time. Settings are stored in `.vibe-picnic.json` in your home directory.

```bash
# Show current settings (✏️ marks values you've set manually)
vibe-picnic config show

# Set the default theme to campfire
vibe-picnic config set season campfire

# Change particle density
vibe-picnic config set density 30

# A brighter fireworks setup
vibe-picnic config set density 24
vibe-picnic config set speed 1.2

# Enable ASCII mode (use characters instead of emoji)
vibe-picnic config set ascii true

# Set splash schedule
vibe-picnic config set schedule daily    # once per day
vibe-picnic config set schedule boot     # once per system boot
vibe-picnic config set schedule always   # every terminal open (default)

# Reset all settings to defaults
vibe-picnic config reset

# Show the config file location
vibe-picnic config path    # e.g. ~/.vibe-picnic.json
```

---

## 📅 Auto Season Detection

When using `--season auto` (the default), a theme is selected based on the system's current month:

| Month | Selected Theme |
|:---:|:---:|
| March – May | Spring |
| June – August | Summer |
| September – November | Autumn |
| December – February | Winter |

---

## 🎲 Random Theme Mode

With `--season random`, a random theme is chosen from all 7 options each time you run the program.

```bash
# Random for a single run
vibe-picnic --season random

# Set random as the default
vibe-picnic config set season random
```

Combined with the terminal splash, you'll get a different theme every time your terminal opens:

```bash
# Add to ~/.zshrc or ~/.bashrc
vibe-picnic --splash --season random
```

---

## 📋 Requirements & License

- **Node.js:** >= 14.0.0
- **Dependencies:** None (Zero-dependency)
- **License:** MIT
