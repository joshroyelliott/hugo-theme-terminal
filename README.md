# Terminal Hugo Theme

A modern, panel-based Hugo theme with a terminal/TUI aesthetic inspired by terminal user interfaces and code editors.

![Terminal Hugo Theme Screenshot](screenshot.png)

## Features

- **Panel System**: Flexible containers with various styles and interactive capabilities
- **Navigation Bar**: TUI-style toolbar system with chevron-shaped tabs
- **Grid Layouts**: Predefined responsive grid layouts for organizing content
- **Icon System**: Built-in icon support using Nerd Fonts
- **Interactive Components**: Tab panels, list panels, preview panels, and more
- **Responsive Design**: Mobile-first approach with appropriate breakpoints
- **Modern Development**: SCSS with variables and BEM-inspired component structure
- **Accessibility**: Keyboard navigation and semantic HTML

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Panel System](#panel-system)
- [Navigation System](#navigation-system)
- [Grid System](#grid-system)
- [Icons](#icons)
- [Interactive Components](#interactive-components)
- [Development](#development)
- [Customization](#customization)
- [License](#license)

## Installation

Add this repository as a submodule to your Hugo site:

```bash
git submodule add git@github.com:yourusername/hugo-theme-terminal.git themes/terminal
```

Then update your `config.toml` or `hugo.toml` to use the theme:

```toml
theme = "terminal"
```

## Usage

### Basic Page Structure

```html
{{ define "main" }}
<div class="panel panel--titled">
    <div class="panel__header">
        <span class="panel__title">{{ .Title }}</span>
    </div>
    <div class="panel__content">
        {{ .Content }}
    </div>
</div>
{{ end }}
```

### Development Commands

When developing with this theme, use these Hugo commands for the best experience:

```bash
# Development server with all watch options enabled
hugo server --navigateToChanged --disableFastRender --noHTTPCache --forceSyncStatic --watch
```

## Panel System

The panel system is the core building block of the Terminal theme.

### Panel Types

- **Basic Panel**: Simple container with content
- **Titled Panel**: Panel with a header containing a title
- **Numbered Panel**: Panel with a number in the header
- **List Panel**: Panel for displaying lists with counters
- **Tab Panel**: Panel with tabbed content sections
- **Scrollable Panel**: Panel with scrollable content and indicators
- **Input Panel**: Panel for text input with command-line styling
- **Preview Panel**: Panel for displaying previews from list panels

### Panel Classes

```html
<!-- Basic Panel -->
<div class="panel">
    <div class="panel__content">
        <p>Panel content goes here.</p>
    </div>
</div>

<!-- Titled Panel -->
<div class="panel panel--titled">
    <div class="panel__header">
        <span class="panel__title">Panel Title</span>
    </div>
    <div class="panel__content">
        <p>Panel content goes here.</p>
    </div>
</div>

<!-- Numbered Panel -->
<div class="panel panel--titled panel--numbered">
    <div class="panel__header">
        <span class="panel__number">[1]</span>
        <span class="panel__separator"></span>
        <span class="panel__title">Numbered Panel</span>
    </div>
    <div class="panel__content">
        <p>Panel content goes here.</p>
    </div>
</div>

<!-- Panel with Note -->
<div class="panel panel--titled panel--note">
    <div class="panel__header">
        <span class="panel__title">Panel Title</span>
    </div>
    <div class="panel__note">(Note text)</div>
    <div class="panel__content">
        <p>Panel content goes here.</p>
    </div>
</div>
```

### Interactive Panels

```html
<!-- Scrollable Panel -->
<div class="panel panel--titled panel--scroll">
    <div class="panel__header">
        <span class="panel__title">Scrollable Content</span>
    </div>
    <div class="panel__content">
        <!-- Content that exceeds the panel height will scroll -->
        <p>Lots of content here...</p>
    </div>
    <div class="js-scroll-indicator"></div>
</div>

<!-- Tab Panel -->
<div class="panel panel--titled panel--tab js-tab-panel">
    <div class="panel__header">
        <span class="panel__main-title">Tab Panel</span>
        <span class="panel__separator"></span>
        <div class="panel__tabs">
            <span class="panel__tab panel__tab--active" data-tab-id="tab-1">Tab 1</span>
            <span class="panel__tab-separator">-</span>
            <span class="panel__tab" data-tab-id="tab-2">Tab 2</span>
        </div>
    </div>
    <div class="panel__tab-contents">
        <div id="tab-1" class="panel__tab-content panel__tab-content--active">
            <p>Content for Tab 1</p>
        </div>
        <div id="tab-2" class="panel__tab-content">
            <p>Content for Tab 2</p>
        </div>
    </div>
</div>

<!-- Input Panel -->
<div class="panel panel--titled panel--input">
    <div class="panel__header">
        <span class="panel__title">Command Input</span>
    </div>
    <div class="panel__content">
        <input type="text" placeholder="Type a command..." value="echo 'Hello'">
    </div>
</div>

<!-- Input Panel with Scrolling -->
<div class="panel panel--titled panel--input panel--scroll">
    <div class="panel__header">
        <span class="panel__title">Scrollable Input</span>
    </div>
    <div class="panel__content">
        <textarea placeholder="Type longer content..."></textarea>
    </div>
    <div class="js-scroll-indicator"></div>
</div>
```

### List and Preview Panels

These panels work together to create a master-detail view:

```html
<!-- List Panel -->
<div class="panel panel--titled panel--list panel--scroll">
    <div class="panel__header">
        <span class="panel__title">List Panel</span>
    </div>
    <div class="panel__note">(Select one)</div>
    <div class="panel__content">
        <ul class="panel__list">
            <li class="panel__list-item">
                <a href="#" class="panel__list-link js-preview-link" data-preview-url="#preview-1">
                    <h4 class="panel__list-title">List Item 1</h4>
                    <div class="panel__list-meta">Meta information</div>
                    <div class="panel__list-summary">Summary text...</div>
                </a>
            </li>
            <!-- More list items... -->
        </ul>
    </div>
    <div class="js-scroll-indicator"></div>
</div>

<!-- Preview Panel -->
<div class="panel panel--titled panel--preview">
    <div class="panel__header">
        <span class="panel__title">Preview</span>
    </div>
    <div class="panel__content js-preview-content">
        <p>Click an item in the list to see a preview here.</p>
        
        <div id="preview-1" style="display: none;">
            <h3>Item 1 Content</h3>
            <p>Detailed content for the first item.</p>
        </div>
        <!-- More preview content... -->
    </div>
</div>
```

## Navigation System

The theme includes a configurable navigation bar system that mimics a TUI toolbar.

### Navigation Structure

The navigation system uses a configuration pattern to separate data from rendering:

```html
{{ $navLists := slice 
    (dict 
        "title" "Site Title"
        "titleURL" "/"
        "titleActive" true
        "direction" "right"
        "flatten" true
        "items" slice
    )
    (dict
        "title" ""
        "direction" "right" 
        "flatten" true
        "items" (slice
            (dict "name" "Home" "url" "/" "active" false "icon" (partial "components/icon" (dict "name" "home" "position" "left")))
            (dict "name" "Blog" "url" "/blog/" "active" false "icon" (partial "components/icon" (dict "name" "document" "position" "left")))
            (dict "name" "About" "url" "/about/" "active" false "icon" (partial "components/icon" (dict "name" "user" "position" "left")))
        )
    )
}}

{{ partial "components/nav-renderer.html" (dict "navLists" $navLists) }}
```

### Navigation Options

- **title**: Optional title for the navigation list
- **titleURL**: URL for the title
- **titleActive**: Whether the title is in active state
- **direction**: Chevron direction ("right" or "left")
- **flatten**: Whether to flatten edges at boundaries
- **items**: Array of navigation items with:
  - **name**: Item text
  - **url**: Item URL
  - **active**: Whether the item is active
  - **icon**: Optional icon (using the icon partial)

## Grid System

The theme includes a flexible grid system for organizing panels on the page.

### Standard Grid Layouts

```html
<!-- Two-column grid -->
<div class="grid-2col">
    <div class="panel"><!-- Panel content --></div>
    <div class="panel"><!-- Panel content --></div>
</div>

<!-- Three-column grid -->
<div class="grid-3col">
    <div class="panel"><!-- Panel content --></div>
    <div class="panel"><!-- Panel content --></div>
    <div class="panel"><!-- Panel content --></div>
</div>

<!-- Four-column grid -->
<div class="grid-4col">
    <!-- Four panels... -->
</div>

<!-- Main content with sidebar (1:2 ratio) -->
<div class="grid-main-sidebar">
    <div class="panel"><!-- Sidebar --></div>
    <div class="panel"><!-- Main content --></div>
</div>
```

### Advanced Grid Layouts

```html
<!-- Master and stack layout -->
<div class="grid-master-stack">
    <div class="panel"><!-- Master panel --></div>
    <div class="stack">
        <div class="panel"><!-- Stacked item 1 --></div>
        <div class="panel"><!-- Stacked item 2 --></div>
    </div>
</div>

<!-- Flexible thirds layout with span options -->
<div class="grid-thirds">
    <div class="panel span-2"><!-- Panel spanning 2 columns --></div>
    <div class="panel"><!-- Regular 1-column panel --></div>
    <div class="panel"><!-- Regular 1-column panel --></div>
    <div class="panel span-3"><!-- Panel spanning all 3 columns --></div>
</div>

<!-- Full-width stacked panels -->
<div class="grid-monocle">
    <div class="panel"><!-- Full-width panel 1 --></div>
    <div class="panel"><!-- Full-width panel 2 --></div>
</div>
```

## Icons

The theme uses Nerd Fonts for icons, providing a wide range of icons that work well in a terminal-like interface.

### Using Icons

Icons can be included using the icon partial:

```html
{{ partial "components/icon" (dict "name" "home" "position" "left") }}
```

### Icon Options

- **name**: The name of the icon
- **position**: "left" or "right" (determines margin placement)
- **size**: Optional size (xs, sm, md, lg, xl)
- **class**: Optional additional CSS classes
- **fw**: Boolean for fixed width

### Available Icons

The theme includes a wide range of icons, including:

- UI elements: home, search, folder, file, etc.
- Version control: git, github, etc.
- Development: code, terminal, etc.
- Media: video, image, music, etc.
- And many more...

## Interactive Components

The theme includes JavaScript-powered interactive components.

### Tab Panels

Tab panels allow for content to be organized into selectable tabs. On larger screens, tabs can automatically convert to a side-by-side column layout.

```html
<div class="panel panel--titled panel--tab js-tab-panel js-check-width">
    <!-- Tab panel content as shown above -->
</div>
```

### List Panels with Dynamic Counters

List panels automatically display a counter (e.g., "2 of 5") and handle selection states.

### Scrollable Panels with Indicators

Panels with the `panel--scroll` class show a scrollbar indicator on hover that displays the current scroll position.

### Auto-growing Input Areas

Textarea elements in `panel--input` automatically grow to fit their content.

## Development

### Directory Structure

```
themes/terminal/
├── assets/
│   ├── css/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── _base.scss
│   │   ├── _icons.scss
│   │   ├── _nerdfont.scss
│   │   ├── _showcase.scss
│   │   ├── _variables.scss
│   │   └── main.scss
│   └── js/
│       └── components/
│           └── panel.js
├── layouts/
│   ├── _default/
│   │   ├── baseof.html
│   │   ├── list.html
│   │   └── single.html
│   └── partials/
│       ├── components/
│       │   ├── footer.html
│       │   ├── icon.html
│       │   ├── nav-renderer.html
│       │   └── nav.html
│       └── panels/
│           ├── base.html
│           └── list-panel.html
└── static/
    └── fonts/
        └── FiraCodeNerdFont/
```

## Customization

### Theme Variables

The theme uses SCSS variables for easy customization. The main variables file is located at `assets/css/_variables.scss`.

#### Color Variables

```scss
:root {
  --base00: #24283B; // Background darker
  --base01: #16161E; // Background dark
  --base02: #343A52; // Selection background
  --base03: #444B6A; // Comments, invisibles
  --base04: #787C99; // Dark foreground
  --base05: #A9B1D6; // Default foreground
  --base06: #CBCCD1; // Light foreground
  --base07: #D5D6DB; // Light background
  --base08: #C0CAF5; // Variables
  --base09: #A9B1D6; // Numbers
  --base0A: #0DB9D7; // Classes
  --base0B: #9ECE6A; // Strings/Success
  --base0C: #B4F9F8; // Support
  --base0D: #2AC3DE; // Functions/Methods
  --base0E: #BB9AF7; // Keywords
  --base0F: #F7768E; // Deprecated/Error
}
```

#### Typography

```scss
$font-mono: 'Fira Code', Consolas, "DejaVu Sans Mono", monospace;
$font-size-base: 15px;
$line-height: 1.6;

// Nerd Font Configuration
$nerd-font-family: 'FiraCode Nerd Font', $font-mono;
$nerd-font-path: '/fonts/FiraCodeNerdFont/';
$use-nerd-font: true;
```

#### Spacing & Layout

```scss
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

$container-max-width: 1200px;
$panel-border-width: 2px;
$panel-border-radius: 6px;
$nav-height: 1.5rem;
```

#### Responsive Breakpoints

```scss
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
```

### Creating Custom Components

To create custom components, follow the existing patterns in the theme:

1. Create SCSS in `assets/css/components/` 
2. Add HTML templates in `layouts/partials/`
3. Add any required JavaScript to `assets/js/components/`

## License

MIT
