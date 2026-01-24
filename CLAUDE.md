# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VideoDebrief is a browser-based video timeline app for sorting videos by timestamp and syncing audio tracks. It's 100% client-side with no server processing.

**Supported formats**: MP4 + MOV (iPhone, GoPro, most cameras), MP3 for audio

## Development Commands

All commands should be run from the `/debrief` directory:

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Production build (outputs to dist/)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Tech Stack

**Current:**
- React 19 with React Compiler (babel-plugin-react-compiler)
- Vite 7 for build tooling
- Tailwind CSS 4 via @tailwindcss/vite plugin
- react-dropzone for file uploads
- ESLint with React Hooks and React Refresh plugins

**Planned additions:**
- dnd-kit + dnd-timeline for timeline
- mp4-metadata + QuickTime parser for video metadata
- Web Audio API for audio playback

## Architecture

### Project Structure

The main application lives in `/debrief/src/`:
- `main.jsx` - Entry point, wraps App in VideoProvider
- `App.jsx` - Root component
- `components/` - React components
- `contexts/` - React Context providers
- `utils/` - Utility functions

### State Management

Uses React Context + useReducer pattern in `VideoContext.jsx`:

- **State shape**: `{ videos, audioClips, currentTime, isPlaying }`
- **Access via**: `useVideo()` hook returns `{ state, dispatch }`
- **Actions**: `ADD_VIDEO`, `ADD_AUDIO`, `SET_TIME`, `SET_PLAYING`, `REMOVE_VIDEO`
- Videos are auto-sorted by timestamp when added

### ESLint Configuration

Custom rule: `no-unused-vars` ignores variables starting with uppercase letters or underscores (pattern: `^[A-Z_]`).

## Planned Architecture

### Target Project Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Header, MainContent, Sidebar
│   ├── media/           # MediaDropZone, VideoDropArea, AudioDropArea
│   ├── preview/         # VideoPreview, PlaybackControls
│   └── timeline/        # Timeline, TimeRuler, VideoTrack, AudioTrack, Playhead
├── hooks/               # useVideoMetadata, useAudioContext, usePlayback
├── store/               # Zustand stores (media, playback, ui)
├── lib/
│   ├── metadata/        # Video timestamp extraction
│   ├── audio/           # Web Audio API wrapper
│   └── sync/            # PlaybackController (master sync)
└── types/               # TypeScript interfaces
```

### Key Technical Solutions

**Video Timestamp Extraction** (multi-strategy):
1. mp4-metadata for MP4 (fast)
2. QuickTime atom parsing for MOV
3. ffmpeg.wasm fallback (universal)
4. file.lastModified (last resort)

**Audio/Video Sync**:
- Master clock using `performance.now()` + `requestAnimationFrame`
- Video: HTML5 `<video>` with currentTime correction
- Audio: Web Audio API AudioBufferSourceNode for precise timing
- Drift correction if >100ms off

**Future GPS Support** (architecture ready):
- Extensible OverlayProvider interface
- Libraries: gopro-telemetry, GPXParser.js
- Overlay layer in VideoPreview component

## Implementation Phases

1. **Foundation** - Vite + React + TypeScript, Tailwind + shadcn/ui, Zustand store, basic layout
2. **Media Import** - Drag-drop, timestamp extraction, auto-sort, thumbnails
3. **Timeline** - dnd-timeline integration, TimeRuler, VideoTrack, Playhead, zoom/pan
4. **Audio Tracks** - MP3 import, draggable AudioClips, snap-to-grid, multiple tracks
5. **Playback & Sync** - VideoPreview, AudioEngine (Web Audio API), master sync, video transitions
6. **Polish** - Keyboard shortcuts, localStorage save/load, undo/redo, error handling

## Performance Targets

- <50ms sync drift
- <2s load time
- 60fps timeline scroll
