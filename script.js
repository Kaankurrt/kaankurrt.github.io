// 1. DISCORD CLIPBOARD COPY TOAST
function copyDiscord() {
    navigator.clipboard.writeText("kawn.kr");
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// 2. INTERACTIVE SUB-PAGES ENGINE
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.content-wrapper > section.glass-panel');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        
        navLinks.forEach(l => l.classList.remove('active-link'));
        this.classList.add('active-link');

        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.remove('hidden-section');
                section.classList.add('active-section');
            } else if (section.id) {
                section.classList.remove('active-section');
                section.classList.add('hidden-section');
            }
        });
    });
});

// 3. AUDIO & SLIDING PLAYLIST ENGINE
let songsData = [];
let currentTrackIndex = 0;
const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-btn');
const progressBg = document.getElementById('progress-bg');
const progressFill = document.getElementById('progress-fill');
const timeCurrent = document.querySelector('.time.current');
const timeTotal = document.querySelector('.time.total');

async function initAudioEngine() {
    try {
        const response = await fetch('songs.json');
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
        songsData = await response.json();
        
        if(songsData.length > 0) {
            loadTrack(currentTrackIndex);
            renderPlaylistDock();
        }
    } catch (error) {
        console.error("Audio engine failed initialization:", error);
        document.getElementById('track-name').textContent = "Failed to load songs.json";
        document.getElementById('track-artist').textContent = "Check file location";
    }
}

function loadTrack(index) {
    if (!songsData || songsData.length === 0) return;
    const track = songsData[index];
    audio.src = track.path;
    document.getElementById('track-name').textContent = track.name;
    document.getElementById('track-artist').textContent = track.artist;
    
    const coverImg = document.getElementById('track-art');
    const defaultArt = document.getElementById('default-art');
    
    if(track.cover && track.cover.trim() !== "") {
        coverImg.src = track.cover;
        coverImg.classList.remove('hidden-cover');
        defaultArt.style.display = 'none';
    } else {
        coverImg.removeAttribute('src');
        coverImg.classList.add('hidden-cover');
        defaultArt.style.display = 'block';
    }
    
    resetProgressUI();
    updatePlaylistDockPosition();
}

function togglePlay() {
    if (audio.paused) {
        audio.play().catch(e => console.log("Playback blocked or interrupted:", e));
        playBtn.className = "fas fa-pause";
    } else {
        audio.pause();
        playBtn.className = "fas fa-play";
    }
}

playBtn.onclick = togglePlay;

document.getElementById('next-btn').onclick = () => {
    if (songsData.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % songsData.length;
    loadTrack(currentTrackIndex);
    audio.play().catch(()=>{});
    playBtn.className = "fas fa-pause";
};

document.getElementById('prev-btn').onclick = () => {
    if (songsData.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + songsData.length) % songsData.length;
    loadTrack(currentTrackIndex);
    audio.play().catch(()=>{});
    playBtn.className = "fas fa-pause";
};

audio.ontimeupdate = (e) => {
    const { currentTime, duration } = e.srcElement;
    if(!duration) return;
    const progressPercent = (currentTime / duration) * 100;
    progressFill.style.width = `${progressPercent}%`;
    timeCurrent.textContent = formatTime(currentTime);
    timeTotal.textContent = formatTime(duration);
};

audio.onloadedmetadata = () => {
    timeTotal.textContent = formatTime(audio.duration);
};

audio.onended = () => { document.getElementById('next-btn').click(); };

progressBg.onclick = (e) => {
    const width = progressBg.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if(duration) audio.currentTime = (clickX / width) * duration;
};

function resetProgressUI() {
    progressFill.style.width = "0%";
    timeCurrent.textContent = "0:00";
    timeTotal.textContent = "0:00";
}

function formatTime(time) {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// 4. WINAMP DOCK LOGIC WRITER & SMOOTH OFFSET CALCULATION
function renderPlaylistDock() {
    const dock = document.getElementById('playlist-dock');
    dock.innerHTML = '';
    
    songsData.forEach((track, idx) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.textContent = track.name;
        item.onclick = () => {
            currentTrackIndex = idx;
            loadTrack(idx);
            audio.play().catch(()=>{});
            playBtn.className = "fas fa-pause";
        };
        dock.appendChild(item);
    });
    
    setTimeout(updatePlaylistDockPosition, 50);
}

function updatePlaylistDockPosition() {
    const dock = document.getElementById('playlist-dock');
    const items = document.querySelectorAll('.playlist-item');
    if (items.length === 0) return;
    
    let targetItem = items[currentTrackIndex];
    
    let offsetLeft = targetItem.offsetLeft;
    let currentWidth = targetItem.clientWidth;
    dock.style.transform = `translateX(${-offsetLeft - (currentWidth / 2)}px)`;
    
    items.forEach((item, idx) => {
        item.className = 'playlist-item';
        if (idx === currentTrackIndex) {
            item.classList.add('track-active');
        } else if (idx === currentTrackIndex - 1) {
            item.classList.add('track-left-adjacent');
        } else if (idx === currentTrackIndex + 1) {
            item.classList.add('track-right-adjacent');
        } else {
            item.classList.add('track-far');
        }
    });
}

// 5. BACKGROUND SNOW ENGINE
const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');
let snowActive = false;
let particles = [];

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.8 + 0.4;
        this.wind = Math.random() * 1.5 - 0.75;
    }
    update() {
        this.y += this.speed;
        this.x += this.wind;
        if (this.y > canvas.height) this.y = -10;
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
}

function animateSnow() {
    if (!snowActive) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateSnow);
}

document.getElementById('snow-toggle').onclick = () => {
    snowActive = !snowActive;
    if (snowActive && particles.length === 0) {
        for (let i = 0; i < 100; i++) particles.push(new Particle());
    }
    animateSnow();
};

window.dispatchEvent(new Event('resize'));
initAudioEngine();


// 6. GITHUB API
const githubUsername = "Kaankurrt"; // Kullanıcı adı

async function fetchGithubData() {
    try {
        // Son projeleri çekme
        const repoRes = await fetch(`https://api.github.com/users/Kaankurrt/repos?sort=updated&per_page=4`);
        const repos = await repoRes.json();
        const repoGrid = document.getElementById('github-repos');
        repoGrid.innerHTML = '';
        
        repos.forEach(repo => {
            const a = document.createElement('a');
            a.href = repo.html_url; a.target = '_blank'; a.className = 'repo-card';
            a.innerHTML = `<span class="repo-name"><i class="fab fa-github"></i> ${repo.name}</span>
                           <span class="repo-desc">${repo.description || "No description provided."}</span>`;
            repoGrid.appendChild(a);
        });

        // Son Commitleri çekme
        const eventRes = await fetch(`https://api.github.com/users/Kaankurrt/events`);
        const events = await eventRes.json();
        const pushEvents = events.filter(e => e.type === 'PushEvent').slice(0, 5);
        
        const ticker = document.getElementById('github-commits');
        ticker.innerHTML = '';
        
        if (pushEvents.length > 0) {
            pushEvents.forEach(ev => {
                // KRİTİK DÜZELTME: commits?.[0] yaparak undefined hatasını engelle
                const commitMsg = ev.payload.commits?.[0]?.message || "Updated repository";
                const repoName = ev.repo.name.split('/')[1];
                ticker.innerHTML += `<span class="ticker-item"><i class="fas fa-code-branch"></i> pushed to ${repoName}: "${commitMsg}"</span>`;
            });
            ticker.innerHTML += ticker.innerHTML; // Döngü klonlaması
        } else {
            ticker.innerHTML = `<span class="ticker-item">No recent commits found.</span>`;
            ticker.innerHTML += ticker.innerHTML;
        }
    } catch (error) {
        console.log("Github Fetch Error:", error);
    }
}
fetchGithubData();

// 7. YOUTUBE CAROUSEL

const myYouTubeVideos = [
    { id: "lYAhMkPNMQ4", title: "WHY IS IT ALWAYS 100?" }, 
    { id: "xonlrmTRM6M", title: "why this three song sounds EXACTLY the SAME?" },
    { id: "kbRzeFI8c24", title: "osu!dan sonra en sevdiğim ritim oyunu | Rhythia" },
    { id: "Obmy7mHlhsk", title: "BRO IS OVERBURSTING" }
];

const ytCarousel = document.getElementById('yt-carousel');
myYouTubeVideos.forEach(vid => {
    const a = document.createElement('a');
    a.href = `https://www.youtube.com/watch?v=${vid.id}`;
    a.target = '_blank'; a.className = 'yt-thumb';
    a.style.backgroundImage = `url(https://img.youtube.com/vi/${vid.id}/mqdefault.jpg)`;
    a.innerHTML = `<i class="fas fa-play-circle"></i>`;
    ytCarousel.appendChild(a);
});

function scrollYT(direction) {
    ytCarousel.scrollBy({ left: direction * 180, behavior: 'smooth' });
}


// 8. PHOTOGRAPHY GALLERY
const myPhotos = [
    "assets/photos/kaangrafi_1770006600_3823154485036638835_77245850966.webp", 
    "assets/photos/kaangrafi_1769975079_3823149872778594380_77245850966.webp",
    "assets/photos/kaangrafi_1770006600_3823154485045024730_77245850966.webp",
    "assets/photos/kaangrafi_1769975079_3823149891074174703_77245850966.webp",
    "assets/photos/kaangrafi_1769977811_3823152379789576067_77245850966.webp",
    "assets/photos/kaangrafi_1769977811_3823152380016121930_77245850966.webp",
    "assets/photos/kaangrafi_1770006600_3823154485028207924_77245850966.webp",
    "assets/photos/kaangrafi_1769975079_3823149878432527998_77245850966.webp",
    "assets/photos/kaangrafi_1760219358_3741313601547017891_77245850966.webp"
];

const photoScroller = document.getElementById('photo-scroller');
const modalGrid = document.getElementById('modal-grid');
const photoModal = document.getElementById('photo-modal');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

myPhotos.forEach((photoSrc) => {
    // 1. Ana sayfadaki slider
    const div = document.createElement('div');
    div.className = 'photo-item';
    div.style.backgroundImage = `url(${photoSrc})`;
    div.onclick = openPhotoModal; 
    photoScroller.appendChild(div);

    // 2. Modaldaki 9'lu grid
    const img = document.createElement('img');
    img.src = photoSrc;
    img.className = 'grid-photo';
    img.onclick = () => openLightbox(photoSrc);
    modalGrid.appendChild(img);
});

function openPhotoModal() {
    photoModal.classList.remove('hidden-modal');
    document.body.style.overflow = 'hidden';
}

function closePhotoModal() {
    photoModal.classList.add('hidden-modal');
    document.body.style.overflow = 'auto';
}

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.remove('hidden-modal');
}

function closeLightbox() {
    lightbox.classList.add('hidden-modal');
}


const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
    // 8px çıkarma sebebi tam ortasını yakalamak
    cursor.style.transform = `translate(${e.clientX - 8}px, ${e.clientY - 8}px)`;
});

// EmailJS baslat
(function() {
    emailjs.init("mRamrN82aguUKcuoM"); 
})();

// Form gonderimi
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const emailInput = document.getElementById('user_email');
        const messageInput = document.getElementById('message');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Form kontrolu
        if (!emailInput.value.trim()) {
            showFormToast("Please enter your email address!");
            return;
        }
        
        if (!emailRegex.test(emailInput.value.trim())) {
            showFormToast("Please enter a valid email address!");
            return;
        }

        if (!messageInput.value.trim()) {
            showFormToast("Please enter your message!");
            return;
        }

        // Captcha kontrol
        const captchaResponse = grecaptcha.getResponse();
        if (!captchaResponse) {
            showFormToast("Please complete the Captcha verification!");
            return;
        }

        // Buton yukleme durumu
        const btnSend = this.querySelector('.btn-send');
        const originalBtnContent = btnSend.innerHTML;
        btnSend.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // EmailJS gonderim
        emailjs.sendForm('service_ejk8zwf', 'template_3ss8i7k', this)
            .then(() => {
                btnSend.innerHTML = '<i class="fas fa-check"></i> Sent!';
                
                // Formu sifirla
                contactForm.reset();
                grecaptcha.reset();

                showFormToast("Message sent successfully!");
                
                setTimeout(() => {
                    btnSend.innerHTML = originalBtnContent;
                }, 3000);

            }, (error) => {
                console.error(error);
                btnSend.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error!';
                showFormToast("An error occurred, please try again.");
                
                setTimeout(() => {
                    btnSend.innerHTML = originalBtnContent;
                }, 3000);
            });
    });
}

// Toast fonksiyonu
function showFormToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const originalText = toast.innerText;
    
    toast.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.innerText = originalText;
        }, 400);
    }, 2500);
}

// Dynamic Rounded Favicon
function initDynamicFavicon() {
    // Doğrudan CDN linki
    const targetUrl = 'https://avatars.githubusercontent.com/Kaankurrt'; 
    const faviconSize = 64; 

    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = targetUrl;

    img.onload = function() {
        // Hafızada canvas oluşturma
        const canvas = document.createElement('canvas');
        canvas.width = faviconSize;
        canvas.height = faviconSize;
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Yuvarlak kesim
        ctx.beginPath();
        ctx.arc(faviconSize / 2, faviconSize / 2, faviconSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip(); 

        // Görseli çizme
        ctx.drawImage(img, 0, 0, faviconSize, faviconSize);

        // Favicon günc
        const roundedDataUrl = canvas.toDataURL('image/png');
        const faviconLink = document.getElementById('dynamic-favicon');
        if (faviconLink) {
            faviconLink.href = roundedDataUrl;
        }
    };

    img.onerror = function() {
        console.warn("Could not load GitHub image for favicon.");
    };
}

// Yüklerken tetikle
window.addEventListener('load', initDynamicFavicon);
