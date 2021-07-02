const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const player = $(".player");
const PLAYER_STORAGE_KEY = "Q_PLAYER";
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const progress = $(".progress");
const playlist = $(".playlist");
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
            name: "Ánh Mắt Ta Chạm Nhau",
            singer: "Ngô Lan Hương",
            path: "./music/anhmattachamnhau.mp3",
            image: "https://vcdn-ngoisao.vnecdn.net/2020/12/31/Ngo-Lan-Huong-1-2418-1609390959.jpg",
        },
        {
            name: "Hết Nhạc Con Về",
            singer: "DuyB",
            path: "./music/hetnhacconve.mp3",
            image: "https://i.ytimg.com/vi/y7E_wS1a8_U/maxresdefault.jpg",
        },
        {
            name: "Sang Xịn Mịn",
            singer: "Gill",
            path: "./music/sangxinmin.mp3",
            image: "https://avatar-ex-swe.nixcdn.com/singer/avatar/2021/06/04/a/0/9/3/1622788297770_600.jpg",
        },
        {
            name: "Walk On Da Street",
            singer: "16TYh",
            path: "./music/16typh.mp3",
            image: "https://event.mediacdn.vn/2020/11/12/16-typh-p-16051669662911098454674.png",
        },
        {
            name: "Mùa Hè Ấy Em Khóc",
            singer: "Ngô Lan Hương",
            path: "./music/muaheay.mp3",
            image: "https://vcdn-ngoisao.vnecdn.net/2020/12/31/Ngo-Lan-Huong-1-2418-1609390959.jpg",
        },
        {
            name: "Người Chơi Hệ Đẹp",
            singer: "16TYh",
            path: "./music/nguoichoihedep.mp3",
            image: "https://event.mediacdn.vn/2020/11/12/16-typh-p-16051669662911098454674.png",
        },
        {
            name: "Vì Em Là Quả Dâu Tây",
            singer: "16TYh",
            path: "./music/viemlaquadautay.mp3",
            image: "https://i.ytimg.com/vi/7T09viA678g/maxresdefault.jpg",
        },
        {
            name: "Anh Thề Đấy",
            singer: "Thanh Hưng",
            path: "./music/anhtheday.mp3",
            image: "https://avatar-ex-swe.nixcdn.com/singer/avatar/2019/11/15/2/7/c/d/1573834150811_600.jpg",
        },
        {
            name: "Cho Anh Một Chút Hi Vọng",
            singer: "coder k rõ :v",
            path: "./music/choanhmotchuthivong.mp3",
            image: "https://i.scdn.co/image/ab67616d0000b2739eb7b3d5e44da8ba657ea919",
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
<div class="song ${
        index === this.currentIndex ? "active" : ""
      }" data-index = "${index}">
<div
class="thumb"
style="
background-image: url('${song.image}');"></div>
<div class="body">
<h3 class="title">${song.name}</h3>
<p class="author">${song.singer}</p>
</div>
<div class="option">
<i class="fas fa-ellipsis-h"></i>
</div>
</div>
`;
        });
        playlist.innerHTML = htmls.join("");
    },

    defineProperties: function() {
        Object.defineProperty(this, "currentSong", {
            get: function() {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // xử lí CD quay / dừng
        const cdThumbAnimate = cdThumb.animate({
            transform: "rotate(360deg)",
        }, {
            duration: 10000, // 10s
            iterations: Infinity, // lặp vô tận
        });
        cdThumbAnimate.pause();
        // xử lí phòng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;

            cd.style.width = newWidth > 0 ? newWidth + "px" : 0;
            cd.style.opacity = newWidth / cdWidth;

            // xử lí khi play

            playBtn.onclick = function() {
                if (_this.isPlaying) {
                    audio.pause();
                } else {
                    audio.play();
                }
            };

            //khi da play
            audio.onplay = function() {
                _this.isPlaying = true;
                player.classList.add("playing");
                cdThumbAnimate.play();
            };
            //khi da pause
            audio.onpause = function() {
                _this.isPlaying = false;
                player.classList.remove("playing");
                cdThumbAnimate.pause();
            };

            // xử lí thanh tiến dodooj bài hát
            audio.ontimeupdate = function() {
                if (audio.duration) {
                    const progressPercent = Math.floor(
                        (audio.currentTime / audio.duration) * 100
                    );
                    progress.value = progressPercent;
                }
            };

            // xử lí tua
            progress.oninput = function(e) {
                const seekTime = (audio.duration / 100) * e.target.value;
                audio.currentTime = seekTime;
            };
            // khi next bai
            nextBtn.onclick = function() {
                if (_this.isRandom) {
                    _this.randomSong();
                } else {
                    _this.nextSong();
                }

                audio.play();
                _this.render();
                _this.scrollToActiveSong();
            };
            // khi prev bai
            prevBtn.onclick = function() {
                if (_this.isRandom) {
                    _this.randomSong();
                } else {
                    _this.prevSong();
                }

                audio.play();
                _this.render();
                _this.scrollToActiveSong();
            };

            // random song
            randomBtn.onclick = function() {
                _this.isRandom = !_this.isRandom;
                _this.setConfig("isRandom", _this.isRandom);
                this.classList.toggle("active", _this.isRandom);
            };

            // next khi ended song
            audio.onended = function() {
                if (_this.isRepeat) {
                    audio.play();
                } else {
                    nextBtn.click();
                }
            };
            // khi repeat bai hat
            repeatBtn.onclick = function(e) {
                _this.isRepeat = !_this.isRepeat;
                _this.setConfig("isRepeat", _this.isRepeat);
                this.classList.toggle("active", _this.isRepeat);
            };

            // lắng nghe click vào playlist
            playlist.onclick = function(e) {
                const songNode = e.target.closest(".song:not(.active)");
                if (songNode || e.target.closest(".option")) {
                    // xử lí khi click vào songs
                    if (songNode) {
                        _this.currentIndex = Number(songNode.dataset.index);
                        _this.loadCurrentSong();
                        _this.render();
                        audio.play();
                    }

                    // xử lí khi click vào ô option
                    if (e.target.closest(".option")) {}
                }
            };
        };
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

        console.log(heading, cdThumb, audio);
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function() {
        // cần chỉnh khi prev bài
        $(".song.active").scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    start: function() {
        //gán cấu hình
        this.loadConfig();
        // render playlist
        this.render();
        // lắng nghe / xử lí các sự kiện
        this.handleEvents();
        // định nghĩa các thuộc tính cho obj
        this.defineProperties();
        // tải thông tin bài hát đầu tiên
        this.loadCurrentSong();

        //  hiển thị trạng thái ban đầu cho rd & rp
        randomBtn.classList.toggle("active", this.isRandom);

        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};
app.start();