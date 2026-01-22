import { useEffect, useRef, useState } from "react";
import type { ChatEvent, WebRTCSignalData } from "./chatEventTypes";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

type UseWebRTCRoomProps = {
  enabled: boolean;
  userId?: number;
  events: ChatEvent[];            // STOMP로 들어오는 메시지들
  sendSignaling: (data: any) => void; // STOMP로 메시지 보내는 함수
};

export function useWebRTCRoom({ enabled, userId, events, sendSignaling }: UseWebRTCRoomProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<number, MediaStream>>({});
  
  const peersRef = useRef<Map<number, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // 캠/마이크 상태
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // 1. 내 미디어(캠/마이크) 가져오기
  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!mounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
      })
      .catch((err) => console.error("Media Error:", err));

    return () => {
      mounted = false;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    };
  }, [enabled]);

  // 캠/마이크 토글 처리
  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = camOn);
  }, [camOn]);

  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = micOn);
  }, [micOn]);

  // 2. 피어 연결 생성 유틸
  const createPC = (targetId: number) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
    }

    pc.ontrack = (e) => {
      setRemoteStreams(prev => ({ ...prev, [targetId]: e.streams[0] }));
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && userId) {
        sendSignaling({
          type: "ICE",
          senderId: userId,
          targetId: targetId,
          candidate: e.candidate
        } as WebRTCSignalData);
      }
    };

    peersRef.current.set(targetId, pc);
    return pc;
  };

  // 3. STOMP 이벤트 수신하여 WebRTC 신호 처리
  useEffect(() => {
    if (!enabled || !userId || events.length === 0) return;
    
    // 마지막 이벤트만 처리 (이전 이벤트 중복 처리 방지 로직 필요시 추가)
    const lastEvent = events[events.length - 1];

    const handleEvent = async () => {
      // (A) 누군가 입장함 -> 내가 먼저 Offer를 보냄
      if (lastEvent.type === "PARTICIPANT_JOINED") {
        const targetId = lastEvent.data.userId;
        if (targetId === userId) return; // 나 자신이면 패스

        // 이미 연결된 피어라면 패스
        if (peersRef.current.has(targetId)) return;

        console.log(`👋 New user ${targetId} joined. Sending Offer.`);
        const pc = createPC(targetId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        sendSignaling({ type: "OFFER", senderId: userId, targetId, sdp: offer });
      }

      // (B) 화상 신호 수신 (Offer/Answer/Ice)
      if (lastEvent.type === "WEBRTC_SIGNAL") {
        const { senderId, targetId, type, sdp, candidate } = lastEvent.data;
        
        if (targetId && targetId !== userId) return; // 나한테 온 거 아니면 무시
        if (senderId === userId) return; // 내가 보낸 거면 무시

        let pc = peersRef.current.get(senderId);

        if (type === "OFFER") {
          if (!pc) pc = createPC(senderId);
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignaling({ type: "ANSWER", senderId: userId, targetId: senderId, sdp: answer });
        } 
        else if (type === "ANSWER" && pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        } 
        else if (type === "ICE" && pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
      
      // (C) 퇴장 -> 연결 종료
      if (lastEvent.type === "PARTICIPANT_LEFT") {
      }
    };

    handleEvent();
  }, [events, userId, enabled]);

  return { 
    localStream, 
    remoteStreams, 
    camOn, 
    micOn, 
    setCamOn, 
    setMicOn 
  };
}