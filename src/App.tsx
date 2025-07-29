import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import PricingPage from './pages/PricingPage';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import CreateQuiz from './pages/quiz/CreateQuiz';
import EditQuiz from './pages/quiz/EditQuiz';
import CustomizeQuiz from './pages/quiz/CustomizeQuiz';
import PreviewQuiz from './pages/quiz/PreviewQuiz';
import QuizResults from './pages/quiz/QuizResults';
import AccountSettings from './pages/settings/AccountSettings';

// Guest Pages
import GuestQuiz from './pages/guest/GuestQuiz';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navigation from './components/navigation/Navigation';
import Footer from './components/layout/Footer';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                
                {/* Guest Quiz Route */}
                <Route path="/play/:slug" element={<GuestQuiz />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Navigation />
                    <Dashboard />
                    <Footer />
                  </ProtectedRoute>
                } />
                
                <Route path="/quiz/new" element={
                  <ProtectedRoute>
                    <Navigation />
                    <CreateQuiz />
                    <Footer />
                  </ProtectedRoute>
                } />
                
                <Route path="/quiz/:id/edit" element={
                  <ProtectedRoute>
                    <Navigation />
                    <EditQuiz />
                    <Footer />
                  </ProtectedRoute>
                } />
                
                <Route path="/quiz/:id/customize" element={
                  <ProtectedRoute>
                    <Navigation />
                    <CustomizeQuiz />
                    <Footer />
                  </ProtectedRoute>
                } />
                
                <Route path="/quiz/:id/preview" element={
                  <ProtectedRoute>
                    <Navigation />
                    <PreviewQuiz />
                    <Footer />
                  </ProtectedRoute>
                } />
                
                <Route path="/quiz/:id/results" element={
                  <ProtectedRoute>
                    <Navigation />
                    <QuizResults />
                    <Footer />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Navigation />
                    <AccountSettings />
                    <Footer />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;