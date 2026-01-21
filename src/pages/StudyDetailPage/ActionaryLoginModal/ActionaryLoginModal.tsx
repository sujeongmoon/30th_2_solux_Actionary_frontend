import { createPortal } from "react-dom";
import "./ActionaryLoginModal.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onGoLogin?: () => void;
  title?: string;
  subtitle?: string;
  showGoLogin?: boolean;
};

export default function ActionaryLoginModal({
  open,
  onClose,
  onGoLogin,
  title = "로그인 필요",
  subtitle = "로그인이 필요한 서비스입니다.",
  showGoLogin = true,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div
      className="amOverlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="amModal" onMouseDown={(e) => e.stopPropagation()}>
        {/* 상단 로고 삭제됨 */}

        <div className="amTitle">{title}</div>
        <div className="amSub">{subtitle}</div>

        <div className={`amBtns ${showGoLogin ? "two" : "one"}`}>
          <button className="amBtn amBtnGhost" type="button" onClick={onClose}>
            {showGoLogin ? "취소" : "확인"}
          </button>

          {showGoLogin && (
            <button className="amBtn amBtnSolid" type="button" onClick={onGoLogin}>
              로그인하러 가기
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}