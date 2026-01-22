import React, { useEffect, useState } from 'react';
import './MyPageOwner.css';
import BookmarkSection from '../../components/Bookmark/BookmarkSection';
import OwnerCheck from '../../assets/MyPage/OwnerCheck.svg';
import ProfileSection from '../../components/MyPage/ProfileSection';
import AchievementSection from '../../components/MyPage/AchievementSection';
import StudyTimeCheckIcon from '../../assets/MyPage/StudyTimeCheck.svg';
import { useNavigate } from 'react-router-dom';
import StudyTimeModal from '../../components/MyPage/StudyTimeModal';
import {
  getTodoListByDate,
  updateTodoStatus,
  getTodoCategories,
  getStudyTime,
} from '../../api/MyPage/MyPage';
import type { TabKey, TodoItem, TodoCategory } from '../../types/MyPageTypes';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const MyPageOwner: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [todoList, setTodoList] = useState<TodoItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('DAY');

  const today = new Date().toISOString().slice(0, 10);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'DAY', label: '일간' },
    { key: 'WEEK', label: '주간' },
    { key: 'MONTH', label: '월간' },
    { key: 'YEAR', label: '연간' },
  ];

  /* ===================== 공부시간 조회 (React Query) ===================== */
  const { data: studyTime } = useQuery({
    queryKey: ['studyTime', activeTab, today],
    queryFn: () => getStudyTime(activeTab, today),
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0H 0M';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}H ${minutes}M`;
  };

  /* ===================== 투두 상태 변경 ===================== */
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

  /* ===================== 투두 조회 ===================== */
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await getTodoListByDate(today);
        setTodoList(data.todos);
      } catch (error) {
        console.error('투두 조회 실패', error);
        setTodoList([]);
      }
    };
    fetchTodos();
  }, [today]);

  /* ===================== 카테고리 조회 ===================== */
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

  /* ===================== 모달 닫을 때 공부시간 갱신 ===================== */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({
      queryKey: ['studyTime'],
    });
  };

  return (
    <div>
      <div className="owner-title">마이 페이지</div>
      <div className="owner-divider" />

      <div className="owner-container">
        <ProfileSection />
        <div className="owner-profile-divider" />
        <AchievementSection />
      </div>

      <div className="owner-divider-box" />
      <BookmarkSection />
      <div className="owner-divider-box" />

      <div className="owner-todo-section">
        {/* 왼쪽: 오늘의 TO DO LIST */}
        <div className="owner-card-todo">
          <div className="owner-study-header">
            <span className="owner-todo-title">오늘의 TO DO LIST</span>
            <button
              onClick={() => navigate('/todolistpage')}
              className="owner-more-btn"
            >
              더보기
            </button>
          </div>

          <div className="owner-todo-body">
            {todoList.map((todo, index) => {
              const category = categories.find(
                cat => cat.categoryId === todo.categoryId
              );
              const prevTodo = todoList[index - 1];
              const showCategory =
                !prevTodo || prevTodo.categoryId !== todo.categoryId;

              return (
                <div className="owner-todo-item-wrapper" key={todo.todoId}>
                  {showCategory && category && (
                    <span
                      className="owner-todo-tag"
                      style={{
                        color: category.color,
                        border: `1px solid ${category.color}`,
                      }}
                    >
                      {category.name}
                    </span>
                  )}

                  <div className="owner-todo-item">
                    <img
                      src={OwnerCheck}
                      alt="체크 아이콘"
                      className="owner-todo-check"
                    />
                    <span className="owner-todo-text">{todo.title}</span>

                    <div className="owner-todo-status">
                      <button
                        className={`owner-status-btn ${
                          todo.status === 'DONE' ? 'active' : ''
                        }`}
                        onClick={() =>
                          handleStatusChange(todo.todoId, 'DONE')
                        }
                      >
                        달성
                      </button>
                      <button
                        className={`owner-status-btn ${
                          todo.status === 'FAILED' ? 'fail' : ''
                        }`}
                        onClick={() =>
                          handleStatusChange(todo.todoId, 'FAILED')
                        }
                      >
                        실패
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 오른쪽: 공부량 */}
        <div className="owner-card-study">
          <div className="owner-studytime-header">
            <div className="owner-study-title">공부량</div>
            <button
              className="owner-study-more-btn"
              onClick={() => navigate('/studyTime')}
            >
              더보기
            </button>
          </div>

          <div className="owner-study-body">
            <div className="owner-study-tabs">
              {tabs.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <span
                    key={tab.key}
                    className={`owner-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <span className="owner-tab-icon">
                      {isActive ? (
                        <img src={StudyTimeCheckIcon} alt="체크" />
                      ) : (
                        <span className="owner-tab-dot" />
                      )}
                    </span>
                    <span className="owner-tab-text">{tab.label}</span>
                  </span>
                );
              })}
            </div>

            <div className="owner-study-time-box">
              {formatDuration(studyTime?.durationSeconds)}
            </div>

            <button
              className="owner-manual-add-btn"
              onClick={() => setIsModalOpen(true)}
            >
              수동으로 추가하기 <span className="owner-plus-circle">+</span>
            </button>
          </div>

          <StudyTimeModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </div>
      </div>
    </div>
  );
};

export default MyPageOwner;
