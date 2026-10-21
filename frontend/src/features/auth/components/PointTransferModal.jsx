import { useState, useEffect, useRef, useCallback } from "react";
import modalBg from "@assets/images/background/pointTransferModal.webp";
import { authService } from "@services/auth.service";
import { useSound } from "@hooks/useSound";
import { isAndroidTv } from "@utils/isTv";

const PointTransferModal = ({
  open,
  onClose,
  user,
  onTransferSuccess,
}) => {
  const [account, setAccount] = useState("");
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [responseType, setResponseType] = useState("idle"); // 'idle' | 'success' | 'error' | 'loading'

  const accountInputRef = useRef(null);
  const pinInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const transferBtnRef = useRef(null);
  const closeBtnRef = useRef(null);
  const { play } = useSound();
  const isTv = isAndroidTv();

  const getDims = useCallback(() => {
    if (typeof window === "undefined") return { width: 580, height: 332 };
    const w = window.innerWidth;
    const h = window.innerHeight;
    let targetW = Math.min(620, Math.round(w * 0.65));
    let targetH = Math.round((targetW * 531) / 928);
    if (targetH > h * 0.72) {
      targetH = Math.round(h * 0.72);
      targetW = Math.round((targetH * 928) / 531);
    }
    return { width: Math.max(280, targetW), height: Math.max(160, targetH) };
  }, []);

  const [dims, setDims] = useState(getDims);

  useEffect(() => {
    const onResize = () => setDims(getDims());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getDims]);

  // Reset fields and focus first input when opening modal
  useEffect(() => {
    if (open) {
      setAccount("");
      setPin("");
      setAmount("");
      setResponseMsg("");
      setResponseType("idle");
      setLoading(false);

      const timer = setTimeout(() => {
        accountInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on Escape key press
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    play("CLICK");

    const targetAccount = account.trim().toLowerCase().replace(/^gk/i, "");
    if (!targetAccount) {
      setResponseType("error");
      setResponseMsg("ENTER TO ACCOUNT NO");
      return;
    }

    const currentUsername = (user?.username || "").toLowerCase().replace(/^gk/i, "");
    if (targetAccount === currentUsername) {
      setResponseType("error");
      setResponseMsg("CANNOT TRANSFER TO OWN ACCOUNT");
      return;
    }

    if (!pin) {
      setResponseType("error");
      setResponseMsg("ENTER PIN");
      return;
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setResponseType("error");
      setResponseMsg("ENTER A VALID AMOUNT");
      return;
    }

    const currentBalance = Number(user?.balance || 0);
    if (numAmount > currentBalance) {
      setResponseType("error");
      setResponseMsg("INSUFFICIENT BALANCE");
      return;
    }

    setLoading(true);
    setResponseType("loading");
    setResponseMsg("PROCESSING TRANSFER...");

    try {
      const payload = {
        username: (user?.username || "").replace(/^gk/i, ""),
        user_transfer: targetAccount,
        pin: !isNaN(Number(pin)) ? Number(pin) : pin,
        amount: numAmount,
      };

      const { data } = await authService.transferBalance(payload);

      if (data?.status === true || data?.success === true) {
        setResponseType("success");
        setResponseMsg(data?.message || "TRANSFER COMPLETED SUCCESSFULLY");
        play("TAKE");

        if (onTransferSuccess) {
          onTransferSuccess(data);
        }

        // Clear sensitive inputs on success
        setPin("");
        setAmount("");
      } else {
        setResponseType("error");
        setResponseMsg(data?.message || "TRANSFER FAILED");
      }
    } catch (err) {
      setResponseType("error");
      const errText =
        err?.response?.data?.message ||
        err?.message ||
        "TRANSFER FAILED. PLEASE TRY AGAIN.";
      setResponseMsg(errText.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    play("CLICK");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center select-none"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
      onClick={handleClose}
    >
      <div
        className="relative"
        role="dialog"
        aria-modal="true"
        aria-label="Point Transfer Modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: `${dims.width}px`,
          height: `${dims.height}px`,
          backgroundImage: `url(${modalBg})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.95), 0 0 20px rgba(255, 60, 20, 0.5)",
          borderRadius: "16px",
        }}
      >
        <form onSubmit={handleSubmit} className="w-full h-full relative">
          {/* TO ACCOUNT NO input */}
          <div
            className="flex items-center cursor-text"
            onClick={() => accountInputRef.current?.focus()}
            style={{
              position: "absolute",
              left: "34.7%",
              top: "17.3%",
              width: "33.5%",
              height: "10.7%",
              paddingLeft: "14px",
              boxSizing: "border-box",
            }}
          >
            <span
              className="select-none pointer-events-none"
              style={{
                color: "#2b1103",
                fontFamily: '"Playfair Display", "Times New Roman", serif, sans-serif',
                fontWeight: 700,
                fontSize: "clamp(12px, 1.8vw, 21px)",
                lineHeight: 1,
                paddingRight: "2px",
                textShadow: "0 1px 1px rgba(255, 255, 255, 0.5)",
              }}
            >
              GK
            </span>
            <input
              ref={accountInputRef}
              type="text"
              inputMode={isTv ? "none" : undefined}
              id="transfer-account"
              name="user_transfer"
              autoComplete="off"
              value={(account || "").replace(/^gk/i, "")}
              disabled={loading}
              onChange={(e) => {
                const raw = e.target.value.toLowerCase().replace(/^gk/i, "");
                setAccount(raw);
                if (responseType === "error") setResponseMsg("");
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter" || e.keyCode === 13 || e.keyCode === 23) {
                  e.preventDefault();
                  pinInputRef.current?.focus();
                }
              }}
              className="point-transfer-input"
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                padding: "0",
                background: "transparent",
              }}
            />
          </div>

          {/* PIN input */}
          <input
            ref={pinInputRef}
            type="password"
            inputMode={isTv ? "none" : undefined}
            id="transfer-pin"
            name="pin"
            autoComplete="new-password"
            value={pin}
            disabled={loading}
            onChange={(e) => {
              setPin(e.target.value);
              if (responseType === "error") setResponseMsg("");
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                accountInputRef.current?.focus();
              } else if (e.key === "ArrowDown" || e.key === "Enter" || e.keyCode === 13 || e.keyCode === 23) {
                e.preventDefault();
                amountInputRef.current?.focus();
              }
            }}
            placeholder="••••"
            className="point-transfer-input"
            style={{
              position: "absolute",
              left: "34.7%",
              top: "33.7%",
              width: "33.5%",
              height: "10.7%",
            }}
          />

          {/* AMOUNT input */}
          <input
            ref={amountInputRef}
            type="number"
            inputMode={isTv ? "none" : undefined}
            id="transfer-amount"
            name="amount"
            min="1"
            step="any"
            value={amount}
            disabled={loading}
            onChange={(e) => {
              setAmount(e.target.value);
              if (responseType === "error") setResponseMsg("");
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                pinInputRef.current?.focus();
              } else if (e.key === "ArrowDown" || e.key === "Enter" || e.keyCode === 13 || e.keyCode === 23) {
                e.preventDefault();
                transferBtnRef.current?.focus();
              }
            }}
            placeholder="0"
            className="point-transfer-input"
            style={{
              position: "absolute",
              left: "34.7%",
              top: "48.8%",
              width: "33.5%",
              height: "10.7%",
            }}
          />

          {/* TRANSFER button */}
          <button
            ref={transferBtnRef}
            type="submit"
            disabled={loading}
            tabIndex={0}
            aria-label="Transfer points"
            className="point-transfer-btn"
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                amountInputRef.current?.focus();
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                closeBtnRef.current?.focus();
              } else if (e.key === "Enter" || e.key === "Select" || e.key === "Ok" || e.keyCode === 13 || e.keyCode === 23) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            style={{
              position: "absolute",
              left: "16.9%",
              top: "63.3%",
              width: "25.8%",
              height: "16.6%",
            }}
          >
            {loading ? (
              <span className="point-transfer-btn-spinner" />
            ) : null}
          </button>

          {/* CLOSE button */}
          <button
            ref={closeBtnRef}
            type="button"
            disabled={loading}
            tabIndex={0}
            aria-label="Close transfer modal"
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                amountInputRef.current?.focus();
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                transferBtnRef.current?.focus();
              } else if (e.key === "Enter" || e.key === "Select" || e.key === "Ok" || e.keyCode === 13 || e.keyCode === 23) {
                e.preventDefault();
                handleClose();
              }
            }}
            className="point-transfer-btn"
            style={{
              position: "absolute",
              left: "56.0%",
              top: "63.3%",
              width: "25.0%",
              height: "16.6%",
            }}
          />

          {/* RESPONSE text display */}
          <div
            className="point-transfer-response"
            aria-live="polite"
            style={{
              position: "absolute",
              left: "28.5%",
              top: "82.5%",
              width: "68.0%",
              height: "8.7%",
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            <span
              style={{
                fontFamily: '"Times New Roman", "Century Gothic", sans-serif',
                fontWeight: 700,
                fontSize: "clamp(10px, 1.6vw, 18px)",
                letterSpacing: "0.5px",
                color:
                  responseType === "success"
                    ? "#4ade80"
                    : responseType === "error"
                      ? "#ff5555"
                      : responseType === "loading"
                        ? "#fbbf24"
                        : "#f7f4f1",
                textShadow:
                  responseType === "success"
                    ? "0 0 8px rgba(74, 222, 128, 0.7), 1px 1px 2px #000"
                    : responseType === "error"
                      ? "0 0 8px rgba(255, 85, 85, 0.7), 1px 1px 2px #000"
                      : responseType === "loading"
                        ? "0 0 8px rgba(251, 191, 36, 0.7), 1px 1px 2px #000"
                        : "1px 1px 2px #000",
              }}
            >
              {responseMsg}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PointTransferModal;
