import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type PeerId = string;
type RemoteStreamMap = Record<PeerId, MediaStream>;
type PeerNameMap = Record<PeerId, string>;

type UseWebRTCRoomOpts = {
  enabled?: boolean; // false면 WebRTC/시그널링 완전 비활성화
  roomId: string;
  signalingUrl: string;
  displayName?: string;
  enableVideo?: boolean;
  enableAudio?: boolean;
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

  const remoteIds = useMemo(() => Object.keys(remoteStreams), [remoteStreams]);

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

  // 1) getUserMedia (enabled=false면 요청 자체 X)
  useEffect(() => {
    let mounted = true;

    if (!enabled) {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      return;
    }

    if (
      typeof window === "undefined" ||
      !navigator?.mediaDevices?.getUserMedia
    ) {
      console.warn("WebRTC not supported or insecure context");
      return;
    }

    (async () => {
      try {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, enableVideo, enableAudio]);

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

  // 2) socket.io signaling (enabled=false면 연결 X)
  useEffect(() => {
    if (!enabled) return;
    if (!localStream) return;

    const socket = io(signalingUrl, {
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    const registerMyName = (id: string) => {
      setPeerNames((prev) => ({ ...prev, [id]: displayName }));
      socket.emit("set-name", { displayName });
      socket.emit("register-name", { displayName });
    };

    socket.on("connect", () => {
      const myId = socket.id ?? "";
      setMyPeerId(myId);
      registerMyName(myId);
      socket.emit("join-room", { roomId, displayName });
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
  }, [enabled, localStream, roomId, signalingUrl, displayName]);

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
  };
}