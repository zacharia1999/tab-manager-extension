# Tab Manager Pro

A powerful Chrome extension for efficient tab management with features like tab grouping, search, and session saving.

## Features

- **Tab Search**: Quickly find tabs with real-time search functionality
- **Tab Grouping**: Create and manage tab groups easily
  - Group multiple tabs together
  - Custom names for groups
  - Color-coded groups for better organization
  - Ungroup tabs as needed
- **Session Management**:
  - Save current window state with all tabs and groups
  - Restore saved sessions with original tab groups
  - Multiple session support
  - Delete unwanted sessions
- **Interactive UI**:
  - Clean, modern interface
  - Easy-to-use tab selection
  - Quick tab switching
  - One-click tab closing
  - Favicon support for better tab identification

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/tab-manager-pro.git
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

### Basic Navigation
- Click the extension icon to open the tab manager
- Use the search bar to filter tabs by title
- Click on any tab to switch to it
- Hover over tabs to reveal the close button

### Tab Grouping
1. Select multiple tabs using the checkboxes
2. Click "Group Selected" to create a new group
3. Enter a name for your group
4. Use "Ungroup Selected" to remove tabs from groups

### Session Management
1. Click "Save Current Session" to store your current window state
2. View saved sessions in the sessions list
3. Use "Restore" to open a saved session
4. Click "Delete" to remove unwanted sessions

## Development

### Project Structure
```
├── manifest.json
├── background.js
├── popup.html
├── popup.js
└── styles.css
```

### Requirements
- Chrome Browser
- Chrome Extension Developer Mode enabled

### Local Development
1. Make changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Click the refresh icon on your extension card

## Upcoming Features

- Cloud sync support
- Custom themes
- Advanced search capabilities
- Unlimited session storage
- More tab organization options

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you find this extension helpful, consider:
- ⭐ Starring the repository
- ☕ Supporting development via Ko-fi
- 📝 Rating the extension on Chrome Web Store
- 🐛 Reporting issues or suggesting features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

- Zacharia - Initial work and maintenance
- Contributors list will be updated as the project grows

## Acknowledgments

- Thanks to all users who provide feedback and suggestions
- Chrome Extensions development community
- All contributors who help improve the extension
