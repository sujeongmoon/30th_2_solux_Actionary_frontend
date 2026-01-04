import React, { useState, useRef, useEffect } from 'react';
import './ChatRoom.css';
import gradientArrow from '../../assets/homepage/Gradient_Arrow.svg';
import user from '../../assets/ChatRoom/user.svg';
import bot from '../../assets/ChatRoom/bot.svg';
import chatPencil from '../../assets/ChatRoom/chatPencil.svg';
import {
  summarizeFile,
  summarizeUrl,
  getSummaryJob,
} from '../../api/ai/aiSummaryApi';

type Message = {
  id: string;
  text: string;
  type: 'user' | 'bot';
};

const ChatBotUI = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: crypto.randomUUID(), text: '이거 파일 요약 좀 해줘', type: 'user' },
    { id: crypto.randomUUID(), text: '파일을 요약해드립니다.', type: 'bot' },
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chapters = Array(12).fill('족보 풀이 요청');

  /* -------------------- 자동 스크롤 -------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* -------------------- 폴링 -------------------- */
  
  const startPolling = (jobId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await getSummaryJob(jobId);
        const status = res.data.data.status;

        if (status === 'SUCCEEDED') {
          clearInterval(pollingRef.current!);
          setIsLoading(false);

          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              text: res.data.data.summary,
              type: 'bot',
            },
          ]);
        }

        if (status === 'FAILED') {
          clearInterval(pollingRef.current!);
          setIsLoading(false);

          setMessages(prev => [
            ...prev,
            {
              id: crypto.randomUUID(),
              text: '요약에 실패했습니다.',
              type: 'bot',
            },
          ]);
        }
      } catch {
        clearInterval(pollingRef.current!);
        setIsLoading(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  /* -------------------- 전송 -------------------- */
  const handleSend = async () => {
    if (isLoading) return;
    if (!inputText.trim() && !selectedFile) return;

    const file = selectedFile;
    const text = inputText;

    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: file ? file.name : text,
        type: 'user',
      },
    ]);

    setInputText('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const res = file
        ? await summarizeFile(file)
        : await summarizeUrl(text);

      if (res.status === 200) {
        setIsLoading(false);
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: res.data.data.summary,
            type: 'bot',
          },
        ]);
      }

      if (res.status === 202) {
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: '문서를 요약 중입니다...',
            type: 'bot',
          },
        ]);

        startPolling(res.data.data.jobId);
      }
    } catch (err: unknown) {
        let errorMessage = "요약 중 오류가 발생했습니다.";

        if (err instanceof Error) {
            errorMessage = err.message;
        }

      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: errorMessage,
          type: 'bot',
        },
      ]);
    }
  };

  /* -------------------- 파일 -------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setShowFileMenu(false);
    e.target.value = '';
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="chatbot-wrapper">
      {/* 사이드바 */}
      <div className="chatbot-sidebar">
        <div className="chat-sidebar-header">
          <img src={chatPencil} alt="연필" className="chat-pencil" />
          <span>채팅 요약</span>
        </div>

        <div className="chapter-list">
          {chapters.map((chapter, idx) => (
            <div
              key={idx}
              className={`chapter-item ${
                selectedChapter === idx ? 'selected' : ''
              }`}
              onClick={() => setSelectedChapter(idx)}
            >
              {chapter}
            </div>
          ))}
        </div>
      </div>

      {/* 메인 */}
      <div className="chatbot-main">
        <div className="chat-messages">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`message-wrapper ${msg.type}-message`}
            >
              {msg.type === 'bot' && (
                <img src={bot} alt="bot" className="bot-avatar" />
              )}
              <div className="message-bubble">{msg.text}</div>
              {msg.type === 'user' && (
                <img src={user} alt="user" className="user-avatar" />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 입력 */}
        <div className="chat-input-area">
          <div className="chat-input-container">
            <div className="chat-input-box">
              <button
                className="chat-plus-button"
                onClick={() => setShowFileMenu(!showFileMenu)}
              >
                +
              </button>

              <input
                type="text"
                value={selectedFile ? selectedFile.name : inputText}
                onChange={e =>
                  !selectedFile && setInputText(e.target.value)
                }
                placeholder={
                  selectedFile
                    ? '📄 파일 요약 모드'
                    : '| 요약할 URL을 입력하세요'
                }
                className="chat-text-input"
                readOnly={!!selectedFile}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />

              {selectedFile && (
                <button
                  className="clear-file-btn"
                  onClick={() => setSelectedFile(null)}
                >
                  ✕
                </button>
              )}

              <button
                className="chat-send-button"
                onClick={handleSend}
                disabled={isLoading}
              >
                <img src={gradientArrow} alt="send" />
              </button>

              {showFileMenu && (
                <>
                  <div
                    className="chat-file-menu-overlay"
                    onClick={() => setShowFileMenu(false)}
                  />
                  <div className="chat-file-menu">
                    <button onClick={openFilePicker}>
                      사진 및 파일 추가
                    </button>
                  </div>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="chat-hidden-input"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotUI;
