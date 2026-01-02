import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudyCreatePage.css";

const TITLE_MAX = 20;
const SUMMARY_MAX = 20;
const GUIDE_MAX = 200;

// 화면 라벨(한국어) ↔︎ 명세 enum(백엔드 붙일 때 그대로 쓰기 좋게)
const CATEGORY_OPTIONS = [
  { label: "수능", value: "CSAT" },
  { label: "공무원", value: "CIVIL_SERVICE" },
  { label: "임용", value: "TEACHER_EXAM" },
  { label: "자격증", value: "LICENSE" },
  { label: "어학", value: "LANGUAGE" },
  { label: "취업", value: "EMPLOYMENT" },
  { label: "기타", value: "OTHER" },
] as const;

const LIMIT_OPTIONS = Array.from({ length: 49 }, (_, i) => i + 2); // 2~50

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];
type Visibility = "public" | "private";

export default function StudyCreatePage() {
  const navigate = useNavigate();

  // 커버 업로드(지금은 로컬 프리뷰만)
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  // 폼
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryValue>("CSAT");
  const [summary, setSummary] = useState("");
  const [guide, setGuide] = useState("");
  const [memberLimit, setMemberLimit] = useState<number>(6);

  const [visibility, setVisibility] = useState<Visibility>("public");
  const [password, setPassword] = useState("");

  const titleCount = title.length;
  const summaryCount = summary.length;
  const guideCount = guide.length;

  const isPrivate = visibility === "private";

  const isValid = useMemo(() => {
    if (!title.trim() || titleCount > TITLE_MAX) return false;
    if (!summary.trim() || summaryCount > SUMMARY_MAX) return false;
    if (!guide.trim() || guideCount > GUIDE_MAX) return false;
    if (memberLimit < 2 || memberLimit > 50) return false;
    if (isPrivate) {
      // 레퍼런스처럼 "숫자 6자리"로 가정
      if (!/^\d{6}$/.test(password)) return false;
    }
    return true;
  }, [title, titleCount, summary, summaryCount, guide, guideCount, memberLimit, isPrivate, password]);

  const openFilePicker = () => fileRef.current?.click();

  const onPickCover = (file: File | null) => {
    setCoverFile(file);
    if (!file) {
      setCoverPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // 지금은 API 연결 전이니까 payload만 확인
    const payload = {
      studyName: title.trim(),
      coverImage: coverFile ? "(file)" : null,
      category,
      description: summary.trim(),
      guide: guide.trim(),
      memberLimit,
      isPublic: visibility === "public",
      password: isPrivate ? password : null,
    };

    console.log("[StudyCreate payload]", payload);
    alert("UI 단계라 아직 생성 API는 연결 전이에요! 콘솔 payload 확인해줘.");
    navigate("/studies");
  };

  return (
    <div className="sc-page">
      <form className="sc-card" onSubmit={onSubmit}>
        <h1 className="sc-title">스터디 만들기</h1>

        {/* 커버 */}
        <div className="sc-field">
          <div className="sc-label">커버 이미지</div>

          <div className="sc-coverWrap">
            <button type="button" className="sc-cover" onClick={openFilePicker} aria-label="커버 이미지 추가">
              {coverPreview ? <img className="sc-coverImg" src={coverPreview} alt="cover preview" /> : null}
              <span className="sc-plus" aria-hidden>
                +
              </span>
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sc-file"
              onChange={(e) => onPickCover(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {/* 제목 */}
        <div className="sc-field">
          <div className="sc-labelRow">
            <div className="sc-label">제목</div>
            <div className="sc-count">{titleCount}/{TITLE_MAX}</div>
          </div>
          <input
            className="sc-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            placeholder=""
          />
        </div>

        {/* 카테고리 */}
        <div className="sc-field">
          <div className="sc-label">카테고리</div>
          <div className="sc-selectWrap">
            <select className="sc-select" value={category} onChange={(e) => setCategory(e.target.value as CategoryValue)}>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 간단 소개글 */}
        <div className="sc-field">
          <div className="sc-labelRow">
            <div className="sc-label">간단 소개글</div>
            <div className="sc-count">{summaryCount}/{SUMMARY_MAX}</div>
          </div>
          <input
            className="sc-input"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={SUMMARY_MAX}
            placeholder=""
          />
        </div>

        {/* 스터디 안내 */}
        <div className="sc-field">
          <div className="sc-labelRow">
            <div className="sc-label">스터디 안내</div>
            <div className="sc-count">{guideCount}/{GUIDE_MAX}</div>
          </div>
          <textarea
            className="sc-textarea"
            value={guide}
            onChange={(e) => setGuide(e.target.value)}
            maxLength={GUIDE_MAX}
            placeholder="설명설명설명"
            rows={4}
          />
        </div>

        {/* 인원 제한 */}
        <div className="sc-field">
          <div className="sc-label">인원 제한</div>
          <div className="sc-selectWrap">
            <select className="sc-select" value={memberLimit} onChange={(e) => setMemberLimit(Number(e.target.value))}>
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 공개 여부 */}
        <div className="sc-field">
          <div className="sc-label">공개 여부</div>
          <div className="sc-radioRow">
            <label className="sc-radio">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
              />
              <span>공개</span>
            </label>

            <label className="sc-radio sc-muted">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
              />
              <span>비공개</span>
            </label>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="sc-field">
          <div className="sc-label">비밀번호</div>
          <input
            className="sc-input"
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            placeholder="숫자 6자리"
            disabled={!isPrivate}
            inputMode="numeric"
          />
        </div>

        {/* CTA */}
        <button className="sc-cta" type="submit" disabled={!isValid}>
          스터디 만들기
        </button>
      </form>
    </div>
  );
}