document.addEventListener("DOMContentLoaded", function () {
  // Phát nhạc ngay khi trang tải
  const audioPlayer = document.getElementById("birthday-song");
  audioPlayer.play().catch(e => console.log("Auto-play was prevented:", e));
  
  // Khởi tạo slider siêu cấp với phiên bản Swiper mới
  const swiper = new Swiper(".swiper-container", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
      rotate: 0,
      stretch: 100,
      depth: 200,
      modifier: 2,
      slideShadows: true,
    },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    loop: true,
    parallax: true,
    speed: 800,
    spaceBetween: 30,
    on: {
      init: function () {
        console.log("Swiper initialized");
      },
      slideChange: function () {
        console.log("Slide changed");
      },
    },
  });

  // Đặt tên người được chúc mừng
  const birthdayPerson = document.getElementById("birthday-person");
  birthdayPerson.textContent = "Vũ Thị Mai Chi"; // Thay bằng tên thật

  // Các phần tử bánh và nến
  const flames = document.querySelectorAll(".flame");
  const candles = document.querySelectorAll(".candle");
  const blowInstruction = document.querySelector(".blow-instruction");

  // Kiểm tra hỗ trợ microphone
  if (window.AudioContext || window.webkitAudioContext) {
    let audioContext;
    let microphone;
    let analyser;
    let isBlowing = false;
    let blownCandles = 0;

    function initAudioContext() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then(function (stream) {
            microphone = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            microphone.connect(analyser);

            detectBlowing();
          })
          .catch(function (err) {
            console.error("Không thể truy cập microphone:", err);
            setupClickToBlow();
          });
      }
    }

    function detectBlowing() {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function checkVolume() {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;

        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }

        const average = sum / bufferLength;

        if (average > 60 && !isBlowing) {
          isBlowing = true;
          blowCandle();
        } else if (average <= 60 && isBlowing) {
          isBlowing = false;
        }

        if (blownCandles < candles.length) {
          requestAnimationFrame(checkVolume);
        }
      }

      checkVolume();
    }

    function blowCandle() {
      if (blownCandles < candles.length) {
        const candle = candles[blownCandles];
        const flame = flames[blownCandles];

        flame.style.display = "none";
        candle.classList.add("blown");

        const blowSound = new Audio("assets/sounds/blow.mp3");
        blowSound.play();

        blownCandles++;

        if (blownCandles === candles.length) {
          allCandlesBlown();
        }
      }
    }

    function allCandlesBlown() {
      blowInstruction.textContent = "Giỏi quá ! Chúc Chi zớ sinh nhật vui vẻ";

      // Hiệu ứng confetti
      document.querySelectorAll(".confetti").forEach((confetti) => {
        confetti.style.animation = "confetti 5s ease-in-out forwards";
      });

      document.querySelector(".cake").style.animation = "none";
      setTimeout(() => {
        document.querySelector(".cake").style.transform =
          "translateY(0) rotate(0deg)";
      }, 1000);
    }

    document.body.addEventListener("click", initAudioContext, { once: true });
  } else {
    setupClickToBlow();
  }

  function setupClickToBlow() {
    blowInstruction.textContent = "Nhấn vào đây rồi thổi nến!";

    candles.forEach((candle, index) => {
      candle.addEventListener("click", function () {
        if (!this.classList.contains("blown")) {
          const flame = this.querySelector(".flame");
          flame.style.display = "none";
          this.classList.add("blown");

          const allBlown = Array.from(candles).every((c) =>
            c.classList.contains("blown")
          );
          if (allBlown) {
            blowInstruction.textContent =
              "Chúc mừng! Bạn đã thổi nến thành công!";
            document.querySelectorAll(".confetti").forEach((confetti) => {
              confetti.style.animation = "confetti 5s ease-in-out forwards";
            });
          }
        }
      });
    });
  }
});