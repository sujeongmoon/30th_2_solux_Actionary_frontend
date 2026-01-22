import { useEffect, useRef, useState } from "react";
const JANUS_URL = "/janus/";
const PLUGIN = "janus.plugin.videoroom";

export function useWebRTCRoom({ enabled, studyId, userId }: { enabled: boolean; studyId: number; userId?: number }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({});
  
  const janusInstance = useRef<any>(null);
  const publisherHandle = useRef<any>(null);
  const subscriberHandles = useRef<Map<number, any>>(new Map());
  const feedToUserMap = useRef<Map<number, number>>(new Map());

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    if (!enabled || !studyId) return;
    const Janus = (window as any).Janus;

    if (!Janus || typeof Janus.init !== "function") {
        console.error("Janus 라이브러리가 아직 로드되지 않았습니다. (index.html 확인 필요)");
        return;
    }

    Janus.init({
      debug: "all",
      callback: () => {
        if (!Janus.isWebrtcSupported()) {
          console.error("이 브라우저는 WebRTC를 지원하지 않습니다.");
          return;
        }

        const janus = new Janus({
          server: JANUS_URL,
          success: () => {
            console.log("Janus 화상 서버 연결 성공!");
            janusInstance.current = janus;
            attachPublisher(janus);
          },
          error: (err: any) => console.error("Janus 연결 에러:", err),
          destroyed: () => console.log("Janus 연결 종료"),
        });
      },
    });

    return () => {
        if (janusInstance.current) {
            janusInstance.current.destroy();
            janusInstance.current = null;
        }
    };
  }, [enabled, studyId]);

  const attachPublisher = (janus: any) => {
    janus.attach({
      plugin: PLUGIN,
      success: (handle: any) => {
        publisherHandle.current = handle;
        // 입장 요청
        const register = { 
            request: "join", 
            room: studyId, 
            ptype: "publisher", 
            display: String(userId) 
        };
        handle.send({ message: register });
      },
      onmessage: (msg: any, jsep: any) => {
        const event = msg["videoroom"];
        if (event) {
            if (event === "joined") {
                publisherHandle.current.createOffer({
                    tracks: [
                        { type: 'video', capture: true, recv: false },
                        { type: 'audio', capture: true, recv: false }
                    ],
                    success: (jsepOffer: any) => {
                        const publish = { request: "configure", audio: true, video: true };
                        publisherHandle.current.send({ message: publish, jsep: jsepOffer });
                    },
                    error: (err: any) => console.error("WebRTC Offer 에러:", err)
                });
            } else if (event === "event") {
              if (msg["publishers"]) subscribeToFeeds(msg["publishers"]);
              if (msg["leaving"] || msg["unpublished"]) {
                  const leftId = msg["leaving"] || msg["unpublished"];
                  detachSubscriber(leftId);
              }
            }
        }
        if (jsep) {
            publisherHandle.current.handleRemoteJsep({ jsep });
        }
      },
      onlocaltrack: (track: MediaStreamTrack, on: boolean) => {
        if (on) {
          setLocalStream((prev) => {
            if (prev) {
                if (prev.getTracks().some(t => t.id === track.id)) return prev;
                prev.addTrack(track);
                return new MediaStream(prev.getTracks());
            }
            return new MediaStream([track]);
          });
        }
      },
    });
  };

  const subscribeToFeeds = (publishers: any[]) => {
    publishers.forEach((p) => {
      const feedId = p["id"];
      const displayUserId = Number(p["display"]);
      if (subscriberHandles.current.has(feedId)) return;
      
      feedToUserMap.current.set(feedId, displayUserId);

      janusInstance.current.attach({
        plugin: PLUGIN,
        success: (handle: any) => {
          subscriberHandles.current.set(feedId, handle);
          const subscribe = { 
              request: "join", 
              room: studyId, 
              ptype: "subscriber", 
              feed: feedId 
          };
          handle.send({ message: subscribe });
        },
        onmessage: (msg: any, jsep: any) => {
          if (jsep) {
            const handle = subscriberHandles.current.get(feedId);
            handle.createAnswer({
              jsep,
              tracks: [{ type: 'video', capture: false, recv: true }, { type: 'audio', capture: false, recv: true }],
              success: (jsepAnswer: any) => {
                const start = { request: "start", room: studyId };
                handle.send({ message: start, jsep: jsepAnswer });
              },
            });
          }
        },
        onremotetrack: (track: MediaStreamTrack, mid: string, on: boolean) => {
          if (on) {
            setRemoteStreams((prev) => {
              const existingStream = prev[displayUserId];
              if (existingStream) {
                if (existingStream.getTracks().some(t => t.id === track.id)) return prev;
                existingStream.addTrack(track);
                return { ...prev, [displayUserId]: new MediaStream(existingStream.getTracks()) };
              }
              return { ...prev, [displayUserId]: new MediaStream([track]) };
            });
          }
        }
      });
    });
  };

  const detachSubscriber = (feedId: number) => {
    const handle = subscriberHandles.current.get(feedId);
    if (handle) {
      const targetUserId = feedToUserMap.current.get(feedId);
      handle.detach();
      subscriberHandles.current.delete(feedId);
      if (targetUserId) {
        setRemoteStreams((prev) => { 
            const next = { ...prev }; 
            delete next[targetUserId]; 
            return next; 
        });
      }
    }
  };

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = camOn));
      localStream.getAudioTracks().forEach((t) => (t.enabled = micOn));
    }
  }, [camOn, micOn, localStream]);

  return { localStream, remoteStreams, camOn, micOn, setCamOn, setMicOn };
}