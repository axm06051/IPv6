# IPv6 Practice Exercises

A comprehensive React application for mastering IPv6 addressing and prefix calculations. This project was converted from a CodePen demo to a clean, modern React application with improved functionality and bug fixes.

## 🚀 Features

- **Address Format Conversion**: Practice converting between full and abbreviated IPv6 addresses
- **Prefix Calculations**: Learn IPv6 network prefix calculations with various modes
- **Math Practice**: Strengthen division skills for prefix calculations
- **Real-time Statistics**: Track your progress with detailed performance metrics
- **Keyboard Shortcuts**: Press Enter to submit answers quickly
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Automatic theme detection with manual override support

## 🔧 Bug Fixes & Improvements

### Fixed Enter Key Input Handling
- **Issue**: The original CodePen version had no keyboard event handling for the Enter key
- **Solution**: Added `onKeyDown` event handlers to all input fields that detect Enter key presses and automatically submit answers
- **Impact**: Significantly improved user experience with faster answer submission

### Clean Code Architecture
- Converted from a single-file CodePen to a modular React application
- Separated concerns into logical components and utilities
- Implemented proper React hooks for state management
- Added TypeScript-style prop validation and documentation

### Modern React Practices
- Updated to React 19.2.4 (latest version)
- Used functional components with hooks throughout
- Implemented proper error boundaries and loading states
- Added accessibility improvements

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ipv6-practice-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📦 Dependencies

- **React 19.2.4**: Latest React version with improved performance
- **Bootstrap 5.3.3**: Modern CSS framework for responsive design
- **React Icons 5.5.0**: Comprehensive icon library
- **KaTeX 0.16.11**: Mathematical notation rendering
- **ipaddr.js 2.2.0**: IPv6 address parsing and manipulation

## 🎯 Usage

### Exercise Types

1. **Address Basics**
   - Full to Abbreviated: Convert full IPv6 addresses to their shortest form
   - Abbreviated to Full: Expand abbreviated addresses to full format

2. **Prefix Calculation**
   - Fixed /64: Practice with standard /64 prefixes
   - Divisible by 4: Work with prefixes that divide evenly by 4
   - Not Divisible by 4: Challenge yourself with irregular prefix lengths
   - Random Length: Mixed practice with various prefix lengths

3. **Math Practice**
   - Division exercises to strengthen prefix calculation skills

### Keyboard Shortcuts

- **Enter**: Submit your current answer
- **Tab**: Navigate between input fields
- **Escape**: Close modals and dialogs

### Statistics Tracking

The application automatically tracks:
- Total questions attempted
- Correct answers
- Success rate percentage
- Performance by category
- Session progress

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── modals/          # Modal dialog components
│   ├── AnswerInput.js   # Fixed input component with Enter key support
│   ├── Exercise.js      # Main exercise component
│   └── ...
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── constants/           # Application constants
└── styles/              # CSS styles
```

## 🐛 Original Issues Fixed

1. **Enter Key Bug**: Input fields didn't respond to Enter key presses
2. **Code Organization**: Single monolithic file was hard to maintain
3. **Outdated Dependencies**: Using older versions of React and libraries
4. **Accessibility**: Missing keyboard navigation and screen reader support
5. **Mobile Responsiveness**: Improved touch targets and responsive design

## 🔮 Future Enhancements

- [ ] Add more exercise types (subnetting, routing)
- [ ] Implement user accounts and progress saving
- [ ] Add timed challenges and leaderboards
- [ ] Include IPv6 to IPv4 transition exercises
- [ ] Add audio feedback for correct/incorrect answers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Original CodePen demo for the initial concept
- RFC specifications for IPv6 standards
- React community for excellent documentation and tools