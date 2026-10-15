import { useState, useEffect, useRef } from "react";
import modalBg from "@assets/images/background/pointTransferModal.webp";
import { authService } from "@services/auth.service";
import { useSound } from "@hooks/useSound";

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

    const targetAccount = account.trim();
    if (!targetAccount) {
      setResponseType("error");
      setResponseMsg("ENTER TO ACCOUNT NO");
      return;
    }

    if (targetAccount.toLowerCase() === (user?.username || "").toLowerCase()) {
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
        username: user?.username || "",
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
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.35)",
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
          width: "min(72vw, calc(65vh * 928 / 531), 580px)",
          height: "min(65vh, calc(72vw * 531 / 928), 332px)",
          aspectRatio: "928 / 531",
          backgroundImage: `url(${modalBg})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.9), 0 0 16px rgba(255, 60, 20, 0.4)",
        }}
      >
        <form onSubmit={handleSubmit} className="w-full h-full relative">
          {/* TO ACCOUNT NO input */}
          <input
            ref={accountInputRef}
            type="text"
            id="transfer-account"
            name="user_transfer"
            autoComplete="off"
            value={account}
            disabled={loading}
            onChange={(e) => {
              setAccount(e.target.value);
              if (responseType === "error") setResponseMsg("");
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "Enter" || e.keyCode === 13 || e.keyCode === 23) {
                e.preventDefault();
                pinInputRef.current?.focus();
              }
            }}
            placeholder="GK"
            className="point-transfer-input"
            style={{
              position: "absolute",
              left: "34.7%",
              top: "17.3%",
              width: "33.5%",
              height: "10.7%",
            }}
          />

          {/* PIN input */}
          <input
            ref={pinInputRef}
            type="password"
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
