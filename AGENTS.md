# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `yarn install` - Install dependencies
- `yarn start` - Start development server with webpack-dev-server
- `yarn build` - Build production bundle
- `yarn lint` - Run ESLint on src/ directory
- `yarn test` - Run tests with Karma/Mocha
- `yarn analyze` - Analyze bundle size with source-map-explorer

### Configuration Setup
Before running the project, copy `config.template.js` to `config.js` and configure Firebase settings.

## Architecture Overview

VerySlide is a React-based slide editor with two main execution contexts:

### 1. Web Application (`src/site/`)
- **React Router-based SPA** with authentication via Firebase
- **Entry Point**: `src/index.js` → `src/site/App.js`
- **Authentication**: Uses Firebase Auth with HOCs (`withAuthentication`, `withAuthorization`)
- **Routes**: Landing, SignIn/SignUp, Home, Account, Admin, and slide editor routes
- **Firebase Integration**: Firestore for slide storage and user management

### 2. Slide Editor (`src/components/` + `src/Veryslide.js`)
- **Core Architecture**: Document-Object-State pattern
- **Main Classes**:
  - `Veryslide` - Main slide editor controller, manages Firebase sync
  - `Document` - Contains pages and handles serialization
  - `Editor` - Visual editor interface with panels and tools
  - `DocumentController` - Bridges document and editor, handles Firebase operations
- **Object System**: Base object hierarchy for slide elements (TextBox, ImageBox, ImageList)
- **State Management**: Custom state system (`src/core/State.js`) with property binding and change notifications

### Core Patterns

#### Custom State System
The project uses a custom state management system (`core/State.js`) instead of Redux:
- Properties are automatically bound with getters/setters
- State changes trigger `updateState()` callbacks
- Channel-based event system (`core/Channel.js`) for component communication

#### Component Architecture
- **UI Components** (`src/components/ui/`): Custom UI library (Button, Panel, Dialog, etc.)
- **Object Components** (`src/components/objects/`): Slide content objects that extend BaseObject
- **Editor Components**: Main editor interface components (Property panel, PageList, etc.)

#### Firebase Integration
- **Slide Storage**: Firestore collections (`slides` → `revisions` → `pages`)
- **Batch Operations**: Uses Firestore batch writes for saving multiple pages
- **Real-time Data**: Structured for collaborative editing (future feature)

### Build System
- **Webpack**: Custom configuration with hot reload, SASS support, and production optimizations
- **Babel**: ES6+ transpilation with React support and module path resolution
- **Testing**: Karma + Mocha with webpack integration and coverage reporting

### Key Files
- `src/Veryslide.js` - Main slide editor initialization and Firebase sync
- `src/components/Editor.js` - Visual editor interface
- `src/components/Document.js` - Document model and page management
- `src/components/DocumentController.js` - Editor-Document bridge with Firebase operations
- `src/core/State.js` - Custom state management foundation
- `src/site/App.js` - Main React application with routing