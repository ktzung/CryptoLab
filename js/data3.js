/* CryptoLab — phần 3: module thực hành an toàn, tình huống và cheatsheet cấu hình */
(function () {
  var root = window.CRYPTOLAB;
  if (!root) {
    root = window.CRYPTOLAB = {};
  }
  root.modules = root.modules || [];
  root.lessons = root.lessons || {};
  root.practice = root.practice || [];
  root.cheatsheets = root.cheatsheets || [];

  root.modules.push({
    id: "thuc-hanh",
    num: "03",
    tone: "yellow",
    title: "Thực hành an toàn",
    blurb: "Bốn bài thực hành ghép thành một quy trình: băm mật khẩu bằng hàm chậm có salt, chọn mode AES có xác thực, giữ nonce không lặp, và nhận diện padding oracle trước khi bị khai thác. Mỗi bài có sơ đồ, số liệu và checklist áp dụng ngay.",
    lessons: ["mat-khau", "mode-aes", "nonce", "tan-cong"]
  });

  root.lessons["mat-khau"] = {
    id: "mat-khau",
    module: "thuc-hanh",
    title: "Băm mật khẩu đúng cách",
    shortTitle: "Băm mật khẩu",
    subtitle: "Từ MD5 thô đến Argon2id có salt",
    blurb: "Mật khẩu người dùng chỉ nên tồn tại dưới dạng băm chậm có salt. Bài này đi từ lỗi lưu MD5 thô đến cấu hình Argon2id 64 MiB, cách đặt pepper và so sánh hằng thời gian để không tự tạo lỗ hổng mới.",
    duration: "12 phút",
    level: "Cơ bản",
    tags: ["băm mật khẩu", "Argon2id", "salt", "pepper", "timing-safe"],
    metrics: [
      { key: "algo", label: "Thuật toán", tone: "blue" },
      { key: "salt", label: "Salt", tone: "green" },
      { key: "params", label: "Tham số", tone: "yellow" },
      { key: "speed", label: "Tốc độ thử", tone: "coral" }
    ],
    nodes: [
      { id: "user", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Người dùng", sub: "nhập mật khẩu" },
      { id: "auth", type: "server", x: 340, y: 80, w: 200, h: 70, label: "Máy chủ xác thực", sub: "so sánh hằng thời gian" },
      { id: "salt", type: "key", x: 625, y: 80, w: 200, h: 70, label: "Salt 16 byte", sub: "CSPRNG mỗi tài khoản" },
      { id: "db", type: "disk", x: 340, y: 310, w: 200, h: 70, label: "Cơ sở dữ liệu", sub: "hash 32 byte + salt" },
      { id: "argon", type: "code", x: 625, y: 310, w: 200, h: 70, label: "Argon2id", sub: "64 MiB, t=3" },
      { id: "gate", type: "check", x: 55, y: 310, w: 200, h: 70, label: "Đăng nhập", sub: "đúng thì cấp phiên" },
      { id: "thief", type: "alert", x: 340, y: 195, w: 200, h: 70, label: "Kẻ tấn công", sub: "bảng tra MD5 sẵn" }
    ],
    edges: [
      { id: "user-auth", from: "user", to: "auth", kind: "request", label: "mật khẩu" },
      { id: "auth-salt", from: "auth", to: "salt", kind: "control", label: "sinh salt" },
      { id: "salt-argon", from: "salt", to: "argon", kind: "data", label: "salt + pass" },
      { id: "argon-db", from: "argon", to: "db", kind: "data", label: "hash 32 byte" },
      { id: "db-gate", from: "db", to: "gate", kind: "data", label: "hash đã lưu" },
      { id: "gate-user", from: "gate", to: "user", kind: "response", label: "cấp phiên" },
      { id: "thief-db", from: "thief", to: "db", kind: "data", label: "đánh cắp" }
    ],
    learn: [
      "Không lưu mật khẩu thô, không mã hóa hai chiều thay băm.",
      "Salt 16 byte riêng cho từng tài khoản, sinh bằng CSPRNG.",
      "Argon2id 64 MiB, 3 vòng, song song 1, hash 32 byte.",
      "So sánh hash bằng timingSafeEqual và đặt pepper trong KMS."
    ],
    steps: [
      {
        short: "Vì sao phải băm",
        type: "concept",
        title: "Không bao giờ lưu mật khẩu thô",
        body: "Khi người dùng đăng ký, máy chủ chỉ nên lưu kết quả của một hàm băm một chiều, không bao giờ lưu mật khẩu gốc. Vấn đề là <code>MD5</code> và <code>SHA-1</code> được thiết kế để chạy nhanh: một card đồ họa hiện đại thử được khoảng 1 tỉ phép băm MD5 mỗi giây, nên mật khẩu 8 ký tự có thể bị quét hết trong vài giờ. Hàm băm mật khẩu phải chậm có chủ đích và tốn bộ nhớ, để mỗi phép thử có chi phí thật. bcrypt, scrypt và Argon2id được tạo ra cho đúng mục tiêu đó. Hệ quả là cùng một mật khẩu, kẻ tấn công phải trả giá bằng thời gian và RAM, còn người dùng vẫn đăng nhập dưới một giây.",
        focus: ["user", "auth", "db", "thief"],
        edges: ["user-auth", "argon-db", "thief-db"],
        metrics: { algo: "MD5", salt: "không", params: "1 vòng", speed: "1 tỉ/giây" },
        changes: [
          "Bảng người dùng không còn chứa mật khẩu gốc.",
          "Mỗi lần đăng nhập chỉ so sánh hash, không giải mã."
        ],
        note: "Nếu bản sao lưu bị lộ, hash chậm là lớp giảm thiệt hại cuối cùng."
      },
      {
        short: "Salt 16 byte",
        type: "flow",
        title: "Salt 16 byte cho từng tài khoản",
        body: "Salt là chuỗi ngẫu nhiên sinh riêng cho mỗi bản ghi, thường 16 byte tức 128 bit, lưu công khai ngay cạnh hash. Khi có salt, cùng một mật khẩu ở hai tài khoản cho hai hash khác nhau, nên bảng tra sẵn và rainbow table cho 10 triệu mật khẩu phổ biến trở nên vô dụng. Salt không cần bí mật, nhưng phải ngẫu nhiên thật: dùng <code>crypto.randomBytes(16)</code> hoặc nguồn CSPRNG của hệ điều hành. Không dùng email hay số thứ tự làm salt. bcrypt tự gộp salt vào chuỗi lưu, còn Argon2id nhận salt như một tham số riêng. Salt không chống được đoán mật khẩu yếu, vì kẻ tấn công vẫn thử từng ứng viên với salt đã biết.",
        focus: ["salt", "auth", "argon"],
        edges: ["auth-salt", "salt-argon"],
        metrics: { algo: "MD5 + salt", salt: "16 byte", params: "1 vòng", speed: "1 tỉ/giây" },
        changes: [
          "Hai tài khoản cùng mật khẩu sinh hai hash khác nhau.",
          "Bảng tra sẵn 10 triệu mục không còn dùng lại được."
        ],
        note: "Salt công khai là bình thường; salt cố định mới là lỗi."
      },
      {
        short: "Chọn tham số",
        type: "detail",
        title: "Argon2id và tham số nên chọn",
        body: "<code>Argon2id</code> là lựa chọn mặc định hiện nay vì kết hợp kháng tấn công kênh bên và tốn bộ nhớ. Cấu hình tối thiểu theo OWASP là 19 MiB, 2 vòng lặp, song song 1, hash 32 byte; mức thoải mái hơn là 64 MiB, 3 vòng. Tham số phải đo trên máy chủ thật: mục tiêu khoảng 100 đến 250 ms mỗi lần đăng nhập, đủ chậm cho kẻ tấn công mà không làm người dùng chờ. Với bcrypt, cost 12 tương đương khoảng 250 ms trên một lõi CPU. Hãy ghi tham số vào chính chuỗi hash để sau này tăng cost mà không phá tài khoản cũ. Đừng tự đặt cost 4 cho nhanh, vì như vậy gần như vô hiệu hóa toàn bộ lớp bảo vệ.",
        focus: ["argon", "auth", "salt"],
        edges: ["salt-argon", "argon-db"],
        metrics: { algo: "Argon2id", salt: "16 byte", params: "64 MiB, t=3", speed: "~15/giây" },
        changes: [
          "Mỗi phép băm chiếm 64 MiB RAM thay vì vài chục byte.",
          "Thời gian đăng nhập tăng lên khoảng 150 ms, vẫn dưới ngưỡng 300 ms."
        ],
        note: "Đo lại tham số sau mỗi lần đổi máy chủ hoặc tăng tải."
      },
      {
        short: "Ba lỗi nhỏ",
        type: "pitfall",
        title: "Pepper, so sánh và giới hạn đầu vào",
        body: "Ba lỗi nhỏ thường gặp. Thứ nhất, so sánh hash bằng <code>==</code> trong một vòng lặp có thể rò rỉ thời gian; hãy dùng <code>crypto.timingSafeEqual</code>. Thứ hai, pepper là khóa bí mật bọc hoặc mã hóa hash, phải nằm trong KMS chứ không nằm trong cùng bảng người dùng, và cần phương án xoay vòng. Thứ ba, đừng mã hóa mật khẩu bằng AES hai chiều rồi lưu: ai có khóa là đọc được toàn bộ. Ngoài ra bcrypt chỉ dùng 72 byte đầu, nên cần giới hạn độ dài đầu vào và chuẩn hóa Unicode trước khi băm. Mỗi lỗi nhỏ như vậy có thể làm mất phần lớn lợi ích của Argon2id.",
        focus: ["auth", "user", "gate"],
        edges: ["user-auth", "gate-user"],
        metrics: { algo: "Argon2id", salt: "16 byte", params: "pepper KMS", speed: "~15/giây" },
        changes: [
          "Phép so sánh chuyển sang thời gian hằng, không lộ tiền tố đúng.",
          "Pepper tách khỏi cơ sở dữ liệu, xoay vòng độc lập."
        ],
        note: "Pepper không thay salt; hai lớp bảo vệ giải quyết hai rủi ro khác nhau."
      },
      {
        short: "Checklist",
        type: "final",
        title: "Checklist lưu mật khẩu",
        tone: "final",
        body: "Chốt lại bằng checklist áp dụng được ngay. Một: dùng Argon2id 64 MiB, 3 vòng, song song 1, hash 32 byte, salt 16 byte ngẫu nhiên cho từng tài khoản. Hai: đo thời gian băm trên máy chủ thật, giữ trong khoảng 100 đến 250 ms. Ba: lưu tham số cùng hash để nâng cấp dần. Bốn: đặt pepper trong KMS và có kế hoạch xoay vòng. Năm: so sánh bằng <code>timingSafeEqual</code>, trả lỗi đăng nhập giống nhau cho mọi trường hợp. Sáu: giới hạn số lần thử theo tài khoản và theo IP. Bảy: không ghi mật khẩu vào log. Tám: kiểm thử bằng bộ mật khẩu yếu và đo lại sau mỗi lần đổi tham số.",
        focus: "all",
        edges: "all",
        metrics: { algo: "Argon2id", salt: "16 byte", params: "64 MiB, t=3", speed: "~15/giây" },
        changes: [
          "Toàn bộ tài khoản dùng một chính sách băm có tham số ghi kèm.",
          "Có quy trình xoay pepper và nâng cost mà không khóa người dùng."
        ],
        note: "Mật khẩu vẫn là mắt xích yếu nhất; hãy bật thêm xác thực hai lớp."
      }
    ]
  };

  root.lessons["mode-aes"] = {
    id: "mode-aes",
    module: "thuc-hanh",
    title: "Chọn mode AES",
    shortTitle: "Mode AES",
    subtitle: "ECB, CBC và GCM khác nhau ở đâu",
    blurb: "ECB, CBC và GCM không tương đương. Bài này so sánh ba mode theo mẫu lộ, xác thực và chi phí, rồi chốt cấu hình AES-256-GCM với nonce 96 bit, tag 128 bit cho dữ liệu cần toàn vẹn.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["AES-256", "GCM", "CBC", "ECB", "AEAD"],
    metrics: [
      { key: "mode", label: "Mode", tone: "blue" },
      { key: "nonce", label: "Nonce", tone: "violet" },
      { key: "tag", label: "Tag", tone: "green" },
      { key: "risk", label: "Rủi ro", tone: "coral" }
    ],
    nodes: [
      { id: "app", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Ứng dụng", sub: "gửi bản rõ" },
      { id: "key", type: "key", x: 340, y: 80, w: 200, h: 70, label: "Khóa AES-256", sub: "32 byte từ KMS" },
      { id: "nonce", type: "signal", x: 625, y: 80, w: 200, h: 70, label: "Nonce 96 bit", sub: "bộ đếm, không lặp" },
      { id: "gcm", type: "code", x: 55, y: 310, w: 200, h: 70, label: "AES-256-GCM", sub: "mã hóa có xác thực" },
      { id: "pack", type: "layers", x: 340, y: 310, w: 200, h: 70, label: "Bản mã + tag", sub: "gửi trên mạng" },
      { id: "recv", type: "server", x: 625, y: 310, w: 200, h: 70, label: "Bên nhận", sub: "kiểm tag trước" }
    ],
    edges: [
      { id: "app-gcm", from: "app", to: "gcm", kind: "request", label: "bản rõ" },
      { id: "key-gcm", from: "key", to: "gcm", kind: "data", label: "khóa 256 bit" },
      { id: "nonce-gcm", from: "nonce", to: "gcm", kind: "data", label: "nonce 96 bit" },
      { id: "gcm-pack", from: "gcm", to: "pack", kind: "data", label: "bản mã" },
      { id: "pack-recv", from: "pack", to: "recv", kind: "data", label: "gói tin" },
      { id: "key-recv", from: "key", to: "recv", kind: "data", label: "khóa chia sẻ" }
    ],
    learn: [
      "ECB lộ mẫu vì mã hóa từng khối độc lập.",
      "CBC cần IV ngẫu nhiên 16 byte và vẫn phải thêm MAC.",
      "GCM là AEAD: nonce 96 bit, tag 128 bit, chạy song song.",
      "Mặc định mới nên là AES-256-GCM, không dùng ECB cho dữ liệu thật."
    ],
    steps: [
      {
        short: "Ba mode",
        type: "concept",
        title: "Ba mode, ba mức bảo vệ",
        body: "<code>ECB</code> mã hóa từng khối 16 byte độc lập, nên hai khối giống nhau cho hai bản mã giống nhau; ảnh và bảng dữ liệu lộ nguyên hình mẫu. CBC móc xích khối trước vào khối sau bằng IV, che được mẫu nhưng không có xác thực, kẻ tấn công vẫn sửa được bản mã. GCM là mode có xác thực: mã hóa và sinh tag 128 bit trên cùng dữ liệu, mọi thay đổi dù chỉ một bit đều bị từ chối. Với dữ liệu mới, mặc định nên là AES-256-GCM. ECB chỉ còn chỗ trong bài tập, không dùng cho dữ liệu thật. Bài này cho thấy chi phí của từng lựa chọn, không chỉ tên gọi.",
        focus: ["app", "gcm", "pack"],
        edges: ["app-gcm", "gcm-pack"],
        metrics: { mode: "ECB", nonce: "không", tag: "không", risk: "lộ mẫu" },
        changes: [
          "Hai khối giống nhau không còn cho bản mã giống nhau.",
          "Yêu cầu xác thực được đưa vào tiêu chí chọn mode."
        ],
        note: "ECB không có IV và không có tag; đó là hai thiếu sót cấu trúc."
      },
      {
        short: "Nonce và tag",
        type: "flow",
        title: "Nonce 96 bit và tag 128 bit",
        body: "Trong GCM, nonce 96 bit là đầu vào bắt buộc cùng khóa; với mỗi khóa, nonce phải khác nhau. Nonce không cần bí mật nhưng phải duy nhất: có thể là bộ đếm tăng dần hoặc 12 byte ngẫu nhiên. Tag xác thực dài 128 bit được gắn vào bản mã, bên nhận kiểm tag trước khi dùng dữ liệu. Quy trình đúng là: chọn khóa 256 bit từ KMS, sinh nonce, gọi <code>createCipheriv</code>, lấy cả bản mã và tag, gửi kèm nonce. Bên nhận lặp lại với cùng khóa và nonce, so tag bằng phép so sánh hằng thời gian. Thiếu một trong ba thành phần khóa, nonce, tag là không giải mã được.",
        focus: ["key", "nonce", "gcm"],
        edges: ["key-gcm", "nonce-gcm"],
        metrics: { mode: "GCM", nonce: "96 bit", tag: "128 bit", risk: "thấp" },
        changes: [
          "Mỗi bản tin có nonce riêng và tag 16 byte đi kèm.",
          "Bên nhận từ chối dữ liệu trước khi đọc bản rõ."
        ],
        note: "Nonce 96 bit là kích thước GCM tối ưu; dài hơn phải qua bước dẫn xuất."
      },
      {
        short: "So sánh",
        type: "detail",
        title: "So sánh ECB, CBC và GCM",
        body: "ECB có ưu điểm duy nhất là đơn giản và song song hóa hoàn toàn, nhưng lộ mẫu nên bị loại. CBC cần IV ngẫu nhiên 16 byte cho mỗi bản tin và mã hóa tuần tự, chậm hơn khi dữ liệu lớn; muốn an toàn phải ghép thêm <code>HMAC</code> theo kiểu encrypt-then-MAC với hai khóa riêng. GCM chạy song song, thêm 16 byte tag, phù hợp mạng và tệp lớn, nhưng nhạy với lặp nonce. Với tệp 2 GB, GCM thường nhanh hơn CBC nhờ tăng tốc phần cứng AES-NI và không cần bước MAC riêng. Đánh đổi chính là kỷ luật nonce: GCM không tha cho một lần lặp, còn CBC tha cho IV trùng nhưng lại thiếu xác thực.",
        focus: ["gcm", "pack", "recv"],
        edges: ["gcm-pack", "pack-recv"],
        metrics: { mode: "GCM", nonce: "96 bit", tag: "128 bit", risk: "thấp" },
        changes: [
          "Bỏ CBC tự ghép MAC, giảm một khóa và một lượt đọc dữ liệu.",
          "Tệp 2 GB được mã hóa song song theo từng đoạn."
        ],
        note: "Nếu buộc dùng CBC, hãy mã hóa trước rồi mới MAC trên IV và bản mã."
      },
      {
        short: "Bốn lỗi",
        type: "pitfall",
        title: "Bốn lỗi cấu hình thường gặp",
        body: "Lỗi thứ nhất là dùng ECB cho ảnh căn cước hoặc bảng lương, rồi ngạc nhiên vì bản mã nhìn ra hình. Lỗi thứ hai là CBC với IV cố định, khiến hai bản tin giống nhau cho bản mã giống nhau. Lỗi thứ ba là GCM nhưng tái sử dụng nonce, phá cả bí mật lẫn tag. Lỗi thứ tư là tự ghép mã hóa và kiểm tra toàn vẹn sai thứ tự, ví dụ tính MAC rồi mới mã hóa. Cách chặn gọn nhất: chọn <code>AEAD</code> có sẵn, sinh nonce bằng CSPRNG, giới hạn số bản tin mỗi khóa dưới 2^32, và kiểm tag trước khi giải mã. Đừng tự thiết kế lược đồ mã hóa.",
        focus: ["nonce", "gcm", "recv"],
        edges: ["nonce-gcm", "pack-recv"],
        metrics: { mode: "GCM", nonce: "lặp", tag: "bị phá", risk: "cao" },
        changes: [
          "Không còn IV cố định hoặc nonce dùng lại trong mã nguồn.",
          "Thứ tự kiểm tra được cố định: xác thực trước, giải mã sau."
        ],
        note: "Một nonce lặp trong GCM là sự cố bảo mật, không phải cảnh báo nhỏ."
      },
      {
        short: "Cấu hình chốt",
        type: "final",
        title: "Cấu hình AES mặc định",
        tone: "final",
        body: "Chốt cấu hình nên dùng: AES-256-GCM, khóa 32 byte sinh từ CSPRNG hoặc KMS, nonce 96 bit duy nhất cho từng bản tin, tag 128 bit, kiểm tag trước khi dùng bản rõ. Với mỗi khóa, giới hạn dưới 2^32 bản tin để biên an toàn của GCM còn hiệu lực. Nếu hệ thống bắt buộc CBC, hãy dùng IV ngẫu nhiên 16 byte và <code>HMAC-SHA-256</code> trên IV cùng bản mã với khóa riêng. Lưu thuật toán và tham số trong metadata để xoay khóa. Kiểm thử bằng cách sửa một bit bản mã: bên nhận phải từ chối. Ghi lại mọi lần lặp nonce là sự cố bảo mật, không phải lỗi nhỏ.",
        focus: "all",
        edges: "all",
        metrics: { mode: "GCM", nonce: "96 bit", tag: "128 bit", risk: "thấp" },
        changes: [
          "Toàn bộ luồng mới dùng AEAD, metadata ghi rõ thuật toán.",
          "Có hạn mức bản tin mỗi khóa và lịch xoay khóa."
        ],
        note: "Kiểm thử sửa một bit là bài kiểm tra rẻ nhất cho mọi cấu hình AEAD."
      }
    ]
  };

  root.lessons["nonce"] = {
    id: "nonce",
    module: "thuc-hanh",
    title: "Nonce không được lặp",
    shortTitle: "Nonce",
    subtitle: "Tái sử dụng nonce phá GCM thế nào",
    blurb: "Nonce lặp phá cả bí mật lẫn toàn vẹn của GCM. Bài này dựng lại phép XOR hai bản mã, chỉ ra vì sao tag không cứu được, và đưa quy tắc cấp nonce 96 bit bằng bộ đếm có lưu bền.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["nonce", "IV", "GCM", "tái sử dụng", "bộ đếm"],
    metrics: [
      { key: "nonce", label: "Nonce", tone: "violet" },
      { key: "reuse", label: "Lặp nonce", tone: "yellow" },
      { key: "leak", label: "Rò rỉ", tone: "coral" },
      { key: "fix", label: "Cách chặn", tone: "green" }
    ],
    nodes: [
      { id: "device", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Thiết bị gửi", sub: "hai bản tin" },
      { id: "nonce", type: "signal", x: 340, y: 80, w: 200, h: 70, label: "Nonce 96 bit", sub: "lặp ở bản tin 2" },
      { id: "key", type: "key", x: 625, y: 80, w: 200, h: 70, label: "Khóa phiên", sub: "dùng cho cả hai" },
      { id: "c1", type: "page", x: 55, y: 310, w: 200, h: 70, label: "Bản mã C1", sub: "C1 = P1 xor KS" },
      { id: "c2", type: "page", x: 625, y: 310, w: 200, h: 70, label: "Bản mã C2", sub: "C2 = P2 xor KS" },
      { id: "leak", type: "alert", x: 340, y: 310, w: 200, h: 70, label: "Lộ XOR bản rõ", sub: "P1 xor P2" },
      { id: "gcm", type: "code", x: 340, y: 195, w: 200, h: 70, label: "AES-GCM", sub: "mã hóa hai lần" }
    ],
    edges: [
      { id: "device-gcm", from: "device", to: "gcm", kind: "request", label: "P1, P2" },
      { id: "nonce-gcm", from: "nonce", to: "gcm", kind: "data", label: "nonce lặp" },
      { id: "key-gcm", from: "key", to: "gcm", kind: "data", label: "khóa 256 bit" },
      { id: "gcm-c1", from: "gcm", to: "c1", kind: "data", label: "C1" },
      { id: "gcm-c2", from: "gcm", to: "c2", kind: "data", label: "C2" },
      { id: "c1-leak", from: "c1", to: "leak", kind: "data", label: "C1 xor C2" },
      { id: "c2-leak", from: "c2", to: "leak", kind: "data", label: "C1 xor C2" }
    ],
    learn: [
      "Nonce 96 bit phải duy nhất theo từng khóa, không chỉ ngẫu nhiên.",
      "Lặp nonce làm lộ P1 xor P2 mà không cần khóa.",
      "Với GCM, lặp nonce còn cho phép khôi phục khóa xác thực và giả mạo tag.",
      "Bộ đếm phải được ghi bền trước khi mã hóa và cấp dải riêng cho từng nút."
    ],
    steps: [
      {
        short: "Nonce là gì",
        type: "concept",
        title: "Nonce và yêu cầu duy nhất",
        body: "Nonce là số dùng một lần, trong GCM dài 96 bit, đi cùng khóa để tạo dòng khóa cho mỗi bản tin. Với cùng một khóa, hai bản tin dùng chung nonce sẽ sinh cùng dòng khóa, nên chỉ cần XOR hai bản mã là triệt tiêu dòng khóa và còn lại XOR của hai bản rõ. Với <code>AES-GCM</code>, hậu quả nặng hơn: khóa xác thực nội bộ có thể bị khôi phục, kẻ tấn công giả mạo tag cho bản tin tùy ý. Vì vậy nonce không cần bí mật nhưng tuyệt đối phải duy nhất theo từng khóa. IV của CBC cũng cần ngẫu nhiên, nhưng CBC không sụp đổ hoàn toàn khi IV trùng; GCM thì có.",
        focus: ["nonce", "key", "gcm"],
        edges: ["nonce-gcm", "key-gcm"],
        metrics: { nonce: "96 bit", reuse: "0 lần", leak: "không", fix: "bộ đếm" },
        changes: [
          "Nonce được xem là bộ phận của khóa, không phải tham số phụ.",
          "Tài liệu ghi rõ miền duy nhất của nonce theo từng khóa."
        ],
        note: "Nonce không bí mật; tính duy nhất mới là thứ bảo vệ dòng khóa."
      },
      {
        short: "Hai bản tin",
        type: "flow",
        title: "Hai bản tin, một nonce",
        body: "Giả sử thiết bị gửi hai bản tin P1 và P2, cùng khóa K, cùng nonce N. GCM sinh cùng dòng khóa, nên C1 bằng P1 XOR dòng khóa và C2 bằng P2 XOR dòng khóa. Kẻ tấn công có cả hai bản mã chỉ cần tính <code>C1 XOR C2</code> là được P1 XOR P2, không cần khóa. Nếu P1 là văn bản có cấu trúc, ví dụ JSON có trường cố định, phần lớn P2 lộ ra ngay. Với 1 triệu bản ghi dùng lại nonce, toàn bộ tương quan giữa các bản rõ bị lộ. Đây là lý do thư viện tốt tự sinh nonce ngẫu nhiên 96 bit cho mỗi lần mã hóa thay vì để mặc định.",
        focus: ["device", "nonce", "gcm", "c1", "c2"],
        edges: ["device-gcm", "nonce-gcm", "gcm-c1", "gcm-c2"],
        metrics: { nonce: "96 bit", reuse: "2 lần", leak: "P1 xor P2", fix: "chưa có" },
        changes: [
          "Hai bản mã chia sẻ một dòng khóa, phép XOR triệt tiêu dòng khóa.",
          "Cấu trúc JSON giúp đoán phần lớn nội dung P2."
        ],
        note: "Chỉ cần một cặp bản mã lặp nonce là đủ để bắt đầu phân tích."
      },
      {
        short: "Tag không cứu",
        type: "detail",
        title: "Tag không cứu được nonce lặp",
        body: "Nhiều người nghĩ tag 128 bit sẽ phát hiện bản tin giả, nên nonce lặp chỉ lộ bí mật chứ không cho giả mạo. Thực tế GCM dẫn xuất khóa xác thực từ khóa chính và nonce; khi nonce lặp, hai lần dùng cùng một khóa xác thực, kẻ tấn công thu được hai cặp bản mã và tag, từ đó giải hệ phương trình trong trường <code>GF(2^128)</code> để lấy khóa xác thực. Sau khi có khóa này, họ tự tạo tag hợp lệ cho bản tin bất kỳ, nên tính toàn vẹn cũng mất. Vì vậy trong GCM, tái sử dụng nonce là sự cố nghiêm trọng nhất, không phải lỗi nhỏ về ngẫu nhiên.",
        focus: ["nonce", "gcm", "c2"],
        edges: ["nonce-gcm", "gcm-c2"],
        metrics: { nonce: "96 bit", reuse: "2 lần", leak: "khóa tag lộ", fix: "chưa có" },
        changes: [
          "Tag 128 bit không còn được coi là lá chắn tuyệt đối.",
          "Sự cố nonce được xếp vào nhóm phải xoay khóa ngay."
        ],
        note: "Hai cặp bản mã và tag cùng nonce là đủ nguyên liệu cho phép giải hệ."
      },
      {
        short: "Bộ đếm reset",
        type: "pitfall",
        title: "Vì sao bộ đếm hay bị reset",
        body: "Nonce ngẫu nhiên 96 bit có xác suất trùng cực nhỏ, khoảng 2^-32 sau <code>2^32</code> bản tin, nhưng nhiều hệ thống lại dùng nonce tất định. Bộ đếm tất định chỉ an toàn nếu được lưu bền trước khi mã hóa. Sự cố thường gặp: tiến trình khởi động lại, bộ đếm về 0, nonce cũ được phát lại; hoặc hai máy chủ cùng cấp nonce từ một dải. Cách chặn là cấp dải riêng cho từng nút, ghi bộ đếm xuống đĩa trước khi dùng, và từ chối khởi động nếu trạng thái không đọc được. Với khóa ngắn hạn, xoay khóa sau 2^32 bản tin cũng giới hạn thiệt hại.",
        focus: ["device", "nonce", "gcm"],
        edges: ["device-gcm", "nonce-gcm"],
        metrics: { nonce: "bộ đếm", reuse: "sau reset", leak: "nguy cơ", fix: "lưu bền" },
        changes: [
          "Bộ đếm được ghi bền và cấp dải riêng cho từng nút.",
          "Khởi động lại không còn phát lại nonce cũ."
        ],
        note: "Mất trạng thái bộ đếm thì phải xoay khóa, không được đoán tiếp."
      },
      {
        short: "Quy tắc cấp",
        type: "final",
        title: "Quy tắc cấp nonce",
        tone: "final",
        body: "Chốt quy tắc: một khóa, một không gian nonce, không bao giờ lặp. Với GCM, dùng nonce 96 bit; hoặc sinh ngẫu nhiên bằng CSPRNG, hoặc dùng bộ đếm được lưu bền và cấp dải riêng cho từng nút. Trước khi mã hóa, ghi trạng thái bộ đếm; nếu ghi thất bại thì dừng. Xoay khóa sau <code>2^32</code> bản tin, hoặc sớm hơn nếu nghi ngờ. Không dùng lại nonce sau khi khôi phục sao lưu. Ghi log mã nonce đã dùng ở mức kiểm toán để phát hiện trùng. Kiểm thử tự động: chạy hai lần mã hóa và khẳng định nonce khác nhau. Nếu phát hiện lặp, xoay khóa ngay và coi dữ liệu cũ đã bị lộ.",
        focus: "all",
        edges: "all",
        metrics: { nonce: "96 bit", reuse: "0 lần", leak: "không", fix: "bộ đếm + KMS" },
        changes: [
          "Có hạn mức bản tin mỗi khóa và lịch xoay khóa rõ ràng.",
          "Kiểm thử tự động bắt được nonce trùng trước khi phát hành."
        ],
        note: "Xoay khóa là cách duy nhất chặn thiệt hại khi nghi ngờ nonce đã lặp."
      }
    ]
  };

  root.lessons["tan-cong"] = {
    id: "tan-cong",
    module: "thuc-hanh",
    title: "Tấn công chọn bản mã",
    shortTitle: "Tấn công",
    subtitle: "Padding oracle và hai lớp phòng thủ",
    blurb: "Padding oracle biến một thông báo lỗi thành kênh rò rỉ từng byte. Bài này lần theo chuỗi 256 phép thử cho mỗi byte, cách kẻ tấn công ghép bản rõ, và hai lớp phòng thủ: AEAD và mã lỗi đồng nhất.",
    duration: "12 phút",
    level: "Trung cấp",
    tags: ["padding oracle", "CBC", "AEAD", "mã lỗi", "chọn bản mã"],
    metrics: [
      { key: "oracle", label: "Oracle", tone: "coral" },
      { key: "leak", label: "Rò rỉ", tone: "yellow" },
      { key: "tries", label: "Phép thử", tone: "violet" },
      { key: "fix", label: "Cách chặn", tone: "green" }
    ],
    nodes: [
      { id: "attacker", type: "alert", x: 55, y: 80, w: 200, h: 70, label: "Kẻ tấn công", sub: "sửa byte bản mã" },
      { id: "api", type: "api", x: 340, y: 80, w: 200, h: 70, label: "API giải mã", sub: "trả mã lỗi" },
      { id: "code", type: "code", x: 625, y: 80, w: 200, h: 70, label: "AES-CBC", sub: "padding PKCS#7" },
      { id: "shield", type: "server", x: 55, y: 310, w: 200, h: 70, label: "Mã lỗi chung", sub: "một câu 400" },
      { id: "page", type: "page", x: 340, y: 310, w: 200, h: 70, label: "Bản rõ lộ dần", sub: "từng byte cuối" },
      { id: "oracle", type: "signal", x: 625, y: 310, w: 200, h: 70, label: "Oracle padding", sub: "hợp lệ hay không" },
      { id: "result", type: "star", x: 340, y: 195, w: 200, h: 70, label: "Byte đoán được", sub: "1 bit rò rỉ" }
    ],
    edges: [
      { id: "attacker-api", from: "attacker", to: "api", kind: "request", label: "byte sửa", bow: 22 },
      { id: "api-attacker", from: "api", to: "attacker", kind: "response", label: "lỗi 500", bow: -22 },
      { id: "api-code", from: "api", to: "code", kind: "control", label: "giải mã" },
      { id: "code-oracle", from: "code", to: "oracle", kind: "data", label: "padding sai" },
      { id: "oracle-result", from: "oracle", to: "result", kind: "data", label: "1 bit" },
      { id: "result-page", from: "result", to: "page", kind: "data", label: "ghép byte" },
      { id: "api-shield", from: "api", to: "shield", kind: "control", label: "trả lỗi chung", bow: 40 }
    ],
    learn: [
      "PKCS#7 báo lỗi khác nhau tạo ra oracle một bit.",
      "CBC cho phép sửa khối trước để điều khiển bản rõ khối sau.",
      "Trung bình 128 phép thử cho mỗi byte bản rõ cần đoán.",
      "Dùng AEAD và một mã lỗi chung để xóa oracle."
    ],
    steps: [
      {
        short: "Oracle là gì",
        type: "concept",
        title: "Padding oracle hình thành thế nào",
        body: "<code>PKCS#7</code> đệm bản rõ cho đủ khối 16 byte: nếu thiếu k byte thì thêm k byte có giá trị k. Khi giải mã, thư viện kiểm tra đệm và báo lỗi nếu sai. Nếu ứng dụng trả hai thông báo khác nhau cho đệm sai và đệm đúng, kẻ tấn công có một oracle: một bit thông tin cho mỗi bản mã họ gửi. Với CBC, sửa một byte trong khối trước sẽ làm thay đổi một byte trong bản rõ khối sau theo kiểu XOR. Kết hợp hai điều này, họ dò được từng byte bản rõ mà không cần khóa. Lỗi nằm ở thông báo, không nằm ở AES.",
        focus: ["api", "code", "oracle"],
        edges: ["api-code", "code-oracle"],
        metrics: { oracle: "có", leak: "1 bit/lần", tries: "256/byte", fix: "chưa" },
        changes: [
          "Hai nhánh lỗi đệm bị tách thành hai phản hồi quan sát được.",
          "Mỗi yêu cầu sai đệm trở thành một bit thông tin."
        ],
        note: "Oracle không cần trả bản rõ; chỉ cần phân biệt được đúng và sai."
      },
      {
        short: "256 phép thử",
        type: "flow",
        title: "256 phép thử cho một byte",
        body: "Giả sử kẻ tấn công muốn đoán byte cuối của khối bản rõ thứ hai. Họ chặn khối bản mã <code>C1</code>, sửa byte cuối của khối trước, rồi gửi lại toàn bộ bản mã. Với mỗi giá trị từ 0 đến 255, họ quan sát API trả lỗi đệm hay không. Khi tìm được giá trị làm đệm hợp lệ, họ suy ra byte cuối bản rõ, vì phép XOR giữa byte sửa và byte gốc là tuyến tính. Trung bình cần 128 phép thử, tối đa 256 cho mỗi byte. Với bản rõ 1 KB, tức 64 khối, số yêu cầu có thể lên tới hơn trăm nghìn, đủ để hoàn tất trong vài giờ nếu API không giới hạn.",
        focus: ["attacker", "api", "oracle"],
        edges: ["attacker-api", "api-attacker", "code-oracle"],
        metrics: { oracle: "có", leak: "byte cuối", tries: "128 trung bình", fix: "chưa" },
        changes: [
          "Mỗi byte cần tối đa 256 yêu cầu thay vì thử toàn bộ khóa.",
          "API không giới hạn tần suất trở thành điều kiện thuận lợi."
        ],
        note: "Không cần biết khóa; chỉ cần biết đệm đúng hay sai."
      },
      {
        short: "Ghép bản rõ",
        type: "detail",
        title: "Ghép dần cả bản rõ",
        body: "Sau khi biết byte cuối, kẻ tấn công sửa thêm byte áp chót để đệm hợp lệ có độ dài 2, rồi lặp lại quá trình. Mỗi vòng chỉ cần thay đổi khối trước, không chạm khóa. Với CBC, việc sửa <code>C1</code> ảnh hưởng trực tiếp tới P2 nhưng làm hỏng P1; kẻ tấn công thường chỉ cần khối cuối hoặc chấp nhận mất một khối. Sau khoảng 128 phép thử mỗi byte, họ ghép được toàn bộ thông điệp, ví dụ token phiên hoặc email. Nếu ứng dụng dùng cùng khóa cho nhiều phiên, thiệt hại lan rộng. Đây là tấn công chọn bản mã thích nghi: mỗi kết quả định hướng lần thử sau.",
        focus: ["oracle", "result", "page"],
        edges: ["oracle-result", "result-page"],
        metrics: { oracle: "có", leak: "cả khối", tries: "~128/byte", fix: "chưa" },
        changes: [
          "Bản rõ được ghép từng byte, không cần khóa giải mã.",
          "Token phiên và email trở thành mục tiêu có giá trị."
        ],
        note: "Tấn công thích nghi: mỗi phản hồi thu hẹp không gian đoán của byte kế."
      },
      {
        short: "Lỗi và log",
        type: "pitfall",
        title: "Mã lỗi riêng và log chi tiết",
        body: "Lỗi phổ biến là trả về 500 cho đệm sai và 400 cho JSON sai, hoặc ghi log khác nhau cho hai trường hợp. Chỉ cần chênh lệch vài mili giây cũng đủ làm oracle. Cách chặn: bọc toàn bộ quá trình giải mã, kiểm tra định dạng và kiểm tra xác thực trong một khối, chỉ trả một mã lỗi chung. Không log chi tiết lỗi giải mã ra ngoài. Nếu buộc dùng CBC, hãy kiểm HMAC trước khi giải mã, theo thứ tự <code>encrypt-then-MAC</code>. Tốt hơn là chuyển sang AES-GCM hoặc ChaCha20-Poly1305 để thư viện xử lý cả hai việc. Đừng tự viết phần đệm.",
        focus: ["api", "shield", "oracle"],
        edges: ["api-shield", "code-oracle"],
        metrics: { oracle: "bị chặn", leak: "không", tries: "không áp dụng", fix: "mã lỗi chung" },
        changes: [
          "Mọi nhánh giải mã trả cùng một mã lỗi và cùng thời gian xử lý.",
          "Log chi tiết chỉ ghi nội bộ, không trả ra ngoài."
        ],
        note: "Chênh lệch thời gian vài mili giây cũng đủ để dựng lại oracle."
      },
      {
        short: "Phòng thủ",
        type: "final",
        title: "Phòng thủ padding oracle",
        tone: "final",
        body: "Chốt lại: đừng để lộ bất kỳ khác biệt nào giữa đệm sai và đệm đúng. Dùng AEAD như <code>AES-256-GCM</code>, kiểm tag trước khi dùng bản rõ, và trả cùng một lỗi cho mọi trường hợp hỏng. Với CBC cũ, chuyển sang encrypt-then-MAC với HMAC-SHA-256 và hai khóa riêng. Giới hạn tần suất theo IP và theo tài khoản để 256 phép thử mỗi byte trở nên đắt. Ghi log nội bộ nhưng không trả chi tiết ra ngoài. Kiểm thử bằng cách sửa một byte bản mã và xác nhận phản hồi giống hệt trường hợp dữ liệu hỏng thông thường. Rà soát toàn bộ chỗ giải mã, kể cả job nền.",
        focus: "all",
        edges: "all",
        metrics: { oracle: "bị chặn", leak: "không", tries: "bị giới hạn", fix: "AEAD" },
        changes: [
          "Toàn bộ luồng giải mã đi qua một hàm bọc duy nhất.",
          "Phản hồi lỗi và thời gian xử lý được kiểm thử giống nhau."
        ],
        note: "AEAD xóa oracle cấu trúc; mã lỗi chung xóa oracle quan sát được."
      }
    ]
  };

  root.practice.push({
    tag: "PASSWORD",
    title: "Băm lại mật khẩu sau rò rỉ MD5",
    scenario: "Một dịch vụ học trực tuyến bị rò rỉ bảng người dùng. Nhật ký cho thấy mỗi bản ghi lưu chuỗi 32 ký tự hex do MD5 sinh ra, không có salt, còn mật khẩu của phần lớn học viên là tên cộng năm sinh. Kẻ tấn công đã dựng bảng tra cho 10 triệu mật khẩu phổ biến trong 6 giờ. Nhóm kỹ thuật phải viết lại phần đăng nhập trong một tuần, vẫn dùng PostgreSQL, vẫn cần đăng nhập dưới 300 ms, và ngân sách GPU gần như bằng không. Bạn được giao chọn cách băm mới cho 120.000 tài khoản đang hoạt động.",
    metrics: [
      { label: "Thuật toán hiện tại", value: "MD5", danger: true },
      { label: "Salt", value: "0 byte", danger: true },
      { label: "Tài khoản", value: "120.000" }
    ],
    options: [
      "Giữ MD5 nhưng thêm salt 16 byte cho từng tài khoản",
      "Đổi sang SHA-256 lặp 1 lần với salt 16 byte",
      "Dùng Argon2id 64 MiB, t=3, p=1 và salt 16 byte cho mỗi tài khoản",
      "Mã hóa mật khẩu bằng AES-256-GCM rồi lưu bản mã"
    ],
    correct: 2,
    explain: "MD5 và SHA-256 chạy quá nhanh: GPU thử hàng tỉ phép băm mỗi giây, nên mật khẩu tên cộng năm sinh bị quét hết trong vài giờ. Salt 16 byte chỉ vô hiệu hóa bảng tra sẵn, không chặn việc thử từng ứng viên. AES là mã hóa hai chiều, ai có khóa là đọc được mật khẩu, nên không dùng thay băm. Argon2id 64 MiB, 3 vòng, song song 1 khiến mỗi phép thử tốn 64 MiB RAM, khoảng 15 đến 60 ms, nên 10 triệu ứng viên trở nên đắt. 120.000 tài khoản băm lại dần khi đăng nhập. Đặt pepper trong KMS để thêm một lớp."
  });

  root.practice.push({
    tag: "MODE",
    title: "Chọn mode cho kho ảnh căn cước",
    scenario: "Một ngân hàng số lưu ảnh căn cước của khách trong kho đối tượng S3, mỗi ngày khoảng 2 GB tệp mới. Yêu cầu: dữ liệu phải mã hóa khi nghỉ, mọi thay đổi trên tệp phải bị phát hiện trước khi hiển thị cho nhân viên, và khóa phải xoay vòng hàng quý mà không giải mã lại toàn bộ kho. Nhóm hạ tầng đang cân nhắc bốn phương án, tất cả dùng AES-256 và đều có thể chạy trên CPU hiện có. Một kiểm toán viên nhắc lại sự cố ảnh bị lộ mẫu do mode cũ. Bạn chọn phương án nào cho luồng ghi tệp mới?",
    metrics: [
      { label: "Dữ liệu mới", value: "2 GB/ngày" },
      { label: "Yêu cầu", value: "chống sửa" },
      { label: "Khóa", value: "AES-256" }
    ],
    options: [
      "ECB với khóa 256 bit, mỗi tệp một khóa",
      "CBC với IV cố định 16 byte và kiểm tra kích thước tệp",
      "GCM với nonce 96 bit ngẫu nhiên cho mỗi tệp, tag 128 bit",
      "CTR với nonce 96 bit ngẫu nhiên, không thêm tag"
    ],
    correct: 2,
    explain: "ECB lộ mẫu vì các khối giống nhau cho bản mã giống nhau, đúng sự cố trước đây. CBC với IV cố định cũng lộ tương quan, không xác thực nên không phát hiện tệp bị sửa. CTR tạo dòng khóa nhưng không có tag: kẻ tấn công lật bit bản mã là lật bit bản rõ, phá yêu cầu toàn vẹn. GCM là AEAD, sinh tag 128 bit trên toàn bộ dữ liệu, bên đọc kiểm tag trước khi hiển thị; sai một bit là từ chối. Nonce 96 bit ngẫu nhiên cho mỗi tệp, giới hạn dưới 2^32 tệp mỗi khóa, xoay khóa hàng quý. Nhớ lưu nonce và tag trong metadata."
  });

  root.cheatsheets.push({
    id: "practice",
    num: "03",
    title: "Cấu hình an toàn",
    intro: "Các tham số và checklist nên chép vào tài liệu dự án: bảng chọn mode AES, cấu hình Argon2id, quy tắc cấp nonce, lệnh kiểm tra nhanh và cách xử lý sự cố thường gặp khi triển khai.",
    cards: [
      {
        title: "Bảng chọn mode AES",
        wide: true,
        html: "<table class=\"cheat-table\"><thead><tr><th>Mode</th><th>Tính chất</th><th>Dùng khi</th><th>Tránh</th></tr></thead><tbody><tr><td class=\"mono\">ECB</td><td>Khối độc lập, lộ mẫu</td><td>Không dùng cho dữ liệu thật</td><td>Ảnh, bảng lương, tệp có cấu trúc</td></tr><tr><td class=\"mono\">CBC</td><td>IV 16 byte, không có tag</td><td>Hệ cũ, ghép encrypt-then-MAC</td><td>IV cố định, thiếu xác thực</td></tr><tr><td class=\"mono\">CTR</td><td>Dòng khóa, song song</td><td>Chỉ khi tự bọc MAC đúng</td><td>Sửa bit, nonce lặp</td></tr><tr><td class=\"mono\">GCM</td><td>AEAD, nonce 96 bit, tag 128 bit</td><td>Mặc định cho dữ liệu mới</td><td>Nonce lặp, quá 2^32 bản tin/khóa</td></tr></tbody></table>"
      },
      {
        title: "Tham số băm mật khẩu",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>echo -n \"mat-khau\" | argon2 saltsaltsaltsalt \\\n  -id -t 3 -m 16 -p 1 -l 32\n# -m 16 = 2^16 KiB = 64 MiB\n# -t 3 vong, -p 1 song song, -l 32 byte\n\nbcrypt cost 12: ~250 ms tren mot loi CPU\nMuc tieu: 100-250 ms moi lan dang nhap</code></pre></div><p>Đo trên máy chủ thật rồi mới chốt tham số; ghi tham số vào chuỗi hash.</p>"
      },
      {
        title: "Checklist chống tái sử dụng nonce",
        html: "<ul style=\"margin-top:9px;padding-left:16px;font-size:.7rem;line-height:1.55;color:var(--text-soft)\"><li>Sinh nonce 96 bit bằng CSPRNG hoặc bộ đếm lưu bền.</li><li>Mỗi khóa có không gian nonce riêng, không chia sẻ giữa các nút.</li><li>Ghi trạng thái bộ đếm trước khi mã hóa; ghi lỗi thì dừng.</li><li>Không phát lại nonce sau khi khôi phục sao lưu hay khởi động lại.</li><li>Xoay khóa trước 2^32 bản tin với GCM.</li><li>Ghi log mã nonce để kiểm toán và cảnh báo trùng.</li></ul>"
      },
      {
        title: "Kiểm tra nhanh trong mã",
        html: "<div style=\"margin-top:10px;overflow-x:auto\"><pre><code>const iv = crypto.randomBytes(12);\nconst c = crypto.createCipheriv(\n  'aes-256-gcm', key, iv\n);\nconst ct = Buffer.concat([\n  c.update(plain), c.final()\n]);\nconst tag = c.getAuthTag();\n// 12 byte nonce, 16 byte tag</code></pre></div><p>Lưu nonce và tag trong metadata của tệp để bên đọc kiểm tra.</p>"
      },
      {
        title: "Sự cố thường gặp",
        html: "<table class=\"cheat-table\"><thead><tr><th>Hiện tượng</th><th>Nguyên nhân</th><th>Xử lý</th></tr></thead><tbody><tr><td>Ảnh vẫn thấy mẫu</td><td class=\"mono\">ECB</td><td>Chuyển sang GCM, xoay khóa</td></tr><tr><td>Sửa bit vẫn nhận</td><td>Thiếu tag</td><td>Dùng AEAD, kiểm tag trước</td></tr><tr><td>Đăng nhập quá chậm</td><td>Cost quá cao</td><td>Đo lại, chỉnh tham số</td></tr><tr><td>Nonce trùng sau restart</td><td>Bộ đếm không lưu</td><td>Lưu bền, xoay khóa</td></tr></tbody></table>"
      }
    ]
  });
})();
