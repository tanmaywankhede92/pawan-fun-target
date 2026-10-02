const POS = {
  left: "25%",
  top: "78%",
  width: "24%",
  height: "6%",
  fontSize: "clamp(11px, 3.2vh, 18px)",
};

const UsernameInput = ({ value, onChange, onKeyDown }) => {
  return (
    <div
      className="absolute ft-login-pos"
      style={{
        left: POS.left,
        top: POS.top,
        width: POS.width,
        height: POS.height,
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        className="absolute inset-0 border-none outline-none text-black caret-black cursor-text p-0 px-2 m-0 ft-login-field justify-center text-center font-bold"
        style={{
          width: "100%",
          height: "100%",
          fontSize: POS.fontSize,
          lineHeight: 1,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};

export { POS as usernamePos };
export default UsernameInput;
