import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudyCreatePage.css";
import SuccessImg from "../../assets/Group 148.png"; 
import LogoImg from "../../assets/로고.png";
import { createStudy } from "../../api/studies";
import type { StudyCategory } from "../../api/types";

type Visibility = "public" | "private";

const CATEGORIES = ["수능", "공무원", "임용", "자격증", "어학", "취업", "기타"] as const;
type CategoryLabel = (typeof CATEGORIES)[number];

type FieldErrors = Partial<Record<"title" | "category" | "summary" | "limit" | "password", string>>;

type ToastType = "success" | "error";
type ToastState = { open: boolean; type: ToastType; message: string };

function clampText(v: string, max: number) {
  return v.length > max ? v.slice(0, max) : v;
}
const LABEL_TO_ENUM: Record<CategoryLabel, StudyCategory> = {
  수능: "CSAT",
  공무원: "CIVIL_SERVICE",
  임용: "TEACHER_EXAM",
  자격증: "LICENSE",
  어학: "LANGUAGE",
  취업: "EMPLOYMENT",
  기타: "OTHER",
};

export default function StudyCreatePage() {
  const navigate = useNavigate();

  // ===== inputs =====
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

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
  const [submitting, setSubmitting] = useState(false);

  const titleMax = 20;
  const summaryMax = 20;
  const guideMax = 200;

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!title.trim()) return false;
    if (!category) return false;
    if (!summary.trim()) return false;
    if (!Number.isFinite(limit) || limit < 1) return false;
    if (visibility === "private" && !/^\d{6}$/.test(password)) return false;
    return true;
  }, [title, category, summary, limit, visibility, password, submitting]);

  const showToast = (type: ToastType, message: string) => {
    setToast({ open: true, type, message });
    window.setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);
  };

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
      // 실패 토스트 + 필드 하이라이트
      showToast("error", "필수 항목들을 입력해주세요");
      return;
    }
    try {
      setSubmitting(true);
      const description = guide?.trim() ? guide.trim() : summary.trim();

      await createStudy(
        {
          studyName: title.trim(),
          description,
          category: LABEL_TO_ENUM[category],
          memberLimit: limit,
          isPublic: visibility === "public",
          password: visibility === "private" ? password : null,
        },
        coverFile
      );

      showToast("success", "성공적으로 스터디가 만들어졌습니다.");
      setSuccessModalOpen(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "스터디 생성에 실패했어요.";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="scWrap">
      {/* ===== Toast (푸시 알람) ===== */}
      {toast.open && (
        <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      {/* ===== Success Modal ===== */}
      {successModalOpen && (
        <div className="successOverlay" role="dialog" aria-modal="true">
          <div className="successModal">
          <img src={LogoImg} alt="ACTIONARY" className="successBrandImg"/>
            <img className="successLogo" src={SuccessImg} alt="" aria-hidden="true" />

            <div className="successTitle">성공적으로 스터디가 만들어졌습니다</div>
            <div className="successSub">이제 함께 달려볼까요 ?</div>

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

          {/* 바깥 클릭 닫기(원하면 제거 가능) */}
          <button className="successBackdropBtn" type="button" onClick={() => setSuccessModalOpen(false)} aria-label="close" />
        </div>
      )}

      {/* ===== Page ===== */}
      <div className="scTitle">스터디 만들기</div>

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
            {coverPreview ? <img src={coverPreview} alt="" /> : <span className="coverPlus">+</span>}
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
            <option key={c} value={c}>{c}</option>
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
          <div className="counter">{summary.length}/{summaryMax}</div>
        </div>
        {errors.summary && <div className="errorText">{errors.summary}</div>}
      </div>

      {/* 안내(선택) */}
      <div className="field">
        <div className="label">스터디 안내</div>
        <textarea
          className="textarea"
          value={guide}
          onChange={(e) => setGuide(clampText(e.target.value, guideMax))}
          placeholder="설명설명설명설명"
        />
        <div className="counter bottom">{guide.length}/{guideMax}</div>
      </div>

      {/* 인원 제한(필수) */}
      <div className={`field ${errors.limit ? "hasError" : ""}`}>
        <div className="label">인원 제한</div>
        <select className="select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          {[2, 3, 5, 10, 15, 20, 30].map((n) => (
            <option key={n} value={n}>{n}명</option>
          ))}
        </select>
        {errors.limit && <div className="errorText">{errors.limit}</div>}
      </div>

      {/* 공개 여부 */}
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

      {/* 비밀번호(비공개일 때만 필수) */}
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
        스터디 만들기
      </button>
    </div>
  );
}