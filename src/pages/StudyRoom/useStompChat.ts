import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import type { ChatEvent } from "./chatEventTypes";

type UseStompChatParams = {
  studyId: number | null;
  wsBaseUrl?: string;
};

export function useStompChat({ studyId, wsBaseUrl }: UseStompChatParams) {
  const clientRef = useRef<Client | null>(null);
  const subRef = useRef<any>(null);

  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<ChatEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const topic = useMemo(() => (studyId ? `/topic/studies/${studyId}` : null), [studyId]);
  
  const sendPath = useMemo(() => (studyId ? `/app/studies/${studyId}/chat` : null), [studyId]);

  useEffect(() => {
    if (!studyId || !topic) return;

    if (!wsBaseUrl) {
      setError("WS_BASE_URL이 설정되지 않았어요 (.env 확인 필요)");
      return;
    }

    // 🔥 [추가] 로컬 스토리지에서 토큰 꺼내기
    const rawToken = localStorage.getItem("accessToken") || "";
    const bearerToken = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
      
      // 🔥 [핵심 수정] 연결할 때 '신분증(토큰)'을 같이 제출해야 합니다!
      connectHeaders: {
        Authorization: bearerToken,
        token: bearerToken, 
      },

      reconnectDelay: 2000,
      debug: (str) => {
        console.log('STOMP Debug:', str); // 디버깅용 로그
      },

      onConnect: () => {
        console.log("STOMP Connected!");
        setConnected(true);
        setError(null);

        subRef.current?.unsubscribe();
        subRef.current = client.subscribe(topic, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            console.log("📩 Msg Received:", payload); // 수신 로그 확인
            if (!payload?.type) return;
            setEvents((prev) => [...prev, payload as ChatEvent]);
          } catch (e) {
            console.error("Invalid STOMP payload", e);
          }
        });
      },

      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame.headers["message"]);
        setError(frame.headers["message"] ?? "STOMP error");
      },

      onWebSocketClose: () => {
        console.log("🔌 STOMP Disconnected");
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      subRef.current?.unsubscribe();
      subRef.current = null;
      clientRef.current?.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [studyId, wsBaseUrl, topic]);


  const sendChat = (senderId: number, chat: string) => {
    if (!sendPath || !clientRef.current?.connected) {
        console.warn("⚠️ 소켓이 연결되지 않아 채팅을 보낼 수 없습니다.");
        return;
    }

    console.log(`📤 Sending Chat: ${chat}`);

    clientRef.current.publish({
      destination: sendPath,
      // 혹시 모르니 전송 시에도 헤더 추가
      headers: {
        Authorization: localStorage.getItem("accessToken") || "",
      },
      body: JSON.stringify({
        senderId: senderId, 
        chat: chat          
      }),
    });
  };


  const sendNowState = (payload: { studyParticipantId: number; nowState: string }) => {
    if (!studyId || !clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: `/app/studies/${studyId}/state`, 
      body: JSON.stringify({
        type: "NOW_STATE_CHANGED",
        data: payload, 
      }),
    });
  };

  return { connected, events, error, sendChat, sendNowState };
}