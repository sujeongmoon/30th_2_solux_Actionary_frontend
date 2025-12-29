import React, { useEffect, useState } from 'react';
import './MyPageOwner.css';
import BookmarkSection from '../../components/Bookmark/BookmarkSection';
import OwnerCheck from '../../assets/MyPage/OwnerCheck.svg';
import ProfileSection from '../../components/MyPage/ProfileSection';
import AchievementSection from '../../components/MyPage/AchievementSection';
import StudyTimeCheckIcon from '../../assets/MyPage/StudyTimeCheck.svg';

const MyPageOwner: React.FC = () => {

  type Tabkey = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

  type TodoStatus = 'PENDING' | 'DONE' | 'FAIL';

  interface TodoItem {
    todoId: number;
    title: string;
    categoryId : number;
    status: TodoStatus;
  }

  interface TodoCategory {
    categoryId: number;
    name: string;
    color: string;
  }

  const tabs : { key: Tabkey; label: string} []= [
    { key: 'DAY', label: '일간'},
    { key: 'WEEK', label: '주간'},
    { key: 'MONTH', label: '월간'},
    { key: 'YEAR', label: '연간'},
  ];

  const [activeTab, setActiveTab] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('DAY');
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    fetchStudyData(activeTab, today);
  }, [])

  const [studyData, setStudyData] = useState<Record<Tabkey, string>>({
    DAY: '0H 0M',
    WEEK: '0H 0M',
    MONTH: '0H 0M',
    YEAR: '0H 0M',
  });

  //초 => H M 변환 함수
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}H ${minutes}M`;
}

const [todoList, setTodoList] = useState<TodoItem[]>([]);


  // Mock 데이터 (초 단위)
const mockStudyData: Record<Tabkey, number> = {
  DAY: 3600 * 2 + 1800,    // 2시간 30분
  WEEK: 3600 * 10 + 900,   // 10시간 15분
  MONTH: 3600 * 40 + 1200, // 40시간 20분
  YEAR: 3600 * 500 + 3600, // 501시간
};

const mockCategories: TodoCategory[] = [
  { categoryId: 3, name: '학교', color: '#118AB2' },
  { categoryId: 11, name: '운동', color: '#FF6B6B' },
];

// Mock 투두리스트
const mockTodos: TodoItem[] = [
  { todoId: 1, title: '운영체제 과제하기', categoryId: 3, status: 'FAIL' },
  { todoId: 2, title: '네트워크 정리 업로드', categoryId: 3, status: 'DONE' },
  { todoId: 3, title: '헬스장 가기', categoryId: 11, status: 'PENDING' },
];


// api 연동 시 삭제하기
useEffect(() => {
    setTodoList(mockTodos);
    const today = new Date().toISOString().slice(0, 10);
    fetchStudyData(activeTab, today);
}, []);



  //API 호출
  const fetchStudyData = async (tab: Tabkey, date: string) => {
    // 실제 API 호출 코드 //
    {/*}
    try {
        const response = await fetch(`/api/studytimes?period=${tab}&date=${date}`, {
            headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`},
        });

        if (!response.ok) throw new Error ('공부 시간 조회 실패');

        const result = await response.json();
        if (result.success && result.data) {
            setStudyData(prev => ({
                ...prev,
                [tab] : formatDuration(result.data.durationSeconds),
            }));
        }
    } catch (err) {
        console.error(err);
    } */}
     // MOCK DATA임
    const seconds = mockStudyData[tab];
    setStudyData(prev => ({
        ...prev,
        [tab]: formatDuration(seconds),
    }));
  };

  {/* API 연동 시 실제 사용 */}
  {/*

  const fetchTodoList = async (date: string) => {
    try {
        const res = await fetch(`/api/todos?date=${date}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}`},
        });

        if (!res.ok) throw new Error('투두 목록 조회 실패');
        const result = await res.json();

        if (result.success && result.data && result.data.todos) {
            setTodoList(result.data.todos);
        }
    } catch (err) {
        console.error(err);
    }
  }; */}

  return (
    <div>
      <div className='owner-title'>마이 페이지</div>
      <div className='owner-divider'></div>

      {/*상단 그라데이션 박스*/}
      <div className='owner-container'>
        <ProfileSection />
        <div className='owner-profile-divider'></div>
        <AchievementSection />

      </div>
      <div className='owner-divider-box' />
      <BookmarkSection />
      <div className='owner-divider-box' />
    
      <div className='owner-todo-section'>
        {/* 왼쪽: 오늘의 TO DO LIST 카드 */}
        <div className='owner-card-todo'>
          <div className='owner-study-header'>
            <span className='owner-todo-title'>오늘의 TO DO LIST</span>
            <button className='owner-more-btn'>더보기</button>
          </div>

            
            <div className='owner-todo-body'>
                {todoList.map((todo) => {
                    const category = mockCategories.find(cat => cat.categoryId === todo.categoryId);

                    return (
                          <div className='owner-todo-item-wrapper' key={todo.todoId}>
                            {category && (
                                <span 
                                  className='owner-todo-tag'
                                  style = {{ 
                                    color: category?.color, 
                                    border: `1px solid ${category?.color}`,
                                    backgroundColor: 'transparent'
                                  }}
                                >
                                  {category?.name}
                                </span>  
                              )}
                        <div className='owner-todo-item'>
                            <img src = {OwnerCheck} alt = '체크 아이콘' className='owner-todo-check' />
                            <span className='owner-todo-text'>{todo.title}</span>
                            <div className='owner-todo-status'>
                                <button className={`owner-status-btn ${todo.status === 'DONE' ? 'active' : ''}`}>달성</button>
                                <button className={`owner-status-btn ${todo.status === 'FAIL' ? 'fail' : ''}`}>실패</button>
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>

        {/* 오른쪽: 공부량 카드 */}
        <div className='owner-card-study'>
            <div className='owner-study-title'>공부량</div>
            
            <div className='owner-study-body'>
            <div className='owner-study-tabs'>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                        <span
                            key = {tab.key}
                            className={`owner-tab ${isActive ? 'active': ''}`}
                            onClick={() => {
                                setActiveTab(tab.key);
                                const today = new Date().toISOString().slice(0,10);
                                fetchStudyData(tab.key, today);
                            }}
                        >
                            <span className='owner-tab-icon'>
                                {isActive 
                                    ? <img src = {StudyTimeCheckIcon} alt ='체크' />
                                    : (
                                        <span className='owner-tab-dot' />
                                    )}
                            </span>
                            <span className='owner-tab-text'>{tab.label}</span>
                        </span>
                    );
                })}
            </div>
            
            <div className='owner-study-time-box'>
                {studyData[activeTab]}
            </div>
            
            <button className='owner-manual-add-btn'>
                수동으로 추가하기 <span className='owner-plus-circle'>+</span>
            </button>
            </div>
        </div>
        </div>
      
    </div>
  );
};

export default MyPageOwner;
