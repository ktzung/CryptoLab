/* CryptoLab — dữ liệu mô phỏng mã cổ điển, mode AES và băm mật khẩu */
window.CR_SEED = {
  lab: {
    heading: "Ba phép thử của mật mã",
    intro: "Đo không gian khóa của mã cổ điển, chấm cấu hình mode AES và ước lượng thời gian bẻ khóa mật khẩu. Engine viết tay, kết quả tất định để đối chiếu từng nhiệm vụ.",
    tabs: [
      {
        id: "classic",
        label: "Mã cổ điển",
        title: "Không gian khóa",
        badge: "26^k",
        runLabel: "Đo không gian khóa",
        hint: "Không gian khóa = bảng chữ ^ độ dài khóa. Kẻ tấn công thử 1 triệu khóa mỗi giây; dưới một ngày là yếu, từ một ngày trở lên mới tạm gọi an toàn.",
        fields: [
          {
            id: "cipher",
            label: "Mã",
            type: "select",
            value: "caesar",
            options: [
              { value: "caesar", label: "Caesar — dịch chữ" },
              { value: "vigenere", label: "Vigenère — khóa chữ" }
            ]
          },
          { id: "keyLength", label: "Độ dài khóa", type: "number", min: 1, max: 10, step: 1, value: 1 },
          {
            id: "alphabet",
            label: "Bảng chữ",
            type: "select",
            value: "26",
            options: [
              { value: "26", label: "26 — chỉ chữ thường" },
              { value: "52", label: "52 — hoa và thường" },
              { value: "95", label: "95 — printable ASCII" }
            ]
          }
        ]
      },
      {
        id: "mode",
        label: "Mode AES",
        title: "Chấm cấu hình",
        badge: "ECB/CBC/GCM",
        runLabel: "Chấm cấu hình",
        hint: "Nền 70 điểm: ECB trừ 30 vì lộ mẫu, CBC trừ 5 vì không có xác thực; khóa 192 cộng 8, khóa 256 cộng 15; tái sử dụng nonce trừ 40. Từ 75 điểm trở lên mới đạt.",
        fields: [
          {
            id: "mode",
            label: "Mode",
            type: "select",
            value: "CBC",
            options: [
              { value: "ECB", label: "ECB — từng block độc lập" },
              { value: "CBC", label: "CBC — móc xích IV" },
              { value: "GCM", label: "GCM — mã hóa có xác thực" }
            ]
          },
          {
            id: "keyBits",
            label: "Khóa",
            type: "select",
            value: "256",
            options: [
              { value: "128", label: "128 bit" },
              { value: "192", label: "192 bit" },
              { value: "256", label: "256 bit" }
            ]
          },
          {
            id: "nonceReuse",
            label: "Nonce",
            type: "select",
            value: "0",
            options: [
              { value: "0", label: "Không tái sử dụng" },
              { value: "1", label: "Tái sử dụng nonce" }
            ]
          }
        ]
      },
      {
        id: "hash",
        label: "Băm mật khẩu",
        title: "Bao lâu mới bẻ?",
        badge: "entropy",
        runLabel: "Ước lượng bẻ khóa",
        hint: "Số phỏng đoán = 2^entropy. Tốc độ: MD5 1 tỉ/giây, SHA-1 500 triệu/giây, bcrypt và argon2 chậm hơn hàng nghìn lần; salt nhân công thêm 1000. Từ một năm trở lên mới gọi là an toàn.",
        fields: [
          {
            id: "algo",
            label: "Thuật toán",
            type: "select",
            value: "argon2",
            options: [
              { value: "md5", label: "MD5 — lỗi thời" },
              { value: "sha1", label: "SHA-1 — lỗi thời" },
              { value: "bcrypt", label: "bcrypt — có cost" },
              { value: "argon2", label: "Argon2 — chậm có chủ đích" }
            ]
          },
          {
            id: "salt",
            label: "Salt",
            type: "select",
            value: "1",
            options: [
              { value: "0", label: "Không salt" },
              { value: "1", label: "Có salt" }
            ]
          },
          { id: "cost", label: "Cost (log2)", type: "number", min: 4, max: 14, step: 1, value: 12 },
          { id: "entropy", label: "Entropy mật khẩu (bit)", type: "number", min: 20, max: 80, step: 1, value: 40 }
        ]
      }
    ],
    defaults: {
      classic: { cipher: "caesar", keyLength: 1, alphabet: "26" },
      mode: { mode: "CBC", keyBits: "256", nonceReuse: "0" },
      hash: { algo: "argon2", salt: "1", cost: 12, entropy: 40 }
    },
    presets: {
      classic: [
        { id: "cr-caesar", label: "Caesar 26 khóa", dataset: { cipher: "caesar", keyLength: 1, alphabet: "26" } },
        { id: "cr-vig5", label: "Vigenère 5 ký tự", dataset: { cipher: "vigenere", keyLength: 5, alphabet: "26" } },
        { id: "cr-vig8", label: "Vigenère 8 ký tự", dataset: { cipher: "vigenere", keyLength: 8, alphabet: "26" } }
      ],
      mode: [
        { id: "cr-cbc", label: "CBC 256 bit", dataset: { mode: "CBC", keyBits: "256", nonceReuse: "0" } },
        { id: "cr-ecb", label: "ECB 128 bit", dataset: { mode: "ECB", keyBits: "128", nonceReuse: "0" } },
        { id: "cr-reuse", label: "GCM tái dùng nonce", dataset: { mode: "GCM", keyBits: "256", nonceReuse: "1" } }
      ],
      hash: [
        { id: "cr-argon", label: "Argon2 + salt", dataset: { algo: "argon2", salt: "1", cost: 12, entropy: 40 } },
        { id: "cr-md5", label: "MD5 không salt", dataset: { algo: "md5", salt: "0", cost: 4, entropy: 40 } },
        { id: "cr-bcrypt", label: "bcrypt cost 10", dataset: { algo: "bcrypt", salt: "1", cost: 10, entropy: 40 } }
      ]
    },
    examples: [
      { id: "ex-vig", kind: "classic", label: "Vigenère năm ký tự có an toàn?", dataset: { cipher: "vigenere", keyLength: 5, alphabet: "26" } },
      { id: "ex-ecb", kind: "mode", label: "Vì sao ECB lộ ảnh?", dataset: { mode: "ECB", keyBits: "128", nonceReuse: "0" } },
      { id: "ex-md5", kind: "hash", label: "MD5 không salt bị bẻ bao lâu?", dataset: { algo: "md5", salt: "0", cost: 4, entropy: 40 } }
    ],
    missions: [
      {
        id: "m-classic-keyspace",
        kind: "classic",
        title: "Không gian khóa Caesar",
        prompt: "Chọn Caesar với bảng 26 chữ và khóa dài 1. Cho engine báo số khóa có thể thử.",
        metric: "keySpace",
        expect: 26,
        hint: "Caesar chỉ dịch vòng quanh 26 chữ nên có đúng 26 khóa, kể cả khóa 0.",
        dataset: { cipher: "caesar", keyLength: 1, alphabet: "26" }
      },
      {
        id: "m-classic-seconds",
        kind: "classic",
        title: "Vigenère năm ký tự",
        prompt: "Chọn Vigenère, khóa dài 5, bảng 26 chữ. Ghi lại số giây cần để thử hết một nửa không gian khóa ở tốc độ 1 triệu khóa/giây.",
        metric: "seconds",
        expect: 5.9,
        hint: "26^5 = 11.881.376 khóa; một nửa là 5.940.688; chia 1 triệu được khoảng 5,9 giây.",
        dataset: { cipher: "vigenere", keyLength: 5, alphabet: "26" }
      },
      {
        id: "m-classic-secure",
        kind: "classic",
        title: "Khóa tám ký tự",
        prompt: "Chọn Vigenère, khóa dài 8, bảng 26 chữ. Engine phải kết luận vượt mốc một ngày.",
        metric: "secure",
        expect: 1,
        hint: "26^8 khoảng 2,09 × 10^11 khóa; một nửa chia 1 triệu vẫn hơn 100.000 giây, tức hơn một ngày.",
        dataset: { cipher: "vigenere", keyLength: 8, alphabet: "26" }
      },
      {
        id: "m-mode-score",
        kind: "mode",
        title: "ECB 128 bit",
        prompt: "Cấu hình ECB với khóa 128 bit, không tái sử dụng nonce. Cho engine báo điểm còn lại trên thang 100.",
        metric: "score",
        expect: 40,
        hint: "Nền 70 trừ 30 vì ECB, khóa 128 không cộng thêm: còn 40 điểm.",
        dataset: { mode: "ECB", keyBits: "128", nonceReuse: "0" }
      },
      {
        id: "m-mode-safe",
        kind: "mode",
        title: "Cấu hình đạt",
        prompt: "Chọn CBC với khóa 256 bit và không tái sử dụng nonce. Engine phải kết luận đạt.",
        metric: "safe",
        expect: 1,
        hint: "70 − 5 + 15 = 80 điểm, vượt ngưỡng 75; CBC chưa có xác thực nên chỉ hơn mức đạt.",
        dataset: { mode: "CBC", keyBits: "256", nonceReuse: "0" }
      },
      {
        id: "m-hash-years",
        kind: "hash",
        title: "Argon2 chậm có chủ đích",
        prompt: "Argon2 có salt, cost 12, entropy 40 bit. Ghi lại số năm ước lượng để bẻ khóa.",
        metric: "years",
        expect: 8.5,
        hint: "2^40 phỏng đoán, chia tốc độ Argon2 cost 12 rồi nhân 1000 vì có salt; khoảng 2,68 × 10^8 giây, tức 8,5 năm.",
        dataset: { algo: "argon2", salt: "1", cost: 12, entropy: 40 }
      }
    ]
  }
};
