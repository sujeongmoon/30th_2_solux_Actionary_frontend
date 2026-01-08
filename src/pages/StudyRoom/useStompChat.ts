import { useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";

type ChatEventType =
  | "CHAT_MESSAGE"
  | "NOW_STATE_CHANGED"
  | "PARTICIPANT_JOINED"
  | "PARTICIPANT_LEFT"
  | "NOT_STUDY_PARTICIPANT";

export type ChatEvent = {
  type: ChatEventType;
  data: any;
};

type UseStompChatParams = {
  studyId: number | null;
  wsBaseUrl: string; // 예: import.meta.env.VITE_DOMAIN_URL
};

export function useStompChat({ studyId, wsBaseUrl }: UseStompChatParams) {
  const clientRef = useRef<Client | null>(null);

  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<ChatEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const topic = useMemo(() => {
    if (!studyId) return null;
    return `/topic/studies/${studyId}`;
  }, [studyId]);

  const sendPath = useMemo(() => {
    if (!studyId) return null;
    return `/app/studies/${studyId}/chat`;
  }, [studyId]);

  useEffect(() => {
    if (!studyId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${wsBaseUrl}/ws`), // ✅ 도메인주소/ws
      reconnectDelay: 2000,
      debug: () => {},

      onConnect: () => {
        setConnected(true);
        setError(null);

        if (!topic) return;
        client.subscribe(topic, (msg: any) => {
          try {
            const payload = JSON.parse(msg.body);
            setEvents((prev) => [...prev, payload]);
          } catch {
            // ignore
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
      clientRef.current?.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [studyId, wsBaseUrl, topic]);

  const sendChat = (senderId: number, chat: string) => {
    if (!sendPath) return;
    if (!clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: sendPath,
      body: JSON.stringify({
        type: "CHAT_MESSAGE",
        data: { senderId, chat },
      }),
    });
  };

  return { connected, events, error, sendChat };
}