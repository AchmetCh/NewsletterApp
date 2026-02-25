import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmailEditor from 'react-email-editor';
import MainLayout from '../layouts/MainLayout';
import { newsletterAPI } from '../api/newsletters';
import { uploadAPI } from '../api/upload';

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const emailEditorRef = useRef(null);
  
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    fetchNewsletter();
  }, [id]);

  const fetchNewsletter = async () => {
    try {
      const response = await newsletterAPI.getById(id);
      const data = response.data;
      setNewsletter(data);
      setTitle(data.title);
      setMonth(data.month);
      setYear(data.year);
    } catch (err) {
      alert('Failed to load newsletter');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onEditorReady = () => {
    // Load saved design if exists
    if (newsletter?.designJson && Object.keys(newsletter.designJson).length > 0) {
      emailEditorRef.current?.editor?.loadDesign(newsletter.designJson);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    emailEditorRef.current?.editor?.exportHtml(async (data) => {
      const { design, html } = data;

      try {
        await newsletterAPI.update(id, {
          title,
          month,
          year,
          designJson: design,
          html: html
        });
        alert('Newsletter saved successfully!');
      } catch (err) {
        alert('Failed to save newsletter');
      } finally {
        setSaving(false);
      }
    });
  };

  const handleExportHTML = () => {
    emailEditorRef.current?.editor?.exportHtml((data) => {
      const { html } = data;
      
      // Create a blob and download
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}-${month}-${year}.html`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Custom image upload handler for react-email-editor
  const onImageUpload = async (file) => {
    try {
      const response = await uploadAPI.uploadImage(file.attachments[0]);
      const imageUrl = response.data.url;
      
      // Return the image data in the format expected by react-email-editor
      return {
        progress: 100,
        url: imageUrl
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading editor...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ height: 'calc(100vh - 100px)' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1rem', 
          marginBottom: '1rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Newsletter Title"
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                flex: 1
              }}
            />
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="Month"
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                width: '150px'
              }}
            />
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Year"
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                width: '100px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleExportHTML}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Export HTML
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </div>

        <div style={{ 
          height: 'calc(100% - 80px)', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <EmailEditor
            ref={emailEditorRef}
            onReady={onEditorReady}
            options={{
              features: {
                imageEditor: true
              },
              tools: {
                image: {
                  enabled: true
                }
              }
            }}
            onUpload={onImageUpload}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default EditorPage;
