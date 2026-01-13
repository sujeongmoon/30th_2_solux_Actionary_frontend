import React, { useEffect, useState } from 'react';
import './MyPageOwner.css';
import BookmarkSection from '../../components/Bookmark/BookmarkSection';
import OwnerCheck from '../../assets/MyPage/OwnerCheck.svg';
import ProfileSection from '../../components/MyPage/ProfileSection';
import AchievementSection from '../../components/MyPage/AchievementSection';
import StudyTimeCheckIcon from '../../assets/MyPage/StudyTimeCheck.svg';
import { useNavigate } from 'react-router-dom';
import StudyTimeModal from '../../components/MyPage/StudyTimeModal';
import { getTodoListByDate, updateTodoStatus, getTodoCategories, getStudyTime } from '../../api/MyPage/MyPage';
import type { TabKey,TodoItem,TodoCategory} from '../../types/MyPageTypes';



const MyPageOwner: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [todoList, setTodoList] = useState<TodoItem[]>([]);

  const tabs : { key: TabKey; label: string} []= [
    { key: 'DAY', label: '일간'},
    { key: 'WEEK', label: '주간'},
    { key: 'MONTH', label: '월간'},
    { key: 'YEAR', label: '연간'},
  ];

  const [activeTab, setActiveTab] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('DAY');
  
  const fetchStudyData = async (tab: TabKey, date: string) => {
  try {
    const data = await getStudyTime(tab, date);
      if (!data || typeof data.durationSeconds !== 'number') {
        console.warn('공부량 데이터 없음', data);
        return;
    }

    setStudyData(prev => ({
      ...prev,
      [tab]: formatDuration(data.durationSeconds),
    }));
  } catch (error) {
    console.error('스터디 시간 조회 실패', error);
  }
};

  const [studyData, setStudyData] = useState<Record<TabKey, string>>({
    DAY: '0H 0M',
    WEEK: '0H 0M',
    MONTH: '0H 0M',
    YEAR: '0H 0M',
  });

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    fetchStudyData(activeTab, today);
  }, [activeTab]);


const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}H ${minutes}M`;
}

// 투두리스트 업데이트
const handleStatusChange = async (
  todoId: number,
  status: 'DONE' | 'FAILED'
) => {
  try {
    await updateTodoStatus(todoId, status);
    setTodoList(prev =>
      prev.map(todo =>
        todo.todoId === todoId ? { ...todo, status } : todo
      )
    );
  } catch (e) {
    console.error('상태 변경 실패', e);
  }
};

//투두리스트 조회
  useEffect(() => {
    const fetchTodos = async() => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const data = await getTodoListByDate(today);
        setTodoList(data.todos);
      } catch (error) {
        console.error('투두 조회 실패', error);
        setTodoList([]);
      }
    };
    fetchTodos();
  }, []);

  //카테고리 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getTodoCategories();
        setCategories(data);
      } catch (e) {
        console.error('카테고리 조회 실패', e);
      }
    };

    fetchCategories();
  }, []);

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
                {todoList.map((todo, index) => {
                    const category = categories.find(cat => cat.categoryId === todo.categoryId);
                    const prevTodo = todoList[index - 1];
                    const showCategory = 
                      !prevTodo || prevTodo.categoryId !== todo.categoryId;

                    return (
                          <div className='owner-todo-item-wrapper' key={todo.todoId}>
                            {showCategory && category && (
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
                                    <button className={`owner-status-btn ${todo.status === 'DONE' ? 'active' : ''}`}
                                      onClick={() => handleStatusChange(todo.todoId, 'DONE')}>달성</button>
                                    <button className={`owner-status-btn ${todo.status === 'FAILED' ? 'fail' : ''}`}
                                      onClick={() => handleStatusChange(todo.todoId, 'FAILED')}>실패</button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* 오른쪽: 공부량 카드 */}
                    <div className='owner-card-study'>
                      <div className='owner-studytime-header'>
                        <div className='owner-study-title'>공부량</div>
                        <button className='owner-study-more-btn'
                          onClick= {() => navigate('/studyTime')}>더보기</button>
                      </div>
                        
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
                                            //const today = new Date().toISOString().slice(0,10);
                                            //fetchStudyData(tab.key, today);
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
            
            <button className='owner-manual-add-btn' onClick={() => setIsModalOpen(true)}>
                수동으로 추가하기 <span className='owner-plus-circle'>+</span>
            </button>
            </div>

            <StudyTimeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      </div>
    </div>
  );
};

export default MyPageOwner;
