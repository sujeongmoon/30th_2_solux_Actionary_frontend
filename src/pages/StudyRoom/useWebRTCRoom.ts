import { useEffect, useRef, useState } from "react";
import { reissueJanusSession } from "../../api/studies"; 

const JANUS_URL = "/janus/"; 
const PLUGIN = "janus.plugin.videoroom";

export function useWebRTCRoom({ enabled, studyId, userId }: { enabled: boolean; studyId: number; userId?: number }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({});
  
  const janusInstance = useRef<any>(null);
  const publisherHandle = useRef<any>(null);
  const subscriberHandles = useRef<Map<number, any>>(new Map());
  const feedToUserMap = useRef<Map<number, number>>(new Map());

  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    if (!enabled || !studyId) return;

    const Janus = (window as any).Janus;

    if (!Janus || typeof Janus.init !== "function") {
        console.error("Janus 라이브러리가 로드되지 않았습니다.");
        return;
    }


    const connectJanus = () => {
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
              retryCount.current = 0; 
              janusInstance.current = janus;
              attachPublisher(janus);
            },
            error: async (err: any) => {
              console.error("Janus 연결 에러:", err);
              
              if (retryCount.current < MAX_RETRIES) {
                console.log(`세션 재발급 및 재연결 시도 중... (${retryCount.current + 1}/${MAX_RETRIES})`);
                retryCount.current += 1;
                
                // 1. 백엔드에 세션 재발급 요청
                const isRecovered = await reissueJanusSession(studyId);
                
                // 2. 재발급 성공 시 Janus 다시 연결
                if (isRecovered) {
                  setTimeout(() => {
                     // 기존 인스턴스 정리 후 재시도
                    if (janusInstance.current) {
                        janusInstance.current.destroy();
                        janusInstance.current = null;
                    }
                    connectJanus(); 
                  }, 500); 
                }
              } else {
                console.error("Janus 재연결 최대 횟수 초과.");
              }
            },
            destroyed: () => console.log("Janus 연결 종료"),
          });
        },
      });
    };

    // 최초 실행
    connectJanus();

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
        
        const register = { 
            request: "join", 
            room: studyId, 
            ptype: "publisher", 
            display: String(userId) 
        };
        handle.send({ message: register });
      },
      error: (err: any) => {
          console.error("플러그인 연결 실패:", err);
          // 플러그인 에러 시에도 필요하다면 여기서 재시도 로직을 트리거할 수 있음
      },
      onmessage: (msg: any, jsep: any) => {
        const event = msg["videoroom"];

        if (msg["error_code"] === 426) {
             console.error("방이 존재하지 않습니다(426). 세션 재발급 필요 가능성 있음.");
        }

        if (event) {
            if (event === "joined") {
                console.log("방 입장 성공! ID:", msg["id"]);
                
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