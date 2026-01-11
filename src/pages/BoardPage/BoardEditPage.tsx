import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
// import api from '../../api/client'; // 실제 API 연동용
import PencilIcon from '../../assets/MyPage/Pencil.svg';
import ArrowIcon from '../../assets/Board/underArrow.svg';
import './BoardCreatePage.css';
import { useNavigate, useParams } from 'react-router-dom';
import { usePosts, type Post } from '../../context/PostContext';

const BoardEditPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ------------------ MOCK DATA / Context ------------------
  const { posts, updatePost } = usePosts();
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('소통');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  const categories = ['소통', '인증', '질문'];
  const postToEdit = posts.find(p => p.postId === Number(postId));


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

  // ------------------ MOCK DATA 로딩 ------------------
  useEffect(() => {
    if (!postId || !editor || !postToEdit) return;

    setTitle(postToEdit.title);
    setSelectedCategory(postToEdit.type);
    setUploadedImageUrls(postToEdit.content.image_urls || []);

    const content = [];

    if (postToEdit.content.text_content) {
      content.push({
        type: 'paragraph',
        content: [{type: 'text', text: postToEdit.content.text_content }],
      });
    }

    postToEdit.content.image_urls?.forEach(url => {
      content.push({
        type: 'image',
        attrs: {src: url},
      });
    });

    editor.commands.setContent({
      type: 'doc',
      content,
    });
  }, [postId, editor, postToEdit]);

  // ------------------ 입력/선택 ------------------
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 30) setTitle(e.target.value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  // ------------------ 이미지 업로드 (mockData) ------------------
  const handlePhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      editor.chain().focus().setImage({ src: url }).run();
      setUploadedImageUrls(prev => [...prev, url]);
    };
    reader.readAsDataURL(file);

    // ------------------ 실제 업로드 연동용 (주석) ------------------
    /*
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/upload', formData); // 실제 API
      const url = res.data.url;
      editor.chain().focus().setImage({ src: url }).run();
      setUploadedImageUrls(prev => [...prev, url]);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      alert('이미지 업로드에 실패했습니다.');
    }
    */
  }, [editor]);

  // ------------------ 수정 제출 (mockData) ------------------
  const handleSubmit = () => {
    if (!title.trim()) return alert('제목을 입력해주세요.');
    if (!editor) return;
    if (!postId) return;

    const postToEdit = posts.find(p => p.postId === Number(postId));
    if (!postToEdit) return alert('게시글을 찾을 수 없습니다.');

    const updatedPost: Post = {
      ...postToEdit,
      title,
      type: selectedCategory,
      content: {
        text_content: editor.getText(),
        image_urls: uploadedImageUrls,
      },
    };

    // ------------------ mockData 적용 ------------------
    alert('게시글이 수정되었습니다! (mockData)');
    console.log('업데이트된 게시글:', updatedPost);
    updatePost(updatedPost);

    // ------------------ 실제 API 연동용 (주석) ------------------
    /*
    try {
      const res = await api.patch(`/api/posts/${postId}`, {
        title,
        type: selectedCategory,
        content: {
          text_content: editor.getText(),
          image_urls: uploadedImageUrls,
        },
      });
      console.log('수정된 게시글:', res.data);
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      alert('게시글 수정에 실패했습니다.');
      return;
    }
    */

    navigate(`/board/${postId}`);
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
              {selectedCategory}{' '}
              <img src={ArrowIcon} alt="arrow" className={`icon-sm ${isDropdownOpen ? 'rotate' : ''}`} />
            </button>
            {isDropdownOpen && (
              <ul className="category-dropdown">
                {categories.map((cat, idx) => (
                  <li key={cat}>
                    <button className="dropdown-item" onClick={() => handleCategorySelect(cat)}>
                      {cat}
                    </button>
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
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} 
            />
          </div>

          <div className="editor-content">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* 수정 버튼 */}
        <div className="footer-section">
          <button className="submit-button" onClick={handleSubmit}>
            <img src={PencilIcon} alt="pencil" className="icon-md" /> 수정하기
          </button>
        </div>
      </main>
    </div>
  );
};

export default BoardEditPage;
