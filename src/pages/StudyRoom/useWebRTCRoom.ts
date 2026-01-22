import { useEffect, useRef, useState } from "react";
import adapter from "webrtc-adapter";

if (typeof window !== "undefined") {
  (window as any).adapter = adapter;
}

import Janus from "janus-gateway";

const JANUS_URL = "http://13.209.205.33:8088/janus";
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

    Janus.init({
      debug: "all",
      callback: () => {
        const janus = new Janus({
          server: JANUS_URL,
          success: () => {
            janusInstance.current = janus;
            attachPublisher(janus);
          },
          error: (err: any) => console.error("Janus Error:", err),
        });
      },
    });

    return () => janusInstance.current?.destroy();
  }, [enabled, studyId]);

  const attachPublisher = (janus: any) => {
    janus.attach({
      plugin: PLUGIN,
      success: (handle: any) => {
        publisherHandle.current = handle;
        handle.send({
          message: { request: "join", room: studyId, ptype: "publisher", display: String(userId) }
        });
      },
      onmessage: (msg: any, jsep: any) => {
        const event = msg["videoroom"];
        if (event === "joined") {
          publisherHandle.current.createOffer({
            tracks: [
              { type: 'video', capture: true, recv: false },
              { type: 'audio', capture: true, recv: false }
            ],
            success: (jsep: any) => {
              publisherHandle.current.send({ 
                message: { request: "configure", audio: true, video: true }, 
                jsep 
              });
            },
          });
          if (msg["publishers"]) subscribeToFeeds(msg["publishers"]);
        } else if (event === "event") {
          if (msg["publishers"]) subscribeToFeeds(msg["publishers"]);
          if (msg["leaving"] || msg["unpublished"]) detachSubscriber(msg["leaving"] || msg["unpublished"]);
        }
        if (jsep) publisherHandle.current.handleRemoteJsep({ jsep });
      },
      onlocaltrack: (track: MediaStreamTrack, on: boolean) => {
        if (on) {
          console.log(`Local Track Added: ${track.kind}`);
          setLocalStream((prev) => {
            if (prev) {
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
          handle.send({ message: { request: "join", room: studyId, ptype: "subscriber", feed: feedId } });
        },
        onmessage: (msg: any, jsep: any) => {
          if (jsep) {
            const handle = subscriberHandles.current.get(feedId);
            handle.createAnswer({
              jsep,
              tracks: [{ type: 'video', capture: false, recv: true }, { type: 'audio', capture: false, recv: true }],
              success: (jsepAnswer: any) => {
                handle.send({ message: { request: "start", room: studyId }, jsep: jsepAnswer });
              },
            });
          }
        },
        onremotetrack: (track: MediaStreamTrack, mid: string, on: boolean) => {
          if (on) {
            console.log(`Remote Track Added: ${track.kind} from ${displayUserId}`);
            setRemoteStreams((prev) => {
              const existingStream = prev[displayUserId];
              if (existingStream) {
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
        setRemoteStreams((prev) => { const next = { ...prev }; delete next[targetUserId]; return next; });
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