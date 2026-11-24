/* CryptoLab — engine tất định cho mã cổ điển, mode AES và băm mật khẩu */
(function () {
  const SEED = window.CR_SEED;

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function clampInt(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function formatNumber(n) {
    const value = Number(n);
    if (!Number.isFinite(value)) return "0";
    return value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  }

  function formatSeconds(seconds) {
    if (seconds < 60) return `${formatNumber(seconds)} giây`;
    if (seconds < 3600) return `${formatNumber(round1(seconds / 60))} phút`;
    if (seconds < 86400) return `${formatNumber(round1(seconds / 3600))} giờ`;
    if (seconds < 31536000) return `${formatNumber(round1(seconds / 86400))} ngày`;
    return `${formatNumber(round1(seconds / 31536000))} năm`;
  }

  function runClassic(input) {
    const box = input || {};
    const cipher = box.cipher === "vigenere" ? "vigenere" : "caesar";
    const alphabetSize = [26, 52, 95].indexOf(Number(box.alphabet)) >= 0 ? Number(box.alphabet) : 26;
    const keyLength = cipher === "caesar" ? 1 : clampInt(box.keyLength, 1, 10, 1);
    const keySpace = Math.pow(alphabetSize, keyLength);
    const attempts = keySpace / 2;
    const seconds = round1(attempts / 1e6);
    const days = round1(seconds / 86400);
    const secure = seconds >= 86400 ? 1 : 0;
    const verdict = secure ? "An toàn" : "Yếu";
    const trace = [
      {
        step: "space",
        label: "Không gian khóa",
        result: "ok",
        note: `${alphabetSize}^${keyLength} = ${formatNumber(keySpace)} khóa`
      },
      {
        step: "attempts",
        label: "Thử một nửa số khóa",
        result: seconds >= 86400 ? "ok" : "warn",
        note: `${formatNumber(attempts)} phỏng đoán ở 1 triệu khóa/giây`
      },
      {
        step: "verdict",
        label: "Thời gian bẻ khóa",
        result: secure ? "ok" : "warn",
        note: `${formatSeconds(seconds)} · ${secure ? "vượt mốc một ngày" : "dưới mốc một ngày"}`
      }
    ];

    return {
      ok: Boolean(secure),
      verdict,
      meta: `${cipher === "caesar" ? "Caesar" : "Vigenère"} · ${formatNumber(keySpace)} khóa`,
      statusText: `${formatSeconds(seconds)} để bẻ`,
      tags: [cipher === "caesar" ? "Caesar" : "Vigenère", `bảng ${alphabetSize}`, `dài ${keyLength}`],
      trace,
      payload: {
        cipher,
        "bảng chữ": alphabetSize,
        "độ dài khóa": keyLength,
        "không gian khóa": formatNumber(keySpace),
        "số phỏng đoán": formatNumber(attempts),
        "thời gian": formatSeconds(seconds)
      },
      metrics: [
        { label: "Không gian khóa", value: formatNumber(keySpace) },
        { label: "Thời gian", value: formatSeconds(seconds) },
        { label: "Số ngày", value: formatNumber(days) },
        { label: "Kết luận", value: secure ? "an toàn" : "yếu" }
      ],
      values: { keySpace, attempts, seconds, days, secure }
    };
  }

  function runMode(input) {
    const box = input || {};
    const mode = ["ECB", "CBC", "GCM"].indexOf(box.mode) >= 0 ? box.mode : "CBC";
    const keyBits = [128, 192, 256].indexOf(Number(box.keyBits)) >= 0 ? Number(box.keyBits) : 256;
    const nonceReuse = String(box.nonceReuse) === "1" ? 1 : 0;
    let score = 70;
    if (mode === "ECB") score -= 30;
    if (mode === "CBC") score -= 5;
    if (keyBits === 192) score += 8;
    if (keyBits === 256) score += 15;
    if (nonceReuse) score -= 40;
    score = Math.max(0, Math.min(100, score));
    const penalty = 100 - score;
    const safe = score >= 75 && mode !== "ECB" && !nonceReuse ? 1 : 0;
    const verdict = safe ? "An toàn" : "Yếu";
    const trace = [
      {
        step: "mode",
        label: `Mode ${mode}`,
        result: mode === "GCM" ? "ok" : mode === "CBC" ? "warn" : "fail",
        note: mode === "GCM" ? "mã hóa có xác thực" : mode === "CBC" ? "thiếu xác thực toàn vẹn" : "lộ mẫu giữa các block"
      },
      {
        step: "key",
        label: `Khóa ${keyBits} bit`,
        result: keyBits >= 192 ? "ok" : "warn",
        note: keyBits === 128 ? "đủ dùng nhưng không cộng điểm" : `cộng ${keyBits === 256 ? 15 : 8} điểm`
      },
      {
        step: "nonce",
        label: "Nonce",
        result: nonceReuse ? "fail" : "ok",
        note: nonceReuse ? "tái sử dụng nonce làm lộ keystream" : "không tái sử dụng"
      }
    ];

    return {
      ok: Boolean(safe),
      verdict,
      meta: `${mode}-${keyBits} · ${score}/100`,
      statusText: safe ? "đạt ngưỡng 75" : `thiếu ${penalty} điểm`,
      tags: [mode, `khóa ${keyBits}`, nonceReuse ? "nonce lặp" : "nonce mới"],
      trace,
      payload: {
        mode,
        "khóa": `${keyBits} bit`,
        nonce: nonceReuse ? "tái sử dụng" : "không tái sử dụng",
        "điểm": score,
        "mất điểm": penalty
      },
      metrics: [
        { label: "Điểm", value: score },
        { label: "Khóa", value: `${keyBits} bit` },
        { label: "Mất điểm", value: penalty },
        { label: "Kết luận", value: safe ? "đạt" : "yếu" }
      ],
      values: { mode, keyBits, nonceReuse, score, penalty, safe }
    };
  }

  function runHash(input) {
    const box = input || {};
    const algo = ["md5", "sha1", "bcrypt", "argon2"].indexOf(box.algo) >= 0 ? box.algo : "argon2";
    const salt = String(box.salt) === "0" ? 0 : 1;
    const cost = clampInt(box.cost, 4, 14, 12);
    const entropy = clampInt(box.entropy, 20, 80, 40);
    let rate = 1e10;
    if (algo === "sha1") rate = 5e9;
    if (algo === "bcrypt") rate = 1e4 * Math.pow(2, cost);
    if (algo === "argon2") rate = 1e3 * Math.pow(2, cost);
    const guesses = Math.pow(2, entropy);
    const seconds = round1((guesses / rate) * (salt ? 1000 : 1));
    const years = round1(seconds / 31536000);
    const safe = seconds >= 31536000 ? 1 : 0;
    const verdict = safe ? "An toàn" : "Yếu";
    const trace = [
      {
        step: "entropy",
        label: "Entropy mật khẩu",
        result: entropy >= 40 ? "ok" : "warn",
        note: `${entropy} bit · ${formatNumber(guesses)} phỏng đoán`
      },
      {
        step: "rate",
        label: `Tốc độ ${algo.toUpperCase()}`,
        result: rate <= 1e6 ? "ok" : "warn",
        note: `${formatNumber(rate)} phỏng đoán/giây trên một GPU`
      },
      {
        step: "salt",
        label: "Salt",
        result: salt ? "ok" : "fail",
        note: salt ? "nhân công thêm 1000 lần" : "không salt, dùng bảng tra sẵn"
      }
    ];

    return {
      ok: Boolean(safe),
      verdict,
      meta: `${algo.toUpperCase()} · ${formatSeconds(seconds)}`,
      statusText: `${formatNumber(years)} năm để bẻ`,
      tags: [algo.toUpperCase(), salt ? "có salt" : "không salt", `${entropy} bit`],
      trace,
      payload: {
        "thuật toán": algo.toUpperCase(),
        salt: salt ? "có" : "không",
        cost,
        entropy: `${entropy} bit`,
        "tốc độ": `${formatNumber(rate)}/giây`,
        "thời gian": formatSeconds(seconds),
        "số năm": formatNumber(years)
      },
      metrics: [
        { label: "Entropy", value: `${entropy} bit` },
        { label: "Tốc độ", value: `${formatNumber(rate)}/s` },
        { label: "Thời gian", value: formatSeconds(seconds) },
        { label: "Kết luận", value: safe ? "an toàn" : "yếu" }
      ],
      values: { algo, salt, cost, entropy, rate, seconds, years, safe }
    };
  }

  function run(kind, values) {
    if (kind === "mode") return runMode(values);
    if (kind === "hash") return runHash(values);
    return runClassic(values);
  }

  window.CR_ENGINE = { run, formatNumber, round1, clampInt };
})();
