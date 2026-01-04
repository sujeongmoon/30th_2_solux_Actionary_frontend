import { useState, useEffect } from "react";
import "./Sidebar.css";
import { FiUser } from 'react-icons/fi';
import underline from '../../assets/sidebar/underline.svg';
import gradientArrow from '../../assets/sidebar/gradientArrow.svg';
import Bell from '../../assets/sidebar/Bell.svg';
import Clock from '../../assets/sidebar/mingcute_time-line.svg';
import gradientCheck from '../../assets/sidebar/gradientCheck.svg';
import { updateTodoStatus, type TodoStatus } from '../../api/Todos/todosApi';
import { useNavigate } from "react-router-dom";
import NotificationModal from "../Notification/NotificationModal";
import { type NotificationItem } from "../Notification/NotificationModal";
import { getNotifications, type NotificationResponse } from "../../api/Notification/notificationsApi";

interface SideTodoItem {
  id: number;
  category: string;
  task: string;
  selected: boolean;
}

// MOCK DATA
const MOCK_USER = { nickname: "가인" };
const MOCK_POINTS = { totalPoint: 210 };
const MOCK_STUDY_TIME = { studyTime: "2H 45M" };
const MOCK_TODOS: SideTodoItem[] = [
  { id: 1, category: "수업", task: "수학 문제 풀기", selected: true },
  { id: 2, category: "수업", task: "영어 단어 외우기", selected: false },
  { id: 3, category: "운동", task: "스트레칭 15분", selected: true },
  { id: 4, category: "운동", task: "조깅 30분", selected: false },
];
// MOCK 알림 데이터
// MOCK 알림 데이터 (createdAt 형태)
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 131,
    content: "다현님이 작성한 글에 새로운 댓글이 있어요.",
    createdAt: "2025-10-31T12:55:00",
    link: "/board",
  },
  {
    id: 130,
    content: "스터디 참여로 10P 적립!",
    createdAt: "2025-10-31T12:40:00",
    link: "/mypage/points",
  },
  {
    id: 129,
    content: "오늘 총 3시간 20분 공부했어요 👏",
    createdAt: "2025-10-31T00:00:05",
    link: "/study/report",
  },
];


const RightSidebar = () => {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [totalPoint, setTotalPoint] = useState(0);
  const [todayStudyTime, setTodayStudyTime] = useState("0H 0M");
  const [todoList, setTodoList] = useState<SideTodoItem[]>([]);
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 알림 API 호출
  const fetchNotifications = async() => {
    try {
      const data: NotificationResponse[] = await getNotifications(20);
      const mapped: NotificationItem[] = data.map(n => ({
      id: n.notificationId,
      content: n.content,
      createdAt: n.createdAt,
      link: n.link,
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
  const handleToggle = async (todoId: number, selected: boolean) => {
    try {
      const status: TodoStatus = selected ? 'DONE' : 'FAILED';
      await updateTodoStatus(todoId, status);
      setTodoList(prev => prev.map(t => t.id === todoId ? { ...t, selected } : t));
    } catch (e) {
      console.error('투두 상태 업데이트 실패', e);
    }
  };

  useEffect(() => {
    // MOCK DATA 세팅
    setNickname(MOCK_USER.nickname);
    setTotalPoint(MOCK_POINTS.totalPoint);
    setTodayStudyTime(MOCK_STUDY_TIME.studyTime);
    setTodoList(MOCK_TODOS);
  }, []);

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
            <div className="profile-circle">
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
                        className={`status-btn success ${todo.selected ? 'active' : ''}`}
                        onClick={() => handleToggle(todo.id, true)}
                      >
                        달성
                      </button>
                      <button
                        className={`status-btn fail ${!todo.selected ? 'active' : ''}`}
                        onClick={() => handleToggle(todo.id, false)}
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
        notifications={MOCK_NOTIFICATIONS}
        //notifications={notifications} 
      />
)}

    </>
  );
};

export default RightSidebar;
