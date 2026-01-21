import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StudyEditPage.css";
import SuccessImg from "../../assets/Group 148.png";
import LogoImg from "../../assets/로고.png";
import { getStudyDetail, updateStudy, type UpdateStudyPayload } from "../../api/studies";

type Visibility = "public" | "private";

const CATEGORIES = ["수능", "공무원", "임용", "자격증", "어학", "취업", "기타"] as const;
type CategoryLabel = (typeof CATEGORIES)[number];

type FieldErrors = Partial<Record<"title" | "category" | "summary" | "limit" | "password", string>>;
type ToastType = "success" | "error";
type ToastState = { open: boolean; type: ToastType; message: string };

function clampText(v: string, max: number) {
  return v.length > max ? v.slice(0, max) : v;
}

const LABEL_TO_ENUM: Record<CategoryLabel, UpdateStudyPayload["category"]> = {
  수능: "CSAT",
  공무원: "CIVIL_SERVICE",
  임용: "TEACHER_EXAM",
  자격증: "LICENSE",
  어학: "LANGUAGE",
  취업: "EMPLOYMENT",
  기타: "OTHER",
};

const ENUM_TO_LABEL: Record<string, CategoryLabel> = {
  CSAT: "수능",
  CIVIL_SERVICE: "공무원",
  TEACHER_EXAM: "임용",
  LICENSE: "자격증",
  LANGUAGE: "어학",
  EMPLOYMENT: "취업",
  OTHER: "기타",
};

export default function StudyEditPage() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const numericStudyId = useMemo(() => {
    const n = Number(studyId);
    return Number.isFinite(n) ? n : null;
  }, [studyId]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [existingCover, setExistingCover] = useState<string>("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryLabel>("수능");

  const [summary, setSummary] = useState(""); 
  const [guide, setGuide] = useState("");

  const [limit, setLimit] = useState<number>(2);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastState>({ open: false, type: "success", message: "" });
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const titleMax = 20;
  const summaryMax = 20;
  const guideMax = 200;

  const showToast = (type: ToastType, message: string) => {
    setToast({ open: true, type, message });
    window.setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);
  };

  useEffect(() => {
    if (visibility === "public") {
      setPassword("");
      setErrors((prev) => {
        const { password: _pw, ...rest } = prev;
        return rest;
      });
    }
  }, [visibility]);

  // ===== detail fetch =====
  useEffect(() => {
    if (numericStudyId == null) {
      setLoading(false);
      showToast("error", "잘못된 스터디 ID 입니다.");
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data: any = await getStudyDetail(numericStudyId);

        const studyName = data?.studyName ?? data?.name ?? "";
        const coverImage = data?.coverImage ?? "";
        const categoryEnum = data?.category ?? "OTHER";
        const description = data?.description ?? "";
        const memberLimit = Number(data?.memberLimit ?? 2);
        const isPublic = Boolean(data?.isPublic);

        if (!mounted) return;

        setExistingCover(String(coverImage));
        setTitle(String(studyName));
        setCategory(ENUM_TO_LABEL[String(categoryEnum)] ?? "기타");

        setSummary(String(description).slice(0, summaryMax));
        setGuide(String(description).slice(0, guideMax));

        setLimit(Number.isFinite(memberLimit) && memberLimit > 0 ? memberLimit : 2);
        setVisibility(isPublic ? "public" : "private");
        setPassword("");
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401) showToast("error", "로그인이 필요해요.");
        else if (status === 403) showToast("error", "수정 권한이 없어요.");
        else if (status === 404) showToast("error", "스터디 정보를 찾을 수 없어요.");
        else showToast("error", e?.response?.data?.message ?? "스터디 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [numericStudyId]);

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
    if (visibility === "private" && !/^\d{6}$/.test(password))
      next.password = "비밀번호(숫자 6자리)가 필요해요.";
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
    if (saving) return;

    if (coverFile) {
      showToast("error", "커버 이미지 업로드 API 연동이 아직 필요해요. (임시로 기존 이미지 유지)");
    }
    const basePayload: UpdateStudyPayload = {
      studyName: title.trim(),
      coverImage: existingCover || null,
      category: LABEL_TO_ENUM[category],
      description: clampText(summary.trim(), 20),
      memberLimit: Number(limit),
      isPublic: visibility === "public",
    };

    const finalPayload: UpdateStudyPayload =
      visibility === "private"
        ? { ...basePayload, password: Number(password) } 
        : basePayload; 

    try {
      setSaving(true);
      await updateStudy(numericStudyId, finalPayload);

      showToast("success", "성공적으로 스터디가 수정되었습니다.");
      setSuccessModalOpen(true);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) showToast("error", "로그인이 필요해요.");
      else if (status === 403) showToast("error", "수정 권한이 없어요.");
      else if (status === 404) showToast("error", "수정할 스터디가 없어요.");
      else showToast("error", e?.response?.data?.message ?? "스터디 수정 실패");
    } finally {
      setSaving(false);
    }
  };

  const currentCoverSrc = coverPreview || existingCover;

  if (loading) {
    return (
      <div className="scWrap">
        {toast.open && (
          <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`} role="status">
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
      {toast.open && (
        <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`} role="status">
          {toast.message}
        </div>
      )}

      {successModalOpen && (
        <div className="successOverlay" role="dialog" aria-modal="true">
          <div className="successModal">
            <img src={LogoImg} alt="ACTIONARY" className="successBrandImg" />
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

      <div className="scTitle">스터디 수정</div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hiddenFile"
        onChange={(e) => onChangeCover(e.target.files?.[0] ?? null)}
      />

      <div className="field">
        <div className="label">커버 이미지</div>
        <div className="coverRow">
          <button type="button" className="coverCircle" onClick={onPickCover} aria-label="cover">
            {currentCoverSrc ? <img src={currentCoverSrc} alt="" /> : <span className="coverPlus">+</span>}
          </button>
        </div>
      </div>

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

      <div className={`field ${errors.summary ? "hasError" : ""}`}>
        <div className="label">간단 소개글</div>
        <div className="inputRow">
          <input
            className="input"
            value={summary}
            onChange={(e) => setSummary(clampText(e.target.value, summaryMax))}
            placeholder="소개글(20자)"
          />
          <div className="counter">
            {summary.length}/{summaryMax}
          </div>
        </div>
        {errors.summary && <div className="errorText">{errors.summary}</div>}
      </div>

      {/* guide는 UI용 - 서버에는 안보냄 */}
      <div className="field">
        <div className="label">스터디 안내(선택)</div>
        <textarea
          className="textarea"
          value={guide}
          onChange={(e) => setGuide(clampText(e.target.value, guideMax))}
          placeholder="(UI용) 길게 써도 서버에는 저장 안됨"
        />
        <div className="counter bottom">
          {guide.length}/{guideMax}
        </div>
      </div>

      <div className={`field ${errors.limit ? "hasError" : ""}`}>
        <div className="label">인원 제한</div>
        <div className="limitControl">
          <button type="button" className="limitBtn" onClick={() => setLimit((prev) => Math.max(1, prev - 1))}>
            −
          </button>

          <input
            type="number"
            className="limitInput"
            value={limit}
            min={1}
            max={30}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isNaN(v)) return;
              setLimit(Math.min(30, Math.max(1, v)));
            }}
          />

          <button type="button" className="limitBtn" onClick={() => setLimit((prev) => Math.min(30, prev + 1))}>
            +
          </button>

          <span className="limitUnit">명</span>
        </div>
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

      <button className="submitBtn" type="button" onClick={onSubmit} disabled={!canSubmit || saving}>
        {saving ? "수정 중..." : "스터디 수정하기"}
      </button>
    </div>
  );
}