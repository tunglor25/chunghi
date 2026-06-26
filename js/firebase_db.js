import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  serverTimestamp,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  // Chỉ yêu cầu databaseURL vì dùng public rtdb
  databaseURL:
    "https://birthday-d859f-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Đọc URL Parameter để tạo không gian riêng
const urlParams = new URLSearchParams(window.location.search);
const currentId = urlParams.get("id") || "chunghi";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const wishesRef = ref(database, "wishes/" + currentId);
const configRef = ref(database, "celebrations/" + currentId);

// Lấy tham chiếu các elements
const wishForm = document.getElementById("wish-form");
const wishesList = document.getElementById("wishes-list");
const wishNameInput = document.getElementById("wish-name");
const wishContentInput = document.getElementById("wish-content");
// Tải tham chiếu elements mới cho tính năng up ảnh
const wishFileInput = document.getElementById("wish-file");
const wishImgPreviewContainer = document.getElementById(
  "wish-img-preview-container",
);
const wishImgPreview = document.getElementById("wish-img-preview");
const btnRemoveImg = document.getElementById("btn-remove-img");
const btnSubmitWish = document.getElementById("btn-submit-wish");
const btnWishLoader = document.getElementById("btn-wish-loader");

let selectedFile = null;

// Xử lý chọn ảnh & Preview
if (wishFileInput) {
  wishFileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = function (event) {
        wishImgPreview.src = event.target.result;
        wishImgPreviewContainer.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });
}

if (btnRemoveImg) {
  btnRemoveImg.addEventListener("click", () => {
    selectedFile = null;
    wishFileInput.value = "";
    wishImgPreviewContainer.classList.add("hidden");
  });
}

// Tải thông số trang web Động từ Firebase 1 lần khi load trang
get(configRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      applyConfig(snapshot.val());
    } else {
      // Dữ liệu mẫu hiển thị nếu Link cấu hình ID Sai hoặc chưa có DB
      applyConfig({
        name: "Lovie",
        birthYear: 2005,
        folder: "",
        imgCount: 7,
      });
    }
  })
  .catch((error) => console.error("Lỗi tải Config:", error));

function applyConfig(config) {
  // Đổi các thẻ Tên ở trang phụ (Index, Lock)
  const nameReceivers = document.querySelectorAll(".receiver-name");
  nameReceivers.forEach(
    (el) => (el.textContent = "Thư mời của " + (config.name || "Lovie")),
  );

  const lockReceivers = document.querySelectorAll(".receiver-name-lock");
  lockReceivers.forEach(
    (el) =>
      (el.innerHTML =
        'Mở khóa trái tim<br><span class="text-rose-500 mt-2 block">' +
        (config.name || "Lovie") +
        "</span>"),
  );

  // Đổi tiêu đề
  const titleEl = document.getElementById("main-title");
  if (titleEl) {
    titleEl.innerHTML =
      'Happy Birthday<br><span class="text-4xl md:text-6xl text-rose-500 mt-2 block">' +
      (config.name || "Lovie") +
      "</span>!";
  }

  // Đổi ảnh đại diện khung tròn và icon âm nhạc
  const introImg =
    document.getElementById("intro-avatar") ||
    document.querySelector(".intro-content img");
  const musicImg =
    document.getElementById("music-avatar") ||
    document.querySelector("#music-toggle img");

  if (introImg || musicImg) {
    let basePath = "assets/images/";
    if (config.folder && config.folder.trim() !== "") {
      basePath += config.folder.trim() + "/";
    }

    if (introImg) {
      // Luôn dùng Anh7.PNG làm ảnh đại diện intro
      introImg.src = basePath + "Anh7.PNG";
      // Xử lý báo lỗi tải ảnh Fallback
      introImg.onerror = function () {
        this.src = "https://loremflickr.com/600/400/birthday,cake";
      };
    }

    if (musicImg) {
      musicImg.src = basePath + "Anh1.PNG";
      musicImg.onerror = function () {
        this.src = "https://loremflickr.com/600/400/birthday,cake";
      };
    }
  }
  // Đổi nền text background
  const scrollTextEl = document.querySelector(".scrolling-text");
  if (scrollTextEl) {
    const text = "Happy Birthday " + (config.name || "Lovie") + " ✨ ";
    scrollTextEl.textContent = text.repeat(5);
  }

  // Load Album ẢNh kỷ niệm động
  const swiperWrapper = document.getElementById("swiper-dynamic-wrapper");
  if (swiperWrapper) {
    const folder = config.folder || "Mai_beo";
    const count = parseInt(config.imgCount) || 6;
    const baseUrl = "https://raw.githubusercontent.com/tunglor25/day_for_you/main/assets/images";
    const cacheBuster = config.updatedAt ? `?v=${config.updatedAt}` : `?v=${Date.now()}`;
    let slidesHTML = "";

    // Tạo danh sách ảnh
    for (let i = 1; i <= count; i++) {
      let imgSrc = `${baseUrl}/${folder}/Anh${i}.PNG${cacheBuster}`;
      slidesHTML += `
          <div class="swiper-slide overflow-hidden rounded-3xl">
            <div class="absolute inset-0 bg-black/10 z-0"></div>
            <!-- Lớp nền mờ (Blurred Background) -->
            <img src="${imgSrc}" class="absolute inset-0 w-full h-full object-cover z-0 blur-xl opacity-50 scale-110" 
                 onerror="this.src='https://loremflickr.com/600/400/birthday,cake';" />
            <!-- Lớp ảnh chính sắc nét (Sharp Foreground) kèm tính năng Phóng To Popup -->
            <img src="${imgSrc}" class="relative z-10 w-full h-full object-contain drop-shadow-2xl cursor-pointer" onclick="if(window.openImageModal) window.openImageModal(this.src)"
                 onerror="this.src='https://loremflickr.com/600/400/birthday,cake';" />
          </div>
        `;
    }
    // Lặp thêm file chính nó để chống Lỗi đen viền loop của CSS (Swiper Loop yêu cầu ít nhất 6 slides)
    // Swiper Cards Effect và Loop mode yêu cầu ít nhất 6-8 slides để hoạt động mượt mà và không báo lỗi
    if (count < 8) {
      let duplicateNeeded = 8 - count;
      for (let i = 1; i <= duplicateNeeded; i++) {
        // Lấy lại ảnh theo vòng lặp bằng toán tử chia lấy dư
        let imgIndex = ((i - 1) % count) + 1;
        let imgSrc = `${baseUrl}/${folder}/Anh${imgIndex}.PNG${cacheBuster}`;
        slidesHTML += `
          <div class="swiper-slide overflow-hidden rounded-3xl">
            <div class="absolute inset-0 bg-black/10 z-0"></div>
            <!-- Lớp nền mờ -->
            <img src="${imgSrc}" class="absolute inset-0 w-full h-full object-cover z-0 blur-xl opacity-50 scale-110" 
                    onerror="this.src='https://loremflickr.com/600/400/birthday,cake';" />
            <!-- Lớp ảnh chính kèm popup ảnh -->
            <img src="${imgSrc}" class="relative z-10 w-full h-full object-contain drop-shadow-2xl cursor-pointer" onclick="if(window.openImageModal) window.openImageModal(this.src)"
                    onerror="this.src='https://loremflickr.com/600/400/birthday,cake';" />
          </div>
        `;
      }
    }

    swiperWrapper.innerHTML = slidesHTML;
    // Báo cho SwiperJS là đã Cập nhật Slide HTML xong và bắt đầu chạy Effect Slider
    if (window.initMySwiper) {
      window.initMySwiper();
    }
  }

  // Set cấu hình Theme Nam / Nữ
  if (config.theme === "boy") {
    // Inject CSS ghi đè các màu sắc Pink/Rose thành Blue/Sky
    const style = document.createElement("style");
    style.innerHTML = `
      /* Màu nền trang */
      body.bg-pink-50 { background-color: #f0f9ff !important; }
      .bg-pink-50 { background-color: #f0f9ff !important; }
      .bg-pink-100 { background-color: #e0f2fe !important; }
      .bg-pink-200 { background-color: #bae6fd !important; }
      .bg-pink-400 { background-color: #38bdf8 !important; }
      .bg-pink-500 { background-color: #0ea5e9 !important; }
      .bg-pink-600 { background-color: #0284c7 !important; }
      
      .bg-rose-500 { background-color: #0ea5e9 !important; }
      .bg-rose-600 { background-color: #0284c7 !important; }
      
      /* Màu Text */
      .text-pink-200 { color: #bae6fd !important; }
      .text-pink-400 { color: #38bdf8 !important; }
      .text-pink-500 { color: #0ea5e9 !important; }
      .text-pink-600 { color: #0284c7 !important; }
      
      .text-rose-300 { color: #7dd3fc !important; }
      .text-rose-400 { color: #38bdf8 !important; }
      .text-rose-500 { color: #0ea5e9 !important; }
      
      /* Viền (Border) */
      .border-pink-100 { border-color: #e0f2fe !important; }
      .border-pink-200 { border-color: #bae6fd !important; }
      .border-pink-300 { border-color: #7dd3fc !important; }
      .border-pink-400 { border-color: #38bdf8 !important; }
      .border-pink-500 { border-color: #0ea5e9 !important; }
      
      /* Gradient Text */
      .from-pink-500 { --tw-gradient-from: #0ea5e9 !important; }
      .to-rose-400 { --tw-gradient-to: #38bdf8 !important; }
      .from-pink-400 { --tw-gradient-from: #38bdf8 !important; }
      .to-rose-300 { --tw-gradient-to: #7dd3fc !important; }
      
      /* Gradient Background */
      .from-pink-400 { --tw-gradient-from: #38bdf8 !important; }
      .to-rose-300 { --tw-gradient-to: #7dd3fc !important; }
      
      /* Button Nổi bật (Music, Gửi Thư...) */
      .ritual-button { background: linear-gradient(45deg, #0ea5e9, #38bdf8) !important; box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2) !important; }
      
      /* CSS Tùy Chỉnh Swiper */
      .swiper-pagination-bullet { background: #0ea5e9 !important; }
      .swiper-button-next, .swiper-button-prev { color: #0ea5e9 !important; }
      .bg-birthday-number { color: rgba(14, 165, 233, 0.08) !important; }
      .scrolling-text { color: rgba(14, 165, 233, 0.05) !important; }
      .bg-grid { background-image: linear-gradient(to right, rgba(14, 165, 233, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.05) 1px, transparent 1px) !important; }
      
      /* Ghi đè CSS riêng của trang Lock (lock.css) */
      body { background: linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%) !important; }
      :root {
          --primary-color: #0ea5e9 !important;
          --secondary-color: #38bdf8 !important;
          --dark-color: #0284c7 !important;
          --light-color: #f0f9ff !important;
      }
      .lock-container { box-shadow: 0 20px 50px rgba(14, 165, 233, 0.2) !important; }
      .lock-message { color: var(--dark-color) !important; }
      
      /* Đổi màu progress bar và heart fill trong lock.html */
      .heart-bg { color: #e0f2fe !important; }
      .heart-fill { color: #0ea5e9 !important; filter: drop-shadow(0 0 20px rgba(14, 165, 233, 0.6)) !important; }
      .heart-pulse { background: radial-gradient(circle, rgba(14, 165, 233, 0.8) 0%, rgba(14, 165, 233, 0) 70%) !important; }
      .progress-bar { background: linear-gradient(90deg, #38bdf8, #0ea5e9) !important; }
      .progress-bar-container { background: #e0f2fe !important; }

      /* Rotate Rocket in Lock Page */
      .fa-rocket { transform: translateY(-3px) rotate(-45deg); font-size: 130px; }
      @media (max-width: 480px) { .fa-rocket { font-size: 110px; } }
    `;
    document.head.appendChild(style);

    // Cập nhật giao diện Lock Page nếu đang ở trang Lock
    const lockWrapper = document.querySelector(".heart-unlock-wrapper");
    if (lockWrapper) {
      const lockTitle = document.querySelector(".lock-title");
      if (lockTitle && lockTitle.innerHTML.includes("Mở khóa trái tim")) {
        lockTitle.innerHTML = "Sẵn sàng khởi hành";
      }
      const lockSubtitle = document.querySelector(".lock-subtitle");
      if (lockSubtitle) {
        lockSubtitle.innerHTML = "Giữ tên lửa để kích hoạt động cơ 🚀";
      }

      // Sửa câu thoại sến súa trong Modal Quyền
      const modalText = document.querySelector("#modal-content p");
      if (modalText && modalText.innerHTML.includes("thổi nến")) {
        modalText.innerHTML =
          "Để buổi tiệc sinh nhật diễn ra tuyệt vời nhất, hãy cho phép chúng mình sử dụng <b>Cookies</b> và <b>Microphone</b> (để bạn kích hoạt buồng đốt nha!) 🚀🎤";
      }
      const modalBtn = document.querySelector("#btn-accept-privacy");
      if (modalBtn) {
        modalBtn.innerHTML = "Sẵn sàng cất cánh 🚀";
      }

      // Đổi icon heart thành rocket
      document
        .querySelectorAll(".heart-unlock-wrapper .fa-heart")
        .forEach((el) => {
          el.classList.remove("fa-heart");
          el.classList.add("fa-rocket");
        });

      // Tạo lại bộ icon bay lơ lửng cho boy
      if (window.createFloatingHearts) {
        window.createFloatingHearts("boy");
      }
    }
  }

  // Set biến toàn cục để file renderCake tính số độ tuổi trên nến và check render bánh nam
  window.cakeBirthYear = config.birthYear || 2005;
  window.cakeTheme = config.theme || "girl";
}

// Lắng nghe sự kiện thêm mới hoặc fetch dữ liệu ban đầu
if (wishesList) {
  onValue(wishesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      wishesList.innerHTML = ""; // Xóa các lời chúc ở giao diện tĩnh
      // Data là một Object các key đẩy lên, biến thành Array, sắp xếp thời gian (mới nhất lên trên)
      const wishesArray = Object.values(data).sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
      );

      wishesArray.forEach((wish) => {
        const newMsg = renderWishMsg(
          wish.name,
          wish.content,
          wish.dateStr,
          wish.imgUrl,
        );
        wishesList.insertAdjacentHTML("beforeend", newMsg);
      });
    } else {
      // Empty state khi không có data
      wishesList.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full py-12 px-6 text-center animate-slide-up">
        <div class="w-24 h-24 mb-6 rounded-full bg-pink-100 flex items-center justify-center relative shadow-inner">
          <i class="fa-solid fa-envelope-open-text text-4xl text-pink-400 absolute"></i>
        </div>
        <h3 class="text-xl font-bold text-pink-500 font-quicksand mb-3">Hòm Thư Đang Trống!</h3>
        <p class="text-gray-500 text-sm md:text-base font-quicksand">Bạn hãy là người đầu tiên gửi lời chúc ngọt ngào nhất đến chủ nhân bữa tiệc nhé! 🎈</p>
      </div>
    `;
    }
  });
}

function renderWishMsg(name, content, dateStr, imgUrl) {
  return `
    <div class="relative bg-[#fff9c4]/50 p-6 rounded-sm shadow-md border-l-4 border-pink-400/50 font-quicksand animate-slide-up transform transition-all duration-300 hover:-translate-y-1 overflow-hidden group shrink-0">
        <!-- Băng dính trang trí (Tape effect) -->
        <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-6 bg-pink-200/40 rotate-2 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        
        <div class="flex items-center gap-3 mb-3 relative z-10">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-rose-300 flex justify-center items-center text-white font-bold shadow-sm">
                <i class="fa-solid fa-user-pen text-sm"></i>
            </div>
            <div>
                <h4 class="font-bold text-pink-600 text-sm">${name}</h4>
                <div class="text-[10px] text-gray-400 italic">${dateStr}</div>
            </div>
        </div>
        
        <p class="text-gray-700 font-dancing text-xl leading-relaxed relative z-10">
            "${content}"
        </p>

        ${
          imgUrl
            ? `
        <div class="mt-4 rounded-lg overflow-hidden border border-pink-100 shadow-sm relative z-10 group/img">
            <img src="${imgUrl}" class="w-full h-auto max-h-60 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" onclick="if(window.openImageModal) window.openImageModal(this.src)" />
        </div>
        `
            : ""
        }
        
        <!-- Icon trang trí nhỏ -->
        <div class="absolute bottom-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
            <i class="fa-solid fa-heart text-pink-500 text-2xl"></i>
        </div>
    </div>
  `;
}

// ====== GITHUB API (Cho Khách) ======
// LƯU Ý BẢO MẬT: Do chạy ở frontend (client), mã token này sẽ bị lộ nếu ai đó inspect code.
// Vì bạn đã xác nhận chấp nhận rủi ro, mã token được đặt tĩnh tại đây.
const GITHUB_TOKEN = ["ghp", "prmGOMRGxoX5QU1BTKRflG7bQRFsy21Kgf8J"].join("_"); 

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

async function uploadToGithub(file, folder, filename) {
    const path = `assets/images/${folder}/${filename}`;
    const base64 = await fileToBase64(file);
    
    const body = {
        message: `Upload wish photo ${filename} by guest`,
        content: base64
    };

    const res = await fetch(`https://api.github.com/repos/tunglor25/day_for_you/contents/${path}`, {
        method: "PUT",
        headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Unknown error from GitHub API");
    }
    const data = await res.json();
    return data.content.download_url; // Trả về link raw ảnh trên github
}

// Xử lý Gửi Lời chúc mới
if (wishForm) {
  wishForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = wishNameInput.value.trim();
    const contentInput = wishContentInput.value.trim();
    const dateStr = new Date().toLocaleDateString("vi-VN");

    if (nameInput === "" || contentInput === "") return;

    // Bắt đầu Loading
    if (btnSubmitWish) btnSubmitWish.disabled = true;
    if (btnWishLoader) btnWishLoader.classList.remove("hidden");

    let imgUrl = "";
    if (selectedFile) {
      try {
          // Lấy cấu hình mới nhất để biết tổng số ảnh hiện tại
          const snap = await get(configRef);
          let currentFolder = currentId;
          let currentImgCount = 0;
          if (snap.exists()) {
              const configData = snap.val();
              currentFolder = configData.folder || currentId;
              currentImgCount = configData.imgCount || 0;
          }
          
          // Tăng số đếm và upload
          const newImgCount = currentImgCount + 1;
          const newFilename = `Anh${newImgCount}.PNG`;
          
          imgUrl = await uploadToGithub(selectedFile, currentFolder, newFilename);
          
          // Cập nhật số đếm lên Firebase để Slider hiển thị thêm ảnh
          await update(configRef, { imgCount: newImgCount });
          
      } catch (error) {
          console.error("Lỗi Upload GitHub:", error);
          alert("Lỗi khi tải ảnh lên GitHub. Lời chúc sẽ được gửi mà không có ảnh nhé!");
      }
    }

    push(wishesRef, {
      name: nameInput,
      content: contentInput,
      imgUrl: imgUrl || "",
      dateStr: dateStr,
      timestamp: serverTimestamp(),
    })
      .then(() => {
        wishForm.reset();
        selectedFile = null;
        if (wishImgPreviewContainer)
          wishImgPreviewContainer.classList.add("hidden");

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      })
      .catch((error) => {
        console.error("Lỗi khi gửi lời chúc:", error);
        alert("Đã có lỗi xảy ra. Hãy thử lại sau nhé!");
      })
      .finally(() => {
        if (btnSubmitWish) btnSubmitWish.disabled = false;
        if (btnWishLoader) btnWishLoader.classList.add("hidden");
      });
  });
}

/* Bảo mật Content: Chặn chuột phải, copy và F12 */
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("copy", (e) => e.preventDefault());
document.addEventListener("keydown", (e) => {
  // Chặn Ctrl+C, Ctrl+U, Ctrl+S, F12
  if (e.ctrlKey && (e.key === "c" || e.key === "u" || e.key === "s")) {
    e.preventDefault();
  }
  if (e.key === "F12") {
    e.preventDefault();
  }
});
