document.addEventListener('DOMContentLoaded', function() {
    // Tạo trái tim bay
    createFloatingHearts();
    
    const card = document.getElementById('card');
    const continueBtn = document.querySelector('.continue-btn');
    
    // Mở thư khi click
    card.addEventListener('click', function() {
        if (!this.classList.contains('opened')) {
            this.classList.add('opened');
            createConfetti();
            
            // Tự động chuyển trang sau 2 giây
            setTimeout(() => {
                window.location.href = "lock.html";
            }, 2000);
        }
    });
    
    // Chuyển trang khi click tiếp tục
    continueBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        window.location.href = "lock.html";
    });
});

function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const heartCount = 15;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
        heart.style.animationDuration = (Math.random() * 10 + 10) + 's';
        heart.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(heart);
    }
}

function createConfetti() {
    const card = document.getElementById('card');
    const colors = ['#ff6b8b', '#ff8e9e', '#ffb3c1', '#ffd6de', '#ffffff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.width = (Math.random() * 8 + 5) + 'px';
        confetti.style.height = (Math.random() * 8 + 5) + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        card.appendChild(confetti);
        
        const animation = confetti.animate([
            { 
                transform: 'translateY(0) rotate(0deg)',
                opacity: 1 
            },
            { 
                transform: `translateY(${Math.random() * 200 - 100}px) rotate(${Math.random() * 360}deg)`,
                opacity: 0 
            }
        ], {
            duration: 1000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}