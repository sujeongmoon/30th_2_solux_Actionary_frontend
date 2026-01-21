import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type PeerId = string;
type RemoteStreamMap = Record<PeerId, MediaStream>;
type PeerNameMap = Record<PeerId, string>;

type UseWebRTCRoomOpts = {
  enabled?: boolean;
  roomId: string;
  signalingUrl: string;
  displayName?: string;
  enableVideo?: boolean;
  enableAudio?: boolean;
  userId?: number; 
};

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

export function useWebRTCRoom(opts: UseWebRTCRoomOpts) {
  const {
    enabled = true,
    roomId,
    signalingUrl,
    displayName = "익명",
    enableVideo = true,
    enableAudio = true,
    userId, // 🔥 ID 받기
  } = opts;

  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<PeerId, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStreamMap>({});
  const [peerNames, setPeerNames] = useState<PeerNameMap>({});
  const [myPeerId, setMyPeerId] = useState<string>("");

  const [camOn, setCamOn] = useState(enableVideo);
  const [micOn, setMicOn] = useState(enableAudio);
  
  // 권한 에러 상태 (UI에 표시하기 위함)
  const [permissionError, setPermissionError] = useState<boolean>(false);

  const remoteIds = useMemo(() => Object.keys(remoteStreams), [remoteStreams]);

  // --- WebRTC 연결 로직 (PC 생성) ---
  const ensurePC = (peerId: PeerId) => {
    const existing = peersRef.current.get(peerId);
    if (existing) return existing;

    const pc = new RTCPeerConnection(RTC_CONFIG);

    const ls = localStreamRef.current;
    if (ls) {
      ls.getTracks().forEach((track) => pc.addTrack(track, ls));
    }

    const incoming = new MediaStream();
    pc.ontrack = (event) => {
      const stream0 = event.streams?.[0];
      if (stream0) {
        for (const t of stream0.getTracks()) incoming.addTrack(t);
      } else {
        incoming.addTrack(event.track);
      }
      setRemoteStreams((prev) => ({ ...prev, [peerId]: incoming }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };

    peersRef.current.set(peerId, pc);
    return pc;
  };

  const closePeer = (peerId: PeerId) => {
    const pc = peersRef.current.get(peerId);
    if (pc) pc.close();
    peersRef.current.delete(peerId);

    setRemoteStreams((prev) => {
      const copy = { ...prev };
      delete copy[peerId];
      return copy;
    });

    setPeerNames((prev) => {
      const copy = { ...prev };
      delete copy[peerId];
      return copy;
    });
  };

  // 1) getUserMedia (카메라/마이크 요청)
  useEffect(() => {
    let mounted = true;

    if (!enabled) {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      return;
    }

    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      console.warn("WebRTC not supported or insecure context");
      return;
    }

    (async () => {
      try {
        setPermissionError(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: enableVideo,
          audio: enableAudio,
        });

        stream.getVideoTracks().forEach((t) => (t.enabled = camOn));
        stream.getAudioTracks().forEach((t) => (t.enabled = micOn));

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch (e) {
        console.error("getUserMedia failed:", e);
        setPermissionError(true);
        localStreamRef.current = null;
        setLocalStream(null);
      }
    })();

    return () => {
      mounted = false;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    };
  }, [enabled]);

  useEffect(() => {
    const ls = localStreamRef.current;
    if (!ls) return;
    ls.getVideoTracks().forEach((t) => (t.enabled = camOn));
  }, [camOn]);

  useEffect(() => {
    const ls = localStreamRef.current;
    if (!ls) return;
    ls.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [micOn]);

  // 2) socket.io signaling (소켓 연결)
  useEffect(() => {
    if (!enabled) return;
    if (!userId) return;

    // 토큰 준비
    const rawToken = localStorage.getItem("accessToken") || "";
    const cleanToken = rawToken.replace("Bearer ", ""); 
    const bearerToken = `Bearer ${cleanToken}`;

    console.log(`🚀 Socket Connecting... UserID: ${userId}`);

    const socket = io(signalingUrl, {
      transports: ["websocket"], 
      withCredentials: true,

      query: {
        token: cleanToken,      
        authorization: cleanToken,
        senderId: String(userId), 
        userId: String(userId),
        displayName: displayName
      },

      auth: {
        token: bearerToken,
        authorization: bearerToken
      },

      extraHeaders: {
        Authorization: bearerToken,
      },
    });

    socketRef.current = socket;

    // --- 소켓 이벤트 핸들러 ---

    socket.on("connect", () => {
      console.log("✅ Socket Connected! ID:", socket.id);
      const myId = socket.id ?? "";
      setMyPeerId(myId);
      
      // 이름 등록 및 방 입장
      socket.emit("set-name", { displayName });
      socket.emit("register-name", { displayName });
      socket.emit("join-room", { roomId, displayName, userId });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err.message);
    });

    socket.on("peer-names", (payload: any) => {
      const maybeMap = payload?.names ?? payload;
      if (maybeMap && typeof maybeMap === "object") {
        setPeerNames((prev) => ({ ...prev, ...maybeMap }));
      }
    });

    socket.on("all-users", async (payload: any) => {
      const users: PeerId[] = Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload)
        ? payload
        : [];

      const names: PeerNameMap | null =
        payload?.names && typeof payload.names === "object" ? payload.names : null;

      if (names) setPeerNames((prev) => ({ ...prev, ...names }));

      for (const peerId of users) {
        if (!peerId) continue;
        const pc = ensurePC(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: peerId, sdp: offer });
      }
    });

    socket.on("user-joined", async (payload: any) => {
      const userId: PeerId = payload?.userId ?? payload?.id ?? payload?.peerId;
      const name: string | undefined =
        payload?.displayName ?? payload?.name ?? payload?.nickname;

      if (userId && name) {
        setPeerNames((prev) => ({ ...prev, [userId]: String(name) }));
      }

      if (!userId) return;
      const pc = ensurePC(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: userId, sdp: offer });
    });

    socket.on("offer", async (payload: any) => {
      const from: PeerId = payload?.from;
      const sdp = payload?.sdp;
      if (!from || !sdp) return;

      const pc = ensurePC(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, sdp: answer });
    });

    socket.on("answer", async (payload: any) => {
      const from: PeerId = payload?.from;
      const sdp = payload?.sdp;
      if (!from || !sdp) return;

      const pc = peersRef.current.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async (payload: any) => {
      const from: PeerId = payload?.from;
      const candidate = payload?.candidate;
      if (!from || !candidate) return;

      const pc = peersRef.current.get(from);
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("addIceCandidate failed:", e);
      }
    });

    socket.on("user-left", (payload: any) => {
      const userId: PeerId = payload?.userId ?? payload?.id ?? payload?.peerId;
      if (userId) closePeer(userId);
    });

    socket.on("disconnect", () => {
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      setRemoteStreams({});
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      setRemoteStreams({});
      setPeerNames({});
      setMyPeerId("");
    };
  }, [enabled, roomId, signalingUrl, displayName, userId]); // userId 변경 시 재연결

  return {
    myPeerId,
    localStream,
    remoteStreams,
    remoteIds,
    peerNames,
    camOn,
    micOn,
    setCamOn,
    setMicOn,
    permissionError, // 권한 에러 상태 내보내기
  };
}