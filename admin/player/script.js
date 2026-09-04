document.addEventListener("DOMContentLoaded", () => {

  const video = document.getElementById("videoPlayer");
  const message = document.getElementById("reconnectMessage");

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

  function initPlayer() {

    if (!player) {

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

        ratio: "16:9"

      });

      // Inject custom buttons into Plyr controls bar
      const controls = video.closest('.plyr').querySelector('.plyr__controls');
      const customControls = document.getElementById('customControls');
      if (controls && customControls) {
        controls.appendChild(customControls);
      }

    }

  }

  // PiP and Cast button wiring
  const pipButton = document.getElementById('pipButton');
  const castButton = document.getElementById('castButton');

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

  if (castButton) {
    castButton.addEventListener('click', async () => {
      try {
        // Prefer WebKit picker (Safari / WebKit-based browsers)
        if (typeof video.webkitShowPlaybackTargetPicker === 'function') {
          video.webkitShowPlaybackTargetPicker();
          return;
        }

        // Try Remote Playback API (experimental, supported in some Chromium builds)
        if (video.remote && typeof video.remote.prompt === 'function') {
          try {
            await video.remote.prompt();
            return;
          } catch (err) {
            console.log('Remote Playback prompt error', err);
            // fallthrough to other checks
          }
        }

        // If Cast Framework is available, request a session (Chromium/Chrome)
        if (window.cast && window.cast.framework) {
          try {
            // Ensure CastContext is configured
            const context = cast.framework.CastContext.getInstance();
            // Request a session which will open the native cast picker
            await context.requestSession();
            return;
          } catch (err) {
            console.log('Error requesting cast session', err);
            alert('No se pudo iniciar la sesión de Cast.');
            return;
          }
        }

        // If the Cast SDK is present but not ready
        if (typeof chrome !== 'undefined' && chrome.cast && chrome.cast.isAvailable) {
          alert('Cast disponible pero no inicializado en esta página.');
          return;
        }

        // No casting API available
        alert('Cast/AirPlay no disponible en este navegador.');
      } catch (err) {
        console.log('Cast button error', err);
        alert('No se pudo iniciar la transmisión en este navegador.');
      }
    });
  }

  // Initialize Cast framework when available
  function initCastFramework() {
    try {
      if (!window.cast || !window.cast.framework) return;

      const context = cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      // When session starts, load the current stream to the Cast device
      context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
        // SESSION_STARTED or SESSION_RESUMED indicate an active session
        if (event.sessionState === cast.framework.SessionState.SESSION_STARTED ||
            event.sessionState === cast.framework.SessionState.SESSION_RESUMED) {
          const session = context.getCurrentSession();
          if (!session) return;

          const url = streams[currentStream];
          if (!url) return;

          // Pause local playback when casting
          try { video.pause(); } catch (e) { }

          // Build MediaInfo and LoadRequest
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
        // When session ends, resume local playback
        if (event.sessionState === cast.framework.SessionState.SESSION_ENDED) {
          try { video.play(); } catch (e) { }
        }
      });
    } catch (err) {
      console.log('initCastFramework error', err);
    }
  }

  // Try to initialize cast framework now or when sdk finishes loading
  if (window.cast && window.cast.framework) {
    initCastFramework();
  } else {
    // SDK loads asynchronously; poll for availability a few times
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

  function loadStream(index) {

    if (hls) {
      hls.destroy();
    }

    const url = streams[index];

    console.log("Cargando stream:", url);

    showMessage();

    started = false;

    if (Hls.isSupported()) {

      hls = new Hls({

        enableWorker: true,

        backBufferLength: 90,

        maxBufferLength: 40,

        maxMaxBufferLength: 80,

        manifestLoadingTimeOut: 15000,

        levelLoadingTimeOut: 15000,

        fragLoadingTimeOut: 25000

      });

      hls.loadSource(url);

      hls.attachMedia(video);

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {

          console.log("Manifest OK");

          initPlayer();

          setupQualitySelector();

          video.play()
            .then(() => {

              hideMessage();

              retryCount = 0;

            })
            .catch(err => {

              console.log("Play error:", err);

            });

        }
      );

      hls.on(
        Hls.Events.ERROR,
        (event, data) => {

          if (data.fatal) {

            console.log("Error fatal:", data.type);

            handleError();

          }

        }
      );

    }

    else if (
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {

      video.src = url;

      initPlayer();

      video.addEventListener(
        "loadedmetadata",
        () => {

          video.play();

          hideMessage();

        }
      );

    }

  }

  function handleError() {

    showMessage();

    retryCount++;

    if (retryCount < 3) {

      console.log("Retry mismo stream");

      setTimeout(
        () =>
          loadStream(currentStream),
        4000
      );

    }

    else {

      retryCount = 0;

      currentStream++;

      if (
        currentStream >= streams.length
      ) {

        currentStream = 0;

      }

      console.log(
        "Cambio de servidor:",
        currentStream
      );

      setTimeout(
        () =>
          loadStream(currentStream),
        4000
      );

    }

  }

  function setupQualitySelector() {

    if (!hls.levels.length) return;

    const qualities =
      hls.levels.map(l => l.height);

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

            hls.levels.forEach(
              (level, index) => {

                if (
                  level.height === quality
                ) {

                  hls.currentLevel =
                    index;

                }

              }
            );

          }

        }

      };

    }

  }

  video.addEventListener("playing", () => {

    started = true;

    hideMessage();

  });

  video.addEventListener("canplay", hideMessage);

  video.addEventListener("loadeddata", hideMessage);

  video.addEventListener("seeked", hideMessage);

  video.addEventListener(
    "error",
    handleError
  );

  setInterval(
    () => {

      if (!started) return;

      if (
        video.currentTime ===
        lastTime
      ) {

        freezeCounter++;

        if (
          freezeCounter >=
          MAX_FREEZE_CHECKS
        ) {

          console.log(
            "Freeze detectado"
          );

          freezeCounter = 0;

          handleError();

        }

      }

      else {

        freezeCounter = 0;

      }

      lastTime =
        video.currentTime;

    },
    3000
  );

  loadStream(currentStream);

});
