import React, { useState, useRef, useEffect } from 'react';
import './ChatRoom.css';
import gradientArrow from '../../assets/homepage/Gradient_Arrow.svg';
import user from '../../assets/ChatRoom/user.svg';
import bot from '../../assets/ChatRoom/bot.svg';
import chatPencil from '../../assets/ChatRoom/chatPencil.svg';
import { v4 as uuidv4 } from 'uuid';

import {
  summarizeFile,
  summarizeUrl,
  getSummaryJob,
  getSummaryList,
} from '../../api/ai/aiSummaryApi';
import type { SummaryListItem } from '../../types/aiSummary';
import { useLocation } from 'react-router-dom';

type Message = {
  id: string;
  text: string;
  type: 'user' | 'bot';
};

const ChatBotUI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [summaryList, setSummaryList] = useState<SummaryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<number | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const passedFile = location.state?.file as File | undefined;

  /* -------------------- 자동 파일 선택 -------------------- */
  useEffect(() => {
    if (passedFile) setSelectedFile(passedFile);
  }, [passedFile]);

  /* -------------------- 자동 스크롤 -------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* -------------------- 요약중 메시지 교체 헬퍼 -------------------- */
  const replaceLoadingMessage = (text: string) => {
  setMessages(prev => {
    const next = [...prev];

    let index = -1;
    for (let i = next.length - 1; i >= 0; i--) {
      if (next[i].type === 'bot' && next[i].text === '요약중입니다...') {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      next[index] = { id: uuidv4(), text, type: 'bot' };
    }

    return next;
  });
};


  /* -------------------- 폴링 -------------------- */
  const startPolling = (jobId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await getSummaryJob(jobId);
        const data = res.data.data;

        if (data.status === 'SUCCEEDED') {
          clearInterval(pollingRef.current!);
          replaceLoadingMessage(data.summary);
          setIsLoading(false);
        } else if (data.status === 'FAILED') {
          clearInterval(pollingRef.current!);
          replaceLoadingMessage(
            typeof data.error === 'string'
              ? data.error
              : '요약에 실패했습니다. 다시 보내주세요!'
          );
          setIsLoading(false);
        }
      } catch {
        clearInterval(pollingRef.current!);
        replaceLoadingMessage('요약 중 오류가 발생했습니다.');
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
    if (isLoading || (!inputText.trim() && !selectedFile)) return;

    const userText = selectedFile ? selectedFile.name : inputText;

    // 유저 메시지 + 요약중 메시지 (항상 먼저)
    setMessages(prev => [
      ...prev,
      { id: uuidv4(), text: userText, type: 'user' },
      { id: uuidv4(), text: '요약중입니다...', type: 'bot' },
    ]);

    setInputText('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const res = selectedFile
        ? await summarizeFile(selectedFile)
        : await summarizeUrl(inputText, { language: 'ko', maxTokens: 600 });

      const data = res.data.data;

      if (data.status === 'SUCCEEDED') {
        replaceLoadingMessage(data.summary);
        setIsLoading(false);
      } else if (data.status === 'PENDING' || data.status === 'PROCESSING') {
        if (data.jobId) startPolling(data.jobId);
      } else if (data.status === 'FAILED') {
        replaceLoadingMessage(
          typeof data.error === 'string'
            ? data.error
            : '요약에 실패했습니다 다시 시도해주세요.'
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      replaceLoadingMessage(
        err instanceof Error ? err.message : '요약 중 오류가 발생했습니다.'
      );
      setIsLoading(false);
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

  /* -------------------- 요약 목록 -------------------- */
  useEffect(() => {
    const fetchSummaryList = async () => {
      try {
        const res = await getSummaryList(1, 10);
        setSummaryList(res.data.data.content);
      } catch (e) {
        console.error('요약 목록 조회 실패', e);
      }
    };
    fetchSummaryList();
  }, []);

  /* -------------------- 상세 조회 -------------------- */
  const handleSelectChapter = async (jobId: string) => {
    setSelectedChapter(jobId);
    setIsLoading(true);
    try {
      const res = await getSummaryJob(jobId);
      const data = res.data.data;

      if (data.status === 'SUCCEEDED') {
        setMessages([{ id: uuidv4(), text: data.summary, type: 'bot' }]);
      } else if (data.status === 'FAILED') {
        setMessages([{
          id: uuidv4(),
          text:
            typeof data.error === 'string'
              ? data.error
              : '요약에 실패했습니다. 다시 시도해주세요.',
          type: 'bot',
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- 새 대화 -------------------- */
  const handleNewConversation = () => {
    setMessages([]);
    setSelectedChapter(null);
    setSelectedFile(null);
    setInputText('');
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="chatbot-wrapper">
      {/* 사이드바 */}
      <div className="chatbot-sidebar">
        <div className="chat-sidebar-header">
          <img
            src={chatPencil}
            alt="연필"
            className="chat-pencil"
            onClick={handleNewConversation}
          />
          <span>채팅 요약</span>
        </div>

        <div className="chapter-list">
          {summaryList.map(item => (
            <div
              key={item.jobId}
              className={`chapter-item ${selectedChapter === item.jobId ? 'selected' : ''}`}
              onClick={() => handleSelectChapter(item.jobId)}
            >
              <div className="chapter-title">{item.title}</div>
              <div className={`chapter-status ${item.status.toLowerCase()}`}>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 메인 */}
      <div className="chatbot-main">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.type}-message`}>
              {msg.type === 'bot' && <img src={bot} alt="bot" className="bot-avatar" />}
              <div className="message-bubble">{msg.text}</div>
              {msg.type === 'user' && <img src={user} alt="user" className="user-avatar" />}
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
                onChange={e => !selectedFile && setInputText(e.target.value)}
                placeholder={selectedFile ? '📄 파일 요약 모드' : '| 요약할 파일을 첨부해주세요'}
                className="chat-text-input"
                readOnly={!!selectedFile}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />

              {selectedFile && (
                <button className="clear-file-btn" onClick={() => setSelectedFile(null)}>
                  ✕
                </button>
              )}

              <button className="chat-send-button" onClick={handleSend} disabled={isLoading}>
                <img src={gradientArrow} alt="chat-send-arrow" className="chat-send-arrow" />
              </button>

              {showFileMenu && (
                <>
                  <div className="chat-file-menu-overlay" onClick={() => setShowFileMenu(false)} />
                  <div className="chat-file-menu">
                    <button onClick={openFilePicker}>사진 및 파일 추가</button>
                  </div>
                </>
              )}

              <input ref={fileInputRef} type="file" className="chat-hidden-input" onChange={handleFileChange} title="입력창" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotUI;
