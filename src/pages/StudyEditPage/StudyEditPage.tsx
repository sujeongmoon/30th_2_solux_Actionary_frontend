import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudyEditPage.css";
import SuccessImg from "../../assets/Group 148.png";

type Visibility = "public" | "private";

const CATEGORIES = ["수능", "공무원", "임용", "자격증", "어학", "취업", "기타"] as const;
type CategoryLabel = (typeof CATEGORIES)[number];

type FieldErrors = Partial<Record<"title" | "category" | "summary" | "limit" | "password", string>>;

type ToastType = "success" | "error";
type ToastState = { open: boolean; type: ToastType; message: string };

function clampText(v: string, max: number) {
  return v.length > max ? v.slice(0, max) : v;
}


type StudyEditForm = {
  coverImage?: string;     
  title: string;
  category: CategoryLabel;
  summary: string;
  guide: string;
  limit: number;
  visibility: Visibility;
  password?: string;           
};

/** ====== 목업====== */
const MOCK_BY_ID: Record<number, StudyEditForm> = {
  1: {
    coverImage: "",
    title: "같이 공부해요",
    category: "기타",
    summary: "설명설명",
    guide: "가이드 텍스트 예시입니다.",
    limit: 10,
    visibility: "public",
    password: "",
  },
  6: {
    coverImage: "",
    title: "비공개 스터디입니다",
    category: "임용",
    summary: "비공개 소개",
    guide: "비번 필요",
    limit: 10,
    visibility: "private",
    password: "000000",
  },
};

export default function StudyEditPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const numericStudyId = useMemo(() => {
    const n = Number(studyId);
    return Number.isFinite(n) ? n : null;
  }, [studyId]);

  // ===== inputs =====
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(""); // 새로 고른 preview
  const [existingCover, setExistingCover] = useState<string>(""); // 기존 url

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryLabel>("수능");
  const [summary, setSummary] = useState("");
  const [guide, setGuide] = useState("");
  const [limit, setLimit] = useState<number>(2);

  const [visibility, setVisibility] = useState<Visibility>("public");
  const [password, setPassword] = useState("");

  // ===== UI states =====
  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastState>({ open: false, type: "success", message: "" });
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const titleMax = 20;
  const summaryMax = 20;
  const guideMax = 200;

  const showToast = (type: ToastType, message: string) => {
    setToast({ open: true, type, message });
    window.setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);
  };


  useEffect(() => {
    if (numericStudyId == null) {
      setLoading(false);
      showToast("error", "잘못된 스터디 ID 입니다.");
      return;
    }

    // =====나중에 API로 교체 =====
    // const data = await getStudyDetail(numericStudyId)
    const data = MOCK_BY_ID[numericStudyId];

    if (!data) {
      setLoading(false);
      showToast("error", "스터디 정보를 찾을 수 없어요.");
      return;
    }

    setExistingCover(data.coverImage ?? "");
    setTitle(data.title ?? "");
    setCategory(data.category ?? "수능");
    setSummary(data.summary ?? "");
    setGuide(data.guide ?? "");
    setLimit(data.limit ?? 2);
    setVisibility(data.visibility ?? "public");
    setPassword(data.password ?? "");

    setLoading(false);
  }, [numericStudyId]);

  useEffect(() => {
    if (visibility === "public") {
      setPassword("");
      setErrors((prev) => {
        const { password: _pw, ...rest } = prev;
        return rest;
      });
    }
  }, [visibility]);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!category) return false;
    if (!summary.trim()) return false;
    if (!Number.isFinite(limit) || limit < 1) return false;
    if (visibility === "private" && !/^\d{6}$/.test(password)) return false;
    return true;
  }, [title, category, summary, limit, visibility, password]);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = "제목은 필수예요.";
    if (!category) next.category = "카테고리를 선택해주세요.";
    if (!summary.trim()) next.summary = "간단 소개글은 필수예요.";
    if (!Number.isFinite(limit) || limit < 1) next.limit = "인원 제한을 설정해주세요.";
    if (visibility === "private" && !/^\d{6}$/.test(password)) next.password = "비밀번호(숫자 6자리)가 필요해요.";
    return next;
  };

  const onPickCover = () => fileRef.current?.click();

  const onChangeCover = (f: File | null) => {
    setCoverFile(f);

    if (!f) {
      setCoverPreview("");
      return;
    }

    const url = URL.createObjectURL(f);
    setCoverPreview(url);
  };

  const onSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast("error", "필수 항목들을 입력해주세요");
      return;
    }

    if (numericStudyId == null) {
      showToast("error", "잘못된 스터디 ID 입니다.");
      return;
    }

    // ===== payload 예시 =====
    // const payload = {
    //   title, categoryLabel: category, description: guide,
    //   summary, memberLimit: limit,
    //   isPublic: visibility === "public",
    //   password: visibility === "private" ? password : null,
    // };
    // await updateStudy(numericStudyId, payload, coverFile)

    showToast("success", "성공적으로 스터디가 수정되었습니다.");
    setSuccessModalOpen(true);
  };

  const currentCoverSrc = coverPreview || existingCover; // 새 이미지 우선

  if (loading) {
    return (
      <div className="scWrap">
        {toast.open && (
          <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`} role="status" aria-live="polite">
            {toast.message}
          </div>
        )}
        <div className="scTitle">스터디 수정</div>
        <div style={{ opacity: 0.7, fontWeight: 800 }}>불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="scWrap">
      {/* Toast */}
      {toast.open && (
        <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <div className="successOverlay" role="dialog" aria-modal="true">
          <div className="successModal">
            <div className="successBrand">ACTIONARY</div>
            <img className="successLogo" src={SuccessImg} alt="" aria-hidden="true" />

            <div className="successTitle">성공적으로 스터디가 수정되었습니다</div>
            <div className="successSub">변경 사항이 반영되었어요</div>

            <button
              type="button"
              className="successBtn"
              onClick={() => {
                setSuccessModalOpen(false);
                navigate("/studies");
              }}
            >
              메인으로
            </button>
          </div>

          <button className="successBackdropBtn" type="button" onClick={() => setSuccessModalOpen(false)} aria-label="close" />
        </div>
      )}

      {/* Page */}
      <div className="scTitle">스터디 수정</div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hiddenFile"
        onChange={(e) => onChangeCover(e.target.files?.[0] ?? null)}
      />

      {/* 커버 */}
      <div className="field">
        <div className="label">커버 이미지</div>
        <div className="coverRow">
          <button type="button" className="coverCircle" onClick={onPickCover} aria-label="cover">
            {currentCoverSrc ? <img src={currentCoverSrc} alt="" /> : <span className="coverPlus">+</span>}
          </button>
        </div>
      </div>

      {/* 제목(필수) */}
      <div className={`field ${errors.title ? "hasError" : ""}`}>
        <div className="label">제목</div>
        <div className="inputRow">
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(clampText(e.target.value, titleMax))}
            placeholder="제목"
          />
          <div className="counter">{title.length}/{titleMax}</div>
        </div>
        {errors.title && <div className="errorText">{errors.title}</div>}
      </div>

      {/* 카테고리(필수) */}
      <div className={`field ${errors.category ? "hasError" : ""}`}>
        <div className="label">카테고리</div>
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value as CategoryLabel)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.category && <div className="errorText">{errors.category}</div>}
      </div>

      {/* 간단 소개글(필수) */}
      <div className={`field ${errors.summary ? "hasError" : ""}`}>
        <div className="label">간단 소개글</div>
        <div className="inputRow">
          <input
            className="input"
            value={summary}
            onChange={(e) => setSummary(clampText(e.target.value, summaryMax))}
            placeholder="소개글"
          />
          <div className="counter">
            {summary.length}/{summaryMax}
          </div>
        </div>
        {errors.summary && <div className="errorText">{errors.summary}</div>}
      </div>

      <div className="field">
        <div className="label">스터디 안내</div>
        <textarea
          className="textarea"
          value={guide}
          onChange={(e) => setGuide(clampText(e.target.value, guideMax))}
          placeholder="설명설명설명설명"
        />
        <div className="counter bottom">
          {guide.length}/{guideMax}
        </div>
      </div>

      <div className={`field ${errors.limit ? "hasError" : ""}`}>
        <div className="label">인원 제한</div>
        <select className="select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          {[2, 3, 5, 10, 15, 20, 30].map((n) => (
            <option key={n} value={n}>
              {n}명
            </option>
          ))}
        </select>
        {errors.limit && <div className="errorText">{errors.limit}</div>}
      </div>


      <div className="field">
        <div className="label">공개 여부</div>
        <div className="radioRow">
          <label className="radio">
            <input type="radio" checked={visibility === "public"} onChange={() => setVisibility("public")} />
            공개
          </label>
          <label className="radio">
            <input type="radio" checked={visibility === "private"} onChange={() => setVisibility("private")} />
            비공개
          </label>
        </div>
      </div>


      {visibility === "private" && (
        <div className={`field ${errors.password ? "hasError" : ""}`}>
          <div className="label">비밀번호</div>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            placeholder="숫자 6자리"
            inputMode="numeric"
            maxLength={6}
          />
          {errors.password && <div className="errorText">{errors.password}</div>}
        </div>
      )}

      <button className="submitBtn" type="button" onClick={onSubmit} disabled={!canSubmit}>
        스터디 수정하기
      </button>
    </div>
  );
}