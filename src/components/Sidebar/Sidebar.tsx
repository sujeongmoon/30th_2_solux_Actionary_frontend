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


type TodoStatus = 'DONE' | 'FAILED' | 'PENDING';

interface SideTodoItem {
  id: number;
  category: string;
  task: string;
  selected: boolean;
  status: TodoStatus;
}


const RightSidebar = () => {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [totalPoint, setTotalPoint] = useState(0);
  const [todayStudyTime, setTodayStudyTime] = useState("0H 0M");
  const [todoList, setTodoList] = useState<SideTodoItem[]>([]);
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = Boolean(accessToken);
  // 유저 정보 호출
  useEffect(() => {
    const fetchUserData = async() => {
      try {
        // 오늘 날짜
        const today = new Date().toISOString().split('T')[0];

        // 유저 정보
        const userInfo = await getMyInfo();
        setNickname(userInfo.nickname);

        // 포인트
        const points = await getUserPoints();
        setTotalPoint(points.totalPoint);

        // 오늘 공부량
        const studyTime = await getStudyTimeByDate(today);
        
        // 초를 시/분으로 변환
        const hours = Math.floor(studyTime.durationSeconds / 3600);
        const minutes = Math.floor((studyTime.durationSeconds % 3600) / 60);
        setTodayStudyTime(`${hours}H ${minutes}M`);
    

        // 오늘 투두 리스트
        const todos = await getTodoListByDate(today);
        setTodoList(todos.map((t: { id: number; category: string; task: string; status: 'DONE' | 'FAILED' | 'PENDING' }) => ({
          id: t.id,
          category: t.category,
          task: t.task,
          status: t.status,
          selected: t.status !== 'PENDING'
        })));
      } catch (err) {
        console.error('유저 데이터 불러오기 실패', err);
      }
    };
    fetchUserData();
  }, []);

  if (!isLoggedIn) return null; // 로그인 안되면 아예 렌더링 X

  // 알림 API 호출
  const fetchNotifications = async() => {
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
    } catch(err) {
      console.error('알림 불러오기 실패: ', err);
    }
  };

  const openNotificationModal = () => {
    fetchNotifications();
    setIsNotificationOpen(true);
  }

  // TODO 선택 토글
  const handleToggle = async (todoId: number, newStatus: 'DONE' | 'FAILED') => {
    const prevList = [...todoList];

    setTodoList(prev => 
      prev.map(t => 
        t.id === todoId
        ? {...t, status: newStatus, selected: true}
        : t));

    try {
      await updateTodoStatus(todoId, newStatus);
    } catch (err) {
      console.error('투두 상태 업데이트 실패', err);
      setTodoList(prevList);
    }
  }

  // 카테고리별 그룹화
  const groupedTodos = todoList.reduce<Record<string, SideTodoItem[]>>((acc, todo) => {
    if (!acc[todo.category]) {
      acc[todo.category] = [];
    }
    acc[todo.category].push(todo);
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
              <FiUser size={25} />
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
            {Object.entries(groupedTodos).map(([category, todos]) => (
              <div key={category}>
                <div className="category-badge"><span>{category}</span></div>
                {todos.map(todo => (
                  <div className="todo-item" key={todo.id}>
                    <img src = {gradientCheck} alt = '할일용 체크' className="sidebar-check-small" />
                    <span className="task-name">{todo.task}</span>
                    <div className="btn-group">
                      <button
                        className={`status-btn success ${todo.status === 'DONE' ? 'active' : ''}`}
                        onClick={() => handleToggle(todo.id, 'DONE')}
                      >
                        달성
                      </button>
                      <button
                        className={`status-btn fail ${todo.status === 'FAILED' ? 'active' : ''}`}
                        onClick={() => handleToggle(todo.id, 'FAILED')}
                      >
                        실패
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>
      {isNotificationOpen && (
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications} 
      />
)}

    </>
  );
};

export default RightSidebar;
