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
const categories = ['소통', '인증', '질문'];

const BoardEditPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('소통');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [originalPost, setOriginalPost] = useState<Post | null>(null);
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
        navigate('/board');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, editor, navigate]);
  if (loading) return <div className="loading">로딩중...</div>;
  if (!originalPost) return <div className="error">게시글 정보를 불러올 수 없습니다.</div>;


  // ----- 이미지 업로드 -----
  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setNewImageFiles((prev) => [...prev, file]);

    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
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
  if (!editor || !postId || !originalPost) return;
  if (!title.trim()) {
    alert('제목을 입력해주세요');
    return;
  }

  try {
    // TipTap에서 base64가 아닌 URL만 추출
    const editorJSON = editor.getJSON();
    const imageUrls: string[] = [];
    editorJSON.content?.forEach((node: any) => {
      if (node.type === 'image' && !node.attrs.src.startsWith('data:')) {
        imageUrls.push(node.attrs.src);
      }
    });

    // 변경된 필드만 보내기
    const postData: {
      title?: string;
      type?: string;
      text?: string;
      imageUrls?: string[];
    } = {};

    if (title !== originalPost.title) postData.title = title;
    if (selectedCategory !== originalPost.type) postData.type = selectedCategory;
    const textContent = editor.getText().trim();
    if (textContent !== originalPost.text) postData.text = textContent;

    // 이미지 URL은 항상 전체 배열
    postData.imageUrls = imageUrls;

    // 변경 사항 없으면 alert
    if (Object.keys(postData).length === 1 && postData.imageUrls.length === originalPost.imageUrls.length &&
        postData.imageUrls.every((url, idx) => url === originalPost.imageUrls[idx])) {
      alert('변경된 내용이 없습니다.');
      return;
    }

    await api.patch(`/posts/${postId}`, postData); // JSON 그대로 전송

    alert('게시글이 수정되었습니다.');
    navigate(`/board/${postId}`);
  } catch (err) {
    console.error('게시글 수정 실패:', err);
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