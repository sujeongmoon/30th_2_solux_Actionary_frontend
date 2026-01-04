import React, { useState, useRef } from 'react';
import './ChatRoom.css';
import gradientArrow from '../../assets/homepage/Gradient_Arrow.svg';
import user from '../../assets/ChatRoom/user.svg';
import bot from '../../assets/ChatRoom/bot.svg';
import chatPencil from '../../assets/ChatRoom/chatPencil.svg';

const ChatBotUI = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "I 이거 파일 요약 좀 해줘", type: 'user' },
    { id: 2, text: "| 파일을 요약해드립니다", type: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const chapters = Array(12).fill("족보 풀이 요청");

  const handleSend = () => {
    if (inputText.trim() || selectedFile) {
      const text = selectedFile ? selectedFile.name : inputText;
      const newMessage = {
        id: messages.length + 1,
        text,
        type: 'user'
      };
      setMessages([...messages, newMessage]);
      setInputText('');
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(file.name);
    setSelectedFile(file);
    setShowFileMenu(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };


  return (
    <div className="chatbot-wrapper">
      {/* 사이드바 */}
      <div className="chatbot-sidebar">
        <div className="chat-sidebar-header">
          <img src = {chatPencil} alt="연필 모양" className='chat-pencil' />
          <span>채팅 요약</span>
        </div>

        <div className="chapter-list">
          {chapters.map((chapter, idx) => (
            <div 
                key={idx} 
                className={`chapter-item ${selectedChapter === idx ? 'selected' : ''}`}
                onClick={() => setSelectedChapter(idx)}
            >
                {chapter}
            </div>
          ))}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="chatbot-main">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.type}-message`}>
              {msg.type === 'bot' && <img src = {bot} alt="봇 프사" className='bot-avatar' />}
              <div className="message-bubble">{msg.text}</div>
              {msg.type === 'user' && <img src = {user} alt="유저프사" className='user-avatar' />}
            </div>
          ))}
        </div>

        {/* 입력 영역 */}
        <div className="chat-input-area">
          <div className="chat-input-container">
            <div className="chat-input-box">
              <button onClick={() => setShowFileMenu(!showFileMenu)} className="chat-plus-button">+</button>

              <input
                type="text"
                value={selectedFile ? selectedFile.name : inputText}
                onChange={e => !selectedFile && setInputText(e.target.value)}
                placeholder="| ex) 파일을 요약해줘"
                className="chat-text-input"
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                readOnly={!!selectedFile}
              />

              {selectedFile && (
                <button onClick={() => setSelectedFile(null)} className="clear-file-btn">✕</button>
              )}

              <button onClick={handleSend} className="chat-send-button">
                <img src = {gradientArrow} alt="보내기 버튼" className='chat-send-arrow' />
              </button>

              {showFileMenu && (
                <>
                  <div className="chat-file-menu-overlay" onClick={() => setShowFileMenu(false)} />
                  <div className="chat-file-menu">
                    <button onClick={openFilePicker}>사진 및 파일 추가</button>
                  </div>
                </>
              )}

              <input ref={fileInputRef} type="file" className="chat-hidden-input" onChange={handleFileChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotUI;
