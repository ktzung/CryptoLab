/* CryptoLab - dữ liệu phần 1: module Cơ sở mật mã */
window.CRYPTOLAB = window.CRYPTOLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };

window.CRYPTOLAB.modules.push({
  id: "co-so-mat-ma",
  num: "01",
  tone: "blue",
  title: "Cơ sở mật mã",
  blurb: "Bốn bài mở đầu đi từ mã dịch chuyển cổ điển đến mật mã hiện đại: không gian khóa, AES đối xứng, cặp khóa RSA và hàm băm bảo vệ mật khẩu. Mỗi bài có sơ đồ, năm bước phân tích và bài luyện trước khi vào phòng mô phỏng.",
  lessons: ["ma-caesar", "ma-doi-xung", "rsa", "ham-bam"]
});

window.CRYPTOLAB.lessons["ma-caesar"] = {
  id: "ma-caesar",
  module: "co-so-mat-ma",
  title: "Mã Caesar",
  shortTitle: "Caesar",
  subtitle: "Dịch vòng bảng chữ 26 ký tự và vì sao 26 khóa là quá ít",
  blurb: "Mã Caesar chỉ dịch mỗi chữ đi k khóa trong bảng 26 chữ. Theo một bức thư từ A đến Z, giải mã và thử khóa để thấy vì sao chỉ 26 khả năng không thể bảo vệ dữ liệu trước máy tính hiện nay.",
  duration: "12 phút",
  level: "Cơ bản",
  tags: ["caesar", "shift cipher", "mod 26", "brute force", "frequency"],
  metrics: [
    { key: "alphabet", label: "Bảng chữ", tone: "blue" },
    { key: "shift", label: "Khóa dịch", tone: "yellow" },
    { key: "length", label: "Độ dài", tone: "green" },
    { key: "risk", label: "Mức an toàn", tone: "coral" }
  ],
  nodes: [
    { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Bản rõ", sub: "ATTACKATDAWN" },
    { id: "code", type: "code", x: 340, y: 80, w: 200, h: 70, label: "Dịch chuyển", sub: "C = (P + k) mod 26" },
    { id: "key", type: "key", x: 625, y: 80, w: 200, h: 70, label: "Khóa dịch", sub: "k = 3 trên 26 chữ" },
    { id: "book", type: "book", x: 340, y: 195, w: 200, h: 70, label: "Bảng chữ A-Z", sub: "26 chữ, vòng tròn" },
    { id: "signal", type: "signal", x: 625, y: 310, w: 200, h: 70, label: "Bản mã", sub: "DWWDFNDWGDZQ" },
    { id: "check", type: "check", x: 340, y: 310, w: 200, h: 70, label: "Thử 26 khóa", sub: "duyệt dưới 1 giây" },
    { id: "alert", type: "alert", x: 55, y: 310, w: 200, h: 70, label: "Lộ tần suất", sub: "chữ E chiếm 12,7%" }
  ],
  edges: [
    { id: "user-code", from: "user", to: "code", kind: "request", label: "bản rõ" },
    { id: "key-code", from: "key", to: "code", kind: "data", label: "k = 3" },
    { id: "code-book", from: "code", to: "book", kind: "data", label: "tra bảng" },
    { id: "book-signal", from: "book", to: "signal", kind: "data", label: "chữ mã" },
    { id: "signal-check", from: "signal", to: "check", kind: "request", label: "thử khóa" },
    { id: "check-alert", from: "check", to: "alert", kind: "control", label: "phá được" }
  ],
  learn: [
    "Mã hóa Caesar là phép cộng modulo 26 với khóa 0 đến 25.",
    "Giải mã dùng phép trừ cùng khóa và cộng 26 để tránh số âm.",
    "Chỉ 26 khóa nên thử vét cạn mất chưa tới một phần nghìn giây.",
    "Tần suất chữ còn nguyên là lý do mã cổ điển bị phá."
  ],
  steps: [
    {
      short: "Bản rõ",
      type: "concept",
      title: "Một bảng chữ và một con số",
      body: "Bản rõ là chuỗi cần giữ bí mật, còn khóa là con số quyết định phép dịch. Với Caesar, khóa <code>k</code> nằm trong khoảng 0 đến 25, mỗi chữ được thay bằng chữ đứng sau nó đúng <code>k</code> vị trí trên bảng 26 chữ cái. Ví dụ với <code>k = 3</code>, chữ <code>A</code> thành <code>D</code>, chữ <code>X</code> quay vòng về <code>A</code>. Toàn bộ quy tắc chỉ gói trong một phép cộng modulo, nên người học có thể tính tay. Dù vậy, bản rõ <code>ATTACKATDAWN</code> dài 12 chữ vẫn giữ nguyên độ dài sau khi mã hóa; chỉ nội dung chữ thay đổi.",
      focus: ["user", "key"],
      edges: ["user-code", "key-code"],
      metrics: { alphabet: "26", shift: "3", length: "12", risk: "yếu" },
      changes: ["Xác định bản rõ 12 chữ", "Chọn khóa dịch k = 3"],
      note: "Khóa 0 không đổi gì, nên không gian khóa thực dụng chỉ còn 25 giá trị."
    },
    {
      short: "Dịch vòng",
      type: "flow",
      title: "Cộng khóa vào từng chữ",
      body: "Công thức mã hóa là <code>C = (P + k) mod 26</code>, trong đó <code>P</code> là vị trí 0 đến 25 của chữ gốc và <code>C</code> là vị trí của chữ mã. Áp dụng <code>k = 3</code> cho <code>ATTACKATDAWN</code> ta được <code>DWWDFNDWGDZQ</code>: chữ <code>A</code> thành <code>D</code>, <code>T</code> thành <code>W</code>, <code>C</code> thành <code>F</code>. Phép cộng vòng quanh bảng chữ nên <code>Z</code> cộng 1 thành <code>A</code>, không sinh ký tự ngoài bảng. Mỗi chữ xử lý độc lập, không phụ thuộc vị trí hay chữ trước đó, nên có thể chia việc cho nhiều người. Chính tính độc lập này cũng là điểm yếu: tần suất chữ trong bản mã phản chiếu gần như nguyên vẹn tần suất của ngôn ngữ gốc.",
      focus: ["code", "key", "book", "signal"],
      edges: ["key-code", "code-book", "book-signal"],
      metrics: { alphabet: "26", shift: "3", length: "12", risk: "yếu" },
      changes: ["12 chữ đều dịch đúng 3 bước", "Bản mã ra đời cùng độ dài"],
      note: "Modulo 26 giữ mọi chữ trong bảng, kể cả khi cộng vượt qua Z."
    },
    {
      short: "Giải mã",
      type: "detail",
      title: "Đảo chiều phép cộng",
      body: "Giải mã đảo chiều phép cộng bằng <code>P = (C - k + 26) mod 26</code>. Với bản mã <code>DWWDFNDWGDZQ</code> và <code>k = 3</code>, chữ <code>D</code> lùi ba bước về <code>A</code>, <code>W</code> lùi về <code>T</code>, <code>F</code> lùi về <code>C</code>, khôi phục đúng <code>ATTACKATDAWN</code>. Cộng thêm 26 trước khi lấy modulo để tránh số âm trong ngôn ngữ không hỗ trợ modulo âm, ví dụ JavaScript với <code>-1 % 26</code> cho <code>-1</code>. Người nhận chỉ cần biết khóa 3 là đọc được toàn bộ thư. Nếu khóa bị lộ, mọi bản mã cùng khóa đều mất bí mật, nên nguyên tắc Kerckhoffs yêu cầu chỉ giữ bí mật khóa, không giấu thuật toán.",
      focus: ["signal", "code", "user"],
      edges: ["book-signal", "code-book", "user-code"],
      metrics: { alphabet: "26", shift: "3", length: "12", risk: "yếu" },
      changes: ["Bản mã trở lại bản rõ", "Khóa 3 được xác nhận"],
      note: "Cùng một khóa vừa mã hóa vừa giải mã, chỉ đổi phép cộng thành phép trừ."
    },
    {
      short: "Thử khóa",
      type: "pitfall",
      title: "26 khóa không đủ che",
      body: "Không gian khóa của Caesar chỉ có 26 giá trị, tương đương khoảng 4,7 bit. Một máy thử một triệu khóa mỗi giây sẽ duyệt hết 26 khả năng trong 26 micro giây, nhanh hơn cả một lần nhấn phím. Kể cả khi người tấn công không biết tiếng Việt hay tiếng Anh, tần suất chữ vẫn đủ để đoán: trong văn bản tiếng Anh dài, chữ <code>E</code> chiếm khoảng 12,7%, nên chữ xuất hiện nhiều nhất trong bản mã thường ánh xạ về <code>E</code>. Vigenere với khóa dài từ 8 chữ trở lên mới đẩy không gian khóa lên khoảng 2,09 x 10^11, đủ vượt thử vét cạn trong một ngày.",
      focus: ["signal", "check", "alert"],
      edges: ["signal-check", "check-alert"],
      metrics: { alphabet: "26", shift: "0", length: "12", risk: "vỡ ngay" },
      changes: ["Toàn bộ 26 khóa bị thử", "Bản rõ lộ chỉ sau vài giây"],
      note: "Thử vét cạn và phân tích tần suất là hai con đường độc lập cùng phá mã cổ điển."
    },
    {
      short: "Tổng kết",
      type: "final",
      tone: "final",
      title: "Bài học từ một phép dịch",
      body: "Tổng kết: Caesar là phép dịch vòng 26 chữ, khóa <code>k = 3</code> biến <code>ATTACKATDAWN</code> thành <code>DWWDFNDWGDZQ</code>, giải mã bằng phép trừ cùng modulo. Bài học không nằm ở thao tác mà ở cách đánh giá: không gian khóa 26 quá nhỏ, tần suất chữ không bị xáo trộn, nên chỉ cần dưới một phần nghìn giây là phá xong. Mật mã hiện đại thay bảng chữ bằng khối 128 bit và khóa 128 bit trở lên, đồng thời trộn dữ liệu qua nhiều vòng. Bài tiếp theo đi vào mã đối xứng, nơi một khóa chung vừa mã hóa vừa giải mã.",
      focus: "all",
      edges: "all",
      metrics: { alphabet: "26", shift: "3", length: "12", risk: "không dùng" },
      changes: ["Đủ vòng đời mã hóa và giải mã", "Sẵn sàng sang bài AES"],
      note: "Hãy nhớ con số 26 khóa, vì mã hiện đại dùng 2^128 khóa trở lên."
    }
  ]
};

window.CRYPTOLAB.lessons["ma-doi-xung"] = {
  id: "ma-doi-xung",
  module: "co-so-mat-ma",
  title: "Mã đối xứng và AES",
  shortTitle: "Đối xứng",
  subtitle: "Một khóa chung, khối 128 bit và ba mode phổ biến",
  blurb: "Mã đối xứng dùng chung một khóa cho cả mã hóa và giải mã. Bài đi qua AES với khối 128 bit, mười vòng biến đổi, ba mode ECB, CBC, GCM và bài toán trao khóa khi hai bên chưa từng gặp nhau.",
  duration: "12 phút",
  level: "Trung cấp",
  tags: ["AES", "block cipher", "mode", "IV", "key exchange"],
  metrics: [
    { key: "block", label: "Khối", tone: "blue" },
    { key: "rounds", label: "Số vòng", tone: "violet" },
    { key: "keybits", label: "Khóa", tone: "yellow" },
    { key: "leak", label: "Rò rỉ mẫu", tone: "coral" }
  ],
  nodes: [
    { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Người gửi", sub: "bản rõ 1 KB" },
    { id: "code", type: "code", x: 340, y: 80, w: 200, h: 70, label: "Mã hóa AES-128", sub: "10 vòng, 16 byte khóa" },
    { id: "key", type: "key", x: 625, y: 80, w: 200, h: 70, label: "Khóa đối xứng", sub: "chia sẻ ngoài kênh" },
    { id: "nonce", type: "event", x: 340, y: 195, w: 200, h: 70, label: "IV / nonce", sub: "12 byte ngẫu nhiên" },
    { id: "alert", type: "alert", x: 55, y: 310, w: 200, h: 70, label: "Trao khóa", sub: "kênh ngoài" },
    { id: "server", type: "server", x: 340, y: 310, w: 200, h: 70, label: "Người nhận", sub: "giải mã cùng khóa" },
    { id: "signal", type: "signal", x: 625, y: 310, w: 200, h: 70, label: "Bản mã", sub: "khối 128 bit" }
  ],
  edges: [
    { id: "user-code", from: "user", to: "code", kind: "request", label: "gửi" },
    { id: "key-code", from: "key", to: "code", kind: "data", label: "khóa 16 byte" },
    { id: "nonce-code", from: "nonce", to: "code", kind: "data", label: "IV 12 byte" },
    { id: "code-signal", from: "code", to: "signal", kind: "data", label: "bản mã" },
    { id: "signal-server", from: "signal", to: "server", kind: "request", label: "chuyển" },
    { id: "key-server", from: "key", to: "server", kind: "data", label: "cùng khóa" },
    { id: "alert-server", from: "alert", to: "server", kind: "control", label: "gửi khóa" }
  ],
  learn: [
    "Mã đối xứng dùng một khóa cho cả mã hóa và giải mã.",
    "AES xử lý khối 128 bit với 10, 12 hoặc 14 vòng.",
    "ECB lộ mẫu, CBC cần IV ngẫu nhiên, GCM thêm xác thực.",
    "Khóa phải được trao qua kênh an toàn trước khi mã hóa."
  ],
  steps: [
    {
      short: "Một khóa",
      type: "concept",
      title: "Hai chiều, một khóa",
      body: "Mã đối xứng dùng một khóa <code>K</code> cho cả hai chiều: gửi tính <code>C = E(K, P)</code>, nhận tính <code>P = D(K, C)</code>. Ưu điểm lớn nhất là tốc độ: AES trên CPU hiện đại đạt hàng trăm MB mỗi giây, nhanh hơn RSA hàng nghìn lần. Nhược điểm nằm ở việc phân phối: cả hai bên phải có cùng khóa trước khi trao đổi, và mỗi cặp đối tác nên dùng khóa riêng. Với 10 người cần 45 khóa, với 100 người cần 4.950 khóa. AES xử lý từng khối 128 bit, khóa dài 128, 192 hoặc 256 bit, tương ứng 10, 12 hoặc 14 vòng.",
      focus: ["user", "code", "key"],
      edges: ["user-code", "key-code"],
      metrics: { block: "128 bit", rounds: "10", keybits: "128 bit", leak: "không" },
      changes: ["Hai bên có chung một khóa", "Khối dữ liệu cố định 128 bit"],
      note: "Số khóa cần cho n người là n(n-1)/2, tăng theo bình phương số người."
    },
    {
      short: "Mười vòng",
      type: "flow",
      title: "Bốn bước trong mỗi vòng",
      body: "AES-128 biến đổi khối 128 bit qua 10 vòng, mỗi vòng gồm bốn bước: <code>SubBytes</code> thay byte theo bảng S-box, <code>ShiftRows</code> dịch hàng, <code>MixColumns</code> trộn cột và <code>AddRoundKey</code> cộng khóa vòng. Khóa 128 bit được mở rộng thành 11 khóa vòng, tổng 176 byte. Vòng cuối bỏ <code>MixColumns</code> để giải mã đối xứng dễ hơn. Mỗi bit đầu vào lan ra toàn khối sau khoảng hai vòng, tạo hiệu ứng tuyết lở: đổi một bit bản rõ làm khoảng một nửa số bit bản mã đổi theo. Đây là nền tảng để AES chống phân tích sai khác.",
      focus: ["code", "key", "nonce"],
      edges: ["key-code", "nonce-code", "code-signal"],
      metrics: { block: "128 bit", rounds: "10", keybits: "128 bit", leak: "không" },
      changes: ["Khóa được mở rộng thành 11 khóa vòng", "Khối đi qua đủ 10 vòng"],
      note: "AES-192 dùng 12 vòng, AES-256 dùng 14 vòng, khóa vòng tương ứng 208 và 240 byte."
    },
    {
      short: "Ba mode",
      type: "detail",
      title: "Ghép các khối",
      body: "Mode quyết định cách ghép các khối. <code>ECB</code> mã hóa từng khối độc lập nên hai khối giống nhau cho hai khối mã giống nhau, làm lộ mẫu ảnh và cấu trúc dữ liệu. <code>CBC</code> XOR khối rõ với khối mã trước, khởi đầu bằng IV 16 byte ngẫu nhiên, nên cùng bản rõ cho bản mã khác nhau mỗi lần. <code>GCM</code> là mode có xác thực: nonce 12 byte duy nhất, sinh thẻ xác thực 16 byte, phát hiện cả sửa đổi lẫn sai khóa. Với GCM, tuyệt đối không tái sử dụng nonce; với CBC, IV phải ngẫu nhiên và không cần giữ bí mật.",
      focus: ["code", "signal", "server"],
      edges: ["code-signal", "signal-server"],
      metrics: { block: "128 bit", rounds: "10", keybits: "128 bit", leak: "ECB: có" },
      changes: ["Chọn mode theo yêu cầu toàn vẹn", "IV hoặc nonce được cấp riêng"],
      note: "ECB chỉ phù hợp khi dữ liệu ngắn hơn một khối hoặc không bao giờ lặp."
    },
    {
      short: "Nonce",
      type: "pitfall",
      title: "Lỗi nằm ở tham số",
      body: "Lỗi nghiêm trọng nhất khi dùng AES không nằm ở thuật toán mà ở tham số. Tái sử dụng nonce <code>GCM</code> với cùng khóa làm lộ XOR của hai bản rõ, đồng thời cho phép giả mạo thẻ xác thực. Dùng IV cố định cho <code>CBC</code> khiến hai lần mã hóa cùng bản rõ ra cùng bản mã, phá tính ngẫu nhiên. Ngoài ra, mã hóa mà không xác thực dễ bị tấn công chèn bit hoặc thay đổi khối. Cách làm đúng là dùng khóa 256 bit, nonce 96 bit ngẫu nhiên hoặc bộ đếm duy nhất, và ưu tiên AES-GCM hoặc ChaCha20-Poly1305 thay vì tự ghép CBC với HMAC.",
      focus: ["nonce", "key", "alert"],
      edges: ["alert-server", "nonce-code", "key-code"],
      metrics: { block: "128 bit", rounds: "10", keybits: "128 bit", leak: "nonce lặp" },
      changes: ["Phát hiện nonce bị tái sử dụng", "Chuyển sang mode có xác thực"],
      note: "Nonce 96 bit chỉ an toàn khi chưa từng dùng lại dưới cùng một khóa."
    },
    {
      short: "Tổng kết",
      type: "final",
      tone: "final",
      title: "Nhanh nhưng còn bài toán khóa",
      body: "Tổng kết: <code>AES</code> là mã khối 128 bit với 10 đến 14 vòng, khóa 128, 192 hoặc 256 bit, chạy nhanh và được tăng tốc phần cứng trên hầu hết CPU. Điều quyết định an toàn là cách dùng: chọn <code>GCM</code> cho dữ liệu cần toàn vẹn, CBC kèm HMAC khi cần tương thích, tránh ECB hoàn toàn. Vấn đề còn lại là trao khóa: hai bên ở xa chưa có kênh bí mật thì không thể gửi khóa đối xứng an toàn. Bài RSA giải quyết đúng khoảng trống này bằng cặp khóa công khai và riêng.",
      focus: "all",
      edges: "all",
      metrics: { block: "128 bit", rounds: "10-14", keybits: "128-256", leak: "tránh ECB" },
      changes: ["Chốt cấu hình AES an toàn", "Thấy rõ nhu cầu trao khóa"],
      note: "AES không giải quyết trao khóa; đó là việc của mã bất đối xứng hoặc Diffie-Hellman."
    }
  ]
};

window.CRYPTOLAB.lessons["rsa"] = {
  id: "rsa",
  module: "co-so-mat-ma",
  title: "Mã bất đối xứng RSA",
  shortTitle: "RSA",
  subtitle: "Cặp khóa công khai và riêng, phép lũy thừa modulo",
  blurb: "RSA tách khóa thành hai phần: công khai để mã hóa, riêng để giải mã. Bài theo chân quá trình sinh khóa từ hai số nguyên tố, phép lũy thừa modulo, ví dụ số nhỏ và những lỗi padding khiến RSA thực tế bị phá.",
  duration: "12 phút",
  level: "Trung cấp",
  tags: ["RSA", "public key", "modulo", "OAEP", "signature"],
  metrics: [
    { key: "n", label: "Modulus", tone: "blue" },
    { key: "e", label: "Số mũ e", tone: "yellow" },
    { key: "d", label: "Khóa riêng d", tone: "violet" },
    { key: "size", label: "Kích thước", tone: "green" }
  ],
  nodes: [
    { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Người gửi", sub: "cần gửi thông điệp" },
    { id: "key", type: "key", x: 340, y: 80, w: 200, h: 70, label: "Khóa công khai", sub: "(e, n) = (65537, n)" },
    { id: "code", type: "code", x: 625, y: 80, w: 200, h: 70, label: "Mã hóa", sub: "c = m^e mod n" },
    { id: "gen", type: "server", x: 340, y: 195, w: 200, h: 70, label: "Sinh khóa", sub: "p, q nguyên tố 1024 bit" },
    { id: "private", type: "audit", x: 55, y: 310, w: 200, h: 70, label: "Khóa riêng", sub: "d giữ bí mật" },
    { id: "check", type: "check", x: 340, y: 310, w: 200, h: 70, label: "Giải mã", sub: "m = c^d mod n" },
    { id: "signal", type: "signal", x: 625, y: 310, w: 200, h: 70, label: "Bản mã", sub: "256 byte với n 2048 bit" }
  ],
  edges: [
    { id: "user-key", from: "user", to: "key", kind: "request", label: "lấy khóa" },
    { id: "key-code", from: "key", to: "code", kind: "data", label: "e, n" },
    { id: "code-signal", from: "code", to: "signal", kind: "data", label: "gửi đi" },
    { id: "signal-check", from: "signal", to: "check", kind: "request", label: "nhận" },
    { id: "private-check", from: "private", to: "check", kind: "data", label: "d" },
    { id: "gen-key", from: "gen", to: "key", kind: "data", label: "n = p x q" },
    { id: "gen-private", from: "gen", to: "private", kind: "control", label: "tính d" }
  ],
  learn: [
    "Khóa công khai (e, n) mã hóa, khóa riêng d giải mã.",
    "Modulus n là tích hai số nguyên tố lớn, khó phân tích.",
    "Mã hóa là lũy thừa modulo, giải mã dùng số mũ nghịch đảo.",
    "RSA thực tế bắt buộc có đệm OAEP hoặc PSS."
  ],
  steps: [
    {
      short: "Hai khóa",
      type: "concept",
      title: "Công khai một nửa",
      body: "RSA dùng hai khóa liên quan bằng toán học: khóa công khai <code>(e, n)</code> mã hóa, khóa riêng <code>d</code> giải mã. Ai cũng có thể gửi bí mật cho chủ khóa, nhưng chỉ chủ khóa đọc được. Modulus <code>n</code> là tích của hai số nguyên tố lớn <code>p</code> và <code>q</code>; tách <code>n</code> trở lại thành <code>p</code>, <code>q</code> là bài toán khó. Với <code>n</code> 2048 bit, tức 256 byte, phép phân tích tốt nhất đã công bố mới xử lý được 829 bit vào năm 2020. Số mũ công khai thường chọn <code>65537</code> vì nhỏ, chỉ có hai bit 1, nên mã hóa nhanh mà vẫn an toàn khi dùng đệm đúng.",
      focus: ["user", "key", "private"],
      edges: ["user-key", "key-code"],
      metrics: { n: "2048 bit", e: "65537", d: "giữ kín", size: "256 byte" },
      changes: ["Cặp khóa được tách hai vai", "Modulus công khai nhưng khó phân tích"],
      note: "Độ dài modulus quyết định chi phí phá khóa, không phải độ dài số mũ e."
    },
    {
      short: "Sinh khóa",
      type: "flow",
      title: "Từ hai số nguyên tố",
      body: "Sinh khóa bắt đầu bằng hai số nguyên tố ngẫu nhiên 1024 bit. Tính <code>n = p x q</code> được modulus 2048 bit, rồi <code>phi(n) = (p - 1)(q - 1)</code>. Chọn <code>e = 65537</code> nguyên tố cùng nhau với <code>phi(n)</code>, sau đó tính <code>d = e^-1 mod phi(n)</code> bằng thuật toán Euclid mở rộng. Cặp <code>(e, n)</code> công khai, còn <code>d</code> phải giữ kín và có thể lưu kèm <code>p</code>, <code>q</code> để giải mã nhanh hơn. Nếu ai đó có <code>phi(n)</code>, họ tính được <code>d</code> ngay, nên <code>p</code> và <code>q</code> cũng là bí mật. Quy trình chuẩn dùng số ngẫu nhiên từ nguồn đủ mạnh.",
      focus: ["gen", "key", "private"],
      edges: ["gen-key", "gen-private"],
      metrics: { n: "2048 bit", e: "65537", d: "tính một lần", size: "256 byte" },
      changes: ["Sinh xong p và q 1024 bit", "Tính được d từ phi(n)"],
      note: "Giữ p và q bí mật không kém d, vì biết chúng là tính lại được khóa riêng."
    },
    {
      short: "Ví dụ nhỏ",
      type: "detail",
      title: "Tính tay với n = 3233",
      body: "Ví dụ nhỏ với <code>p = 61</code>, <code>q = 53</code> cho <code>n = 3233</code> và <code>phi(n) = 3120</code>. Chọn <code>e = 17</code>, Euclid mở rộng cho <code>d = 2753</code> vì <code>17 x 2753 = 46801</code> chia 3120 dư 1. Mã hóa chữ <code>m = 65</code>: <code>c = 65^17 mod 3233 = 2790</code>. Giải mã <code>2790^2753 mod 3233</code> trả lại đúng 65. Ví dụ này chỉ để kiểm tra công thức; <code>n = 3233</code> bị phân tích trong vài phép chia. Với <code>n</code> 2048 bit, khóa công khai dài 256 byte và mỗi phép lũy thừa cần khoảng 2048 phép bình phương có modulo.",
      focus: ["code", "signal", "check"],
      edges: ["key-code", "code-signal", "signal-check", "private-check"],
      metrics: { n: "3233", e: "17", d: "2753", size: "12 bit" },
      changes: ["Bản rõ 65 thành bản mã 2790", "Giải mã trả lại đúng 65"],
      note: "Số nhỏ giúp kiểm tra công thức, nhưng tuyệt đối không dùng cho dữ liệu thật."
    },
    {
      short: "Đệm",
      type: "pitfall",
      title: "RSA thô rất dễ gãy",
      body: "RSA thô, không đệm, có nhiều lỗi chết người. Nếu bản rõ nhỏ và <code>e = 3</code>, kẻ tấn công lấy căn bậc ba của bản mã mà không cần khóa. Nếu cùng bản rõ gửi cho ba người với ba modulus và <code>e = 3</code>, định lý số dư Trung Hoa khôi phục được nội dung. Bản rõ <code>0</code> hoặc <code>1</code> luôn cho bản mã <code>0</code> hoặc <code>1</code>. Vì vậy chuẩn dùng <code>OAEP</code> cho mã hóa và <code>PSS</code> cho chữ ký, thêm chuỗi ngẫu nhiên trước khi lũy thừa. Khóa 1024 bit đã bị coi là yếu; nên dùng tối thiểu 2048 bit, tốt hơn 3072 bit cho dữ liệu cần bảo vệ lâu dài.",
      focus: ["code", "key", "signal"],
      edges: ["key-code", "code-signal"],
      metrics: { n: "2048 bit", e: "65537", d: "giữ kín", size: "256 byte" },
      changes: ["Thêm OAEP trước khi mã hóa", "Nâng modulus lên 2048 bit"],
      note: "Không bao giờ dùng RSA thô cho dữ liệu, kể cả khi chỉ mã hóa một khóa phiên."
    },
    {
      short: "Tổng kết",
      type: "final",
      tone: "final",
      title: "Chậm nhưng giải được trao khóa",
      body: "Tổng kết: RSA ghép hai số nguyên tố thành modulus, công khai <code>(e, n)</code> và giữ kín <code>d</code>. Mã hóa là <code>c = m^e mod n</code>, giải mã là <code>m = c^d mod n</code>; ví dụ 61 và 53 cho <code>n = 3233</code>, <code>e = 17</code>, <code>d = 2753</code>. An toàn thực tế đến từ modulus đủ lớn, đệm OAEP hoặc PSS và bảo vệ khóa riêng. RSA chậm hơn AES hàng nghìn lần, nên giao thức thực tế chỉ dùng RSA để trao khóa phiên, còn dữ liệu mã hóa bằng AES. Bài cuối chuyển sang hàm băm, thành phần không thể thiếu của chữ ký và lưu mật khẩu.",
      focus: "all",
      edges: "all",
      metrics: { n: "2048 bit", e: "65537", d: "giữ kín", size: "256 byte" },
      changes: ["Chốt cặp khóa và đệm chuẩn", "Thấy vai trò trao khóa phiên"],
      note: "RSA không mã hóa hàng loạt dữ liệu; nó bọc khóa phiên rồi AES làm phần còn lại."
    }
  ]
};

window.CRYPTOLAB.lessons["ham-bam"] = {
  id: "ham-bam",
  module: "co-so-mat-ma",
  title: "Hàm băm và mật khẩu",
  shortTitle: "Hàm băm",
  subtitle: "Đầu ra cố định, một chiều và salt chống bảng tra",
  blurb: "Hàm băm biến dữ liệu dài thành dấu vân tay cố định, nhưng không thay thế mã hóa. Bài phân biệt băm nhanh với băm mật khẩu, chỉ ra cách salt và Argon2id chặn bảng tra và giải thích vì sao MD5 đã lỗi thời.",
  duration: "12 phút",
  level: "Cơ bản",
  tags: ["hash", "SHA-256", "salt", "Argon2", "collision"],
  metrics: [
    { key: "bits", label: "Độ dài ra", tone: "blue" },
    { key: "speed", label: "Tốc độ", tone: "yellow" },
    { key: "salt", label: "Salt", tone: "green" },
    { key: "risk", label: "Rủi ro", tone: "coral" }
  ],
  nodes: [
    { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Mật khẩu", sub: "matkhau123" },
    { id: "code", type: "code", x: 340, y: 80, w: 200, h: 70, label: "Băm", sub: "SHA-256, 64 ký tự hex" },
    { id: "salt", type: "key", x: 625, y: 80, w: 200, h: 70, label: "Salt", sub: "16 byte ngẫu nhiên" },
    { id: "alert", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "Bảng tra", sub: "MD5 bẻ trong giây" },
    { id: "check", type: "check", x: 55, y: 310, w: 200, h: 70, label: "So khớp", sub: "so sánh hằng thời gian" },
    { id: "disk", type: "disk", x: 340, y: 310, w: 200, h: 70, label: "Cơ sở dữ liệu", sub: "lưu salt và bản băm" },
    { id: "signal", type: "signal", x: 625, y: 310, w: 200, h: 70, label: "Bản băm", sub: "32 byte cố định" }
  ],
  edges: [
    { id: "user-code", from: "user", to: "code", kind: "request", label: "gửi" },
    { id: "salt-code", from: "salt", to: "code", kind: "data", label: "trộn" },
    { id: "code-signal", from: "code", to: "signal", kind: "data", label: "32 byte" },
    { id: "signal-disk", from: "signal", to: "disk", kind: "data", label: "lưu" },
    { id: "disk-check", from: "disk", to: "check", kind: "request", label: "đọc" },
    { id: "check-user", from: "check", to: "user", kind: "response", label: "cho vào" },
    { id: "alert-code", from: "alert", to: "code", kind: "control", label: "đối chiếu" }
  ],
  learn: [
    "Hàm băm cho đầu ra cố định, một chiều và nhạy với từng bit.",
    "Băm nhanh như SHA-256 không phù hợp để lưu mật khẩu.",
    "Salt riêng cho từng tài khoản vô hiệu hóa bảng tra.",
    "Argon2id chậm có chủ đích và tốn bộ nhớ để chặn vét cạn."
  ],
  steps: [
    {
      short: "Dấu vân tay",
      type: "concept",
      title: "Đầu ra luôn 256 bit",
      body: "Hàm băm nhận dữ liệu dài tùy ý và trả về chuỗi cố định: SHA-256 luôn cho 256 bit, tức 32 byte hay 64 ký tự hex. Ba tính chất cần nhớ là một chiều, chống va chạm và hiệu ứng tuyết lở. Một chiều nghĩa là từ bản băm không dựng lại được đầu vào; chống va chạm nghĩa là rất khó tìm hai đầu vào khác nhau cho cùng kết quả. Đổi một ký tự trong câu cũng làm khoảng một nửa số bit đầu ra đổi. Ví dụ băm <code>abc</code> cho <code>ba7816bf...</code>, còn <code>abd</code> cho một chuỗi hoàn toàn khác. Băm không phải mã hóa vì không có khóa để giải ngược.",
      focus: ["user", "code", "signal"],
      edges: ["user-code", "code-signal"],
      metrics: { bits: "256 bit", speed: "1 tỉ/giây", salt: "chưa có", risk: "cao" },
      changes: ["Mật khẩu dài thành bản băm 32 byte", "Không thể đảo ngược bản băm"],
      note: "Băm đúng nghĩa không có khóa giải; đừng nhầm với mã hóa đối xứng."
    },
    {
      short: "Salt",
      type: "flow",
      title: "Mỗi tài khoản một salt",
      body: "Lưu mật khẩu đúng cách không dùng <code>SHA-256</code> trần. Máy GPU có thể thử khoảng một tỉ phép băm SHA-256 mỗi giây, nên mật khẩu 8 ký tự chữ thường bị vét cạn trong vài phút. Thay vào đó, mỗi tài khoản có salt ngẫu nhiên 16 byte, rồi chạy hàm chậm có tham số như Argon2id với 64 MiB bộ nhớ, ba vòng lặp và một luồng. Cơ sở dữ liệu lưu thuật toán, tham số, salt và bản băm. Khi đăng nhập, hệ thống đọc các tham số cũ, băm lại mật khẩu nhập vào rồi so sánh. Salt khác nhau khiến hai người cùng mật khẩu có bản băm khác nhau, vô hiệu hóa bảng tra dựng sẵn.",
      focus: ["salt", "code", "signal", "disk"],
      edges: ["salt-code", "code-signal", "signal-disk"],
      metrics: { bits: "256 bit", speed: "64 MiB", salt: "16 byte", risk: "thấp" },
      changes: ["Salt 16 byte được sinh riêng", "Bản ghi lưu thuật toán và tham số"],
      note: "Salt không cần bí mật, chỉ cần ngẫu nhiên và duy nhất cho từng tài khoản."
    },
    {
      short: "So khớp",
      type: "detail",
      title: "Đăng nhập không lộ thời gian",
      body: "Kiểm tra mật khẩu phải dùng so sánh hằng thời gian như <code>hmac.compare_digest</code> trong Python, không dùng <code>==</code> để tránh rò rỉ thời gian. Salt không cần giữ bí mật, nhưng phải ngẫu nhiên và duy nhất cho từng tài khoản; salt 16 byte đủ để trùng lặp gần như không xảy ra. Tham số công việc nên tăng theo phần cứng: Argon2id cấu hình tối thiểu 19 MiB, hai vòng, một luồng theo khuyến nghị OWASP, còn mức 64 MiB và ba vòng phù hợp máy chủ hiện đại. Khi người dùng đăng nhập thành công với tham số cũ, hệ thống nên băm lại bằng tham số mạnh hơn và ghi đè bản ghi.",
      focus: ["disk", "check", "user"],
      edges: ["disk-check", "check-user"],
      metrics: { bits: "256 bit", speed: "3 vòng", salt: "16 byte", risk: "thấp" },
      changes: ["So sánh không rò rỉ thời gian", "Tham số cũ được nâng cấp"],
      note: "So sánh chuỗi thường dừng ở ký tự khác đầu tiên, nên thời gian chạy tiết lộ vị trí sai."
    },
    {
      short: "Lỗi thời",
      type: "pitfall",
      title: "MD5, SHA-1 và bảng cầu vồng",
      body: "<code>MD5</code> và <code>SHA-1</code> đã gãy: MD5 bị tạo va chạm từ năm 2004, SHA-1 bị công bố va chạm thực tế năm 2017 với chi phí khoảng 110.000 USD GPU. Va chạm không chỉ là chuyện học thuật: kẻ tấn công có thể làm giả chứng chỉ hoặc tệp cập nhật. Với mật khẩu, lỗi phổ biến khác là băm không salt, cho phép bảng cầu vồng tra hàng triệu mật khẩu trong vài giây. Bcrypt chỉ nhận tối đa 72 byte đầu vào, nên mật khẩu dài bị cắt âm thầm nếu không xử lý trước. Đừng tự chế hàm băm lặp; hãy dùng Argon2id, scrypt hoặc bcrypt đúng tham số.",
      focus: ["alert", "code", "disk"],
      edges: ["alert-code", "signal-disk"],
      metrics: { bits: "128 bit", speed: "1 tỉ/giây", salt: "không", risk: "rất cao" },
      changes: ["Bảng tra khớp hàng loạt", "Thuật toán cũ bị loại bỏ"],
      note: "Va chạm phá chữ ký và chứng chỉ; băm nhanh không salt phá mật khẩu."
    },
    {
      short: "Tổng kết",
      type: "final",
      tone: "final",
      title: "Băm đúng việc",
      body: "Tổng kết: hàm băm cho dấu vân tay cố định 256 bit với <code>SHA-256</code>, một chiều và nhạy với từng bit thay đổi. Với mật khẩu, không dùng băm nhanh; hãy dùng Argon2id kèm salt 16 byte, tham số 64 MiB và ba vòng, rồi so sánh hằng thời gian. Salt chặn bảng tra, tham số chậm chặn vét cạn, còn việc nâng tham số định kỳ giữ hệ thống theo kịp phần cứng. Bốn bài đầu đã khép vòng: mã cổ điển, mã đối xứng, mã bất đối xứng và hàm băm. Phòng mô phỏng sẽ dùng chính các con số này để chấm cấu hình của bạn.",
      focus: "all",
      edges: "all",
      metrics: { bits: "256 bit", speed: "64 MiB", salt: "16 byte", risk: "thấp" },
      changes: ["Chốt cấu hình băm mật khẩu", "Sẵn sàng vào phòng mô phỏng"],
      note: "Băm bảo vệ toàn vẹn và mật khẩu, không thay thế mã hóa dữ liệu."
    }
  ]
};

window.CRYPTOLAB.practice.push(
  {
    tag: "CLASSIC",
    title: "Bức thư dịch ba bước",
    scenario: "Trong một bài tập câu lạc bộ, nhóm nhận được chuỗi <code>DWWDFNDWGDZQ</code> dài 12 chữ cái và biết đây là kết quả của mã Caesar. Một bạn đoán khóa bằng 3 vì chữ <code>D</code> xuất hiện hai lần ở đầu và cho rằng bản rõ phải bắt đầu bằng <code>A</code>. Nhóm còn tranh luận nên thử toàn bộ 26 khóa hay dùng tần suất chữ để đoán nhanh hơn. Trước khi nộp, họ cần chọn cách chứng minh khóa đúng và nêu giới hạn an toàn của mã Caesar trong báo cáo.",
    metrics: [
      { label: "Bản mã", value: "12 chữ" },
      { label: "Không gian khóa", value: "26" },
      { label: "Thời gian thử", value: "Dưới 1 giây" }
    ],
    options: [
      "Giữ khóa 3 vì chữ D quay về A, không cần kiểm tra thêm.",
      "Thử cả 26 khóa, đối chiếu kết quả với tiếng Việt hoặc tiếng Anh để chọn bản rõ đúng.",
      "Tăng khóa lên 30 để vượt khỏi bảng chữ và làm bản mã khó đoán hơn.",
      "Bỏ qua bản mã vì Caesar không thể giải khi chưa biết khóa."
    ],
    correct: 1,
    explain: "Khóa 3 tình cờ đúng, nhưng suy luận từ một chữ không đủ chứng minh. Với Caesar, chỉ có 26 khóa, nên thử vét cạn rồi đối chiếu từng kết quả với ngôn ngữ là cách chắc chắn và nhanh. Khóa 30 tương đương khóa 4 sau khi modulo 26, không làm tăng không gian khóa. Bỏ bản mã là sai vì khóa luôn nằm trong 26 khả năng. Quy trình đúng gồm giải mã đủ 26 lần, chấm điểm từng bản rõ theo từ điển, rồi chọn bản có nhiều từ hợp lệ. Báo cáo cũng nên ghi rõ 26 khóa chỉ tương đương 4,7 bit, không đủ an toàn."
  },
  {
    tag: "AES",
    title: "Ảnh bị lộ mẫu",
    scenario: "Một nhóm phát triển ứng dụng lưu ảnh căn cước và chọn AES-128 mode ECB vì mã nguồn ngắn và chạy nhanh. Khi kiểm thử, hai ảnh chụp cùng phông nền cho ra tệp mã hóa có vùng giống nhau, nhìn vẫn đoán được bố cục. Nhóm cân nhắc đổi sang CBC với IV cố định để tương thích thiết bị cũ, hoặc chuyển hẳn sang GCM và cấp nonce ngẫu nhiên cho từng tệp. Thời hạn bàn giao còn ba ngày, dữ liệu đã có khoảng 40.000 ảnh cần mã hóa lại.",
    metrics: [
      { label: "Mode", value: "ECB", danger: true },
      { label: "Khóa", value: "128 bit" },
      { label: "Ảnh cần đổi", value: "40.000" }
    ],
    options: [
      "Giữ ECB nhưng tăng khóa lên 256 bit để che các vùng giống nhau.",
      "Đổi sang CBC và dùng một IV cố định cho mọi ảnh để dễ giải mã.",
      "Chuyển sang AES-GCM, dùng nonce 12 byte ngẫu nhiên riêng cho từng tệp.",
      "Nén ảnh trước khi mã hóa ECB để giảm kích thước tệp."
    ],
    correct: 2,
    explain: "ECB mã hóa từng khối 128 bit độc lập, nên hai khối giống nhau cho hai khối mã giống nhau và để lộ bố cục ảnh. Tăng khóa lên 256 bit không sửa được cấu trúc này. CBC che mẫu nhưng IV cố định khiến hai lần mã hóa cùng ảnh cho cùng kết quả, đồng thời CBC không có xác thực. GCM vừa mã hóa vừa tạo thẻ 16 byte, phát hiện sửa đổi, với điều kiện nonce 12 byte không lặp lại dưới cùng khóa. Nén trước không xóa các vùng trùng lặp đủ lớn. Vì vậy phương án đúng là chuyển GCM và mã hóa lại 40.000 ảnh."
  },
  {
    tag: "HASH",
    title: "Cơ sở dữ liệu cũ",
    scenario: "Một hệ thống tuyển sinh dùng MD5 không salt để lưu mật khẩu của 120.000 tài khoản từ năm 2012. Sau sự cố rò rỉ, nhóm phát hiện nhiều bản băm trùng nhau và một số mật khẩu tra được trên bảng cầu vồng công khai trong vài giây. Họ có ba lựa chọn: giữ nguyên và bắt người dùng đổi mật khẩu, băm lại một lần bằng SHA-256, hoặc chuyển sang Argon2id kèm salt riêng. Thời gian bảo trì cho phép chạy nền vài giờ, nhưng không được khóa đăng nhập của sinh viên.",
    metrics: [
      { label: "Tài khoản", value: "120.000", danger: true },
      { label: "Thuật toán", value: "MD5", danger: true },
      { label: "Salt", value: "Không" }
    ],
    options: [
      "Giữ MD5, chỉ nhắc người dùng đặt mật khẩu dài hơn 12 ký tự.",
      "Băm lại bằng SHA-256 một lần, không cần salt vì SHA-256 đủ mạnh.",
      "Chuyển sang Argon2id với salt 16 byte, băm lại khi người dùng đăng nhập.",
      "Mã hóa các bản băm MD5 bằng AES để che chúng khỏi kẻ tấn công."
    ],
    correct: 2,
    explain: "MD5 không còn kháng va chạm và tốc độ băm quá cao, nên bảng cầu vồng tra được hàng triệu mật khẩu. SHA-256 trần vẫn nhanh và không salt, kẻ tấn công dựng lại bảng tra cho từng bản băm. Argon2id là hàm chậm có tham số bộ nhớ, kèm salt 16 byte duy nhất, khiến mỗi lần thử tốn hàng chục mili giây và không thể tra chéo. Chiến lược đúng là băm lại dần khi người dùng đăng nhập, không khóa tài khoản, đồng thời đặt lại mật khẩu cho tài khoản không hoạt động. AES chỉ che dữ liệu chứ không sửa được điểm yếu gốc."
  }
);

window.CRYPTOLAB.cheatsheets.push({
  id: "classic",
  num: "01",
  title: "Mã cổ điển & khóa",
  intro: "Một trang tra nhanh mã cổ điển và cách chọn khóa: công thức Caesar, lệnh openssl cho AES và băm, đoạn Python cho salt, bảng so sánh thuật toán và checklist trước khi triển khai.",
  cards: [
    {
      title: "Caesar và Vigenère bằng Python",
      wide: true,
      html: `<p>Dịch vòng 26 chữ, giữ nguyên ký tự ngoài bảng; Vigenère lặp khóa theo từng chữ.</p>
<pre><code class="language-python">def caesar(text, k):
    out = []
    for ch in text:
        if ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            out.append(chr((ord(ch) - base + k) % 26 + base))
        else:
            out.append(ch)
    return "".join(out)

def vigenere(text, key, decrypt=False):
    out = []
    ki = 0
    for ch in text:
        if ch.isalpha():
            shift = ord(key[ki % len(key)].upper()) - ord("A")
            if decrypt:
                shift = -shift
            out.append(caesar(ch, shift))
            ki += 1
        else:
            out.append(ch)
    return "".join(out)

print(caesar("ATTACKATDAWN", 3))
print(caesar("DWWDFNDWGDZQ", -3))
print(vigenere("LXFOPVEFRNHR", "LEMON", True))</code></pre>`
    },
    {
      title: "AES và băm với openssl",
      html: `<p>Mã hóa tệp bằng AES-256-CBC có PBKDF2, rồi kiểm tra toàn vẹn bằng HMAC-SHA256. Không dùng ECB.</p>
<pre><code class="language-bash"># Sinh 32 byte ngẫu nhiên cho khóa
openssl rand -hex 32

# Mã hóa AES-256-CBC, salt + PBKDF2
openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt \\
  -in ro.txt -out ro.enc

# Giải mã
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \\
  -in ro.enc -out ro.txt

# Băm tệp và MAC bằng khóa
openssl dgst -sha256 -hmac "khoa-bi-mat" ro.txt</code></pre>
<p>GCM nên dùng thư viện có API xác thực thay vì <code>openssl enc</code>.</p>`
    },
    {
      title: "Bảng so sánh thuật toán",
      wide: true,
      html: `<table class="cheat-table">
<thead><tr><th>Thuật toán</th><th>Loại</th><th>Khóa / đầu ra</th><th>Tốc độ</th><th>Dùng khi</th></tr></thead>
<tbody>
<tr><td>Caesar</td><td>Thay thế</td><td>26 khóa</td><td>Tức thời</td><td>Học khái niệm</td></tr>
<tr><td>AES-256</td><td>Khối 128 bit</td><td>256 bit</td><td>Rất nhanh</td><td>Mã hóa dữ liệu</td></tr>
<tr><td>RSA-2048</td><td>Bất đối xứng</td><td>2048 bit</td><td>Chậm</td><td>Trao khóa, chữ ký</td></tr>
<tr><td>SHA-256</td><td>Băm</td><td>256 bit</td><td>Nhanh</td><td>Toàn vẹn, chữ ký</td></tr>
<tr><td>Argon2id</td><td>Băm mật khẩu</td><td>32 byte + salt</td><td>Chậm có chủ đích</td><td>Lưu mật khẩu</td></tr>
</tbody>
</table>`
    },
    {
      title: "Salt và so sánh bằng Python",
      html: `<p>Mỗi tài khoản một salt 16 byte; lưu tham số cùng bản băm để nâng cấp sau này.</p>
<pre><code class="language-python">import hashlib
import hmac
import secrets

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=2**14,
        r=8,
        p=1,
        dklen=32,
    )
    return "scrypt$16384$8$1$" + salt.hex() + "$" + digest.hex()

def verify_password(password: str, stored: str) -> bool:
    algo, n, r, p, salt_hex, digest_hex = stored.split("$")
    calc = hashlib.scrypt(
        password.encode("utf-8"),
        salt=bytes.fromhex(salt_hex),
        n=int(n),
        r=int(r),
        p=int(p),
        dklen=32,
    )
    return hmac.compare_digest(calc.hex(), digest_hex)</code></pre>
<p><code>hashlib.scrypt</code> có sẵn trong thư viện chuẩn; Argon2id cần gói <code>argon2-cffi</code>.</p>`
    },
    {
      title: "Checklist chọn khóa",
      html: `<ul class="cheat-check">
<li>Dữ liệu lớn: AES-256-GCM, nonce 12 byte không lặp dưới cùng khóa.</li>
<li>Trao khóa hoặc chữ ký: RSA tối thiểu 2048 bit, thêm OAEP hoặc PSS.</li>
<li>Lưu mật khẩu: Argon2id 64 MiB, ba vòng, salt 16 byte cho từng tài khoản.</li>
<li>Toàn vẹn tệp: SHA-256 hoặc SHA-3, không dùng MD5 và SHA-1.</li>
<li>Khóa đối xứng: 256 bit sinh từ nguồn ngẫu nhiên mật mã.</li>
<li>Không tái sử dụng IV, nonce hoặc khóa giữa các phiên.</li>
<li>Ghi thuật toán và tham số cạnh bản băm để nâng cấp dần.</li>
</ul>`
    }
  ]
});
