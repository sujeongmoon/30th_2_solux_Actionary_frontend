import { useState, useEffect } from "react";
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
import { getMyInfo, getUserPoints, getStudyTimeByDate, getTodoListByDate } from '../../api/sidebar';
import { getTodoCategories } from '../../api/Todos/todoCategoriesApi';

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
  const [nickname, setNickname] = useState("");
  const [totalPoint, setTotalPoint] = useState(0);
  const [todayStudyTime, setTodayStudyTime] = useState("0H 0M");
  const [todoList, setTodoList] = useState<SideTodoItem[]>([]);
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = Boolean(accessToken);

  // 1️⃣ 유저 정보, 오늘 투두, 포인트, 공부시간
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // 유저 정보
        const userInfo = await getMyInfo();
        setNickname(userInfo.nickname);
        setProfileImageUrl(userInfo.profileImageUrl || null);

        // 포인트
        const points = await getUserPoints();
        setTotalPoint(points.totalPoint);

        // 오늘 공부량
        const studyTime = await getStudyTimeByDate(today);
        const hours = Math.floor(studyTime.durationSeconds / 3600);
        const minutes = Math.floor((studyTime.durationSeconds % 3600) / 60);
        setTodayStudyTime(`${hours}H ${minutes}M`);

        // 오늘 투두
        const todos = await getTodoListByDate(today);
        setTodoList(
          todos.todos.map((t: { todoId: number; title: string; categoryId: number; status: TodoStatus }) => ({
            todoId: t.todoId,
            categoryId: t.categoryId.toString(),
            task: t.title,
            status: t.status,
            selected: t.status !== 'PENDING',
          }))
        );

        // 카테고리 목록 조회
        const catRes = await getTodoCategories();
        setCategories(catRes.data.map((c: { categoryId: number; name: string }) => ({
          categoryId: c.categoryId,
          name: c.name
        })));
      } catch (err) {
        console.error('유저 데이터 불러오기 실패', err);
      }
    };
    fetchUserData();
  }, []);

  if (!isLoggedIn) return null; // 로그인 안되면 렌더링 X

  // 2️⃣ 알림
  const fetchNotifications = async () => {
    try {
      const data: NotificationResponse[] = await getNotifications(20);
      const mapped: NotificationItem[] = data.map(n => ({
        notificationId: n.notificationId,
        type: n.type,
        title: n.title,
        content: n.content,
        createdAt: n.createdAt,
        link: n.link,
        isRead: n.isRead
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error('알림 불러오기 실패: ', err);
    }
  };

  const openNotificationModal = () => {
    fetchNotifications();
    setIsNotificationOpen(true);
  };

  // 3️⃣ 투두 상태 변경
  const handleToggle = async (todoId: number, newStatus: 'DONE' | 'FAILED') => {
    const prevList = [...todoList];
    setTodoList(prev =>
      prev.map(t => t.todoId === todoId ? { ...t, status: newStatus, selected: true } : t)
    );
    try {
      await updateTodoStatus(todoId, newStatus);
    } catch (err) {
      console.error('투두 상태 업데이트 실패', err);
      setTodoList(prevList);
    }
  };

  // 4️⃣ 카테고리별 그룹핑
  const groupedTodos = todoList.reduce<Record<string, SideTodoItem[]>>((acc, todo) => {
    if (!acc[todo.categoryId]) acc[todo.categoryId] = [];
    acc[todo.categoryId].push(todo);
    return acc;
  }, {});

  return (
    <>
      <div className="hover-zone" onMouseEnter={() => setOpen(true)} />

      <aside className={`sidebar ${open ? "open" : ""}`} onMouseLeave={() => setOpen(false)}>
        {/* 상단 */}
        <div className="sidebar-header">
          <div className="greeting">
            <h2 className="sidebar-title">
              <span className="sidebar-nickname">“{nickname}”</span>님
              <img src={gradientArrow} alt='화살표' className="sidebar-arrow" /><br />
              오늘도 달려봐요 !
            </h2>
            <img src={underline} alt="그라데이션밑줄" className="header-underline" />
          </div>
          <div className="header-icons">
            <img
              src={Bell}
              alt='알람 아이콘'
              className="sidebar-bell"
              onClick={openNotificationModal} />
            <div className="side-profile-circle">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="프로필 이미지"
                  className="profile-image"
                />
              ) : (
                <FiUser size={25} />
              )}
            </div>
          </div>
        </div>

        {/* 포인트 */}
        <div className="section-title">누적 포인트</div>
        <div className="points-card">
          <span className="points-text">{totalPoint}P</span>
        </div>

        {/* 오늘 공부량 */}
        <div className="section-header-row">
          <span className="section-title">오늘 공부량</span>
          <button className="view-more"
            onClick={() => navigate('/studyTime')}>더보기</button>
        </div>
        <div className="study-volume-card">
          <img src={Clock} alt='시간' className="sidebar-clock" />
          <span className="time-text">{todayStudyTime}</span>
        </div>

        {/* TO DO LIST */}
        <div className="section-title todo-title">
          TO DO LIST
          <img src={gradientCheck} alt='그라데이션 체크' className="sidebar-check" />
        </div>

        <div className="todo-list-scroll">
          <div className="todo-group-card">
            {Object.entries(groupedTodos).map(([categoryId, todos]) => {
              const category = categories.find(c => c.categoryId.toString() === categoryId);
              return (
                <div key={categoryId}>
                  {category && <div className="category-badge"><span>{category.name}</span></div>}
                  {todos.map(todo => (
                    <div className="todo-item" key={todo.todoId}>
                      <img src={gradientCheck} alt='할일용 체크' className="sidebar-check-small" />
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
          onUpdateNotification={(updated: NotificationItem) =>
            setNotifications((prev) =>
              prev.map((noti) =>
                noti.notificationId === updated.notificationId ? updated : noti
              )
            )
          }
        />
      )}
    </>
  );
};

export default RightSidebar;
