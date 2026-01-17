import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import PencilIcon from '../../assets/MyPage/Pencil.svg';
import ArrowIcon from '../../assets/Board/underArrow.svg';
import './BoardCreatePage.css';


interface Post {
  postId: number;
  title: string;
  type: string;
  text: string;      
  imageUrls: string[];   
}

// ----- 말머리 옵션 -----
const categories = ['소통', '인증', '질문', '구인', '정보'];

const BoardEditPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('소통');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);


  // ----- Tiptap 에디터 -----
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: '내용을 입력하세요 |' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
  });

  // ----- 게시글 불러오기 -----
  useEffect(() => {
    if (!postId || !editor) return;

    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/posts/${postId}`);
        const postResponse = res.data.data.post;
        const imageUrls = res.data.data.postImageUrls;

        setTitle(postResponse.title);
        setSelectedCategory(postResponse.type);
        setOriginalPost({
          postId: postResponse.postId,
          title: postResponse.title,
          type: postResponse.type,
          text: postResponse.textContent,
          imageUrls: imageUrls ?? [],
        });

        const content: JSONContent[] = [];

        if (postResponse.textContent) {
          content.push({
            type: 'paragraph',
            content: [{ type: 'text', text: postResponse.textContent }],
          });
        }

        (imageUrls ?? []).forEach((url) => {
          content.push({ type: 'image', attrs: { src: url } });
        });

        editor.commands.setContent({ type: 'doc', content });
      } catch (err) {
        console.error('게시글 불러오기 실패', err);
        alert('게시글 정보를 불러오지 못했습니다.');
        navigate('/post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, editor, navigate]);
  if (loading) return <div className="loading">로딩중...</div>;
  if (!originalPost) return <div className="error">게시글 정보를 불러올 수 없습니다.</div>;


  // ----- 이미지 업로드 -----
  const handlePhotoClick = () => {
  fileInputRef.current?.click();
};

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || !editor) return;

  const fileArray = Array.from(files);
  setUploadedFiles(prev => [...prev, ...fileArray]);

  fileArray.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
  });
};


  // ----- 말머리 선택 -----
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 30) setTitle(e.target.value);
  };

  const handleSubmit = async () => {
  if (!title.trim()) return alert('제목을 입력해주세요.');
  if (!editor || !postId) return;

  try {
    const formData = new FormData();

    // 새로 업로드된 파일만 추가
    uploadedFiles.forEach(file => {
      formData.append('images', file);
    });

    const postData = {
      title,
      type: selectedCategory,
      text: editor.getText().trim(),
    };

    const postBlob = new Blob([JSON.stringify(postData)], { type: 'application/json' });
    formData.append('post', postBlob);

    await api.patch(`/posts/${postId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    alert('게시글이 수정되었습니다.');
    navigate(`/post/${postId}`);
  } catch (err) {
    console.error(err);
    alert('게시글 수정에 실패했습니다.');
  }
};





  // ----- 렌더 -----
  return (
    <div className="page-container">
      <main className="form-container">
        {/* 말머리 선택 */}
        <div className="category-section">
          <label className="category-label">말머리 선택</label>
          <div className="dropdown-container">
            <button className="category-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {selectedCategory}{' '}
              <img
                src={ArrowIcon}
                alt="arrow"
                className={`icon-sm ${isDropdownOpen ? 'rotate' : ''}`}
              />
            </button>
            {isDropdownOpen && (
              <ul className="board-category-dropdown">
                {categories.map((cat, idx) => (
                  <li key={cat}>
                    <button className="board-dropdown-item" onClick={() => handleCategorySelect(cat)}>
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
          <span className="char-count">( {title?.length ?? 0}/30 )</span>
        </div>

        {/* Tiptap 에디터 */}
        <div className="tiptap-editor-box">
          <div className="tiptap-toolbar">
            <button onClick={handlePhotoClick}>Photo</button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
              title="이미지 삽입"
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