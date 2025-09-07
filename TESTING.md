# 🧪 WatchHere Testing Guide

## 🎯 Testing Overview

### Test Categories
- **API Tests** - Backend endpoints and services
- **Web UI Tests** - Frontend user interface
- **Mobile Tests** - React Native app functionality
- **Integration Tests** - End-to-end workflows
- **Performance Tests** - Load and stress testing

## 🔧 Test Setup

### Install Testing Dependencies
```bash
# Backend testing
cd backend
npm install --save-dev jest supertest

# Frontend testing
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Mobile testing
cd mobile
npm install --save-dev detox
```

## 🚀 API Testing

### Authentication Tests
```bash
# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Expected: 201 Created with JWT token

# Test user login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected: 200 OK with JWT token

# Test protected route
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with user data
```

### Video API Tests
```bash
# Get all videos
curl -X GET http://localhost:5000/api/videos

# Expected: 200 OK with video array

# Get single video
curl -X GET http://localhost:5000/api/videos/VIDEO_ID

# Expected: 200 OK with video data

# Upload video (with auth)
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@test-video.mp4" \
  -F "title=Test Video" \
  -F "description=Test Description"

# Expected: 201 Created with video ID

# Like video
curl -X POST http://localhost:5000/api/videos/VIDEO_ID/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with like status
```

### AI Features Tests
```bash
# Voice search
curl -X POST http://localhost:5000/api/voice-search \
  -F "audio=@test-audio.wav"

# Expected: 200 OK with search results

# Get recommendations
curl -X GET http://localhost:5000/api/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with recommended videos
```

### Comment Tests
```bash
# Add comment
curl -X POST http://localhost:5000/api/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"VIDEO_ID","text":"Great video!"}'

# Expected: 201 Created with comment data

# Get comments
curl -X GET http://localhost:5000/api/comments/VIDEO_ID

# Expected: 200 OK with comments array
```

### Notification Tests
```bash
# Get notifications
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with notifications array

# Mark as read
curl -X PUT http://localhost:5000/api/notifications/NOTIFICATION_ID/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK
```

## 🌐 Web UI Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] **Registration Page**
  - [ ] Form validation works
  - [ ] Successful registration redirects to home
  - [ ] Error messages display correctly
  - [ ] OAuth buttons work (Google/GitHub)

- [ ] **Login Page**
  - [ ] Valid credentials log in successfully
  - [ ] Invalid credentials show error
  - [ ] "Remember me" functionality
  - [ ] Password reset link works

#### Video Features
- [ ] **Home Page**
  - [ ] Videos load and display correctly
  - [ ] Search functionality works
  - [ ] Category filtering works
  - [ ] Pagination works
  - [ ] Video thumbnails load

- [ ] **Video Player**
  - [ ] Video plays without issues
  - [ ] Controls work (play, pause, seek)
  - [ ] Volume control works
  - [ ] Fullscreen mode works
  - [ ] Video quality selection works

- [ ] **Upload Page**
  - [ ] File selection works
  - [ ] Upload progress shows
  - [ ] Form validation works
  - [ ] Thumbnail generation works
  - [ ] Success message displays

#### Social Features
- [ ] **Comments**
  - [ ] Add comment works
  - [ ] Comments display correctly
  - [ ] Edit/delete own comments
  - [ ] Reply to comments works

- [ ] **Likes & Subscriptions**
  - [ ] Like/unlike videos works
  - [ ] Subscribe/unsubscribe works
  - [ ] Like count updates
  - [ ] Subscriber count updates

#### AI Features
- [ ] **Voice Search**
  - [ ] Microphone access works
  - [ ] Recording indicator shows
  - [ ] Search results display
  - [ ] Voice feedback works

- [ ] **Recommendations**
  - [ ] Personalized videos show
  - [ ] Recommendations update
  - [ ] "Not interested" works

### Automated UI Tests
```javascript
// Example test with Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../pages/login';

test('login form submission', async () => {
  render(<LoginPage />);
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});
```

## 📱 Mobile App Testing

### Manual Testing Checklist

#### Core Functionality
- [ ] **App Launch**
  - [ ] App opens without crashes
  - [ ] Splash screen displays
  - [ ] Navigation works
  - [ ] Loading states show

- [ ] **Authentication**
  - [ ] Login form works
  - [ ] Registration works
  - [ ] OAuth login works
  - [ ] Biometric login works (if enabled)

#### Video Features
- [ ] **Video Feed**
  - [ ] Videos load in feed
  - [ ] Infinite scroll works
  - [ ] Pull to refresh works
  - [ ] Search functionality works

- [ ] **Video Player**
  - [ ] Videos play smoothly
  - [ ] Gesture controls work
  - [ ] Orientation change works
  - [ ] Background playback works
  - [ ] Offline playback works

- [ ] **Upload**
  - [ ] Camera recording works
  - [ ] Gallery selection works
  - [ ] Upload progress shows
  - [ ] Background upload works

#### Mobile-Specific Features
- [ ] **Push Notifications**
  - [ ] Notifications received
  - [ ] Notification tap opens app
  - [ ] Notification settings work
  - [ ] Badge count updates

- [ ] **Offline Mode**
  - [ ] Downloaded videos play offline
  - [ ] Sync when online
  - [ ] Offline indicator shows

### Device Testing
```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Physical Device
npx expo start
# Scan QR code with Expo Go
```

### Performance Testing
- [ ] **App Performance**
  - [ ] App starts in < 3 seconds
  - [ ] Video loads in < 5 seconds
  - [ ] Smooth 60fps scrolling
  - [ ] Memory usage < 200MB
  - [ ] Battery usage reasonable

## 🔄 Integration Testing

### End-to-End Workflows

#### User Registration to Video Upload
1. **Register new user** → Success
2. **Verify email** (if enabled) → Success
3. **Login with new account** → Success
4. **Upload first video** → Success
5. **Video appears in feed** → Success
6. **Other users can view** → Success

#### Social Interaction Flow
1. **User A uploads video** → Success
2. **User B finds video** → Success
3. **User B likes and comments** → Success
4. **User A gets notification** → Success
5. **User A replies to comment** → Success
6. **User B gets notification** → Success

#### AI Features Flow
1. **User uploads video** → Success
2. **AI generates summary** → Success
3. **AI moderates content** → Success
4. **Video appears in recommendations** → Success
5. **Voice search finds video** → Success

## ⚡ Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/videos"
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
EOF

# Run load test
artillery run load-test.yml
```

### Performance Benchmarks
- **API Response Times**
  - Authentication: < 200ms
  - Video list: < 300ms
  - Video upload: < 30s (100MB)
  - Search: < 500ms

- **Web App Performance**
  - First load: < 3s
  - Page transitions: < 1s
  - Video start: < 2s

- **Mobile App Performance**
  - App launch: < 3s
  - Video load: < 5s
  - Search results: < 2s

## 🐛 Bug Reporting

### Bug Report Template
```markdown
**Bug Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Platform: Web/Mobile/API
- Browser/Device: Chrome 120 / iPhone 14
- Version: 1.0.0

**Screenshots:**
Attach relevant screenshots

**Additional Context:**
Any other relevant information
```

## ✅ Test Automation

### CI/CD Testing
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Backend tests
      - name: Backend Tests
        run: |
          cd backend
          npm install
          npm test
      
      # Frontend tests
      - name: Frontend Tests
        run: |
          cd frontend
          npm install
          npm test
      
      # Mobile tests
      - name: Mobile Tests
        run: |
          cd mobile
          npm install
          npm test
```

### Test Scripts
```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:mobile": "detox test"
  }
}
```

## 📊 Test Reporting

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage
open coverage/lcov-report/index.html
```

### Test Results
- **Target Coverage**: > 80%
- **Critical Paths**: > 95%
- **API Endpoints**: 100%

## 🎯 Testing Checklist

### Pre-Release Testing
- [ ] All API tests pass
- [ ] Web UI tests pass
- [ ] Mobile app tests pass
- [ ] Performance benchmarks met
- [ ] Security tests pass
- [ ] Cross-browser compatibility
- [ ] Mobile device compatibility
- [ ] Load testing completed
- [ ] User acceptance testing done

### Production Monitoring
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] User analytics
- [ ] Crash reporting