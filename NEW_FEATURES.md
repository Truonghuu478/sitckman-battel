# 🎮 Tính Năng Mới Đã Thêm

## ✨ Các Tính Năng Hấp Dẫn Mới

### 1. 🪨 Hệ Thống Ném Đá (Stone Throwing)
- **Phím điều khiển:**
  - Player 1: Nhấn `R` để ném đá
  - Player 2: Nhấn `3` để ném đá
- **Chi tiết:**
  - Mỗi người chơi có 3 viên đá
  - Đá bay theo đường parabol thực tế với trọng lực
  - Cooldown 40 frames giữa mỗi lần ném
  - Gây 10 damage khi trúng

### 2. 💥 Hiệu Ứng Ngã (Knockdown Effect)
- **Khi bị đá trúng:**
  - Nhân vật sẽ bị ngã xuống đất
  - Thời gian ngã: 60 frames (1 giây)
  - Animation ngã và đứng dậy mượt mà
  - Không thể di chuyển hoặc tấn công khi đang ngã
  - Có hiệu ứng shockwave và camera shake mạnh

### 3. 🎯 Critical Hits
- **15% cơ hội đánh critical**
- **Khi đánh critical:**
  - Damage tăng 1.5 lần
  - Camera shake cực mạnh (15 độ)
  - Shockwave lớn hơn (80 radius)
  - Hiệu ứng visual đặc biệt

### 4. 🌟 Slow-Motion Effect (Combo)
- **Kích hoạt khi:**
  - Đánh trúng 3+ combo liên tiếp
- **Hiệu ứng:**
  - Game chậm lại 50%
  - Màn hình có overlay xanh
  - Hiển thị text "COMBO!" to
  - Tạo cảm giác epic cho những pha đánh hay

### 5. 📦 Power-Ups (Vật Phẩm Tăng Sức Mạnh)
- **Xuất hiện ngẫu nhiên mỗi 10 giây**
- **3 loại power-up:**
  - ❤️ **Health**: Hồi 30 HP
  - ⚫ **Stones**: Đầy 3 viên đá
  - ⚡ **Speed**: Tăng tốc độ và nhảy cao trong 8 giây
- **Hiệu ứng:**
  - Bay lơ lửng trên không
  - Có glow effect vàng
  - Particle effect khi nhặt

### 6. 🏃 Dash Move (Di Chuyển Nhanh)
- **Phím điều khiển:**
  - Player 1: `Shift`
  - Player 2: `Enter`
- **Chi tiết:**
  - Tốc độ dash: 15 units/frame
  - Cooldown: 60 frames (1 giây)
  - Có motion blur effect
  - Animation đặc biệt khi dash
  - Có thể dùng để né đá hoặc lao vào tấn công

## 🎮 Bảng Điều Khiển Đầy Đủ

### Player 1:
- `W` - Nhảy
- `A` - Di chuyển trái
- `D` - Di chuyển phải
- `S` - Ngồi
- `F` - Đấm
- `G` - Đá
- `R` - Ném đá 🆕
- `Shift` - Dash 🆕

### Player 2:
- `↑` - Nhảy
- `←` - Di chuyển trái
- `→` - Di chuyển phải
- `↓` - Ngồi
- `1` - Đấm
- `2` - Đá
- `3` - Ném đá 🆕
- `Enter` - Dash 🆕

## 🎨 Hiệu Ứng Visual Mới

1. **Projectile Trails**: Đá quay khi bay
2. **Knockdown Animation**: Animation ngã và đứng dậy
3. **Dash Trail**: Motion blur khi dash
4. **Power-up Glow**: Hiệu ứng sáng cho items
5. **Slow-motion Overlay**: Màn hình xanh khi combo
6. **Stone Counter**: Hiển thị số đá còn lại
7. **Enhanced Shockwaves**: Shockwave mạnh hơn cho crit và stone hits

## 💡 Mẹo Chơi

1. **Ném đá từ xa** để knockdown đối thủ trước khi lao vào
2. **Dash** để né đá hoặc tạo khoảng cách
3. **Dùng combo** để kích hoạt slow-motion và dễ đánh hơn
4. **Nhặt power-ups** để có lợi thế
5. **Critical hits** có thể đảo ngược tình thế trận đấu
6. Khi đối thủ ngã, đây là cơ hội tốt để tấn công hoặc lấy power-up

## 🔧 Technical Details

### Performance:
- Slow-motion không ảnh hưởng FPS
- Power-ups tối đa 2 cùng lúc trên màn
- Projectiles tự động bị xóa khi ra khỏi màn hình
- Efficient particle management

### Balance:
- Stone damage: 10 (moderate)
- Knockdown time: 1 second (recoverable)
- Critical chance: 15% (fair)
- Power-up spawn: 10 seconds (strategic)
- Dash cooldown: 1 second (prevents spam)

---

**Lưu ý**: Tất cả các tính năng này đã được test và tối ưu để game vẫn chạy mượt mà ở 60 FPS! 🚀
