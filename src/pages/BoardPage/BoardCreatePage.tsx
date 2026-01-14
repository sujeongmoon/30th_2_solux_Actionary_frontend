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
import { usePosts, type Post } from '../../context/PostContext';


const BoardCreatePage = () => {
  const navigate = useNavigate();
  const { addPost } = usePosts();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('소통');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['소통', '인증', '질문'];

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
  const handlePhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      editor.chain().focus().setImage({ src: url }).run();
      setUploadedImageUrls(prev => [...prev, url]);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/upload', formData); // 실제 업로드 API
      const url = res.data.url;
      editor.chain().focus().setImage({ src: url }).run();
      setUploadedImageUrls(prev => [...prev, url]);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      alert('이미지 업로드에 실패했습니다.');
    }
  }, [editor]);
  
  // ------------------ 게시글 생성 ------------------
  const handleSubmit = async() => {
    if (!title.trim()) return alert('제목을 입력해주세요.');
    if (!editor) return;
    try {
      const res = await api.post('/api/posts', {
        type: selectedCategory,
        title,
        content: {
          text_content: editor.getText(),
          image_urls: uploadedImageUrls,
        },
      });

      // 서버에서 생성된 게시글을 Context에 추가
      const newPost: Post = {
        postId: res.data.postId,
        title: res.data.title,
        type: res.data.type,
        content: res.data.content,
        nickname: res.data.nickname,
        created_at: res.data.created_at,
        comment_count: res.data.comment_count,
      };
      addPost(newPost); // Context 업데이트
      alert('게시글이 생성되었습니다!');
    } catch (err) {
      console.error('게시글 생성 실패:', err);
      alert('게시글 생성에 실패했습니다.');
      return;
    }

    // ------------------ 초기화 및 이동 ------------------
    setTitle('');
    editor.commands.clearContent(true);
    setUploadedImageUrls([]);
    setSelectedCategory('인증');
    navigate('/board');
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
              <ul className="category-dropdown">
                {categories.map((cat, idx) => (
                  <li key={cat}>
                    <button className="dropdown-item" onClick={() => handleCategorySelect(cat)}>{cat}</button>
                    {idx !== categories.length - 1 && <div className="dropdown-divider" />}
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
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
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