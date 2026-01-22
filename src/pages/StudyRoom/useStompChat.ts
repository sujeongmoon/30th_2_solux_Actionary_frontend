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
  const chatSendPath = useMemo(() => (studyId ? `/app/studies/${studyId}/chat` : null), [studyId]);

  useEffect(() => {
    if (!studyId || !topic) return;
    if (wsBaseUrl === undefined || wsBaseUrl === null) { 
        setError("WS_BASE_URL 설정 필요"); 
        return; 
    }

    const rawToken = localStorage.getItem("accessToken") || "";
    const bearerToken = rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
      connectHeaders: { Authorization: bearerToken, token: bearerToken },
      reconnectDelay: 5000,
      debug: (str) => console.log(`STOMP: ${str}`),
      
      onConnect: () => {
        console.log("STOMP Connected!");
        setConnected(true);
        setError(null);
        subRef.current?.unsubscribe();
        subRef.current = client.subscribe(topic, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            if (!payload?.type) return;
            setEvents((prev) => [...prev, payload as ChatEvent]);
          } catch (e) {
            console.error("Payload Error:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame.headers["message"]);
        setError(frame.headers["message"]);
      },
      onWebSocketClose: () => {
        console.log("STOMP Disconnected");
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

  // 일반 채팅 전송
  const sendChat = (senderId: number, chat: string) => {
    if (!chatSendPath || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: chatSendPath,
      headers: { Authorization: localStorage.getItem("accessToken") || "" },
      body: JSON.stringify({ senderId, chat }),
    });
  };

  const sendNowState = (payload: { studyParticipantId: number; nowState: string }) => {
    if (!studyId || !clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: `/app/studies/${studyId}/state`, 
      body: JSON.stringify({ type: "NOW_STATE_CHANGED", data: payload }),
    });
  };

  const sendSignaling = (payload: any) => {
    if (!chatSendPath || !clientRef.current?.connected) {
        console.warn("소켓 미연결: 신호 전송 실패");
        return;
    }
    
    const signalString = `SIGNAL:${JSON.stringify(payload)}`;
    
    clientRef.current.publish({
        destination: chatSendPath, 
        headers: { Authorization: localStorage.getItem("accessToken") || "" },
        body: JSON.stringify({
            senderId: payload.senderId, 
            chat: signalString 
        }), 
    });
  };

  return { connected, events, error, sendChat, sendNowState, sendSignaling };
}