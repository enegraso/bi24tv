document.addEventListener("DOMContentLoaded", () => {

  const video = document.getElementById("videoPlayer");
  const message = document.getElementById("reconnectMessage");
  const canvas = document.getElementById("frameCapture");
  const loader = document.getElementById("previewLoader");

  const streams = [
    "https://vivo.solumedia.com:19360/bi24/bi24.m3u8",
  ];

  let currentStream = 0;
  let retryCount = 0;
  let hls;
  let player;
  let lastTime = 0;
  let freezeCounter = 0;
  let started = false;
  const MAX_FREEZE_CHECKS = 10;

  function showMessage() {
    message.classList.add("show");
  }

  function hideMessage() {
    message.classList.remove("show");
  }

  function captureFrame() {
    try {
      if (!canvas || !video.videoWidth) return null;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch (e) {
      return null;
    }
  }

  function captureLiveFrame(callback) {
    console.log("Capturando frame en vivo...");
    if (loader) loader.style.display = "flex";

    const previewHls = new Hls({ autoStartLoad: false });
    previewHls.loadSource(streams[currentStream]);
    previewHls.attachMedia(video);

    previewHls.on(Hls.Events.MANIFEST_PARSED, function () {
      console.log("Preview: manifest OK, cargando frame...");
      previewHls.startLoad();
    });

    previewHls.on(Hls.Events.ERROR, function (event, data) {
      console.log("Preview error:", data.type);
      previewHls.destroy();
      if (loader) loader.style.display = "none";
      callback();
    });

    let frameCaptured = false;

    video.addEventListener("loadeddata", function onLoadedData() {
      if (frameCaptured) return;
      frameCaptured = true;
      video.removeEventListener("loadeddata", onLoadedData);
      console.log("Preview: frame disponible");

      setTimeout(function () {
        const posterData = captureFrame();
        if (posterData) {
          video.poster = posterData;
        }

        try { video.pause(); } catch (e) {}
        previewHls.destroy();
        if (loader) loader.style.display = "none";
        callback();
      }, 500);
    });
  }

  function initPlayer() {
    if (player) return;

    player = new Plyr(video, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen"
      ],
      settings: ["quality"],
      ratio: "16:9",
      autoplay: false
    });

    const plyrControls = video.closest('.plyr').querySelector('.plyr__controls');
    const customControls = document.getElementById('customControls');
    if (plyrControls && customControls) {
      customControls.style.display = 'inline-flex';
      plyrControls.appendChild(customControls);
    }

    player.on("play", function () {
      console.log("Play - iniciando stream");
      if (!hls) {
        loadStream();
      } else {
        hls.startLoad();
        video.play().catch(function () {});
      }
    });

    player.on("pause", function () {
      console.log("Pause - deteniendo stream");
      const posterData = captureFrame();
      if (posterData) {
        video.poster = posterData;
      }
      if (hls) hls.stopLoad();
    });

    player.on("playing", function () {
      started = true;
      hideMessage();
    });
  }

  function loadStream() {
    const url = streams[currentStream];
    console.log("Cargando stream:", url);
    showMessage();

    hls = new Hls({
      autoStartLoad: false,
      enableWorker: true,
      backBufferLength: 0,
      maxBufferLength: 30,
      maxMaxBufferLength: 30,
      manifestLoadingTimeOut: 15000,
      levelLoadingTimeOut: 15000,
      fragLoadingTimeOut: 25000
    });

    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      console.log("Manifest OK");
      hideMessage();
      retryCount = 0;
      hls.startLoad();
      video.play().catch(function () {});
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data.fatal) {
        console.log("Error fatal:", data.type);
        handleError();
      }
    });

    setupQualitySelector();
  }

  function handleError() {
    showMessage();
    retryCount++;

    if (retryCount < 3) {
      console.log("Retry mismo stream");
      setTimeout(() => loadStream(), 4000);
    } else {
      retryCount = 0;
      currentStream++;
      if (currentStream >= streams.length) {
        currentStream = 0;
      }
      console.log("Cambio de servidor:", currentStream);
      setTimeout(() => loadStream(), 4000);
    }
  }

  function setupQualitySelector() {
    if (!hls || !hls.levels.length) return;

    const qualities = hls.levels.map(l => l.height);
    qualities.unshift("Auto");

    if (player) {
      player.options.quality = {
        default: qualities[0],
        options: qualities,
        forced: true,
        onChange: function (quality) {
          if (quality === "Auto") {
            hls.currentLevel = -1;
          } else {
            hls.levels.forEach((level, index) => {
              if (level.height === quality) {
                hls.currentLevel = index;
              }
            });
          }
        }
      };
    }
  }

  video.addEventListener("canplay", hideMessage);
  video.addEventListener("loadeddata", hideMessage);
  video.addEventListener("seeked", hideMessage);
  video.addEventListener("error", handleError);

  setInterval(() => {
    if (!started || video.paused) return;

    if (video.currentTime === lastTime) {
      freezeCounter++;
      if (freezeCounter >= MAX_FREEZE_CHECKS) {
        console.log("Freeze detectado");
        freezeCounter = 0;
        handleError();
      }
    } else {
      freezeCounter = 0;
    }
    lastTime = video.currentTime;
  }, 3000);

  // PiP button
  const pipButton = document.getElementById('pipButton');
  if (pipButton) {
    pipButton.addEventListener('click', async () => {
      try {
        if (!document.pictureInPictureElement) {
          await video.requestPictureInPicture();
        } else {
          await document.exitPictureInPicture();
        }
      } catch (err) {
        console.log('PiP error:', err);
      }
    });
  }

  // Cast button
  const castButton = document.getElementById('castButton');
  if (castButton) {
    castButton.addEventListener('click', async () => {
      try {
        if (typeof video.webkitShowPlaybackTargetPicker === 'function') {
          video.webkitShowPlaybackTargetPicker();
          return;
        }
        if (video.remote && typeof video.remote.prompt === 'function') {
          try {
            await video.remote.prompt();
            return;
          } catch (err) {
            console.log('Remote Playback prompt error', err);
          }
        }
        if (window.cast && window.cast.framework) {
          try {
            const context = cast.framework.CastContext.getInstance();
            await context.requestSession();
            return;
          } catch (err) {
            console.log('Error requesting cast session', err);
            alert('No se pudo iniciar la sesión de Cast.');
            return;
          }
        }
        if (typeof chrome !== 'undefined' && chrome.cast && chrome.cast.isAvailable) {
          alert('Cast disponible pero no inicializado en esta página.');
          return;
        }
        alert('Cast/AirPlay no disponible en este navegador.');
      } catch (err) {
        console.log('Cast button error', err);
        alert('No se pudo iniciar la transmisión en este navegador.');
      }
    });
  }

  // Cast framework
  function initCastFramework() {
    try {
      if (!window.cast || !window.cast.framework) return;
      const context = cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });
      context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
        if (event.sessionState === cast.framework.SessionState.SESSION_STARTED ||
            event.sessionState === cast.framework.SessionState.SESSION_RESUMED) {
          const session = context.getCurrentSession();
          if (!session) return;
          const url = streams[currentStream];
          if (!url) return;
          try { video.pause(); } catch (e) {}
          const mediaInfo = new chrome.cast.media.MediaInfo(url, 'application/vnd.apple.mpegurl');
          const metadata = new chrome.cast.media.GenericMediaMetadata();
          metadata.title = 'Bragado Informa 24 TV';
          mediaInfo.metadata = metadata;
          const request = new chrome.cast.media.LoadRequest(mediaInfo);
          session.loadMedia(request).then(() => {
            console.log('Media loaded on Cast device');
          }).catch(err => {
            console.log('Error loading media on Cast device', err);
          });
        }
        if (event.sessionState === cast.framework.SessionState.SESSION_ENDED) {
          try { video.play(); } catch (e) {}
        }
      });
    } catch (err) {
      console.log('initCastFramework error', err);
    }
  }

  if (window.cast && window.cast.framework) {
    initCastFramework();
  } else {
    let castCheckAttempts = 0;
    const castCheckInterval = setInterval(() => {
      castCheckAttempts++;
      if (window.cast && window.cast.framework) {
        clearInterval(castCheckInterval);
        initCastFramework();
      } else if (castCheckAttempts > 10) {
        clearInterval(castCheckInterval);
      }
    }, 500);
  }

  // Capturar frame inicial y luego inicializar Plyr
  captureLiveFrame(function () {
    initPlayer();
  });

});
