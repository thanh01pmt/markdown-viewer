---
title: "HP7-07: FIREWALLS & NETWORK ISOLATION — HÀNG RÀO KỸ THUẬT SỐ"
program_id: "pathway-aiot"
type: "slides"
date: 2026-04-08T03:54:23.285Z
---
---
marp: true
theme: default
paginate: true
header: "HP7: Cyber Security for AIoT | Bài 07"
footer: "© Pathway AIoT Curriculum | @content"
style: |
  section {
    background-color: #050a14;
    color: #c9d1d9;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #00BFFF;
    text-shadow: 0 0 10px rgba(0, 191, 255, 0.5);
  }
  h2 {
    color: #58a6ff;
  }
  code {
    background-color: #0d1117;
    color: #79c0ff;
    border: 1px solid #30363d;
  }
  blockquote {
    background: rgba(88, 166, 255, 0.1);
    border-left: 5px solid #00BFFF;
    color: #8b949e;
  }
---

<!-- 
  Lesson: HP7.07 - Firewalls & Network Isolation - Hàng rào kỹ thuật số
  Theme: Cyber Blue
-->


## Unit 7: Security | Network Defense

![w:800](file:///Users/tonypham/MEGA/my-agents/packages/the-ultimate-curriculum-agent-os/projects/pathway-aiot/_assets/images/hp7_fortress.png)

---

# 1. ENGAGE: "Quả táo thối" trong giỏ 🍎

**Kịch bản:** Con robot hút bụi giá rẻ của bạn bị hack. Nếu nó nằm chung mạng với máy tính cá nhân, hacker có thể:
- Quét mạng LAN để tìm dữ liệu ngân hàng.
- Tấn công các thiết bị khác trong nhà.

**Câu hỏi:** Làm sao để nhốt "quả táo thối" này vào một cái lồng riêng?

> Đó là lúc chúng ta cần **Network Isolation** (Cô lập mạng).

---

# 2. Phân vùng mạng (Micro-segmentation)

Tại sao không nên để mọi thiết bị "nói chuyện" tự do trong cùng một mạng LAN?

- **VLAN (Virtual LAN):** Chia mạng vật lý thành nhiều mạng vùng độc lập.
- **Vùng Primary:** Máy tính, điện thoại (Dữ liệu quan trọng).
- **Vùng IoT:** Bóng đèn, robot, cảm biến (Ít tin cậy).

---

# 3. Sơ đồ Cô lập Mạng

```mermaid
graph LR
    subgraph "Edge Zone (Home)"
        D1[ESP32 #1]
        D2[ESP32 #2]
        FW1[Edge Firewall]
    end
    
    subgraph "Secure Gateway"
        GW[n8n Instance]
    end
    
    D1 & D2 -- "1. Local Traffic" --> FW1
    FW1 -- "2. Whitelist Only" --> GW
    Note over FW1: Chỉ cho phép MQTT (8883) & NTP (123)
```

<!-- notes: Giải thích luồng kiểm soát traffic từ Layer 3/4. -->

---

# 4. Nguyên tắc Vàng: Default Deny 🚧

**Default Deny** = Cấm tất cả trừ những gì được cho phép.

Hầu hết router gia đình dùng *Default Allow* (để người dùng dễ cài đặt), nhưng đó là một thảm họa bảo mật.

**Whitelist cho ESP32:**
- Cho phép IP của MQTT Broker qua cổng 8883.
- Cho phép IP của NTP Server qua cổng 123.
- **MỌI THỨ KHÁC ➔ CHẶN.**

---

# 5. Bề mặt tấn công (Attack Surface)

Mỗi cổng (Port) đang mở là một "cánh cửa" mời gọi hacker.

- **Cửa chính:** Cổng MQTT, HTTP.
- **Cửa sổ:** mDNS, Telnet, Debug ports...
- **Mục tiêu:** Đóng hết mọi cửa không cần thiết để giảm diện tích tiếp xúc với hacker.

---

# 6. Stealth Mode: Chế độ tàng hình

Một tường lửa tốt không nên trả lời "Access Denied". Nó nên giữ im lặng (**Drop** thay vì **Reject**).

- Khi hacker quét cổng, họ sẽ không thấy bất kỳ phản hồi nào.
- Thiết bị của bạn trở nên "vô hình" trên Internet.

---

# 7. Lab: Firewall Simulator 💻

Thực hành kiểm tra hiệu quả của tường lửa:

```bash
# Chạy script mô phỏng quét cổng
python firewall_sim.py --target 192.168.1.50
```

1. **Trước khi chặn:** Thấy nhiều cổng như 80, 1883, 22 đang mở.
2. **Sau khi chặn:** "Tàng hình" hoàn toàn, hacker không tìm thấy dấu vết.

---

# 8. Thiết kế mạng Smart Home an toàn 🏠

**Bài tập:** Thiết kế sơ đồ mạng cho một căn hộ:
- Tầng 1: VLAN khách (WiFi Guest).
- Tầng 2: VLAN làm việc (Hồ sơ, Tài chính).
- Tầng 3: VLAN IoT (Camera, Công tắc).

**Yêu cầu:** Vẽ sơ đồ kết nối và liệt kê 3 luật tường lửa cơ bản.

---

# Summary 📋

- Đừng để IoT nằm chung mạng với dữ liệu nhạy cảm.
- Dùng Whitelist thay vì Blacklist.
- Minimize Attack Surface (Đóng các cổng thừa).

![w:400](file:///Users/tonypham/MEGA/my-agents/packages/the-ultimate-curriculum-agent-os/projects/pathway-aiot/_assets/images/hp7_banner.png)