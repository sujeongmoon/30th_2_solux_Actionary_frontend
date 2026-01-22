// useStompChat.ts
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

  // 구독 주소 ( /topic/studies/{studyId})
  const topic = useMemo(() => (studyId ? `/topic/studies/${studyId}` : null), [studyId]);
  
  // 채팅 전송 주소 (/app/studies/{studyId}/chat)
  const chatSendPath = useMemo(() => (studyId ? `/app/studies/${studyId}/chat` : null), [studyId]);

  useEffect(() => {
    if (!studyId || !topic) return;

    if (!wsBaseUrl) {
      setError("WS_BASE_URL 설정 필요");
      return;
    }

    const rawToken = localStorage.getItem("accessToken") || "";
    const bearerToken = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;

    const socketFactory = () => new SockJS(`${wsBaseUrl}/ws`);

    const client = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: bearerToken,
        token: bearerToken, 
      },
      reconnectDelay: 5000,
      debug: (str) => console.log(`STOMP: ${str}`), 
      onConnect: () => {
        console.log("STOMP Connected!");
        setConnected(true);
        setError(null);

        // 구독 설정
        subRef.current?.unsubscribe();
        subRef.current = client.subscribe(topic, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            if (!payload?.type) return;
            setEvents((prev) => [...prev, payload as ChatEvent]);
          } catch (e) {
            console.error("Payload 파싱 에러:", e);
          }
        });
      },

      onStompError: (frame) => {
        console.error("STOMP Error:", frame.headers["message"]);
        setError(frame.headers["message"]);
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
      clientRef.current?.deactivate();
      setConnected(false);
    };
  }, [studyId, wsBaseUrl, topic]);

  // 채팅 전송
  const sendChat = (senderId: number, chat: string) => {
    if (!chatSendPath || !clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: chatSendPath,
      headers: { Authorization: localStorage.getItem("accessToken") || "" },
      body: JSON.stringify({ senderId, chat }),
    });
  };

  // 상태(말풍선) 변경 전송
  const sendNowState = (payload: { studyParticipantId: number; nowState: string }) => {
    if (!studyId || !clientRef.current?.connected) return;
    
    // 상태 변경용 주소
    const statePath = `/app/studies/${studyId}/state`; 
    
    clientRef.current.publish({
      destination: statePath,
      headers: { Authorization: localStorage.getItem("accessToken") || "" },
      body: JSON.stringify(payload),
    });
  };

  // 화상 신호 전송 (WebRTC용)
  const sendSignaling = (payload: any) => {
    if (!studyId || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/studies/${studyId}/video`, 
      headers: { Authorization: localStorage.getItem("accessToken") || "" },
      body: JSON.stringify({ type: "WEBRTC_SIGNAL", data: payload }),
    });
  };

  return { 
    connected, 
    events, 
    error, 
    sendChat, 
    sendNowState, 
    sendSignaling,
    client: clientRef.current 
  };
}