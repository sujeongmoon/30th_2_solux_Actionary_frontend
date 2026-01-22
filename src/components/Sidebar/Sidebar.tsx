import { useState } from "react";
import "./Sidebar.css";
import { FiUser } from 'react-icons/fi';
import underline from '../../assets/sidebar/underline.svg';
import gradientArrow from '../../assets/sidebar/gradientArrow.svg';
import Bell from '../../assets/sidebar/Bell.svg';
import Clock from '../../assets/sidebar/mingcute_time-line.svg';
import gradientCheck from '../../assets/sidebar/gradientCheck.svg';
import { updateTodoStatus } from '../../api/Todos/todosApi';
import { useNavigate } from "react-router-dom";
import NotificationModal from "../Notification/NotificationModal";
import { type NotificationItem } from "../Notification/NotificationModal";
import { getNotifications, type NotificationResponse } from "../../api/Notification/notificationsApi";
import {
  getMyInfo,
  getUserPoints,
  getStudyTimeByDate,
  getTodoListByDate
} from '../../api/sidebar';
import { getTodoCategories } from '../../api/Todos/todoCategoriesApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type TodoStatus = 'DONE' | 'FAILED' | 'PENDING';

interface SideTodoItem {
  todoId: number;
  categoryId: number;
  task: string;
  status: TodoStatus;
  selected: boolean;
}

interface TodoCategory {
  categoryId: number;
  name: string;
}

const RightSidebar = () => {
  const [open, setOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = Boolean(accessToken);
  const today = new Date().toISOString().split('T')[0];


  /* =======================
     1️⃣ 유저 정보
  ======================= */
  const { data: userInfo } = useQuery({
    queryKey: ['myInfo'],
    queryFn: getMyInfo,
  });

  const { data: pointData } = useQuery({
    queryKey: ['userPoints'],
    queryFn: getUserPoints,
  });

  /* =======================
     2️⃣ 오늘 공부 시간
  ======================= */
  const { data: studyTime } = useQuery({
    queryKey: ['studyTime', today],
    queryFn: () => getStudyTimeByDate(today),
  });

  const todayStudyTime = studyTime
    ? `${Math.floor(studyTime.durationSeconds / 3600)}H ${Math.floor(
        (studyTime.durationSeconds % 3600) / 60
      )}M`
    : '0H 0M';

  /* =======================
     3️⃣ 오늘 투두
  ======================= */
  const { data: todoData } = useQuery({
    queryKey: ['sidebarTodos', today],
    queryFn: () => getTodoListByDate(today),
  });

  const todoList: SideTodoItem[] =
    todoData?.todos.map((t: any) => ({
      todoId: t.todoId,
      categoryId: t.categoryId.toString(),
      task: t.title,
      status: t.status,
      selected: t.status !== 'PENDING',
    })) ?? [];

  /* =======================
     4️⃣ 카테고리
  ======================= */
  const { data: categories = [] } = useQuery({
    queryKey: ['todoCategories'],
    queryFn: async () => {
      const res = await getTodoCategories();
      return res.data;
    },
  });

  /* =======================
     5️⃣ 투두 상태 변경
  ======================= */
  const toggleMutation = useMutation({
  mutationFn: ({ todoId, status }: { todoId: number; status: 'DONE' | 'FAILED' }) =>
    updateTodoStatus(todoId, status),

  onMutate: async ({ todoId, status }) => {
    await queryClient.cancelQueries({ queryKey: ['sidebarTodos', today] });

    const prev = queryClient.getQueryData<any>(['sidebarTodos', today]);

    queryClient.setQueryData(['sidebarTodos', today], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        todos: old.todos.map((t: any) =>
          t.todoId === todoId ? { ...t, status } : t
        ),
      };
    });

    return { prev };
  },

  onError: (_err, _vars, context) => {
    if (context?.prev) {
      queryClient.setQueryData(['sidebarTodos', today], context.prev);
    }
  },

  onSettled: () => {
    queryClient.invalidateQueries({
      queryKey: ['sidebarTodos', today],
    });
  },
});


  const handleToggle = (todoId: number, status: 'DONE' | 'FAILED') => {
    toggleMutation.mutate({ todoId, status });
  };

  /* =======================
     6️⃣ 알림
  ======================= */
  const fetchNotifications = async () => {
    const data: NotificationResponse[] = await getNotifications();
    setNotifications(
      data.map(n => ({
        notificationId: n.notificationId,
        type: n.type,
        title: n.title,
        content: n.content,
        createdAt: n.createdAt,
        link: n.link,
        isRead: n.isRead,
      }))
    );
  };

  const openNotificationModal = () => {
    fetchNotifications();
    setIsNotificationOpen(true);
  };

  /* =======================
     7️⃣ 투두 그룹핑
  ======================= */
  const groupedTodos = todoList.reduce<Record<string, SideTodoItem[]>>((acc, todo) => {
    if (!acc[todo.categoryId]) acc[todo.categoryId] = [];
    acc[todo.categoryId].push(todo);
    return acc;
  }, {});
    if (!isLoggedIn) return null;

  return (
    <>
      <div className="hover-zone" onMouseEnter={() => setOpen(true)} />

      <aside className={`sidebar ${open ? "open" : ""}`} onMouseLeave={() => setOpen(false)}>
        {/* 상단 */}
        <div className="sidebar-header">
          <div className="greeting">
            <h2 className="sidebar-title">
              <span className="sidebar-nickname">“{userInfo?.nickname}”</span>님
              <img src={gradientArrow} alt="화살표" className="sidebar-arrow" /><br />
              오늘도 달려봐요 !
            </h2>
            <img src={underline} alt="밑줄" className="header-underline" />
          </div>
          <div className="header-icons">
            <img src={Bell} alt="알림" className="sidebar-bell" onClick={openNotificationModal} />
            <div className="side-profile-circle">
              {userInfo?.profileImageUrl ? (
                <img src={userInfo.profileImageUrl} alt="프로필" className="profile-image" />
              ) : (
                <FiUser size={25} />
              )}
            </div>
          </div>
        </div>

        {/* 포인트 */}
        <div className="section-title">누적 포인트</div>
        <div className="points-card">
          <span className="points-text">{pointData?.totalPoint ?? 0}P</span>
        </div>

        {/* 공부 시간 */}
        <div className="section-header-row">
          <span className="section-title">오늘 공부량</span>
          <button className="view-more" onClick={() => navigate('/studyTime')}>
            더보기
          </button>
        </div>
        <div className="study-volume-card">
          <img src={Clock} alt="시간" className="sidebar-clock" />
          <span className="time-text">{todayStudyTime}</span>
        </div>

        {/* 투두 */}
        <div className="section-title todo-title">
          TO DO LIST
          <img src={gradientCheck} alt="체크" className="sidebar-check" />
        </div>

        <div className="todo-list-scroll">
          <div className="todo-group-card">
            {Object.entries(groupedTodos).map(([categoryId, todos]) => {
              const category = categories.find(
                (c: TodoCategory) => c.categoryId.toString() === categoryId
              );
              return (
                <div key={categoryId}>
                  {category && (
                    <div className="category-badge">
                      <span>{category.name}</span>
                    </div>
                  )}
                  {todos.map(todo => (
                    <div className="sidebar-todo-item" key={todo.todoId}>
                      <img src={gradientCheck} alt="체크" className="sidebar-check-small" />
                      <span className="task-name">{todo.task}</span>
                      <div className="btn-group">
                        <button
                          className={`status-btn success ${todo.status === 'DONE' ? 'active' : ''}`}
                          onClick={() => handleToggle(todo.todoId, 'DONE')}
                        >
                          달성
                        </button>
                        <button
                          className={`status-btn fail ${todo.status === 'FAILED' ? 'active' : ''}`}
                          onClick={() => handleToggle(todo.todoId, 'FAILED')}
                        >
                          실패
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {isNotificationOpen && (
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          notifications={notifications}
          onUpdateNotification={(updated) =>
            setNotifications(prev =>
              prev.map(n => (n.notificationId === updated.notificationId ? updated : n))
            )
          }
        />
      )}
    </>
  );
};

export default RightSidebar;
