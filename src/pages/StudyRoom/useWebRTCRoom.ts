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
  
  // [핵심] 스터디 참여 ID -> 유저 ID 변환용 맵 (퇴장 처리 위해 필수)
  const idMapRef = useRef<Map<number, number>>(new Map());

  const processedSignalIds = useRef<Set<string>>(new Set());
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // 0. 초기 참여자 ID 매핑 등록
  useEffect(() => {
    if (initialParticipants) {
        initialParticipants.forEach(p => {
            idMapRef.current.set(p.studyParticipantId, p.userId);
        });
    }
  }, [initialParticipants]);

  // 1. 내 미디어 가져오기
  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!mounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
        }
        console.log("Local Stream Ready!");
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

  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = camOn);
  }, [camOn]);

  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = micOn);
  }, [micOn]);

  // 2. 피어 생성 함수
  const createPC = (targetId: number) => {
    const existingPC = peersRef.current.get(targetId);
    if (existingPC) return existingPC;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
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

  // 3. 연결 종료 함수 (퇴장 시 호출)
  const closePeer = (targetUserId: number) => {
      console.log(`Closing connection for user ${targetUserId}`);
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
            // (A) 입장: ID 매핑 등록 + Offer 전송
            if (event.type === "PARTICIPANT_JOINED") {
                const p = event.data;
                // 매핑 저장
                idMapRef.current.set(p.studyParticipantId, p.userId);

                if (p.userId === userId) return;

                console.log(`👋 User ${p.userId} joined. Sending Offer.`);
                const pc = createPC(p.userId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                
                sendSignaling({ type: "OFFER", senderId: userId, targetId: p.userId, sdp: offer });
            }

            // (B) 화상 신호
            if (event.type === "WEBRTC_SIGNAL") {
                const { senderId, targetId, type, sdp, candidate } = event.data;
                
                if (targetId && Number(targetId) !== userId) return; 
                if (Number(senderId) === userId) return; 

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
            
            // (C) 퇴장: ID 매핑을 통해 유저 찾아서 종료
            if (event.type === "PARTICIPANT_LEFT") {
                  const { studyParticipantId } = event.data;
                  // 맵에서 userId 찾기
                  const leftUserId = idMapRef.current.get(studyParticipantId);
                  
                  if (leftUserId) {
                      closePeer(leftUserId);
                      idMapRef.current.delete(studyParticipantId); // 매핑 삭제
                  } else {
                      console.warn(`⚠️ Cannot find userId for participant ${studyParticipantId}`);
                  }
            }

        } catch (err) {
            console.error("Signaling Error:", err);
        }
    });

  }, [events, userId, enabled, localStream]);

  return { localStream, remoteStreams, camOn, micOn, setCamOn, setMicOn };
}