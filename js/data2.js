/* CryptoLab — dữ liệu khóa mật mã, phần 2: giao thức và hạ tầng khóa */
window.CRYPTOLAB = window.CRYPTOLAB || { modules: [], lessons: {}, practice: [], cheatsheets: [] };

(function () {
  "use strict";

  window.CRYPTOLAB.modules.push({
    id: "giao-thuc",
    num: "02",
    title: "Giao thức & hạ tầng khóa",
    tone: "mint",
    blurb: "Module này đi từ câu hỏi thực tế: làm sao hai máy chưa từng gặp nhau thống nhất khóa qua mạng công khai? Bạn sẽ theo một phiên TLS 1.3, đọc chuỗi chứng chỉ X.509 và kiểm tra chữ ký số bằng số liệu cụ thể.",
    lessons: ["trao-doi-khoa", "chung-chi", "tls", "chu-ky-so"]
  });

  Object.assign(window.CRYPTOLAB.lessons, {
    /* ------------------------------------------------------------------
       Bài 1: trao đổi khóa
       ------------------------------------------------------------------ */
    "trao-doi-khoa": {
      id: "trao-doi-khoa",
      module: "giao-thuc",
      title: "Trao đổi khóa",
      shortTitle: "Trao đổi khóa",
      subtitle: "Khóa phiên không bao giờ đi qua mạng: hai bên cùng tính ra nó từ những giá trị công khai. Bài này chạy tay một phép Diffie-Hellman nhỏ rồi chỉ ra chỗ kẻ nghe lén bị chặn.",
      blurb: "Diffie-Hellman cho hai máy chưa gặp nhau thống nhất khóa qua kênh công khai. Bạn tính tay với p = 23, g = 5, thấy kẻ nghe lén có A và B vẫn không suy ra K. ECDHE giữ bí mật về sau.",
      duration: "12 phút",
      level: "Cơ bản",
      tags: ["Diffie-Hellman", "ECDHE", "khóa phiên", "PFS", "kẻ nghe lén"],
      metrics: [
        { key: "p", label: "Nhóm khóa", tone: "blue" },
        { key: "a", label: "Khóa riêng a", tone: "violet" },
        { key: "session", label: "Khóa phiên", tone: "green" },
        { key: "pfs", label: "Bí mật về sau", tone: "yellow" }
      ],
      nodes: [
        { id: "aKey", type: "key", x: 55, y: 80, w: 200, h: 70, label: "Máy khách", sub: "a = 6, A = 8" },
        { id: "bKey", type: "key", x: 340, y: 80, w: 200, h: 70, label: "Máy chủ", sub: "b = 15, B = 19" },
        { id: "record", type: "layers", x: 625, y: 80, w: 200, h: 70, label: "Bản ghi TLS", sub: "mỗi gói một nonce" },
        { id: "params", type: "file", x: 55, y: 310, w: 200, h: 70, label: "Tham số chung", sub: "p = 23, g = 5" },
        { id: "attacker", type: "alert", x: 340, y: 310, w: 200, h: 70, label: "Kẻ nghe lén", sub: "thấy p, g, A, B" },
        { id: "shared", type: "shield", x: 625, y: 310, w: 200, h: 70, label: "Bí mật chung", sub: "K = 2 cho AES-GCM" }
      ],
      edges: [
        { id: "aKey-params", from: "aKey", to: "params", kind: "request", label: "xin p, g" },
        { id: "params-bKey", from: "params", to: "bKey", kind: "data", label: "p = 23, g = 5" },
        { id: "params-attacker", from: "params", to: "attacker", kind: "data", label: "A, B công khai" },
        { id: "aKey-bKey", from: "aKey", to: "bKey", kind: "request", label: "A = 8", bow: 22 },
        { id: "bKey-aKey", from: "bKey", to: "aKey", kind: "response", label: "B = 19", bow: -22 },
        { id: "aKey-shared", from: "aKey", to: "shared", kind: "data", label: "K = 2" },
        { id: "shared-record", from: "shared", to: "record", kind: "data", label: "AES-256-GCM" }
      ],
      learn: [
        "Diffie-Hellman cho hai bên tính ra cùng một khóa mà không gửi khóa đi.",
        "Chỉ giá trị công khai lên dây; khóa riêng a và b nằm lại trong bộ nhớ.",
        "Khóa phiên phải qua HKDF để tách thành nhiều khóa theo hướng và giai đoạn.",
        "Trao đổi khóa cần chứng chỉ đi kèm, nếu không kẻ đứng giữa chen được."
      ],
      steps: [
        {
          short: "Ý tưởng",
          type: "concept",
          title: "Hai bên tính chung một số mà không gửi nó đi",
          body: "Hai bên cần một sân chơi chung trước khi tính khóa. Máy chủ công bố số nguyên tố <code>p = 23</code> và phần tử sinh <code>g = 5</code>, giá trị ai cũng đọc được. Mỗi bên tự chọn khóa riêng, không gửi đi: máy khách lấy <code>a = 6</code>, máy chủ lấy <code>b = 15</code>. Từ đó họ tính giá trị công khai <code>A = g^a mod p = 8</code> và <code>B = g^b mod p = 19</code>. Chỉ A và B lên đường, còn a và b nằm lại trong bộ nhớ. Kẻ thấy p, g, A, B có tìm lại được a hoặc b không; với p nhỏ thì có, nên thực tế dùng số 2048 bit hoặc đường cong X25519.",
          focus: ["aKey", "params", "bKey"],
          edges: ["aKey-params", "params-bKey"],
          metrics: { p: "23, quá nhỏ", a: "a = 6, b = 15", session: "chưa tính", pfs: "chưa có" },
          changes: [
            "Hai bên thống nhất p và g mà không cần gặp nhau",
            "Mỗi bên giữ một khóa riêng không rời khỏi máy"
          ],
          note: "Số nguyên tố thật dài 2048 bit, còn X25519 chỉ cần 32 byte khóa riêng cho mức an toàn tương đương."
        },
        {
          short: "Trao đổi",
          type: "flow",
          title: "A và B đổi chỗ, K xuất hiện ở cả hai đầu",
          body: "Hai giá trị công khai đổi chỗ. Máy khách gửi <code>A = 8</code>, máy chủ gửi <code>B = 19</code>; kẻ nghe lén thấy cả bốn số p, g, A, B nhưng không có a hay b. Mỗi bên nâng giá trị nhận được lên khóa riêng của mình: máy khách tính <code>B^a mod p = 19^6 mod 23 = 2</code>, máy chủ tính <code>A^b mod p = 8^15 mod 23 = 2</code>. Hai phép tính khác đường nhưng ra cùng một số vì luật lũy thừa cho phép đổi chỗ số mũ. Số 2 chính là bí mật chung, và nó chưa từng xuất hiện trên dây. Đó là phép màu của trao đổi khóa: công khai đổi được, bí mật thì không.",
          focus: ["aKey", "bKey", "shared"],
          edges: ["aKey-bKey", "bKey-aKey", "aKey-shared"],
          metrics: { p: "23", a: "a = 6, b = 15", session: "K = 2", pfs: "chưa có" },
          changes: [
            "A và B đi qua kênh công khai, K thì không",
            "Hai phép lũy thừa khác nhau hội tụ về cùng một số"
          ],
          note: "Phép tính tay chỉ để hiểu cơ chế: p = 23 đủ để thử hết trong vài giây, không dùng cho thật."
        },
        {
          short: "Khóa phiên",
          type: "detail",
          title: "K = 2 chưa phải khóa, nó là nguyên liệu",
          body: "Bí mật chung không được dùng trực tiếp để mã hóa. Cả hai đưa nó vào hàm dẫn xuất khóa, ở TLS 1.3 là HKDF với nhãn như <code>c hs traffic</code>, để sinh ra khóa riêng cho từng hướng và từng giai đoạn: khóa handshake, khóa ứng dụng, cùng vector khởi tạo 12 byte cho AES-GCM. Nhờ tách nhãn, khóa dùng cho bản ghi máy khách sang máy chủ không thể dùng ngược lại. Trong ví dụ nhỏ, K = 2 quá yếu, nhưng với X25519 bí mật chung là 32 byte, tức 256 bit, đủ cho AES-256-GCM. Khóa phiên chỉ sống trong một kết nối: đóng tab là mất, mở lại là một bí mật mới.",
          focus: ["shared", "record"],
          edges: ["aKey-shared", "shared-record"],
          metrics: { p: "23", a: "đã dùng xong", session: "khóa theo hướng", pfs: "một phiên" },
          changes: [
            "Một bí mật chung tách thành khóa riêng cho từng hướng",
            "Khóa chỉ sống trong một kết nối rồi bị xóa"
          ],
          note: "Không dùng thẳng K làm khóa AES: luôn qua HKDF để mỗi mục đích có khóa riêng."
        },
        {
          short: "Kẻ đứng giữa",
          type: "pitfall",
          title: "Trao đổi khóa không tự chứng minh danh tính",
          body: "Trao đổi khóa một mình không chứng minh ai đang nói. Kẻ đứng giữa chặn A, gửi cho máy chủ giá trị <code>A' = 2</code> của mình, rồi chặn B và gửi cho máy khách <code>B' = 10</code>. Máy khách tính K1 với kẻ tấn công, máy chủ tính K2 cũng với kẻ đó, còn kẻ giải mã rồi mã hóa lại từng gói. Hai bên vẫn thấy bình thường, nhưng không hề chia sẻ khóa. Vì vậy TLS luôn ghép trao đổi khóa với chứng chỉ hoặc khóa chia sẻ trước để xác thực danh tính. Nếu máy chủ dùng khóa tĩnh và bị lộ, toàn bộ bản ghi cũ giải mã được; ECDHE tạo khóa tạm thời mỗi phiên nên hết đường.",
          focus: ["attacker", "aKey", "bKey"],
          edges: ["params-attacker", "bKey-aKey"],
          metrics: { p: "23", a: "bị thay bằng A'", session: "hai khóa lệch", pfs: "không có" },
          changes: [
            "Kẻ tấn công chen vào giữa và tạo hai phiên riêng",
            "Hai đầu tưởng an toàn nhưng không chia sẻ khóa"
          ],
          note: "Chứng chỉ hoặc PSK là thứ chặn kẻ đứng giữa; trao đổi khóa thuần túy không làm được việc đó."
        },
        {
          short: "ECDHE",
          type: "final",
          tone: "final",
          title: "Khóa tạm thời mỗi phiên bảo vệ dữ liệu đã ghi",
          body: "Thực tế không ai dùng p = 23. <code>X25519</code> dùng đường cong 255 bit, khóa riêng 32 byte, tính trong khoảng 30 micro giây trên một lõi; một máy chủ 8 lõi làm được hơn 200.000 phép mỗi giây. Vì khóa riêng được sinh mới cho từng phiên, lộ khóa dài hạn của máy chủ cũng không mở được lưu lượng cũ: đó là <code>forward secrecy</code>. TLS 1.3 bỏ hẳn trao đổi khóa bằng RSA tĩnh và chỉ cho phép nhóm đường cong hiện đại. Cái giá là mỗi phiên tốn thêm một phép tính, đổi lại dữ liệu đã ghi lại hôm nay vẫn an toàn sau nhiều năm.",
          focus: "all",
          edges: "all",
          metrics: { p: "25519", a: "sinh mỗi phiên", session: "32 byte", pfs: "có, PFS" },
          changes: [
            "Khóa tạm thời thay khóa tĩnh cho từng phiên",
            "Lộ khóa dài hạn không mở được lưu lượng cũ",
            "TLS 1.3 loại bỏ hoàn toàn trao đổi khóa bằng RSA"
          ],
          note: "Forward secrecy chỉ có khi khóa trao đổi là tạm thời: kiểm tra bộ mã có chữ ECDHE hoặc DHE."
        }
      ]
    },

    /* ------------------------------------------------------------------
       Bài 2: chứng chỉ
       ------------------------------------------------------------------ */
    "chung-chi": {
      id: "chung-chi",
      module: "giao-thuc",
      title: "Chứng chỉ số",
      shortTitle: "Chứng chỉ X.509",
      subtitle: "Chứng chỉ không phải tờ giấy chứng nhận, nó là một chữ ký nối tên miền với khóa công khai. Bài này đi từ chứng chỉ lá qua CA trung gian tới gốc trong kho tin cậy, và chỉ ra ba chỗ hay làm trình duyệt từ chối.",
      blurb: "Ba chứng chỉ, hai chữ ký và một kho tin cậy 150 gốc: cách trình duyệt biến khóa công khai thành danh tính đáng tin trong 15 mili giây, và vì sao thiếu một chứng chỉ trung gian là hỏng cả chuỗi.",
      duration: "12 phút",
      level: "Cơ bản",
      tags: ["X.509", "CA", "SAN", "OCSP", "chuỗi tin cậy"],
      metrics: [
        { key: "chain", label: "Chuỗi tin cậy", tone: "blue" },
        { key: "host", label: "Tên miền", tone: "green" },
        { key: "days", label: "Hạn còn lại", tone: "yellow" },
        { key: "revoke", label: "Trạng thái thu hồi", tone: "coral" }
      ],
      nodes: [
        { id: "browser", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Trình duyệt", sub: "gửi SNI" },
        { id: "leaf", type: "file", x: 340, y: 80, w: 200, h: 70, label: "Chứng chỉ lá", sub: "api.example.vn" },
        { id: "inter", type: "layers", x: 625, y: 80, w: 200, h: 70, label: "CA trung gian", sub: "R10, ký bởi ISRG" },
        { id: "ocsp", type: "signal", x: 55, y: 310, w: 200, h: 70, label: "OCSP", sub: "good, hạn 4 ngày" },
        { id: "store", type: "disk", x: 340, y: 310, w: 200, h: 70, label: "Kho tin cậy", sub: "150 chứng chỉ gốc" },
        { id: "root", type: "shield", x: 625, y: 310, w: 200, h: 70, label: "CA gốc", sub: "ISRG Root X1, 2035" },
        { id: "verify", type: "check", x: 340, y: 195, w: 200, h: 70, label: "Kiểm tra", sub: "SAN, hạn, chữ ký" }
      ],
      edges: [
        { id: "browser-leaf", from: "browser", to: "leaf", kind: "request", label: "SNI api.example.vn" },
        { id: "leaf-inter", from: "leaf", to: "inter", kind: "data", label: "gửi kèm chuỗi" },
        { id: "inter-root", from: "inter", to: "root", kind: "control", label: "xác minh chữ ký" },
        { id: "root-store", from: "root", to: "store", kind: "data", label: "đối chiếu gốc" },
        { id: "leaf-verify", from: "leaf", to: "verify", kind: "data", label: "SAN, thời hạn" },
        { id: "leaf-ocsp", from: "leaf", to: "ocsp", kind: "request", label: "hỏi trạng thái" },
        { id: "ocsp-verify", from: "ocsp", to: "verify", kind: "response", label: "good, hạn 4 ngày" }
      ],
      learn: [
        "Chuỗi tin cậy gồm chứng chỉ lá, CA trung gian và CA gốc đã cài sẵn trên máy.",
        "Trình duyệt kiểm chữ ký từng mắt xích, so SAN với tên miền rồi mới kiểm thời hạn.",
        "Máy chủ phải gửi kèm chứng chỉ trung gian, nếu không thiết bị cũ không nối được tới gốc.",
        "Hạn 90 ngày buộc phải tự động gia hạn và theo dõi trước khi hết hạn."
      ],
      steps: [
        {
          short: "Ba cấp",
          type: "concept",
          title: "Chuỗi ba chứng chỉ, hai chữ ký cần kiểm",
          body: "Chứng chỉ X.509 là một tệp nhị phân chứa tên miền, khóa công khai, thời hạn và chữ ký của tổ chức phát hành. Chứng chỉ lá của <code>api.example.vn</code> do CA trung gian R10 ký, R10 do CA gốc ISRG Root X1 ký. Trình duyệt không cần tin R10: nó chỉ cần tin gốc, rồi tự kiểm tra chữ ký từng mắt xích. Chuỗi mẫu có ba chứng chỉ, hai chữ ký cần xác minh và một gốc đã nằm sẵn trong kho tin cậy khoảng 150 chứng chỉ. Nếu máy chủ quên gửi R10, trình duyệt chỉ nhận một mắt xích và không nối được tới gốc.",
          focus: ["leaf", "inter", "root"],
          edges: ["leaf-inter", "inter-root"],
          metrics: { chain: "3 cấp", host: "api.example.vn", days: "62 ngày", revoke: "chưa hỏi" },
          changes: [
            "Chứng chỉ lá được nối với gốc qua một CA trung gian",
            "Kho tin cậy chỉ cần giữ chứng chỉ gốc"
          ],
          note: "Gốc không bao giờ được gửi kèm trong chuỗi: nó phải có sẵn trong kho của thiết bị."
        },
        {
          short: "Xác minh",
          type: "flow",
          title: "Bốn phép kiểm trước khi gửi byte dữ liệu đầu tiên",
          body: "Khi bắt tay, trình duyệt gửi SNI <code>api.example.vn</code>; máy chủ trả chứng chỉ lá kèm R10. Trình duyệt lấy khóa công khai của R10 để kiểm chữ ký trên lá, rồi lấy khóa của gốc để kiểm chữ ký trên R10. Sau đó nó so tên miền với danh sách SAN, kiểm thời hạn và hỏi trạng thái thu hồi. Cả quá trình tốn khoảng 15 mili giây và không gọi mạng, trừ bước OCSP. Nếu một mắt xích sai, kết nối dừng trước khi gửi byte dữ liệu nào. Đây là lý do chứng chỉ là hạ tầng, không phải thủ tục giấy tờ.",
          focus: ["browser", "leaf", "verify", "store"],
          edges: ["browser-leaf", "leaf-verify", "root-store"],
          metrics: { chain: "3 cấp, khớp", host: "khớp SAN", days: "62 ngày", revoke: "good" },
          changes: [
            "Chữ ký từng mắt xích được kiểm bằng khóa của cấp trên",
            "Kết nối dừng ngay khi một phép kiểm thất bại"
          ],
          note: "Kiểm chứng chỉ chạy trước khi gửi dữ liệu, nên lỗi chuỗi không làm lộ nội dung phiên."
        },
        {
          short: "Tên miền",
          type: "detail",
          title: "SAN quyết định, CN chỉ còn là di tích",
          body: "Tên miền nằm trong phần mở rộng subjectAltName, viết tắt SAN, chứ không phải trường CN cũ. Một chứng chỉ có thể phủ nhiều tên: <code>api.example.vn</code>, <code>www.example.vn</code> và <code>example.vn</code> trong cùng SAN, tiết kiệm một lần phát hành. Wildcard <code>*.example.vn</code> chỉ khớp đúng một nhãn, nên <code>a.b.example.vn</code> không hợp lệ, và wildcard không phủ tên gốc <code>example.vn</code>. Thời hạn nay ngắn: Let's Encrypt cấp 90 ngày, nhiều CA thương mại cấp 200 ngày. Trình duyệt kiểm cả ngày bắt đầu lẫn ngày kết thúc, nên đồng hồ máy lệch vài ngày cũng đủ gây lỗi.",
          focus: ["leaf", "verify"],
          edges: ["leaf-verify"],
          metrics: { chain: "3 cấp", host: "3 tên trong SAN", days: "90 ngày", revoke: "không liên quan" },
          changes: [
            "Tên miền được đối chiếu với toàn bộ danh sách SAN",
            "Wildcard chỉ áp dụng cho đúng một nhãn con"
          ],
          note: "Đừng đặt tên miền vào CN: trình duyệt hiện đại bỏ qua CN khi đã có SAN."
        },
        {
          short: "Ba lỗi",
          type: "pitfall",
          title: "Thiếu chuỗi, quên hạn và bỏ qua thu hồi",
          body: "Một sự cố quen thuộc: desktop mở trang bình thường, Android 7 báo không xác minh được. Nguyên nhân không phải chứng chỉ lá hỏng mà máy chủ chỉ gửi lá, thiếu R10. Desktop tải R10 qua <code>AIA</code> trong vài giây, còn ứng dụng nhúng và Android cũ không làm vậy nên dừng. Lỗi thứ hai là quên gia hạn: chứng chỉ 90 ngày, chỉ cần một lần cron hỏng là 100% người dùng thấy cảnh báo đỏ. Lỗi thứ ba là thu hồi: OCSP có thể fail mở, nên kẻ có khóa bị lộ vẫn dùng được nếu không bật must-staple hoặc kiểm tra chặt.",
          focus: ["leaf", "inter", "ocsp"],
          edges: ["leaf-inter", "leaf-ocsp", "ocsp-verify"],
          metrics: { chain: "thiếu 1 cấp", host: "khớp", days: "0 ngày", revoke: "không rõ" },
          changes: [
            "Thiết bị cũ thất bại trong khi desktop vẫn mở được",
            "Chứng chỉ hết hạn làm toàn bộ người dùng bị chặn"
          ],
          note: "Luôn xuất fullchain gồm lá và trung gian; đừng chỉ xuất cert.pem của lá."
        },
        {
          short: "Tự động",
          type: "final",
          tone: "final",
          title: "Vòng đời 90 ngày phải chạy không cần người",
          body: "Vòng đời chứng chỉ phải tự động từ đầu đến cuối. <code>ACME</code> xin chứng chỉ mới khi còn 30 ngày, triển khai trong 2 phút, và một bài kiểm tra bên ngoài xác nhận chuỗi đủ ba cấp từ ba thành phố khác nhau. Ghi cảnh báo khi còn 21 ngày, 14 ngày và 7 ngày, vì 90 ngày trôi qua nhanh hơn ta tưởng. Bật Certificate Transparency để mọi chứng chỉ cấp cho tên miền của bạn đều nhìn thấy được. Kết quả là không còn sự cố nửa đêm vì chứng chỉ hết hạn, và chuỗi luôn đủ cho cả thiết bị cũ.",
          focus: "all",
          edges: "all",
          metrics: { chain: "3 cấp, đủ", host: "khớp SAN", days: "90 ngày", revoke: "good, stapling" },
          changes: [
            "Gia hạn tự động trước khi hết hạn 30 ngày",
            "Chuỗi đầy đủ được kiểm từ bên ngoài mỗi ngày",
            "Mọi chứng chỉ cấp mới đều hiện trên CT log"
          ],
          note: "Đặt cảnh báo theo ngày còn lại, đừng chỉ dựa vào một lần kiểm tra lúc triển khai."
        }
      ]
    },

    /* ------------------------------------------------------------------
       Bài 3: TLS
       ------------------------------------------------------------------ */
    tls: {
      id: "tls",
      module: "giao-thuc",
      title: "Bắt tay TLS 1.3",
      shortTitle: "TLS 1.3",
      subtitle: "TLS 1.3 gộp bắt tay xuống một vòng: máy khách gửi luôn khóa tạm, máy chủ trả chứng chỉ đã mã hóa. Bài này bóc từng gói tin và chỉ ra chỗ 0-RTT tiết kiệm thời gian nhưng mở cửa phát lại.",
      blurb: "Một vòng bắt tay, sáu bộ mã, chuỗi khóa dẫn xuất từ 32 byte bí mật: TLS 1.3 nhanh hơn 1.2 đúng một vòng mạng và bỏ hết thuật toán đã lỗi thời.",
      duration: "12 phút",
      level: "Trung cấp",
      tags: ["TLS 1.3", "ClientHello", "X25519", "HKDF", "0-RTT"],
      metrics: [
        { key: "rtt", label: "Vòng bắt tay", tone: "blue" },
        { key: "suite", label: "Bộ mã", tone: "violet" },
        { key: "cert", label: "Chứng chỉ", tone: "green" },
        { key: "latency", label: "Độ trễ bắt tay", tone: "yellow" }
      ],
      nodes: [
        { id: "client", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Trình duyệt", sub: "gửi key_share trước" },
        { id: "hello", type: "file", x: 340, y: 80, w: 200, h: 70, label: "ClientHello", sub: "6 bộ mã, SNI" },
        { id: "server", type: "server", x: 625, y: 80, w: 200, h: 70, label: "Máy chủ", sub: "chọn AES-128-GCM" },
        { id: "derive", type: "key", x: 340, y: 310, w: 200, h: 70, label: "Bí mật ECDHE", sub: "32 byte mỗi phiên" },
        { id: "keys", type: "layers", x: 55, y: 310, w: 200, h: 70, label: "Lịch khóa", sub: "khóa theo hướng" },
        { id: "cert", type: "shield", x: 625, y: 310, w: 200, h: 70, label: "Chứng chỉ", sub: "ECDSA P-256, 90 ngày" }
      ],
      edges: [
        { id: "client-hello", from: "client", to: "hello", kind: "request", label: "key_share X25519" },
        { id: "hello-server", from: "hello", to: "server", kind: "data", label: "6 bộ mã, SNI" },
        { id: "server-cert", from: "server", to: "cert", kind: "control", label: "cert + Finished" },
        { id: "cert-client", from: "cert", to: "client", kind: "response", label: "xác minh chữ ký" },
        { id: "server-derive", from: "server", to: "derive", kind: "data", label: "key_share 32 byte" },
        { id: "hello-derive", from: "hello", to: "derive", kind: "data", label: "key_share 32 byte" },
        { id: "derive-keys", from: "derive", to: "keys", kind: "control", label: "HKDF tách khóa" }
      ],
      learn: [
        "TLS 1.3 cần một vòng mạng thay vì hai như TLS 1.2 trước khi có dữ liệu.",
        "ClientHello mang sẵn key_share nên máy chủ tính được bí mật ngay lượt đầu.",
        "HKDF tách một bí mật 32 byte thành khóa riêng cho từng hướng và giai đoạn.",
        "0-RTT chỉ dùng cho yêu cầu idempotent vì dữ liệu gửi sớm có thể bị phát lại."
      ],
      steps: [
        {
          short: "Một vòng",
          type: "concept",
          title: "Bớt một vòng mạng, tiết kiệm 80 mili giây",
          body: "TLS 1.2 cần hai vòng mạng trước khi có dữ liệu: một để thương lượng, một để xác thực. TLS 1.3 rút còn một vòng nhờ máy khách đoán trước nhóm khóa và gửi <code>key_share</code> ngay trong <code>ClientHello</code>. Máy chủ chọn được bí mật chung, gửi <code>ServerHello</code> kèm chứng chỉ và <code>Finished</code> trong cùng lượt. Máy khách xác minh rồi gửi <code>Finished</code>, sau đó dữ liệu ứng dụng chạy trên AES-GCM. Với đường truyền 40 ms một chiều, tiết kiệm một vòng là 80 ms, đúng bằng một lần chạm bàn phím. Đó là lý do TLS 1.3 nhanh hơn rõ rệt dù thuật toán nặng hơn.",
          focus: ["client", "hello", "server"],
          edges: ["client-hello", "hello-server"],
          metrics: { rtt: "1 vòng", suite: "6 đề xuất", cert: "chưa gửi", latency: "1 vòng mạng" },
          changes: [
            "Bắt tay rút từ hai vòng mạng xuống một vòng",
            "Khóa tạm thời được gửi ngay trong gói đầu tiên"
          ],
          note: "TLS 1.3 không cho chọn lại bộ mã sau ClientHello: danh sách gửi đi là danh sách chốt."
        },
        {
          short: "ClientHello",
          type: "flow",
          title: "Gói đầu tiên đã chứa đề xuất khóa",
          body: "Gói đầu tiên mang khá nhiều thứ: phiên bản <code>TLS 1.3</code>, SNI, danh sách sáu bộ mã như <code>TLS_AES_128_GCM_SHA256</code> và <code>TLS_CHACHA20_POLY1305_SHA256</code>, cùng <code>key_share</code> X25519 dài 32 byte. Máy khách cũng gửi kèm danh sách thuật toán chữ ký mà nó chấp nhận. Vì đề xuất khóa đi ngay, máy chủ không phải hỏi lại. SNI vẫn ở dạng rõ nên nhà mạng thấy tên miền bạn vào; ECH mã hóa phần này nhưng chưa phổ biến. Toàn bộ ClientHello khoảng 300 đến 500 byte, nhỏ hơn nhiều so với chứng chỉ gửi về. Gói này nhỏ nên ít tốn băng thông.",
          focus: ["client", "hello"],
          edges: ["client-hello"],
          metrics: { rtt: "1 vòng", suite: "6 bộ mã", cert: "chưa gửi", latency: "1 vòng mạng" },
          changes: [
            "Đề xuất khóa đi cùng gói thương lượng đầu tiên",
            "Tên miền vẫn lộ qua SNI nếu chưa bật ECH"
          ],
          note: "Đừng bật lại TLS 1.0 hay 1.1 để chiều thiết bị cũ: các bản đó đã bị loại khỏi chuẩn."
        },
        {
          short: "HKDF",
          type: "detail",
          title: "Một bí mật 32 byte sinh ra nhiều khóa",
          body: "Từ bí mật X25519 32 byte, hai bên chạy HKDF-Extract rồi HKDF-Expand-Label để sinh chuỗi khóa. Nhãn khác nhau cho từng mục đích: <code>c hs traffic</code> cho handshake phía khách, <code>s ap traffic</code> cho dữ liệu phía chủ. Mỗi khóa kèm một IV 12 byte, và mỗi bản ghi dùng số thứ tự làm nonce nên không bao giờ lặp. Chứng chỉ và CertificateVerify đi trong gói đã mã hóa, khác TLS 1.2 nơi chứng chỉ lộ trên dây. Sau khi xác minh xong, khóa handshake bị xóa và chỉ còn khóa ứng dụng, nên dữ liệu không thể giải mã bằng khóa cũ.",
          focus: ["derive", "keys", "cert"],
          edges: ["server-derive", "hello-derive", "derive-keys"],
          metrics: { rtt: "1 vòng", suite: "AES-128-GCM", cert: "đã mã hóa", latency: "1 vòng mạng" },
          changes: [
            "Chứng chỉ được gửi trong gói đã mã hóa",
            "Khóa handshake bị xóa sau khi xác minh xong"
          ],
          note: "Mỗi bản ghi dùng số thứ tự làm nonce, nên không cần gửi nonce riêng trên dây."
        },
        {
          short: "0-RTT",
          type: "pitfall",
          title: "Dữ liệu gửi sớm có thể bị phát lại",
          body: "<code>0-RTT</code> nghe hấp dẫn: máy khách quay lại gửi dữ liệu ngay trong ClientHello, tiết kiệm cả vòng đầu. Nhưng dữ liệu đó không có bảo đảm chống phát lại, kẻ chặn có thể gửi lại nguyên gói và máy chủ xử lý hai lần. Vì vậy chuẩn chỉ cho phép 0-RTT với yêu cầu idempotent như GET, tuyệt đối không dùng cho chuyển tiền hay đổi mật khẩu. Nguy hiểm thứ hai là hạ cấp: nếu máy chủ còn bật TLS 1.2 với RSA tĩnh, kẻ chặn có thể ép phiên yếu hơn. Bỏ hẳn RSA key exchange và bật downgrade sentinel là bắt buộc.",
          focus: ["client", "hello", "server"],
          edges: ["client-hello", "hello-server"],
          metrics: { rtt: "0-RTT", suite: "PSK phiên cũ", cert: "không gửi lại", latency: "0-RTT" },
          changes: [
            "Dữ liệu đầu tiên đi trước khi xác thực hoàn tất",
            "Yêu cầu có thể bị xử lý hai lần nếu bị phát lại"
          ],
          note: "Chỉ bật 0-RTT cho tài nguyên tĩnh; mọi thao tác ghi nên chờ bắt tay đủ một vòng."
        },
        {
          short: "Đo",
          type: "final",
          tone: "final",
          title: "Đo thật: 92 ms so với 176 ms",
          body: "Đo trên một máy chủ thật: bắt tay <code>TLS 1.3</code> từ Hà Nội tới Singapore mất 92 ms, TLS 1.2 mất 176 ms; phần chênh gần đúng một vòng mạng 80 ms. Chứng chỉ 2.048 bit RSA làm gói chứng chỉ nặng 1,4 KB, còn ECDSA P-256 chỉ 0,9 KB. Bật session resumption bằng PSK để khách quay lại chỉ tốn 0-RTT có kiểm soát. Đừng quên OCSP stapling để máy chủ tự lấy trạng thái thay vì bắt trình duyệt gọi thêm. Kết quả cuối: trang tải nhanh hơn, log sạch hơn và không còn bộ mã yếu trong danh sách.",
          focus: "all",
          edges: "all",
          metrics: { rtt: "1 vòng", suite: "AES-128-GCM", cert: "ECDSA 0,9 KB", latency: "92 ms" },
          changes: [
            "Bắt tay nhanh hơn gần một vòng mạng so với TLS 1.2",
            "Chứng chỉ ECDSA làm gói trả về nhẹ hơn 0,5 KB",
            "Danh sách bộ mã không còn thuật toán yếu"
          ],
          note: "Đo cả p50 và p95: chênh lệch bắt tay thể hiện rõ nhất ở p95 trên mạng di động."
        }
      ]
    },

    /* ------------------------------------------------------------------
       Bài 4: chữ ký số
       ------------------------------------------------------------------ */
    "chu-ky-so": {
      id: "chu-ky-so",
      module: "giao-thuc",
      title: "Chữ ký số",
      shortTitle: "Chữ ký số",
      subtitle: "Chữ ký số không mã hóa tài liệu, nó chứng minh ai tạo ra và tài liệu có bị sửa không. Bài này băm 4,2 MB xuống 32 byte, ký bằng ECDSA và chỉ ra vì sao tái dùng nonce làm lộ khóa riêng.",
      blurb: "Băm 4,2 MB xuống 32 byte, ký bằng một số ngẫu nhiên và xác minh bằng khóa công khai: chữ ký số bảo vệ tính toàn vẹn và nguồn gốc, không phải bí mật.",
      duration: "12 phút",
      level: "Trung cấp",
      tags: ["ECDSA", "SHA-256", "nonce", "RSA-PSS", "toàn vẹn"],
      metrics: [
        { key: "hash", label: "Hàm băm", tone: "blue" },
        { key: "sig", label: "Kích thước chữ ký", tone: "violet" },
        { key: "verify", label: "Thời gian xác minh", tone: "green" },
        { key: "nonce", label: "Nonce mỗi lần ký", tone: "yellow" }
      ],
      nodes: [
        { id: "signer", type: "user", x: 55, y: 80, w: 200, h: 70, label: "Người ký", sub: "khóa riêng 256 bit" },
        { id: "sig", type: "key", x: 340, y: 80, w: 200, h: 70, label: "Chữ ký 64 byte", sub: "cặp r, s" },
        { id: "doc", type: "file", x: 625, y: 80, w: 200, h: 70, label: "Tài liệu 4,2 MB", sub: "hợp đồng PDF" },
        { id: "algo", type: "audit", x: 55, y: 310, w: 200, h: 70, label: "ECDSA P-256", sub: "nonce mới mỗi lần" },
        { id: "tsa", type: "clock", x: 340, y: 310, w: 200, h: 70, label: "Dấu thời gian", sub: "TSA, lưu 5 năm" },
        { id: "verify", type: "check", x: 625, y: 310, w: 200, h: 70, label: "Người xác minh", sub: "khóa công khai" },
        { id: "hash", type: "code", x: 340, y: 195, w: 200, h: 70, label: "SHA-256", sub: "băm một lần" }
      ],
      edges: [
        { id: "signer-sig", from: "signer", to: "sig", kind: "request", label: "lệnh ký" },
        { id: "doc-hash", from: "doc", to: "hash", kind: "data", label: "SHA-256, 32 byte" },
        { id: "signer-algo", from: "signer", to: "algo", kind: "control", label: "chọn P-256" },
        { id: "algo-sig", from: "algo", to: "sig", kind: "data", label: "r, s = 64 byte" },
        { id: "sig-verify", from: "sig", to: "verify", kind: "request", label: "gửi kèm tài liệu" },
        { id: "hash-verify", from: "hash", to: "verify", kind: "data", label: "băm lại để so" },
        { id: "tsa-verify", from: "tsa", to: "verify", kind: "data", label: "dấu thời gian" }
      ],
      learn: [
        "Chữ ký ký giá trị băm 32 byte chứ không ký toàn bộ tài liệu 4,2 MB.",
        "ECDSA tạo cặp r, s bằng một nonce ngẫu nhiên; nonce lặp lại làm lộ khóa riêng.",
        "Xác minh chỉ cần khóa công khai, tài liệu và cặp r, s, tốn khoảng 2 mili giây.",
        "Chữ ký chỉ đáng tin khi khóa công khai được chứng chỉ gắn với đúng danh tính."
      ],
      steps: [
        {
          short: "Băm",
          type: "concept",
          title: "Ký 32 byte thay vì 4,2 MB",
          body: "Không ai ký trực tiếp tệp 4,2 MB. Phần mềm băm tài liệu bằng <code>SHA-256</code>, nhận về 32 byte, rồi ký chính giá trị băm đó. Nhờ vậy chữ ký có kích thước cố định: ECDSA P-256 cho 64 byte, RSA 2.048 bit cho 256 byte, dù tài liệu nặng 4,2 MB hay 40 GB. Khi xác minh, bên nhận băm lại tài liệu và so với giá trị đã ký; chỉ cần một bit đổi chỗ là hash khác hoàn toàn. Hàm băm phải chống va chạm, nên MD5 và SHA-1 đã bị loại khỏi mọi quy trình ký nghiêm túc.",
          focus: ["signer", "doc", "hash"],
          edges: ["doc-hash"],
          metrics: { hash: "SHA-256", sig: "chưa tạo", verify: "chưa chạy", nonce: "chưa sinh" },
          changes: [
            "Tài liệu 4,2 MB thu về một giá trị băm 32 byte",
            "Chữ ký có kích thước cố định bất kể tệp lớn cỡ nào"
          ],
          note: "Băm và ký là hai bước tách rời: đổi hàm băm là đổi toàn bộ định dạng chữ ký."
        },
        {
          short: "Ký",
          type: "flow",
          title: "Nonce k quyết định toàn bộ độ an toàn",
          body: "Quy trình ký ECDSA có ba bước. Đầu tiên chọn số ngẫu nhiên <code>k</code> trong khoảng 1 đến n-1. Tiếp theo tính điểm trên đường cong <code>R = k*G</code>, lấy hoành độ rồi rút gọn modulo n được <code>r</code>. Cuối cùng tính <code>s = k^-1 (hash + r*d) mod n</code>, với d là khóa riêng. Cặp <code>(r, s)</code> là chữ ký, dài 64 byte với P-256. Nếu k bị đoán hoặc lặp lại, người có hai chữ ký giải được d. Vì vậy thư viện hiện đại sinh k tất định theo RFC 6979 hoặc lấy từ nguồn ngẫu nhiên đủ mạnh.",
          focus: ["signer", "algo", "sig"],
          edges: ["signer-algo", "algo-sig"],
          metrics: { hash: "SHA-256", sig: "64 byte", verify: "chưa chạy", nonce: "sinh mỗi lần" },
          changes: [
            "Khóa riêng không rời máy ký, chỉ cặp r, s được gửi",
            "Mỗi lần ký tiêu tốn một nonce mới"
          ],
          note: "Không tự viết bộ sinh nonce: dùng thư viện đã kiểm định hoặc chế độ tất định RFC 6979."
        },
        {
          short: "Xác minh",
          type: "detail",
          title: "Khóa công khai kiểm được mà không lộ gì",
          body: "Người nhận chỉ cần khóa công khai Q, tài liệu và cặp (r, s). Họ kiểm r, s nằm trong khoảng hợp lệ, tính <code>u1 = hash * s^-1</code> và <code>u2 = r * s^-1</code> modulo n, rồi tính điểm <code>X = u1*G + u2*Q</code>. Chữ ký hợp lệ khi hoành độ của X modulo n bằng r. Phép kiểm chỉ tốn khoảng 2 mili giây, chậm hơn một chút so với 1,8 mili giây lúc ký, nên máy chủ vẫn xác minh hàng nghìn yêu cầu mỗi giây. RSA-PSS làm việc tương tự nhưng chậm hơn và chữ ký lớn gấp bốn lần.",
          focus: ["sig", "verify", "hash"],
          edges: ["sig-verify", "hash-verify"],
          metrics: { hash: "SHA-256", sig: "64 byte", verify: "2 ms", nonce: "không cần" },
          changes: [
            "Chữ ký được kiểm bằng khóa công khai, không cần khóa riêng",
            "Một bit sai trong tài liệu làm phép kiểm thất bại"
          ],
          note: "Xác minh sai thứ tự byte của r và s là lỗi hay gặp khi tự đóng gói chữ ký."
        },
        {
          short: "Tái dùng k",
          type: "pitfall",
          title: "Hai chữ ký chung nonce là mất khóa",
          body: "Năm 2010, Sony dùng <code>ECDSA</code> trên PlayStation 3 với k cố định. Hai chữ ký khác nhau chia sẻ cùng k cho phép giải hệ hai phương trình ra khóa riêng trong vài phút, và khóa đó lan ra công khai. Lỗi không nằm ở đường cong mà ở nguồn ngẫu nhiên. Một cái bẫy khác là ký bằng MD5: hai tệp khác nhau có thể cùng hash, nên chữ ký hợp lệ cho cả hai. Cuối cùng, đừng nhầm chữ ký với mã hóa: chữ ký ai cũng kiểm được, còn mã hóa thì chỉ người có khóa riêng đọc được.",
          focus: ["algo", "sig", "signer"],
          edges: ["algo-sig", "signer-algo"],
          metrics: { hash: "MD5, đã lỗi thời", sig: "2 chữ ký chung k", verify: "vẫn báo hợp lệ", nonce: "trùng, nguy hiểm" },
          changes: [
            "Khóa riêng suy ra được từ hai chữ ký dùng chung nonce",
            "Chữ ký tạo bằng MD5 không còn giá trị pháp lý"
          ],
          note: "Nếu nghi ngờ nonce bị lặp, thu hồi khóa ngay: đổi thuật toán không cứu chữ ký đã phát hành."
        },
        {
          short: "Tin cậy",
          type: "final",
          tone: "final",
          title: "Chữ ký chỉ có nghĩa khi biết ai giữ khóa",
          body: "Chữ ký chỉ đáng tin khi khóa công khai gắn đúng danh tính, và đó là việc của chứng chỉ. Quy trình đầy đủ gồm: ký tài liệu, gắn dấu thời gian từ <code>TSA</code> để chứng minh thời điểm, đóng gói cùng chuỗi chứng chỉ, rồi bên nhận kiểm cả ba thứ trước khi tin. Hệ điều hành và trình duyệt làm việc này mỗi lần bạn cài ứng dụng: một chữ ký sai làm installer dừng lại. Với tài liệu pháp lý, lưu cả hash và chứng chỉ ít nhất 5 năm để còn xác minh khi thuật toán cũ bị loại bỏ.",
          focus: "all",
          edges: "all",
          metrics: { hash: "SHA-256", sig: "64 byte", verify: "2 ms", nonce: "RFC 6979" },
          changes: [
            "Dấu thời gian chứng minh tài liệu đã tồn tại từ thời điểm ký",
            "Chuỗi chứng chỉ gắn khóa công khai với danh tính người ký",
            "Hồ sơ lưu đủ hash và chứng chỉ để xác minh lại sau nhiều năm"
          ],
          note: "Kiểm chữ ký trước khi mở tệp: đây là bước duy nhất ngăn mã độc chạy trên máy."
        }
      ]
    }
  });

  window.CRYPTOLAB.practice.push(
    {
      tag: "KEX",
      title: "Lưu lượng cũ giải mã được sau khi lộ khóa",
      scenario: "Máy chủ API của bạn còn bật bộ mã TLS_RSA_WITH_AES_128_CBC_SHA cho vài ứng dụng cũ. Sự cố tháng trước: một bản sao khóa riêng RSA 2.048 bit bị lộ từ ổ sao lưu. Kẻ tấn công đã ghi 12 TB lưu lượng từ năm ngoái, và sau khi có khóa, họ giải mã được toàn bộ phiên cũ trong 4 giờ, gồm cả token đăng nhập. Nhóm đã thu hồi khóa và cấp lại chứng chỉ, nhưng lưu lượng vẫn bị đọc. Bạn cần chặn việc này tái diễn với các phiên ghi trong tương lai. Chọn thay đổi gốc rễ nhất.",
      metrics: [
        { label: "Lưu lượng bị ghi", value: "12 TB", danger: true },
        { label: "Thời gian giải mã", value: "4 giờ", danger: true },
        { label: "Trao đổi khóa", value: "RSA tĩnh" }
      ],
      options: [
        "Tăng khóa RSA từ 2.048 lên 4.096 bit và giữ nguyên bộ mã hiện tại.",
        "Chuyển sang ECDHE với khóa tạm thời cho mỗi phiên và bỏ trao đổi khóa bằng RSA.",
        "Bật HSTS và OCSP stapling để giảm rủi ro bị chặn giữa đường.",
        "Chỉ cho phép TLS 1.3 nhưng vẫn giữ bộ mã RSA tĩnh cho ứng dụng cũ."
      ],
      correct: 1,
      explain: "Vấn đề là forward secrecy. Với TLS_RSA, khóa phiên được mã hóa bằng khóa công khai RSA của máy chủ, nên ai giữ khóa riêng đều mở được mọi bản ghi cũ. ECDHE sinh cặp khóa tạm thời cho từng phiên và vứt đi sau khi kết thúc, nên lộ khóa dài hạn không mở được lưu lượng đã ghi. Tăng lên 4.096 bit chỉ làm việc bẻ khóa chậm hơn, không cứu dữ liệu cũ. HSTS và OCSP giải quyết chuyện khác. Giữ RSA tĩnh trong TLS 1.3 là bất khả thi vì chuẩn đã bỏ hoàn toàn trao đổi khóa này."
    },
    {
      tag: "CERT",
      title: "Desktop mở được, Android 7 báo lỗi chuỗi",
      scenario: "Ứng dụng của bạn gọi api.example.vn. Trên desktop và iOS, mọi thứ bình thường. Trên Android 7, 8,4% thiết bị báo lỗi không xác minh được chứng chỉ máy chủ. Bạn kiểm tra chứng chỉ lá: còn 62 ngày, SAN khớp api.example.vn, chữ ký hợp lệ. Máy chủ cấu hình chỉ trả một chứng chỉ lá, không kèm chứng chỉ trung gian. Trình duyệt desktop tự tải chứng chỉ trung gian qua AIA nên không thấy vấn đề. Log của thiết bị lỗi ghi unable to get local issuer certificate. Bạn cần giảm tỉ lệ lỗi này trước bản phát hành tuần sau. Chọn cách sửa đúng nhất.",
      metrics: [
        { label: "Thiết bị lỗi", value: "8,4%", danger: true },
        { label: "Chuỗi gửi kèm", value: "1 chứng chỉ", danger: true },
        { label: "Hạn còn lại", value: "62 ngày" }
      ],
      options: [
        "Cài chứng chỉ lá vào kho tin cậy của ứng dụng trên Android.",
        "Tắt kiểm tra tên miền trong thư viện mạng của ứng dụng.",
        "Cấu hình máy chủ gửi đủ chứng chỉ trung gian trong chuỗi.",
        "Đổi sang chứng chỉ wildcard để phủ thêm tên miền."
      ],
      correct: 2,
      explain: "Trình duyệt desktop có hai đường: nó có thể tải chứng chỉ trung gian qua AIA, còn Android cũ và nhiều thư viện nhúng thì không. Khi máy chủ chỉ gửi chứng chỉ lá, thiết bị không nối được tới CA gốc đã cài sẵn, nên báo không tìm thấy tổ chức phát hành. Sửa đúng là ghép chứng chỉ lá với chứng chỉ trung gian thành fullchain và cấu hình máy chủ gửi cả hai. Cài lá vào kho tin cậy là tự ký cho chính mình, mất toàn bộ giá trị xác thực. Tắt kiểm tra tên miền mở đường cho kẻ đứng giữa, còn wildcard không liên quan tới chuỗi."
    },
    {
      tag: "SIGN",
      title: "Hai chữ ký, một khóa riêng bị lộ",
      scenario: "Dịch vụ ký tài liệu của bạn dùng ECDSA P-256. Một nhà nghiên cứu gửi báo cáo: hai tài liệu khác nhau, ký cách nhau ba tháng, có cùng giá trị r trong chữ ký. Anh ta nói chỉ cần hai chữ ký đó là tính được khóa riêng trong vài giây, và đã thử thành công trên bản sao môi trường staging. Nhật ký cho thấy dịch vụ dùng một bộ sinh số giả ngẫu nhiên tự viết, khởi tạo bằng thời gian hệ thống. Có 40.000 tài liệu đã ký trong ba tháng. Chọn việc xử lý đúng và đủ nhất.",
      metrics: [
        { label: "Chữ ký trùng r", value: "2", danger: true },
        { label: "Nonce", value: "dùng lại", danger: true },
        { label: "Tài liệu đã ký", value: "40.000" }
      ],
      options: [
        "Thu hồi khóa và chứng chỉ, sinh khóa mới, chuyển sang nonce ngẫu nhiên an toàn hoặc RFC 6979, rồi đánh dấu các chữ ký cũ.",
        "Tăng kích thước khóa từ P-256 lên P-384 để chữ ký khó bị phá hơn.",
        "Băm tài liệu hai lần trước khi ký để che giá trị r.",
        "Chuyển sang RSA 2.048 bit vì RSA không dùng nonce."
      ],
      correct: 0,
      explain: "Trong ECDSA, cùng một nonce k cho hai thông điệp khác nhau là đủ để giải khóa riêng: hai phương trình, hai ẩn, và k bị triệt tiêu. Đường cong lớn hơn không giúp gì vì lỗi nằm ở nguồn ngẫu nhiên, không ở độ khó bài toán. Băm hai lần không che r vì r vẫn công khai trong chữ ký. RSA không dùng nonce nhưng vẫn cần nguồn ngẫu nhiên cho padding PSS, và đổi thuật toán không làm chữ ký cũ an toàn hơn. Vì vậy phải thu hồi khóa, cấp lại chứng chỉ, sửa bộ sinh số và công bố các chữ ký bị ảnh hưởng."
    }
  );

  window.CRYPTOLAB.cheatsheets.push({
    id: "protocols",
    num: "02",
    title: "TLS & chứng chỉ",
    intro: "Tra nhanh khi cấu hình TLS và xử lý chứng chỉ: lệnh kiểm tra bắt tay, bảng so sánh TLS 1.2 với 1.3, mẫu cấu hình nginx, checklist trước khi hết hạn và cách xác minh chuỗi.",
    cards: [
      {
        title: "Bắt tay TLS 1.3 bằng một lệnh",
        wide: true,
        html: `<p><code>-servername</code> gửi đúng SNI, <code>-tls1_3</code> ép phiên bản, còn <code>-showcerts</code> in cả chuỗi để bạn đếm số chứng chỉ máy chủ gửi kèm.</p>
<pre class="formula"><code>openssl s_client \
  -connect api.example.vn:443 \
  -servername api.example.vn \
  -tls1_3 -showcerts &lt;/dev/null</code></pre>
<p>Kết quả tốt ghi <code>Protocol: TLSv1.3</code>, <code>Cipher: TLS_AES_128_GCM_SHA256</code> và có ít nhất hai khối <code>BEGIN CERTIFICATE</code> là lá cùng trung gian.</p>`
      },
      {
        title: "Bảng bắt tay TLS 1.3",
        html: `<table class="cheat-table">
<thead><tr><th>Bước</th><th>Gói tin</th><th>Nội dung</th><th>Khóa</th></tr></thead>
<tbody>
<tr><td>1</td><td><b>ClientHello</b></td><td>6 bộ mã, SNI, key_share X25519</td><td>chưa có</td></tr>
<tr><td>2</td><td><b>ServerHello</b></td><td>chọn bộ mã, key_share máy chủ</td><td>handshake</td></tr>
<tr><td>3</td><td>EncryptedExtensions</td><td>tham số phiên đã mã hóa</td><td>handshake</td></tr>
<tr><td>4</td><td>Certificate, CertVerify</td><td>chuỗi chứng chỉ và chữ ký</td><td>handshake</td></tr>
<tr><td>5</td><td>Finished</td><td>MAC trên toàn bộ handshake</td><td>handshake</td></tr>
<tr><td>6</td><td>Application Data</td><td>dữ liệu ứng dụng</td><td>ứng dụng</td></tr>
</tbody>
</table>
<p>Mỗi gói <code>key_share</code> mang 32 byte, còn <code>Finished</code> là MAC trên toàn bộ handshake. TLS 1.3 chỉ còn một vòng mạng; TLS 1.2 cần thêm một vòng nữa trước khi gửi dữ liệu.</p>`
      },
      {
        title: "Cấu hình nginx chỉ bật TLS 1.3",
        wide: true,
        html: `<p>Bỏ TLS 1.0 và 1.1, tắt ticket để giảm rủi ro, bật stapling để máy chủ tự lấy trạng thái OCSP. TLS 1.3 cần nginx 1.19.4 trở lên và OpenSSL 1.1.1 vì bộ mã đặt qua <code>ssl_conf_command</code>.</p>
<pre class="formula"><code>server {
    listen 443 ssl http2;
    server_name api.example.vn;

    ssl_certificate     /etc/ssl/fullchain.pem;
    ssl_certificate_key /etc/ssl/privkey.pem;
    ssl_trusted_certificate /etc/ssl/chain.pem;

    ssl_protocols TLSv1.3;
    ssl_conf_command Ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384;

    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=63072000" always;
}</code></pre>
<p>Kiểm tra lại bằng <code>nginx -t</code> rồi mới reload; thiếu <code>fullchain.pem</code> là nguyên nhân lỗi chuỗi phổ biến nhất.</p>`
      },
      {
        title: "Checklist chứng chỉ trước khi hết hạn",
        html: `<table class="cheat-table">
<thead><tr><th>Mục</th><th>Đạt khi</th></tr></thead>
<tbody>
<tr><td>Tên miền</td><td>SAN khớp, không dựa vào CN</td></tr>
<tr><td>Chuỗi</td><td>Gửi lá và trung gian, gốc có sẵn trên máy</td></tr>
<tr><td>Hạn</td><td>Còn trên 21 ngày, cảnh báo ở 14 và 7 ngày</td></tr>
<tr><td>Khóa</td><td>ECDSA P-256 hoặc RSA 2.048 bit trở lên</td></tr>
<tr><td>Thu hồi</td><td>OCSP stapling trả good, có must-staple</td></tr>
<tr><td>Gia hạn</td><td>ACME tự chạy khi còn 30 ngày</td></tr>
<tr><td>Minh bạch</td><td>Chứng chỉ mới xuất hiện trên CT log</td></tr>
</tbody>
</table>
<p><code>notAfter</code> là hạn cuối, nên đặt cảnh báo theo số ngày còn lại thay vì theo ngày cố định. Kiểm tra từ bên ngoài, không chỉ từ máy chủ: lỗi chuỗi thường chỉ lộ trên thiết bị cũ.</p>`
      },
      {
        title: "Xác minh chuỗi và trạng thái",
        html: `<pre class="formula"><code>openssl x509 -in leaf.pem -noout \
  -subject -issuer -dates \
  -ext subjectAltName

openssl verify -CAfile root.pem \
  -untrusted intermediate.pem leaf.pem

openssl s_client -connect api.example.vn:443 \
  -servername api.example.vn -status &lt;/dev/null</code></pre>
<p>Lệnh đầu đọc tên, hạn và SAN; lệnh hai trả <code>leaf.pem: OK</code> khi chuỗi đủ; lệnh ba in dòng <code>OCSP Response Status: successful</code>.</p>`
      }
    ]
  });
})();
