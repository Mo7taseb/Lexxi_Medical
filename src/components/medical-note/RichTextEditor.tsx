import React, { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { Language } from './types';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  placeholder?: string;
  onSave?: () => void;
  onCancel?: () => void;
  showControls?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  language,
  placeholder,
  onSave,
  onCancel,
  showControls = true
}) => {
  const [isFormatMode, setIsFormatMode] = useState(false);
  const isRTL = language === 'ar';

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = document.querySelector('.rich-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatButtons = [
    { label: 'B', action: () => insertFormatting('**', '**'), title: 'Bold' },
    { label: 'I', action: () => insertFormatting('*', '*'), title: 'Italic' },
    { label: '•', action: () => insertFormatting('\n• ', ''), title: 'Bullet Point' },
    { label: '1.', action: () => insertFormatting('\n1. ', ''), title: 'Numbered List' },
  ];

  return (
    <div className="rich-text-editor" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Formatting Toolbar */}
      {showControls && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px',
            padding: '8px',
            background: '#f3f4f6',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid #e5e7eb',
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}
        >
          <button
            type="button"
            onClick={() => setIsFormatMode(!isFormatMode)}
            style={{
              padding: '4px 8px',
              background: isFormatMode ? '#3b82f6' : '#ffffff',
              color: isFormatMode ? '#ffffff' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={14} />
          </button>
          
          {isFormatMode && formatButtons.map((btn, index) => (
            <button
              key={index}
              type="button"
              onClick={btn.action}
              title={btn.title}
              style={{
                padding: '4px 8px',
                background: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: btn.label === 'B' ? 'bold' : 'normal',
                fontStyle: btn.label === 'I' ? 'italic' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Text Area */}
      <textarea
        className="rich-editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: '300px',
          padding: '16px',
          border: '1px solid #d1d5db',
          borderRadius: showControls ? '0 0 8px 8px' : '8px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: isRTL ? 'Cairo, sans-serif' : 'Inter, sans-serif',
          textAlign: isRTL ? 'right' : 'left',
          resize: 'vertical',
          outline: 'none',
          background: '#ffffff',
          color: '#1f2937'
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      />

      {/* Action Buttons */}
      {showControls && (onSave || onCancel) && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            justifyContent: isRTL ? 'flex-start' : 'flex-end',
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}
        >
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#6b7280',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#4b5563';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#6b7280';
              }}
            >
              <X size={16} />
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          )}
          
          {onSave && (
            <button
              onClick={onSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#059669';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#10b981';
              }}
            >
              <Save size={16} />
              {isRTL ? 'حفظ' : 'Save'}
            </button>
          )}
        </div>
      )}

      {/* Formatting Guide */}
      {isFormatMode && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            background: '#dbeafe',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#1e40af'
          }}
        >
          <strong>{isRTL ? 'دليل التنسيق:' : 'Formatting Guide:'}</strong>
          <ul style={{ margin: '4px 0', paddingLeft: isRTL ? '0' : '16px', paddingRight: isRTL ? '16px' : '0' }}>
            <li>**{isRTL ? 'نص عريض' : 'Bold text'}**</li>
            <li>*{isRTL ? 'نص مائل' : 'Italic text'}*</li>
            <li>• {isRTL ? 'نقطة' : 'Bullet point'}</li>
            <li>1. {isRTL ? 'قائمة مرقمة' : 'Numbered list'}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
