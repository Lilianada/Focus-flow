---

# FocusFlow

FocusFlow is a productivity and time management application designed to help users organize their tasks, manage their energy levels, and stay focused. It combines task management, a Pomodoro timer, and a note-taking system in an intuitive and distraction-free interface.

## Features

- **Task Management**
  - Create tasks and organize them based on energy levels.
  - Filter tasks easily, including an "ALL" category for convenience.

- **Pomodoro Timer**
  - Sync tasks with a customizable Pomodoro timer.
  - Track detailed subtasks with planned vs. actual time spent.
  - View efficiency metrics and statistics for subtasks.

- **Notes System**
  - Capture thoughts and ideas seamlessly alongside tasks.

- **Accessibility**
  - Fully keyboard-navigable with shortcuts like `Alt+1`, `Alt+2`, `Alt+3` for sidebar navigation.
  - Enhanced theme toggle (shortcut `Alt+T`) and sidebar expand/collapse (shortcut `Alt+E`).

- **Offline Support**
  - Use the app without an internet connection, powered by an advanced service worker.

- **Modern and Intuitive UI**
  - Clean, Notion-like interface with responsive design.
  - Repositioned action buttons for better accessibility.

## Recent Improvements

### UI/UX Enhancements
- Fixed add task/notes buttons at the bottom right of the viewport.
- Redesigned offline page with a modern card-based layout.
- Improved sidebar navigation with tooltips and animations.

### Technical Enhancements
- Enhanced service worker for better offline functionality.
- Improved metadata handling for compatibility with Next.js 15.
- Fixed React performance issues like infinite update loops.

### Functionality Upgrades
- Enhanced Pomodoro timer with subtask tracking and time statistics.
- Improved error handling throughout the application.

## Next Steps

1. Add drag-and-drop functionality for tasks.
2. Implement task categories or tags for better organization.
3. Create a productivity metrics dashboard.
4. Enable data export/import functionality.
5. Add multi-device sync with user authentication.
6. Introduce collaborative features for team productivity.

## Challenges Faced

- Fixing infinite update loops in React components.
- Implementing effective service worker caching strategies.
- Ensuring accessibility across the application.

## Resources Used

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)

## How to Contribute

We welcome contributions! Please fork the repository, make your changes, and submit a pull request. Ensure your code adheres to accessibility and performance best practices.

---
