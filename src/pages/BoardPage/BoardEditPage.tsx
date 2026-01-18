import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api/client';

import PencilIcon from '../../assets/MyPage/Pencil.svg';
import ArrowIcon from '../../assets/Board/underArrow.svg';
import './BoardCreatePage.css';

interface PostResponse {
  post: {
    postId: number;
    title: string;
    type: string;
    textContent: string;
  };
  postImageUrls: string[];
}

const categories = ['소통', '인증', '질문', '구인', '정보'];

const BoardEditPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('소통');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: '내용을 입력하세요 |' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
  });

  /* ---------------- 게시글 조회 ---------------- */
  const { data, isLoading, isError } = useQuery<PostResponse>({
    queryKey: ['postDetail', postId],
    queryFn: async () => {
      const res = await api.get(`/posts/${postId}`);
      return res.data.data;
    },
    enabled: !!postId && !!editor,
  });

  useEffect(() => {
    if (!data || !editor) return;
    const { post } = data;

    setTitle(post.title);
    setSelectedCategory(post.type);

    const content: JSONContent[] = [];
    if (post.textContent) {
      content.push({ type: 'paragraph', content: [{ type: 'text', text: post.textContent }] });
    }
    editor.commands.setContent({ type: 'doc', content });
  }, [data, editor]);

  /* ---------------- 게시글 수정 ---------------- */
  const { mutate: updatePost, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.patch(`/posts/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      alert('게시글이 수정되었습니다.');
      navigate(`/posts/${postId}`);
    },
    onError: () => {
      alert('게시글 수정에 실패했습니다.');
    },
  });

  /* ---------------- 파일 업로드 ---------------- */
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || !editor) return;

  const fileArray = Array.from(files);
  setUploadedFiles(prev => [...prev, ...fileArray]);

  // forEach 대신 for...of 사용
  for (const file of fileArray) {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    
    // 각 이미지를 순차적으로 삽입
    editor.chain().focus().setImage({ src: dataUrl }).run();
  }
};


  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 30) setTitle(e.target.value);
  };

 const handleSubmit = async () => {
  if (!editor || !postId || !data) return;

  const formData = new FormData();

  // ---------------- 이미지 파일 추가 ----------------
  console.log('[DEBUG] uploadedFiles:', uploadedFiles);
  uploadedFiles.forEach(file => formData.append('images', file));

  // ---------------- TipTap에서 기존 이미지 URL만 추출 ----------------
  const extractImageUrls = (nodes: any[]): string[] => {
    let urls: string[] = [];
    nodes.forEach(node => {
      if (node.type === 'image' && node.attrs?.src && !node.attrs.src.startsWith('data:')) {
        urls.push(node.attrs.src);
      }
      if (node.content) urls = urls.concat(extractImageUrls(node.content));
    });
    return urls;
  };

  const existingImageUrls = extractImageUrls(editor.getJSON().content || []);
  console.log('[DEBUG] 기존 이미지 URLs:', existingImageUrls);

  // 기존 이미지도 fetch → Blob → File로 FormData에 추가
  for (let i = 0; i < existingImageUrls.length; i++) {
    const src = existingImageUrls[i];
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], `existing_${i}.jpg`, { type: blob.type });
      formData.append('images', file);
    } catch (err) {
      console.error('이미지 fetch 실패:', src, err);
    }
  }

  // ---------------- post 필드 처리 ----------------
  const postPayload: Record<string, any> = {};
  const currentText = editor.getText().trim();

  if (title !== data.post.title) postPayload.title = title;
  if (selectedCategory !== data.post.type) postPayload.type = selectedCategory;
  if (currentText !== data.post.textContent) postPayload.text = currentText;

  console.log('[DEBUG] postPayload:', postPayload);

  if (Object.keys(postPayload).length > 0) {
    formData.append(
      'post',
      new Blob([JSON.stringify(postPayload)], { type: 'application/json' })
    );
  }

  // ---------------- 변경 사항 체크 ----------------
  const hasChanges = uploadedFiles.length > 0 || Object.keys(postPayload).length > 0 || existingImageUrls.length > 0;
  if (!hasChanges) return alert('수정할 내용이 없습니다.');

  console.log('[DEBUG] FormData entries:');
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  // ---------------- 전송 ----------------
  updatePost(formData);
};

  /* ---------------- 렌더 ---------------- */
  if (isLoading) return <div className="loading">로딩중...</div>;
  if (isError || !data) return <div className="error">게시글 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="page-container">
      <main className="form-container">

        {/* 말머리 */}
        <div className="category-section">
          <label className="category-label">말머리 선택</label>
          <div className="dropdown-container">
            <button className="category-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {selectedCategory}
              <img src={ArrowIcon} alt="arrow" className={`icon-sm ${isDropdownOpen ? 'rotate' : ''}`} />
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
          <span className="char-count">( {title.length}/30 )</span>
        </div>

        {/* 에디터 */}
        <div className="tiptap-editor-box">
          <div className="tiptap-toolbar">
            <button onClick={handlePhotoClick}>Photo</button>
            <input
              title="툴 박스"
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>
          <div className="editor-content">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* 수정 버튼 */}
        <div className="footer-section">
          <button className="submit-button" onClick={handleSubmit} disabled={isPending}>
            <img src={PencilIcon} alt="pencil" className="icon-md" />
            {isPending ? '수정 중...' : '수정하기'}
          </button>
        </div>

      </main>
    </div>
  );
};

export default BoardEditPage;
