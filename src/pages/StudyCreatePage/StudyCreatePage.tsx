import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudyCreatePage.css";

const CATEGORIES = ["수능", "공무원", "임용", "자격증", "어학", "취업", "기타"] as const;
type Visibility = "public" | "private";

function clampText(v: string, max: number) {
  return v.length > max ? v.slice(0, max) : v;
}

export default function StudyCreatePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("수능");
  const [summary, setSummary] = useState("");
  const [guide, setGuide] = useState("");
  const [limit, setLimit] = useState(2);

  const [visibility, setVisibility] = useState<Visibility>("public");
  const [password, setPassword] = useState("");
  const [showDone, setShowDone] = useState(false);

  const titleMax = 20;
  const summaryMax = 30;
  const guideMax = 200;

  const canSubmit = useMemo(() => {
    if (!title || !summary || !guide) return false;
    if (visibility === "private" && !/^\d{6}$/.test(password)) return false;
    return true;
  }, [title, summary, guide, visibility, password]);

  return (
    <div className="createPage">
      <h1>스터디 만들기</h1>

      <input
        placeholder="제목"
        value={title}
        onChange={(e) => setTitle(clampText(e.target.value, titleMax))}
      />

      <button disabled={!canSubmit} onClick={() => setShowDone(true)}>
        스터디 만들기
      </button>

      {showDone && (
        <div onClick={() => navigate("/studies")}>
          생성 완료! 목록으로 이동
        </div>
      )}
    </div>
  );
}
