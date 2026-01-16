import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
console.log("useWebRTCRoom.ts LOADED");

type PeerId = string;
type RemoteStreamMap = Record<PeerId, MediaStream>;

type UseWebRTCRoomOpts = {
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
      for (const t of event.streams[0].getTracks()) incoming.addTrack(t);
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
  };

  // 1) 내 카메라/마이크 얻기
useEffect(() => {
  let mounted = true;
  if (
    typeof window === "undefined" ||
    !navigator ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
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
    }
  })();

  return () => {
    mounted = false;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  };
}, []);


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

  // 2) Socket으로 방 입장 + offer/answer/ice 교환
  useEffect(() => {
    if (!localStream) return;

    const socket = io(signalingUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setMyPeerId(socket.id ?? "");
      socket.emit("join-room", { roomId, displayName });
    });

    socket.on("all-users", async ({ users }: { users: PeerId[] }) => {
      for (const peerId of users) {
        const pc = ensurePC(peerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: peerId, sdp: offer });
      }
    });

    socket.on("user-joined", async ({ userId }: { userId: PeerId }) => {
      const pc = ensurePC(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: userId, sdp: offer });
    });

    socket.on("offer", async ({ from, sdp }: any) => {
      const pc = ensurePC(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, sdp: answer });
    });

    socket.on("answer", async ({ from, sdp }: any) => {
      const pc = peersRef.current.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async ({ from, candidate }: any) => {
      const pc = peersRef.current.get(from);
      if (!pc) return;
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("user-left", ({ userId }: { userId: PeerId }) => {
      closePeer(userId);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      setRemoteStreams({});
    };
  }, [localStream, roomId, signalingUrl]);

  return {
    myPeerId,
    localStream,
    remoteStreams,
    remoteIds,
    camOn,
    micOn,
    setCamOn,
    setMicOn,
  };
}