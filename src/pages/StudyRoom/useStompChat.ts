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

  const topic = useMemo(() => (studyId ? `/topic/studies/${studyId}` : null), [studyId]);
  
  const sendPath = useMemo(() => (studyId ? `/app/studies/${studyId}/chat` : null), [studyId]);

  useEffect(() => {
    if (!studyId || !topic) return;

    if (!wsBaseUrl) {
      setError("WS_BASE_URL이 설정되지 않았어요 (.env 확인 필요)");
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`),
      reconnectDelay: 2000,
      debug: () => {}, 

      onConnect: () => {
        setConnected(true);
        setError(null);

        subRef.current?.unsubscribe();
        subRef.current = client.subscribe(topic, (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            if (!payload?.type) return;
            setEvents((prev) => [...prev, payload as ChatEvent]);
          } catch (e) {
            console.error("Invalid STOMP payload", e);
          }
        });
      },

      onStompError: (frame) => {
        setError(frame.headers["message"] ?? "STOMP error");
      },

      onWebSocketClose: () => setConnected(false),
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
    if (!sendPath || !clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: sendPath,
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