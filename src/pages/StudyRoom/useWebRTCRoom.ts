import { useEffect, useRef, useState } from "react";
import type { ChatEvent, WebRTCSignalData } from "./chatEventTypes";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

type UseWebRTCRoomProps = {
  enabled: boolean;
  userId?: number;
  events: ChatEvent[];            
  sendSignaling: (data: any) => void; 
  initialParticipants?: { userId: number; studyParticipantId: number }[];
};

export function useWebRTCRoom({ enabled, userId, events, sendSignaling, initialParticipants }: UseWebRTCRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({});
  
  const peersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const idMapRef = useRef<Map<number, number>>(new Map());
  const processedSignalIds = useRef<Set<string>>(new Set());

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // 0. 초기 참여자 매핑
  useEffect(() => {
    if (initialParticipants) {
        initialParticipants.forEach(p => idMapRef.current.set(p.studyParticipantId, p.userId));
    }
  }, [initialParticipants]);

  // 1. 내 미디어 가져오기
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        console.log(" Local Stream Ready!");
        localStreamRef.current = stream;
        setLocalStream(stream);
      })
      .catch((err) => console.error("❌ Media Error:", err));

    return () => {
      mounted = false;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    };
  }, [enabled]);

  useEffect(() => { localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = camOn); }, [camOn]);
  useEffect(() => { localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = micOn); }, [micOn]);

  // 2. 피어 생성
  const createPC = (targetId: number) => {
    const existingPC = peersRef.current.get(targetId);
    if (existingPC) return existingPC;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
    }

    pc.ontrack = (e) => {
      setRemoteStreams(prev => ({ ...prev, [targetId]: e.streams[0] }));
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && userId) {
        sendSignaling({ type: "ICE", senderId: userId, targetId, candidate: e.candidate });
      }
    };

    peersRef.current.set(targetId, pc);
    return pc;
  };

  // 3. 종료 처리
  const closePeer = (targetUserId: number) => {
      const pc = peersRef.current.get(targetUserId);
      if (pc) {
          pc.close();
          peersRef.current.delete(targetUserId);
      }
      setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[targetUserId];
          return next;
      });
  };

  // 4. 이벤트 처리
  useEffect(() => {
    if (!enabled || !userId || !localStream) return;
    if (events.length === 0) return;
    
    events.forEach(async (event) => {
        const eventId = JSON.stringify(event);
        if (processedSignalIds.current.has(eventId)) return;
        processedSignalIds.current.add(eventId);

        try {
            // (A) 입장 처리 (OFFER 전송)
            if (event.type === "PARTICIPANT_JOINED") {
                const p = event.data;
                idMapRef.current.set(p.studyParticipantId, p.userId);
                if (p.userId === userId) return;

                console.log(`👋 User ${p.userId} joined. Sending Offer.`);
                const pc = createPC(p.userId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                sendSignaling({ type: "OFFER", senderId: userId, targetId: p.userId, sdp: offer });
            }

            // (B) 퇴장 처리
            if (event.type === "PARTICIPANT_LEFT") {
                 const leftUserId = idMapRef.current.get(event.data.studyParticipantId);
                 if (leftUserId) {
                     closePeer(leftUserId);
                     idMapRef.current.delete(event.data.studyParticipantId);
                 }
            }

            // (C)CHAT_MESSAGE 안에서 화상 신호 낚아채기
            if (event.type === "CHAT_MESSAGE") {
                const { senderId, chat } = event.data;
                
                // 1. "SIGNAL:" 로 시작하지 않으면 일반 채팅임 -> 무시
                if (!chat.startsWith("SIGNAL:")) return;

                // 2. 신호 데이터 파싱
                const signalData = JSON.parse(chat.substring(7)); // "SIGNAL:"(7글자) 제거
                const { targetId, type, sdp, candidate } = signalData;

                // 나에게 온 신호인지 확인
                if (targetId && Number(targetId) !== userId) return; 
                if (Number(senderId) === userId) return;

                let pc = peersRef.current.get(senderId);

                if (type === "OFFER") {
                    console.log("Received OFFER (via Chat)");
                    if (!pc) pc = createPC(senderId);
                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sendSignaling({ type: "ANSWER", senderId: userId, targetId: senderId, sdp: answer });
                } 
                else if (type === "ANSWER" && pc) {
                    console.log("Received ANSWER (via Chat)");
                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                } 
                else if (type === "ICE" && pc) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
            }

        } catch (err) {
            console.error("Signaling Error:", err);
        }
    });

  }, [events, userId, enabled, localStream]);

  return { localStream, remoteStreams, camOn, micOn, setCamOn, setMicOn };
}