import React, { useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import api from '../../api/client'; // axios 인스턴스 (연동용)
import PencilIcon from '../../assets/MyPage/Pencil.svg';
import ArrowIcon from '../../assets/Board/underArrow.svg';
import './BoardCreatePage.css';
import { useNavigate } from 'react-router-dom';
import { type CreatePostResponse } from '../../types/Board';


const BoardCreatePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('소통');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const categories = ['소통', '인증', '질문', '구인', '정보'];

  // ------------------ Tiptap 에디터 ------------------
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: '내용을 입력하세요 |' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
  });

  // ------------------ 입력/선택 핸들러 ------------------
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 30) setTitle(e.target.value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  // ------------------ 이미지 업로드 ------------------
  // ------------------ 이미지 클릭 & 선택 ------------------
const handlePhotoClick = useCallback(() => {
  fileInputRef.current?.click();
}, []);

const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || !editor) return;

  const fileArray = Array.from(files);

  // 1️⃣ 파일 상태에 저장 (업로드는 handleSubmit에서)
  setUploadedFiles(prev => [...prev, ...fileArray]);

  // 2️⃣ TipTap 미리보기용 (base64)
  fileArray.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      editor.chain().focus().setImage({ src: url }).run();
    };
    reader.readAsDataURL(file);
  });
}, [editor]);

// ------------------ 게시글 생성 ------------------
  const handleSubmit = async () => {
  if (!title.trim()) return alert('제목을 입력해주세요.');
  if (!editor) return;

  try {
    const formData = new FormData();

    // 이미지 파일 추가
    uploadedFiles.forEach(file => {
      formData.append('images', file);
    });

    // 2️⃣ post 데이터를 application/json Blob으로 추가
    const loginUserId = Number(localStorage.getItem('userId'));
    const postData = {
      memberId: loginUserId,
      type: selectedCategory,
      title,
      content: {
        text: editor.getText(),
      }
    };
    
    const postBlob = new Blob([JSON.stringify(postData)], {
      type: 'application/json'
    });
    formData.append('post', postBlob);

    // 요청 (백엔드가 S3 업로드 + DB 저장 처리)
    const res = await api.post<CreatePostResponse>('/posts', formData);

    if (res.data.success) {
      alert('게시글이 생성되었습니다!');
      
      setTitle('');
      editor.commands.clearContent(true);
      setUploadedFiles([]);
      setUploadedImageUrls([]);
      setSelectedCategory('소통');

      navigate('/post');
    }
  } catch (err) {
    console.error(err);
    alert('게시글 생성에 실패했습니다.');
  }
};
  if (!editor) return null;

  return (
    <div className="page-container">
      <main className="form-container">
        {/* 말머리 선택 */}
        <div className="category-section">
          <label className="category-label">말머리 선택</label>
          <div className="dropdown-container">
            <button className="category-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {selectedCategory} <img src={ArrowIcon} alt="arrow" className={`icon-sm ${isDropdownOpen ? 'rotate' : ''}`} />
            </button>
            {isDropdownOpen && (
              <ul className="board-category-dropdown">
                {categories.map((cat, idx) => (
                  <li key={cat}>
                    <button className="board-dropdown-item" onClick={() => handleCategorySelect(cat)}>{cat}</button>
                    {idx !== categories.length - 1 && <div className="board-dropdown-divider" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 제목 */}
        <div className="title-section">
          <input
            type="text"
            className="title-input"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={handleTitleChange}
          />
          <span className="char-count">( {title.length}/30 )</span>
        </div>

        {/* Tiptap 에디터 */}
        <div className="tiptap-editor-box">
          <div className="tiptap-toolbar">
            <div className="toolbar-group">
              <button onClick={handlePhotoClick}>Photo</button>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} title="입력창" />
          </div>

          <div className="editor-content">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* 작성 버튼 */}
        <div className="footer-section">
          <button className="submit-button" onClick={handleSubmit}>
            <img src={PencilIcon} alt="pencil" className="icon-md" />
            작성하기
          </button>
        </div>
      </main>
    </div>
  );
};

export default BoardCreatePage;