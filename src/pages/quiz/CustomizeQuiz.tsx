import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, Lock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuizManagementViewModel } from '../../viewmodels/QuizManagementViewModel';

const CustomizeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { quiz, themes, loading, saving, updateQuiz } = useQuizManagementViewModel(id);

  const [customization, setCustomization] = useState({
    theme_id: '',
    photo_url: '',
    password: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (quiz) {
      setCustomization({
        theme_id: quiz.theme_id,
        photo_url: quiz.photo_url || '',
        password: quiz.password || ''
      });
      setPreviewUrl(quiz.photo_url || '');
    }
  }, [quiz]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (!quiz) return;

    try {
      let photoUrl = customization.photo_url;

      // In a real implementation, you would upload the file to Supabase Storage
      if (selectedFile) {
        // TODO: Implement file upload to Supabase Storage
        // const { data, error } = await supabase.storage
        //   .from('quiz-images')
        //   .upload(`${quiz.id}/${selectedFile.name}`, selectedFile);
        // if (!error) {
        //   photoUrl = data.path;
        // }
        addToast({
          type: 'info',
          title: 'File Upload',
          message: 'File upload functionality will be implemented with Supabase Storage'
        });
      }

      await updateQuiz(quiz.id, {
        theme_id: customization.theme_id,
        photo_url: photoUrl,
        password: customization.password || null
      });

      addToast({
        type: 'success',
        title: 'Customization Saved!',
        message: 'Your quiz customization has been updated'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save customization. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Quiz not found</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-rose-600 hover:text-rose-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/quiz/${id}/edit`)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customize Quiz</h1>
            <p className="text-gray-600">Personalize the appearance and settings of your quiz</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(`/quiz/${id}/preview`)}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Customization Options */}
        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Theme</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {themes.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => setCustomization(prev => ({ ...prev, theme_id: theme.id }))}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    customization.theme_id === theme.id
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.primary_color }}
                    ></div>
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.secondary_color }}
                    ></div>
                  </div>
                  <h3 className="font-medium text-gray-900">{theme.name}</h3>
                  {theme.is_premium && (
                    <span className="text-xs text-purple-600 font-medium">Premium</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cover Image</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Quiz cover" 
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                    />
                    <button
                      onClick={() => {
                        setPreviewUrl('');
                        setSelectedFile(null);
                        setCustomization(prev => ({ ...prev, photo_url: '' }));
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600">Upload a cover image for your quiz</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Password Protection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Password Protection</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Require password to access quiz</span>
              </div>
              
              <input
                type="password"
                value={customization.password}
                onChange={(e) => setCustomization(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
              />
              
              <p className="text-sm text-gray-500">
                Leave empty to make the quiz publicly accessible
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview</h2>
          
          <div 
            className="rounded-lg p-6 min-h-96"
            style={{ 
              backgroundColor: themes.find(t => t.id === customization.theme_id)?.background_color || '#fdf2f8'
            }}
          >
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Quiz cover" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
            )}
            
            <div className="text-center">
              <h3 
                className="text-2xl font-bold mb-2"
                style={{ 
                  color: themes.find(t => t.id === customization.theme_id)?.text_color || '#1f2937'
                }}
              >
                {quiz.title}
              </h3>
              
              {quiz.description && (
                <p 
                  className="text-lg mb-6"
                  style={{ 
                    color: themes.find(t => t.id === customization.theme_id)?.text_color || '#6b7280'
                  }}
                >
                  {quiz.description}
                </p>
              )}
              
              <div 
                className="inline-block px-6 py-3 rounded-lg text-white font-semibold"
                style={{ 
                  background: `linear-gradient(to right, ${
                    themes.find(t => t.id === customization.theme_id)?.primary_color || '#ec4899'
                  }, ${
                    themes.find(t => t.id === customization.theme_id)?.secondary_color || '#8b5cf6'
                  })`
                }}
              >
                Start Quiz
              </div>
              
              {customization.password && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Password protected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeQuiz;